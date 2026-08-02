import { z } from "zod/v4";

/* ─────────────────────────────────────────────────────────────
   Shared schemas — ONE source of truth for client AND server.
   This file is imported by:
     - src/pages/Register.tsx        (react-hook-form validation)
     - src/lib/api.ts                (event_id existence helper)
     - api/[[...route]].ts           (Hono route validation + OpenAPI)
   Talking point: shared-schema validation means the FE and BE can
   never disagree about what a valid registration looks like.
   ───────────────────────────────────────────────────────────── */

export const PROGRAMS = ["MBA", "IPM", "PhD"] as const;
export const CATEGORIES = [
  "Workshop",
  "Competition",
  "Speaker Session",
  "Social",
] as const;

export const programSchema = z.enum(PROGRAMS);

/** Email: accept any valid email (we can't assume every student is on iimbg domain). */
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address")
  .min(5, "Enter a valid email address");

/** Phone: exactly 10 digits, optional separators stripped. */
const phoneSchema = z
  .string()
  .transform((s) => s.replace(/[\s\-()]/g, ""))
  .pipe(z.string().regex(/^\d{10}$/, "Phone must be exactly 10 digits"));

/** event_id must exist in events.json — existence is checked in the API route
 *  via `eventIdRefine`, but the FE reuses the base shape for form typing. */
export const registrationSchema = z.object({
  event_id: z.string().min(1, "Select an event"),
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: emailSchema,
  phone: phoneSchema,
  program: programSchema,
  notes: z.string().trim().max(400, "Notes must be under 400 characters").optional().or(z.literal("")),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

/** The shape REST consumers see (POST body). Matches registrationSchema. */
export const registrationRequestSchema = registrationSchema;

/** Server response after a successful insert. */
export const registrationResponseSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string(),
  event_id: z.string(),
  name: z.string(),
  email: z.string(),
  program: z.string(),
});

export type RegistrationResponse = z.infer<typeof registrationResponseSchema>;

/* ── Event & Team schemas (for OpenAPI response typing) ── */
export const eventSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.enum(CATEGORIES),
  date: z.string(),
  time: z.string(),
  venue: z.string(),
  description: z.string(),
  seats: z.number().int().nonnegative(),
  image: z.string(),
  featured: z.boolean(),
});
export type Event = z.infer<typeof eventSchema>;

export const teamMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  bio: z.string(),
  avatar: z.string(),
  vertical: z.string(),
});
export type TeamMember = z.infer<typeof teamMemberSchema>;
