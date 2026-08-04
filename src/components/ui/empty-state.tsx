import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-md border border-dashed border-border py-12 text-center",
        className,
      )}
    >
      {icon && (
        <div className="text-fg-faint [&_svg]:size-12" aria-hidden="true">
          {icon}
        </div>
      )}
      <p className="text-title-4 text-fg">{title}</p>
      {description && <p className="max-w-[42ch] text-caption text-fg-subtle">{description}</p>}
      {action}
    </div>
  );
}
