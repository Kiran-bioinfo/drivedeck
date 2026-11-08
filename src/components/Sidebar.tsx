import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Briefcase, Home, Kanban, LogOut, Plus, UserRound } from "lucide-react";
import { auth, db } from "../lib/firebase";
import { COPY } from "../lib/copy";
import { useToast } from "./Toaster";

interface NavProps {
  portfolioSlug: string;
}

function useCurrent(): "home" | "drives" | "board" | "portfolio" | null {
  const { pathname } = useLocation();
  if (pathname.startsWith("/drives")) return "drives";
  if (pathname.startsWith("/board")) return "board";
  if (pathname.startsWith("/u/")) return "portfolio";
  if (pathname.startsWith("/dashboard")) return "home";
  return null;
}

export function Sidebar({ portfolioSlug }: NavProps) {
  const current = useCurrent();
  const { toast } = useToast();
  const navigate = useNavigate();

  const items = [
    { key: "home", to: "/dashboard", label: COPY.nav.home, icon: Home },
    { key: "drives", to: "/drives", label: COPY.nav.drives, icon: Briefcase },
    { key: "board", to: "/board", label: COPY.nav.board, icon: Kanban },
    ...(portfolioSlug ? [{ key: "portfolio", to: `/u/${portfolioSlug}`, label: COPY.nav.portfolio, icon: UserRound }] : []),
  ];

  function handleSignOut() {
    signOut(auth).then(() => {
      toast(COPY.system.signedOut);
      navigate("/");
    });
  }

  return (
    <aside className="hidden lg:flex fixed top-0 bottom-0 left-0 w-60 flex-col bg-surface border-r border-line p-4 gap-1">
      <Link to="/dashboard" className="font-bold text-lg text-brand mb-4 h-11 flex items-center">
        DriveDeck
      </Link>
      {items.map(({ key, to, label, icon: Icon }) => (
        <Link
          key={key}
          to={to}
          className={`relative h-11 flex items-center gap-3 px-3 rounded-lg text-[15px] font-medium transition-colors hover:bg-canvas focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
            current === key ? "text-brand" : "text-ink-muted"
          }`}
        >
          {current === key && (
            <span aria-hidden className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-brand" />
          )}
          <Icon size={20} strokeWidth={2} aria-hidden />
          {label}
        </Link>
      ))}
      <Link
        to="/growth"
        className="mt-2 flex h-11 items-center justify-center gap-2 rounded-lg bg-brand text-white text-[15px] font-semibold hover:bg-brand-dark transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      >
        <Plus size={20} strokeWidth={2} aria-hidden />
        {COPY.nav.addEvidence}
      </Link>
      <div className="mt-auto">
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full h-11 flex items-center gap-3 px-3 rounded-lg text-[15px] text-ink-muted hover:bg-canvas transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          <LogOut size={20} strokeWidth={2} aria-hidden />
          {COPY.nav.signOut}
        </button>
      </div>
    </aside>
  );
}

export function BottomNav({ portfolioSlug }: NavProps) {
  const current = useCurrent();
  const items = [
    { key: "home", to: "/dashboard", label: COPY.nav.home, icon: Home },
    { key: "drives", to: "/drives", label: COPY.nav.drives, icon: Briefcase },
    { key: "board", to: "/board", label: COPY.nav.board, icon: Kanban },
    ...(portfolioSlug ? [{ key: "portfolio", to: `/u/${portfolioSlug}`, label: COPY.nav.portfolio, icon: UserRound }] : []),
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex h-14 bg-surface border-t border-line"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {items.map(({ key, to, label, icon: Icon }) => (
        <Link
          key={key}
          to={to}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[11px] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand ${
            current === key ? "text-brand" : "text-ink-muted"
          }`}
        >
          <Icon size={20} strokeWidth={2} aria-hidden />
          {label}
        </Link>
      ))}
    </nav>
  );
}

// Wrapper for all signed-in screens: shares `users/{uid}` once for nav + pages.
// undefined = still loading · null = profile not yet created (→ onboarding) · T = complete
export function useOwnProfile<T>(uid: string | null): T | undefined | null {
  const [profile, setProfile] = useState<T | undefined | null>();
  useEffect(() => {
    if (!uid) return;
    return onSnapshot(doc(db, "users", uid), (d) => {
      setProfile(d.exists() ? ({ id: d.id, ...d.data() } as T) : null);
    });
  }, [uid]);
  return profile;
}
