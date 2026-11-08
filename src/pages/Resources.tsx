import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, BookOpen, LogIn } from "lucide-react";
import { signInWithPopup } from "firebase/auth";
import { auth } from "../lib/firebase";
import { googleProvider } from "../lib/providers";
import { COPY, RESOURCES } from "../lib/copy";
import { useAuth } from "../context/AuthContext";

// PRD §11 (v1.1) — public, pre-login value: hand-checked links, nothing dynamic.
export function Resources() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-canvas px-4 py-8 max-w-[680px] mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[24px] leading-[30px] font-bold mb-1">{COPY.resources.h1}</h1>
          <p className="text-[15px] text-ink-muted">{COPY.resources.sub}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-8">
        {RESOURCES.map((r) => (
          <a
            key={r.url}
            href={r.url}
            target="_blank"
            rel="noopener"
            className="bg-surface border border-line rounded-xl shadow-card p-4 flex items-start gap-3 hover:shadow-elev transition-shadow focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            <span aria-hidden className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0">
              <BookOpen size={15} strokeWidth={2} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1 font-semibold text-[15px]">
                {r.title}
                <ArrowUpRight size={14} aria-hidden className="text-ink-muted" />
              </span>
              <span className="block text-[13px] text-ink-muted mt-0.5">{r.why}</span>
            </span>
          </a>
        ))}
      </div>

      <div className="flex gap-2 pb-8">
        {user ? (
          <Link
            to="/dashboard"
            className="flex-1 h-11 flex items-center justify-center rounded-lg bg-brand text-white text-[15px] font-semibold hover:bg-brand-dark transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            {COPY.nav.home}
          </Link>
        ) : (
          <>
            <button
              type="button"
              onClick={() => signInWithPopup(auth, googleProvider).then(() => navigate("/dashboard"))}
              className="flex-1 h-11 flex items-center justify-center gap-2 rounded-lg bg-brand text-white text-[15px] font-semibold hover:bg-brand-dark transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <LogIn size={18} strokeWidth={2} aria-hidden />
              {COPY.landing.primaryCta}
            </button>
            <Link
              to="/"
              className="flex-1 h-11 flex items-center justify-center rounded-lg border border-line text-[15px] font-semibold text-ink hover:bg-canvas transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              {COPY.landing.navGetStarted}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
