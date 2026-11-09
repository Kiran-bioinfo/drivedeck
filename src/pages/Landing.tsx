import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithPopup, signInWithRedirect } from "firebase/auth";
import { ArrowRight, Loader2, X } from "lucide-react";
import { auth } from "../lib/firebase";
import { googleProvider } from "../lib/providers";
import { COPY } from "../lib/copy";
import { useAuth } from "../context/AuthContext";
import { GoogleIcon } from "../components/GoogleIcon";
import { Logo } from "../components/Logo";
import { HeroSection6 } from "../components/ui/hero-section-6";
import { ScrollingStory } from "../components/ui/scrolling-story";
import DoodleCrewFooter, { type CrewMember, type FooterColumn } from "../components/ui/doodle-crew-footer";

const REDUCED = "(prefers-reduced-motion: reduce)";

// Doodle-footer crew placements for the DRIVEDECK wordmark (D R I V E D E C K):
// strings come from the copy deck (COPY.landing.footerCrew), layout lives here.
const CREW_SEATS: [number, CrewMember["seat"] | undefined, number?][] = [
  [0, "front", -0.32],  // yeti against the D
  [2, "top", 0.02],     // bird on the I
  [3, "front", 0.12],   // mushroom by the V
  [5, "top", -0.05],    // kid on the D
  [6, "behind", 0],     // ghost peeks over the E
  [8, "front", 0.18],   // cat past the K
];
const CREW = COPY.landing.footerCrew.map((c, i): CrewMember => ({
  kind: c.kind as CrewMember["kind"],
  letter: CREW_SEATS[i][0],
  seat: CREW_SEATS[i][1],
  offset: CREW_SEATS[i][2],
  name: c.name,
  says: c.says,
}));

const FOOTER_COLUMNS: FooterColumn[] = [
  { title: "Explore", links: [
    { label: COPY.landing.navFeatures, href: "#features" },
    { label: COPY.landing.navHow, href: "#how" },
    { label: COPY.landing.navResources, href: "/resources", onClick: navigateLater },
  ] },
  { title: "Demo", links: [
    { label: COPY.landing.secondaryCta, href: "/u/kiran", onClick: navigateLater },
  ] },
];

/** SPA-friendly handler handed to plain anchors: router nav, href as fallback. */
function navigateLater(e: React.MouseEvent) {
  // preventDefault not needed if we let href do a full load; but full reload
  // would re-run Firebase init per click — route internally instead once the
  // router hook is in scope via a bound closure (see FOOTER_NAV).
  if (FOOTER_NAV) {
    e.preventDefault();
    FOOTER_NAV(e.currentTarget.getAttribute("href") || "/");
  }
}
let FOOTER_NAV: ((to: string) => void) | null = null;

/** DoodleCrewFooter wired to DriveDeck: navigate hook + palette. */
function DoodleFooter() {
  const navigate = useNavigate();
  useEffect(() => {
    FOOTER_NAV = navigate;
    return () => { FOOTER_NAV = null; };
  }, [navigate]);

  return (
    <DoodleCrewFooter
      wordmark="DRIVEDECK"
      brand="DriveDeck"
      blurb={COPY.landing.support}
      tagline=""
      columns={FOOTER_COLUMNS}
      actions={[]}
      copyright={COPY.landing.footerRights}
      legal={[{ label: COPY.landing.footer }]} // plain label, no dead links
      socials={[]}
      backToTop
      crew={CREW}
      doodles={["bolt", "star", "plane", "heart", "sparkle", "flame", "plane", "star"]}
      doodleCount={10}
      palette={{ background: "#FFFDF8", ink: "#0F172A", accent: "#2052EB" }}
      height="700px"
    />
  );
}

