import { useState } from "react";
import { DndContext, PointerSensor, TouchSensor, KeyboardSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import type { Application, AppStatus, Drive } from "../lib/types";
import { STAGES } from "../lib/types";
import { COPY } from "../lib/copy";
import { Column } from "./Column";
import { Confetti } from "./Confetti";

interface KanbanBoardProps {
  apps: Application[];
  drivesById: Map<string, Drive>;
  onMove: (app: Application, status: AppStatus) => void;
  onRemove: (app: Application) => void;
}

// Design.md 3.17 — @dnd-kit surface; same-column drop = no-op (no write);
// Offer drop → one-shot confetti (ref-guard, not per render).
export function KanbanBoard({ apps, drivesById, onMove, onRemove }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor)
  );

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const target = e.over?.id ? String(e.over.id) : null;
    if (!target) return;
    const app = apps.find((a) => a.id === String(e.active.id));
    if (!app) return;
    if (app.status === (target as AppStatus)) return; // same column → no write
    onMove(app, target as AppStatus);
    if (target === "OFFER") setConfetti((n) => n + 1); // one-shot per entry
  }

  return (
    <>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div
          className="flex gap-3 overflow-x-auto snap-x lg:grid lg:grid-cols-6 lg:overflow-visible"
          role="list"
          aria-label={COPY.nav.board}
        >
          {STAGES.map((s) => (
            <Column
              key={s.key}
              status={s.key}
              label={s.label}
              apps={apps.filter((a) => a.status === s.key)}
              drivesById={drivesById}
              onMove={onMove}
              onRemove={onRemove}
            />
          ))}
        </div>
        {activeId && <div className="sr-only" aria-live="polite">Dragging {drivesById.get(apps.find((a) => a.id === activeId)?.driveId ?? "")?.companyName}</div>}
      </DndContext>
      {confetti > 0 && <Confetti key={confetti} fire={confetti} />}
    </>
  );
}
