import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithPopup, signInWithRedirect } from "firebase/auth";
import { ArrowRight, Award, BadgeCheck, FolderGit2, Loader2, X } from "lucide-react";
import { auth } from "../lib/firebase";
import { googleProvider } from "../lib/providers";
import { COPY } from "../lib/copy";
import { useAuth } from "../context/AuthContext";
import { GoogleIcon } from "../components/GoogleIcon";
import { HeroSection6 } from "../components/ui/hero-section-6";
import { CinematicFooter } from "../components/ui/motion-footer";

const CARD_ICONS = [BadgeCheck, FolderGit2, Award] as const;
// reference pairing: dark panel + bright panel, in our blue/cream palette
const CARD_PANELS = [
  "bg-accent text-white",
  "bg-cream text-ink border border-ink/10",
  "bg-ink text-white",
] as const;
const CARD_TILE = [
  "bg-white/20 text-white",
  "bg-white/70 text-ink",
  "bg-white/20 text-white",
] as const;
const CARD_BODY = ["text-white/80", "text-ink/70", "text-white/70"] as const;

const REDUCED = "(prefers-reduced-motion: reduce)";

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

// pointer: fine only — subtle 3D card tilt on mouse move
function tiltMove(e: React.MouseEvent<HTMLElement>) {
  if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia(REDUCED).matches) return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5;
  const y = (e.clientY - r.top) / r.height - 0.5;
  el.style.transform = `perspective(900px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg) translateY(-3px)`;
}
function tiltReset(e: React.MouseEvent<HTMLElement>) {
  e.currentTarget.style.transform = "";
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

      {/* 3 USPs — indigo / mint / cream panels, scroll-revealed, tilt on hover */}
      <section id="features" className="max-w-[1024px] mx-auto px-4 pb-14">
        <div className="grid sm:grid-cols-3 gap-4">
          {COPY.landing.cards.map((c, i) => {
            const Icon = CARD_ICONS[i];
            return (
              <Reveal key={c.title} delay={i * 120}>
                <article
                  onMouseMove={tiltMove}
                  onMouseLeave={tiltReset}
                  className={`rounded-xl p-5 h-full transition-transform duration-300 will-change-transform ${CARD_PANELS[i]}`}
                >
                  <span aria-hidden className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${CARD_TILE[i]}`}>
                    <Icon size={20} strokeWidth={2} />
                  </span>
                  <h3 className="font-semibold text-[15px] mb-2">{c.title}</h3>
                  <p className={`text-[14px] ${CARD_BODY[i]}`}>{c.body}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* how it works — full-bleed indigo block, staggered reveal */}
      <section id="how" className="bg-accent text-white relative overflow-hidden">
        <span aria-hidden className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5" />
        <span aria-hidden className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-white/5" />
        <div className="max-w-[680px] mx-auto px-4 py-12 relative">
          <Reveal>
            <h2 className="text-[22px] font-bold mb-1">{COPY.landing.navHow}</h2>
            <p className="text-white/70 text-[15px] mb-6">{COPY.landing.signInBody}</p>
          </Reveal>
          <ol className="flex flex-col gap-3">
            {COPY.landing.howSteps.map((step, i) => (
              <Reveal key={i} delay={i * 130}>
                <li className="bg-white/10 rounded-xl p-4 flex items-center gap-3">
                  <span
                    aria-hidden
                    className="w-7 h-7 rounded-full bg-white text-accent text-[13px] font-bold flex items-center justify-center shrink-0"
                  >
                    {i + 1}
                  </span>
                  <span className="text-[15px]">{step}</span>
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

      {/* cinematic footer — 21st.dev motion-footer design in DriveDeck palette;
          doubles as the CTA band (old blush band folded into it) */}
      <CinematicFooter onGetStarted={() => { setSignErr(null); setSignInOpen(true); }} />

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

