import { useEffect, useRef, useState, Suspense, lazy } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithPopup, signInWithRedirect } from "firebase/auth";
import { ArrowRight, Award, BadgeCheck, FolderGit2, Loader2, X } from "lucide-react";
import { auth } from "../lib/firebase";
import { googleProvider } from "../lib/providers";
import { COPY } from "../lib/copy";
import { useAuth } from "../context/AuthContext";
import { GoogleIcon } from "../components/GoogleIcon";

// three lives in its own lazy chunk — the landing-pitch entry point only (README "Why three")
const HeroCanvas = lazy(() => import("../components/HeroCanvas"));

const CARD_ICONS = [BadgeCheck, FolderGit2, Award] as const;
const CARD_PANELS = [
  "bg-accent text-white",
  "bg-cream text-ink border border-ink/10",
  "bg-mint text-ink border border-ink/10",
] as const;
const CARD_TILE = [
  "bg-white/20 text-white",
  "bg-white/70 text-ink",
  "bg-brand/10 text-brand",
] as const;
const CARD_BODY = ["text-white/80", "text-ink/70", "text-ink-muted"] as const;

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
      <header className="max-w-[1024px] mx-auto flex items-center justify-between h-16 px-4 relative z-20">
        <span className="font-bold text-lg text-brand">DriveDeck</span>
        <nav className="flex items-center gap-4">
          <a href="#features" className="text-[15px] text-ink-muted hover:text-ink hidden sm:inline-block">
            {COPY.landing.navFeatures}
          </a>
          <a href="#how" className="text-[15px] text-ink-muted hover:text-ink hidden sm:inline-block">
            {COPY.landing.navHow}
          </a>
          <Link to="/resources" className="text-[15px] text-ink-muted hover:text-ink hidden xs:inline-block">
            {COPY.landing.navResources}
          </Link>
          <button
            type="button"
            onClick={() => { setSignErr(null); setSignInOpen(true); }}
            className="h-9 px-3 rounded-lg bg-ink text-white text-[14px] font-semibold hover:bg-ink/85 transition-all hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            {COPY.landing.navGetStarted}
          </button>
        </nav>
      </header>

      {/*
        hero — the reference layout: two large rounded panels, cream (pitch)
        + mint (product), side by side with a small gap; the 3D scene lives
        contained inside the mint panel behind the phone mockup.
      */}
      <section className="max-w-[1024px] mx-auto px-4 pt-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* cream panel — pitch */}
          <div className="rounded-xl bg-cream p-7 lg:p-12 flex flex-col justify-center animate-rise">
            <p className="inline-flex w-fit items-center gap-1.5 h-8 px-3 rounded-full bg-white/80 text-ink text-[13px] font-medium mb-5">
              <BadgeCheck size={14} strokeWidth={2.5} aria-hidden className="text-success" />
              {COPY.landing.trust}
            </p>
            <h1 className="text-[32px] lg:text-[42px] leading-[1.14] font-bold tracking-tight mb-4">
              {COPY.landing.h1}
            </h1>
            <p className="text-[16px] lg:text-[18px] text-ink-muted max-w-[420px] mb-7">
              {COPY.landing.support}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => { setSignErr(null); setSignInOpen(true); }}
                className="h-12 px-6 rounded-lg bg-brand text-white text-[15px] font-semibold hover:bg-brand-dark hover:-translate-y-0.5 shadow-elev transition-all focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                {COPY.landing.primaryCta}
              </button>
              <Link
                to="/u/kiran"
                className="h-12 px-6 rounded-lg border border-ink/15 bg-white/70 text-[15px] font-semibold text-ink hover:bg-white transition-all focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 flex items-center justify-center"
              >
                {COPY.landing.secondaryCta}
              </Link>
            </div>
          </div>

          {/* mint panel — product: 3D mascots orbit the phone (lazy three chunk) */}
          <div className="relative rounded-xl bg-mint overflow-hidden min-h-[400px] md:min-h-[480px] animate-rise" style={{ animationDelay: "120ms" }}>
            <Suspense fallback={null}>
              <HeroCanvas />
            </Suspense>
            <div className="relative z-10 h-full min-h-[400px] md:min-h-[480px] flex items-center justify-center py-8">
              <div className="animate-float-slow">
                <PhoneMockup />
              </div>
            </div>
            <span aria-hidden className="absolute left-5 top-5 z-10 h-8 px-3 rounded-full bg-white/85 backdrop-blur text-ink text-[12px] font-semibold inline-flex items-center gap-1 shadow-elev -rotate-3 animate-float">
              <BadgeCheck size={13} className="text-success" aria-hidden />
              4-day streak
            </span>
            <span aria-hidden className="absolute right-5 bottom-6 z-10 h-8 px-3 rounded-full bg-blush text-ink text-[12px] font-semibold inline-flex items-center shadow-elev rotate-3 animate-float">
              Offer! 🎉
            </span>
          </div>
        </div>
      </section>

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

      {/* CTA band */}
      <section className="max-w-[1024px] mx-auto px-4 py-12">
        <Reveal>
          <div className="bg-blush rounded-xl p-8 text-center">
            <h2 className="text-[24px] font-bold text-ink mb-3">{COPY.landing.ctaTitle}</h2>
            <p className="text-[15px] text-ink/70 max-w-[420px] mx-auto mb-6">{COPY.landing.signInBody}</p>
            <button
              type="button"
              onClick={() => { setSignErr(null); setSignInOpen(true); }}
              className="h-12 px-6 rounded-lg bg-brand text-white text-[15px] font-semibold hover:bg-brand-dark transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              {COPY.landing.primaryCta}
            </button>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-line">
        <div className="max-w-[1024px] mx-auto px-4 py-8 grid sm:grid-cols-3 gap-6">
          <div>
            <span className="font-bold text-lg text-brand">DriveDeck</span>
            <p className="text-[13px] text-ink-muted mt-2">{COPY.landing.trust}</p>
            <p className="text-[12px] text-ink-muted mt-1">{COPY.landing.footer}</p>
          </div>
          <nav aria-label="Product" className="flex flex-col gap-2 text-[14px]">
            <span className="font-semibold text-[13px] uppercase tracking-wide text-ink-muted mb-1">Product</span>
            <a href="#features" className="text-ink-muted hover:text-ink w-fit">{COPY.landing.navFeatures}</a>
            <a href="#how" className="text-ink-muted hover:text-ink w-fit">{COPY.landing.navHow}</a>
            <Link to="/resources" className="text-ink-muted hover:text-ink w-fit">{COPY.landing.navResources}</Link>
          </nav>
          <nav aria-label="Start" className="flex flex-col gap-2 text-[14px]">
            <span className="font-semibold text-[13px] uppercase tracking-wide text-ink-muted mb-1">Start</span>
            <button
              type="button"
              onClick={() => { setSignErr(null); setSignInOpen(true); }}
              className="text-ink-muted hover:text-ink text-left w-fit"
            >
              {COPY.landing.primaryCta}
            </button>
            <Link to="/u/kiran" className="text-ink-muted hover:text-ink w-fit">{COPY.landing.secondaryCta}</Link>
          </nav>
        </div>
      </footer>

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

