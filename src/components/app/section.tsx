import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SectionProps {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * `<section>` + optional `h2` + optional "view all" action. Vertical
 * rhythm (48px mobile / 64px desktop, per 02-DESIGN-SYSTEM §3) is owned
 * here so it stops being sprinkled per page.
 */
export function Section({ title, action, children, className }: SectionProps) {
  return (
    <section className={cn("py-12 lg:py-16", className)}>
      {(title || action) && (
        <div className="mb-5 flex items-center justify-between gap-4">
          {title && <h2 className="text-title-2 text-fg">{title}</h2>}
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
