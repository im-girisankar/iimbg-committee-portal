import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Users } from "lucide-react";
import { Card, CardBody, CardMedia } from "@/components/ui/card";
import { CategoryDot } from "./category-dot";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Event } from "@/lib/schemas";

interface EventCardProps {
  event: Event;
  className?: string;
}

/**
 * Grid-only card — the `variant="row"` list layout from 03-COMPONENTS §4.1
 * was cut in 05-EXECUTION's scope cuts (grid only, no view toggle).
 *
 * The whole card is a single `<Link>` to the registration form (fixes
 * D16 — today the title and CTA both link to the same href, so keyboard
 * users tab it twice). There is exactly one `<a>` rendered here.
 */
export function EventCard({ event, className }: EventCardProps) {
  return (
    <Card
      asChild
      interactive
      className={cn("group flex h-full flex-col overflow-hidden", className)}
    >
      <Link to={`/register?event=${event.id}`}>
        <CardMedia>
          <img
            src={event.image}
            alt=""
            loading="lazy"
            decoding="async"
            className="aspect-[3/2] max-h-[180px] w-full object-cover dark:brightness-[.92] sm:max-h-none"
          />
        </CardMedia>

        <CardBody className="flex flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-caption text-fg-muted">
              <CategoryDot category={event.category} />
              {event.category}
            </span>
            {/* D22: `time` was never displayed anywhere — it is now. */}
            <span className="numeric text-caption text-fg-subtle">
              {formatDateTime(event.date, event.time)}
            </span>
            {event.featured && (
              <span className="inline-flex h-5 items-center gap-1.5 rounded-xs border border-brand-border bg-brand-subtle px-2 text-caption font-medium text-brand-text">
                Featured
              </span>
            )}
          </div>

          <h3 className="text-title-3 text-fg" title={event.title}>
            {event.title}
          </h3>

          <p className="line-clamp-2 flex-1 text-prose text-fg-muted" title={event.description}>
            {event.description}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-caption text-fg-subtle">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" aria-hidden="true" />
              {event.venue}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-3.5" aria-hidden="true" />
              {event.seats} seats
            </span>
          </div>

          <span className="inline-flex items-center gap-1 text-label text-fg-subtle transition-colors duration-[var(--dur-fast)] group-hover:text-fg">
            Register
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </span>
        </CardBody>
      </Link>
    </Card>
  );
}
