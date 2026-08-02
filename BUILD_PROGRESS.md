# IT Committee Recruitment 2026 — Build Progress

Tracking doc. Update the checkboxes as work lands. Sourced from `00_MASTER_PLAN.md` / `03_TASK_A_PORTAL_PLAN.md` / `04_TRACK2_PIPELINE_PLAN.md` in `C:\Users\GIRI\Downloads\files (1)`.

Legend: `[x]` done · `[~]` in progress · `[ ]` pending

---

## 0. Pre-flight — environment & accounts

- [x] Node.js installed (v24.18.1)
- [x] git installed (v2.55.0)
- [x] Vercel account (sign up w/ GitHub — confirm when about to deploy) [ ]
- [x] Supabase project created — URL `https://dunndtaqybhshkhacier.supabase.co`, service key in `secrets.txt`
- [ ] ⚠️ **Rotate the exposed Supabase service key** (it was pasted in chat) — Settings → API → regenerate
- [ ] Supabase `registrations` table created (run SQL from `03_TASK_A_PORTAL_PLAN.md` §3) — *do on Day 1*
- [x] GitHub account ready
- [ ] Create public GitHub repo `iimbg-committee-portal` — *when ready to first-push*
- [x] Telegram bot created — token in `secrets.txt`, bot `t.me/ed1th1024bot`
- [ ] Telegram **chat_id** captured (send bot a msg, hit `/getUpdates`) — *Day 3*

### Secrets policy (non-negotiable)
- `.env` is gitignored; values live ONLY in local `.env` + Vercel project env vars.
- `.env.example` ships with **blank** values.
- Telegram token / chat_id live in Apps Script **Script Properties**, never in code.
- ⚠️ The Supabase key currently in `secrets.txt` is considered leaked — rotate before trusting it.

---

## 1. Repo scaffold + design tokens — *Day 1 morning*

- [x] `npm create vite@latest iimbg-committee-portal -- --template react-ts`
- [x] Install runtime deps: `react-router-dom react-hook-form zod @supabase/supabase-js hono @hono/zod-openapi @hono/node-server @scalar/hono-api-reference`
- [x] Install dev deps: `tailwindcss @tailwindcss/vite vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom tsx concurrently`
- [x] Note: dropped `@hookform/resolvers` (zod v3/v4 peer conflict) — wrote a manual `safeParse` adapter to keep the shared-schema talking point. Version-independent.
- [x] Tailwind v4 wired via `@tailwindcss/vite` plugin (`vite.config.ts`)
- [x] Design tokens defined in `src/styles/index.css` (`@theme`): ink #12100C, surface #1C1915, gold #C9A227, bodhi #6B7F5E, paper #F2EDE3, muted #9C948A
- [x] Fonts loaded in `index.html`: Space Grotesk (display), Inter (body), JetBrains Mono (data)
- [x] `src/main.tsx` — BrowserRouter + StrictMode
- [x] Vite dev API proxy → local Hono dev server on :8787 (`vite.config.ts`) + `concurrently` dev scripts in `package.json`
- [ ] `prefers-reduced-motion` handling (done in CSS) + 44px tap targets + 375px no-scroll (verify on pages)

---

## 2. Data files (source of truth) — *Day 1 morning*

- [x] `src/data/events.json` — ≥6 events, ≥3 categories (Workshop / Competition / Speaker Session / Social), fields per §3
- [x] `src/data/team.json` — 6–8 members: id, name, role, bio, avatar (DiceBear initials), vertical

---

## 3. Shared schema + API client — *Day 1*

- [x] `src/lib/schemas.ts` — `registrationSchema` (zod), shared FE/BE; phone 10 digits; valid email; event_id≥1; program enum; notes ≤400
- [x] `src/lib/api.ts` — fetch helpers (`getEvents`, `getTeam`, `createRegistration`) with JSON-fallback to local data if API down (`filterLocal` mirrors server logic)
- [x] `src/lib/supabase.ts` (server-only) — client from `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` env

---

## 4. Pages + components + layout — *Day 1 afternoon*

