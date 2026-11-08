import type { Student } from "../lib/types";
import { COPY, portfolioUrl } from "../lib/copy";
import { ScoreRing } from "./ScoreRing";
import { ExternalLink, Share2, Github, Linkedin } from "lucide-react";

interface PortfolioHeaderProps {
  user: Student;
  slug: string;
  score: number;
  activityCount: number;
  onShare: () => void;
  onHow: () => void;
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// Design.md 3.22 — public header: initials avatar, name, sub-line, ring,
// "Every item evidence-linked" badge (hidden at 0 activities), share, GitHub/LinkedIn buttons.
export function PortfolioHeader({ user, slug, score, activityCount, onShare, onHow }: PortfolioHeaderProps) {
  const shareUrl = portfolioUrl(slug);

  return (
    <header className="text-center mb-6">
      <div className="flex flex-col items-center gap-2">
        <span
          aria-hidden
          className="w-16 h-16 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-xl"
        >
          {initialsOf(user.name)}
        </span>
        <h1 className="text-[32px] leading-[38px] font-bold">{user.name}</h1>
        <p className="text-[15px] text-ink-muted">
          {COPY.portfolio.subline(user.targetRole, user.year, user.branch)} · {user.college}
        </p>

        {/* v1.1: GitHub/LinkedIn are saved profile URLs as link buttons — NOT OAuth */}
        {(user.githubUrl || user.linkedinUrl) && (
          <div className="flex gap-2">
            {user.githubUrl && (
              <a
                href={user.githubUrl}
                target="_blank"
                rel="noopener"
                className="inline-flex h-9 items-center gap-1.5 px-3 rounded-lg border border-line bg-surface text-[13px] font-medium text-ink hover:bg-canvas focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                <Github size={14} strokeWidth={2} aria-hidden />
                GitHub
              </a>
            )}
            {user.linkedinUrl && (
              <a
                href={user.linkedinUrl}
                target="_blank"
                rel="noopener"
                className="inline-flex h-9 items-center gap-1.5 px-3 rounded-lg border border-line bg-surface text-[13px] font-medium text-ink hover:bg-canvas focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                <Linkedin size={14} strokeWidth={2} aria-hidden />
                LinkedIn
              </a>
            )}
          </div>
        )}

        <ScoreRing value={score} size={64} onHow={onHow} />

        {activityCount > 0 && (
          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-success bg-success/10 rounded-full px-3 py-1">
            <ExternalLink size={14} strokeWidth={2.5} aria-hidden />
            {COPY.portfolio.badge}
          </span>
        )}

        <button
          type="button"
          onClick={onShare}
          data-share-url={shareUrl}
          className="inline-flex h-11 items-center gap-2 px-4 rounded-lg bg-brand text-white text-[15px] font-semibold hover:bg-brand-dark transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          <Share2 size={18} strokeWidth={2} aria-hidden />
          {COPY.portfolio.share}
        </button>
      </div>
    </header>
  );
}
