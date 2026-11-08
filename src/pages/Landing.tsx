import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithPopup, signInWithRedirect } from "firebase/auth";
import { ArrowRight, Award, BadgeCheck, FolderGit2, Loader2, X } from "lucide-react";
import { auth } from "../lib/firebase";
import { googleProvider } from "../lib/providers";
import { COPY } from "../lib/copy";
import { useAuth } from "../context/AuthContext";
import { GoogleIcon } from "../components/GoogleIcon";

const CARD_ICONS = [BadgeCheck, FolderGit2, Award] as const;
const CARD_PANELS = [
  "bg-accent text-white",
  "bg-blush text-ink",
  "bg-surface border border-line shadow-card text-ink",
] as const;
const CARD_TILE = [
  "bg-white/20 text-white",
  "bg-white/70 text-ink",
  "bg-brand/10 text-brand",
] as const;

// PRD §F0 — pitch in two screens; signed-in visitors skip straight to the dashboard.
// Design: SVG reference — indigo/blush/white panels, phone-mockup hero, sign-in card.
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
      <header className="max-w-[1024px] mx-auto flex items-center justify-between h-16 px-4">
        <span className="font-bold text-lg text-brand">DriveDeck</span>
        <nav className="flex items-center gap-4">
          <a href="#features" className="text-[15px] text-ink-muted hover:text-ink hidden sm:inline-block">
            {COPY.landing.navFeatures}
          </a>
          <a href="#how" className="text-[15px] text-ink-muted hover:text-ink hidden sm:inline-block">
            {COPY.landing.navHow}
          </a>
          <Link to="/resources" className="text-[15px] text-ink-muted hover:text-ink">
            {COPY.landing.navResources}
          </Link>
          <button
            type="button"
            onClick={() => { setSignErr(null); setSignInOpen(true); }}
            className="h-9 px-3 rounded-lg bg-brand text-white text-[14px] font-semibold hover:bg-brand-dark transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            {COPY.landing.navGetStarted}
          </button>
        </nav>
      </header>

      {/* hero — copy left, phone mockup right (stacks at 375px) */}
      <section className="max-w-[1024px] mx-auto px-4 pt-8 lg:pt-14 pb-12 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
        <div>
          <p className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-blush text-ink text-[13px] font-medium mb-4">
            <BadgeCheck size={14} strokeWidth={2.5} aria-hidden />
            {COPY.landing.trust}
          </p>
          <h1 className="text-[34px] lg:text-[46px] leading-[1.12] font-bold tracking-tight mb-4">
            {COPY.landing.h1}
          </h1>
          <p className="text-[17px] lg:text-[19px] text-ink-muted max-w-[520px] mb-8">
            {COPY.landing.support}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-[420px]">
            <button
              type="button"
              onClick={() => { setSignErr(null); setSignInOpen(true); }}
              className="h-12 px-6 rounded-lg bg-brand text-white text-[15px] font-semibold hover:bg-brand-dark transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              {COPY.landing.primaryCta}
            </button>
            <Link
              to="/u/kiran"
              className="h-12 px-6 rounded-lg border border-line text-[15px] font-semibold text-ink hover:bg-surface transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 flex items-center justify-center"
            >
              {COPY.landing.secondaryCta}
            </Link>
          </div>
        </div>
        <PhoneMockup />
      </section>

      {/* 3 USPs — indigo / blush / white panels per the reference grid */}
      <section id="features" className="max-w-[1024px] mx-auto px-4 pb-12">
        <div className="grid sm:grid-cols-3 gap-4">
          {COPY.landing.cards.map((c, i) => {
            const Icon = CARD_ICONS[i];
            return (
              <article key={c.title} className={`rounded-xl p-5 ${CARD_PANELS[i]}`}>
                <span aria-hidden className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${CARD_TILE[i]}`}>
                  <Icon size={20} strokeWidth={2} />
                </span>
                <h3 className="font-semibold text-[15px] mb-2">{c.title}</h3>
                <p className={`text-[14px] ${i === 0 ? "text-white/80" : i === 1 ? "text-ink/70" : "text-ink-muted"}`}>{c.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* how it works — full-bleed indigo block */}
      <section id="how" className="bg-accent text-white">
        <div className="max-w-[680px] mx-auto px-4 py-12">
          <h2 className="text-[22px] font-bold mb-1">{COPY.landing.navHow}</h2>
          <p className="text-white/70 text-[15px] mb-6">{COPY.landing.signInBody}</p>
          <ol className="flex flex-col gap-3">
            {COPY.landing.howSteps.map((step, i) => (
              <li key={i} className="bg-white/10 rounded-xl p-4 flex items-center gap-3">
                <span
                  aria-hidden
                  className="w-7 h-7 rounded-full bg-white text-accent text-[13px] font-bold flex items-center justify-center shrink-0"
                >
                  {i + 1}
                </span>
                <span className="text-[15px]">{step}</span>
              </li>
            ))}
          </ol>
          <Link
            to="/resources"
            className="mt-5 inline-flex items-center gap-1 text-[15px] font-semibold text-white hover:text-blush"
          >
            {COPY.landing.navResources}
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </section>

      {/* CTA band — blush panel, pricing-card feel */}
      <section className="max-w-[1024px] mx-auto px-4 py-12">
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
    <div aria-hidden className="relative mx-auto w-[250px] lg:w-[270px] select-none">
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
      <span className="absolute -right-2 top-24 h-8 px-3 rounded-full bg-blush text-ink text-[12px] font-semibold inline-flex items-center shadow-elev rotate-3">
        Offer! 🎉
      </span>
    </div>
  );
}
