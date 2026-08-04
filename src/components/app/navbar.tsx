import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/events", label: "Events", end: false },
  { to: "/team", label: "Team", end: false },
] as const;

/**
 * Fixed, 56px, no scroll-shrink (the old 80→72px shrink caused reflow
 * jitter — C1.3). Below `sm` the desktop links and right cluster collapse
 * to a single hamburger opening the `Sheet` primitive, which fixes D3: the
 * old dual-logo lockup pushed the hamburger's right edge past the
 * viewport at 390px. Skip link is the first focusable element (D21).
 */
export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <header className="fixed inset-x-0 top-0 z-40 h-[var(--nav-h)] border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="container-page flex h-full items-center justify-between gap-3">
          <NavLink to="/" className="flex min-w-0 shrink items-center" aria-label="Envision IT Committee — home">
            <Logo />
          </NavLink>

          <nav className="hidden items-center gap-1 sm:flex" aria-label="Primary">
            {NAV_LINKS.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "relative flex h-8 items-center rounded-sm px-2.5 text-label transition-colors duration-[var(--dur-fast)] hover:bg-bg-muted",
                    isActive
                      ? "text-fg after:absolute after:inset-x-2.5 after:-bottom-px after:h-0.5 after:rounded-full after:bg-brand"
                      : "text-fg-muted",
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle className="hidden sm:inline-flex" />
            <Button asChild variant="primary" size="md" className="hidden sm:inline-flex">
              <Link to="/register">Register</Link>
            </Button>

            <IconButton
              aria-label="Open menu"
              className="size-10 sm:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu aria-hidden="true" />
            </IconButton>
          </div>
        </div>
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="flex flex-col p-0">
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          <SheetDescription className="sr-only">
            Links to every page on the site, plus the theme toggle.
          </SheetDescription>

          <div className="border-b border-border p-4">
            <Logo />
          </div>

          <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Mobile">
            {NAV_LINKS.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex h-11 items-center rounded-sm px-3 text-ui transition-colors duration-[var(--dur-fast)] hover:bg-bg-muted",
                    isActive ? "bg-brand-subtle text-brand-text" : "text-fg-muted",
                  )
                }
              >
                {label}
              </NavLink>
            ))}
            <Link
              to="/register"
              onClick={() => setOpen(false)}
              className="mt-2 flex h-11 items-center rounded-sm px-3 text-ui font-medium text-brand-text hover:bg-bg-muted"
            >
              Register
            </Link>
          </nav>

          <div className="flex items-center justify-between border-t border-border p-4">
            <span className="text-caption text-fg-subtle">Theme</span>
            <ThemeToggle />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
