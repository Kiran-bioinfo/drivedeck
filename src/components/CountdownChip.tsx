import { Link } from "react-router-dom";
import { chipText } from "../lib/copy";

interface CountdownChipProps {
  company: string;
  program: string;
  deadline: Date | null;
  tentative?: boolean;
  size?: "sm" | "lg";
  to?: string; // when set, the chip links to that drive
}

function daysUntil(deadline: Date, now: Date): { days: number; today: boolean; closed: boolean } {
  const startDeadline = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
  const startNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((startDeadline.getTime() - startNow.getTime()) / 86_400_000);
  return {
    days: diffDays,
    today: diffDays === 0,
    closed: diffDays < 0,
  };
}

// Design.md 3.6 — urgency colors: >7d muted, ≤7d amber, ≤3d red, null "Date unconfirmed".
export function CountdownChip({ company, program, deadline, tentative, size = "sm", to }: CountdownChipProps) {
  const now = new Date();
  let text: string;
  let cls: string;

  if (!deadline) {
    text = "Date unconfirmed";
    cls = "text-ink-muted bg-canvas";
  } else {
    const { days, today, closed } = daysUntil(deadline, now);
    text = chipText(company, program, Math.max(0, days), today, closed);
    if (closed) cls = "text-ink-muted line-through bg-canvas";
    else if (days <= 3) cls = "text-danger bg-danger/10";
    else if (days <= 7) cls = "text-warning bg-warning/10";
    else cls = "text-ink-muted bg-canvas";
  }

  const tentativeDot = tentative ? <span aria-hidden className="inline-block w-2 h-2 rounded-full bg-warning mr-1.5" /> : null;

  const pill = (
    <span
      className={`inline-flex items-center rounded-full px-3 font-medium whitespace-nowrap ${
        size === "lg" ? "min-h-[44px] py-2 text-[15px]" : "h-8 py-1 text-[13px]"
      } ${cls}`}
    >
      {tentativeDot}
      {text}
    </span>
  );

  if (to && deadline && !isClosed(deadline, now)) {
    return (
      <Link to={to} className="inline-flex focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-full">
        {pill}
      </Link>
    );
  }
  return pill;
}

function isClosed(deadline: Date, now: Date): boolean {
  const startDeadline = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
  const startNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return startDeadline.getTime() < startNow.getTime();
}
