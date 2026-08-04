// @vitest-environment jsdom
import "./setup-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Events from "../src/pages/Events";
import type { Event } from "../src/lib/schemas";

/* ─────────────────────────────────────────────────────────────
   Guards the two real Events bugs (D1: deep-linked filters never
   applied; D2: "Clear filters" desynced chips/input/URL/grid) plus
   D16 (exactly one link per card). `lib/api` is mocked so these tests
   don't depend on the dev API server being up.
   ───────────────────────────────────────────────────────────── */

const { mockEvents } = vi.hoisted(() => {
  const mockEvents: Event[] = [
    {
      id: "founder-fridays",
      title: "Founder Fridays",
      category: "Workshop",
      date: "2026-08-07",
      time: "18:00",
      venue: "Auditorium",
      description: "Weekly founder talks featuring successful entrepreneurs.",
      seats: 200,
      image: "/images/events/founder-fridays.jpg",
      featured: true,
    },
    {
      id: "pitch-nexus",
      title: "Pitch Nexus",
      category: "Competition",
      date: "2026-09-05",
      time: "10:00",
      venue: "Auditorium",
      description: "IIM Bodh Gaya's flagship startup pitch competition.",
      seats: 300,
      image: "/images/events/pitch-nexus.jpg",
      featured: true,
    },
    {
      id: "build-weekend",
      title: "Build Weekend",
      category: "Workshop",
      date: "2026-09-19",
      time: "09:00",
      venue: "Innovation Lab",
      description: "48-hour intensive build sprint.",
      seats: 80,
      image: "/images/events/build-weekend.jpg",
      featured: false,
    },
  ];
  return { mockEvents };
});

vi.mock("../src/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/lib/api")>();
  return {
    ...actual,
    getEvents: vi.fn().mockResolvedValue(mockEvents),
  };
});

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/events" element={<Events />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Events page — URL-driven filters", () => {
  it("renders only Workshop events for /events?category=Workshop (guards D1)", async () => {
    renderAt("/events?category=Workshop");

    expect(await screen.findByText("Founder Fridays")).toBeInTheDocument();
    expect(screen.getByText("Build Weekend")).toBeInTheDocument();
    expect(screen.queryByText("Pitch Nexus")).not.toBeInTheDocument();
    expect(screen.getByText("2 events")).toBeInTheDocument();
  });

  it("renders only matching events for /events?q=<term> (guards D1)", async () => {
    renderAt("/events?q=pitch");

    expect(await screen.findByText("Pitch Nexus")).toBeInTheDocument();
    expect(screen.queryByText("Founder Fridays")).not.toBeInTheDocument();
    expect(screen.queryByText("Build Weekend")).not.toBeInTheDocument();
    expect(screen.getByText("1 event")).toBeInTheDocument();
  });

  it("clearing filters resets both the URL-derived state and the rendered list (guards D2)", async () => {
    renderAt("/events?category=Workshop&q=nomatch");

    const clearButton = await screen.findByRole("button", { name: /clear filters/i });
    fireEvent.click(clearButton);

    // The grid is behind `useDelayedLoading`, which holds the skeleton for a
    // minimum period once shown — so the count can update a tick before the
    // cards mount. Await each title rather than asserting synchronously.
    expect(await screen.findByText("3 events")).toBeInTheDocument();
    expect(await screen.findByText("Founder Fridays")).toBeInTheDocument();
    expect(await screen.findByText("Pitch Nexus")).toBeInTheDocument();
    expect(await screen.findByText("Build Weekend")).toBeInTheDocument();
  });

  it("renders exactly one anchor to /register per card, each to a distinct event (guards D16)", async () => {
    renderAt("/events");

    await screen.findByText("Founder Fridays");

    const registerLinks = screen
      .getAllByRole("link")
      .filter((a) => a.getAttribute("href")?.startsWith("/register?event="));

    expect(registerLinks).toHaveLength(3);
    expect(new Set(registerLinks.map((a) => a.getAttribute("href"))).size).toBe(3);
  });
});
