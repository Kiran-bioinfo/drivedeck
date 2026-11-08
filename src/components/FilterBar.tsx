import { Search } from "lucide-react";
import { COPY } from "../lib/copy";

interface FilterBarProps {
  filter: "all" | "match" | "on" | "off";
  onFilterChange: (f: FilterBarProps["filter"]) => void;
  search: string;
  onSearchChange: (s: string) => void;
}

// Design.md 3.13 — sticky chips (horizontal scroll contained) + search below.
export function FilterBar({ filter, onFilterChange, search, onSearchChange }: FilterBarProps) {
  return (
    <div className="sticky top-0 z-20 -mx-4 px-4 pt-2 pb-3 bg-surface border-b border-line">
      <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Drive filters">
        {COPY.drives.filters.map((label, i) => {
          const key = (["all", "match", "on", "off"] as const)[i];
          const active = filter === key;
          return (
            <button
              key={key}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => onFilterChange(key)}
              className={`flex-none h-8 px-3 rounded-full text-[13px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-brand ${active ? "bg-brand text-white" : "bg-canvas text-ink-muted hover:bg-line/60"}`}
            >
              {label}
            </button>
          );
        })}
      </div>
      <label className="relative block mt-2">
        <Search aria-hidden size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={COPY.drives.searchPlaceholder}
          aria-label={COPY.drives.searchPlaceholder}
          className="w-full h-11 pl-9 pr-3 rounded-lg border border-line bg-canvas text-[15px] placeholder:text-ink-muted focus:border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
      </label>
    </div>
  );
}
