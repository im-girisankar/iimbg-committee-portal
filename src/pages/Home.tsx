import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Users } from "lucide-react";
import { Section } from "@/components/app/section";
import { EventCard } from "@/components/app/event-card";
import { CategoryDot } from "@/components/app/category-dot";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDelayedLoading } from "@/lib/use-delayed-loading";
import { getEvents } from "@/lib/api";
import { formatDateTime, isUpcoming } from "@/lib/format";
import type { Event } from "@/lib/schemas";

/**
 * Home — left-aligned hero, a single "Next up" card (the highest-value
 * block, costs no new request), and a featured grid reusing `EventCard`.
 * The stat strip from 04-PAGES.md §P1 is a scope cut (05-EXECUTION.md
 * "SCOPE CUTS") — deliberately not built. No mount animations.
 */
export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    let active = true;
    getEvents().then((evs) => {
      if (!active) return;
      setEvents(evs);
      setIsFetching(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const showSkeleton = useDelayedLoading(isFetching);

  // Soonest upcoming event; falls back to the first featured event when
  // nothing is upcoming (e.g. a stale data snapshot).
  const nextUp = useMemo(() => {
    const upcoming = events
      .filter((e) => isUpcoming(e.date))
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    return upcoming[0] ?? events.find((e) => e.featured) ?? null;
  }, [events]);

  const featured = useMemo(() => events.filter((e) => e.featured).slice(0, 3), [events]);

  return (
    <div className="container-page pt-10 pb-16 lg:pt-14 lg:pb-24">
      {/* Hero — left-aligned, not centred */}
      <div className="max-w-[58ch]">
        <p className="flex items-center gap-2 text-micro uppercase text-fg-subtle">
          <span className="size-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
          Envision · Entrepreneurship Cell
        </p>

        <h1 className="mt-4 max-w-[18ch] text-[2rem] leading-[1.05] font-semibold tracking-[-0.032em] text-fg sm:text-[2.5rem] md:text-[2.75rem]">
          Building the next generation of founders at IIM Bodh Gaya
        </h1>

        <p className="mt-4 max-w-[58ch] text-prose text-fg-muted">
          Envision is the Entrepreneurship Cell of IIM Bodh Gaya. Events, mentorship, funding
          access, and a community of builders.
        </p>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <Button asChild variant="primary" size="xl" className="w-full sm:w-auto">
            <Link to="/events">Browse events</Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
            <Link to="/team">Meet the team</Link>
          </Button>
        </div>
      </div>

      {/* Next up — the single highest-value block; no new request */}
      <div className="mt-16 lg:mt-24">
        <p className="mb-3 text-micro uppercase text-fg-subtle">Next up</p>
        {showSkeleton ? (
          <NextUpSkeleton />
        ) : nextUp ? (
          <NextUpCard event={nextUp} />
        ) : null}
      </div>

      {/* Featured events — omitted entirely when there are none */}
      {(showSkeleton || featured.length > 0) && (
        <Section
          title="Featured events"
          action={
            <Link
              to="/events"
              className="inline-flex items-center gap-1 text-label text-fg-subtle transition-colors duration-[var(--dur-fast)] hover:text-fg"
            >
              View all
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          }
        >
          {showSkeleton ? (
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading events">
              {[0, 1, 2].map((i) => (
                <li key={i}>
                  <FeaturedCardSkeleton />
                </li>
              ))}
            </ul>
          ) : (
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((event) => (
                <li key={event.id}>
                  <EventCard event={event} />
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}
    </div>
  );
}

function NextUpCard({ event }: { event: Event }) {
  return (
    <Card>
      <CardBody className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-caption text-fg-muted">
          <span className="inline-flex items-center gap-1.5">
            <CategoryDot category={event.category} />
            {event.category}
          </span>
          <span className="numeric text-fg-subtle">{formatDateTime(event.date, event.time)}</span>
          <span className="inline-flex items-center gap-1.5 text-fg-subtle">
            <MapPin className="size-3.5" aria-hidden="true" />
            {event.venue}
          </span>
          <span className="inline-flex items-center gap-1.5 text-fg-subtle">
            <Users className="size-3.5" aria-hidden="true" />
            {event.seats} seats
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-2 text-fg">{event.title}</h2>
          <Button asChild variant="primary" size="lg" className="w-full shrink-0 sm:w-auto">
            <Link to={`/register?event=${event.id}`}>Register</Link>
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

function NextUpSkeleton() {
  return (
    <Card>
      <CardBody className="flex flex-col gap-3">
        <Skeleton className="h-4 w-2/3" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-9 w-full sm:w-28" />
        </div>
      </CardBody>
    </Card>
  );
}

function FeaturedCardSkeleton() {
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
