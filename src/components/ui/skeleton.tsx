import { cn } from "@/lib/cn";

interface SkeletonProps extends React.ComponentProps<"div"> {
  width?: number | string;
  height?: number | string;
}

/**
 * Fixes D15: `bg-bg-muted` against `--bg` is visible in both themes, unlike
 * the old `bg-background` on `bg-background`. Compose page-shaped skeletons
 * whose dimensions match the real content to within 8px so nothing jumps.
 */
export function Skeleton({ className, style, width, height, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-sm bg-bg-muted", className)}
      style={{ width, height, ...style }}
      {...props}
    />
  );
}
