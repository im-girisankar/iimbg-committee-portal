import { cn } from "@/lib/cn";
import type { Event } from "@/lib/schemas";

const CATEGORY_COLOR: Record<Event["category"], string> = {
  Workshop: "bg-cat-workshop",
  Competition: "bg-cat-competition",
  "Speaker Session": "bg-cat-speaker",
  Social: "bg-cat-social",
};

interface CategoryDotProps {
  category: Event["category"];
  className?: string;
}

/**
 * 6px colour dot keyed to `CATEGORIES` in `lib/schemas.ts`. ALWAYS render
 * this next to the category's visible text label — colour must never be
 * the sole carrier of meaning (WCAG 1.4.1).
 */
export function CategoryDot({ category, className }: CategoryDotProps) {
  return (
    <span
      className={cn("size-1.5 shrink-0 rounded-full", CATEGORY_COLOR[category], className)}
      aria-hidden="true"
    />
  );
}
