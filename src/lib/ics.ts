// .ics generator — a Blob download, no email/reminder infrastructure (PRD §5 USP 1).

interface IcsEvent {
  uid: string;
  title: string;
  date: Date; // all-day event on this date
  url?: string;
}

function fmtDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
}

// RFC 5545 TEXT escaping — SUMMARY is a TEXT value: backslash, semicolon,
// comma and newlines must be escaped or a title like "Acme, Ltd." corrupts
// the line (and a newline would inject extra ICS fields — audit 2.8).
function escapeText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

// Calendar-day +1 (audit 2.8): `date + 86_400_000` is 24h of real time, which
// across a DST boundary lands at 23:00 the previous day — DTEND then equals
// DTSTART and calendars drop the event. Constructing Y/M/D+1 normalizes via
// the Date constructor and stays on the local calendar.
function nextDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
}

export function buildIcs(events: IcsEvent[]): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//DriveDeck//EN", "CALSCALE:GREGORIAN"];
  for (const ev of events) {
    const start = fmtDate(ev.date);
    const end = fmtDate(nextDay(ev.date));
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${ev.uid}`);
    lines.push(`DTSTAMP:${start}T000000Z`);
    lines.push(`DTSTART;VALUE=DATE:${start}`);
    lines.push(`DTEND;VALUE=DATE:${end}`);
    lines.push(`SUMMARY:${escapeText(ev.title)}`);
    // URL is a URI (not TEXT): no comma escaping, but raw CR/LF would inject lines
    if (ev.url) lines.push(`URL:${ev.url.replace(/[\r\n]/g, "")}`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadIcs(filename: string, events: IcsEvent[]): void {
  const blob = new Blob([buildIcs(events)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url); // revoke after click (Design.md 3.16 edge case)
}
