export function Landing() {
  return (
    <div className="min-h-screen bg-canvas text-ink px-4 py-6">
      <header className="mb-10">
        <h1 className="text-[32px] font-[700] leading-[38px] mb-4">
          From 3rd year to offer letter.
        </h1>
        <p className="text-lg text-ink-muted mb-6">
          Every drive with a verified date. Your prep, scored. Your portfolio,
          built automatically.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="/onboarding"
            className="flex-1 bg-brand text-white text-center py-3 rounded-lg font-[600] hover:bg-brand-dark transition-colors"
          >
            Start free — 2 min
          </a>
          <a
            href="/u/kiran"
            className="flex-1 border border-line text-center py-3 rounded-lg font-[600] hover:bg-canvas transition-colors"
          >
            See a live portfolio
          </a>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-6">
        <article className="bg-surface p-6 rounded-xl shadow-card border border-line">
          <h3 className="font-[600] mb-2">Deadlines you can trust</h3>
          <p className="text-sm text-ink-muted">
            Every drive shows its source link and the date we last checked it.
            No forwards, no fake dates.
          </p>
        </article>
        <article className="bg-surface p-6 rounded-xl shadow-card border border-line">
          <h3 className="font-[600] mb-2">One board for your pipeline</h3>
          <p className="text-sm text-ink-muted">
            Drag every application from Saved to Offer. See exactly where you
            stand.
          </p>
        </article>
        <article className="bg-surface p-6 rounded-xl shadow-card border border-line">
          <h3 className="font-[600] mb-2">Your portfolio builds itself</h3>
          <p className="text-sm text-ink-muted">
            Log a project or certificate with its link once — your live
            portfolio updates on its own.
          </p>
        </article>
      </section>

      <footer className="mt-12 pt-6 border-t border-line text-center">
        <p className="text-sm text-ink-muted">
          Verified deadlines · No spam · Free for students
        </p>
        <p className="text-xs text-ink-muted mt-2">
          Built for JioCoder Hackathon 2026
        </p>
      </footer>
    </div>
  );
}
