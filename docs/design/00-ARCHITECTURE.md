# 00 — Architecture & The Contract

> **Read this first.** Everything in this folder is a UI/UX redesign brief. The one
> non-negotiable rule is at the bottom of this file: **the contract must not change.**

---

## 1. What this application is

A public-facing portal for the **Envision Entrepreneurship Cell × IT Committee, IIM Bodh Gaya**.
It is a *marketing + light transactional* site, not a dashboard. Five routes, one write operation.

| Route | Page component | Purpose | Data |
|---|---|---|---|
| `/` | `src/pages/Home.tsx` | Positioning + 3 featured events | `GET /api/events` (client-filters `featured`) |
| `/events` | `src/pages/Events.tsx` | Browse / filter / search all events | `GET /api/events` |
| `/team` | `src/pages/Team.tsx` | Committee roster | `GET /api/team` |
| `/register` | `src/pages/Register.tsx` | Event registration form | `GET /api/events` + `POST /api/registrations` |
| `*` | `NotFound` inside `src/App.tsx` | 404 | — |

Scale is small and fixed: **7 events, 12 team members, 4 categories, 3 programs.**
This matters for design — it rules out pagination, virtualisation, and infinite scroll,
and it means the Events page can afford a denser, more deliberate layout.

---

## 2. Runtime topology

```
┌─────────────────────────── Browser ───────────────────────────┐
│  React 19 + React Router 7 (BrowserRouter, client-side only)   │
│  src/main.tsx → App.tsx → Layout(Navbar + Outlet + Footer)     │
└───────────────────────────┬───────────────────────────────────┘
                            │  fetch("/api/…")
                            ▼
        ┌───────────── DEV ─────────────┐   ┌──────── PROD (Vercel) ────────┐
        │ Vite :5173                    │   │ Static dist/ from CDN          │
        │   proxy /api → localhost:8787 │   │ /api/* → serverless function   │
        │ tsx watch api/dev.ts          │   │   api/[[...route]].ts          │
        │   @hono/node-server            │   │   (catch-all rewrite in        │
        └───────────────┬───────────────┘   │    vercel.json)                │
                        │                   └───────────────┬────────────────┘
                        └───────────┬───────────────────────┘
                                    ▼
                          api/app.ts — createApp()
                          OpenAPIHono + zod-openapi
                                    │
              ┌─────────────────────┴─────────────────────┐
              ▼                                           ▼
   src/data/events.json                        Supabase (Postgres)
   src/data/team.json                          table: registrations
   (bundled, read-only)                        via @supabase/supabase-js
```

**Key point:** reads are served from bundled JSON, writes go to Supabase. There is no
database read path. The site therefore renders correctly with zero backend availability.

---

## 3. Backend: `api/app.ts`

A single `createApp(deps)` factory built on `OpenAPIHono` (`@hono/zod-openapi`). Dependency
injection (`deps.supabase`, `deps.events`, `deps.team`) exists purely so `tests/api.test.ts`
can inject fakes; production calls `createApp()` with no arguments.

### Endpoints

| Method | Path | Validation | Returns |
|---|---|---|---|
| GET | `/api/events` | query `category?` (enum), `q?` (string) | `Event[]` |
| GET | `/api/events/{id}` | param `id` | `Event` \| `404 {error}` |
| GET | `/api/team` | — | `TeamMember[]` |
| POST | `/api/registrations` | body `registrationSchema` | `201 RegistrationResponse` \| `400` \| `500` \| `503` |
| GET | `/api/health` | — | `{status:"ok", uptime:number}` |
| GET | `/api/openapi.json` | — | OpenAPI 3.0 document |
| GET | `/api/docs` | — | Scalar API reference UI (`deepSpace` theme) |

Notes worth knowing before touching the UI:

- **`defaultHook`** converts every Zod failure into `400 {error:"Validation failed", issues:[{path,message}]}`.
  The Register form currently ignores `issues[]` and only surfaces the raw response text.
  *Improving that is a UX win that requires no backend change* — see `04-PAGES.md § Register`.
- **`app.notFound`** returns JSON `{error:"Not found"}` for unmatched API paths.
- **POST is lazy about Supabase**: if env vars are missing it returns **503
  `{error:"Registration storage not configured"}`** rather than crashing. The UI must
  have a sensible presentation for 503 (it is the state a local dev without `.env` will hit).
- Category filter has a deliberate quirk: the schema is `z.enum(CATEGORIES)` so `"All"` is
  *rejected by validation* before the `cat !== "All"` branch can ever run. The frontend
  never sends `category=All` (it sends nothing), so this is dormant — **leave it alone.**

### Environment

`src/lib/supabase.ts` reads credentials and throws if absent. Only `POST /api/registrations`
touches it. `.env.example` documents the keys.

---

## 4. Shared schema layer — `src/lib/schemas.ts`

This is the spine of the app and the reason FE and BE cannot disagree.
It is imported by **both** `api/app.ts` and `src/pages/Register.tsx`.