- [x] `src/components/Navbar.tsx` — logo left, 4 links right; hamburger <768px
- [x] `src/components/Footer.tsx`
- [x] `src/components/EventCard.tsx` — staggered fade-up (the one permitted animation)
- [x] `src/components/TeamCard.tsx` — avatar (DiceBear), name, mono role, one-line bio
- [x] `src/components/FilterBar.tsx` — horizontal category chips + search input
- [x] `src/pages/Home.tsx` — hero: inline SVG gold Buddha silhouette + headline "The committee that runs the campus's tech." + gold CTA "Register for an event"; + featured events
- [x] `src/pages/Events.tsx` — responsive grid (1/2/3 col); FilterBar; empty state "No events match — clear filters" as a working link
- [x] `src/pages/Team.tsx` — same grid pattern
- [~] `src/pages/Register.tsx` — single col max-w-md; labels above inputs; inline zod errors; disabled submit while pending; success panel echoing event name *(agent building)*
- [~] `src/App.tsx` — Routes + layout shell (Navbar/Footer + Outlet) *(agent building)*
- [~] Mobile rules verified at 375px on every page *(in review step)*

---

## 5. Hono API + Scalar docs — *Day 1 evening / Day 2*

- [~] `api/[[...route]].ts` — Hono app (zod-openapi) *(agent building)*
- [~] `GET /api/events` — supports `?category=` & `?q=`
- [~] `GET /api/events/:id`
- [~] `GET /api/team`
- [~] `POST /api/registrations` — zod validate → Supabase insert → 201 (validates event_id exists)
- [~] `GET /api/health` — `{ status, uptime }` (data-engineer touch)
- [~] `GET /api/docs` — Scalar UI rendering OpenAPI spec (generated from zod schemas)
- [~] `vercel.json` — SPA rewrite keeping `/api/*` on functions
- [x] Dev: `npm run dev` starts Vite (5173) + API (8787) via `concurrently`; Vite proxies `/api`

---

## 6. Registration flow wiring — *Day 1 afternoon*

- [~] FE `Register.tsx` posts to `/api/registrations`; manual `safeParse` → react-hook-form `setError` per field *(agent building)*
- [~] Success panel shows the registered event's title *(agent building)*
- [~] BE inserts into Supabase `registrations` table *(agent building)*
- [ ] Smoke test: a real submit lands a row in Supabase (do in incognito — needs live env + table)

---

## 7. Testing — *Day 2 afternoon (timeboxed ~1h)*

- [~] `tests/schemas.test.ts` — 6–8 cases: valid passes; bad email, short/bad phone, unknown event_id, missing name, notes>400 → fail with correct messages *(agent, after API lands)*
- [~] `tests/events.test.ts` — filter by category; search by partial name (case-insensitive); combined filter+search *(agent, after API lands)*
- [ ] `npm test` green → screenshot → `docs/tests-passing.png`

---

## 8. Responsive + polish — *Day 2*

- [ ] Mobile layout pass at 375px (explicitly graded)
- [ ] Focus rings (gold), alt text, tap targets ≥44px, 16px+ body
- [ ] Lighthouse mobile run → screenshot `docs/lighthouse.png` (aim 90+)
- [ ] Optional: 1 Playwright smoke (home→Events→filter→Register)

---

## 9. Repo config + README — *Day 2 evening*

- [~] `.env.example` — blank `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` *(agent building)*
- [~] `.gitignore` — node_modules, .env, dist (verify no secrets) *(agent building)*
- [~] `README.md` per §7: description + live URL + docs URL · screenshots (desktop+mobile) · features checklist · tech stack table · API section + `/api/docs` link · setup & run · testing + passing screenshot · **AI Usage** section (specific) *(agent building)*
- [ ] `docs/` — screenshot-home.png, screenshot-mobile.png, lighthouse.png, tests-passing.png

---

## 10. Deployment — *Day 2*

- [ ] Push repo to public GitHub
- [ ] Vercel: import repo, framework `Vite`, add env vars (SUPABASE_URL, SUPABASE_SERVICE_KEY), deploy
- [ ] Incognito smoke: all 4 pages, real form submit, `/api/docs`
- [ ] Verify repo opens logged-out, README renders

---

## 11. Track 2 — Automation & Data Pipeline — *Day 3*

### 11a. Google Form "IT Committee Event Feedback"
- [ ] Create form: event dropdown, rating 1–5, what-went-well, improve, email
- [ ] Link responses → Sheet `feedback-pipeline`; tabs `Form Responses 1`, `EmailLog`, `RunLog`

