// Scrolling story — DriveDeck-native replacement for the 21st.dev
// "interactive-scrolling-story-component" (minhxthanh): that component couldn't
// be installed from the registry without a 21st API key, so its behavior is
// rebuilt on our existing deps — `motion` useScroll/useTransform for the
// scroll-driven crossfade, Tailwind for layout, zero new dependencies (dep cap
// §6.2 stays at 5 + motion).
//
// How it plays: a 300vh scroll runway with a sticky 100svh viewport. As the
// user scrolls, the copy on the left fades + slides up while the matching
// visual on the right slides in from the right — one beat per card in
// COPY.landing.cards (copy deck discipline: strings already in PRD §7.1).
// Panels alternate accent / mint / cream tints, all tokens from tailwind.config.js.
//
// Accessibility & environments:
// - prefers-reduced-motion renders a static stacked version (no sticky, no
//   scroll math, no motion hooks) so every beat is simply visible.
// - The LAST beat never exits, so the section always settles fully visible
//   (lesson from the frozen-timeline incident: nothing here relies on
//   animation timelines that can strand content at opacity 0).
// - Mobile stacks text above visual inside the sticky frame; svh units keep
//   the sticky viewport clear of iOS toolbars where supported, with a
//   100vh class fallback for old browsers.
import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { BadgeCheck, CalendarCheck2, FolderGit2, Link2, MoveRight } from "lucide-react";
import { COPY } from "../../lib/copy";

const N = Math.max(1, COPY.landing.cards.length);

interface BeatWindow { w: number[]; o: number[]; t: number[] }
/**
 * Scroll window for beat i in [0,1] progress. The first beat enters already
 * visible (the sticky frame must never pin on an empty stage), the last never
 * exits (section always settles visible). `t` = enter/exit slide offsets.
 */
function beatWindow(i: number): BeatWindow {
  const enterIn = Math.max(0.02, i / N - 0.06);
  const enterOut = i / N + 0.16;
  const exitIn = (i + 1) / N - 0.08;
  const exitOut = (i + 1) / N + 0.02;
  if (i === 0) return { w: [exitIn, exitOut], o: [1, 0], t: [0, -28] };
  if (i === N - 1) return { w: [enterIn, enterOut], o: [0, 1], t: [28, 0] };
  return { w: [enterIn, enterOut, exitIn, exitOut], o: [0, 1, 1, 0], t: [28, 0, 0, -28] };
}

