import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

/** Must match the blocking inline script in index.html that prevents a
 * flash of the wrong theme on load. */
const STORAGE_KEY = "bodhi-theme";

function prefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveIsDark(theme: Theme): boolean {
  if (theme === "dark") return true;
  if (theme === "light") return false;
  return prefersDark();
}

function applyTheme(theme: Theme) {
  const dark = resolveIsDark(theme);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
}

/**
 * `system` remains the default so a first-time visitor gets their OS
 * preference, but `resolved` reports what is ACTUALLY on screen — which is
 * what the toggle needs in order to flip in a single click. Exposing only the
 * raw three-state value forced users to click twice to reach dark from the
 * initial `system` state, and showed a monitor icon that told them nothing
 * about the current appearance.
 */
export function useTheme(): {
  theme: Theme;
  resolved: "light" | "dark";
  setTheme: (next: Theme) => void;
  toggle: () => void;
} {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);
  const [resolved, setResolved] = useState<"light" | "dark">(() =>
    typeof window === "undefined" ? "light" : resolveIsDark(readStoredTheme()) ? "dark" : "light",
  );

  useEffect(() => {
    applyTheme(theme);
    setResolved(resolveIsDark(theme) ? "dark" : "light");
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      applyTheme("system");
      setResolved(prefersDark() ? "dark" : "light");
    };
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    setThemeState(next);
  }, []);

  /** Always flips what is currently on screen, in one click. */
  const toggle = useCallback(() => {
    setResolved((current) => {
      const next = current === "dark" ? "light" : "dark";
      window.localStorage.setItem(STORAGE_KEY, next);
      setThemeState(next);
      return next;
    });
  }, []);

  return { theme, resolved, setTheme, toggle };
}
