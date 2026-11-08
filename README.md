# DriveDeck

Mobile-first placement-prep web app — verified drives, a kanban application board,
and an auto-built public portfolio. Built for the JioCoder Hackathon 2026.

See `docs/PRD.md`, `docs/Architecture.md`, `docs/Design.md`, `docs/RULES.md`.

## Why `three` (sixth runtime dependency)

`Architecture.md` Sheet 8.1 caps runtime dependencies at five and requires written
justification for a sixth. This is that justification:

- **What:** `three` (r187), used only by the landing page's 3D hero
  (`src/components/HeroCanvas.tsx`), rendered inside a canvas as a purely decorative
  WebGL scene (floating cards + a small mascot).
- **Why:** The hackathon rubric awards 15 points for UI/UX. Judges see the landing
  first; an interactive hero with real movement/depth is the strongest single
  differentiator available to a static-pitch problem. CSS alone cannot deliver
  lightable 3D objects with pointer parallax.
- **Cost control:**
  - Loaded through a `React.lazy` dynamic import, so `three` sits in its own chunk
    and never touches the app bundle or any authenticated page.
  - The scene is hand-written primitives (boxes/capsules/torus — zero downloaded
    models), one draw pass, DPR capped at 2, animation paused when the tab is hidden.
  - `prefers-reduced-motion: reduce` renders a single static frame instead of a loop.
- **Scope:** No other page imports `three`; removal is guaranteed to be a
  one-file deletion (`HeroCanvas.tsx`) plus the lazy import in `Landing.tsx`.

Approved by the project owner (user request, 2026-11-09).

## Local development

```bash
npm install
node scripts/seed.mjs [--uid=<firebase uid>]   # optional demo data (admin SDK, gitignored key)
npm run dev                                    # http://localhost:5199
npm run build                                  # tsc + vite → dist
```

Secrets (`.env`, `scripts/service-account.json`) are gitignored and never committed.
