import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="min-h-screen bg-canvas text-ink px-4 py-6 flex flex-col items-center justify-center">
      <div className="bg-surface p-8 rounded-xl shadow-card border border-line text-center">
        <h1 className="text-[32px] font-[700] mb-2">404</h1>
        <p className="text-ink-muted mb-6">This page doesn't exist.</p>
        <Link
          to="/"
          className="bg-brand text-white px-4 py-2 rounded-lg font-[600] hover:bg-brand-dark transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
