import events from "../data/events.json";
import team from "../data/team.json";
import type { Event, TeamMember } from "./schemas";

/* ─────────────────────────────────────────────────────────────
   API client. In dev the UI talks to the local Hono server
   (proxied via Vite's /api proxy); in prod it's the same-origin
   Vercel serverless function. If the API is unreachable we fall
   back to the bundled JSON so the site is never blank — the SSE
   plan calls this out as a resilience guarantee.
   ───────────────────────────────────────────────────────────── */

const API_BASE = "/api";

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const detail = await safeText(res);
    throw new Error(detail || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

export async function getEvents(opts?: { category?: string; q?: string }): Promise<Event[]> {
  const params = new URLSearchParams();
  if (opts?.category) params.set("category", opts.category);
  if (opts?.q) params.set("q", opts.q);
  const qs = params.toString();
  try {
    return await http<Event[]>(`/events${qs ? `?${qs}` : ""}`);
  } catch {
    return filterLocal(events as Event[], opts);
  }
}

export async function getTeam(): Promise<TeamMember[]> {
  try {
    return await http<TeamMember[]>("/team");
  } catch {
    return team as TeamMember[];
  }
}

export type RegistrationResult = {
  id: string;
  created_at: string;
  event_id: string;
  name: string;
  email: string;
  program: string;
};

export async function createRegistration(payload: unknown): Promise<RegistrationResult> {
  // No JSON fallback for writes — surface the error to the form.
  return http<RegistrationResult>("/registrations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* Local-mirror filtering, kept identical to the server logic so the
   fallback behaves the same as the API. Also reused by tests. */
export function filterLocal(all: Event[], opts?: { category?: string; q?: string }): Event[] {
  let out = all;
  if (opts?.category && opts.category !== "All") {
    out = out.filter((e) => e.category === opts.category);
  }
  if (opts?.q) {
    const q = opts.q.toLowerCase().trim();
    out = out.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q),
    );
  }
  return out;
}
