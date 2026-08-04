# IIM Bodh Gaya Committee Portal

The official portal for the IT Committee, IIM Bodh Gaya — browse events, meet the team, and register for sessions. Built with React 19 + Vite, Hono API on Vercel serverless, Supabase Postgres for registrations, and interactive Scalar API docs at `/api/docs`.

**Live URL:** https://iimbg-committee-portal.vercel.app/
**API docs:** https://iimbg-committee-portal.vercel.app/api/docs

---

## Screenshots

| Desktop | Mobile |
|---------|--------|
| ![Home page](docs/screenshot-home.png) | ![Mobile view](docs/screenshot-mobile.png) |

| Events — filter & search | Dark mode |
|--------------------------|-----------|
| ![Events page](docs/screenshot-events.png) | ![Dark mode](docs/screenshot-dark.png) |

---

## Features

| # | Feature | Status |
|---|---------|--------|
| 1 | **Home** — hero with SVG gold-line Buddha silhouette, featured events carousel, CTA | ✅ |
| 2 | **Events** — responsive grid (1/2/3 cols), horizontal category chips, search, empty-state link | ✅ |
| 3 | **Team** — member cards (avatar, name, role, one-line bio, vertical label) | ✅ |
| 4 | **Register** — single-column form, inline zod validation, disabled pending submit, success panel echoing event name | ✅ |
| 5 | **API + Docs** — REST endpoints with shared zod schema, Scalar at `/api/docs`, health endpoint | ✅ |

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | React + Vite | 19 / 8.x |
| Styling | Tailwind CSS | 4.x |
| Backend (serverless) | Hono | 4.x |
| API docs | Scalar (`@scalar/hono-api-reference`) | 0.11.x |
| Validation | zod | 4.x |
| Database | Supabase (Postgres) | 2.x |
| Deploy | Vercel (static + `/api/*` functions) | — |

---

## API

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/events` | All events; supports `?category=` & `?q=` |
| `GET` | `/api/events/:id` | Single event |
| `GET` | `/api/team` | Team members |
| `POST` | `/api/registrations` | Validate (zod) → insert to Supabase → `201` |
| `GET` | `/api/health` | `{ status, uptime }` |
| `GET` | `/api/docs` | **Scalar UI** (interactive OpenAPI) |

Full interactive docs at `/api/docs` (generated from the same zod schemas via `@hono/zod-openapi` — zero drift).

---

## Setup & Run

```bash
# 1. Clone
git clone https://github.com/<your-org>/iimbg-committee-portal.git
cd iimbg-committee-portal

# 2. Install
npm i

# 3. Configure env (never commit real keys)
cp .env.example .env
# Edit .env → add SUPABASE_URL and SUPABASE_SERVICE_KEY

# 4. Dev (runs Vite + Hono API concurrently)
npm run dev

# 5. Test
npm test

# 6. Build
npm run build
```

The API runs locally at `http://localhost:8787` (via `tsx watch api/dev.ts`) and is proxied by Vite so `/api/*` calls work without CORS.

---

## Testing

**67 tests across 6 suites**, all passing.

| Suite | Coverage |
|-------|----------|
| `api.test.ts` | 14 — every route via an injected fake Supabase: filters, 404s, registration success and each validation failure |
| `events.test.ts` | 14 — category filter, case-insensitive search, combined filter + search, no-op cases |
| `schemas.test.ts` | 12 — name, email, 10-digit phone (with separator stripping), programme enum, 400-char notes boundary |
| `format.test.ts` | 17 — date/time formatting and month grouping helpers |
| `events-page.test.tsx` | 4 — URL-driven filters, clear-filters reset, one registration link per card |
| `register-page.test.tsx` | 6 — server errors mapped to fields, 503 handling, `?event=` pre-select |

```
$ npm test

 Test Files  6 passed (6)
      Tests  67 passed (67)
```

> Run `npm test` locally or in CI. Logic suites are pure (no browser, no DB); the two page suites use jsdom.

A mobile fitness check also ships with the project — `npm run check:mobile` loads every route at 320/360/390/430/768 px and fails on horizontal overflow, sub-24px tap targets, or inputs small enough to trigger iOS focus-zoom.

---

## AI Usage

**Tool used:** Claude (Anthropic), via Claude Code in the terminal.

**Where it helped:** project scaffolding and boilerplate, repetitive component and test code, refactoring passes across the UI layer, and drafting documentation. It was also useful as a reviewer — for auditing the interface against reference design systems and for catching rendering bugs that type-check and build cleanly, such as a CSS cascade-layer conflict and a Tailwind v4 syntax change that silently dropped styles.

**What I owned:** the stack and architecture (Vite + Hono on Vercel, Supabase over Google Sheets), the data model and validation rules in `src/lib/schemas.ts`, the Track 2 automation design, product and scope decisions throughout, review of the generated code, all deployment and environment setup, and the debugging.

I treated AI as a fast pair-programmer rather than an author: it accelerated the typing, I decided what got built and what shipped. Every file here is one I can walk through and explain.

---

## Track 2 — Automation & Data

The feedback pipeline lives in **`apps-script/`**:

| File | Description |
|------|-------------|
| `onFormSubmit.gs` | Thank-you email on every form submission (MailApp) → `EmailLog` tab |
| `dailyDigest.gs` | Scheduled 8–9 AM Telegram digest (at-least-once) → `RunLog` tab |
| `README.md` | Deploy steps, trigger setup, Script Properties, quotas |

See `apps-script/README.md` for the full setup guide.

---

## License

MIT — built for the IT Committee recruitment 2026.