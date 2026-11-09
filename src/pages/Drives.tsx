import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Drive, Student } from "../lib/types";
import { checkEligibility } from "../lib/eligibility";
import { COPY } from "../lib/copy";
import { DriveCard } from "../components/DriveCard";
import { FilterBar } from "../components/FilterBar";
import { EmptyState } from "../components/EmptyState";

interface OutletCtx {
  profile?: Student;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// PRD §F3 — one ordered read of drives; all filtering client-side (pure functions).
export function Drives() {
  const { profile } = useOutletContext<OutletCtx>();
  const [drives, setDrives] = useState<Drive[] | null>(null);
  const [filter, setFilter] = useState<"all" | "match" | "on" | "off">("all");
  const [search, setSearch] = useState("");

  // initialize "Match me" when arriving from the dashboard watch strip (?filter=match)
  useEffect(() => {
    const f = new URLSearchParams(window.location.search).get("filter");
    if (f === "match") setFilter("match");
  }, []);

  useEffect(() => {
    // no orderBy: documents missing regDeadline would be silently excluded
    return onSnapshot(
      collection(db, "drives"),
      (s) => setDrives(s.docs.map((d) => ({ id: d.id, ...d.data() } as Drive))),
      (err) => {
        // never strand the list on an endless skeleton (audit: listener failures)
        console.error("[DriveDeck] drives listener failed:", err);
        setDrives([]);
      },
    );
  }, []);

  const visible = useMemo(() => {
    if (!drives) return null;
    const now = startOfDay(new Date());
    const q = search.trim().toLowerCase();

    let list = drives.filter((d) => {
      if (filter === "on" && d.type !== "ON") return false;
      if (filter === "off" && d.type !== "OFF") return false;
      if (filter === "match" && (!profile || !checkEligibility(profile, d).match)) return false;
      if (q) {
        const hay = `${d.companyName} ${d.program} ${d.role}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    // open drives soonest-first; expired drives keep (history value) and sort to bottom
    list = [...list].sort((a, b) => {
      const da = a.regDeadline?.toDate().getTime() ?? Number.MAX_SAFE_INTEGER;
      const dbTime = b.regDeadline?.toDate().getTime() ?? Number.MAX_SAFE_INTEGER;
      const aOpen = a.regDeadline ? da >= now.getTime() : false;
      const bOpen = b.regDeadline ? dbTime >= now.getTime() : false;
      if (aOpen !== bOpen) return aOpen ? -1 : 1;
      return da - dbTime;
    });
    return list;
  }, [drives, filter, search, profile]);

  return (
    <div className="pt-2">
      <FilterBar filter={filter} onFilterChange={setFilter} search={search} onSearchChange={setSearch} />
      <div className="flex flex-col gap-3 pt-3">
        {visible === null ? (
          <>
            <div className="skeleton h-28 rounded-xl" />
            <div className="skeleton h-28 rounded-xl" />
            <div className="skeleton h-28 rounded-xl" />
          </>
        ) : visible.length === 0 ? (
          <EmptyState message={COPY.drives.empty} />
        ) : (
          visible.map((d) => <DriveCard key={d.id} drive={d} profile={profile} />)
        )}
      </div>
    </div>
  );
}
