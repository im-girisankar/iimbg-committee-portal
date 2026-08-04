import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/**
 * Static cards cast no shadow (02-DESIGN-SYSTEM.md §4.3). Hovering an
 * `interactive` card changes only its fill — never the border, never a
 * shadow, never a transform (§4.4). Use `asChild` so the whole card can be
 * the single link target (fixes D16 — no nested/duplicate links).
 */
const card = cva("rounded-md border border-border bg-surface", {
  variants: {
    interactive: {
      true: "transition-colors duration-[--dur-fast] hover:bg-surface-hover",
      false: "",
    },
  },
  defaultVariants: { interactive: false },
});

type CardProps = React.ComponentProps<"div"> &
  VariantProps<typeof card> & { asChild?: boolean };

export function Card({ className, interactive, asChild, ...props }: CardProps) {
  const Comp = asChild ? Slot : "div";
  return <Comp className={cn(card({ interactive }), className)} {...props} />;
}

export function CardMedia({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("overflow-hidden rounded-t-md", className)} {...props} />;
}

const cardBody = cva("", {
  variants: {
    padding: {
      default: "p-5",
      compact: "p-4",
    },
  },
  defaultVariants: { padding: "default" },
});

type CardBodyProps = React.ComponentProps<"div"> & VariantProps<typeof cardBody>;

export function CardBody({ className, padding, ...props }: CardBodyProps) {
  return <div className={cn(cardBody({ padding }), className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("border-t border-border p-5", className)} {...props} />;
}
