import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

/* ─────────────────────────────────────────────────────────────
   Navbar — dual logos left, 4 links right. Hamburger < 768px.
   Shrink animation on scroll using Framer Motion.
   Uses new design tokens from index.css.
   ───────────────────────────────────────────────────────────── */

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/events", label: "Events" },
  { to: "/team", label: "Team" },
  { to: "/register", label: "Register" },
] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll position for shrink animation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
        scrolled
          ? "h-[72px] bg-[var(--color-surface)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-surface)]/90 border-b border-[var(--color-border)] shadow-[var(--shadow-soft)]"
          : "h-20 bg-[var(--color-surface)] border-b border-[var(--color-border)]"
      }`}
      initial={false}
      animate={{ boxShadow: scrolled ? "var(--shadow-soft)" : "none" }}
      transition={{ duration: 0.2 }}
    >
      <div className="mx-auto flex h-full max-w-[1120px] px-4">
        <div className="flex h-full w-full items-center justify-between">
          {/* Logo - Dual logos side by side */}
          <NavLink
            to="/"
            className="flex items-center gap-3 font-display font-semibold transition-colors shrink-0"
            aria-label="Envision IT Committee Home"
          >
            {/* Logo wrapper for alignment */}
            <div className="flex items-center gap-3">
              {/* IIM Bodh Gaya Logo */}
              <img
                src="/images/Logos/college-logo.png"
                alt="IIM Bodh Gaya"
                className="h-10 w-auto max-h-10 object-contain"
                aria-hidden="true"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              {/* IT Committee Logo */}
              <img
                src="/images/Logos/it-comm-logo.png"
                alt="IT Committee"
                className="h-10 w-auto max-h-10 object-contain"
                aria-hidden="true"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <span className="text-2xl text-[var(--color-primary)] whitespace-nowrap">
              Envision × IT Committee
            </span>
          </NavLink>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-3 py-2 text-base font-medium transition-colors ${
                    isActive
                      ? "text-[var(--color-accent)]"
                      : "text-[var(--color-secondary)] hover:text-[var(--color-primary)]"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-[var(--color-primary)] hover:text-[var(--color-accent)] transition-colors"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {open ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <motion.div
          id="mobile-menu"
          className="md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute top-0 right-0 h-screen w-72 bg-[var(--color-surface)] border-l border-[var(--color-border)] shadow-[var(--shadow-soft)] p-6 flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <span className="font-display font-semibold text-xl text-[var(--color-primary)]">
                Menu
              </span>
              <button
                onClick={() => setOpen(false)}
                className="p-2 text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors"
                aria-label="Close menu"
              >
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                      isActive
                        ? "bg-[var(--color-accent)] text-white"
                        : "text-[var(--color-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-background)]"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
          {/* Backdrop */}
          <div
            className="absolute inset-0 -z-10 bg-black/30"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
        </motion.div>
      )}
    </motion.nav>
  );
}
