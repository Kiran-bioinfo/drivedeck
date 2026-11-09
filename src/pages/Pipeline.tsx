import { useEffect, useMemo, useState } from "react";
import { arrayUnion, collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import type { Application, AppStatus, Drive } from "../lib/types";
import { STAGES } from "../lib/types";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { COPY } from "../lib/copy";
import { KanbanBoard } from "../components/KanbanBoard";
import { useToast } from "../components/Toaster";
import { epochMs } from "../lib/time";

// PRD §F4 — one ordered read of applications + the drives map for cards.
export function Pipeline() {
  const { uid } = useAuth();
  const { toast } = useToast();
  const [apps, setApps] = useState<Application[] | null>(null);
  const [drives, setDrives] = useState<Drive[] | null>(null);

  useEffect(() => {
    if (!uid) return;
    return onSnapshot(
      query(collection(db, "applications"), where("uid", "==", uid)),
      (s) => {
        const list = s.docs.map((d) => ({ id: d.id, ...d.data() } as Application));
        list.sort((a, b) => epochMs(b.updatedAt) - epochMs(a.updatedAt));
        setApps(list);
      },
      (err) => {
        // never strand the board on an endless skeleton (audit: listener failures)
        console.error("[DriveDeck] applications listener failed:", err);
        setApps([]);
      },
    );
  }, [uid]);

  useEffect(() => {
    // drives are few; one listener serves every card's company/avatar/role
    return onSnapshot(
      collection(db, "drives"),
      (s) => setDrives(s.docs.map((d) => ({ id: d.id, ...d.data() } as Drive))),
      (err) => {
        console.error("[DriveDeck] drives listener failed:", err);
        setDrives([]);
      },
    );
  }, []);

  const drivesById = useMemo(
    () => new Map((drives ?? []).map((d) => [d.id, d])),
    [drives]
  );

  async function move(app: Application, status: AppStatus) {
    if (!uid) return;
    try {
      await updateDoc(doc(db, "applications", app.id), {
        status,
        history: arrayUnion({ status, at: new Date() }),
        updatedAt: serverTimestamp(),
      });
      toast(status === "OFFER" ? COPY.board.toastOffer : COPY.board.toastMove(stageLabel(status)), "success");
    } catch {
      toast(COPY.growth.toastOffline, "error");
    }
  }

  async function remove(app: Application) {
    if (!confirm(COPY.board.removeConfirm)) return;
    try {
      await deleteDoc(doc(db, "applications", app.id));
    } catch {
      toast(COPY.growth.toastOffline, "error");
    }
  }

  return (
    <div className="pt-4 -mx-4 lg:-mx-0">
      {apps === null ? (
        <div className="px-4 lg:px-0 flex gap-3 overflow-hidden">
          {STAGES.map((s) => (
            <div key={s.key} className="skeleton flex-none w-[220px] h-[300px] rounded-xl" />
          ))}
        </div>
      ) : (
        <KanbanBoard apps={apps} drivesById={drivesById} onMove={move} onRemove={remove} />
      )}
    </div>
  );
}

function stageLabel(status: AppStatus): string {
  return STAGES.find((s) => s.key === status)?.label ?? status;
}
