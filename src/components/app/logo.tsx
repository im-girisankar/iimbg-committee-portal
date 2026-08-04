import { cn } from "@/lib/cn";

/**
 * Single source of truth for both mark URLs. Fixes D24 — Navbar and Footer
 * previously loaded byte-identical files under two different URLs
 * (`it-comm-logo.png` vs `It%20comm%20logo%20(transparent).png`), so the
 * 1.05 MB image downloaded twice per page view.
 */
export const COLLEGE_LOGO_SRC = "/images/Logos/college-logo.png";
export const COMMITTEE_LOGO_SRC = "/images/Logos/it-comm-logo.png";

interface LogoProps {
  className?: string;
  /** Render the wordmark beside the marks. */
  wordmark?: boolean;
}

/**
 * A collaboration lockup: two marks joined by a `×`, reading
 * "Envision × IT Committee".
 *
 * The `×` is set in `--fg-faint` and sits between the two logos rather than
 * letting them run flush, so the pairing reads as a partnership between two
 * bodies instead of one organisation with a busy icon.
 *
 * The responsive behaviour is load-bearing, not decoration. The original
 * navbar put two 40px logos beside a 24px `whitespace-nowrap` wordmark, which
 * pushed the hamburger to a right edge of 432px inside a 406px viewport and
 * left the mobile menu unreachable. Here the marks stay 22px, the wordmark
 * only appears from `sm`, and every text node can truncate.
 */
export function Logo({ className, wordmark = true }: LogoProps) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1.5", className)}>
      <img
        src={COLLEGE_LOGO_SRC}
        alt=""
        aria-hidden="true"
        width={22}
        height={22}
        decoding="async"
        className="size-[22px] shrink-0 object-contain"
      />
      <span aria-hidden="true" className="shrink-0 text-caption text-fg-faint">
        ×
      </span>
      <img
        src={COMMITTEE_LOGO_SRC}
        alt=""
        aria-hidden="true"
        width={22}
        height={22}
        decoding="async"
        className="size-[22px] shrink-0 object-contain"
      />
      {wordmark && (
        <span className="ml-1 hidden min-w-0 items-baseline gap-1.5 sm:inline-flex">
          <span className="truncate text-title-4 text-fg">Envision</span>
          <span aria-hidden="true" className="hidden text-caption text-fg-faint md:inline">
            ×
          </span>
          <span className="hidden truncate text-caption text-fg-subtle md:inline">
            IT Committee
          </span>
        </span>
      )}
    </span>
  );
}
