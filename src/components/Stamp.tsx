import { CheckCircle2, AlertTriangle } from "lucide-react";
import type { DriveStatus } from "../lib/types";

interface StampProps {
  status: DriveStatus;
  sourceName: string;
  verifiedAt: Date;
  sourceUrl: string;
  tentativeLabel: string;
  viewOfficialLabel: string;
}

// Design.md 3.15 — the USP 1 audit trail: status · source · checked date.
export function Stamp({ status, sourceName, verifiedAt, sourceUrl, tentativeLabel, viewOfficialLabel }: StampProps) {
  const checked = verifiedAt
    ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(verifiedAt)
    : null;

  return (
    <div className="bg-surface border border-line rounded-xl shadow-card p-3">
      <p
        className={`flex items-start gap-2 text-[13px] font-semibold ${
          status === "CONFIRMED" ? "text-success" : "text-warning"
        }`}
      >
        {status === "CONFIRMED" ? (
          <CheckCircle2 size={16} strokeWidth={2} aria-hidden className="mt-0.5 shrink-0" />
        ) : (
          <AlertTriangle size={16} strokeWidth={2} aria-hidden className="mt-0.5 shrink-0" />
        )}
        <span>
          {status === "CONFIRMED"
            ? `CONFIRMED · source: ${sourceName}${checked ? ` · checked ${checked}` : ""}`
            : `${tentativeLabel} · source: ${sourceName}`}
        </span>
      </p>
      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener"
          className="inline-flex h-11 items-center mt-2 text-[15px] font-medium text-brand underline underline-offset-2 hover:text-brand-dark focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-sm"
        >
          {viewOfficialLabel}
        </a>
      )}
    </div>
  );
}
