import { X } from "lucide-react";
import type { Activity } from "../lib/types";
import { scoreParts } from "../lib/scoring";
import { COPY } from "../lib/copy";

interface FormulaSheetProps {
  open: boolean;
  onClose: () => void;
  activities: Activity[];
  streak: number;
}

// PRD §13 — the printed formula with the student's live inputs. Transparency is the USP.
export function FormulaSheet({ open, onClose, activities, streak }: FormulaSheetProps) {
  if (!open) return null;
  const p = scoreParts(activities, streak);
  const pct = (name: string, count: number, weight: number | string, points: number, extra?: string) => (
    <li className="flex items-center justify-between gap-2 py-2 border-b border-line last:border-0">
      <span>
        <span className="font-medium">{name}</span>
        <span className="text-ink-muted"> · {count} × {weight}{extra ? ` ${extra}` : ""}</span>
      </span>
      <span className="font-semibold">{points}</span>
    </li>
  );

  return (
    <div className="fixed inset-0 z-50 lg:grid lg:place-items-center">
      <div className="absolute inset-0 bg-ink/20" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={COPY.dashboard.formulaTitle}
        className="absolute bottom-0 w-full bg-surface rounded-t-xl shadow-elev p-4 max-h-[90vh] overflow-y-auto lg:relative lg:w-full lg:max-w-[420px] lg:rounded-xl"
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-lg">{COPY.dashboard.formulaTitle}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="p-2 -m-2 text-ink-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-brand rounded-md">
            <X size={20} strokeWidth={2} aria-hidden />
          </button>
        </div>
        <p className="text-[14px] text-ink-muted mb-4">score = min(100, 15·P + 10·C + 5·K + 2·D + min(10, 0.5·S))</p>
        <ul className="text-[15px]">
          {pct(COPY.dashboard.formulaProjects, p.projects, 15, p.projectPoints)}
          {pct(COPY.dashboard.formulaCerts, p.certs, 10, p.certPoints)}
          {pct(COPY.dashboard.formulaCourses, p.courses, 5, p.coursePoints)}
          {pct(COPY.dashboard.formulaDsa, p.dsa, 2, p.dsaPoints, p.dsaCapped ? COPY.dashboard.formulaDsaCap : undefined)}
          {pct(COPY.dashboard.formulaStreak, p.streak, "0.5", Math.round(p.streakBonus * 10) / 10, "capped at 10")}
        </ul>
        <p className="mt-4 text-right text-lg font-bold">Total: {p.total}/100</p>
        <p className="mt-2 text-[13px] text-ink-muted">{COPY.dashboard.formulaFootnote}</p>
      </div>
    </div>
  );
}
