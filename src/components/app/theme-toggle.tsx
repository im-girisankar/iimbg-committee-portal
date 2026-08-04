import { Moon, Sun } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { useTheme } from "@/lib/use-theme";

/**
 * A plain two-state switch: one click always flips what is on screen.
 *
 * It used to cycle light → dark → system, which meant a first-time visitor
 * (who starts on `system`) had to click twice to reach dark, and saw a
 * monitor glyph that described the *source* of the theme rather than the
 * theme itself. `system` is still the default on first load; choosing
 * explicitly just pins it.
 *
 * The icon shows the destination, not the current state — a moon means
 * "click for dark".
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolved, toggle } = useTheme();
  const goingDark = resolved === "light";

  return (
    <IconButton
      aria-label={goingDark ? "Switch to dark theme" : "Switch to light theme"}
      title={goingDark ? "Switch to dark theme" : "Switch to light theme"}
      className={className}
      onClick={toggle}
    >
      {goingDark ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}
    </IconButton>
  );
}
