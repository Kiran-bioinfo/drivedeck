// Ported from the 21st.dev hero-section-6 prompt, adapted for DriveDeck:
// - No `next/image` / `next/link` (Vite + react-router) — the "screenshot" is a
//   CSS-built DriveDeck dashboard mockup instead of an external CDN image.
// - User revision: phone frame removed; the desktop mockup is the single,
//   fully responsive product visual; radial background softened (a calm wash,
//   no projected blue glow).
// - All copy from `COPY.landing` (single copy deck, PRD §7.1 discipline).
// - Nav actions wire into the landing page's sign-in flow via props.
import { Link } from "react-router-dom";
import { motion, MotionConfig, Variants } from "motion/react";
import { BadgeCheck } from "lucide-react";
import { AnimatedGroup } from "./animated-group";
import { COPY } from "../../lib/copy";

interface HeroSection6Props {
  /** Opens the landing page's sign-in card (auth lives in the parent Landing). */
  onGetStarted: () => void;
}

// The desktop "screenshot" — pure-CSS browser window echoing the DriveDeck
// dashboard (sidebar + KPI cards + kanban board). Responsive: the sidebar
// collapses on small screens and type/spacing step down to fit 375px.
function DashboardMockup() {
  return (
    <div className="bg-white/95 backdrop-blur border border-ink/10 shadow-xl rounded-md overflow-hidden text-ink">
      {/* browser chrome */}
      <div className="h-6 sm:h-7 bg-white border-b border-ink/10 flex items-center px-2.5 sm:px-3 gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#FF5F57]" />
        <span className="w-2 h-2 rounded-full bg-[#FEBC2E]" />
        <span className="w-2 h-2 rounded-full bg-[#28C840]" />
        <span className="hidden xs:inline-block ml-2 h-4 min-w-0 max-w-[280px] flex-1 rounded bg-canvas border border-line text-[9px] text-ink-muted items-center px-2 truncate">
          drivedeck.pages.dev/dashboard
        </span>
      </div>
      <div className="flex">
        {/* sidebar — collapses on small screens */}
        <div className="hidden sm:flex w-32 shrink-0 flex-col gap-1 p-3 border-r border-line bg-canvas/60">
          <span className="font-bold text-[11px] text-brand mb-2 px-1">DriveDeck</span>
          {["Dashboard", "Board", "Drives", "Resources", "Portfolio"].map((item, i) => (
            <span
              key={item}
              className={`text-[10px] font-medium rounded px-1.5 py-1 ${i === 0 ? "bg-accent/10 text-accent" : "text-ink-muted"}`}
            >
              {item}
            </span>
          ))}
        </div>
        {/* main */}
        <div className="flex-1 min-w-0 p-2.5 sm:p-4 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5 sm:mb-3">
            <div>
              <p className="text-[8px] sm:text-[9px] text-ink-muted font-medium">Good morning</p>
              <p className="text-[11px] sm:text-[13px] font-bold">Hi Kiran</p>
            </div>
            <div className="flex gap-1.5">
              <span className="h-5 px-1.5 sm:px-2 rounded-full bg-success/10 text-success text-[8px] sm:text-[9px] font-semibold inline-flex items-center whitespace-nowrap">4-day streak</span>
              <span className="h-5 px-1.5 sm:px-2 rounded-full bg-warning/10 text-ink text-[8px] sm:text-[9px] font-semibold inline-flex items-center whitespace-nowrap">2 deadlines</span>
            </div>
          </div>
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-2.5 sm:mb-3">
            {[
              ["Placement score", "72"],
              ["Drives verified", "8"],
              ["Applications", "12"],
            ].map(([label, value]) => (
              <div key={label} className="border border-line rounded-md sm:rounded-lg p-1.5 sm:p-2 min-w-0">
                <p className="text-[7px] sm:text-[8px] text-ink-muted font-medium truncate">{label}</p>
                <p className="text-[11px] sm:text-[14px] font-bold">{value}</p>
              </div>
            ))}
          </div>
          {/* mini kanban */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {[
              { col: "Saved", tone: "bg-brand/10", dot: "bg-brand", rows: ["TCS NQT", "Wipro Elite"] },
              { col: "Applied", tone: "bg-blush/60", dot: "bg-accent", rows: ["Infosys", "Flipkart GRiD"] },
              { col: "Offer", tone: "bg-success/10", dot: "bg-success", rows: ["Zoho"] },
            ].map((c) => (
              <div key={c.col} className="bg-canvas border border-line rounded-md sm:rounded-lg p-1 sm:p-1.5 min-w-0">
                <p className="text-[7px] sm:text-[8px] font-semibold text-ink-muted mb-1 flex items-center gap-1 truncate">
                  <span className={`w-1.5 h-1.5 rounded-full ${c.dot} shrink-0`} />
                  {c.col}
                </p>
                <div className="flex flex-col gap-1">
                  {c.rows.map((r) => (
                    <div key={r} className={`${c.tone} border border-ink/5 rounded px-1 sm:px-1.5 py-0.5 sm:py-1 text-[8px] sm:text-[9px] font-medium text-ink truncate`}>
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const NAV_ITEMS = [
  { name: COPY.landing.navFeatures, href: "#features" },
  { name: COPY.landing.navHow, href: "#how" },
  { name: COPY.landing.navResources, href: "/resources" },
];

export function HeroSection6({ onGetStarted }: HeroSection6Props) {
  const textVariants: Variants = {
    hidden: { opacity: 0, filter: "blur(10px)", y: 20 },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.2,
        duration: 1,
      },
    },
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative w-full min-h-screen overflow-hidden">
        {/* Background — calm wash: white core → cream → a whisper of blue at the
            very edge (no projected-beam glow) */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(125% 115% at 50% 8%, #FFFFFF 40%, rgba(227,224,220,0.85) 64%, rgba(32,82,235,0.18) 100%)",
          }}
        />

        {/* Navbar */}
        <nav className="w-full relative z-10 flex justify-between items-center py-4 px-4 sm:px-6 border-b border-black/10">
          <span className="font-bold text-base tracking-tight">DriveDeck</span>

          <div className="items-center gap-4 hidden md:flex">
            {NAV_ITEMS.map((item) => (
              <Link to={item.href} key={item.name}>
                <span className="text-sm md:text-[1rem] text-ink/50 hover:text-ink transition-colors">
                  {item.name}
                </span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={onGetStarted}
              className="px-3 py-1 text-sm font-medium border border-ink/15 text-ink hover:bg-white/60 transition-colors rounded-sm"
            >
              {COPY.landing.secondaryCta}
            </button>
            <button
              type="button"
              onClick={onGetStarted}
              className="px-3 py-1 text-sm font-medium bg-accent text-white hover:bg-accent/90 transition-colors rounded-sm"
            >
              {COPY.landing.navGetStarted}
            </button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center text-center pt-14 md:pt-16 px-4 pb-0 max-w-7xl mx-auto">
          <AnimatedGroup
            className="max-w-4xl mx-auto text-center flex flex-col items-center"
            variants={{
              container: {
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              },
              item: textVariants,
            }}
          >
            <p className="inline-flex w-fit items-center gap-1.5 h-8 px-3 rounded-full bg-white/60 backdrop-blur border border-ink/10 text-ink text-[13px] font-medium mb-4">
              <BadgeCheck size={14} strokeWidth={2.5} aria-hidden className="text-success" />
              {COPY.landing.trust}
            </p>
            <h1 className="text-[30px] md:text-4xl lg:text-6xl font-bold tracking-tight text-ink mb-4 md:mb-5 leading-[1.1] px-2 md:px-0">
              {COPY.landing.h1}
            </h1>
            <p className="text-[15px] md:text-lg text-ink/60 max-w-[420px] md:max-w-lg mx-auto mb-6 md:mb-8">
              {COPY.landing.support}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 w-[300px] sm:w-full mb-10 md:mb-14 mx-auto">
              <button
                type="button"
                onClick={onGetStarted}
                className="w-full sm:w-auto px-6 py-2.5 text-[15px] md:text-base rounded-md bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20 transition-all hover:shadow-accent/30 cursor-pointer"
              >
                {COPY.landing.primaryCta}
              </button>
              <Link
                to="/u/kiran"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 text-[15px] md:text-base rounded-md border border-ink/15 hover:bg-white/60 transition-colors cursor-pointer text-ink"
              >
                {COPY.landing.secondaryCta}
              </Link>
            </div>
          </AnimatedGroup>

          {/* Product visual — the CSS dashboard mockup, one clean centerpiece */}
          <div className="relative w-full max-w-4xl mx-auto z-20">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="relative w-full rounded-md overflow-hidden shadow-xl"
            >
              <DashboardMockup />
            </motion.div>

            {/* Fade overlay — dissolves the mockup's bottom into the page */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="absolute -bottom-2 left-0 right-0 h-28 sm:h-36 md:h-44 bg-gradient-to-t from-canvas via-canvas/80 to-transparent z-30 pointer-events-none rounded-md"
            />
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
