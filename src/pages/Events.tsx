import { useEffect, useState } from "react";
import { getEvents, filterLocal } from "../lib/api";
import { CATEGORIES } from "../lib/schemas";
import EventCard from "../components/EventCard";
import FilterBar from "../components/FilterBar";

/* ─────────────────────────────────────────────────────────────
   Events page — list with FilterBar + search. Responsive grid
   1 / 2 / 3 columns. Empty state with working "clear filters" link.
   ───────────────────────────────────────────────────────────── */

export default function Events() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [filtered, setFiltered] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpts, setFilterOpts] = useState<{ category?: string; q?: string }>({});

  useEffect(() => {
    getEvents().then((evs) => {
      setAllEvents(evs);
      setFiltered(evs);
      setLoading(false);
    });
  }, []);

  const handleFilter = (opts: { category?: string; q?: string }) => {
    setFilterOpts(opts);
    const result = filterLocal(allEvents, opts);
    setFiltered(result);
  };

  if (loading) {
    return (
      <div className="pt-24 pb-20 px-4">
        <div className="mx-auto max-w-[1120px]">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-[#1C1915] rounded w-1/4" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-[#1C1915] border border-[#322C24] rounded-xl h-80" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-4">
      <div className="mx-auto max-w-[1120px]">
        <header className="mb-8">
          <h1 className="text-3xl font-display font-bold text-[#F2EDE3] mb-2">
            All Events
          </h1>
          <p className="text-[#9C948A]">
            Filter by category or search by title, venue, or description.
          </p>
        </header>

        <FilterBar onFilter={handleFilter} />

        {filtered.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-[#322C24] rounded-xl bg-[#1C1915]/50">
            <svg
              className="mx-auto mb-4 text-[#322C24] w-12 h-12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <p className="text-lg text-[#9C948A] mb-2">
              No events match your filters.
            </p>
            <button
              onClick={() => handleFilter({ category: undefined, q: undefined })}
              className="text-[#C9A227] hover:underline font-medium mono"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Events">
            {filtered.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import type { Event } from "../lib/schemas";