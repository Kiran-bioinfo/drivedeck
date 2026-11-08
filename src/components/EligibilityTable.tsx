import { Check, X } from "lucide-react";
import type { Check as CheckRow } from "../lib/types";
import { COPY } from "../lib/copy";

// Design.md 3.14 — stacked rows, never a squeezed table on mobile.
export function EligibilityTable({ checks }: { checks: CheckRow[] }) {
  return (
    <ul className="divide-y divide-line bg-surface border border-line rounded-xl shadow-card">
      {checks.map((c) => {
        if (c.allBranches) {
          return (
            <li key={c.label} className="flex items-center gap-2 px-4 py-3">
              <Check size={16} strokeWidth={2.5} aria-hidden className="text-success" />
              <span className="text-[15px] text-ink-muted">{COPY.drives.allBranches}</span>
            </li>
          );
        }
        return (
          <li key={c.label} className="flex items-center gap-2 px-4 py-3">
            {c.pass === true ? (
              <Check size={16} strokeWidth={2.5} aria-hidden className="text-success shrink-0" />
            ) : c.pass === false ? (
              <X size={16} strokeWidth={2.5} aria-hidden className="text-danger shrink-0" />
            ) : (
              <span aria-hidden className="w-2 h-2 rounded-full bg-warning shrink-0 mx-2" />
            )}
            <span className={`text-[15px] ${c.pass === false ? "font-semibold" : ""}`}>
              {c.pass === undefined ? (
                <span className="text-ink-muted">
                  {c.label}: <span className="text-warning font-medium">not published</span>
                </span>
              ) : (
                COPY.drives.row(c.label, c.need, c.have)
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
