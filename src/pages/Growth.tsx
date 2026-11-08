import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { collection, deleteDoc, doc, onSnapshot, query, where } from "firebase/firestore";
import { Eye, Plus } from "lucide-react";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import type { Activity, Student } from "../lib/types";
import { COPY } from "../lib/copy";
import { ActivityRow } from "../components/ActivityRow";
import { ActivityModal } from "../components/ActivityModal";
import { EmptyState } from "../components/EmptyState";
import { useToast } from "../components/Toaster";

interface OutletCtx {
  profile?: Student;
}

function monthKey(d: Date): string {
  return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(d);
}

// PRD §F5 — reverse-chronological evidence log, grouped by month, one modal for add/edit.
export function Growth() {
  const { uid } = useAuth();
  const { profile } = useOutletContext<OutletCtx>();
  const { toast } = useToast();
  const [acts, setActs] = useState<Activity[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);

  useEffect(() => {
    if (!uid) return;
    return onSnapshot(query(collection(db, "activities"), where("uid", "==", uid)), (s) => {
      const list = s.docs.map((d) => ({ id: d.id, ...d.data() } as Activity));
      list.sort((a, b) => b.date.toMillis() - a.date.toMillis());
      setActs(list);
    });
  }, [uid]);

  const groups = useMemo(() => {
    if (!acts) return [];
    const byMonth = new Map<string, Activity[]>();
    for (const a of acts) {
      const k = monthKey(a.date.toDate());
      const arr = byMonth.get(k);
      if (arr) arr.push(a);
      else byMonth.set(k, [a]);
    }
    return [...byMonth.entries()];
  }, [acts]);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(a: Activity) {
    setEditing(a);
    setModalOpen(true);
  }

  async function remove(a: Activity) {
    if (!confirm(COPY.growth.deleteConfirm)) return;
    try {
      await deleteDoc(doc(db, "activities", a.id));
      toast(COPY.growth.toastDeleted, "success");
    } catch {
      toast(COPY.growth.toastOffline, "error");
    }
  }

  return (
    <div className="pt-4 max-w-[680px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[24px] leading-[30px] font-semibold">Growth log</h2>
        {profile?.portfolioSlug && (
          <Link
            to={`/u/${profile.portfolioSlug}`}
            className="inline-flex h-9 items-center gap-1.5 px-3 rounded-lg border border-line bg-surface text-[13px] font-medium text-ink hover:bg-canvas focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            <Eye size={14} strokeWidth={2} aria-hidden />
            {COPY.growth.preview}
          </Link>
        )}
      </div>

      {acts === null ? (
        <div className="flex flex-col gap-3">
          <div className="skeleton h-20 rounded-xl" />
          <div className="skeleton h-20 rounded-xl" />
          <div className="skeleton h-20 rounded-xl" />
        </div>
      ) : acts.length === 0 ? (
        <EmptyState message={COPY.growth.empty} />
      ) : (
        groups.map(([month, list]) => (
          <section key={month} className="mb-5">
            <h3 className="text-[13px] font-medium text-ink-muted mb-2">{month}</h3>
            <div className="flex flex-col gap-2">
              {list.map((a) => (
                <ActivityRow key={a.id} activity={a} variant="owner" onEdit={openEdit} onDelete={remove} />
              ))}
            </div>
          </section>
        ))
      )}

      {/* FAB — thumb reach on mobile, sits above the bottom nav */}
      <button
        type="button"
        onClick={openAdd}
        className="fixed right-4 bottom-20 lg:bottom-8 z-40 h-12 px-4 rounded-full bg-brand text-white text-[15px] font-semibold shadow-elev flex items-center gap-2 hover:bg-brand-dark transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      >
        <Plus size={18} strokeWidth={2.5} aria-hidden />
        {COPY.growth.fab}
      </button>

      {uid && (
        <ActivityModal open={modalOpen} onClose={() => setModalOpen(false)} uid={uid} editing={editing} />
      )}
    </div>
  );
}
