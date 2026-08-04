import { useRef } from "react";
import type { KeyboardEvent } from "react";
import { cn } from "@/lib/cn";

interface SegmentedProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  "aria-label"?: string;
}

/**
 * Roving-tabindex radiogroup. Scrolls horizontally on mobile per
 * 07-MOBILE.md §4 — it must never wrap to ragged rows.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  ...aria
}: SegmentedProps<T>) {
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const dir = event.key === "ArrowRight" ? 1 : -1;
    const next = (index + dir + options.length) % options.length;
    onChange(options[next]);
    itemRefs.current[next]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label={aria["aria-label"]}
      className={cn(
        "inline-flex max-w-full gap-0.5 overflow-x-auto rounded-sm border border-border bg-bg-muted p-0.5",
        "[scrollbar-width:none] snap-x [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {options.map((option, index) => {
        const selected = option === value;
        return (
          <button
            key={option}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              "h-7 shrink-0 snap-start whitespace-nowrap rounded-xs px-2.5 text-label transition-colors duration-[--dur-fast]",
              selected ? "bg-surface text-fg dark:shadow-popover" : "text-fg-muted hover:text-fg",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
