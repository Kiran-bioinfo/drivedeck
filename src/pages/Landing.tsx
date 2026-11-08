import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithPopup, signInWithRedirect } from "firebase/auth";
import { ArrowRight } from "lucide-react";
import { auth } from "../lib/firebase";
import { googleProvider } from "../lib/providers";
import { COPY } from "../lib/copy";
import { useAuth } from "../context/AuthContext";

// PRD §F0 — pitch in two screens; signed-in visitors skip straight to the dashboard.
export function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate("/dashboard", { replace: true });
  }, [loading, user, navigate]);

  async function start() {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard", { replace: true });
    } catch {
      // popup blocked or dismissed → Google redirect fallback (PRD §10.1);
      // onAuthStateChanged then routes to /dashboard from this same page.
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch {
        /* user cancelled; stay on landing */
      }
    }
  }

  return (
    <div className="min-h-screen bg-canvas px-4">
      <header className="max-w-[1024px] mx-auto flex items-center justify-between h-16">
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
        </nav>
      </header>

      <main className="max-w-[1024px] mx-auto" id="features">
        <section className="text-center py-12 lg:py-20">
          <h1 className="text-[32px] lg:text-[44px] leading-[1.15] font-bold mb-4">{COPY.landing.h1}</h1>
          <p className="text-[17px] lg:text-[19px] text-ink-muted max-w-[560px] mx-auto mb-8">
            {COPY.landing.support}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-[420px] mx-auto">
            <button
              type="button"
              onClick={start}
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
          <p className="text-[13px] text-ink-muted mt-4">{COPY.landing.trust}</p>
        </section>

        <section className="grid sm:grid-cols-3 gap-4 pb-12">
          {COPY.landing.cards.map((c, i) => (
            <article key={c.title} className="bg-surface border border-line rounded-xl shadow-card p-5">
              <h3 className="font-semibold text-[15px] mb-2">{c.title}</h3>
              <p className="text-[15px] text-ink-muted">{c.body}</p>
              <span aria-hidden className="sr-only">{`Card ${i + 1}`}</span>
            </article>
          ))}
        </section>

        <section id="how" className="pb-12 max-w-[640px] mx-auto">
          <h2 className="text-[20px] font-bold mb-4">{COPY.landing.navHow}</h2>
          <ol className="flex flex-col gap-3">
            {[
              "Sign in with Google — 2 minutes of setup, either setup.",
              "Save verified drives that match your profile.",
              "Log evidence with its link — your score and portfolio update themselves.",
            ].map((step, i) => (
              <li key={i} className="bg-surface border border-line rounded-xl shadow-card p-4 flex items-center gap-3">
                <span
                  aria-hidden
                  className="w-7 h-7 rounded-full bg-brand text-white text-[13px] font-bold flex items-center justify-center shrink-0"
                >
                  {i + 1}
                </span>
                <span className="text-[15px]">{step}</span>
              </li>
            ))}
          </ol>
          <Link
            to="/resources"
            className="mt-4 inline-flex items-center gap-1 text-[15px] font-medium text-brand hover:text-brand-dark"
          >
            {COPY.landing.navResources}
            <ArrowRight size={16} aria-hidden />
          </Link>
        </section>
      </main>

      <footer className="border-t border-line py-6 text-center">
        <p className="text-[13px] text-ink-muted">{COPY.landing.trust}</p>
        <p className="text-[12px] text-ink-muted mt-1">{COPY.landing.footer}</p>
      </footer>
    </div>
  );
}
