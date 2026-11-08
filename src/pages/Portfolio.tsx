import { useParams } from "react-router-dom";

export function Portfolio() {
  const { slug } = useParams();

  return (
    <div className="min-h-screen bg-canvas text-ink px-4 py-6">
      <div className="bg-surface p-6 rounded-xl shadow-card border border-line max-w-md mx-auto">
        <h2 className="text-[24px] font-[600] mb-2">Portfolio for "{slug}"</h2>
        <p className="text-ink-muted">
          Portfolio data loads from Firestore. This shell will be replaced by
          the live portfolio in Step 5 of the build order.
        </p>
      </div>
    </div>
  );
}