```ts
PROGRAMS   = ["MBA", "IPM", "PhD"]
CATEGORIES = ["Workshop", "Competition", "Speaker Session", "Social"]

registrationSchema = { event_id, name, email, phone, program, notes? }
eventSchema        = { id, title, category, date, time, venue, description, seats, image, featured }
teamMemberSchema   = { id, name, role, bio, avatar, vertical }
```

Validation rules the UI must respect and communicate:

| Field | Rule | Message shown |
|---|---|---|
| `event_id` | non-empty | "Select an event" |
| `name` | trim, 2–80 chars | "Name must be at least 2 characters" |
| `email` | valid email, lowercased, min 5 | "Enter a valid email address" |
| `phone` | separators stripped, then exactly 10 digits | "Phone must be exactly 10 digits" |
| `program` | one of `PROGRAMS` | — |
| `notes` | optional, ≤ 400 chars after trim | "Notes must be under 400 characters" |

`src/lib/form.ts` (`safeParseRegistration`) is a hand-rolled resolver: it runs
`registrationSchema.safeParse` and flattens issues to `{ field: message }` for
`react-hook-form`'s `setError`. **First message per field wins.**

> ⚠️ `notes` has an unusual type: `.optional().or(z.literal(""))`. Keep the textarea
> emitting `""` rather than `undefined` — don't "clean this up".

---

## 5. Frontend data layer — `src/lib/api.ts`

```
getEvents(opts?)        → GET /api/events    ─ on ANY failure ⇒ filterLocal(bundled JSON)
getTeam()               → GET /api/team      ─ on ANY failure ⇒ bundled JSON
createRegistration(p)   → POST /api/registrations  ─ NO fallback, error propagates
filterLocal(all, opts)  → pure; mirrors server filter logic exactly
```

**Design consequence #1:** reads *never* fail from the user's point of view. A "failed to
load events" error state is unreachable — do not design one. What you *do* need is a
first-class **loading** state and a genuine **empty/no-results** state.

**Design consequence #2:** because the fallback is silent, the loading skeleton is often
visible for only a few milliseconds. Skeletons must not flash. Spec: render the skeleton
only after ~120 ms, and once shown hold it ~200 ms minimum.

**Design consequence #3:** writes *can* fail (400 / 500 / 503). The Register page is the only
place needing real error design.

---

## 6. Frontend structure today

```
src/
  main.tsx                 StrictMode > BrowserRouter > App
  App.tsx                  Routes + Layout + ScrollToTop + NotFound (inline)
  components/
    Navbar.tsx             fixed, 80px → 72px on scroll, mobile drawer
    Footer.tsx
    EventCard.tsx
    TeamCard.tsx
    FilterBar.tsx          category chips + search, syncs to URL params
  pages/                   Home | Events | Team | Register
  lib/                     api.ts | schemas.ts | form.ts | supabase.ts
  data/                    events.json | team.json
  styles/index.css         @theme tokens + a few globals
```

Stack: **React 19, React Router 7, Tailwind v4** (via `@tailwindcss/vite`, CSS-first
`@theme` config — *there is no `tailwind.config.js` and there must not be one*),
`react-hook-form`, `framer-motion`, `zod`. Tests: Vitest + Testing Library + jsdom.

Path alias `@ → /src` exists in `vite.config.ts` but **not** in `tsconfig.app.json`, so
`@/...` imports type-check as errors today. Fix this in Phase 0 before using shadcn/ui,
which relies on `@/` imports.

---

## 7. Test baseline

`npm test` → **3 files, 42 tests, all passing.** Re-verify after every phase.

- `tests/api.test.ts` — Hono routes via injected fakes
- `tests/events.test.ts` — `filterLocal` behaviour
- `tests/schemas.test.ts` — Zod rules

See `06-CLEANUP.md § Test exposure` for which of these a UI change could break.

---

## 8. 🔒 THE CONTRACT — what a redesign may NOT change

Any pull request that violates this list is wrong, regardless of how good it looks.

1. **No file under `api/` is edited.** Not one line.
2. **`src/lib/schemas.ts` is frozen.** No renamed fields, no changed validation, no new
   fields, no changed error messages.
3. **`src/lib/api.ts` function signatures are frozen** — `getEvents`, `getTeam`,
   `createRegistration`, `filterLocal`. Internals stay as they are, including the
   silent JSON fallback.
4. **`src/lib/form.ts` behaviour is frozen.** Do not swap in `@hookform/resolvers`.
5. **Routes are frozen:** `/`, `/events`, `/team`, `/register`, `*`.
6. **URL parameters are frozen and must keep working:**
   - `/events?category=<Category>&q=<query>` — shareable filter state
   - `/register?event=<event_id>` — deep link that pre-selects an event, and the
     select must keep writing back to the URL via `setSearchParams({...},{replace:true})`
7. **`src/data/*.json` shapes are frozen.** Content may not be invented or edited.
8. **Form field `name` attributes stay** `event_id, name, email, phone, program, notes`.
9. **The 503 / 500 / 400 responses must all remain distinguishable** to the user.
10. **`npm test` stays at 42/42.** `npm run build` and `npm run lint` stay clean.

Everything else — every class name, every component boundary, every token, the entire
visual language — is fair game.
