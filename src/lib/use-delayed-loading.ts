import { useEffect, useRef, useState } from "react";

/**
 * Anti-flash loading indicator.
 *
 * `getEvents`/`getTeam` silently fall back to bundled JSON and often resolve
 * in a handful of milliseconds, so a naive skeleton flickers on and off.
 * This shows the skeleton only after `delay` ms of continued loading, and
 * once shown, holds it for at least `min` ms so it never flashes.
 */
export function useDelayedLoading(isLoading: boolean, delay = 120, min = 200): boolean {
  const [visible, setVisible] = useState(false);
  const shownAt = useRef<number | null>(null);

  useEffect(() => {
    let showTimer: ReturnType<typeof setTimeout> | undefined;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    if (isLoading) {
      showTimer = setTimeout(() => {
        shownAt.current = Date.now();
        setVisible(true);
      }, delay);
    } else if (shownAt.current !== null) {
      const elapsed = Date.now() - shownAt.current;
      const remaining = Math.max(0, min - elapsed);
      hideTimer = setTimeout(() => {
        shownAt.current = null;
        setVisible(false);
      }, remaining);
    } else {
      setVisible(false);
    }

    return () => {
      if (showTimer) clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [isLoading, delay, min]);

  return visible;
}
