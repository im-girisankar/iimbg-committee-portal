import { cn } from "@/lib/cn";

/**
 * Single source of truth for the brand mark's URL. Fixes D24 — previously
 * Navbar loaded `/images/Logos/it-comm-logo.png` while Footer loaded
 * `/images/Logos/It%20comm%20logo%20(transparent).png`, byte-identical
 * files served under two different URLs (double download per pageview).
 */
export const LOGO_SRC = "/images/Logos/it-comm-logo.png";

interface LogoProps {
  className?: string;
  /**
   * Render the "Envision" / "IT Committee" wordmark next to the mark.
   * Per 07-MOBILE.md §4: the wordmark itself only appears from `sm`, and
   * "IT Committee" only from `md` — this prop only controls whether the
   * wordmark markup is rendered at all (off for contexts, like the footer
   * bottom bar, that already show the full name as body text elsewhere).
   */
  wordmark?: boolean;
}

export function Logo({ className, wordmark = true }: LogoProps) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2", className)}>
      <img
        src={LOGO_SRC}
        alt=""
        aria-hidden="true"
        width={24}
        height={24}
        decoding="async"
        className="size-6 shrink-0 object-contain"
      />
      {wordmark && (
        <span className="hidden min-w-0 items-baseline gap-1.5 sm:inline-flex">
          <span className="truncate text-title-4 text-fg">Envision</span>
          <span className="hidden truncate text-caption text-fg-subtle md:inline">
            IT Committee
          </span>
        </span>
      )}
    </span>
  );
}
