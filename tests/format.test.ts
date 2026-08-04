import { describe, it, expect } from "vitest";
import {
  formatDate,
  formatDateLong,
  formatTime,
  formatDateTime,
  monthKey,
  monthLabel,
  isUpcoming,
} from "../src/lib/format";

describe("formatDate", () => {
  it("formats an ISO date as 'D Mon YYYY'", () => {
    expect(formatDate("2026-08-12")).toBe("12 Aug 2026");
  });

  it("pads nothing — single-digit days have no leading zero", () => {
    expect(formatDate("2026-09-03")).toBe("3 Sept 2026");
  });

  it("handles December / year rollover", () => {
    expect(formatDate("2026-12-31")).toBe("31 Dec 2026");
  });
});

describe("formatDateLong", () => {
  it("includes the weekday and full month name", () => {
    expect(formatDateLong("2026-08-12")).toBe("Wednesday, 12 August 2026");
  });
});

describe("formatTime", () => {
  it("converts 24h to 12h with uppercase PM", () => {
    expect(formatTime("18:00")).toBe("6:00 PM");
  });

  it("converts 24h to 12h with uppercase AM", () => {
    expect(formatTime("09:05")).toBe("9:05 AM");
  });

  it("handles midnight as 12 AM", () => {
    expect(formatTime("00:00")).toBe("12:00 AM");
  });

  it("handles noon as 12 PM", () => {
    expect(formatTime("12:00")).toBe("12:00 PM");
  });
});

describe("formatDateTime", () => {
  it("joins date and time with a middle dot", () => {
    expect(formatDateTime("2026-08-14", "18:00")).toBe("14 Aug 2026 · 6:00 PM");
  });
});

describe("monthKey", () => {
  it("returns the YYYY-MM grouping key", () => {
    expect(monthKey("2026-08-14")).toBe("2026-08");
  });

  it("is stable across different days in the same month", () => {
    expect(monthKey("2026-08-01")).toBe(monthKey("2026-08-30"));
  });
});

describe("monthLabel", () => {
  it("returns a human month + year heading", () => {
    expect(monthLabel("2026-08-14")).toBe("August 2026");
  });

  it("differs across a year boundary", () => {
    expect(monthLabel("2026-01-05")).toBe("January 2026");
    expect(monthLabel("2025-01-05")).toBe("January 2025");
  });
});

describe("isUpcoming", () => {
  const today = new Date(2026, 7, 15); // 15 Aug 2026, local time

  it("is true for a future date", () => {
    expect(isUpcoming("2026-08-20", today)).toBe(true);
  });

  it("is true for today itself", () => {
    expect(isUpcoming("2026-08-15", today)).toBe(true);
  });

  it("is false for a past date", () => {
    expect(isUpcoming("2026-08-01", today)).toBe(false);
  });

  it("ignores the time-of-day component of `now`", () => {
    const laterSameDay = new Date(2026, 7, 15, 23, 59);
    expect(isUpcoming("2026-08-15", laterSameDay)).toBe(true);
  });
});
