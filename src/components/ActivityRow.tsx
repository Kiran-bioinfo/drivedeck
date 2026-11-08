import { useState } from "react";
import { Award, BookOpen, Dumbbell, FolderGit2, ExternalLink, MoreHorizontal, BadgeCheck, Medal } from "lucide-react";
import type { Activity, ActivityType } from "../lib/types";
import { linkLabel, COPY } from "../lib/copy";

const TYPE_ICON: Record<ActivityType, typeof FolderGit2> = {
  PROJECT: FolderGit2,
  CERT: Medal,
  COURSE: BookOpen,
  DSA: Dumbbell,
  ACHIEVEMENT: Award,
};

interface ActivityRowProps {
  activity: Activity;
  variant: "owner" | "public";
  onEdit?: (a: Activity) => void;
  onDelete?: (a: Activity) => void;
}

// Design.md 3.21 — icon, title, summary, tags; link buttons auto-labeled from URL host.
export function ActivityRow({ activity, variant, onEdit, onDelete }: ActivityRowProps) {
  const Icon = TYPE_ICON[activity.type];
  const [menuOpen, setMenuOpen] = useState(false);
  const label = linkLabel(activity.url);

  return (
    <div className="bg-surface border border-line rounded-xl shadow-card p-3 flex items-start gap-3">
      <span aria-hidden className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0">
        <Icon size={16} strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-[15px] leading-tight">{activity.title}</h3>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success bg-success/10 rounded-full px-2 py-0.5">
            <BadgeCheck size={12} strokeWidth={2.5} aria-hidden />
            {COPY.growth.linked}
          </span>
        </div>
        {activity.summary && <p className="text-[13px] text-ink-muted mt-0.5 line-clamp-2">{activity.summary}</p>}
        {activity.tags.length > 0 && (
          <div className="flex gap-1.5 mt-1.5 flex-wrap">
            {activity.tags.map((t) => (
              <span key={t} className="text-[11px] text-ink-muted bg-canvas border border-line rounded-full px-2 py-0.5">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1.5 items-end shrink-0">
        {variant === "public" ? (
          <a
            href={activity.url}
            target="_blank"
            rel="noopener"
            className="inline-flex h-9 items-center gap-1.5 px-3 rounded-lg border border-line bg-canvas text-[13px] font-medium text-ink hover:bg-line/60 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            {label}
            <ExternalLink size={14} strokeWidth={2} aria-hidden />
          </a>
        ) : (
          <>
            <button
              type="button"
              aria-label="Activity menu"
              onClick={() => setMenuOpen((o) => !o)}
              className="p-1 -m-1 text-ink-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-brand rounded-md"
            >
              <MoreHorizontal size={18} strokeWidth={2} aria-hidden />
            </button>
            <a
              href={activity.url}
              target="_blank"
              rel="noopener"
              className="inline-flex h-8 items-center gap-1 px-2 rounded-lg border border-line bg-canvas text-[12px] font-medium text-ink hover:bg-line/60 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              {label}
              <ExternalLink size={12} strokeWidth={2} aria-hidden />
            </a>
          </>
        )}
      </div>

      {variant === "owner" && menuOpen && (
        <div className="absolute" role="menu" style={{ display: "contents" }}>
          <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-4 top-10 z-30 bg-surface border border-line rounded-lg shadow-elev p-1 flex flex-col min-w-[120px]">
            {onEdit && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(activity);
                }}
                className="text-left px-3 py-2 text-[14px] rounded-md hover:bg-canvas focus-visible:ring-2 focus-visible:ring-brand"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(activity);
                }}
                className="text-left px-3 py-2 text-[14px] text-danger rounded-md hover:bg-danger/10 focus-visible:ring-2 focus-visible:ring-brand"
              >
                {COPY.growth.delete}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
