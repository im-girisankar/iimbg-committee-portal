import { Link } from "react-router-dom";
import { getEvents } from "../lib/api";
import EventCard from "../components/EventCard";

/* ─────────────────────────────────────────────────────────────
   Home page — signature hero with inline SVG gold Buddha
   silhouette + gold CTA. Below: featured events (max 3).
   ───────────────────────────────────────────────────────────── */

export default function Home() {
  // Featured events are loaded client-side after render for SSR compatibility
  // In a full SSR setup we'd use a loader, but Vite SPA is fine for this scope.
  return (
    <div className="pt-16 pb-20 px-4">
      {/* Hero */}
      <section className="mx-auto max-w-[1120px] mb-20">
        {/* Buddha silhouette — the one permitted inline SVG "illustration" */}
        <div className="relative mb-12">
          <svg
            viewBox="0 0 320 200"
            className="w-full max-w-[400px] mx-auto"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            role="img"
            aria-label="Buddha silhouette in gold"
          >
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C9A227" />
                <stop offset="100%" stopColor="#8D7019" />
              </linearGradient>
            </defs>
            {/* Lotus base */}
            <path
              d="M160 180 C120 170 100 140 110 110 C115 90 135 80 160 75 C185 80 205 90 210 110 C220 140 200 170 160 180 Z"
              fill="url(#goldGrad)"
              opacity="0.15"
            />
            {/* Meditation posture */}
            <ellipse cx="160" cy="90" rx="55" ry="65" fill="url(#goldGrad)" opacity="0.25" />
            {/* Head */}
            <ellipse cx="160" cy="50" rx="30" ry="35" fill="url(#goldGrad)" opacity="0.35" />
            {/* Ushnisha / topknot */}
            <ellipse cx="160" cy="28" rx="18" ry="12" fill="url(#goldGrad)" opacity="0.45" />
            {/* Ear suggestion */}
            <ellipse cx="132" cy="52" rx="8" ry="14" fill="url(#goldGrad)" opacity="0.3" />
            <ellipse cx="188" cy="52" rx="8" ry="14" fill="url(#goldGrad)" opacity="0.3" />
            {/* Hands in dhyana mudra */}
            <ellipse cx="140" cy="130" rx="18" ry="10" fill="url(#goldGrad)" opacity="0.3" />
            <ellipse cx="180" cy="130" rx="18" ry="10" fill="url(#goldGrad)" opacity="0.3" />
          </svg>
        </div>

        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-[#F2EDE3] leading-tight mb-6">
            The committee that runs the campus's tech.
          </h1>
          <p className="text-lg md:text-xl text-[#9C948A] max-w-2xl mx-auto mb-10">
            From auditorium AV to classroom wifi — we keep IIM Bodh Gaya
            connected. Browse events, meet the team, join us.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#C9A227] text-[#12100C] font-display font-semibold text-lg rounded-xl hover:bg-[#C9A227]/90 transition-all hover:shadow-[0_0_0_1px_#C9A227] hover:shadow-lg"
          >
            Register for an event
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </section>

      {/* Featured events */}
      <section className="mx-auto max-w-[1120px]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-semibold text-[#F2EDE3]">
            Featured Events
          </h2>
          <Link
            to="/events"
            className="text-sm font-medium text-[#C9A227] hover:text-[#C9A227]/70 transition flex items-center gap-1"
          >
            View all
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>

        <FeaturedEventsGrid />
      </section>
    </div>
  );
}

/* Client-side component to fetch and render featured events */
function FeaturedEventsGrid() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvents().then((all) => {
      setEvents(all.filter((e) => e.featured).slice(0, 3));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-[#1C1915] border border-[#322C24] rounded-xl h-80" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <p className="text-center text-[#9C948A] py-12">
        No featured events right now. <Link to="/events" className="text-[#C9A227] underline">Check all events</Link>.
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event, i) => (
        <EventCard key={event.id} event={event} index={i} />
      ))}
    </div>
  );
}

// React hooks need to be imported
import { useState, useEffect } from "react";
import type { Event } from "../lib/schemas";