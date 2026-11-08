import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { Github as GithubIcon } from "lucide-react";
import { db } from "../lib/firebase";
import type { Activity, Student } from "../lib/types";
import { computeScore, streakDays } from "../lib/scoring";
import { COPY, portfolioUrl } from "../lib/copy";
import { PortfolioHeader } from "../components/PortfolioHeader";
import { ActivityRow } from "../components/ActivityRow";
import { TimelineStrip } from "../components/TimelineStrip";
import { FormulaSheet } from "../components/FormulaSheet";

// PRD §F5 public page — usernames/{slug} → users/{uid} → activities (uid ==, date desc).
// No auth anywhere: WhatsApp share + fresh incognito must render (Architecture.md probe 5).
export function Portfolio() {
  const { slug } = useParams<{ slug: string }>();
  const [uid, setUid] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);
  const [profile, setProfile] = useState<Student | null>(null);
  const [acts, setActs] = useState<Activity[] | null>(null);
  const [formulaOpen, setFormulaOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setResolved(false);
    setUid(null);
    // slug lookup; failure (offline / DB missing) degrades to the designed 404,
    // never an infinite skeleton
    getDoc(doc(db, "usernames", slug))
      .then((d) => {
        const owner = d.exists() ? (d.data() as { uid: string }).uid : null;
        setUid(owner);
        setResolved(true);
      })
      .catch((e) => {
        console.error("[DriveDeck] portfolio lookup failed:", e);
        setResolved(true);
      });
  }, [slug]);

  useEffect(() => {
    if (!uid) return;
    getDoc(doc(db, "users", uid))
      .then((d) => setProfile(d.exists() ? (d.data() as Student) : null))
      .catch((e) => console.error("[DriveDeck] profile read failed:", e));
    return onSnapshot(query(collection(db, "activities"), where("uid", "==", uid)), (s) => {
      const list = s.docs.map((d) => ({ id: d.id, ...d.data() } as Activity));
      list.sort((a, b) => b.date.toMillis() - a.date.toMillis());
      setActs(list);
    });
  }, [uid]);

  if (!resolved) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="skeleton h-16 w-16 rounded-full" />
      </div>
    );
  }

  if (!uid || !profile) {
    return (
      <Portfolio404 slug={slug ?? ""} usernameUnknown={!uid} />
    );
  }

  const streak = streakDays(acts ?? []);
  const score = computeScore(acts ?? [], streak);

  const projects = (acts ?? []).filter((a) => a.type === "PROJECT");
  const certs = (acts ?? []).filter((a) => a.type === "CERT" || a.type === "COURSE");
  const dsa = (acts ?? []).filter((a) => a.type === "DSA");
  const achievements = (acts ?? []).filter((a) => a.type === "ACHIEVEMENT");

  async function share() {
    const url = portfolioUrl(slug ?? "");
    if (navigator.share) {
      try {
        await navigator.share({ title: `${profile!.name} — portfolio`, url });
      } catch {
        /* dismissed */
      }
    } else {
      await navigator.clipboard.writeText(url).catch(() => undefined);
      setToastMsg(COPY.portfolio.toastCopied);
      window.setTimeout(() => setToastMsg(null), 3000);
    }
  }

  const userForHeader: Student = {
    ...profile,
    portfolioSlug: slug ?? profile.portfolioSlug,
  };

  return (
    <div className="min-h-screen bg-canvas px-4 py-8 max-w-[680px] mx-auto">
      <PortfolioHeader
        user={userForHeader}
        slug={slug ?? ""}
        score={score}
        activityCount={(acts ?? []).length}
        onShare={share}
        onHow={() => setFormulaOpen(true)}
      />

      {(acts ?? []).length === 0 ? (
        <div className="bg-surface border border-line rounded-xl shadow-card p-8 text-center">
          <p className="text-[15px] text-ink-muted">{COPY.portfolio.empty(profile.name)}</p>
        </div>
      ) : (
        <>
          {projects.length > 0 && (
            <section className="mb-6">
              <h3 className="font-semibold text-[15px] mb-2">{COPY.portfolio.sections.projects}</h3>
              <div className="flex flex-col gap-2">
                {projects.map((a) => (
                  <ActivityRow key={a.id} activity={a} variant="public" />
                ))}
              </div>
            </section>
          )}

          {certs.length > 0 && (
            <section className="mb-6">
              <h3 className="font-semibold text-[15px] mb-2">{COPY.portfolio.sections.certs}</h3>
              <div className="flex flex-col gap-2">
                {certs.map((a) => (
                  <ActivityRow key={a.id} activity={a} variant="public" />
                ))}
              </div>
            </section>
          )}

          {dsa.length > 0 && (
            <section className="mb-6">
              <h3 className="font-semibold text-[15px] mb-2">{COPY.portfolio.sections.dsa}</h3>
              <p className="bg-surface border border-line rounded-xl shadow-card p-4 text-[15px] font-medium">
                {COPY.portfolio.dsaLine(dsa.length, streak)}
              </p>
            </section>
          )}

          {achievements.length > 0 && (
            <section className="mb-6">
              <h3 className="font-semibold text-[15px] mb-2">{COPY.portfolio.sections.achievements}</h3>
              <div className="flex flex-col gap-2">
                {achievements.map((a) => (
                  <ActivityRow key={a.id} activity={a} variant="public" />
                ))}
              </div>
            </section>
          )}

          <section className="mb-6">
            <h3 className="font-semibold text-[15px] mb-2">{COPY.portfolio.sections.timeline}</h3>
            <TimelineStrip activities={acts ?? []} />
          </section>
        </>
      )}

      <footer className="text-center pb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-[13px] text-ink-muted hover:text-ink font-medium focus-visible:ring-2 focus-visible:ring-brand rounded-sm"
        >
          <GithubIcon size={14} aria-hidden />
          {COPY.portfolio.footer}
        </Link>
      </footer>

      {toastMsg && (
        <div role="status" className="fixed top-4 inset-x-4 mx-auto max-w-[380px] bg-surface border border-line rounded-lg shadow-elev px-4 py-3 text-sm">
          {toastMsg}
        </div>
      )}

      <FormulaSheet
        open={formulaOpen}
        onClose={() => setFormulaOpen(false)}
        activities={acts ?? []}
        streak={streak}
      />
    </div>
  );
}

function Portfolio404({ slug, usernameUnknown }: { slug: string; usernameUnknown: boolean }) {
  void slug;
  void usernameUnknown;
  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center px-4 text-center">
      <div className="bg-surface border border-line rounded-xl shadow-card p-8 max-w-[420px]">
        <h1 className="text-[20px] font-bold mb-2">{COPY.portfolio.notFoundTitle}</h1>
        <p className="text-[15px] text-ink-muted mb-6">{COPY.portfolio.notFoundBody}</p>
        <Link
          to="/"
          className="inline-flex h-11 items-center px-4 rounded-lg bg-brand text-white font-semibold hover:bg-brand-dark transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          {COPY.portfolio.claim}
        </Link>
      </div>
    </div>
  );
}
