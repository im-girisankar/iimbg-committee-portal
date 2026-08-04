import { cn } from "@/lib/cn";

interface SpinnerProps {
  className?: string;
  /** Announced to screen readers, and shown as static text under reduced motion. */
  label?: string;
}

/**
 * 14px, currentColor, 600ms linear rotate. Under `prefers-reduced-motion` the
 * spinning glyph is replaced by a static label rather than frozen mid-spin.
 */
export function Spinner({ className, label = "Loading…" }: SpinnerProps) {
  return (
    <span role="status" className="inline-flex items-center gap-1.5">
      <svg
        className={cn("size-3.5 animate-spin motion-reduce:hidden", className)}
        style={{ animationDuration: "600ms", animationTimingFunction: "linear" }}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <span className="hidden text-label motion-reduce:inline">{label}</span>
      <span className="sr-only motion-reduce:hidden">{label}</span>
    </span>
  );
}