function BeatChip({ index }: { index: number }) {
  return (
    <span className="inline-flex items-center gap-2 mb-3 sm:mb-4">
      <span className="w-2 h-2 rounded-full bg-accent" aria-hidden />
      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
        {String(index + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
      </span>
    </span>
  );
}

/* ---------------- copy beats ---------------- */

function StoryTextMotion({ i, progress }: { i: number; progress: MotionValue<number> }) {
  const bw = beatWindow(i);
  const opacity = useTransform(progress, bw.w, bw.o);
  const y = useTransform(progress, bw.w, bw.t);
  const c = COPY.landing.cards[i];
  return (
    <motion.div style={{ opacity, y }} className="absolute inset-0 flex flex-col justify-center pb-8">
      <BeatChip index={i} />
      <h3 className="text-[22px] sm:text-3xl md:text-4xl font-bold tracking-tight text-ink mb-2.5 sm:mb-3">{c.title}</h3>
      <p className="text-[14px] sm:text-[15px] md:text-base text-ink/70 max-w-[40ch]">{c.body}</p>
    </motion.div>
  );
}

function StoryTextStatic({ i }: { i: number }) {
  const c = COPY.landing.cards[i];
  return (
    <div>
      <BeatChip index={i} />
      <h3 className="text-[20px] sm:text-2xl font-bold text-ink mb-2">{c.title}</h3>
      <p className="text-[14px] sm:text-[15px] text-ink/70 max-w-[40ch]">{c.body}</p>
    </div>
  );
}

/* ---------------- visual beats (CSS-drawn, DriveDeck mock style) ---------------- */

const PANELS = ["bg-accent/10 border-accent/25", "bg-mint/30 border-mint/50", "bg-cream border-ink/10"];

function VisualFrame({ i, children }: { i: number; children: React.ReactNode }) {
  return (
    <div
      className={`rounded-2xl border ${PANELS[i % 3]} flex items-center justify-center p-5 sm:p-8 h-full`}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}

function StoryVisualMotion({ i, progress }: { i: number; progress: MotionValue<number> }) {
  const bw = beatWindow(i);
  const opacity = useTransform(progress, bw.w, bw.o);
  const x = useTransform(progress, bw.w, bw.t);
  return (
    <motion.div
      style={{ opacity, x }}
      className="absolute inset-0 flex items-center"
      role="img"
      aria-label={COPY.landing.cards[i].title}
    >
      <div className="w-full h-full">
        <VisualFrame i={i}>
          {i % 3 === 0 && <DeadlineCard />}
          {i % 3 === 1 && <KanbanCard />}
          {i % 3 === 2 && <PortfolioCard />}
        </VisualFrame>
      </div>
    </motion.div>
  );
}

function StoryVisualStatic({ i }: { i: number }) {
  return (
    <div className="h-[280px] sm:h-[340px]">
      <VisualFrame i={i}>
        {i % 3 === 0 && <DeadlineCard />}
        {i % 3 === 1 && <KanbanCard />}
        {i % 3 === 2 && <PortfolioCard />}
      </VisualFrame>
    </div>
  );
}

function DeadlineCard() {
  const m = COPY.landing.storyMock;
  return (
    <div className="w-full max-w-[320px] rounded-xl bg-white text-ink border border-ink/10 shadow-[0_18px_40px_-18px_rgba(15,23,42,0.35)] p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/45">{m.driveLabel}</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-mint/60 text-ink px-2.5 py-1 text-[11px] font-bold">
          <BadgeCheck size={14} aria-hidden className="text-ink" /> {m.verifiedChip}
        </span>
      </div>
      <p className="font-semibold text-[14px] sm:text-[15px] leading-snug">{m.driveTitle}</p>
      <div className="mt-3 rounded-lg bg-canvas border border-ink/10 px-2.5 py-2 flex items-center gap-2 text-[12px] text-ink/70">
        <Link2 size={14} aria-hidden className="text-accent shrink-0" /> {m.sourceAttached}
      </div>
      <div className="mt-2 px-0.5 flex items-center gap-2 text-[12px] text-ink/55">
        <CalendarCheck2 size={14} aria-hidden className="text-accent shrink-0" /> {m.lastChecked}
      </div>
    </div>
  );
}

function KanbanCard() {
  const m = COPY.landing.storyMock;
  const COL: { name: string; chips: number; hot?: boolean }[] = [
    { name: m.boardCols[0], chips: 2 },
    { name: m.boardCols[1], chips: 2 },
    { name: m.boardCols[2], chips: 1, hot: true },
  ];
  return (
    <div className="w-full max-w-[340px] rounded-xl bg-white text-ink border border-ink/10 shadow-[0_18px_40px_-18px_rgba(15,23,42,0.35)] p-4">
      <div className="grid grid-cols-3 gap-2">
        {COL.map((col, i) => (
          <div key={col.name} className={`rounded-lg border p-2 ${col.hot ? "bg-mint/40 border-accent/30" : "bg-canvas border-ink/10"}`}>
            <p className={`text-[9.5px] font-bold uppercase tracking-wider mb-1.5 ${col.hot ? "text-accent" : "text-ink/45"}`}>{col.name}</p>
            <div className="space-y-1.5">
              {Array.from({ length: col.chips }).map((_, k) => (
                <div
                  key={k}
                  className={`h-7 rounded-md border ${
                    i === 1 && k === 1
                      ? "border-accent/40 bg-white shadow-[0_0_0_3px_rgba(32,82,235,0.12)]"
                      : "border-ink/10 bg-white/80"
                  }`}
                >
                  {i === 1 && k === 1 && (
                    <span className="flex items-center justify-center gap-1 h-full text-[9px] font-bold text-accent">
                      <MoveRight size={12} aria-hidden /> {m.boardCols[2]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-ink/55 flex items-center gap-1.5">
        <FolderGit2 size={13} aria-hidden className="text-accent" /> {COPY.landing.cards[1].title}
      </p>
    </div>
  );
}

function PortfolioCard() {
  const m = COPY.landing.storyMock;
  const R = 17;
  const C = 2 * Math.PI * R;
  const pct = 0.78;
  return (
    <div className="w-full max-w-[320px] rounded-xl bg-white text-ink border border-ink/10 shadow-[0_18px_40px_-18px_rgba(15,23,42,0.35)] p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <span className="w-9 h-9 rounded-full bg-accent text-white text-[13px] font-bold flex items-center justify-center shrink-0">KP</span>
        <div className="min-w-0">
          <p className="font-semibold text-[14px] truncate">{m.portfolioName}</p>
          <p className="text-[11px] text-ink/55">{m.portfolioSub}</p>
        </div>
        <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden className="ml-auto shrink-0">
          <circle cx="22" cy="22" r={R} fill="none" stroke="rgba(15,23,42,0.1)" strokeWidth="5" />
          <circle
            cx="22" cy="22" r={R} fill="none" stroke="#2052EB" strokeWidth="5" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C * (1 - pct)} transform="rotate(-90 22 22)"
          />
          <text x="22" y="26" textAnchor="middle" fontSize="11" fontWeight="800" fill="#0F172A">78</text>
        </svg>
      </div>
      <div className="mt-3.5 space-y-1.5">
        {m.portfolioRows.map((row) => (
          <div key={row} className="rounded-lg border border-ink/10 bg-canvas px-2.5 py-2 flex items-center gap-2 text-[12px] text-ink/75">
            <Link2 size={13} aria-hidden className="text-accent shrink-0" />
            <span className="truncate">{row}</span>
            <BadgeCheck size={14} aria-hidden className="text-ink/35 ml-auto shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- progress dots ---------------- */

function Dot({ i, progress }: { i: number; progress: MotionValue<number> }) {
  if (i === 0) return <span className="w-2 h-2 rounded-full bg-accent" />;
  const active = useTransform(progress, beatWindow(i).w.slice(0, 2), [0.25, 1]);
  return <motion.span style={{ opacity: active }} className="w-2 h-2 rounded-full bg-accent" />;
}

/* ---------------- main ---------------- */

export function ScrollingStory() {
  const targetRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);

  // Reduced motion: plain stacked rows, no sticky, no scroll math, no motion hooks.
  if (reduced) {
    return (
      <section id="features" aria-label="Features" className="max-w-[1024px] mx-auto px-4 py-12 grid gap-12">
        {COPY.landing.cards.map((c, i) => (
          <div key={c.title} className="grid md:grid-cols-2 items-center gap-5 md:gap-10">
            <div className="order-2 md:order-1"><StoryTextStatic i={i} /></div>
            <div className="order-1 md:order-2"><StoryVisualStatic i={i} /></div>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section id="features" aria-label="Features">
      {/* scroll runway: one viewport height of scroll per beat */}
      <div ref={targetRef} className="relative" style={{ height: `${N * 100}vh` }}>
        <div
          className="sticky top-0 flex items-center overflow-hidden h-screen"
          style={{ height: "100svh" }}
        >
          <div className="mx-auto grid w-full max-w-[1024px] grid-cols-1 items-center gap-4 px-4 py-12 sm:gap-6 md:grid-cols-2 md:gap-10">
            {/* left: copy beats crossfade; dots light up per beat and stay lit */}
            <div className="relative h-[32svh] sm:h-[34svh] md:h-[56vh]">
              {COPY.landing.cards.map((c, i) => (
                <StoryTextMotion key={c.title} i={i} progress={scrollYProgress} />
              ))}
              <div className="absolute bottom-0 left-0 flex items-center gap-2" aria-hidden="true">
                {COPY.landing.cards.map((c, i) => (
                  <Dot key={c.title} i={i} progress={scrollYProgress} />
                ))}
              </div>
            </div>
            {/* right: visuals slide in */}
            <div className="relative h-[42svh] md:h-[56vh]">
              {COPY.landing.cards.map((c, i) => (
                <StoryVisualMotion key={c.title} i={i} progress={scrollYProgress} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
