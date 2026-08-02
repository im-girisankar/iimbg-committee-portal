import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CATEGORIES } from "../lib/schemas";

/* ─────────────────────────────────────────────────────────────
   FilterBar — horizontal category chips + search input.
   Syncs to URL search params so filters are shareable/bookmarkable.
   ───────────────────────────────────────────────────────────── */

const categories = ["All", ...CATEGORIES];

export default function FilterBar({ onFilter }: { onFilter: (opts: { category?: string; q?: string }) => void }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");

  const pushParams = (cat?: string, q?: string) => {
    const params = new URLSearchParams();
    if (cat && cat !== "All") params.set("category", cat);
    if (q) params.set("q", q);
    navigate(`/events?${params.toString()}`, { replace: true });
  };

  const handleCategory = (cat: string) => {
    setSelectedCategory(cat);
    pushParams(cat === "All" ? undefined : cat, searchQuery || undefined);
    onFilter({ category: cat === "All" ? undefined : cat, q: searchQuery || undefined });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    pushParams(selectedCategory === "All" ? undefined : selectedCategory, searchQuery || undefined);
    onFilter({ category: selectedCategory === "All" ? undefined : selectedCategory, q: searchQuery || undefined });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-transparent" role="search" aria-label="Filter events">
      {/* Category chips */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Event categories">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => handleCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium mono transition-all ${
              selectedCategory === cat
                ? "bg-[var(--color-accent)] text-white shadow-[var(--shadow-soft)]"
                : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-secondary)] hover:bg-[var(--color-background)] hover:text-[var(--color-primary)]"
            }`}
            aria-pressed={selectedCategory === cat}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search input */}
      <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
        <label htmlFor="event-search" className="sr-only">
          Search events
        </label>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-secondary)]"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            id="event-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events…"
            className="w-full pl-10 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-[var(--color-primary)] placeholder-[var(--color-secondary)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] transition"
          />
        </div>
      </form>
    </div>
  );
}