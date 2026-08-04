import { cn } from "@/lib/cn";

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return <label className={cn("text-label text-fg", className)} {...props} />;
}
