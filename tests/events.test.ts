import { describe, it, expect } from "vitest";
import { filterLocal } from "../src/lib/api";
import type { Event } from "../src/lib/schemas";

const mockEvents: Event[] = [
  {
    id: "tech-tuesday-genai-08",
    title: "Tech Tuesday: GenAI for Case Prep",
    category: "Workshop",
    date: "2026-08-14",
    time: "18:00",
    venue: "Auditorium",
    description: "A 90-minute hands-on session on weaving LLMs into case analysis.",
    seats: 120,
    image: "/images/events/tech-tuesday.svg",
    featured: true,
  },
  {
    id: "data-dash-hackathon-09",
    title: "Data Dash — Analytics Hackathon",
    category: "Competition",
    date: "2026-08-22",
    time: "09:30",
    venue: "Classroom Block A",
    description: "Six hours, one dirty dataset, one story. Best visual insight takes the trophy.",
    seats: 60,
    image: "/images/events/data-dash.svg",
    featured: true,
  },
  {
    id: "cto-fireside-08",
    title: "Fireside with a CTO: Building at Scale",
    category: "Speaker Session",
    date: "2026-09-03",
    time: "17:00",
    venue: "Auditorium",
    description: "An open conversation on architecture, hiring, and the messy first year of a startup.",
    seats: 200,
    image: "/images/events/fireside.svg",
    featured: true,
  },
  {
    id: "av-workshop-08",
    title: "AV Bootcamp: Run Any Event in the Hall",
    category: "Workshop",
    date: "2026-08-19",
    time: "16:30",
    venue: "Auditorium",
    description: "From projector to mixer to mics — learn to operate the auditorium AV chain end to end.",
    seats: 40,
    image: "/images/events/av-bootcamp.svg",
    featured: false,
  },
  {
    id: "gaming-night-08",
    title: "Gaming Night: LAN + Indie Showcase",
    category: "Social",
    date: "2026-08-27",
    time: "20:00",
    venue: "Student Common Room",
    description: "Casual tournaments, indie game demos, and a quiet corner for the non-gamers.",
    seats: 80,
    image: "/images/events/gaming-night.svg",
    featured: false,
  },
  {
    id: "orientation-support-08",
    title: "Orientation IT Support Drive",
    category: "Social",
    date: "2026-08-30",
    time: "10:00",
    venue: "Lobby",
    description: "Help the new batch get campus wifi, mail, and LMS set up — drop in, stay an hour.",
    seats: 150,
    image: "/images/events/orientation.svg",
    featured: false,
  },
  {
    id: "infra-deepdive-09",
    title: "Infra Deep Dive: How Campus Wifi Actually Works",
    category: "Speaker Session",
    date: "2026-09-10",
    time: "18:00",
    venue: "Classroom Block B",
    description: "A no-slides walkthrough of the network stack powering 2000 concurrent devices.",
    seats: 90,
    image: "/images/events/infra-deepdive.svg",
    featured: false,
  },
];

describe("filterLocal", () => {
  it("returns all events when no filters provided", () => {
    const result = filterLocal(mockEvents);
    expect(result).toHaveLength(7);
  });

  it("filters by category: Workshop", () => {
    const result = filterLocal(mockEvents, { category: "Workshop" });
    expect(result).toHaveLength(2);
    expect(result.every((e) => e.category === "Workshop")).toBe(true);
  });

  it("filters by category: Competition", () => {
    const result = filterLocal(mockEvents, { category: "Competition" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("data-dash-hackathon-09");
  });

  it("filters by category: Speaker Session", () => {
    const result = filterLocal(mockEvents, { category: "Speaker Session" });
    expect(result).toHaveLength(2);
    expect(result.every((e) => e.category === "Speaker Session")).toBe(true);
  });

  it("filters by category: Social", () => {
    const result = filterLocal(mockEvents, { category: "Social" });
    expect(result).toHaveLength(2);
    expect(result.every((e) => e.category === "Social")).toBe(true);
  });

  it("returns empty for unknown category", () => {
    const result = filterLocal(mockEvents, { category: "Unknown" as any });
    expect(result).toHaveLength(0);
  });

  it("searches by partial title (case-insensitive)", () => {
    const result = filterLocal(mockEvents, { q: "genai" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("tech-tuesday-genai-08");
  });

  it("searches by partial description (case-insensitive)", () => {
    const result = filterLocal(mockEvents, { q: "hands-on" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("tech-tuesday-genai-08");
  });

  it("searches by partial venue (case-insensitive)", () => {
    const result = filterLocal(mockEvents, { q: "auditorium" });
    expect(result).toHaveLength(3);
    expect(result.every((e) => e.venue.toLowerCase().includes("auditorium"))).toBe(true);
  });

  it("searches by uppercase query", () => {
    const result = filterLocal(mockEvents, { q: "GAMING" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("gaming-night-08");
  });

  it("combined filter: category + search", () => {
    const result = filterLocal(mockEvents, { category: "Workshop", q: "bootcamp" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("av-workshop-08");
  });

  it("combined filter: category with no match returns empty", () => {
    const result = filterLocal(mockEvents, { category: "Workshop", q: "hackathon" });
    expect(result).toHaveLength(0);
  });

  it("category 'All' or undefined does not filter", () => {
    const resultAll = filterLocal(mockEvents, { category: "All" });
    expect(resultAll).toHaveLength(7);
    const resultUndefined = filterLocal(mockEvents, { category: undefined });
    expect(resultUndefined).toHaveLength(7);
  });

  it("search with empty string does not filter", () => {
    const result = filterLocal(mockEvents, { q: "" });
    expect(result).toHaveLength(7);
    const resultWhitespace = filterLocal(mockEvents, { q: "   " });
    expect(resultWhitespace).toHaveLength(7);
  });
});