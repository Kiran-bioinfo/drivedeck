// Cinematic footer — ported from the 21st.dev motion-footer prompt, adapted for DriveDeck:
// - DEPENDENCY-FREE of gsap: ScrollTrigger scrub → framer-motion `whileInView`;
//   marquee/heartbeat/breathe → Tailwind keyframes; magnetic pills → motion springs.
// - Palette: DriveDeck tokens only (ink `#0F172A` canvas, accent `#2052EB` glow,
//   white glass pills) — the shadcn oklch CSS-var theming was dropped since the
//   app has its own token system and ships light-mode only.
// - Content is web-app-native (no fake "Download iOS/Android" — DriveDeck is a
//   web app): CTA pills wire into the landing sign-in flow, link pills reuse
//   `COPY.landing` nav strings (PRD §7.1 discipline).
// - Mobile-first: no fixed/clip-path curtain (breaks on mobile viewports), fluid
//   type, truncation-safe marquee, ≥44px touch targets, reduced-motion aware.
import React from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { ArrowUp } from "lucide-react";
import { COPY } from "../../lib/copy";

interface CinematicFooterProps {
  /** Opens the landing page's sign-in card (auth lives in the parent Landing). */
  onGetStarted: () => void;
}

const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Magnetic pull — pointer-tracking springs (pointer:fine devices only).
function Magnetic({ children, className }: { children: React.ReactNode; className?: string }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springCfg = { stiffness: 160, damping: 16, mass: 0.4 };
  const x = useSpring(mx, springCfg);
  const y = useSpring(my, springCfg);
  const rotateX = useTransform(y, (v) => v * 0.14);
  const rotateY = useTransform(x, (v) => v * 0.14);

  return (
    <motion.div
      className={className}
      style={{ x, y, rotateX, rotateY, transformPerspective: 600 }}
      onMouseMove={(e) => {
        if (prefersReduced()) return;
        const rect = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - rect.left - rect.width / 2) * 0.35);
        my.set((e.clientY - rect.top - rect.height / 2) * 0.35);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

// Glass pill — shared visual on the dark canvas.
const PILL = "rounded-full border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.04] backdrop-blur-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.12)] transition-all duration-300 hover:border-white/25";

const MarqueeItem = () => (
  <div className="flex items-center">
    {COPY.landing.footerMarquee.map((item, i) => (
      <React.Fragment key={item}>
        <span className="whitespace-nowrap">{item}</span>
        <span aria-hidden className={`px-6 md:px-10 ${i % 2 ? "text-blush/60" : "text-accent"}`}>✦</span>
      </React.Fragment>
    ))}
  </div>
);

export function CinematicFooter({ onGetStarted }: CinematicFooterProps) {
  return (
    <footer
      className="relative w-full overflow-hidden text-white"
      style={{
        // Palette bridge: pure-ink floor felt disconnected from the site's blue
        // family — this settles navy into the accent's neighborhood by the bottom
        // edge, so footer and CTA/hero blues read as one system.
        background: "linear-gradient(180deg, #0F172A 0%, #0E2350 55%, #143A8C 100%)",
      }}
    >
      {/* Ambient aurora glow (breathe) + subtle grid */}
      <div
        aria-hidden
        className="animate-breathe motion-reduce:animate-none pointer-events-none absolute left-1/2 top-1/2 z-0 h-[55vh] w-[90vw] md:h-[60vh] md:w-[80vw] rounded-[50%] blur-[70px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(32,82,235,0.35) 0%, rgba(79,70,229,0.18) 40%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="footer-grid pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)",
          maskImage: "linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)",
        }}
      />

      {/* 1. Diagonal marquee band */}
      <div className="relative z-10 w-[104%] -ml-[2%] -rotate-1 md:-rotate-2 border-y border-white/10 bg-[rgba(32,82,235,0.14)] backdrop-blur-md py-3 md:py-4 overflow-hidden shadow-2xl">
        <div className="animate-marquee motion-reduce:animate-none flex w-max text-[11px] md:text-sm font-bold uppercase tracking-[0.3em] text-white/55">
          <MarqueeItem />
          <MarqueeItem />
        </div>
      </div>

      {/* 2. Center content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-5xl mx-auto px-5 pt-16 pb-10 md:pt-24 md:pb-14">
        <motion.h2
          initial={{ y: 40 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: "spring", bounce: 0.15, duration: 0.9 }}
          className="text-center text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-9 md:mb-14"
          style={{
            // Inline (not Tailwind arbitrary classes): the `background:` shorthand
            // utility resets background-clip to border-box, leaving transparent-fill
            // text with no gradient to show — i.e. invisible. One style object keeps
            // gradient + clip + fill atomic. End color is accent-tinted (#BFD0F7) so
            // the heading ties into the site's blue palette instead of pure white.
            background: "linear-gradient(180deg, #FFFFFF 0%, #BFD0F7 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 24px rgba(32,82,235,0.45))",
          }}
        >
          {COPY.landing.ctaTitle}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: "spring", bounce: 0.15, duration: 0.9, delay: 0.15 }}
          className="flex flex-col items-center gap-5 md:gap-7 w-full"
        >
          {/* Primary pills */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 w-full">
            <Magnetic>
              <button
                type="button"
                onClick={onGetStarted}
                className={`${PILL} px-7 py-3.5 md:px-10 md:py-5 text-sm md:text-base font-bold text-white inline-flex items-center gap-2.5 min-h-[48px]`}
              >
                {COPY.landing.primaryCta}
              </button>
            </Magnetic>
            <Magnetic>
              <Link
                to="/u/kiran"
                className={`${PILL} px-7 py-3.5 md:px-10 md:py-5 text-sm md:text-base font-bold text-white/85 hover:text-white inline-flex items-center gap-2.5 min-h-[48px]`}
              >
                {COPY.landing.secondaryCta}
              </Link>
            </Magnetic>
          </div>

          {/* Secondary link pills */}
          <div className="flex flex-wrap justify-center gap-2.5 md:gap-5 w-full mt-1">
            <Magnetic>
              <a href="#features" className={`${PILL} px-5 py-2.5 md:px-6 md:py-3 text-xs md:text-sm font-medium text-white/60 hover:text-white min-h-[44px] inline-flex items-center`}>
                {COPY.landing.navFeatures}
              </a>
            </Magnetic>
            <Magnetic>
              <a href="#how" className={`${PILL} px-5 py-2.5 md:px-6 md:py-3 text-xs md:text-sm font-medium text-white/60 hover:text-white min-h-[44px] inline-flex items-center`}>
                {COPY.landing.navHow}
              </a>
            </Magnetic>
            <Magnetic>
              <Link to="/resources" className={`${PILL} px-5 py-2.5 md:px-6 md:py-3 text-xs md:text-sm font-medium text-white/60 hover:text-white min-h-[44px] inline-flex items-center`}>
                {COPY.landing.navResources}
              </Link>
            </Magnetic>
          </div>
        </motion.div>
      </div>

      {/* 3. Giant background wordmark — mount-time entrance (no IO dependency:
          always settles visible even if a scroll restore skips the trigger) */}
      <div
        aria-hidden
        className="pointer-events-none select-none relative z-0 flex justify-center overflow-hidden h-[22vw] md:h-[24vw] max-h-[240px]"
      >
        <span className="whitespace-nowrap font-black leading-[0.85] tracking-[-0.05em] text-[21vw] md:text-[24vw] text-transparent" style={{ WebkitTextStroke: "1px rgba(125,160,245,0.16)" }}>
          DRIVEDECK
        </span>
      </div>

      {/* 4. Bottom bar / credits */}
      <div className="relative z-20 w-full pb-7 px-5 md:px-12 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 md:gap-6">
        <p className="text-white/40 text-[10px] md:text-xs font-semibold uppercase tracking-widest text-center">
          {COPY.landing.footerRights}
        </p>

        <div className={`${PILL} px-5 py-2.5 md:px-6 md:py-3 flex items-center gap-1.5`}>
          <span className="text-white/50 text-[10px] md:text-xs font-bold uppercase tracking-widest">
            {COPY.landing.footerMadePre}
          </span>
          <span aria-hidden className="animate-heartbeat motion-reduce:animate-none text-accent [filter:drop-shadow(0_0_6px_rgba(32,82,235,0.9))]">♥</span>
          <span className="text-white/50 text-[10px] md:text-xs font-bold uppercase tracking-widest">
            {COPY.landing.footerMadePost}
          </span>
        </div>

        <Magnetic>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label={COPY.landing.footerBackToTop}
            title={COPY.landing.footerBackToTop}
            className={`${PILL} w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white/60 hover:text-white group min-h-[44px]`}
          >
            <ArrowUp size={20} aria-hidden className="transform group-hover:-translate-y-1 transition-transform duration-300" />
          </button>
        </Magnetic>
      </div>
    </footer>
  );
}
