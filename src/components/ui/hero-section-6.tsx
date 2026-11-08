// Ported from the 21st.dev hero-section-6 prompt, adapted for DriveDeck:
// - No `next/image` / `next/link` (Vite + react-router) — image slots are
//   CSS-built DriveDeck product mockups instead of external CDN screenshots.
// - `--color-primary` mapped to our accent blue, radial background anchored
//   on cream → blue to keep the project's blue/cream palette focus.
// - All copy from `COPY.landing` (single copy deck, PRD §7.1 discipline).
// - Nav actions wire into the landing page's sign-in flow via props.
import React from "react";
import { Link } from "react-router-dom";
import { motion, MotionConfig, Variants } from "motion/react";
import { BadgeCheck } from "lucide-react";
import { AnimatedGroup } from "./animated-group";
import { COPY } from "../../lib/copy";

interface HeroSection6Props {
  /** Opens the landing page's sign-in card (auth lives in the parent Landing). */
  onGetStarted: () => void;
}

interface Iphone15ProProps extends React.SVGProps<SVGSVGElement> {
  width?: string | number;
  height?: string | number;
}

// iPhone 15 Pro frame — SVG paths ported verbatim from the prompt; the
// screenshot image slot is replaced with in-app React content rendered via
// foreignObject (no binary/CDN assets in the repo).
const Iphone15Pro: React.FC<Iphone15ProProps> = ({
  width = "100%",
  height = "100%",
  className,
  ...props
}) => {
  return (
    <div className={className}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 433 882"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-all duration-500 ease-in-out"
        {...props}
      >
        {/* Outer frame */}
        <path
          d="M2 73C2 32.6832 34.6832 0 75 0H357C397.317 0 430 32.6832 430 73V809C430 849.317 397.317 882 357 882H75C34.6832 882 2 849.317 2 809V73Z"
          className="fill-[#404040]"
        />
        {/* Side buttons */}
        <path d="M0 171C0 170.448 0.447715 170 1 170H3V204H1C0.447715 204 0 203.552 0 203V171Z" className="fill-[#404040]" />
        <path d="M1 234C1 233.448 1.44772 233 2 233H3.5V300H2C1.44772 300 1 299.552 1 299V234Z" className="fill-[#404040]" />
        <path d="M1 319C1 318.448 1.44772 318 2 318H3.5V385H2C1.44772 385 1 384.552 1 384V319Z" className="fill-[#404040]" />
        <path d="M430 279H432C432.552 279 433 279.448 433 280V384C433 384.552 432.552 385 432 385H430V279Z" className="fill-[#404040]" />

        {/* Inner body */}
        <path
          d="M6 74C6 35.3401 37.3401 4 76 4H356C394.66 4 426 35.3401 426 74V808C426 846.66 394.66 878 356 878H76C37.3401 878 6 846.66 6 808V74Z"
          className="fill-[#262626]"
        />

        {/* Top speaker grille */}
        <path
          opacity="0.5"
          d="M174 5H258V5.5C258 6.60457 257.105 7.5 256 7.5H176C174.895 7.5 174 6.60457 174 5.5V5Z"
          className="fill-[#404040]"
        />

        {/* Screen area */}
        <path
          d="M21.25 75C21.25 44.2101 46.2101 19.25 77 19.25H355C385.79 19.25 410.75 44.2101 410.75 75V807C410.75 837.79 385.79 862.75 355 862.75H77C46.2101 862.75 21.25 837.79 21.25 807V75Z"
          className="fill-[#111]"
        />

        {/* Screen content */}
        <foreignObject x="21.25" y="19.25" width="389.5" height="843.5" clipPath="url(#ddRoundedCorners)">
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "55.75px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <PhoneScreen />
          </div>
        </foreignObject>

        {/* Notch area */}
        <path
          d="M154 48.5C154 38.2827 162.283 30 172.5 30H259.5C269.717 30 278 38.2827 278 48.5C278 58.7173 269.717 67 259.5 67H172.5C162.283 67 154 58.7173 154 48.5Z"
          className="fill-[#262626]"
        />
        <path
          d="M249 48.5C249 42.701 253.701 38 259.5 38C265.299 38 270 42.701 270 48.5C270 54.299 265.299 59 259.5 59C253.701 59 249 54.299 249 48.5Z"
          className="fill-[#111]"
        />
        <path
          d="M254 48.5C254 45.4624 256.462 43 259.5 43C262.538 43 265 45.4624 265 48.5C265 51.5376 262.538 54 259.5 54C256.462 54 254 51.5376 254 48.5Z"
          className="fill-white/30"
        />

        <defs>
          <clipPath id="ddRoundedCorners">
            <rect x="21.25" y="19.25" width="389.5" height="843.5" rx="55.75" ry="55.75" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
};

// The DriveDeck app screen inside the iPhone frame — decorative CSS echo of
// the real portfolio surface (score ring, streak, verified drives, board).
// Deliberately dark like the frame's screen fill (#111), in our ink/blue hues.
function PhoneScreen() {
  return (
    <div className="w-full h-full bg-[#0F172A] text-white flex flex-col overflow-hidden">
      <div className="px-6 pt-10 pb-4">
        <p className="text-[11px] text-white/50 font-medium">Ready for placements</p>
        <div className="flex items-end justify-between mt-1">
          <p className="text-[22px] font-bold leading-tight">Hi Kiran</p>
          <svg width="46" height="46" viewBox="0 0 44 44" aria-hidden>
            <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="5" />
            <circle
              cx="22" cy="22" r="18" fill="none" stroke="#2052EB" strokeWidth="5"
              strokeLinecap="round" strokeDasharray="113" strokeDashoffset="32"
              transform="rotate(-90 22 22)"
            />
            <text x="22" y="26" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">72</text>
          </svg>
        </div>
      </div>
      <div className="px-6 flex gap-2">
        <span className="h-6 px-2 rounded-full bg-[#2052EB] text-[10px] font-semibold inline-flex items-center">4-day streak</span>
        <span className="h-6 px-2 rounded-full bg-white/10 text-[10px] font-semibold inline-flex items-center text-white/80">CGPA 8.0</span>
      </div>
      <div className="px-6 mt-4">
        <div className="bg-white/[0.07] rounded-xl border border-white/10 p-3">
          <p className="text-[10px] font-semibold text-white/60 mb-2 uppercase tracking-wide">Verified drives</p>
          {[
            ["TCS NQT", "Verified"],
            ["Infosys off-campus", "Verified"],
            ["Flipkart GRiD", "Applied"],
          ].map(([name, chip]) => (
            <div key={name} className="flex items-center justify-between py-1.5">
              <span className="text-[11px] text-white font-medium">{name}</span>
              <span
                className={`text-[9px] rounded-full px-1.5 py-0.5 font-semibold ${
                  chip === "Verified" ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/15 text-amber-300"
                }`}
              >
                {chip}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0 grid grid-cols-3 gap-2 px-6 py-4">
        {[
          ["Saved", "bg-[#2052EB]/40"],
          ["Applied", "bg-white/10"],
          ["Offer", "bg-emerald-400/20"],
        ].map(([col, tile], i) => (
          <div key={col} className="bg-white/[0.07] rounded-lg border border-white/10 p-1.5">
            <p className="text-[8px] font-semibold text-white/50 mb-1">{col}</p>
            <div className={`h-6 rounded ${tile}`} />
            <div className={`h-4 rounded mt-1 ${i === 1 ? "bg-white/5" : ""}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

// The desktop "screenshot" — pure-CSS browser window echoing the DriveDeck
// dashboard (sidebar + verified-drive feed + kanban board). No images.
function DashboardMockup() {
  return (
    <div className="bg-white/95 backdrop-blur border border-ink/10 shadow-xl rounded-md overflow-hidden text-ink">
      {/* browser chrome */}
      <div className="h-7 bg-white border-b border-ink/10 flex items-center px-3 gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#FF5F57]" />
        <span className="w-2 h-2 rounded-full bg-[#FEBC2E]" />
        <span className="w-2 h-2 rounded-full bg-[#28C840]" />
        <span className="ml-3 h-4 flex-1 max-w-[280px] rounded bg-canvas border border-line text-[9px] text-ink-muted flex items-center px-2">
          drivedeck.pages.dev/dashboard
        </span>
      </div>
      <div className="flex">
        {/* sidebar */}
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
        <div className="flex-1 p-3 sm:p-4 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[9px] text-ink-muted font-medium">Good morning</p>
              <p className="text-[13px] font-bold">Hi Kiran</p>
            </div>
            <div className="flex gap-1.5">
              <span className="h-5 px-2 rounded-full bg-success/10 text-success text-[9px] font-semibold inline-flex items-center">4-day streak</span>
              <span className="h-5 px-2 rounded-full bg-warning/10 text-ink text-[9px] font-semibold inline-flex items-center">2 deadlines</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              ["Placement score", "72"],
              ["Drives verified", "8"],
              ["Applications", "12"],
            ].map(([label, value]) => (
              <div key={label} className="border border-line rounded-lg p-2">
                <p className="text-[8px] text-ink-muted font-medium">{label}</p>
                <p className="text-[14px] font-bold">{value}</p>
              </div>
            ))}
          </div>
          {/* mini kanban */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { col: "Saved", tone: "bg-brand/10", dot: "bg-brand", rows: ["TCS NQT", "Wipro Elite"] },
              { col: "Applied", tone: "bg-blush/60", dot: "bg-accent", rows: ["Infosys", "Flipkart GRiD"] },
              { col: "Offer", tone: "bg-success/10", dot: "bg-success", rows: ["Zoho"] },
            ].map((c) => (
              <div key={c.col} className="bg-canvas border border-line rounded-lg p-1.5">
                <p className="text-[8px] font-semibold text-ink-muted mb-1 flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                  {c.col}
                </p>
                <div className="flex flex-col gap-1">
                  {c.rows.map((r) => (
                    <div key={r} className={`${c.tone} border border-ink/5 rounded px-1.5 py-1 text-[9px] font-medium text-ink`}>{r}</div>
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
      <div className="relative w-full h-screen [--color-primary:#2052EB] overflow-hidden">
        {/* Radial Gradient Background — cream anchor, our blue at the edge */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(125% 125% at 50% 10%, #E3E0DC 40%, var(--color-primary) 100%)",
          }}
        />

        {/* Navbar */}
        <nav className="w-full flex justify-between items-center py-4 px-4 sm:px-6 border-b border-black/10 relative z-10">
          <span className="font-bold text-md tracking-tight">DriveDeck</span>

          <div className="items-center gap-4 hidden md:flex">
            {NAV_ITEMS.map((item) => (
              <Link to={item.href} key={item.name}>
                <span className="text-sm md:text-[1rem] text-ink/50 hover:text-ink transition-colors">
                  {item.name}
                </span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
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
              className="px-3 py-1 text-sm font-medium bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 transition-colors rounded-sm"
            >
              {COPY.landing.navGetStarted}
            </button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="flex flex-col items-center justify-start text-center pt-20 md:pt-10 px-4 pb-0 max-w-7xl mx-auto z-10 relative rounded-none">
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
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight text-ink mb-5 leading-[1.1] px-6 md:px-0">
              {COPY.landing.h1}
            </h1>
            <p className="text-sm sm:text-sm md:text-lg lg:text-xl text-ink/60 max-w-[350px] md:max-w-lg mx-auto mb-6 md:mb-5">
              {COPY.landing.support}
            </p>
            <div className="flex flex-row sm:flex-row items-center justify-center gap-4 w-[300px] md:w-full mb-16 mx-auto">
              <button
                type="button"
                onClick={onGetStarted}
                className="px-1 py-1 md:px-4 md:py-2 text-lg rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white w-full sm:w-auto shadow-lg shadow-[var(--color-primary)]/20 transition-all hover:shadow-[var(--color-primary)]/40 rounded-sm cursor-pointer"
              >
                {COPY.landing.primaryCta}
              </button>
              <Link
                to="/u/kiran"
                className="inline-flex items-center justify-center px-1 py-1 md:px-4 md:py-2 text-lg rounded-md w-full sm:w-auto border border-ink/15 hover:bg-white/60 transition-colors rounded-sm cursor-pointer text-ink"
              >
                {COPY.landing.secondaryCta}
              </Link>
            </div>
          </AnimatedGroup>

          {/* Hero Images Section — CSS-built DriveDeck product surfaces */}
          <div className="relative w-full mx-auto z-20">
            <div className="relative">
              {/* Desktop mockup */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                className="relative w-full max-w-4xl mx-auto rounded-md overflow-hidden shadow-xl"
              >
                <DashboardMockup />
              </motion.div>

              {/* iPhone Frame */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] md:-translate-y-[45%] lg:-translate-y-[55%] w-[150px] sm:w-[220px] md:w-[260px] lg:w-[320px] xl:w-[380px] pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
                  className="drop-shadow-2xl"
                >
                  <Iphone15Pro className="w-full h-[240px] md:h-[420px] lg:h-[480px] xl:h-[540px]" />
                </motion.div>
              </div>
            </div>

            {/* Fade Overlay for both images */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="absolute -bottom-2 left-0 right-0 h-50 md:h-60 lg:h-80 bg-gradient-to-t from-canvas via-canvas/80 to-transparent z-30 pointer-events-none rounded-md"
            />
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
