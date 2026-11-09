import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { runTransaction, doc, serverTimestamp, getDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { db } from "../lib/firebase";
import type { Branch, TargetRole } from "../lib/types";
import { BRANCHES, TARGET_ROLES } from "../lib/types";
import { COPY, portfolioUrl } from "../lib/copy";
import { useAuth } from "../context/AuthContext";
import { auth } from "../lib/firebase";

const RESERVED = ["u", "login", "admin", "api", "kiran", "drivedeck"];
const SLUG_RE = /^[a-z0-9_]{3,20}$/;

interface ProfileDraft {
  name: string;
  college: string;
  branch: Branch | "";
  year: number;
  targetRole: TargetRole | "";
  tenth: string;
  twelfth: string;
  cgpa: string;
  backlogs: string;
  githubUrl: string;
  linkedinUrl: string;
}

const GITHUB_RE = /^https:\/\/github\.com\//;
const LINKEDIN_RE = /^https:\/\/linkedin\.com\/in\//;

// PRD §F1 — 3 steps. Writes once, at the end, in ONE transaction:
// users/{uid} (private) + portfolios/{uid} (public, display-safe) +
// usernames/{slug} (create-once via rules — taken slugs are denied).
// The transaction reads first, so a second tab / refresh cannot overwrite a
// completed profile (audit: onboarding race).
export function Onboarding() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<ProfileDraft>(() => ({
    name: auth.currentUser?.displayName ?? "",
    college: "",
    branch: "",
    year: 3,
    targetRole: "Data Analyst",
    tenth: "",
    twelfth: "",
    cgpa: "",
    backlogs: "0",
    githubUrl: "",
    linkedinUrl: "",
  }));
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileDraft, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [finishErr, setFinishErr] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid" | "reserved">("idle");

  // guard per Architecture.md 5.1: profile complete → skip to the dashboard
  useEffect(() => {
    if (!uid) return;
    getDoc(doc(db, "users", uid))
      .then((d) => {
        if (d.exists()) navigate("/dashboard", { replace: true });
      })
      .catch((e) => console.error("[DriveDeck] profile guard read failed:", e));
  }, [uid, navigate]);

  const set = <K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  // live availability check — debounced 300ms (Design.md 3.7), stale timers cancelled
  const slugTimer = useRef<number | undefined>(undefined);
  function onSlugChange(v: string) {
    setSlug(v);
    window.clearTimeout(slugTimer.current);
    if (!v) return setSlugStatus("idle");
    if (!SLUG_RE.test(v)) return setSlugStatus("invalid");
    if (RESERVED.includes(v)) return setSlugStatus("reserved");
    setSlugStatus("checking");
    slugTimer.current = window.setTimeout(async () => {
      try {
        const snap = await getDoc(doc(db, "usernames", v));
        setSlugStatus(snap.exists() ? "taken" : "available");
      } catch (e) {
        // offline / Firestore not created yet → never leave "Checking…" hanging;
        // the batch's create-once write (rules rule 2) stays the final arbiter
        console.error("[DriveDeck] slug check failed:", e);
        setSlugStatus("available");
      }
    }, 300);
  }

  function validateProfile(): boolean {
    const e: typeof errors = {};
    if (!draft.name.trim()) e.name = COPY.onboarding.validation.name;
    if (!draft.college.trim()) e.college = COPY.onboarding.validation.college;
    if (!draft.branch) e.branch = COPY.onboarding.validation.branch;
    if (!draft.targetRole) e.targetRole = COPY.onboarding.validation.targetRole;
    const tenth = Number(draft.tenth);
    const twelfth = Number(draft.twelfth);
    const cgpa = Number(draft.cgpa);
    const backlogs = Number(draft.backlogs);
    if (!draft.tenth || Number.isNaN(tenth) || tenth < 0 || tenth > 100) e.tenth = COPY.onboarding.validation.tenth;
    if (!draft.twelfth || Number.isNaN(twelfth) || twelfth < 0 || twelfth > 100) e.twelfth = COPY.onboarding.validation.twelfth;
    if (!draft.cgpa || Number.isNaN(cgpa) || cgpa < 0 || cgpa > 10) e.cgpa = COPY.onboarding.validation.cgpa;
    if (draft.backlogs === "" || Number.isNaN(backlogs) || backlogs < 0) e.backlogs = COPY.onboarding.validation.backlogs;
    if (draft.githubUrl && !GITHUB_RE.test(draft.githubUrl)) e.githubUrl = COPY.onboarding.githubInvalid;
    if (draft.linkedinUrl && !LINKEDIN_RE.test(draft.linkedinUrl)) e.linkedinUrl = COPY.onboarding.linkedinInvalid;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const slugReady = slugStatus === "available";

  async function finish() {
    if (!uid || !slugReady) return;
    setFinishErr(null);
    setSubmitting(true);
    try {
      const outcome = await runTransaction(db, async (tx): Promise<"done" | "already" | "taken"> => {
        const userRef = doc(db, "users", uid);
        const slugRef = doc(db, "usernames", slug);
        const [userSnap, slugSnap] = await Promise.all([tx.get(userRef), tx.get(slugRef)]);
        // profile already complete (second tab / refresh) → nothing to write
        if (userSnap.exists()) return "already";
        // slug claimed in the race window → surface "taken" instead of failing
        if (slugSnap.exists() && (slugSnap.data() as { uid?: string }).uid !== uid) return "taken";

        const profile = {
          name: draft.name.trim(),
          email: user?.email ?? "",
          college: draft.college.trim(),
          branch: draft.branch,
          year: draft.year,
          targetRole: draft.targetRole,
          tenth: Number(draft.tenth),
          twelfth: Number(draft.twelfth),
          cgpa: Number(draft.cgpa),
          backlogs: Number(draft.backlogs),
          githubUrl: draft.githubUrl.trim(),
          linkedinUrl: draft.linkedinUrl.trim(),
          portfolioSlug: slug,
          createdAt: serverTimestamp(),
        };
        // private owner-only doc — email / marks / CGPA / backlogs stay here
        tx.set(userRef, profile);
        // PUBLIC portfolio doc — display-safe fields only; firestore.rules
        // rejects anything outside that allow-list, so private data can't leak
        tx.set(doc(db, "portfolios", uid), {
          name: profile.name,
          college: profile.college,
          branch: profile.branch,
          year: profile.year,
          targetRole: profile.targetRole,
          portfolioSlug: slug,
          githubUrl: profile.githubUrl,
          linkedinUrl: profile.linkedinUrl,
          createdAt: serverTimestamp(),
        });
        // rules rule 3: create-only, immutable — a taken slug aborts the transaction
        tx.set(slugRef, { uid });
        return "done";
      });

      if (outcome === "already") {
        navigate("/dashboard", { replace: true });
        return;
      }
      if (outcome === "taken") {
        // slug claimed in the race window → back to step 2 with the inline taken message
        setSlugStatus("taken");
        setStep(2);
        return;
      }
      navigate("/dashboard");
    } catch (e) {
      const code = (e as { code?: string }).code ?? "";
      if (code.includes("permission-denied")) {
        // slug claimed in the race window → back to step 2 with the inline taken message
        setSlugStatus("taken");
        setStep(2);
      } else {
        // offline / rate-limited → keep the form, surface a real error message
        setFinishErr(COPY.onboarding.finishOffline);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls =
    "w-full h-11 px-3 rounded-lg border border-line bg-canvas text-[15px] focus:border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand";

  return (
    <div className="min-h-screen bg-canvas px-4 py-10 lg:grid lg:place-items-center">
      <div className="bg-surface border border-line rounded-xl shadow-card p-4 w-full max-w-[480px] mx-auto">
        <p className="text-[13px] font-medium text-ink-muted mb-2">{COPY.onboarding.stepOf(step)}</p>
        <div className="flex gap-1.5 mb-1" aria-hidden>
          {[1, 2, 3].map((i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-brand" : "bg-line"}`}
            />
          ))}
        </div>
        <h2 className="font-semibold text-xl mb-4">
          {step === 1 ? COPY.onboarding.step1 : step === 2 ? COPY.onboarding.step2 : COPY.onboarding.step3}
        </h2>

        {step === 1 && (
          <div className="flex flex-col gap-3">
            <label className="block">
              <span className="block text-[13px] font-medium text-ink-muted mb-1">{COPY.onboarding.fields.name}</span>
              <input
                type="text"
                value={draft.name}
                onChange={(e) => set("name", e.target.value)}
                className={errors.name ? `${inputCls} border-danger` : inputCls}
              />
              {errors.name && <span className="text-[13px] text-danger mt-1">{errors.name}</span>}
            </label>

            <label className="block">
              <span className="block text-[13px] font-medium text-ink-muted mb-1">{COPY.onboarding.fields.college}</span>
              <input
                type="text"
                value={draft.college}
                onChange={(e) => set("college", e.target.value)}
                className={errors.college ? `${inputCls} border-danger` : inputCls}
              />
              {errors.college && <span className="text-[13px] text-danger mt-1">{errors.college}</span>}
            </label>

            {/* 10th% / 12th% and CGPA / Backlogs pair up two-per-row to keep step 1 short */}
            <div className="grid grid-cols-2 gap-3">
              {(["tenth", "twelfth"] as const).map((key) => (
                <label key={key} className="block">
                  <span className="block text-[13px] font-medium text-ink-muted mb-1">{COPY.onboarding.fields[key]}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={draft[key]}
                    onChange={(e) => set(key, e.target.value)}
                    className={errors[key] ? `${inputCls} border-danger` : inputCls}
                  />
                  {errors[key] && <span className="text-[13px] text-danger mt-1">{errors[key]}</span>}
                </label>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(["cgpa", "backlogs"] as const).map((key) => (
                <label key={key} className="block">
                  <span className="block text-[13px] font-medium text-ink-muted mb-1">{COPY.onboarding.fields[key]}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={draft[key]}
                    onChange={(e) => set(key, e.target.value)}
                    className={errors[key] ? `${inputCls} border-danger` : inputCls}
                  />
                  {errors[key] && <span className="text-[13px] text-danger mt-1">{errors[key]}</span>}
                </label>
              ))}
            </div>

            <label className="block">
              <span className="block text-[13px] font-medium text-ink-muted mb-1">{COPY.onboarding.fields.branch}</span>
              <select
                value={draft.branch}
                onChange={(e) => set("branch", e.target.value as Branch)}
                className={inputCls}
              >
                <option value="">—</option>
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              {errors.branch && <span className="text-[13px] text-danger mt-1">{errors.branch}</span>}
            </label>

            <label className="block">
              <span className="block text-[13px] font-medium text-ink-muted mb-1">{COPY.onboarding.fields.year}</span>
              <select value={draft.year} onChange={(e) => set("year", Number(e.target.value))} className={inputCls}>
                {[1, 2, 3, 4].map((y) => (
                  <option key={y} value={y}>{`${y}${y === 1 ? "st" : y === 2 ? "nd" : y === 3 ? "rd" : "th"} year`}</option>
                ))}
              </select>
            </label>

            <div>
              <span className="block text-[13px] font-medium text-ink-muted mb-1">{COPY.onboarding.fields.targetRole}</span>
              <div className="flex flex-wrap gap-2">
                {TARGET_ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => set("targetRole", r)}
                    className={`h-8 px-3 rounded-full text-[13px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-brand ${draft.targetRole === r ? "bg-brand text-white" : "bg-canvas text-ink-muted border border-line hover:bg-line/60"}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              {errors.targetRole && <span className="text-[13px] text-danger mt-1">{errors.targetRole}</span>}
            </div>

            <label className="block">
              <span className="block text-[13px] font-medium text-ink-muted mb-1">{COPY.onboarding.fields.github}</span>
              <input
                inputMode="url"
                placeholder="https://github.com/…"
                value={draft.githubUrl}
                onChange={(e) => set("githubUrl", e.target.value)}
                className={errors.githubUrl ? `${inputCls} border-danger` : inputCls}
              />
              <span className={`block text-[13px] mt-1 ${errors.githubUrl ? "text-danger" : "text-ink-muted"}`}>
                {errors.githubUrl ?? COPY.onboarding.githubHelper}
              </span>
            </label>

            <label className="block">
              <span className="block text-[13px] font-medium text-ink-muted mb-1">{COPY.onboarding.fields.linkedin}</span>
              <input
                inputMode="url"
                placeholder="https://linkedin.com/in/…"
                value={draft.linkedinUrl}
                onChange={(e) => set("linkedinUrl", e.target.value)}
                className={errors.linkedinUrl ? `${inputCls} border-danger` : inputCls}
              />
              <span className={`block text-[13px] mt-1 ${errors.linkedinUrl ? "text-danger" : "text-ink-muted"}`}>
                {errors.linkedinUrl ?? COPY.onboarding.linkedinHelper}
              </span>
            </label>

            <button
              type="button"
              onClick={() => validateProfile() && setStep(2)}
              className="h-11 mt-2 rounded-lg bg-brand text-white text-[15px] font-semibold hover:bg-brand-dark transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              {COPY.onboarding.continue}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-1">
            <label className="block relative">
              <span className="block text-[13px] font-medium text-ink-muted mb-1">{COPY.onboarding.step2}</span>
              <input
                value={slug}
                onChange={(e) => onSlugChange(e.target.value.toLowerCase())}
                placeholder={COPY.onboarding.slugPlaceholder}
                aria-invalid={slugStatus === "taken" || slugStatus === "invalid" || slugStatus === "reserved"}
                className={`${inputCls} ${slugStatus === "taken" || slugStatus === "invalid" || slugStatus === "reserved" ? "border-danger" : ""} pr-10`}
              />
              {slugStatus === "checking" && (
                <span aria-hidden className="absolute right-3 top-[38px] w-4 h-4 border-2 border-line border-t-brand rounded-full animate-spin" />
              )}
            </label>

            {/* prefix comes verbatim from copy.ts; the URL uses the live origin
                (http://localhost:5199 when developing, https://drivedeck.pages.dev in production) */}
            <p className="text-[13px] text-ink-muted mt-1 break-all">
              {COPY.onboarding.slugHelper.replace("drivedeck.pages.dev/u/ …", "")}
              {portfolioUrl(slug || COPY.onboarding.slugPlaceholder)}
            </p>

            <p className={`min-h-[18px] text-[13px] ${slugStatus === "available" ? "text-success" : slugStatus === "taken" || slugStatus === "invalid" || slugStatus === "reserved" ? "text-danger" : "text-ink-muted"}`}>
              {slugStatus === "checking" && COPY.onboarding.slugChecking}
              {slugStatus === "available" && COPY.onboarding.slugAvailable(slug)}
              {slugStatus === "taken" && COPY.onboarding.slugTaken(slug)}
              {slugStatus === "reserved" && COPY.onboarding.slugReserved(slug)}
              {slugStatus === "invalid" && COPY.onboarding.slugInvalid}
            </p>

            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 h-11 rounded-lg border border-line text-[15px] font-semibold hover:bg-canvas transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                {COPY.onboarding.back}
              </button>
              <button
                type="button"
                disabled={!slugReady}
                onClick={() => setStep(3)}
                className="flex-1 h-11 rounded-lg bg-brand text-white text-[15px] font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                {COPY.onboarding.continue}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-3">
            <ul className="flex flex-col gap-2">
              {COPY.onboarding.starter.map((item) => (
                <li key={item} className="bg-canvas border border-line rounded-lg px-3 py-3 text-[15px]">
                  {item}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={finish}
              disabled={submitting || !slugReady}
              className="h-11 rounded-lg bg-brand text-white text-[15px] font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 inline-flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 size={16} className="animate-spin" aria-hidden />}
              {submitting ? COPY.onboarding.finishing : COPY.onboarding.finish}
            </button>
            {finishErr && <p className="text-[13px] text-danger" role="alert">{finishErr}</p>}
            {slugStatus === "taken" && (
              <p className="text-[13px] text-danger">{COPY.onboarding.slugTaken(slug)}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
