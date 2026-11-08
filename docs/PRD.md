# DriveDeck — Product Requirements Document (PRD)

| | |
|---|---|
| **Product** | DriveDeck — a verified placement-prep tracker with an auto-built live portfolio |
| **Tagline** | **From 3rd year to offer letter.** |
| **Builder** | Solo |
| **Built for** | JioCoder Hackathon 2026 · submissions close **Dec 1, 2026, 11:59 PM IST** · judging Dec 2–5 · results Dec 6 |
| **Stack** | React 18 + Vite + Tailwind CSS · Firebase Auth + Firestore · Cloudflare Pages |
| **Version** | v1.1 — build-ready. v1.1 adds: Google-only auth, GitHub/LinkedIn profile URLs (§10), public Resources page (§11). Screens, strings, rules and queries below are final unless marked "decision at build time". |

**What is in this PRD:** 0. TL;DR · 1. Problem · 2. Persona (Kiran) · 3. Name, tagline & page tags · 4. Scope · 5. The three USPs · 6. Feature build plans · 7. UI copy deck · 8. Design system & responsiveness · 9. Database (Firestore) · 10. Auth · 11. Deployment (Cloudflare Pages) · 12. Seed data plan · 13. Readiness Score spec · 14. Out of scope · 15. Definition of done · Appendices A–B.

---

## 0. TL;DR

Indian engineering students enter placement season in the 3rd year armed with four broken tools: a TPO portal that hides deadlines behind a login, WhatsApp forwards with wrong dates, an Excel or Notion tracker they abandon within two weeks, and a resume that is always months out of date.

**DriveDeck replaces all four with one mobile-first dashboard:**

1. **Placement drives with verified dates** — every drive row carries the official source link and the date we last checked it. Unverified rows are stamped TENTATIVE and never shown as fact.
2. **A pipeline board** — every application dragged from Saved to Offer, so a student always knows exactly where they stand.
3. **A live portfolio that builds itself** — the student logs real work once, with its link as evidence; DriveDeck compiles those entries into a public page (`/u/kiran`) that never goes stale.

A transparent **Readiness Score (0–100)** sits on top, showing students — and recruiters — exactly how placement-ready the evidence says they are.

The entire product runs with **zero backend code**: Firestore security rules are the backend, and the app is a static SPA on Cloudflare Pages. Total infrastructure cost: **₹0**.

### How this maps to the judging rubric

| Rubric block | Weight | Where DriveDeck earns it |
|---|---|---|
| Real problem & usefulness | 30 | Four documented daily pains (§1), each killed by a named, shipped feature (§6) |
| Working implementation | 25 | Six working screens, seeded verified data, a public portfolio that works logged-out (§6, §12) |
| Originality & insight | 20 | The 3 USPs (§5): verification as a data model, evidence enforced in security rules, an auditable score |
| UX | 15 | Mobile-first design system, one-thumb flows, tested at 375 px (§7, §8) |
| Presentation | 10 | Demo lands on the portfolio page — the "wow" screen; live link stays up until results (§11, §15) |

---

## 1. The problem

### 1.1 What placement prep actually looks like in the 3rd year

When placement season opens, information arrives through the worst possible channel: **forwarded WhatsApp messages**. "TCS registration closes tomorrow!!" — sent with no link, sometimes true, often a year old. Students register for drives that closed, or miss ones that did not. The TPO portal holds the real dates, but behind a login, updated whenever the coordinator gets to it, with no history of what changed and no way to tell a stale listing from a live one.

Meanwhile, **prep itself is invisible**. A student puts in 2 hours a day between classes — DSA sets, SQL practice, a Coursera module — and none of it is visible anywhere. Effort without visible progress dies; that is exactly why every Excel and Notion tracker students build for themselves is abandoned within a fortnight. We know because that tracker *was* this product's first avatar.

The **resume is a document written once** — usually rushed before a submission deadline — and never touched again. Two months later it does not contain the project they just shipped, the certificate they just earned, or the contest rank they just got. Recruiters see a stale PDF; the student has no live, linkable proof of work.

And underneath all of it sits **role confusion**: analyst, SDE, QA, data engineer? Nobody tells students which roles they are actually eligible for. Eligibility criteria are scattered across drive PDFs, and students discover "CGPA below 6.0" only after registering. Direction — not effort — is the real bottleneck.

### 1.2 Why existing tools fail

| Tool students use today | What it does | The gap DriveDeck fills |
|---|---|---|
| TPO portals (Superset, TCS iON) | College posts drives; students apply | Login-walled, college-controlled, no public verification, no personal pipeline view; dates change silently |
| PrepInsta / Unstop | Placement content, some drive listings | Aggregates but shows no per-row source link and no "last verified" stamp; zero connection to the student's own progress |
| Excel / Notion trackers | Self-made application lists | Purely manual; no drive data, no verification, no portfolio output; abandoned in ~2 weeks |
| WhatsApp groups | Forwarded drive messages | Unverified, unstructured, duplicated, no history — the #1 source of wrong-deadline pain |
| LinkedIn | Profile + networking | Feed-first social network; a portfolio must be built manually and goes stale; "profile strength" is opaque marketing, not evidence |

### 1.3 Why this scores "Real problem & usefulness" (30 pts)

