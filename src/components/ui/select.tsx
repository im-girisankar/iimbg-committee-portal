import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export function Select({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(
          "w-full h-9 pl-3 pr-9 rounded-sm appearance-none",
          "border border-border-strong bg-surface text-ui text-fg",
          "transition-colors duration-[var(--dur-fast)] hover:border-fg-faint",
          "aria-[invalid=true]:border-danger-border disabled:opacity-50",
          className,
        )}
        {...props}
      />
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-fg-subtle"
        aria-hidden="true"
      />
    </div>
  );
}
