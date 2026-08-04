import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/**
 * Extracted from App.tsx per 04-PAGES.md §P5. The old version was built on
 * a deleted gold/cream palette (raw hex from a removed theme, see D8 in
 * the audit) that only looked right because of the cascade bug in A1 —
 * every colour here is a token. Sizing is dvh-based per 07-MOBILE.md §3.4
 * rather than the viewport-unit that overshoots on mobile browser chrome.
 */
export default function NotFound() {
  return (
    <div className="container-page flex min-h-[calc(100dvh-var(--nav-h))] items-center justify-center py-16">
      <div className="w-full max-w-[420px] text-center">
        <p className="numeric text-micro uppercase text-fg-subtle">404</p>
        <h1 className="mt-3 text-title-1 text-fg">Page not found</h1>
        <p className="mt-3 text-prose text-fg-muted">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="primary" size="lg">
            <Link to="/">
              <ArrowLeft aria-hidden="true" />
              Back to home
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link to="/events">
              Browse events
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <Separator className="my-8" />

        <p className="text-micro uppercase text-fg-subtle">Try one of these</p>
        <ul className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-ui">
          <li>
            <Link to="/events" className="text-brand-text underline-offset-4 hover:underline">
              Events
            </Link>
          </li>
          <li aria-hidden="true" className="text-fg-faint">
            ·
          </li>
          <li>
            <Link to="/team" className="text-brand-text underline-offset-4 hover:underline">
              Team
            </Link>
          </li>
          <li aria-hidden="true" className="text-fg-faint">
            ·
          </li>
          <li>
            <Link to="/register" className="text-brand-text underline-offset-4 hover:underline">
              Register
            </Link>
          </li>
          <li aria-hidden="true" className="text-fg-faint">
            ·
          </li>
          <li>
            <a href="/api/docs" className="text-brand-text underline-offset-4 hover:underline">
              API reference
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
