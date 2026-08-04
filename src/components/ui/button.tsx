import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const button = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-sm font-medium whitespace-nowrap " +
  "transition-colors duration-[var(--dur-fast)] " +
  "disabled:pointer-events-none disabled:opacity-50 " +
  "[&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:   "bg-brand text-brand-fg hover:bg-brand-hover active:bg-brand-active",
        secondary: "bg-surface text-fg border border-border-strong hover:bg-surface-hover active:bg-bg-inset",
        ghost:     "text-fg-muted hover:bg-bg-muted hover:text-fg active:bg-bg-inset",
        danger:    "bg-danger text-white hover:brightness-95 active:brightness-90",
        link:      "text-brand-text underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-7  px-2.5 text-label",
        md: "h-8  px-3   text-label",
        lg: "h-9  px-3.5 text-ui",
        xl: "h-10 px-[18px] text-ui",
        icon: "size-8 px-0",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

type Props = React.ComponentProps<"button"> &
  VariantProps<typeof button> & { asChild?: boolean };

export function Button({ className, variant, size, asChild, ...props }: Props) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(button({ variant, size }), className)} {...props} />;
}
export { button as buttonVariants };
