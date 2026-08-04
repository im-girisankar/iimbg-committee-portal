import { Segmented } from "@/components/ui/segmented";
import { SearchInput } from "@/components/ui/search-input";
import { CATEGORIES } from "@/lib/schemas";
import { cn } from "@/lib/cn";

const CATEGORY_OPTIONS = ["All", ...CATEGORIES] as const;
type CategoryOption = (typeof CATEGORY_OPTIONS)[number];

interface EventsToolbarProps {
  category: string;
  query: string;
  onChange: (next: { category?: string; q?: string }) => void;
  className?: string;
}

/**
 * Replaces `FilterBar`. Fully CONTROLLED — holds no state of its own.
 * `Events.tsx` derives `category`/`query` from `useSearchParams` and is the
 * single source of truth, which is what fixes D1 (deep links not applying)
 * and D2 (clear-filters desync).
 *
 * Mobile (07-MOBILE §4): search sits full-width on its own row ABOVE the
 * categories; categories scroll horizontally and never wrap.
 */
export function EventsToolbar({ category, query, onChange, className }: EventsToolbarProps) {
  const value: CategoryOption = (CATEGORY_OPTIONS as readonly string[]).includes(category)
    ? (category as CategoryOption)
    : "All";

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      <SearchInput
        value={query}
        onChange={(q) => onChange({ q })}
        placeholder="Search events…"
        aria-label="Search events"
        className="sm:order-2 sm:w-64"
      />
      <Segmented
        options={CATEGORY_OPTIONS}
        value={value}
        onChange={(next) => onChange({ category: next })}
        aria-label="Filter events by category"
        className="sm:order-1"
      />
    </div>
  );
}
