import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { useTheme, type Theme } from "@/lib/use-theme";

const NEXT_THEME: Record<Theme, Theme> = {
  light: "dark",
  dark: "system",
  system: "light",
};

/** aria-label always describes the state a click will move TO, not the
 * current state. */
const NEXT_LABEL: Record<Theme, string> = {
  light: "Switch to dark theme",
  dark: "Switch to system theme",
  system: "Switch to light theme",
};

const ICON: Record<Theme, LucideIcon> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useTheme();
  const Icon = ICON[theme];

  return (
    <IconButton
      aria-label={NEXT_LABEL[theme]}
      className={className}
      onClick={() => setTheme(NEXT_THEME[theme])}
    >
      <Icon aria-hidden="true" />
    </IconButton>
  );
}