### 11b. Apps Script #1 — `onFormSubmit.gs` (thank-you email)
- [ ] HTML email: gold header, greeting, event + ★ rating echo, footer (inline styles)
- [ ] `MailApp.sendEmail`; append to `EmailLog`; try/catch; missing email → SKIPPED
- [ ] Installable trigger: On form submit
- [ ] Commit `apps-script/onFormSubmit.gs` to repo (placeholders only)

### 11c. Apps Script #2 — `dailyDigest.gs` (→ Telegram)
- [ ] Read `lastProcessedRow` from PropertiesService; read new rows
- [ ] Count, avg rating (2dp), per-event breakdown, ≤3 newest "improve" comments (trunc 80)
- [ ] Telegram Markdown message via `UrlFetchApp`
- [ ] On success advance pointer + append RunLog; on failure log FAILED + MailApp fallback (at-least-once)
- [ ] Time-driven trigger 8–9 AM; manual-run for demo
- [ ] Commit `apps-script/dailyDigest.gs` (token/chat_id via Script Properties)

### 11d. Looker Studio dashboard
- [ ] Data source: `Form Responses 1` (live)
- [ ] Tiles: avg-rating scorecard, responses/day time series, by-event bar, latest-comments table
- [ ] Dark #12100C bg, gold #C9A227 series; "anyone w/ link can view" → viewer link for PDF

### 11e. Demo + commits
- [ ] 2-min end-to-end demo (form→email→manual digest→Telegram→dashboard refresh) → Drive public link
- [ ] `apps-script/README.md` (trigger setup, Script Properties keys, quotas)

---

## 12. Mandatory IT Support videos — *Day 1 evening (campus)*

> Must shoot on Day 1 — the only thing you can't do from a desk.

### 12a. Auditorium AV (≤5 min, ~3 target)
- [ ] Recon: confirm 5 equipment (projector, mixer, wireless mics, podium console, speakers/amp); note brand/model + gotchas
- [ ] Shoot per `01_VIDEO_SCRIPT_AUDITORIUM.md` (intro, 5 equipment segments, outro); lower-third labels = timestamp anchors
- [ ] Edit to ~3 min; upload to Drive public; timestamped screenshots

### 12b. Classroom AV (≤5 min, ~3 target)
- [ ] Recon: projector/display, podium PC+plate, interactive panel, speakers+volume, faculty collab mic
- [ ] Shoot per `02_VIDEO_SCRIPT_CLASSROOM.md`; edit ~3 min; Drive public; timestamped screenshots

---

## 13. Packaging — *Day 3 evening*

- [ ] **IT Support PDF** (one): both video links, auditorium + classroom equipment sections, every image captioned with a video timestamp
- [ ] **Development PDF** (one): track declaration "Track 2 — Automation & Data" + live URL + GitHub repo + API docs URL + form link + dashboard link + demo video link + `/apps-script` path + architecture diagram + 3 design-decision lines + "every link public" line
- [ ] Final QA checklist (`00_MASTER_PLAN.md` §4) in incognito
- [ ] Submit exactly one PDF per vertical

---

## Notes / decisions log

- **zod import path:** using `zod/v4` (we're on zod 4.x) — keeps `@hono/zod-openapi` and FE in sync.
- **No `@hookform/resolvers`:** zod v3/v4 peer conflict; replaced with a ~15-line `safeParse` adapter so the shared-schema story survives and we're version-independent.
- **Single permitted animation:** staggered fade-up of event cards (`@keyframes fade-up` in `index.css`). Everything else stays still.
- **Anti-scope-creep:** NO admin panel, auth, dark-mode toggle, or CMS. Ship the 5 required features excellently.

---

## Session log

### 2026-08-02 — multi-agent build session
- git repo initialized (`main`), baseline commit `21f353b` (scaffold + tokens + data + components + lib + schemas).
- `package.json` scripts: `dev` = concurrently (Vite :5173 + API :8787), `test` = vitest, `test:watch`.
- Spawned 3 parallel agents (Wave 1): **UI** (Register page + App shell + import cleanup), **API** (Hono/OpenAPI + Scalar + Vercel handler + dev server), **Ops** (apps-script ×2 + README + .env.example + schema.sql + .gitignore).
- Wave 2 (tests) starts once the API agent lands, then review/test/fix-to-green, then commit milestones.
