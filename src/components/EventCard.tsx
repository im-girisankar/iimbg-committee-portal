import { NavLink } from "react-router-dom";
import type { Event } from "../lib/schemas";

/* ─────────────────────────────────────────────────────────────
   EventCard — displayed in a responsive grid (1/2/3 col).
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
      className="group bg-[#1C1915] border border-[#322C24] rounded-xl overflow-hidden transition-all hover:border-[#C9A227]/50 hover:shadow-[0_0_0_1px_#C9A227] flex flex-col h-full animate-fade-up"
      style={style}
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-[#241F19]">
        <img
          src={event.image}
          alt=""
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {event.featured && (
          <span className="absolute top-3 left-3 px-2 py-0.5 text-xs font-mono font-medium bg-[#C9A227] text-[#12100C] rounded">
            FEATURED
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Category + date */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 text-xs font-mono font-medium bg-[#241F19] text-[#6B7F5E] border border-[#6B7F5E]/30 rounded">
            {event.category}
          </span>
          <time className="text-xs text-[#9C948A] mono" dateTime={event.date}>
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
          <h3 className="text-lg font-display font-semibold text-[#F2EDE3] group-hover:text-[#C9A227] transition-colors mb-2 line-clamp-2">
            {event.title}
          </h3>
        </NavLink>

        <p className="text-sm text-[#9C948A] line-clamp-2 mb-4 flex-1">
          {event.description}
        </p>

        {/* Meta row: venue + seats */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-[#9C948A] mono border-t border-[#322C24] pt-3">
          <span className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {event.venue}
          </span>
          <span className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            {event.seats} seats
          </span>
        </div>
      </div>

      {/* CTA */}
      <NavLink
        to={`/register?event=${event.id}`}
        className="mx-5 mb-5 block text-center px-4 py-2.5 bg-[#C9A227] text-[#12100C] font-medium rounded-lg hover:bg-[#C9A227]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Register
      </NavLink>
    </article>
  );
}