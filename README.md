# DriveDeck

Mobile-first placement-prep web app — verified drives, a kanban application board,
and an auto-built public portfolio. Built for the JioCoder Hackathon 2026.

See `docs/PRD.md`, `docs/Architecture.md`, `docs/Design.md`, `docs/RULES.md`.

## Why `motion` (sixth runtime dependency)

`Architecture.md` Sheet 8.1 caps runtime dependencies at five and requires written
justification for a sixth. This is that justification:

- **What:** `motion` (the framer-motion successor; the `motion/react` entry point),
  used by the landing page hero (`src/components/ui/hero-section-6.tsx` +
  `src/components/ui/animated-group.tsx`) for the blur-in card entrance, the
  staggered copy reveal, and the dashboard/iPhone entrance transitions.
- **Why:** The hero-section-6 design the project owner approved ships its motion
  via framer-motion variants; reimplementing spring/blur variants without the
  library would mean maintaining a partial animation engine. The animation API
  is serialized to the landing's reduced-motion preference via `MotionConfig`.
- **Scope:** No other page imports `motion`; removal is a two-file deletion
  (`hero-section-6.tsx`, `animated-group.tsx`) plus the import in `Landing.tsx`.

Approved by the project owner (user-supplied component prompt, 2026-11-09).
(NB: `three` was the previous exception, used by a retired 3D hero — it was
removed when the hero-section-6 design replaced it; R187 lives in git history.)

## Local development

```bash
npm install
node scripts/seed.mjs [--uid=<firebase uid>]   # optional demo data (admin SDK, gitignored key)
npm run dev                                    # http://localhost:5199
npm run build                                  # tsc + vite → dist
```

Secrets (`.env`, `scripts/service-account.json`) are gitignored and never committed.
