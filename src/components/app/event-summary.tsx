import { Calendar, CalendarDays, MapPin, Users } from "lucide-react";
import { Card, CardBody, CardMedia } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryDot } from "./category-dot";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Event } from "@/lib/schemas";

interface EventSummaryProps {
  event: Event | null;
  loading?: boolean;
  className?: string;
}

/**
 * Context panel for the Register form. Consumes an `Event` the page has
 * already loaded — no fetch happens here.
 *
 * Two layouts live in this one component so the page doesn't need a variant
 * prop: a compact single row below `lg` (07-MOBILE §4 — context goes above
 * the form on mobile), and the full card from `lg` up where it sits beside
 * the form. Only one of the two is ever visible at a given viewport.
 */
export function EventSummary({ event, loading, className }: EventSummaryProps) {
  if (loading) {
    return (
      <div className={className}>
        <div className="flex items-center gap-3 rounded-md border border-border bg-surface p-3 lg:hidden">
          <Skeleton className="size-14 shrink-0 rounded-sm" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <Card className="hidden overflow-hidden lg:block">
          <Skeleton className="aspect-[3/2] w-full rounded-none" />
          <CardBody className="flex flex-col gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/3" />
          </CardBody>
        </Card>
      </div>
    );
  }

  /* No selection yet. Deliberately NOT a full-height card with an empty
     image well — that rendered as a large blank grey box that looked like a
     failed image load rather than a prompt. A single dashed row states what
     to do and takes only the space it needs. */
  if (!event) {
    return (
      <div className={className}>
        <div className="flex items-center gap-2.5 rounded-md border border-dashed border-border px-3 py-3 text-ui text-fg-subtle">
          <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
          <span>Pick an event to see its details here.</span>
        </div>
      </div>
    );
  }

  const when = formatDateTime(event.date, event.time);

  return (
    <div className={className}>
      {/* Compact row — mobile only. Context first, then the form. */}
      <div className="flex items-center gap-3 rounded-md border border-border bg-surface p-3 lg:hidden">
        <img
          src={event.image}
          alt=""
          width={56}
          height={56}
          loading="lazy"
          decoding="async"
          className="size-14 shrink-0 rounded-sm object-cover"
        />
        <div className="min-w-0">
          <p className="truncate text-label font-medium text-fg">{event.title}</p>
          <p className="numeric text-caption text-fg-subtle">{when}</p>
        </div>
      </div>

      {/* Full card — lg and up */}
      <Card className="hidden overflow-hidden lg:block">
        <CardMedia>
          <img
            src={event.image}
            alt=""
            width={600}
            height={400}
            loading="lazy"
            decoding="async"
            className="aspect-[3/2] w-full object-cover"
          />
        </CardMedia>
        <CardBody className="flex flex-col gap-3">
          <span className={cn("inline-flex items-center gap-1.5 text-caption text-fg-muted")}>
            <CategoryDot category={event.category} />
            {event.category}
          </span>
          <h2 className="text-title-3 text-fg">{event.title}</h2>
          <dl className="flex flex-col gap-2 text-ui text-fg-muted">
            <div className="flex items-center gap-2">
              <dt className="sr-only">Date and time</dt>
              <Calendar className="size-4 shrink-0 text-fg-subtle" aria-hidden="true" />
              <dd className="numeric">{when}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="sr-only">Venue</dt>
              <MapPin className="size-4 shrink-0 text-fg-subtle" aria-hidden="true" />
              <dd>{event.venue}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="sr-only">Seats</dt>
              <Users className="size-4 shrink-0 text-fg-subtle" aria-hidden="true" />
              <dd>{event.seats} seats</dd>
            </div>
          </dl>
        </CardBody>
      </Card>
    </div>
  );
}
