// PRD §F4 — one-shot CSS confetti burst on Offer drop (hand-rolled keyframes, no library).
// Colors cycle the design-token palette only (Design.md Sheet 1.2).

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444"];

// Remounted with a new key per Offer drop — the render it mounts is the one burst.
export function Confetti({ fire }: { fire: number }) {
  if (fire <= 0) return null;

  return (
    <div aria-hidden className="fixed inset-0 pointer-events-none z-[90] overflow-hidden">
      {Array.from({ length: 24 }).map((_, i) => {
        const color = COLORS[i % COLORS.length];
        const left = 20 + ((i * 37) % 60); // spread % across center
        const delay = (i % 6) * 40;
        return (
          <span
            key={i}
            className="animate-confetti absolute bottom-1/3 w-2 h-3 rounded-[2px]"
            style={{
              left: `${left}%`,
              backgroundColor: color,
              animationDelay: `${delay}ms`,
              // stagger horizontal drift + rotation purely through deterministic spread
            }}
          />
        );
      })}
    </div>
  );
}
