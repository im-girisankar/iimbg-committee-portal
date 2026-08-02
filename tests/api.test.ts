import { describe, it, expect, beforeEach, vi } from "vitest";
import { createApp } from "../api/app";
import type { Event, TeamMember } from "../src/lib/schemas";

/* Minimal mock Supabase client for tests */
function createMockSupabase() {
  const rows: any[] = [];
  return {
    from: vi.fn((table) => {
      if (table !== "registrations") throw new Error(`Unexpected table: ${table}`);
      return {
        insert: vi.fn((data) => {
          const newRow = {
            ...data,
            id: "test-uuid-" + Date.now(),
            created_at: new Date().toISOString(),
          };
          rows.push(newRow);
          return {
            select: vi.fn(() => ({
              single: vi.fn(() => ({ data: newRow, error: null })),
            })),
          };
        }),
      };
    }),
    _getRows: () => rows,
  };
}

/* Test data fixtures */
const testEvents: Event[] = [
  {
    id: "evt-1",
    title: "Test Event One",
    category: "Workshop",
    date: "2026-08-14",
    time: "18:00",
    venue: "Auditorium",
    description: "A test workshop",
    seats: 100,
    image: "/images/test.svg",
    featured: true,
  },
  {
    id: "evt-2",
    title: "Test Event Two",
    category: "Speaker Session",
    date: "2026-09-01",
    time: "17:00",
    venue: "Classroom A",
    description: "A test speaker session",
    seats: 50,
    image: "/images/test2.svg",
    featured: false,
  },
];

const testTeam: TeamMember[] = [
  {
    id: "mem-1",
    name: "Test User",
    role: "Test Lead",
    bio: "Test bio",
    avatar: "https://example.com/avatar.svg",
    vertical: "Development",
  },
];

describe("API routes via createApp", () => {
  let app: ReturnType<typeof createApp>;
  let mockSupabase: ReturnType<typeof createMockSupabase>;

  beforeEach(() => {
    mockSupabase = createMockSupabase();
    app = createApp({ events: testEvents, team: testTeam, supabase: mockSupabase });
  });

  describe("GET /api/events", () => {
    it("returns all events", async () => {
      const res = await app.request("/api/events");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveLength(2);
    });

    it("filters by category", async () => {
      const res = await app.request("/api/events?category=Workshop");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveLength(1);
      expect(body[0].category).toBe("Workshop");
    });

    it("searches by q parameter", async () => {
      const res = await app.request("/api/events?q=speaker");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveLength(1);
      expect(body[0].id).toBe("evt-2");
    });

    it("combines category and q", async () => {
      const res = await app.request("/api/events?category=Workshop&q=test");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveLength(1);
      expect(body[0].id).toBe("evt-1");
    });
  });

  describe("GET /api/events/:id", () => {
    it("returns one event", async () => {
      const res = await app.request("/api/events/evt-1");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.id).toBe("evt-1");
      expect(body.title).toBe("Test Event One");
    });

    it("returns 404 for unknown id", async () => {
      const res = await app.request("/api/events/unknown");
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toBe("Not found");
    });
  });

  describe("GET /api/team", () => {
    it("returns team members", async () => {
      const res = await app.request("/api/team");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveLength(1);
      expect(body[0].name).toBe("Test User");
    });
  });

  describe("POST /api/registrations", () => {
    const validBody = {
      event_id: "evt-1",
      name: "Test Registrant",
      email: "test@example.com",
      phone: "9876543210",
      program: "MBA",
      notes: "Test note",
    };

    it("returns 201 for valid registration", async () => {
      const res = await app.request("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validBody),
      });
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body).toMatchObject({
        id: expect.any(String),
        created_at: expect.any(String),
        event_id: "evt-1",
        name: "Test Registrant",
        email: "test@example.com",
        program: "MBA",
      });
    });

    it("returns 400 for invalid email", async () => {
      const res = await app.request("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...validBody, email: "bad-email" }),
      });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe("Validation failed");
      expect(body.issues).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: "email", message: expect.stringMatching(/valid email/i) })])
      );
    });

    it("returns 400 for short phone", async () => {
      const res = await app.request("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...validBody, phone: "123" }),
      });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe("Validation failed");
      expect(body.issues).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: "phone", message: expect.stringMatching(/10 digits/i) })])
      );
    });

    it("returns 400 for unknown event_id", async () => {
      const res = await app.request("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...validBody, event_id: "nonexistent" }),
      });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe("Unknown event");
      expect(body.issues).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: "event_id", message: expect.stringMatching(/does not exist/i) })])
      );
    });

    it("returns 400 for missing required field", async () => {
      const res = await app.request("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...validBody, name: "" }),
      });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe("Validation failed");
      expect(body.issues).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: "name", message: expect.stringMatching(/at least 2/i) })])
      );
    });
  });

  describe("GET /api/health", () => {
    it("returns ok status and uptime", async () => {
      const res = await app.request("/api/health");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toMatchObject({ status: "ok", uptime: expect.any(Number) });
    });
  });

  describe("GET /api/docs", () => {
    it("returns Scalar HTML page", async () => {
      const res = await app.request("/api/docs");
      expect(res.status).toBe(200);
      const text = await res.text();
      expect(text).toContain("<html");
      expect(text).toContain("Scalar");
    });
  });

  describe("GET /api/openapi.json", () => {
    it("returns valid OpenAPI spec JSON", async () => {
      const res = await app.request("/api/openapi.json");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.openapi).toBe("3.0.0");
      expect(body.info.title).toBe("IIM Bodh Gaya Committee Portal API");
      expect(body.paths).toBeDefined();
    });
  });

  describe("404 for unknown API paths", () => {
    it("returns JSON 404", async () => {
      const res = await app.request("/api/nonexistent");
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body).toEqual({ error: "Not found" });
    });
  });
});