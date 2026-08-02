import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

/* ─────────────────────────────────────────────────────────────
   Navbar — logo left, 4 links right. Hamburger < 768px.
   Gold focus rings (from index.css :focus-visible).
   ───────────────────────────────────────────────────────────── */

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/events", label: "Events" },
  { to: "/team", label: "Team" },
  { to: "/register", label: "Register" },
] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[#12100C]/95 backdrop-blur supports-[backdrop-filter]:bg-[#12100C]/80 border-b border-[#322C24]">
      <div className="mx-auto max-w-[1120px] px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 text-xl font-display font-semibold text-[#F2EDE3] aria-[current=page]:text-[#C9A227]">
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect width="28" height="28" rx="6" fill="#C9A227" />
              <path
                d="M7 14L12 19L21 9"
                stroke="#12100C"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>IIMBG IT Committee</span>
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
                      ? "text-[#C9A227]"
                      : "text-[#9C948A] hover:text-[#F2EDE3]"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-[#F2EDE3] hover:bg-[#322C24] transition"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            )}
          </button>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-[#322C24] animate-fade-up">
            <div className="flex flex-col gap-3">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-base font-medium transition ${
                      isActive
                        ? "bg-[#C9A227] text-[#12100C]"
                        : "text-[#9C948A] hover:bg-[#322C24] hover:text-[#F2EDE3]"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}