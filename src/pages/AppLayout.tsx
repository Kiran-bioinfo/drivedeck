import { Outlet, Navigate } from "react-router-dom";
import type { Student } from "../lib/types";
import { Sidebar, BottomNav, useOwnProfile } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

// Chrome host for auth+profile routes (Architecture.md 5.1):
// auth gate lives in App.tsx; this component gates on a complete profile.
export function AppLayout() {
  const { uid, loading: authLoading } = useAuth();
  const profile = useOwnProfile<Student>(uid);

  // still deciding → minimal splash, no flash of the wrong screen
  if (authLoading || uid === null || profile === undefined) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="skeleton h-10 w-40 rounded-lg" />
      </div>
    );
  }

  // signed in but onboarding incomplete → the only place to go is onboarding
  if (profile === null) return <Navigate to="/onboarding" replace />;

  return (
    <div className="min-h-screen">
      <Sidebar portfolioSlug={profile.portfolioSlug} />
      <main className="min-h-screen px-4 pb-24 lg:pb-10 lg:ml-60">
        <div className="mx-auto w-full max-w-[1024px]">
          <Outlet context={{ profile }} />
        </div>
      </main>
      <BottomNav portfolioSlug={profile.portfolioSlug} />
    </div>
  );
}
