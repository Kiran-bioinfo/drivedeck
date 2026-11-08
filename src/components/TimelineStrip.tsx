import type { Activity } from "../lib/types";

// Design.md 3.23 — 12-month bar strip; pure CSS, no chart library.
export function TimelineStrip({ activities }: { activities: Activity[] }) {
  const now = new Date();
  const months: { label: string; count: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const count = activities.filter((a) => {
      const ad = a.date.toDate();
      return ad.getFullYear() === d.getFullYear() && ad.getMonth() === d.getMonth();
    }).length;
    months.push({ label: "JFMAMJJASOND"[d.getMonth()], count });
  }
  const max = Math.max(1, ...months.map((m) => m.count));
  const anyActivity = months.some((m) => m.count > 0);

  return (
    <div className="bg-surface border border-line rounded-xl shadow-card p-4">
      <div className="flex items-end gap-1 h-24">
        {months.map((m, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
            <div
              className="w-full max-w-[24px] rounded-t bg-brand"
              style={{ height: `${Math.max(m.count > 0 ? 8 : 2, (m.count / max) * 100)}%` }}
            />
            <span className="text-[10px] text-ink-muted">{m.label}</span>
          </div>
        ))}
      </div>
      {!anyActivity && <p className="text-center text-[13px] text-ink-muted mt-2">No activity yet.</p>}
    </div>
  );
}
