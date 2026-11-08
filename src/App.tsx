import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Landing } from "./pages/Landing";
import { Portfolio } from "./pages/Portfolio";
import { Resources } from "./pages/Resources";
import { Onboarding } from "./pages/Onboarding";
import { AppLayout } from "./pages/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { Drives } from "./pages/Drives";
import { DriveDetail } from "./pages/DriveDetail";
import { Pipeline } from "./pages/Pipeline";
import { Growth } from "./pages/Growth";
import { NotFound } from "./pages/NotFound";

// Architecture.md Sheet 5.1 — guards are client-side UX only; rules are the security.
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="skeleton h-10 w-40 rounded-lg" />
      </div>
    );
  }
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// /onboarding: authed users with a finished profile skip to the dashboard.
function RequireProfileIncomplete({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="skeleton h-10 w-40 rounded-lg" />
      </div>
    );
  }
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* public */}
          <Route path="/" element={<Landing />} />
          <Route path="/u/:slug" element={<Portfolio />} />
          <Route path="/resources" element={<Resources />} />

          {/* auth + profile incomplete */}
          <Route
            path="/onboarding"
            element={
              <RequireProfileIncomplete>
                <Onboarding />
              </RequireProfileIncomplete>
            }
          />

          {/* auth + profile complete (AppLayout gates profile, redirects to /onboarding) */}
          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/drives" element={<Drives />} />
            <Route path="/drives/:id" element={<DriveDetail />} />
            <Route path="/board" element={<Pipeline />} />
            <Route path="/growth" element={<Growth />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
