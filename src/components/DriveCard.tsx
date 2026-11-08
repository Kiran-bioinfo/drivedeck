import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import type { Drive, EligibilityResult, Student } from "../lib/types";
import { checkEligibility } from "../lib/eligibility";
import { COPY } from "../lib/copy";
import { CountdownChip } from "./CountdownChip";
import { EligibilityBadge } from "./EligibilityBadge";

interface DriveCardProps {
  drive: Drive;
  profile: Student | undefined;
}

function isClosed(d: Date, now: Date): boolean {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() <
    new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

export function badgeText(result: EligibilityResult): { variant: "success" | "danger" | "warning"; text: string } {
  if (result.criteriaPending) return { variant: "warning", text: COPY.drives.criteriaPending };
  if (result.missingProfile) return { variant: "warning", text: COPY.drives.badgeMissing };
  if (result.match) return { variant: "success", text: COPY.drives.badgeMatch };
  if (result.failedNote) return { variant: "danger", text: result.failedNote };
  return { variant: "warning", text: COPY.drives.criteriaPending };
}

// Design.md 3.11
export function DriveCard({ drive, profile }: DriveCardProps) {
  const result = checkEligibility(profile ?? null, drive);
  const badge = drive.eligibility.cgpaMin == null && drive.eligibility.tenthMin == null && drive.eligibility.twelfthMin == null
    ? { variant: "warning" as const, text: COPY.drives.criteriaPending }
    : badgeText(result);

  const expired = drive.regDeadline ? isClosed(drive.regDeadline.toDate(), new Date()) : false;
  const deadline = drive.regDeadline ? drive.regDeadline.toDate() : null;

  return (
    <Link
      to={`/drives/${drive.id}`}
      className={`block bg-surface border border-line rounded-xl shadow-card p-4 hover:shadow-elev transition-shadow focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
        expired ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0"
          style={{ backgroundColor: `${drive.color}1A`, color: drive.color }}
        >
          {drive.initials}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold leading-tight truncate">
            {drive.companyName} · {drive.program}
          </h3>
          <p className="text-[13px] text-ink-muted truncate">{drive.role}</p>
        </div>
        <span className="text-[11px] font-medium text-ink-muted bg-canvas border border-line rounded-full px-2 py-0.5 shrink-0">
          {drive.type === "ON" ? COPY.drives.typeOn : COPY.drives.typeOff}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <CountdownChip company={drive.companyName} program={drive.program} deadline={deadline} size="sm" />
        <EligibilityBadge variant={badge.variant} text={badge.text} />
      </div>

      {drive.status === "TENTATIVE" && (
        <p className="flex items-center gap-1.5 mt-2 text-[13px] font-medium text-warning">
          <AlertCircle aria-hidden size={14} strokeWidth={2} />
          {COPY.drives.tentativeNote}
        </p>
      )}
    </Link>
  );
}
