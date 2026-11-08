import { CalendarPlus } from "lucide-react";
import type { Drive } from "../lib/types";
import { downloadIcs } from "../lib/ics";
import { COPY } from "../lib/copy";

// Design.md 3.16 — Blob download; disabled when the date is unconfirmed.
export function IcsButton({ drive }: { drive: Drive }) {
  const disabled = !drive.regDeadline;
  return (
    <button
      type="button"
      disabled={disabled}
      title={disabled ? COPY.drives.icsDisabled : undefined}
      aria-disabled={disabled}
      onClick={() => {
        if (!drive.regDeadline) return;
        const events = [
          {
            uid: `${drive.id}-reg`,
            title: `${drive.companyName} ${drive.program} — registration deadline`,
            date: drive.regDeadline.toDate(),
            url: drive.sourceUrl,
          },
          ...(drive.testDate
            ? [{ uid: `${drive.id}-test`, title: `${drive.companyName} ${drive.program} — test`, date: drive.testDate.toDate(), url: drive.sourceUrl }]
            : []),
        ];
        downloadIcs(`${drive.id}.ics`, events);
      }}
      className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-brand text-white text-[15px] font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
    >
      <CalendarPlus size={20} strokeWidth={2} aria-hidden />
      {COPY.drives.addToCalendar}
    </button>
  );
}
