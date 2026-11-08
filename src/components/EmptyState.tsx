import { Link } from "react-router-dom";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  /** From PRD.md §7 — never invented inline */
  message: string;
  action?: { label: string; to: string };
}

// Design.md 3.4 — every list's "no data yet" state. A blank panel is a build defect.
export function EmptyState({ message, action }: EmptyStateProps) {
  if (!message) throw new Error("EmptyState: message is required (PRD.md §7 string)");
  return (
    <div className="bg-surface border border-line rounded-xl shadow-card p-8 text-center">
      <Inbox aria-hidden size={48} className="mx-auto text-ink-muted mb-4" strokeWidth={2} />
      <p className="text-[15px] text-ink-muted mb-4">{message}</p>
      {action && (
        <Link
          to={action.to}
          className="inline-flex h-11 items-center px-4 rounded-lg bg-brand text-white font-semibold hover:bg-brand-dark transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
