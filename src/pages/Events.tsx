import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchX } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EventsToolbar } from "@/components/app/events-toolbar";
import { EventCard } from "@/components/app/event-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useDelayedLoading } from "@/lib/use-delayed-loading";
import { getEvents, filterLocal } from "@/lib/api";
import type { Event } from "@/lib/schemas";

const GRID = "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3";

function EventCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md border border-border">
      <Skeleton className="aspect-[3/2] max-h-[180px] w-full rounded-none sm:max-h-none" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

/**
 * Events — the URL is the single source of truth for filter state (fixes
 * D1: deep-linked `?category=` used to render the chip active but show all
 * 7 events because the page called `setFiltered(evs)` unconditionally, and
 * D2: "Clear filters" reset the grid but not the chips/input/URL). One
 * `update()` setter drives chips, input, URL and grid together.
 */
export default function Events() {
  const [params, setParams] = useSearchParams();
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  const category = params.get("category") ?? "All";
  const q = params.get("q") ?? "";

  useEffect(() => {
    let active = true;
    getEvents().then((evs) => {
      if (!active) return;
      setAllEvents(evs);
      setIsFetching(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const showSkeleton = useDelayedLoading(isFetching);

  const filtered = useMemo(
    () =>
      filterLocal(allEvents, {
        category: category === "All" ? undefined : category,
        q: q || undefined,
      }),
    [allEvents, category, q],
  );

  function update(next: { category?: string; q?: string }) {
    const p = new URLSearchParams(params);
    const nextCategory = next.category ?? category;
    const nextQuery = next.q ?? q;

    if (!nextCategory || nextCategory === "All") p.delete("category");
    else p.set("category", nextCategory);

    if (!nextQuery) p.delete("q");
    else p.set("q", nextQuery);

    setParams(p, { replace: true });
  }

  /* One continuous grid, sorted by date.
     Month sections were tried and removed: each month started a new grid, so
     a month with two events left a visible hole in the third column and the
     page read as broken alignment rather than as structure. Every card
     already carries its own date, so the grouping was not carrying its
     weight. Chronological order is preserved. */
  const sorted = useMemo(
    () => [...filtered].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)),
    [filtered],
  );

  const count = filtered.length;
  const countLabel = count === 0 ? "No events" : count === 1 ? "1 event" : `${count} events`;
  const hasActiveFilters = category !== "All" || q !== "";

  return (
    <div className="container-page pt-10 pb-16 lg:pt-14 lg:pb-24">
      <PageHeader
        title="Events"
        subtitle="Workshops, competitions, and speaker sessions from Envision."
      />

      <EventsToolbar
        category={category}
        query={q}
        onChange={update}
        className="sm:sticky sm:top-[var(--nav-h)] sm:z-10 sm:bg-bg/80 sm:py-3 sm:backdrop-blur"
      />

      {/* Held back while the skeleton is up. The count derives from `filtered`,
          which populates as soon as the fetch resolves — but the grid is also
          gated behind `useDelayedLoading`'s minimum hold, so announcing
          "7 events" over a screen of skeletons stated a number the user could
          not yet see. */}
      <p className="mt-4 mb-5 min-h-4 text-caption text-fg-subtle" aria-live="polite">
        {showSkeleton ? "" : countLabel}
      </p>

      {showSkeleton ? (
        <ul className={GRID} aria-label="Loading events">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i}>
              <EventCardSkeleton />
            </li>
          ))}
        </ul>
      ) : count === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-border py-12 text-center">
          <div className="text-fg-faint [&_svg]:size-12" aria-hidden="true">
            <SearchX />
          </div>
          <p className="text-title-4 text-fg">No events match your filters.</p>
          {hasActiveFilters && (
            <p className="max-w-[42ch] text-caption text-fg-subtle">
              {[category !== "All" && category, q && `“${q}”`].filter(Boolean).join(" · ")}
            </p>
          )}
          <Button variant="secondary" onClick={() => setParams({})}>
            Clear filters
          </Button>
        </div>
      ) : (
        <ul className={GRID}>
          {sorted.map((event) => (
            <li key={event.id}>
              <EventCard event={event} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
