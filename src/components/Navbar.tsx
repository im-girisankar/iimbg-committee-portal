import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

/* ─────────────────────────────────────────────────────────────
   Navbar — logo left (dual logos), 4 links right. Hamburger < 768px.
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
          ? "h-14 bg-[var(--color-surface)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-surface)]/90 border-b border-[var(--color-border)] shadow-[var(--shadow-soft)]"
          : "h-16 bg-[var(--color-surface)] border-b border-[var(--color-border)]"
      }`}
      initial={false}
      animate={{ boxShadow: scrolled ? "var(--shadow-soft)" : "none" }}
      transition={{ duration: 0.2 }}
    >
      <div className="mx-auto max-w-[1120px] px-4">
        <div className="flex h-full items-center justify-between">
          {/* Logo - Dual logos side by side */}
          <NavLink
            to="/"
            className="flex items-center gap-3 font-display font-semibold transition-colors"
            aria-label="Envision IT Committee Home"
          >
            {/* IIM Bodh Gaya Logo */}
            <img
              src="/images/Logos/College%20logo%20(transparent).png"
              alt="IIM Bodh Gaya"
              className="h-8 w-auto"
              aria-hidden="true"
            />
            {/* IT Committee Logo */}
            <img
              src="/images/Logos/It%20comm%20logo%20(transparent).png"
              alt="IT Committee"
              className="h-8 w-auto"
              aria-hidden="true"
            />
            <span className="text-xl text-[var(--color-primary)]">
              Envision × IT Committee
            </span>
          </NavLink>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
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
            className="md:hidden p-2 rounded-lg text-[var(--color-primary)] hover:bg-[var(--color-border)] transition"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? (
              <svg
                width="24"
                height="24"
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
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile drawer */}
        {open && (
          <motion.div
            id="mobile-menu"
            className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-surface)]"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="flex flex-col gap-2 p-4">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2.5 rounded-lg text-base font-medium transition ${
                      isActive
                        ? "bg-[var(--color-accent)] text-white"
                        : "text-[var(--color-secondary)] hover:bg-[var(--color-border)] hover:text-[var(--color-primary)]"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}