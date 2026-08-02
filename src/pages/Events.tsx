import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getEvents, filterLocal } from "../lib/api";
import type { Event } from "../lib/schemas";
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

  useEffect(() => {
    getEvents().then((evs) => {
      setAllEvents(evs);
      setFiltered(evs);
      setLoading(false);
    });
  }, []);

  const handleFilter = (opts: { category?: string; q?: string }) => {
    const result = filterLocal(allEvents, opts);
    setFiltered(result);
  };

  if (loading) {
    return (
      <div className="pt-24 pb-20 px-4 bg-background">
        <div className="mx-auto max-w-[1120px]">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
            }}
            className="animate-pulse space-y-6"
          >
            <motion.div className="h-10 bg-background rounded w-1/4" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                  }}
                  className="bg-surface border border-border rounded-2xl h-80"
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-4 bg-background">
      <div className="mx-auto max-w-[1120px]">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="font-display font-bold text-3xl md:text-4xl text-primary mb-2">
            All Events
          </h1>
          <p className="text-secondary">
            Filter by category or search by title, venue, or description.
          </p>
        </motion.header>

        <FilterBar onFilter={handleFilter} />

        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 border border-dashed border-border rounded-2xl bg-surface/50"
          >
            <svg
              className="mx-auto mb-4 text-border w-12 h-12"
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
            <p className="text-lg text-secondary mb-2">
              No events match your filters.
            </p>
            <button
              onClick={() => handleFilter({ category: undefined, q: undefined })}
              className="text-accent hover:underline font-medium mono"
            >
              Clear filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
            }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            role="list"
            aria-label="Events"
          >
            {filtered.map((event, i) => (
              <motion.div key={event.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}>
                <EventCard event={event} index={i} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}