// Product shot, pure CSS — the mini dashboard echoes the real app surfaces
// (greeting + score ring, deadline chips, three board columns). No images.
function PhoneMockup() {
  return (
    <div aria-hidden className="relative mx-auto w-[230px] lg:w-[260px] select-none">
      <div className="rounded-[2rem] bg-ink p-2 shadow-elev">
        <div className="rounded-[1.55rem] bg-canvas overflow-hidden">
          <div className="h-7 flex items-center justify-center">
            <span className="w-14 h-1.5 rounded-full bg-ink/15" />
          </div>
          <div className="px-3 pb-5 flex flex-col gap-2.5">
            <div className="bg-surface rounded-xl border border-line p-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-ink-muted font-medium">Ready for placements</p>
                <p className="text-[15px] font-bold text-ink leading-tight">Hi Kiran</p>
              </div>
              <svg width="44" height="44" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="18" fill="none" stroke="#E2E8F0" strokeWidth="5" />
                <circle
                  cx="22" cy="22" r="18" fill="none" stroke="#4F46E5" strokeWidth="5"
                  strokeLinecap="round" strokeDasharray="113" strokeDashoffset="32"
                  transform="rotate(-90 22 22)"
                />
                <text x="22" y="26" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0F172A">72</text>
              </svg>
            </div>
            <div className="flex gap-2">
              <span className="h-6 px-2 rounded-full bg-success/10 text-success text-[10px] font-semibold inline-flex items-center">4-day streak</span>
              <span className="h-6 px-2 rounded-full bg-warning/10 text-[10px] font-semibold inline-flex items-center text-ink">2 deadlines</span>
            </div>
            <div className="bg-surface rounded-xl border border-line p-2.5">
              <p className="text-[10px] font-semibold text-ink mb-1.5">Deadlines</p>
              {["TCS NQT", "Infosys off-campus"].map((d) => (
                <div key={d} className="flex items-center justify-between py-1">
                  <span className="text-[11px] text-ink font-medium">{d}</span>
                  <span className="text-[10px] text-ink-muted bg-canvas border border-line rounded-full px-1.5">Verified</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {["Saved", "Applied", "Offer"].map((col, i) => (
                <div key={col} className="bg-surface rounded-lg border border-line p-1.5">
                  <p className="text-[8px] font-semibold text-ink-muted mb-1">{col}</p>
                  <div className={`h-6 rounded ${["bg-brand/20", "bg-blush", "bg-success/20"][i]}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
