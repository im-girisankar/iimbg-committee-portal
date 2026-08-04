import { cn } from "@/lib/cn";

export function Separator({ className, ...props }: React.ComponentProps<"hr">) {
  return <hr role="separator" className={cn("border-0 border-t border-border", className)} {...props} />;
}