- The four pains above are first-hand (this builder's own 3rd-year experience) and were cross-checked against public student posts on Reddit, X and LinkedIn — the same four complaints recur: missed deadlines, fake forwards, invisible progress, stale resume.
- Every pain maps to a shipped MVP feature, not a roadmap promise — the mapping table is in §6.
- Usefulness is **testable in one tap on the live link**: open a drive, tap "View official page", the company's own page opens. A judge can audit us in under 30 seconds.

---

## 2. Our user: Kiran

One persona, deliberately. A product for "all students" is a product for no one; every design decision below is judged against this one person.

| Snapshot | |
|---|---|
| Name | Kiran |
| Age / Year | 20 · 3rd year, Computer Engineering (CSE) |
| College | Tier-2 engineering college (autonomous, affiliated to a state university) |
| Academics | 10th: 89% · 12th: 84% · CGPA: 7.8 · Backlogs: 0 |
| Target role | **Data Analyst** (also watches SDE posts, still undecided) |
| Prep | ~90 min/day: SQL, Python, Power BI, easy–medium DSA |
| Tools | Android phone (Jio data + college Wi-Fi), WhatsApp, Instagram, Coursera, LeetCode, GitHub (2 repos) |
| Money | Zero budget — free tiers only |

**Goals**

1. Land a Data Analyst offer (or a strong internship-to-offer pipeline) before final year begins.
2. Build visible proof: SQL + Power BI projects, a data-analytics certificate, consistent DSA.
3. Stop missing off-campus registration windows.
4. Have something credible to show recruiters and seniors when asking for referrals.

**Frustrations → what kills them in DriveDeck**

| Kiran's frustration | Killed by |
|---|---|
| "I don't know which role to actually target" | Profile-based eligibility: the **"Match me"** filter shows which upcoming drives Kiran genuinely fits (F3) |
| "Deadlines arrive as WhatsApp forwards, often wrong" | Every drive row shows its source and last-verified stamp (F3 — USP 1) |
| "Prep feels lonely; I can't see progress" | Streak + Readiness Score + a shareable live portfolio — progress you can send to a friend or mentor (F2, F5) |
| "My resume is always 4 months stale" | The portfolio builds itself from evidence logs — log once, published everywhere (F5 — USP 2) |
| "My applications live in five different apps" | One pipeline board: Saved → Offer (F4) |

**A day with DriveDeck (design north star).** Kiran checks the phone between lectures. Home shows a 6-day streak, a 56/100 readiness ring, and "TCS NQT closes in 6d" in amber. One tap opens the drive: the eligibility table says "You match", the rounds breakdown explains the test pattern, and the source link goes to tcs.com — so Kiran trusts it without asking the group. After dinner, 45 minutes of SQL practice gets logged with the GitHub link; the streak ticks to 7, the score ticks up, and the portfolio page — the same URL Kiran emailed a senior last week — updates itself. No spreadsheet, no forwards, no stale PDF.

---

## 3. Name, tagline and page tags

**Name — DriveDeck.** "Drives" (placement drives) + "Deck" (a deck you control: your board, your cards, your hand). Short, memorable, clean as a subdomain (`drivedeck.pages.dev`), and presentable as a project title in the submission form. Portfolio mockups from the planning session use this name; the demo user is **Kiran** (an earlier mockup shows "Rahul Sharma" — replace with Kiran when building).

**Tagline — "From 3rd year to offer letter."** Chosen in the planning session (the journey framing): it names the audience (3rd year, not final-year panic), the destination (offer letter), and positions the product as the single vehicle for the whole run.

**Support line (sub-heading under the tagline):** "Every drive with a verified date. Your prep, scored. Your portfolio, built automatically."

**Page tags (copy-paste into `index.html`)** — this block settles "which text tag suits a mobile-responsive web app": the `viewport` tag is the mobile-responsive contract (everything else adapts because of it; Vite ships it by default — never delete it), `title` / `description` are what Google and judges' browsers display, and the Open Graph tags make portfolio links preview correctly in WhatsApp — the channel students actually share on.

```html
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>DriveDeck — From 3rd year to offer letter</title>
<meta name="description" content="Verified placement deadlines, one pipeline board, and a portfolio that builds itself from your real work. Free for Indian engineering students." />
<meta name="theme-color" content="#4F46E5" />
<meta property="og:title" content="DriveDeck — From 3rd year to offer letter" />
<meta property="og:description" content="Every drive with a verified date. Your prep, scored. Your portfolio, built automatically." />
<meta property="og:type" content="website" />
<link rel="icon" href="/favicon.svg" />
```

---

## 4. Scope: what we build, and what we refuse

**The product is 3 USPs + 4 MVP features + 2 support screens. Nothing else.**

| Layer | Items |
|---|---|
| USPs (why judges remember us) | 1. Verified Drive Tracker · 2. Evidence-linked auto-Portfolio · 3. Transparent Readiness Score |
| MVP features (what users touch) | F2 Dashboard · F3 Verified Drives · F4 Pipeline Board · F5 Growth → Portfolio |
| Support screens (how people arrive) | F0 Landing · F1 Onboarding |

**The scope rule:** *if a feature needs a server, a cron job, a file store, or a sixth library, it is out of MVP.* This rule exists because of three hard constraints — one builder, ~3 weeks of part-time time, free tiers only. Half-built features score zero on "working implementation"; four deep features beat eight shallow ones on both implementation (25) and UX (15).

Every feature in §6 carries its own "why this survived the cut" note, and §14 lists what was cut with reasons — so the demo can answer "why didn't you build X?" in one line.

---
## 5. The three USPs — and why each one is a USP

A USP is not "a feature we like". Each one below passes a three-part test:

1. **No incumbent ships it** (checked against the competitors in §1.2),
2. **It is structural, not cosmetic** — it lives in the data model and security rules, so a weekend clone can copy the UI but not the discipline,
3. **A judge can verify it live in under 30 seconds** on the submitted link.

---

### USP 1 — Verified Drive Tracker: dates you can defend

**What the judge sees.** Open Drives. Every row carries a stamp: green "CONFIRMED · source: tcs.com · checked Nov 8, 2026", or an honest amber "TENTATIVE — date unconfirmed". Tap "View official page" and the company's own careers page opens. No row exists without a source.

**Why this is a USP.**
- **Nobody in the student space does per-row verification.** TPO portals are login-walled and college-controlled; PrepInsta and Unstop aggregate but never show a source link or a verified-at stamp per row; WhatsApp forwards are the status quo we replace. The comparison table in §1.2 shows none of them offer this.
- **It is structural.** Verification is three fields (`sourceUrl`, `status`, `verifiedAt`) enforced by the schema, plus security rules that make client-side writes to `drives` impossible (§9.4). Verification here is not a moderation promise — it is built into the data model: a drive cannot even exist without a source.
- **It is honest under audit.** Tap the source; the official page either backs our date or the USP collapses. Building a feature that invites audit is the "insight" the originality block (20 pts) rewards.
- **Duplicates are structurally impossible.** Document IDs are deterministic — `tcs_nqt_2027` exists exactly once (§9.3). A repost merges into the same document instead of appearing as a fake new drive. That is a data-model insight, not a UI trick.

**How it is built.** `drives` seeded only via the Admin SDK seed script (§12); TENTATIVE/CONFIRMED status enum; `verifiedAt` refreshed on every re-seed; a client-side `.ics` download for deadlines (a Blob, ~40 lines in `src/lib/ics.ts` — no email infrastructure).

---

### USP 2 — The evidence-linked portfolio that builds itself: the live resume

**What the judge sees.** Open `/u/kiran` in a logged-out browser. A public portfolio loads: projects with GitHub and Live buttons, certifications with credential links, DSA consistency, a growth timeline, and the Readiness Score — with one badge doing the talking: **"Every item evidence-linked."**

**Why this is a USP.**
- **It attacks the stale-resume pain automatically.** Portfolios on LinkedIn, Carrd or GitHub Pages are built manually and die of neglect. DriveDeck's portfolio compiles itself from an evidence log the student keeps anyway (they want the streak and the score). Zero extra work is the only reason a student tool survives contact with a real student.
- **The Evidence Rule is enforced by the database, not by promises.** An activity without a working `https://` link is rejected in the UI *and* in Firestore security rules (§9.4). "Every item evidence-linked" is therefore a guarantee, not a style — trust enforced at the schema level is the structural differentiator.
- **It reframes the product.** "Placement tracker" is a crowded category; "a live resume that builds itself from verified work" is a story judges repeat. This is the screen the demo ends on.

**How it is built.** `activities` collection (url required, regex-checked in rules); the portfolio page is a read-only render of `activities` grouped by type + the `users/{uid}` profile; the `usernames/{slug}` registry guarantees `/u/yourname` is unique and immutable; share via Web Share API / copy-link.

---

### USP 3 — A Readiness Score you can audit

**What the judge sees.** A 64/100 ring on the dashboard and on the portfolio header. Tap "How this is calculated": the printed formula with live inputs — "2 projects × 15 = 30, 1 certificate × 10 = 10, … total 56".

**Why this is a USP.**
- **Every existing "strength" meter is opaque.** LinkedIn's "profile strength" and resume-scoring tools are marketing numbers with no published formula. Printing the formula turns a gimmick into an instrument students can act on ("log one more project = +15").
- **It cannot be inflated without real work.** The score is computed purely from evidence-linked activities (USP 2 feeds USP 3). There is no server, no ML, nothing to game except doing actual prep.
- **It gives the demo a number.** "Kiran went from 22 to 56 in a month" is a memorable line for the pitch (Presentation, 10 pts).

**How it is built.** A pure TypeScript function (`src/lib/scoring.ts`) over the activity list + streak; exact formula, caps and edge cases in §13; rendered as a hand-rolled SVG ring (no chart library).

---
## 6. Feature build plans

Six surfaces ship in MVP. Four are the product (F2–F5); two get people in the door (F0–F1). Every plan below ends with **acceptance criteria** (the build is done when every box ticks) and **why this survived the cut**.

Naming convention used everywhere in the UI: **Drives** (not "opportunities"), **Board** (not "pipeline"), **Evidence** (not "activities" — the database keeps the technical name `activities`). Speak student, not enterprise.

---

### F0 — Landing

**Goal.** Convert a visitor into a signup within 10 seconds, and set the tone: honest, verified, student-first.

**Screens & layout.** Single page, no scroll depth beyond two screens.
- Desktop: top nav (logo "DriveDeck", links "Features", "How it works", button "Get started"), centered hero (tagline as H1, support line, two CTAs), row of 3 feature cards, footer.
- Mobile (default design target): everything stacked, full-width CTAs, cards single-column.

**Behavior.**
- "Start free — 2 min" opens the Google sign-in popup → new user goes to `/onboarding`, existing user to `/dashboard`.
- "See a live portfolio" links to `/u/kiran` (the seeded demo account, §12.5) — proof before signup.
- If an already-signed-in user lands on `/`, redirect to `/dashboard`.

**Resources.** Static React component; Tailwind; lucide-react icons; no data fetching.

**Acceptance criteria.**
- [ ] Hero + 3 cards render at 375 px with zero horizontal scroll.
- [ ] "See a live portfolio" opens `/u/kiran` logged-out and it fully renders.
- [ ] "Start free" completes Google sign-in and lands on the correct next screen.
- [ ] Logged-in visitor on `/` is redirected to `/dashboard`.
- [ ] Lighthouse mobile Performance ≥ 90 on this page.

**Why this survived the cut.** Presentation (10 pts) begins before login; the tagline and the one-tap demo portfolio do the pitch. Without a landing, judges' first impression is a login wall — the most expensive mistake a hackathon app can make.

---

### F1 — Onboarding (3 steps)

**Goal.** From zero to a *useful* account in under 2 minutes: a profile the eligibility engine can use, and a portfolio slug the student chose.

**Screens & layout.** One card, centered, progress "Step N of 3".

1. **Your profile** — name (prefilled from Google), college, branch (dropdown from fixed codes: CSE, IT, ECE, EEE, MECH, CIVIL, OTHER — fixed codes eliminate "CSE" vs "Computer Science" matching bugs later), year (auto-set to 3rd), target role (chip select: Data Analyst, SDE, QA, Data Engineer, Other), and the four eligibility numbers: 10th %, 12th %, CGPA, backlogs.
2. **Your portfolio address** — slug input with live availability check against `usernames/{slug}`: prefix text shows `drivedeck.pages.dev/u/`. Validation: `^[a-z0-9_]{3,20}$`, lowercase only. Reserved slugs rejected: `u`, `login`, `admin`, `api`, `kiran`, `drivedeck`.
3. **Starter checklist** — three suggested first actions ("Save your first drive", "Log one piece of evidence", "Share your portfolio link"); button "Go to dashboard" always available.

**Behavior & edge cases.**
- All step-1 fields are required and validated; the eligibility engine is only as good as these numbers, so no skipping.
- Slug taken → inline message (exact string in §7) and the "Continue" button stays disabled; slug creation itself uses `.create()`, which fails if taken (§9.3) — the second line of defence.
- Back navigation preserves entered data; refresh mid-onboarding returns to the unfinished step.
- Finishing writes: `users/{uid}` + `usernames/{slug}` (two writes, one batch).

**Resources.** `firebase/firestore` (doc, setDoc, runTransaction or batch), react-router-dom.

**Acceptance criteria.**
- [ ] Cannot reach the dashboard without a complete profile and a claimed slug.
- [ ] Taking a slug twice is impossible — attempt shows the inline "taken" message (client check) and would still fail server-side (`.create()`).
- [ ] Reserved slugs (`kiran`, `admin`, …) are rejected with the inline message.
- [ ] `users/{uid}` contains all eligibility numbers exactly as entered, and `usernames/{slug}.uid` equals the signed-in uid.
- [ ] Whole flow takes under 2 minutes with prefilled name and sensible defaults.

**Why this survived the cut.** The eligibility engine (USP 1's payoff) and the portfolio URL (USP 2) both depend on this data. It is also the only form in the app — investing polish here lifts perceived UX across the whole product.

---

### F2 — Dashboard (Home)

**Goal.** Answer, in five seconds on a phone: *How ready am I, what's urgent, what should I do next?*

**Screens & layout.** Mobile: single column — greeting, score ring, deadline chips, "Today's focus" cards. Desktop (lg): 12-column grid — score + streak left, deadlines and focus right.

1. **Greeting** — "Hi Kiran" + today's date.
2. **Readiness ring** — SVG ScoreRing (stroke-dasharray on a circle, animated on load): big number, "/100", link "How this is calculated" (opens a bottom sheet / modal with the printed formula and Kiran's live inputs, §13).
3. **Streak chip** — flame icon + "6-day streak".
4. **Next deadlines** — up to 3 CountdownChips from drives with upcoming `regDeadline`, sorted soonest-first: "TCS NQT closes in 6d". Color by proximity: > 7 days slate, ≤ 7 days amber, ≤ 3 days red. TENTATIVE drives get the amber-dot prefix regardless.
5. **Today's focus** — max 3 suggestion cards, derived by rules, in this priority:
   - Latest DSA evidence older than yesterday → "Log today's practice set — keep the 6-day streak."
   - Nearest CONFIRMED drive within 10 days that has no application → "TCS NQT closes in 6d — read the rounds breakdown."
   - Zero PROJECT activities → "Your portfolio has no projects yet — one is worth 15 points."
   - Nothing triggers → "You're on top of everything — browse drives."
6. **Eligibility watch** — one strip: "2 upcoming drives match your profile" → taps through to Drives with the "Match me" filter pre-applied.

**Behavior & edge cases.**
- New account (no activities, no applications): ring shows 0, focus falls back to the project suggestion, deadlines strip still works from seeded drives.
- No upcoming drives at all: deadlines block shows its empty state (§7), not a blank area.
- Score derivation is client-side and instant on every activities change — never a loading spinner on the ring after first paint.
- All dashboard reads in one parallel load (`users`, `drives`, `applications`, `activities`) — ~26 reads per visit, comfortably inside Firestore's free tier (§9.6).

**Resources.** `ScoreRing`, `CountdownChip`, `FocusCard`, `EmptyState` components; `src/lib/scoring.ts` (§13); one composite query on drives (§9.5).

**Acceptance criteria.**
- [ ] Score shown equals a hand-computed value from the §13 formula for the same activity list (spot-checked).
- [ ] Chip color follows the proximity rules (7-day amber boundary verified with a drive 7 days out).
- [ ] Adding an activity from Growth updates score and streak on next dashboard visit without manual refresh logic beyond the standard listener.
- [ ] Every block has a designed empty state — no blank panels at any account age.
- [ ] Ring animates once on load; no layout shift (CLS ≈ 0).

**Why this survived the cut.** This is the anti-"invisible progress" screen — the persona's loneliness/progress pain is killed right here (streak + ring + focus). UX (15 pts) is judged largely on this first screen after login, and it is the daily-return hook that makes the portfolio (USP 2) keep growing.

---

### F3 — Verified Drives (list + detail)

**Goal.** The trusted replacement for WhatsApp forwards: every drive, its real deadline, whether Kiran qualifies, and the source to prove it.

**Screens & layout.**
- **List**: filter bar (chips: "All", "Match me", "On campus", "Off campus") + search box; drive cards as rows/cards with: company initials-avatar, "TCS · NQT 2027", role, batch, deadline CountdownChip, and status/eligibility badges (green "You match", red "CGPA below 6.0", amber "TENTATIVE — date unconfirmed").
- **Detail**: full header (company, program, role, type ON/OFF, batch), eligibility table with per-criterion pass/fail (10th, 12th, CGPA, backlogs, branch — "need 6.0 · you have 7.8"), rounds info (static text from the source), salary and openings as stated by the source, stamp line "CONFIRMED · source: tcs.com · checked Nov 8, 2026", buttons: "View official page" (external), "Save to board", "Add to calendar (.ics)".

**Behavior & edge cases.**
- "Match me" filters drives client-side via `checkEligibility(profile, drive)` in `src/lib/eligibility.ts` — pure function returning `{ match, checks[] }`.
- Incomplete profile numbers → instead of a false negative, eligibility block shows "Add your CGPA to check" with a link to settings/onboarding edit.
- Expired drive (`regDeadline` past): chip switches to "Closed", card stays (history value), sorts to bottom, excluded from Match me.
- TENTATIVE rows are never silently mixed with CONFIRMED: amber dot + stamp line makes status visible at every size.
- "Save to board" creates `applications/{uid}_{driveId}` with status SAVED (deterministic ID — tapping twice cannot duplicate, §9.3).
- ".ics" generates a calendar file client-side (Blob download) with the registration deadline (and test date if present) — imports into Google Calendar/phone calendar; no email/reminder infrastructure.

**Resources.** `EligibilityBadge`, `CountdownChip`, `DriveCard`, `EmptyState`; `src/lib/eligibility.ts`, `src/lib/ics.ts`; one ordered query on drives (§9.5).

**Acceptance criteria.**
- [ ] Every drive card and detail shows the source stamp; "View official page" opens the exact `sourceUrl` in a new tab (`rel="noopener"`).
- [ ] Eligibility table shows pass/fail per criterion with "need X · you have Y" — verified against three test profiles (matching, below-CGPA, wrong-branch).
- [ ] "Match me" excludes drives failing any criterion and excludes closed drives.
- [ ] Saving the same drive twice results in exactly one application document.
- [ ] `.ics` file downloads and imports correctly into Google Calendar.
- [ ] List + detail fully usable at 375 px; the eligibility table becomes a stacked list on mobile, not a squeezed table.

**Why this survived the cut.** This is USP 1's home and the product's answer to the loudest pain (wrong deadlines). It is also where "Real problem & usefulness" (30 pts) is demonstrated live, since anyone can tap the source and audit us.

---

### F4 — Pipeline Board (Kanban)

**Goal.** One honest look at "where do I stand": every application as a card, drag it forward as reality advances.

**Screens & layout.** Six columns: **Saved · Applied · Test/OA · Interview · Offer · Rejected**. Card: company initials-avatar, program name, role, and a "days in this stage" chip ("4d here"). Mobile: columns are horizontal snap-scroll panels (full-height drag between them); desktop: six equal columns in a row.

**Behavior & edge cases.**
- Drag-and-drop with `@dnd-kit/core` (pointer + touch sensors). Drop updates `status`, appends `{status, at}` to the `history` array, bumps `updatedAt` — optimistic UI, no spinners.
- Dragging into the same column = no-op (no write).
- Dropping into **Offer** fires a one-shot CSS confetti burst (hand-rolled keyframes, no library) + toast "Offer! Congratulations".
- Offer/Rejected columns are terminal but not deleted — moving back out is allowed (rejections do get reversed in real life); each move appends history, so the full journey is preserved and inspectable in Firestore.
- Card menu: "Remove" (confirm dialog → delete doc).
- Cards are created only from F3 ("Save to board") — the board is a projection of real drives, keeping data honest; a manual "add anything" entry was deliberately cut (§14).

**Resources.** `@dnd-kit/core`; `KanbanBoard`, `Column`, `ApplicationCard` components; one ordered query on applications (§9.5).

**Acceptance criteria.**
- [ ] Drag works on touch (real phone) and mouse; keyboard-accessible alternative (select card → move buttons) available.
- [ ] A drag to Interview updates Firestore `status`, `updatedAt`, and appends to `history`; refresh keeps the position.
- [ ] Offer drop fires confetti exactly once per entry into the column.
- [ ] Six columns render at 375 px via horizontal snap-scroll without breaking page-level "no horizontal scroll" (scroll is contained inside the board).
- [ ] Board loads with seeded applications across all six columns (§12.5).

**Why this survived the cut.** The "scattered applications" pain becomes a tangible, satisfying interaction — the strongest *working implementation* (25 pts) evidence in the app, and the drag-to-Offer moment is the demo's emotional beat.

---

### F5 — Growth → Portfolio (evidence log + public page)

**Goal.** USP 2 end-to-end: log evidence once → a public live portfolio updates itself.

**Screens & layout.**
- **Growth (logged-in)**: reverse-chronological list of the student's activities grouped by month, each row showing type icon, title, summary, tags, and a "Linked" check. Floating action button "Add evidence" opens a bottom sheet (mobile) / modal (desktop):
  - Type chips: Project / Certificate / Course / DSA / Achievement.
  - Title (required), one-line summary (≤ 140 chars), **Link (required)**, tags (≤ 3), date (defaults today).
  - Link helper text under the field: "GitHub, live site or credential URL — the link is the proof." Invalid/empty → save disabled with the error string in §7.
  - Portfolio preview toggle: "View public page" → `/u/{slug}`.
- **Portfolio `/u/:slug` (public, no auth)**: header (name, "Aspiring Data Analyst · 3rd year, CSE", college, readiness ring + "How this is calculated", badge "Every item evidence-linked"), then sections built only from activities present: Projects / Certifications & courses / DSA consistency (count + current streak) / Achievements / Growth timeline (12-month bar strip of activity counts, pure CSS). Each item card: title, summary, tags, and its link buttons ("GitHub", "Live", "Credential" — button label auto-picked from the URL host). Footer: "Live portfolio by DriveDeck — build yours free" (link to landing).

**Behavior & edge cases.**
- The Evidence Rule is enforced twice: UI disables save without a valid `http(s)` URL, and Firestore rules reject such writes regardless (§9.4).
- Share: Web Share API on mobile (falls back to copy-link + toast "Portfolio link copied").
- Slug not found → designed 404: "This portfolio doesn't exist (yet)." + button "Claim your own" → landing.
- Empty portfolio (0 activities): still renders header + "Kiran hasn't logged evidence yet." — never a broken page.
- Portfolio reads: `usernames/{slug}` → `users/{uid}` → `activities` where `uid == X` ordered by `date desc` (~4 reads; §9.6).

**Resources.** `ActivityModal`, `ActivityRow`, `TimelineStrip`, `PortfolioHeader`, `EmptyState`; two composite indexes (§9.5).

**Acceptance criteria.**
- [ ] Saving evidence without a valid link is impossible in the UI, and a forced API write without a link is rejected by security rules (tested from console).
- [ ] Adding an activity makes it appear on the public portfolio on refresh — portfolio is 100% data-driven (no hardcoded items).
- [ ] `/u/kiran` renders fully logged-out in a fresh incognito browser.
- [ ] Unknown slug shows the designed 404, not a blank page.
- [ ] Link button label matches the URL (github.com → "GitHub"; vercel.app/netlify.app → "Live"; else "Credential").
- [ ] Growth list and portfolio render correctly at 375 px.

**Why this survived the cut.** This is the pivot's payoff — the product is a *live resume platform*, not just a tracker. It scores on originality (evidence enforced at DB level), usefulness (stale-resume pain), and it is the screen the demo ends on (presentation).

---
## 7. UI copy deck (exact strings)

Copy principles: plain student language; numbers over adjectives; honesty in every status string (TENTATIVE says so); error messages always say what to do next. No exclamation-mark spam, no emojis in the UI.

### Brand & pages

| Location | Element | Exact string |
|---|---|---|
| Browser tab | Title | DriveDeck — From 3rd year to offer letter |
| SEO / judges | Meta description | Verified placement deadlines, one pipeline board, and a portfolio that builds itself from your real work. Free for Indian engineering students. |
| Landing | H1 | From 3rd year to offer letter. |
| Landing | Support line | Every drive with a verified date. Your prep, scored. Your portfolio, built automatically. |
| Landing | Primary CTA | Start free — 2 min |
| Landing | Secondary CTA | See a live portfolio |
| Landing | Nav links | Features · How it works · Get started |
| Landing | Card 1 title / body | Deadlines you can trust / Every drive shows its source link and the date we last checked it. No forwards, no fake dates. |
| Landing | Card 2 title / body | One board for your pipeline / Drag every application from Saved to Offer. See exactly where you stand. |
| Landing | Card 3 title / body | Your portfolio builds itself / Log a project or certificate with its link once — your live portfolio updates on its own. |
| Landing | Trust strip | Verified deadlines · No spam · Free for students |
| Footer | Line | Built for JioCoder Hackathon 2026 |

### Navigation

| Location | Element | Exact string |
|---|---|---|
| Desktop sidebar | Items (top to bottom) | Home · Drives · Board · Portfolio |
| Mobile bottom nav | 4 items (icon + label) | Home · Drives · Board · Portfolio |
| Portfolio nav item | Opens | The student's own `/u/{slug}` |

### Onboarding

| Location | Element | Exact string |
|---|---|---|
| Step headers | 1 / 2 / 3 | Your profile · Your portfolio address · Starter checklist |
| Slug field | Helper | Your portfolio will live at drivedeck.pages.dev/u/ … |
| Slug field | Available | Nice — {slug} is available. |
| Slug field | Taken | {slug} is taken — try {slug}_26 or add your batch year. |
| Slug field | Invalid | Use 3–20 lowercase letters, numbers or underscores. |
| Starter list | Items | Save your first drive · Log one piece of evidence · Share your portfolio link |
| Finish | Button | Go to dashboard |

### Dashboard

| Location | Element | Exact string |
|---|---|---|
| Greeting | H2 | Hi {firstName} |
| Ring | Label + link | Readiness · How this is calculated |
| Streak | Chip | {n}-day streak |
| Deadline chip | Pattern | {Company} {Program} closes in {n}d |
| Deadline chip | Today | {Company} {Program} closes today |
| Focus card 1 | Body | Log today's practice set — keep the {n}-day streak. |
| Focus card 2 | Body | {Company} {Program} closes in {n}d — read the rounds breakdown. |
| Focus card 3 | Body | Your portfolio has no projects yet — one is worth 15 points. |
| Focus fallback | Body | You're on top of everything — browse drives. |
| Eligibility watch | Strip | {n} upcoming drives match your profile |
| Formula sheet | Title | How your Readiness Score is calculated |
| Formula sheet | Footnote | Computed from your evidence log only. Nothing here can be edited by hand. |

### Drives

| Location | Element | Exact string |
|---|---|---|
| Filters | Chips | All · Match me · On campus · Off campus |
| Stamp | Confirmed | CONFIRMED · source: {domain} · checked {date} |
| Stamp | Tentative | TENTATIVE — date unconfirmed · source: {domain} |
| Badge | Eligible | You match |
| Badge | Not eligible | {Criterion} below {value} (e.g. CGPA below 6.0) |
| Badge | Unknown | Add your CGPA to check |
| Chip | Expired | Closed |
| Detail | Eligibility row | {Label}: need {x} · you have {y} |
| Detail | Buttons | View official page · Save to board · Add to calendar (.ics) |
| Detail | Rounds header | Selection rounds |
| Empty state | Body | No drives match these filters yet. Try All drives. |
| Toast | After save | Saved to your board |

### Board (pipeline)

| Location | Element | Exact string |
|---|---|---|
| Column headers | Six | Saved · Applied · Test/OA · Interview · Offer · Rejected |
| Empty column | Hint | Drop here once you've applied. |
| Card chip | Age | {n}d here |
| Toast | Move | Moved to {Stage} |
| Toast | Offer | Offer! Congratulations |
| Card menu | Action + confirm | Remove · Remove this application? Its history will be deleted. |
| Empty board | Body | Save a drive and it will appear here as a card. |

### Growth & evidence modal

| Location | Element | Exact string |
|---|---|---|
| FAB | Label | Add evidence |
| Modal | Title | Log evidence |
| Modal | Type chips | Project · Certificate · Course · DSA · Achievement |
| Modal | Link helper | GitHub, live site or credential URL — the link is the proof. |
| Modal | Link error | A link is required — that's the evidence rule. |
| Modal | Summary counter | {n}/140 |
| List | Row badge | Linked |
| Preview | Button | View public page |
| Empty state | Body | No evidence yet. Your first project is worth 15 points. |

### Portfolio `/u/:slug`

| Location | Element | Exact string |
|---|---|---|
| Badge | Header | Every item evidence-linked |
| Sub-line | Under name | {Target role} · {year}th year, {branch} |
| Sections | Titles | Projects · Certifications & courses · DSA consistency · Achievements · Growth timeline |
| DSA block | Line | {n} practice sets logged · {n}-day streak |
| Share | Button | Share portfolio |
| 404 | Title / body / CTA | This portfolio doesn't exist (yet). / Slugs are unique — maybe the letter O is a zero. / Claim your own |
| Empty portfolio | Body | {Name} hasn't logged evidence yet. |
| Footer | Line | Live portfolio by DriveDeck — build yours free |

### Toasts & system

| Location | Element | Exact string |
|---|---|---|
| Global | Copied link | Portfolio link copied |
| Global | Evidence saved | Evidence saved — portfolio updated |
| Global | Network error | You're offline — changes will retry when you're back |
| Auth | Signed out | Signed out |

---

## 8. Design system & mobile responsiveness

UI/UX is 15 points on the rubric and the first thing a judge feels. The system below is small on purpose: few tokens, used relentlessly, look designed; many tokens look accidental.

### 8.1 Color tokens

| Token | Hex | Used for |
|---|---|---|
| `primary` | #4F46E5 (indigo) | Brand, primary buttons, active nav, score ring |
| `primary-dark` | #4338CA | Hover / pressed states |
| `bg` | #F8FAFC (slate-50) | App background |
| `surface` | #FFFFFF | Cards, sheets, modals |
| `text` | #0F172A (slate-900) | Primary text |
| `text-secondary` | #64748B (slate-500) | Secondary text, captions |
| `border` | #E2E8F0 (slate-200) | Card borders, dividers, inputs |
| `success` | #10B981 | CONFIRMED stamps, "You match", linked checks, Offer |
| `warning` | #F59E0B | TENTATIVE stamps, ≤ 7-day deadlines |
| `danger` | #EF4444 | ≤ 3-day deadlines, failed eligibility, Rejected |

Every TextRun of UI text on colored surfaces (stamps, badges) sets its own explicit color — dark text on amber/red/green tints, white on indigo.

### 8.2 Typography

- **Family:** Plus Jakarta Sans (Google Fonts, weights 400/500/600/700), fallback `system-ui, sans-serif`. Rounded, friendly, still professional — right for a student product.
- **Scale:** Display (H1) 32/38 mobile · 40/48 desktop; H2 24/30; H3 18/24; Body 15/22; Caption 13/18. Headings 600–700, body 400–500.

### 8.3 Shape, spacing, icons

- Radius: cards `rounded-xl` (12 px), inputs/buttons `rounded-lg` (8 px), chips/badges full-round.
- Spacing: 4-pt grid; card padding 16 px mobile / 20 px desktop; section gap 24 px.
- Shadows: `0 1px 2px rgba(15,23,42,0.06)` for cards; `0 8px 24px rgba(79,70,229,0.08)` for elevated sheets only.
- Icons: lucide-react, 20 px, 2 px stroke, never colored inside text lines except status contexts.
- Buttons: primary (indigo, white text), secondary (white, border), ghost (text); height 44 px — the touch-target minimum everywhere, including chips and nav icons.

### 8.4 Mobile-first layout rules

- **Design target is 375 px (iPhone SE) first**, then desktop. Every screen must pass 375 × 667 with **zero page-level horizontal scroll** (the only inner scroll allowed: the Kanban board's column rail).
- **Bottom nav on mobile:** fixed, 4 items (Home · Drives · Board · Portfolio), icons + 11 px labels, active = indigo. Desktop: left sidebar with the same four items + a prominent "Add evidence" button.
- **Breakpoints:** base = 1 column; `sm` (640 px) = 2-column card grids; `lg` (1024 px) = sidebar + 12-column dashboard grid, Kanban shows all 6 columns in a row.
- **Tables become lists on mobile:** the eligibility table renders as stacked "label: need X · you have Y" rows with pass/fail icons — never a squeezed table.
- **One-thumb reach:** primary actions (bottom nav, FAB "Add evidence") live in the bottom third of mobile screens.

### 8.5 States

- **Loading:** skeleton cards with pulse for list/dashboard/ring — no fullscreen spinners.
- **Empty:** every collection view has a designed empty state (strings in §7) with a next action.
- **Error:** toasts for transient errors; full-page states only for 404 portfolio and auth-required routes.

### 8.6 Accessibility

- Contrast: all text pairs meet WCAG AA (indigo-600 on white = 6.3:1; slate-500 used only at 13 px+).
- Visible focus ring (2 px indigo, 2 px offset) on all interactive elements; `aria-label` on every icon-only button; status badges use text, not color alone.

### 8.7 Visual references

The approved mockups from the planning session are the north star (kept in the project's design folder): the dashboard ("DriveDeck Placement Prep Dashboard"), the portfolio ("DriveDeck Portfolio Dashboard" — rename the "Rahul Sharma" persona to Kiran), the pipeline board, and the deadline tracker with verification stamps. The persona reference is "DriveDeck Persona: Kiran the Future Analyst" (fix its "tov" typo to "toy"). Mockups are references for look and hierarchy — build the CSS by hand to match, do not crop images from them.

---
## 9. Database — Firestore

Firestore is the entire backend. No Cloud Functions, no servers, no cron. Three design principles:

1. **The document ID *is* the logic** — deterministic IDs make duplicates structurally impossible and encode ownership.
2. **Security rules are the backend** — ~40 lines below decide everything; the client is treated as hostile.
3. **Denormalize without guilt** — no joins exist in Firestore, so drive documents carry `companyName` and company initials/color; free-tier reads stay low.

### 9.1 Collections overview

| Collection | Document ID | Purpose | Written by |
|---|---|---|---|
| `users` | auth uid | Student profile + eligibility numbers + portfolio slug | Owner via app |
| `usernames` | the slug itself (`kiran`) | Slug registry → uid lookup; create-once = uniqueness | Owner, once |
| `companies` | company slug (`tcs`) | Company name + initials + brand color + careers URL | Seed script only |
| `drives` | `{company}_{program}_{batch}` (e.g. `tcs_nqt_2027`) | Verified drive listings | Seed script only |
| `applications` | `{uid}_{driveId}` (e.g. `abc123_tcs_nqt_2027`) | One student's journey for one drive | Owner via app |
| `activities` | auto-ID | Evidence log feeding score + portfolio | Owner via app |

### 9.2 Field specifications

**`users/{uid}`**

| Field | Type | Notes |
|---|---|---|
| `name`, `email` | string | From auth/onboarding |
| `college`, `branch`, `year` | string, string, number | Branch from fixed code list (§F1) |
| `tenth`, `twelfth` | number | Percentages — eligibility inputs |
| `cgpa`, `backlogs` | number, number | Eligibility inputs |
| `targetRole` | string | Chip value, e.g. "Data Analyst" |
| `portfolioSlug` | string | Mirrors the `usernames` doc |
| `githubUrl`, `linkedinUrl` | string, optional | v1.1 — validated profile URLs, empty allowed; rendered on the portfolio header (§10.1) |
| `createdAt` | timestamp | Server time |

**`usernames/{slug}`** — single field `uid` (string). Nothing else, ever: create-once, immutable (§9.4).

**`companies/{slug}`**

| Field | Type | Notes |
|---|---|---|
| `name` | string | "TCS" |
| `initials`, `color` | string, string | Letter-avatar (e.g. "TC" + indigo) — Decision: initials avatars instead of logo files, because logo files would need storage/uploads (cut, §14) and hotlinked logos break |
| `careersUrl` | string | Official careers page — reused as the default `sourceUrl` |

**`drives/{company_program_batch}`**

| Field | Type | Notes |
|---|---|---|
| `companyName`, `companySlug` | string, string | Denormalized for card rendering (no joins) |
| `initials`, `color` | string, string | Denormalized from companies |
| `program`, `role`, `batch` | string | "NQT", "Graduate Trainee — Data", "2027" |
| `type` | string | `ON` or `OFF` campus |
| `regDeadline` | timestamp / null | null allowed for TENTATIVE rows whose date is not yet public |
| `testDate` | timestamp / null | Optional |
| `salary`, `openings` | string | As stated by the source (strings — sources write "₹3.36 LPA", not numbers) |
| `eligibility` | map | `{ tenthMin, twelfthMin, cgpaMin, maxBacklogs, branches[] }` — `branches` uses the same fixed codes as onboarding |
| `roundsInfo` | string | Static text from the source (rounds 1–n summary) |
| `sourceUrl` | string | **Required.** Official page the data was read from |
| `status` | string | `CONFIRMED` or `TENTATIVE` |
| `verifiedAt` | timestamp | Last time a human checked `sourceUrl` |
| `sourceName` | string | Display domain, e.g. "tcs.com" |

**`applications/{uid}_{driveId}`**

| Field | Type | Notes |
|---|---|---|
| `uid`, `driveId` | string | Redundant copies of the ID parts (queryable) |
| `status` | string | `SAVED` / `APPLIED` / `OA` / `INTERVIEW` / `OFFER` / `REJECTED` |
| `history` | array of maps | `[{ status, at }]` — appended on every move; full journey preserved |
| `updatedAt` | timestamp | Stage-age chips read this |

**`activities/{autoId}`**

| Field | Type | Notes |
|---|---|---|
| `uid` | string | Owner — copied for public portfolio queries |
| `type` | string | `PROJECT` / `CERT` / `COURSE` / `DSA` / `ACHIEVEMENT` |
| `title` | string | Required |
| `summary` | string | ≤ 140 chars |
| `url` | string | **Required, `https?://` enforced by security rules — the Evidence Rule |
| `tags` | array of string | ≤ 3 |
| `date`, `createdAt` | timestamp | `date` = when the work happened (user-editable, defaults today) |

### 9.3 Document ID design — duplicates are structurally impossible

- `drives/tcs_nqt_2027`: the same company + program + batch always maps to the **same document**. If TCS reopens NQT registration, the seed script updates that document — a repost can never appear as a second fake drive. (Slugify: lowercase, spaces → `_`.)
- `applications/{uid}_{driveId}`: one student cannot have two application records for one drive — saving twice hits the same document.
- `usernames/{slug}`: the registry document ID is the slug itself, created with `.create()` (fails if the document exists). Two students cannot claim `/u/kiran` — the second write throws, no race condition, no transaction needed.
- `companies/{slug}`: one company, one document, however many drives it runs.

### 9.4 Security rules — the entire backend

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {

    // 1. Profiles: public read (portfolios), owner-only write, never deletable
    match /users/{uid} {
      allow read: if true;
      allow create, update: if request.auth != null && request.auth.uid == uid;
      allow delete: if false;
    }

    // 2. Slug registry: create-once, immutable — uniqueness + no portfolio hijacking
    match /usernames/{slug} {
      allow read: if true;
      allow create: if request.auth != null
                    && request.resource.data.uid == request.auth.uid;
      allow update, delete: if false;
    }

    // 3. Drives & companies: world-readable, client-writes impossible.
    //    Only the Admin SDK (seed script) can write — the Verified-Data USP.
    match /drives/{id}    { allow read: if true; allow write: if false; }
    match /companies/{id} { allow read: if true; allow write: if false; }

    // 4. Applications: doc ID is "{uid}_{driveId}" — the path IS the permission.
    //    Path-based check works on create too (no resource needed).
    match /applications/{appId} {
      allow read, write: if request.auth != null
                         && appId.split('_')[0] == request.auth.uid;
    }

    // 5. Activities: public read (portfolios), owner-only writes,
    //    Evidence Rule enforced at the database level.
    match /activities/{id} {
      allow read: if true;
      allow create: if request.auth != null
                    && request.resource.data.uid == request.auth.uid
                    && request.resource.data.url is string
                    && request.resource.data.url.matches('https?://.+');
      allow update, delete: if request.auth != null
                            && resource.data.uid == request.auth.uid;
    }
  }
}
```

**What these rules deliberately forbid (say this in the demo):**
- A student can **never** write a drive — no one can plant a fake deadline, ever (USP 1).
- A slug can **never** be overwritten — no portfolio hijacking (USP 2).
- Evidence without a working link is **rejected by the database** — the portfolio's trust badge is a guarantee (USP 2).
- Nobody can read or move someone else's applications — the ID prefix guards it.

Deploy via `firebase deploy --only firestore:rules` (or paste in Console → Firestore → Rules).

### 9.5 Composite indexes (the only three)

| Collection | Index | Serves |
|---|---|---|
| `drives` | `status ASC, regDeadline ASC` | Dashboard deadline chips; Drives list sorted by urgency |
| `applications` | `uid ASC, updatedAt DESC` | Board columns + dashboard |
| `activities` | `uid ASC, date DESC` | Growth list + portfolio timeline |

Create them from the console link that appears in the first query error, or commit a `firestore.indexes.json`.

### 9.6 Free-tier math (why ₹0 is a promise, not luck)

Firestore Spark tier: ~50,000 reads / 20,000 writes / 1 GiB stored per day (check current numbers when configuring).

| Scenario | Reads | Writes |
|---|---|---|
| Dashboard visit (~26: user + drives page + applications + activities) | 26 | 0 |
| Portfolio view | ~4 | 0 |
| Demo day: 200 portfolio views + 100 dashboard visits + 200 app writes | ~1,800 | ~200 |

≈ 4% of the daily read quota on a heavy demo day. Cloudflare Pages serves the SPA itself free and unlimited. **Nothing in this plan can generate a bill.**

---

## 10. Auth & account flow

**Providers (Firebase Auth):**
- **Google popup — primary.** One tap, no password-reset flows, no custom email infrastructure.
- **Email/password — deferred (v1.1).** Google-only in v1 (see §10.1); enable this provider later from the Console if ever needed — still zero custom email code.

**Flow:**

```
/ (Landing) → "Start free" → Google popup
    ├─ new user      → /onboarding (3 steps) → /dashboard
    └─ returning user → /dashboard

Guarded routes (client-side redirect, real security lives in the rules):
  /dashboard /drives /board /growth  → require auth
  /u/:slug  /                        → public
```

**Setup checklist (Firebase Console):** create project → Authentication → enable Google + Email/Password → Firestore Database → create in **production mode** → paste §9.4 rules → add web app → copy the six config values into `.env`.

**Edge cases:**
- Popup blocked (some in-app browsers) → fall back to `signInWithRedirect` automatically.
- User signs in, closes onboarding mid-way → guard sends them back to the unfinished step (onboarding state is derived from `users/{uid}` existing + `portfolioSlug` set).
- Sign out → toast "Signed out" → redirect to landing.

---

## 11. Deployment — Cloudflare Pages

Static SPA hosting, free, fast in India, zero config servers.

### 11.1 One-time setup

1. Push the repo to GitHub.
2. Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git** → select the repo.
3. Build settings: **Framework preset: Vite** (or none) · Build command: `npm run build` · Output directory: `dist`.
4. Environment variables (Production + Preview):

| Variable | Value |
|---|---|
| `NODE_VERSION` | `20` |
| `VITE_FIREBASE_API_KEY` | from Firebase web app config |
| `VITE_FIREBASE_AUTH_DOMAIN` | `…firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | project id |
| `VITE_FIREBASE_STORAGE_BUCKET` | `….appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | sender id |
| `VITE_FIREBASE_APP_ID` | app id |

5. Save → first build → the site lives at `drivedeck.pages.dev` (or any available name).

### 11.2 SPA fallback — the one line that matters most

`src/lib/firebase.ts` reads only `import.meta.env.VITE_FIREBASE_*` and **fails fast at boot** with a clear console error if any of the six is missing (Vite bakes env vars at build time — changing them requires a rebuild; note this when debugging).

Create `public/_redirects` with exactly:

```
/*    /index.html   200
```

Without it, every direct visit or refresh on `/u/kiran` returns Cloudflare's 404, because no such static file exists. With it, React Router takes over. **This is the #1 deployment bug for SPAs — test it explicitly.**

### 11.3 Post-deploy test checklist

- [ ] Hard-refresh `https://drivedeck.pages.dev/u/kiran` — portfolio loads (SPA fallback works).
- [ ] Google sign-in works **on the pages.dev domain** (see 11.4) and creates the user (Google is the only enabled provider, §10.1).
- [ ] Firebase config values are present in the bundle (no blank screens).
- [ ] Dev-tools network tab shows no CORS/auth-domain errors.

### 11.4 Firebase authorized domains

Firebase Auth only allows redirects/popup returns from listed domains. Firebase Console → Authentication → Settings → **Authorized domains** → add `drivedeck.pages.dev` (localhost is pre-added). Do this **before** testing sign-in on production. Optional custom domain later: add it in Cloudflare (DNS) and Firebase (authorized domains).

### 11.5 Keep-alive rule (hackathon requirement)

The submission's live link must stay up until results (Dec 6). Therefore: **do not delete the Pages project, the Firebase project, or the GitHub repo until after Dec 6**; do not rotate API keys mid-judging; free plans idle gracefully — no action needed to "keep it running".

---
## 12. Seed data plan

Verified data is USP 1 — so seeding is a **human verification workflow with a script attached**, never a scraped dump.

### 12.1 Principles

1. **Every drive row is read by a human (you) from the official source page** on the day of seeding. The script writes what you verified; it never invents anything.
2. **Default status is TENTATIVE.** Promote a row to CONFIRMED only when the source page itself states the date (registration open, deadline printed).
3. **`verifiedAt` = the moment you checked**, refreshed on every re-run — this is what the stamp line displays.
4. **No third-party aggregators** (PrepInsta posts, Telegram images) as sources — official careers pages only. If a link below has moved, use the company's official careers page; never an aggregator.
5. **`regDeadline` may be null** for TENTATIVE rows whose date is not public yet — the UI handles null honestly ("date unconfirmed").

### 12.2 Companies and where to verify (open each before seeding)

| Company slug | Name | Official verification page |
|---|---|---|
| `tcs` | TCS | tcs.com → Careers (Entry-level / NQT page) |
| `infosys` | Infosys | infosys.com/careers/apply.html |
| `wipro` | Wipro | careers.wipro.com (Elite program pages) |
| `cognizant` | Cognizant | careers.cognizant.com (GenC pages) |
| `accenture` | Accenture | accenture.com → India careers |
| `capgemini` | Capgemini | capgemini.com → India careers |
| `deloitte` | Deloitte | deloitte.com → India careers |
| `amazon` | Amazon | amazon.jobs (University/entry-level) |

### 12.3 Example drive document (format reference — values are filled at seed time)

```js
// drives/tcs_nqt_2027 — every "// check" value comes from the source page that day
{
  companyName: "TCS",
  companySlug: "tcs",
  initials: "TC", color: "#4F46E5",
  program: "NQT", role: "Assistant System Engineer", batch: "2027",
  type: "OFF",
  regDeadline: null,          // check: promote + set only if the page states a date
  testDate: null,             // check
  salary: "",                 // check: exactly what the page states (e.g. CTC figures)
  openings: "",               // check
  eligibility: {
    tenthMin: 60, twelfthMin: 60, cgpaMin: 6.0,   // check against the official criteria
    maxBacklogs: 1,                                // check
    branches: ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL"]
  },
  roundsInfo: "Check the official pattern page at seed time and paste its summary here.",
  sourceUrl: "",              // required — the exact page you read
  sourceName: "tcs.com",
  status: "TENTATIVE",        // CONFIRMED only when the page states the date
  verifiedAt: "<serverTimestamp at seed>"
}
```

Target for the demo: **at least 8 drives** across the 8 companies, with **≥ 3 CONFIRMED** (real, dated rows) and the rest honestly TENTATIVE. A small set you personally verified beats a big set nobody did — judges tap the sources.

### 12.4 The seed script — `scripts/seed.mjs`

- Runs in Node with `firebase-admin` + a service-account key at `scripts/service-account.json` (generated in Firebase Console → Project settings → Service accounts).
- **The key is dev-only**: `.gitignore` it, never deploy it, never import it from app code. Admin SDK writes bypass security rules — that is exactly why rules can set `drives: write: false` for everyone else.
- **Idempotent**: `.set()` with the deterministic IDs of §9.3 — re-running updates `verifiedAt` and refreshes values, never duplicates.
- Order: upsert `companies` → upsert `drives` → upsert demo user + their activities + applications (§12.5).
- Prints one line per document: the doc ID + "verified from {sourceUrl}" — so the console output doubles as the verification log for the demo story.
- Firebase project config for the client lives in `.env` (six `VITE_FIREBASE_*` values); `.env` is gitignored too.

### 12.5 The demo account — Kiran (`/u/kiran`)

The portfolio judges open must be real enough to survive inspection:

- **Profile:** Kiran · CSE · 3rd year · 10th 89 · 12th 84 · CGPA 7.8 · backlogs 0 · target "Data Analyst" · slug `kiran` (also reserved in onboarding, §F1).
- **Activities — only with real, working links.** Use the builder's own projects/certificates; for anything not genuinely available, cut the item — a dead link on the "Every item evidence-linked" portfolio kills USP 2. Planned shape: 2 projects (SQL analysis + Power BI dashboard), 1 certificate, 1 course, 4 DSA practice sets (LeetCode profile links), tagged consistently (`sql`, `power-bi`, `dsa`).
- **Applications:** seeded across all six board columns — e.g. TCS NQT → APPLIED, Infosys → Test/OA, Wipro → SAVED, Accenture → SAVED, Cognizant → INTERVIEW, Capgemini → REJECTED. **Offer column deliberately empty** — the live demo drags a card into Offer on camera (§15.2).
- **Resulting score ≈ 56/100** (worked in §13) — an honest mid-journey number with visible room to grow.

---

## 13. Readiness Score — exact specification

**Formula (locked in planning):**

```
score = min(100, 15·P + 10·C + 5·K + 2·D + min(10, 0.5·S))
```

| Input | Meaning | Source |
|---|---|---|
| `P` | count of `PROJECT` activities | `activities` where uid = me |
| `C` | count of `CERT` activities | same |
| `K` | count of `COURSE` activities | same |
| `D` | count of `DSA` activities | same |
| `S` | current streak: consecutive calendar days (ending today or yesterday) with ≥ 1 activity | derived from activity dates |

Projects weigh most (15) because they are the strongest placement signal; daily practice weighs least per entry but its streak bonus rewards consistency — the behavior we want students to build. All counts come exclusively from evidence-linked activities, so the score cannot be inflated by hand (§9.4 rule 5).

**Worked example — Kiran's seed data:** 2 projects (30) + 1 certificate (10) + 1 course (5) + 4 DSA sets (8) + 5-day streak (2.5) = **55.5 → displayed 56/100**.

**Where shown:** dashboard ring + portfolio header + the "How this is calculated" sheet, which prints the formula with the student's live inputs ("2 × 15 = 30 …"). Transparency is the USP — never hide the math.

**Edge cases:** zero activities → 0, never null or a dash; ACHIEVEMENT type scores 0 points but still appears on the portfolio (recognition ≠ readiness); a single burst of 40 DSA logs can dominate the formula — watch this in testing; if it looks gameable in the demo, cap DSA at 20 entries (40 pts) — decision at build time, noted here so the change is conscious.

**Implementation:** pure function `computeScore(activities, streakDays)` in `src/lib/scoring.ts`, no side effects, unit-testable; recompute on activities change.

---

## 14. Out of scope (the cut list) and post-MVP

Every cut below has a reason tied to the three constraints (solo builder, ~3 weeks part-time, free tiers) or to trust. This table is also the demo's answer bank for "why didn't you build X?"

| Cut | Why cut | Post-MVP? |
|---|---|---|
| Email / push notifications | Needs a server or cron; `.ics` download + red/amber deadline chips cover the need | Yes — first post-MVP |
| AI anything (resume review, suggestions) | Scope magnet; violates the zero-backend rule | Yes, later |
| File uploads (certificate PDFs, company logos) | Needs storage + moderation; **links are stronger evidence** — verifiable by anyone | Maybe |
| Drive admin panel / CMS | The seed script is safer: no UI, no accidental edits, verification stays manual | No — keep the script |
| Resume PDF export | The portfolio page *is* the resume; printing styles can come later | Yes |
| Manual "add anything" application | Keeps the board a projection of real drives (data honesty) | Maybe, as "add custom drive" |
| Chat / community / leaderboards | Social = moderation burden, zero solo bandwidth | No |
| Dark mode, multi-language, PWA install | Polish tax during the crunch; one polished theme wins | Maybe |
| Chart library | Score ring + growth timeline are hand-rolled SVG/CSS — smaller and faster | — |
| State management library | React Query-free: Firestore's `onSnapshot` + local state is enough at this size | — |

---

## 10. Auth, profile links & resources (v1.1 additions)

**Auth: Google only.** The auth plan (§10 of the build flow) ships exactly one provider in v1: **Google popup** (redirect fallback when popups are blocked). Email/password is deferred — no second provider is configured in the Firebase Console. The Google-only decision matches the product's 2-minute onboarding promise; a student without a Google account is not the persona.

**GitHub & LinkedIn: links, not OAuth.** The student saves two profile URLs (`https://github.com/…`, `https://linkedin.com/in/…`) in onboarding step 1 (optional fields, validated by regex, empty allowed). They are stored on `users/{uid}` as `githubUrl` and `linkedinUrl` and rendered on the portfolio header as link buttons — "the connect". This is deliberately NOT OAuth: no API keys, no scopes, no new dependencies (Architecture.md Sheet 8.1 cap holds), and the URLs are public by design — a portfolio is a public page, so the security posture (rules 1: public read) is unchanged.

**Resources page: public, pre-login.** A visitor with no account sees real value immediately: a static, public `/resources` page linked from the Landing nav ("Resources"). Curated, real links only — LeetCode, Roadmap.sh, official company career pages, SQL practice — each with a one-line "why" caption. No database, no collection, no rules change: a static React page. No dummy entries: every link must be one the builder verified; the page ships with ~8 links, each checked by hand.

### v1.1 strings (added to the §7 copy deck)

| Location | Element | Exact string |
|---|---|---|
| Onboarding step 1 | GitHub field helper | Optional — your GitHub profile URL, shown on your portfolio. |
| Onboarding step 1 | LinkedIn field helper | Optional — your LinkedIn profile URL, shown on your portfolio. |
| Portfolio header | Link buttons | GitHub · LinkedIn (hidden if the URL is empty) |
| Landing nav | Link | Resources |
| Resources page | H1 + sub | Prep resources that actually help. / Curated by hand, every link checked. No filler. |

## 15. Definition of done — the Dec 1 checklist

### 15.1 Build

- [ ] Live at `drivedeck.pages.dev`; hard-refresh on `/u/kiran` works (SPA fallback).
- [ ] Google sign-in works on the production domain (the only provider, §10.1).
- [ ] ≥ 8 seeded drives, every row with `sourceUrl` + `verifiedAt`, ≥ 3 CONFIRMED.
- [ ] Eligibility engine verified against 3 test profiles (match / low CGPA / wrong branch).
- [ ] Kanban drag works on a real touch phone; history array appends correctly.
- [ ] `/u/kiran` renders fully logged-out; every evidence link opens.
- [ ] Readiness Score matches hand calculation; formula sheet shows live inputs.
- [ ] 375 px pass on all six screens — zero page-level horizontal scroll.
- [ ] All strings from §7 implemented as written (no lorem, no placeholders).

### 15.2 The 90-second demo script (rehearse against this)

1. **(0:00)** Landing — read the tagline out loud, tap **"See a live portfolio"**.
2. **(0:15)** `/u/kiran` — point at the badge: "Every item evidence-linked", tap a GitHub button, show the score ring.
3. **(0:30)** Drives — open TCS NQT, read the stamp "CONFIRMED · source: tcs.com · checked Nov 8", tap **"View official page"**: "Audit us — one tap."
4. **(0:45)** Board — drag a card to **Offer** (confetti): "Every application, one honest board."
5. **(1:00)** Growth — "Add evidence", paste a real GitHub link, save.
6. **(1:15)** Back to `/u/kiran`, refresh — the new item is already there: "The portfolio builds itself. That's the product."
7. **(1:25)** End on the tagline: **"From 3rd year to offer letter."**

### 15.3 Integrity

- [ ] All code written by you during the hackathon window (original work rule); AI-generated mockups used only as visual references, not shipped assets.
- [ ] Live link + repo stay untouched until results (Dec 6).

---

## Appendix A — Tech stack, and why each choice

| Layer | Choice | Why this, not the obvious alternative |
|---|---|---|
| UI | React 18 + Vite | Instant HMR, static output = perfect for Pages. Next.js rejected: SSR adds nothing here and OpenNext-on-Cloudflare is extra moving parts |
| Styling | Tailwind CSS | Token-driven speed; the design system of §8 maps 1:1 to config |
| Routing | react-router-dom | SPA routes including `/u/:slug` |
| Database | Firestore | Free tier, rules-as-backend, realtime listeners free |
| Auth | Firebase Auth | Google popup + email, zero servers, zero custom email flows |
| Drag & drop | @dnd-kit/core | Accessible, touch-first — the board must work on a phone |
| Icons | lucide-react | Tree-shaken, consistent 2 px stroke |
| Font | Plus Jakarta Sans | Rounded-professional; loads from Google Fonts |
| Hosting | Cloudflare Pages | Free, fast in India, SPA fallback via `_redirects` |
| Seeding | firebase-admin (dev-only) | Admin writes bypass rules — the verified-data pipeline |

**Total runtime dependencies: five.** Anything beyond this list needs a written justification in the repo README.

## Appendix B — Repo structure and build order

```
drivedeck/
├── index.html                  ← meta tags from §3 live here
├── public/_redirects           ← SPA fallback (§11.2)
├── src/
│   ├── lib/
│   │   ├── firebase.ts         ← config from env, fail-fast
│   │   ├── scoring.ts          ← §13 formula
│   │   ├── eligibility.ts      ← profile vs drive, pure function
│   │   └── ics.ts              ← calendar Blob generator
│   ├── pages/
│   │   ├── Landing.jsx  Onboarding.jsx  Dashboard.jsx
│   │   ├── Drives.jsx   DriveDetail.jsx Pipeline.jsx
│   │   └── Growth.jsx   Portfolio.jsx   NotFound.jsx
│   └── components/
│       ├── Sidebar.tsx  BottomNav.tsx
│       ├── ScoreRing.tsx  CountdownChip.tsx  EligibilityBadge.tsx
│       ├── ActivityModal.tsx  KanbanBoard.tsx  EmptyState.tsx
├── scripts/
│   ├── seed.mjs                ← Admin SDK seeding (never deployed)
│   └── service-account.json    ← gitignored, dev-only
├── firestore.rules             ← §9.4
├── .env                        ← gitignored, six VITE_FIREBASE_* values
└── package.json
```

**Suggested coding order** (a sequence, not a schedule — deploy early, deploy always: push to Pages on day one and keep the submission link alive from week one):

1. Vite + Tailwind + Firebase init; auth skeleton; routes + guards; `_redirects` verified on prod.
2. Onboarding + `users`/`usernames` writes (slug `.create()` uniqueness proven).
3. Drives read-only list + detail + eligibility engine (seed 3 rows to test).
4. Pipeline board (dnd + history).
5. Growth + portfolio (Evidence Rule enforced in rules — test a rule denial from the console).
6. Landing, scoring polish, full seed data, 375 px mobile pass, demo rehearsal (§15.2).
