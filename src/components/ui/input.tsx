import { cn } from "@/lib/cn";

const base =
  "w-full rounded-sm border border-border-strong bg-surface text-ui text-fg " +
  "placeholder:text-fg-subtle transition-colors duration-[--dur-fast] " +
  "hover:border-fg-faint " +
  "aria-[invalid=true]:border-danger-border " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn(base, "h-9 px-3", className)} {...props} />;
}
