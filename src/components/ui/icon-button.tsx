import type { ComponentProps } from "react";
import { Button } from "./button";

type ButtonProps = ComponentProps<typeof Button>;

interface IconButtonProps extends Omit<ButtonProps, "size"> {
  /** Required — an icon-only control must always name itself for a11y. */
  "aria-label": string;
}

/** `Button` at `size="icon"`; `aria-label` is required at the type level. */
export function IconButton({ variant = "ghost", className, ...props }: IconButtonProps) {
  return <Button variant={variant} size="icon" className={className} {...props} />;
}
