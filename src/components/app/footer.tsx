import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

type FooterLink = { label: string; href: string; kind: "route" | "anchor" };

interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

/**
 * Developers → API Reference / OpenAPI spec are real, working endpoints
 * that were previously linked from nowhere (D23). Committee → About /
 * Contact have no corresponding routes, so per the contract (no invented
 * routes) they are plain anchors to "/" rather than fabricated pages.
 */
const COLUMNS: FooterColumn[] = [
  {
    heading: "Portal",
    links: [
      { label: "Events", href: "/events", kind: "route" },
      { label: "Team", href: "/team", kind: "route" },
      { label: "Register", href: "/register", kind: "route" },
    ],
  },
  {
    heading: "Committee",
    links: [
      { label: "About", href: "/", kind: "anchor" },
      { label: "Contact", href: "/", kind: "anchor" },
    ],
  },
  {
    heading: "Developers",
    links: [
      { label: "API Reference", href: "/api/docs", kind: "anchor" },
      { label: "OpenAPI spec", href: "/api/openapi.json", kind: "anchor" },
    ],
  },
];

const linkClass = "text-ui text-fg-muted transition-colors duration-[var(--dur-fast)] hover:text-fg";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="container-page grid grid-cols-1 gap-8 py-12 md:grid-cols-3 md:py-16">
        {COLUMNS.map((col) => (
          <div key={col.heading} className="min-w-0">
            <h3 className="text-micro uppercase text-fg-subtle">{col.heading}</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  {link.kind === "route" ? (
                    <Link to={link.href} className={linkClass}>
                      {link.label}
                    </Link>
                  ) : (
                    <a href={link.href} className={linkClass}>
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div
          className={cn(
            "container-page flex flex-col items-center gap-4 py-6",
            "sm:flex-row sm:justify-between",
          )}
        >
          <Link to="/" aria-label="Envision IT Committee — home">
            <Logo wordmark={false} />
          </Link>
          <p className="text-center text-caption text-fg-subtle">
            © {year} Envision × IT Committee · IIM Bodh Gaya
          </p>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
