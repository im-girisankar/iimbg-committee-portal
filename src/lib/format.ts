/**
 * Pure date/time/number formatters. Locale: en-IN.
 *
 * Dates are parsed manually into a *local* Date (rather than `new Date(iso)`,
 * which parses date-only ISO strings as UTC midnight) so formatting is never
 * off by a day depending on the host timezone.
 */

const LOCALE = "en-IN";

function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** "2026-08-12" → "12 Aug 2026" */
export function formatDate(iso: string): string {
  return parseISODate(iso).toLocaleDateString(LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** "2026-08-12" → "Wednesday, 12 August 2026" */
export function formatDateLong(iso: string): string {
  return parseISODate(iso).toLocaleDateString(LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** "18:00" → "6:00 PM" */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const date = new Date(2000, 0, 1, h, m);
  const formatted = date.toLocaleTimeString(LOCALE, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  // en-IN's ICU data lowercases the day period ("6:00 pm"); uppercase it to
  // match the house style used elsewhere in the app.
  return formatted.replace(/am|pm/i, (match) => match.toUpperCase());
}

/** "2026-08-12", "18:00" → "12 Aug 2026 · 6:00 PM" */
export function formatDateTime(iso: string, hhmm: string): string {
  return `${formatDate(iso)} · ${formatTime(hhmm)}`;
}

/** "2026-08-12" → "2026-08" — stable sort/group key */
export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

/** "2026-08-12" → "August 2026" — section heading */
export function monthLabel(iso: string): string {
  return parseISODate(iso).toLocaleDateString(LOCALE, {
    month: "long",
    year: "numeric",
  });
}

/** True when the event's calendar date is today or later. */
export function isUpcoming(iso: string, now: Date = new Date()): boolean {
  const eventDate = parseISODate(iso);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return eventDate.getTime() >= today.getTime();
}
