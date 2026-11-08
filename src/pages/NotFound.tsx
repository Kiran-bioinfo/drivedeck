import { Link } from "react-router-dom";
import { COPY } from "../lib/copy";

export function NotFound() {
  return (
    <div className="min-h-screen bg-canvas text-ink px-4 flex flex-col items-center justify-center">
      <div className="bg-surface p-8 rounded-xl shadow-card border border-line text-center max-w-[420px]">
        <h1 className="text-[32px] font-bold mb-2">{COPY.notFound.title}</h1>
        <p className="text-[15px] text-ink-muted mb-6">{COPY.notFound.body}</p>
        <Link
          to="/"
          className="inline-flex h-11 items-center px-4 rounded-lg bg-brand text-white font-semibold hover:bg-brand-dark transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          {COPY.notFound.cta}
        </Link>
      </div>
    </div>
  );
}
