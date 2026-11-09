import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Flame, LogOut, PenLine, ListChecks, FolderPlus, Smile } from "lucide-react";
import { db, auth } from "../lib/firebase";
import type { Application, Activity, Drive, Student } from "../lib/types";
import { checkEligibility } from "../lib/eligibility";
import { computeScore, streakDays } from "../lib/scoring";
import { COPY } from "../lib/copy";
import { epochMs } from "../lib/time";
import { ScoreRing } from "../components/ScoreRing";
import { CountdownChip } from "../components/CountdownChip";
import { EmptyState } from "../components/EmptyState";
import { FormulaSheet } from "../components/FormulaSheet";
import { useToast } from "../components/Toaster";

interface OutletCtx {
  profile?: Student;
}
interface Focus {
  kind: "log_dsa" | "deadline_drive" | "add_project" | "all_clear";
  icon: typeof PenLine;
  body: string;
  driveId?: string;
}

const DAY = 86_400_000;

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// PRD §F2 — 4 parallel listeners; derived values via src/lib only.
export function Dashboard() {
  const { uid } = useAuth();
  const { profile } = useOutletContext<OutletCtx>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [drives, setDrives] = useState<Drive[] | null>(null);
  const [apps, setApps] = useState<Application[] | null>(null);
  const [acts, setActs] = useState<Activity[] | null>(null);
  const [formulaOpen, setFormulaOpen] = useState(false);

  useEffect(() => {
    // no orderBy anywhere: no composite-index dependency, ordering applied client-side
    return onSnapshot(
      collection(db, "drives"),
      (s) => setDrives(s.docs.map((d) => ({ id: d.id, ...d.data() } as Drive))),
      (err) => {
        // never strand the page on an endless skeleton (audit: listener failures)
        console.error("[DriveDeck] drives listener failed:", err);
        setDrives([]);
      },
    );
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    return onSnapshot(
      query(collection(db, "applications"), where("uid", "==", uid)),
      (s) => {
        const list = s.docs.map((d) => ({ id: d.id, ...d.data() } as Application));
        list.sort((a, b) => epochMs(b.updatedAt) - epochMs(a.updatedAt));
        setApps(list);
      },
      (err) => {
        console.error("[DriveDeck] applications listener failed:", err);
        setApps([]);
      },
    );
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    return onSnapshot(
      query(collection(db, "activities"), where("uid", "==", uid)),
      (s) => {
        const list = s.docs.map((d) => ({ id: d.id, ...d.data() } as Activity));
        list.sort((a, b) => epochMs(b.date) - epochMs(a.date));
        setActs(list);
      },
      (err) => {
        console.error("[DriveDeck] activities listener failed:", err);
        setActs([]);
      },
    );
  }, [uid]);

  const loading = !drives || !apps || !acts || !profile;

  const streak = acts ? streakDays(acts) : 0;
  const score = acts ? computeScore(acts, streak) : undefined;

  const now = new Date();
  const upcoming = useMemo(() => {
    if (!drives) return [];
    return drives
      .filter((d) => d.regDeadline && d.regDeadline.toDate().getTime() >= startOfDay(now).getTime())
      .sort((a, b) => (a.regDeadline!.toDate().getTime() - b.regDeadline!.toDate().getTime()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drives]);

  const watchCount = useMemo(() => {
    if (!drives || !profile) return 0;
    return drives.filter((d) => {
      if (!d.regDeadline || d.regDeadline.toDate().getTime() < startOfDay(now).getTime()) return false;
      return checkEligibility(profile, d).match;
    }).length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drives, profile]);

  // Today's focus — priority order from PRD §F2
  const focus: Focus[] = useMemo(() => {
    if (!acts || !drives) return [];
    const out: Focus[] = [];

    const latestDsa = acts.filter((a) => a.type === "DSA")[0]; // acts are date-desc
    if (latestDsa) {
      const dsaDay = startOfDay(latestDsa.date.toDate()).getTime();
      // calendar-day −1 (audit 2.7): `startOfDay - DAY` lands at 23:00 two days
      // back across a DST spring-forward, mis-classifying the DSA focus item
      const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime();
      if (dsaDay < yesterday) out.push({ kind: "log_dsa", icon: PenLine, body: COPY.dashboard.focusLogDsa(streak) });
    }

    const appDriveIds = new Set((apps ?? []).map((a) => a.driveId));
    const nextDrive = upcoming.find(
      (d) => d.status === "CONFIRMED" && !appDriveIds.has(d.id) && d.regDeadline!.toDate().getTime() - startOfDay(now).getTime() <= 10 * DAY
    );
    if (nextDrive) {
      const days = Math.max(0, Math.round((startOfDay(nextDrive.regDeadline!.toDate()).getTime() - startOfDay(now).getTime()) / DAY));
      out.push({
        kind: "deadline_drive",
        icon: ListChecks,
        body: COPY.dashboard.focusDeadline(nextDrive.companyName, nextDrive.program, days),
        driveId: nextDrive.id,
      });
    }

    if (!acts.some((a) => a.type === "PROJECT")) {
      out.push({ kind: "add_project", icon: FolderPlus, body: COPY.dashboard.focusProject });
    }

    if (out.length === 0) out.push({ kind: "all_clear", icon: Smile, body: COPY.dashboard.focusClear });
    return out.slice(0, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acts, drives, apps, upcoming, streak]);

  const firstName = profile?.name.split(/\s+/)[0] ?? "";

  if (loading) {
    return (
      <div className="flex flex-col gap-4 pt-2">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-40 rounded-xl" />
        <div className="skeleton h-12 rounded-xl" />
        <div className="skeleton h-24 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="pt-2">
      <div className="flex items-start justify-between mb-2">
        <header>
          <h2 className="text-[24px] leading-[30px] font-semibold">{COPY.dashboard.greeting(firstName)}</h2>
          <p className="text-[13px] text-ink-muted">
            {new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short" }).format(now)}
          </p>
        </header>
        <button
          type="button"
          onClick={() => {
            signOut(auth).then(() => {
              toast(COPY.system.signedOut);
              navigate("/");
            });
          }}
          aria-label={COPY.nav.signOut}
          className="p-2 -m-1 text-ink-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-brand rounded-md"
        >
          <LogOut size={20} strokeWidth={2} aria-hidden />
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Score + streak — left column on desktop */}
        <section className="bg-surface border border-line rounded-xl shadow-card p-4 flex flex-col items-center gap-3 lg:col-span-1">
          <p className="text-[13px] font-medium text-ink-muted self-start">{COPY.dashboard.readiness}</p>
          <ScoreRing value={score} size={120} onHow={() => setFormulaOpen(true)} />
          <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-warning/10 text-warning text-[13px] font-semibold">
            <Flame size={14} strokeWidth={2.5} aria-hidden />
            {COPY.dashboard.streak(streak)}
          </span>
        </section>

        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Next deadlines */}
          <section>
            <h3 className="text-[13px] font-medium text-ink-muted mb-2">Next deadlines</h3>
            {upcoming.length === 0 ? (
              <EmptyState message={COPY.dashboard.deadlinesEmpty} action={{ label: COPY.drives.filters[0], to: "/drives" }} />
            ) : (
              <div className="flex flex-col gap-2">
                {upcoming.slice(0, 3).map((d) => (
                  <CountdownChip
                    key={d.id}
                    company={d.companyName}
                    program={d.program}
                    deadline={d.regDeadline ? d.regDeadline.toDate() : null}
                    tentative={d.status === "TENTATIVE"}
                    size="sm"
                    to={`/drives/${d.id}`}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Today's focus */}
          <section>
            <h3 className="text-[13px] font-medium text-ink-muted mb-2">Today's focus</h3>
            <div className="flex flex-col gap-2">
              {focus.map((f) => (
                <button
                  key={f.kind}
                  type="button"
                  onClick={() => navigate(f.driveId ? `/drives/${f.driveId}` : f.kind === "all_clear" ? "/drives" : "/growth")}
                  className="text-left bg-surface border border-line rounded-xl shadow-card p-4 flex items-center gap-3 hover:shadow-elev transition-shadow focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  <span aria-hidden className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0">
                    <f.icon size={16} strokeWidth={2} />
                  </span>
                  <span className="text-[15px]">{f.body}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Eligibility watch */}
          <button
            type="button"
            onClick={() => navigate("/drives?filter=match")}
            className="text-left bg-surface border-l-[3px] border-brand border border-line rounded-xl shadow-card px-4 py-3 flex items-center justify-between hover:bg-canvas transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            <span className="text-[15px]">
              {watchCount > 0 ? COPY.dashboard.watch(watchCount > 50 ? "50+" : String(watchCount)) : COPY.dashboard.watchEmpty}
            </span>
            <span aria-hidden className="text-ink-muted">›</span>
          </button>
        </div>
      </div>

      <FormulaSheet open={formulaOpen} onClose={() => setFormulaOpen(false)} activities={acts ?? []} streak={streak} />
    </div>
  );
}

