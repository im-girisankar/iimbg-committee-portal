import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import eventsData from "../src/data/events.json" with { type: "json" };
import teamData from "../src/data/team.json" with { type: "json" };
import type { Event, TeamMember, RegistrationResponse } from "../src/lib/schemas.js";
import { registrationSchema, registrationResponseSchema, eventSchema, teamMemberSchema, CATEGORIES } from "../src/lib/schemas.js";
import { getSupabase } from "../src/lib/supabase.js";

/* ─────────────────────────────────────────────────────────────
   Dependency injection factory — enables tests to inject fake
   Supabase client and fixed data arrays. The real getSupabase()
   is only called lazily inside POST /registrations.
   ───────────────────────────────────────────────────────────── */
export interface Deps {
  supabase?: ReturnType<typeof getSupabase>;
  events?: Event[];
  team?: TeamMember[];
}

export function createApp(deps: Deps = {}) {
  const events = deps.events ?? (eventsData as Event[]);
  const team = deps.team ?? (teamData as TeamMember[]);

  const app = new OpenAPIHono<{ Variables: { supabase?: ReturnType<typeof getSupabase> } }>({
    defaultHook: (result, c) => {
      if (!result.success) {
        return c.json(
          {
            error: "Validation failed",
            issues: result.error.issues.map((issue) => ({
              path: issue.path.join("."),
              message: issue.message,
            })),
          },
          400,
        );
      }
    },
  });

  /* ─────────────────────────────────────────────────────────
     GET /api/events
     ───────────────────────────────────────────────────────── */
  const getEventsRoute = createRoute({
    method: "get",
    path: "/api/events",
    request: {
      query: z.object({
        category: z.enum(CATEGORIES).optional().openapi({ example: "Workshop" }),
        q: z.string().optional().openapi({ example: "GenAI" }),
      }),
    },
    responses: {
      200: {
        description: "List of events",
        content: {
          "application/json": {
            schema: z.array(eventSchema),
          },
        },
      },
    },
  });

  app.openapi(getEventsRoute, (c) => {
    const { category, q } = c.req.valid("query");
    let out = events;

    // category can be "All" from frontend, but Zod validates it's one of CATEGORIES
    // Cast to string to allow "All" comparison
    const cat = category as string | undefined;
    if (cat && cat !== "All") {
      out = out.filter((e) => e.category === cat);
    }
    if (q) {
      const query = q.toLowerCase().trim();
      out = out.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          e.venue.toLowerCase().includes(query),
      );
    }
    return c.json(out, 200);
  });

  /* ─────────────────────────────────────────────────────────
     GET /api/events/:id
     ───────────────────────────────────────────────────────── */
  const getEventRoute = createRoute({
    method: "get",
    path: "/api/events/{id}",
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      200: {
        description: "Single event",
        content: {
          "application/json": {
            schema: eventSchema,
          },
        },
      },
      404: {
        description: "Event not found",
        content: {
          "application/json": {
            schema: z.object({ error: z.string() }),
          },
        },
      },
    },
  });

  app.openapi(getEventRoute, (c) => {
    const { id } = c.req.valid("param");
    const event = events.find((e) => e.id === id);
    if (!event) return c.json({ error: "Not found" }, 404);
    return c.json(event, 200);
  });

  /* ─────────────────────────────────────────────────────────
     GET /api/team
     ───────────────────────────────────────────────────────── */
  const getTeamRoute = createRoute({
    method: "get",
    path: "/api/team",
    responses: {
      200: {
        description: "List of team members",
        content: {
          "application/json": {
            schema: z.array(teamMemberSchema),
          },
        },
      },
    },
  });

  app.openapi(getTeamRoute, (c) => {
    return c.json(team, 200);
  });

  /* ─────────────────────────────────────────────────────────
     POST /api/registrations
     ───────────────────────────────────────────────────────── */
  const postRegistrationsRoute = createRoute({
    method: "post",
    path: "/api/registrations",
    request: {
      body: {
        content: {
          "application/json": {
            schema: registrationSchema,
          },
        },
        required: true,
      },
    },
    responses: {
      201: {
        description: "Registration created",
        content: {
          "application/json": {
            schema: registrationResponseSchema,
          },
        },
      },
      400: {
        description: "Validation error or unknown event",
        content: {
          "application/json": {
            schema: z.object({
              error: z.string(),
              issues: z.array(z.object({ path: z.string(), message: z.string() })).optional(),
            }),
          },
        },
      },
      500: {
        description: "Insertion error",
        content: {
          "application/json": {
            schema: z.object({ error: z.string() }),
          },
        },
      },
      503: {
        description: "Registration storage not configured",
        content: {
          "application/json": {
            schema: z.object({ error: z.string() }),
          },
        },
      },
    },
  });

  app.openapi(postRegistrationsRoute, async (c) => {
    const body = c.req.valid("json");

    // Validate event_id exists
    const event = events.find((e) => e.id === body.event_id);
    if (!event) {
      return c.json(
        { error: "Unknown event", issues: [{ path: "event_id", message: "Event does not exist" }] },
        400,
      );
    }

    // Lazily get Supabase client (only when actually needed)
    let supabase = deps.supabase;
    if (!supabase) {
      try {
        supabase = getSupabase();
      } catch {
        return c.json({ error: "Registration storage not configured" }, 503);
      }
    }

    // Insert into Supabase
    try {
      const { data, error } = await supabase
        .from("registrations")
        .insert({
          event_id: body.event_id,
          name: body.name,
          email: body.email,
          phone: body.phone,
          program: body.program,
          notes: body.notes ?? null,
        })
        .select()
        .single();

      if (error) {
        return c.json({ error: error.message }, 500);
      }

      // Map to response schema shape
      const response: RegistrationResponse = {
        id: data.id,
        created_at: data.created_at,
        event_id: data.event_id,
        name: data.name,
        email: data.email,
        program: data.program,
      };
      return c.json(response, 201);
    } catch (err) {
      return c.json({ error: err instanceof Error ? err.message : "Registration failed" }, 500);
    }
  });

  /* ─────────────────────────────────────────────────────────
     GET /api/health
     ───────────────────────────────────────────────────────── */
  const healthRoute = createRoute({
    method: "get",
    path: "/api/health",
    responses: {
      200: {
        description: "Health check",
        content: {
          "application/json": {
            schema: z.object({
              status: z.literal("ok"),
              uptime: z.number(),
            }),
          },
        },
      },
    },
  });

  app.openapi(healthRoute, (c) => {
    return c.json({ status: "ok", uptime: process.uptime() }, 200);
  });

  /* ─────────────────────────────────────────────────────────
     GET /api/openapi.json — raw OpenAPI spec
     ───────────────────────────────────────────────────────── */
  app.doc("/api/openapi.json", {
    openapi: "3.0.0",
    info: {
      title: "IIM Bodh Gaya Committee Portal API",
      version: "1.0.0",
      description: "API for the Committee Portal — events, team, and registrations",
    },
  });

  /* ─────────────────────────────────────────────────────────
     GET /api/docs — Scalar API reference UI
     ───────────────────────────────────────────────────────── */
  app.get("/api/docs", apiReference({
    spec: {
      url: "/api/openapi.json",
    },
    theme: "deepSpace",
    layout: "modern",
    defaultHttpClient: {
      targetKey: "javascript",
      clientKey: "fetch",
    },
  }));

  /* ─────────────────────────────────────────────────────────
     404 for unknown API paths — must return JSON, not HTML
     ───────────────────────────────────────────────────────── */
  app.notFound((c) => {
    return c.json({ error: "Not found" }, 404);
  });

  return app;
}

/* Default instance for direct imports (prod/dev servers) */
export const app = createApp();