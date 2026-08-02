import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getEvents } from "../lib/api";
import type { Event } from "../lib/schemas";
import EventCard from "../components/EventCard";

/* ─────────────────────────────────────────────────────────────
   Home page — Envision Entrepreneurship Cell, IIM Bodh Gaya
   Clean, minimal hero with staggered fade-up animations.
   Featured events grid below (max 3).
   ───────────────────────────────────────────────────────────── */

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative pt-20 pb-28 px-4 md:pt-32 md:pb-36">
        <div className="mx-auto max-w-[1120px]">
          <div className="text-center max-w-3xl mx-auto">
            {/* Optional badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-surface/80 backdrop-blur-sm mb-8"
            >
              <span className="mono text-xs">Powered by</span>
              <span className="font-display font-semibold text-primary">Envision</span>
              <span className="text-secondary">×</span>
              <span className="font-display font-semibold text-primary">IT Committee</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-semibold text-4xl md:text-5xl lg:text-6xl leading-tight text-primary mb-6 tracking-tight"
            >
              Building the next generation of founders at IIM Bodh Gaya
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg md:text-xl text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Envision is the Entrepreneurship Cell of IIM Bodh Gaya. We empower aspiring founders
              through events, mentorship, funding access, and a vibrant community of builders.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/events"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-accent text-white font-display font-semibold text-lg rounded-2xl hover:bg-accent/90 transition-all hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                Explore Events
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>

              <Link
                to="/team"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border-2 border-border text-primary font-display font-semibold text-lg rounded-2xl hover:border-accent hover:text-accent hover:bg-accent/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                Join the Team
              </Link>
            </motion.div>

            {/* Subtle illustration / visual element */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-16 relative"
              aria-hidden="true"
            >
              <div className="relative mx-auto max-w-4xl">
                {/* Decorative geometric shapes */}
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-2xl bg-accent/10 blur-2xl" />
                <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-2xl bg-accent-secondary/10 blur-2xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl border border-border bg-surface/50 backdrop-blur-sm flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent/50">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured events */}
      <section className="px-4 pb-20 md:pb-28">
        <div className="mx-auto max-w-[1120px]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-display font-semibold text-2xl md:text-3xl text-primary"
            >
              Featured Events
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Link
                to="/events"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent/70 transition-colors"
              >
                View all
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          </div>

          <FeaturedEventsGrid />
        </div>
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
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
        }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        aria-busy="true"
      >
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
            }}
            className="bg-surface border border-border rounded-2xl h-80 animate-pulse"
          />
        ))}
      </motion.div>
    );
  }

  if (events.length === 0) {
    return (
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center text-secondary py-16"
      >
        No featured events right now.{" "}
        <Link to="/events" className="text-accent underline underline-offset-2 hover:text-accent/70 transition-colors">
          Check all events
        </Link>
        .
      </motion.p>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
      }}
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {events.map((event, i) => (
        <motion.div key={event.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}>
          <EventCard event={event} index={i} />
        </motion.div>
      ))}
    </motion.div>
  );
}