// @vitest-environment jsdom
import "./setup-dom";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Register from "../src/pages/Register";
import type { Event } from "../src/lib/schemas";

/* ─────────────────────────────────────────────────────────────
   Guards the Register-page defects fixed in this phase:
     D4 — chevron-less selects
     D5 — raw JSON shown to users on a failed submit
     D7 — errors painted in the brand colour (covered visually, not here)
     ?event=<id> pre-select behaviour
   `lib/api` is mocked so these tests don't depend on a live server.
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
      description: "Weekly founder talks.",
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
  ];
  return { mockEvents };
});

const { mockCreateRegistration } = vi.hoisted(() => ({
  mockCreateRegistration: vi.fn(),
}));

vi.mock("../src/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/lib/api")>();
  return {
    ...actual,
    getEvents: vi.fn().mockResolvedValue(mockEvents),
    createRegistration: mockCreateRegistration,
  };
});

afterEach(() => cleanup());

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/register" element={<Register />} />
      </Routes>
    </MemoryRouter>,
  );
}

/** Fills the required fields with valid values, leaving event_id whatever it already is. */
async function fillValidForm() {
  fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Asha Rao" } });
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "asha@example.com" } });
  fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: "9876543210" } });
}

describe("Register page — server error parsing (guards D5)", () => {
  it("renders inline field errors from issues[] and never shows raw JSON (guards D5)", async () => {
    mockCreateRegistration.mockRejectedValueOnce(
      new Error(
        JSON.stringify({
          error: "Validation failed",
          issues: [{ path: "email", message: "Enter a valid email address" }],
        }),
      ),
    );

    const { container } = renderAt("/register?event=founder-fridays");
    await fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /^register$/i }));

    expect(await screen.findByText("Enter a valid email address")).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/"issues"/);
    expect(container.textContent).not.toMatch(/"error"/);
    expect(screen.queryByRole("alert", { name: /validation failed/i })).not.toBeInTheDocument();
  });

  it("shows friendly copy for a 503 and never the raw server string (guards D5)", async () => {
    mockCreateRegistration.mockRejectedValueOnce(
      new Error(JSON.stringify({ error: "Registration storage not configured" })),
    );

    const { container } = renderAt("/register?event=founder-fridays");
    await fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /^register$/i }));

    expect(
      await screen.findByText(/temporarily unavailable/i),
    ).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/Registration storage not configured/);
  });
});

describe("Register page — ?event= pre-select", () => {
  it("pre-selects the event named in the URL and the summary matches it", async () => {
    renderAt("/register?event=pitch-nexus");

    const select = (await screen.findByLabelText(/^event/i)) as HTMLSelectElement;
    expect(select.value).toBe("pitch-nexus");
    expect(
      await screen.findByRole("heading", { level: 2, name: "Pitch Nexus" }),
    ).toBeInTheDocument();
  });
});

describe("Register page — chevrons (guards D4)", () => {
  it("both selects render a visible chevron", async () => {
    const { container } = renderAt("/register");
    await screen.findByLabelText(/full name/i);

    const selects = container.querySelectorAll("select");
    expect(selects).toHaveLength(2); // event_id, program

    selects.forEach((select) => {
      expect(select.className).toMatch(/appearance-none/);
      expect(select.nextElementSibling?.tagName.toLowerCase()).toBe("svg");
    });
  });
});
