// Design.md 3.5 — 0–100 as an animated SVG ring. Value derived from activities by
// src/lib/scoring.ts; nothing stored (RULES.md Rule 7.5).

interface ScoreRingProps {
  /** undefined while the parent listener has not delivered data yet → skeleton */
  value: number | undefined;
  size: number; // 64 (portfolio/growth) or 120 (dashboard)
  onHow?: () => void; // render "How this is calculated" link when given
}

export function ScoreRing({ value, size, onHow }: ScoreRingProps) {
  if (value === undefined) {
    return (
      <div className="inline-flex flex-col items-center gap-2">
        <div className="skeleton rounded-full" style={{ width: size, height: size }} />
        {onHow && <span className="skeleton h-4 w-28 rounded-lg" />}
      </div>
    );
  }

  const v = Math.max(0, Math.min(100, value));
  const sw = size === 120 ? 10 : 7;
  const r = (size - sw) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - v / 100);

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Readiness score ${v} of 100`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={sw} className="stroke-line" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={sw}
            strokeLinecap="round"
            className="stroke-brand animate-ring-fill"
            style={
              {
                strokeDasharray: circumference,
                "--circumference": `${circumference}px`,
                "--target-offset": `${offset}px`,
              } as React.CSSProperties
            }
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-bold leading-none" style={{ fontSize: size === 120 ? 28 : 14 }}>
            {v}
            {size === 120 && <span className="text-ink-muted text-base font-medium">/100</span>}
          </span>
        </div>
      </div>
      {onHow && (
        <button
          type="button"
          onClick={onHow}
          className="h-8 text-[13px] font-medium text-brand underline underline-offset-2 hover:text-brand-dark focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-sm"
        >
          How this is calculated
        </button>
      )}
    </div>
  );
}
