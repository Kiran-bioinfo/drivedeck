# DriveDeck — RULES.md

Behavioral rules for every contributor — human or AI — writing code in this repository. This file is obeyed strictly; it is read before the first commit and checked before every PR.

**Part I** is carried over **verbatim** from [andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills.git) (MIT) — the Karpathy guidelines. It is not to be paraphrased, reordered, or "improved" (see Rule 3.2).

**Part II** is DriveDeck-specific, following that repo's own customization pattern: *"These guidelines are designed to be merged with project-specific instructions."*

**Tradeoff (from the source repo):** These guidelines bias toward caution over speed. For trivial tasks (simple typo fixes, obvious one-liners), use judgment.

---

# Part I — The four principles (verbatim)

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

# Part II — DriveDeck project rules

These extend Part I. Where Part I governs *how* you work, Part II governs *what* you may build and *where* its truth comes from. They exist so that three documents — `PRD.md`, `Architecture.md`, `Design.md` — and one codebase never drift apart.

## 5. Sources of truth (read before coding anything)

| # | Source | Owns |
|---|---|---|
| 1 | `firestore.rules` | Security rules — canonical |
| 2 | `Architecture.md` | System structure, collections, IDs, lifecycles |
| 3 | `Design.md` | Components, states, FE↔BE↔DB bindings |
| 4 | `PRD.md` | Scope, UI copy (§7), tokens (§8), acceptance criteria, seed values |

**Rule 5.1.** Never contradict a higher-precedence source. If a conflict is found, stop, name it (Part I §1), and fix the lower-precedence copy.
**Rule 5.2.** A requirement that appears in none of the four sources does not exist. Don't build it (Part I §2).

## 6. Scope lock

**Rule 6.1.** The product is 3 USPs + 4 features + 2 support screens (list: `PRD.md` §4). Nothing else ships. Every "why didn't you build X?" answer is `PRD.md` §14 — a contributor proposes scope changes by *editing that table*, never by writing code.
**Rule 6.2.** Runtime dependencies are capped at five (`firebase`, `react-router-dom`, `@dnd-kit/core`, `lucide-react`, `tailwindcss`). A sixth requires written justification in the README, per `Architecture.md` Sheet 8.1 — **`three` is the approved sixth** (landing 3D hero, README "Why `three`"), lazy-loaded and used by the landing page only.
**Rule 6.3.** No server, no cron, no file uploads, no AI features, no email — ever. The architecture assumes their absence (`Architecture.md` Sheet 1).

## 7. Data integrity (the non-negotiables)

**Rule 7.1 — No mock data.** Every rendered list, number, and badge comes from a real Firestore read. Banned/allowed patterns and the pre-merge checklist: `Design.md` Sheet 5. The seeded demo account `/u/kiran` is real documents — it is not a mock.
**Rule 7.2 — Deterministic IDs only.** Document IDs are built by the `src/lib` helpers (`driveId`, `appId`), never string-built inline and never random where a deterministic ID exists (`Architecture.md` Sheet 3.3).
**Rule 7.3 — The Evidence Rule.** Every `activities` write includes `uid` and proof: a valid `http(s)://` URL, **or an attached compressed image** (`data:image/…;base64,` data URI, §PRD 7.2). Enforced in the UI and again by `firestore.rules` rule 5.
**Rule 7.4 — Never write to `drives` or `companies` from the client.** They are seed-script-only (`firestore.rules` rule 3). If a drive is wrong, fix `scripts/seed.mjs` and re-run — never hot-patch from the app.
**Rule 7.5 — Scores are derived, never stored.** The Readiness Score is computed by `src/lib/scoring.ts` at render time. There is no `score` field anywhere in the database.

## 8. Frontend discipline

**Rule 8.1.** UI strings come verbatim from `PRD.md` §7. Never invent copy inline. Missing string? Add it to `PRD.md` §7 first, then use it.
**Rule 8.2.** Design tokens come from `Design.md` Sheet 1 (the `tailwind.config.js` contract). No new colors, radii, or shadows inline; no `text-indigo-600`.
**Rule 8.3.** Every component ships with its `Design.md` Sheet 3 spec satisfied — including its empty and loading states. A blank panel is a build defect.
**Rule 8.4.** Mobile-first: every screen passes 375 px with zero page-level horizontal scroll before any desktop styling is written.

## 9. Verification (Part I §4, made DriveDeck-specific)

`Architecture.md` Sheet 9 is the standing commissioning test. In addition:

**Rule 9.1.** Before merging anything that touches `src/`, run the No-Mock-Data checklist (`Design.md` Sheet 5.4).
**Rule 9.2.** Before merging anything that touches data, re-run the two console probes: a client write to `drives` (must be `PERMISSION_DENIED`) and an `activities` write without a URL (must be `PERMISSION_DENIED`).
**Rule 9.3.** A UI change is verified at 375 px and on the production URL — not just localhost.

## 10. Documentation sync

**Rule 10.1.** Any change to scope, stack, rules, tokens, or components bumps the revision on all three documents (`PRD.md`, `Architecture.md`, `Design.md`) in the same commit. Code and docs drift together or not at all.
**Rule 10.2.** This file changes only by the same standard it holds others to: surgical changes, with the reason stated. Part I never changes except to track the upstream repo.

---

## Appendix — How to know these rules are working

From the source repo, adapted to this project:

| Signal (Part I) | DriveDeck-specific signal (Part II) |
|---|---|
| Fewer unnecessary changes in diffs | Diffs touch only the files the task named |
| Fewer rewrites due to overcomplication | Components match their Sheet 3 spec the first time |
| Clarifying questions come before implementation | Conflicts between docs are named, not silently resolved |
| Clean, minimal PRs | Zero mock-data identifiers in `src/`; every merged screen passes 375 px |

**The one-line test for any contribution:** *Would a senior engineer reviewing this diff find a single line that traces to nothing?* If yes, the contribution is not ready — cut it, per Part I §3.
