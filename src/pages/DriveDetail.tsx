import { useEffect, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { ChevronLeft } from "lucide-react";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { applicationId } from "../lib/ids";
import type { Drive, Student } from "../lib/types";
import { checkEligibility } from "../lib/eligibility";
import { COPY } from "../lib/copy";
import { EligibilityTable } from "../components/EligibilityTable";
import { Stamp } from "../components/Stamp";
import { IcsButton } from "../components/IcsButton";
import { EligibilityBadge } from "../components/EligibilityBadge";
import { useToast } from "../components/Toaster";

interface OutletCtx {
  profile?: Student;
}

// PRD §F3 detail — 1 drive + 1 application check (deterministic /applications/{uid}_{driveId}).
export function DriveDetail() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useOutletContext<OutletCtx>();
  const { uid } = useAuth();

  const [drive, setDrive] = useState<Drive | null>(null);
  const [missing, setMissing] = useState(false);
  const [alreadySaved, setAlreadySaved] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    // listener keeps an already-open detail honest if the seed script corrects a date
    return onSnapshot(doc(db, "drives", id), (snap) => {
      if (snap.exists()) setDrive({ id: snap.id, ...snap.data() } as Drive);
      else setMissing(true);
    });
  }, [id]);

  const uidFinal = uid;

  useEffect(() => {
    // one application check — not a listener; board CRUD updates it via SAVED state only
    if (!id || !uidFinal) return;
    setAlreadySaved(null);
    getDoc(doc(db, "applications", applicationId(uidFinal, id)))
      .then((d) => setAlreadySaved(d.exists()))
      .catch((e) => {
        console.error("[DriveDeck] application check failed:", e);
        setAlreadySaved(false); // optimistic; the round-trip on save is authoritative
      });
  }, [id, uidFinal]);

  if (missing) {
    return (
      <div className="pt-2">
        <EmptyRemoved />
      </div>
    );
  }

  if (!drive || !profile) {
    return (
      <div className="flex flex-col gap-3 pt-2">
        <div className="skeleton h-6 w-24 rounded-lg" />
        <div className="skeleton h-40 rounded-xl" />
        <div className="skeleton h-48 rounded-xl" />
      </div>
    );
  }

  const result = checkEligibility(profile, drive);
  const saved = alreadySaved === true;

  async function save() {
    if (!drive || !uidFinal || saved || saving) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "applications", applicationId(uidFinal, drive.id)), {
        uid: uidFinal,
        driveId: drive.id,
        status: "SAVED",
        // FieldValue sentinels cannot be nested inside arrays — use a client Date
        history: [{ status: "SAVED", at: new Date() }],
        updatedAt: serverTimestamp(),
      });
      setAlreadySaved(true);
      toast(COPY.drives.toastSaved, "success");
    } catch {
      toast(COPY.drives.toastMissing, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pt-2 max-w-[680px]">
      <Link
        to="/drives"
        className="inline-flex h-10 items-center gap-1 text-[15px] font-medium text-ink-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-brand rounded-md px-1 -ml-1"
      >
        <ChevronLeft size={18} strokeWidth={2} aria-hidden />
        {COPY.nav.drives}
      </Link>

      <header className="flex items-start gap-3 mt-2">
        <span
          aria-hidden
          className="w-12 h-12 rounded-full flex items-center justify-center text-[15px] font-bold shrink-0"
          style={{ backgroundColor: `${drive.color}1A`, color: drive.color }}
        >
          {drive.initials}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[24px] leading-[30px] font-semibold">
            {drive.companyName} · {drive.program}
          </h2>
          <p className="text-[15px] text-ink-muted">
            {drive.role} · {drive.batch} · {drive.type === "ON" ? COPY.drives.typeOn : COPY.drives.typeOff}
          </p>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        {!result.criteriaPending && !result.missingProfile && (
          <EligibilityBadge
            variant={result.match ? "success" : "danger"}
            text={result.match ? COPY.drives.badgeMatch : result.failedNote ?? COPY.drives.badgeMissing}
          />
        )}
        {drive.status === "TENTATIVE" && <EligibilityBadge variant="warning" text={COPY.drives.tentativeNote} />}
      </div>

      <section className="mt-5">
        <h3 className="text-[13px] font-medium text-ink-muted mb-2">Eligibility</h3>
        <EligibilityTable checks={result.checks} />
      </section>

      <section className="mt-5">
        <h3 className="text-[13px] font-medium text-ink-muted mb-2">{COPY.drives.roundsHeader}</h3>
        <p className="bg-surface border border-line rounded-xl shadow-card p-4 text-[15px] whitespace-pre-line">
          {drive.roundsInfo}
        </p>
      </section>

      {(drive.salary || drive.openings) && (
        <section className="mt-5 flex gap-3">
          {drive.salary && (
            <div className="flex-1 bg-surface border border-line rounded-xl shadow-card p-3">
              <p className="text-[13px] text-ink-muted">{COPY.drives.salary}</p>
              <p className="font-semibold text-[15px]">{drive.salary}</p>
            </div>
          )}
          {drive.openings && (
            <div className="flex-1 bg-surface border border-line rounded-xl shadow-card p-3">
              <p className="text-[13px] text-ink-muted">{COPY.drives.openings}</p>
              <p className="font-semibold text-[15px]">{drive.openings}</p>
            </div>
          )}
        </section>
      )}

      <section className="mt-5">
        <Stamp
          status={drive.status}
          sourceName={drive.sourceName}
          verifiedAt={drive.verifiedAt.toDate()}
          sourceUrl={drive.sourceUrl}
          tentativeLabel={COPY.drives.tentativeNote}
          viewOfficialLabel={COPY.drives.viewOfficial}
        />
      </section>

      <div className="flex flex-col gap-2 mt-5 pb-4">
        <button
          type="button"
          onClick={save}
          disabled={saved || saving}
          className="w-full h-11 flex items-center justify-center rounded-lg bg-brand text-white text-[15px] font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          {saved ? COPY.drives.saved : saving ? "…" : COPY.drives.saveToBoard}
        </button>
        <IcsButton drive={drive} />
      </div>
    </div>
  );
}

function EmptyRemoved() {
  return (
    <div className="bg-surface border border-line rounded-xl shadow-card p-8 text-center">
      <p className="text-[15px] text-ink-muted mb-4">{COPY.drives.toastMissing}</p>
      <button
        type="button"
        onClick={() => window.history.back()}
        className="text-[15px] font-medium text-brand underline underline-offset-2"
      >
        {COPY.nav.drives}
      </button>
    </div>
  );
}