// scroll-triggered entrance — IntersectionObserver, no deps
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia(REDUCED).matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out will-change-transform ${shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} ${className}`}
    >
      {children}
    </div>
  );
}

// PRD §F0 — pitch in two screens; signed-in visitors skip straight to the dashboard.
// Interactive hero: WebGL cluster behind the copy + CSS phone mockup (README "Why three").
export function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [signInOpen, setSignInOpen] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [signErr, setSignErr] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) navigate("/dashboard", { replace: true });
  }, [loading, user, navigate]);

  async function start() {
    setSignErr(null);
    setSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard", { replace: true });
    } catch (e) {
      const code = (e as { code?: string }).code ?? "";
      if (
        code === "auth/popup-blocked" ||
        code === "auth/operation-not-supported-in-this-environment"
      ) {
        // popup blocked → Google redirect fallback (PRD §10.1);
        // onAuthStateChanged then routes to /dashboard from this same page.
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch {
          /* stay on landing */
        }
      } else if (
        code !== "auth/popup-closed-by-user" &&
        code !== "auth/cancelled-popup-request"
      ) {
        // cancelled popups are the user's choice — silence them, surface the rest
        setSignErr(COPY.landing.signInError);
      }
    } finally {
      setSigningIn(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      {/* hero — 21st.dev hero-section-6 layout (radial blue gradient, centered copy,
          CSS dashboard + iPhone frame), DriveDeck content + blue/cream palette;
          nav + CTAs wire into the sign-in card */}
      <HeroSection6 onGetStarted={() => { setSignErr(null); setSignInOpen(true); }} />

      {/* scrolling story — 21st.dev interactive-scrolling-story behavior rebuilt on
          motion useScroll (zero new deps): sticky viewport, copy crossfades left,
          CSS-drawn visuals slide in right; copy strings = COPY.landing.cards */}
      <ScrollingStory />

      {/* how it works — full-bleed indigo block, staggered reveal */}
      <section id="how" className="bg-accent text-white relative overflow-hidden">
        <span aria-hidden className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5" />
        <span aria-hidden className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-white/5" />
        <div className="max-w-[680px] mx-auto px-4 py-12 relative">
          <Reveal>
            <h2 className="text-[22px] font-bold mb-1">{COPY.landing.navHow}</h2>
            <p className="text-white/70 text-[15px] mb-6">{COPY.landing.signInBody}</p>
          </Reveal>
          <ol className="flex flex-col sm:flex-row gap-3">
            {COPY.landing.howSteps.map((step, i) => (
              <Reveal key={i} delay={i * 130} className="flex-1">
                <li className="bg-white/10 rounded-xl p-4 sm:p-5 h-full flex sm:flex-col items-center sm:items-center gap-3 sm:gap-2 sm:text-center">
                  <span
                    aria-hidden
                    className="w-7 h-7 rounded-full bg-white text-accent text-[13px] font-bold flex items-center justify-center shrink-0"
                  >
                    {i + 1}
                  </span>
                  <span className="text-[15px] sm:text-[14px] sm:leading-[1.5]">{step}</span>
                </li>
              </Reveal>
            ))}
          </ol>
          <Reveal delay={420}>
            <Link
              to="/resources"
              className="mt-5 inline-flex items-center gap-1 text-[15px] font-semibold text-white hover:text-blush"
            >
              {COPY.landing.navResources}
              <ArrowRight size={16} aria-hidden />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* doodle crew footer — sketchbook-scale footer with the DRIVEDECK crew;
          palette = paper/ink/accent tokens, every link is a real destination */}
      <DoodleFooter />

      {signInOpen && (
        <div className="fixed inset-0 z-50 lg:grid lg:place-items-center">
          <div className="absolute inset-0 bg-ink/20" onClick={() => !signingIn && setSignInOpen(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={COPY.landing.signInTitle}
            className="absolute bottom-0 w-full bg-surface rounded-t-xl shadow-elev p-6 lg:relative lg:w-full lg:max-w-[400px] lg:rounded-xl"
          >
            <button
              type="button"
              aria-label={COPY.onboarding.back}
              onClick={() => !signingIn && setSignInOpen(false)}
              className="absolute right-3 top-3 p-2 text-ink-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-brand rounded-md"
            >
              <X size={20} aria-hidden />
            </button>
            <span className="inline-flex items-center gap-2 font-bold text-[15px] tracking-tight mb-4">
              <Logo size={26} />
              DriveDeck
            </span>
            <span aria-hidden className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-4">
              <GoogleIcon size={24} />
            </span>
            <h2 className="font-bold text-lg mb-1">{COPY.landing.signInTitle}</h2>
            <p className="text-[14px] text-ink-muted mb-5">{COPY.landing.signInBody}</p>
            <button
              type="button"
              onClick={start}
              disabled={signingIn}
              className="w-full h-12 rounded-lg border border-line bg-surface flex items-center justify-center gap-2 text-[15px] font-semibold text-ink hover:bg-canvas transition-colors disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              {signingIn ? <Loader2 size={18} className="animate-spin" aria-hidden /> : <GoogleIcon size={18} />}
              {signingIn ? COPY.landing.signInLoading : COPY.landing.signInButton}
            </button>
            {signErr && <p className="text-[13px] text-danger mt-3" role="alert">{signErr}</p>}
            <p className="text-[12px] text-ink-muted mt-4 text-center">{COPY.landing.trust}</p>
          </div>
        </div>
      )}
    </div>
  );
}

