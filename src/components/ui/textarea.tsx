import { cn } from "@/lib/cn";

const base =
  "w-full rounded-sm border border-border-strong bg-surface text-ui text-fg " +
  "placeholder:text-fg-subtle transition-colors duration-[var(--dur-fast)] " +
  "hover:border-fg-faint " +
  "aria-[invalid=true]:border-danger-border " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn(base, "min-h-[88px] px-3 py-2 resize-y", className)} {...props} />;
}
