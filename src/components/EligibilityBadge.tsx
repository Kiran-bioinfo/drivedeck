import { Check, X, AlertTriangle } from "lucide-react";

type BadgeVariant = "success" | "danger" | "warning";

interface EligibilityBadgeProps {
  variant: BadgeVariant;
  /** Exact string from PRD.md §7 / computed via COPY.drives.badge* helpers */
  text: string;
}

// Design.md 3.12 — compact pass/fail pill with text, not color alone.
export function EligibilityBadge({ variant, text }: EligibilityBadgeProps) {
  const cls =
    variant === "success"
      ? "bg-success/10 text-success"
      : variant === "danger"
        ? "bg-danger/10 text-danger"
        : "bg-warning/10 text-warning";
  const color = variant === "success" ? "text-success" : variant === "danger" ? "text-danger" : "text-warning";
  const Icon = variant === "success" ? Check : variant === "danger" ? X : AlertTriangle;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-medium ${cls}`}>
      <Icon size={14} strokeWidth={2.5} aria-hidden className={color} />
      {text}
    </span>
  );
}
