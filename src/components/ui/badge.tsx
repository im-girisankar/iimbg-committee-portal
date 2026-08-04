import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badge = cva("inline-flex h-5 items-center gap-1.5 rounded-xs border px-2 text-caption font-medium", {
  variants: {
    variant: {
      neutral: "bg-bg-muted text-fg-muted border-transparent",
      outline: "bg-transparent text-fg-muted border-border-strong",
      brand: "bg-brand-subtle text-brand-text border-brand-border",
      danger: "bg-danger-subtle text-danger border-danger-border",
      success: "bg-success-subtle text-success border-success-border",
      warning: "bg-warning-subtle text-warning border-warning-border",
      info: "bg-info-subtle text-info border-info-border",
    },
  },
  defaultVariants: { variant: "neutral" },
});

type Props = React.ComponentProps<"span"> & VariantProps<typeof badge>;

export function Badge({ className, variant, ...props }: Props) {
  return <span className={cn(badge({ variant }), className)} {...props} />;
}
export { badge as badgeVariants };
