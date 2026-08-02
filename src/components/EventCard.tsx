import { NavLink } from "react-router-dom";
import type { Event } from "../lib/schemas";

/* ─────────────────────────────────────────────────────────────
   EventCard — displayed in a responsive grid (1/2/3 col).
   Uses new design tokens: surface, border, primary, secondary, accent.
   Staggered fade-up via CSS animation delay (handled by parent).
   ───────────────────────────────────────────────────────────── */

interface Props {
  event: Event;
  index?: number; // for stagger delay
}

export default function EventCard({ event, index = 0 }: Props) {
  const style = index > 0 ? { animationDelay: `${Math.min(index, 12) * 60}ms` } : {};

  return (
    <article
      className="group bg-surface border border-border rounded-2xl overflow-hidden transition-all hover:border-accent/30 hover:shadow-card flex flex-col h-full animate-fade-up"
      style={style}
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-background">
        <img
          src={event.image}
          alt=""
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {event.featured && (
          <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-mono font-medium bg-accent text-white rounded">
            FEATURED
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Category + date */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-2.5 py-1 text-xs font-mono font-medium bg-background text-accent border border-accent/20 rounded">
            {event.category}
          </span>
          <time className="text-xs text-secondary mono" dateTime={event.date}>
            {new Date(event.date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </time>
        </div>

        <NavLink
          to={`/register?event=${event.id}`}
          className="group"
        >
          <h3 className="text-lg font-display font-semibold text-primary group-hover:text-accent transition-colors mb-2 line-clamp-2">
            {event.title}
          </h3>
        </NavLink>

        <p className="text-sm text-secondary line-clamp-2 mb-4 flex-1">
          {event.description}
        </p>

        {/* Meta row: venue + seats */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-secondary mono border-t border-border pt-3">
          <span className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {event.venue}
          </span>
          <span className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            {event.seats} seats
          </span>
        </div>
      </div>

      {/* CTA */}
      <NavLink
        to={`/register?event=${event.id}`}
        className="mx-5 mb-5 block text-center px-4 py-2.5 bg-accent text-white font-medium rounded-xl hover:bg-accent/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Register
      </NavLink>
    </article>
  );
}