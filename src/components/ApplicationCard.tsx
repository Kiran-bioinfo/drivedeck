import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { MoreHorizontal } from "lucide-react";
import type { Application, Drive } from "../lib/types";
import { STAGES } from "../lib/types";
import { COPY } from "../lib/copy";

interface ApplicationCardProps {
  app: Application;
  drive: Drive | undefined;
  onMove?: (app: Application, status: Application["status"]) => void;
  onRemove: (app: Application) => void;
}

function ageDays(updated: Date): number {
  return Math.max(0, Math.floor((Date.now() - updated.getTime()) / 86_400_000));
}

// Design.md 3.19 — draggable card; long-press on touch; ⋯ menu with move buttons + Remove.
export function ApplicationCard({ app, drive, onMove, onRemove }: ApplicationCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: app.id });
  const [menuOpen, setMenuOpen] = useState(false);

  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 } : undefined;

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        className={`bg-surface border border-line rounded-xl shadow-card p-3 select-none ${
          isDragging ? "opacity-50 shadow-elev" : ""
        }`}
      >
        <div className="flex items-start gap-2">
          <button
            type="button"
            aria-label={COPY.board.menuLabel}
            className="flex gap-2 items-start text-left flex-1 min-w-0 cursor-grab touch-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-lg"
            {...attributes}
            {...listeners}
          >
            <span
              aria-hidden
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
              style={{
                backgroundColor: drive ? `${drive.color}1A` : "rgba(100,116,139,0.12)",
                color: drive ? drive.color : "#64748B",
              }}
            >
              {drive?.initials ?? "?"}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-[15px] leading-tight">
                {drive ? `${drive.companyName} · ${drive.program}` : COPY.board.driveGone}
              </span>
              {drive && <span className="block text-[13px] text-ink-muted truncate">{drive.role}</span>}
              {drive && (
                <span className="inline-block mt-1 text-[11px] font-medium text-ink-muted bg-canvas border border-line rounded-full px-2 py-0.5">
                  {COPY.board.ageChip(ageDays(app.updatedAt.toDate()))}
                </span>
              )}
            </span>
          </button>
          <button
            type="button"
            aria-label={COPY.board.menuLabel}
            onClick={() => setMenuOpen((o) => !o)}
            className="p-1 -m-1 text-ink-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-brand rounded-md"
          >
            <MoreHorizontal size={18} strokeWidth={2} aria-hidden />
          </button>
        </div>

        {menuOpen && (
          <div className="mt-2 border-t border-line pt-2 flex flex-wrap gap-1">
            {onMove &&
              STAGES.filter((s) => s.key !== app.status).map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onMove(app, s.key);
                  }}
                  className="h-8 px-2.5 rounded-full bg-canvas border border-line text-[13px] font-medium text-ink hover:bg-line/60 focus-visible:ring-2 focus-visible:ring-brand"
                >
                  {s.label}
                </button>
              ))}
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onRemove(app);
              }}
              className="h-8 px-2.5 rounded-full bg-danger/10 text-[13px] font-medium text-danger hover:bg-danger/20 focus-visible:ring-2 focus-visible:ring-brand"
            >
              {COPY.board.remove}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
