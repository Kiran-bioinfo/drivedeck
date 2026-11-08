import { useDroppable } from "@dnd-kit/core";
import { Link } from "react-router-dom";
import type { Application, Drive } from "../lib/types";
import { COPY } from "../lib/copy";
import { ApplicationCard } from "./ApplicationCard";

interface ColumnProps {
  status: string;
  label: string;
  apps: Application[];
  drivesById: Map<string, Drive>;
  onMove?: (app: Application, status: Application["status"]) => void;
  onRemove: (app: Application) => void;
}

// Design.md 3.18 — 280px snap panel on mobile; grid column on desktop.
export function Column({ status, label, apps, drivesById, onMove, onRemove }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`snap-start flex-none w-[280px] lg:w-auto lg:min-w-0 rounded-xl border p-3 flex flex-col ${
        isOver && apps ? "bg-canvas border-dashed border-brand" : "border-line bg-surface"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-[15px]">{label}</h3>
        <span className="text-[11px] font-medium text-ink-muted bg-canvas border border-line rounded-full px-2 py-0.5">
          {apps.length}
        </span>
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-220px)] min-h-[120px]">
        {apps.length === 0 ? (
          status === "SAVED" ? (
            <>
              <Link
                to="/drives"
                className="block text-center bg-canvas border border-dashed border-line rounded-xl p-4 text-[13px] text-ink-muted hover:border-brand transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                {COPY.board.emptyBoard}
              </Link>
              <p className="text-center text-[13px] text-ink-muted">{COPY.board.emptyColumn}</p>
            </>
          ) : (
            <p className="text-center text-[13px] text-ink-muted py-8">{COPY.board.emptyColumn}</p>
          )
        ) : (
          apps.map((app) => (
            <ApplicationCard key={app.id} app={app} drive={drivesById.get(app.driveId)} onMove={onMove} onRemove={onRemove} />
          ))
        )}
      </div>
    </div>
  );
}
