# 05 — Execution Plan

Built to be run by a **cheaper model (Sonnet) one phase per session**. Each phase is
self-contained: it names the files it may touch, the docs it must read, and how it proves it
worked. Phases are ordered so nothing is ever built twice.

**Rule for every phase:** read `00-ARCHITECTURE.md § 8 (The Contract)` first. If a step seems to
require editing `api/`, `lib/schemas.ts`, `lib/api.ts`, or `lib/form.ts` — stop, you have
misread the task.

**Second rule for every phase:** `07-MOBILE.md` is binding. Mobile is the base case, not a final
QA pass. Write unprefixed classes for 360px and add breakpoints upward. No phase is complete
until `npm run check:mobile` exits 0 at 320 / 360 / 390 / 430 / 768px on every route.

---

## Phase map

| # | Phase | Touches | Depends on | Effort |
|---|---|---|---|:-:|
| 0 | Foundations — deps, alias, tokens, cascade fix | `package.json`, `tsconfig.app.json`, `index.css`, `index.html` | — | S |
| 1 | UI primitives | `components/ui/*`, `lib/cn.ts`, `lib/format.ts` | 0 | M |
| 2 | Shell — Layout, Navbar, Footer, theme, 404 | `App.tsx`, `components/app/*`, `pages/NotFound.tsx` | 0, 1 | M |
| 3 | Events page + EventCard + toolbar (**incl. bugs D1/D2**) | `pages/Events.tsx`, `components/app/event-*` | 1, 2 | L |
| 4 | Team page + TeamCard | `pages/Team.tsx`, `components/app/team-card.tsx` | 1, 2 | M |
| 5 | Register page + EventSummary | `pages/Register.tsx`, `components/app/event-summary.tsx` | 1, 2 | L |
| 6 | Home page | `pages/Home.tsx` | 1–5 | M |
| 7 | Purge — framer-motion, dead files, dead assets, favicon | many (deletions) | 1–6 | M |
| 8 | Polish pass — a11y, dark mode, 320px, scoring | all | 7 | M |

Order rationale: Events (3) before Home (6) because Home reuses `EventCard`. Purge (7) last so
nothing is deleted while still referenced.

---

## Phase 0 — Foundations

**Read:** `02-DESIGN-SYSTEM.md` (all), `03-COMPONENTS.md § 1`.

1. Install: `npm i clsx tailwind-merge class-variance-authority lucide-react @radix-ui/react-slot @radix-ui/react-dialog`
2. `tsconfig.app.json` → add `"baseUrl": "."` and `"paths": { "@/*": ["./src/*"] }`.
3. Replace `src/styles/index.css` **wholesale** with the block in `02-DESIGN-SYSTEM.md § 9`.
4. `index.html`: swap the three-family Google Fonts link for the Inter-variable + JetBrains Mono
   link in `02 § 2.1`; add the no-flash theme script from `02 § 7`.
5. Create `src/lib/cn.ts` (`03 § 2`).

> ⚠️ **The app will look broken after this phase.** Every component still references
> `bg-surface`, `text-primary`, `text-accent`, which no longer exist. That is expected and is
> repaired in Phases 1–6. Do not attempt to patch old components here.

**Verify:** `npm run build` succeeds · `npm test` → 42/42 · `import { cn } from "@/lib/cn"`
type-checks.

---

## Phase 1 — UI primitives

**Read:** `03-COMPONENTS.md § 2–3`, `02-DESIGN-SYSTEM.md § 5`.

Create under `src/components/ui/`: `button` · `input` · `textarea` · `label` · `field` ·
`select` · `badge` · `card` · `skeleton` · `separator` · `spinner` · `empty-state` ·
`segmented` · `search-input` · `sheet`.

Plus `src/lib/format.ts` (`03 § 5`) and `src/lib/use-delayed-loading.ts` (`03 § 3.8`).

**Constraints**
- `ui/*` imports nothing from `lib/api`, `lib/schemas`, or `data/`.
- Every variant comes from `cva`. No conditional class strings scattered inline.
- No component defines its own focus ring — the global rule owns it.
- Icon-only buttons must require `aria-label` at the type level.

**Verify:** `npm run build` clean · `rg "focus:ring|focus-visible:ring" src/components/ui` → 0
· `rg "rounded-(2xl|3xl)" src/components/ui` → 0.

Optional but cheap: add `tests/format.test.ts` covering `formatDate`, `formatTime`, `monthKey`,
`isUpcoming`. Pure functions, no DOM. This raises the suite above 42 — which is fine; the
contract says *at least* the existing 42 keep passing.

---

## Phase 2 — Shell

**Read:** `03-COMPONENTS.md § 4.4–4.7`, `04-PAGES.md § P5`.

1. `components/app/logo.tsx` — one 24px mark. Pick **one** logo file and use the same URL in
   nav and footer (fixes D24).
2. `components/app/theme-toggle.tsx` + `lib/use-theme.ts` (`02 § 7`).
3. `components/app/navbar.tsx` — fixed 56px, no scroll-shrink, `Sheet` drawer, skip link.
4. `components/app/footer.tsx` — three link columns incl. **`/api/docs`** (fixes D23).
5. `App.tsx` — `Layout` applies `padding-top: var(--nav-h)` **once**; extract `NotFound` to
   `src/pages/NotFound.tsx` and rebuild it on tokens (fixes D8).
6. `components/app/page-header.tsx` and `section.tsx`.

**Verify** — this phase closes D3, D8, D11, D21, D23, D24:
- 320px: hamburger fully visible and tappable; no horizontal scroll
- drawer: Escape closes · focus is trapped · background does not scroll · focus returns to the trigger
- Tab from page load: the **first** focusable element is the skip link
- theme toggle persists across reload with **no flash**
- `rg "#[0-9A-Fa-f]{6}" src/pages/NotFound.tsx` → 0

---

## Phase 3 — Events

**Read:** `04-PAGES.md § P2`, `03-COMPONENTS.md § 4.1`.

1. `components/app/event-card.tsx` — `variant="grid" | "row"`; whole card is one link (D16);
   `CategoryDot`; date **and time** (D22).
2. `components/app/events-toolbar.tsx` — replaces `FilterBar`. **Controlled**, not stateful.
3. `pages/Events.tsx` — derive filter state from `useSearchParams`; month grouping; live result
   count; `EmptyState`; skeletons.

**The two bug fixes (D1, D2)** — these restore behaviour the contract already requires:

```tsx
const [params, setParams] = useSearchParams();
const category = params.get("category") ?? "All";
const q        = params.get("q") ?? "";

// filter derives from the URL — never from component state
const filtered = useMemo(
  () => filterLocal(allEvents, { category: category === "All" ? undefined : category, q: q || undefined }),
  [allEvents, category, q],
);

// one setter drives chips, input, URL and grid together
function update(next: { category?: string; q?: string }) {
  const p = new URLSearchParams(params);
  // ... set/delete keys, omitting "All" and ""
  setParams(p, { replace: true });
}
```

`filterLocal` is imported from `lib/api.ts` unchanged.

**Verify:**
- `/events?category=Workshop` → chip active **and grid filtered** (today it shows all 7)
- `/events?q=pitch` → input populated **and grid filtered**
- typing filters live, debounced ~150ms, URL updates
- "Clear filters" resets chips + input + URL + grid at once
- `rg "aria-live" src/pages/Events.tsx` → present on the count
- exactly one `<a href="/register?event=…">` per card
- semantic `<ul>/<li>` (fixes D10)

---

## Phase 4 — Team

**Read:** `04-PAGES.md § P3`, `03-COMPONENTS.md § 4.2`.

1. `components/app/team-card.tsx` — **delete the `vertical` badge** (D9); 56px round avatar;
   `alt={member.name}`; no hover state; no `--shadow-hover` (D12).
2. `pages/Team.tsx` — group by `vertical` in data order; leadership row 2-up at 72px; the rest
   5-up at `xl`.

**Verify:** no card prints the same string twice · groups render with headings · ≥5 per row at
`xl` · headshots have real alt text · `rg "shadow-hover" src/` → 0.

---

## Phase 5 — Register

**Read:** `04-PAGES.md § P4` (especially the server-error block), `03-COMPONENTS.md § 3.3–3.4, 4.3`.

1. `components/app/event-summary.tsx` — consumes the already-loaded `Event`. **No new fetch.**
2. `pages/Register.tsx` — two-column at `lg`; `Field` for every input; native `Select` with a
   chevron (D4); semantic error colour (D7); `issues[]` mapped to fields (D5); `mode: "onTouched"`;
   live notes counter; success state with a recap.

**Do not touch** `lib/form.ts`, `lib/schemas.ts`, or `lib/api.ts`. Parse the server error inside
the page, exactly as shown in `04 § P4`.

**Verify:**
- both selects show a chevron
- submit with a bad email → **inline field error**, no JSON banner
- with no Supabase env configured → friendly 503 copy, not `{"error":…}`
- `?event=pitch-nexus` pre-selects and the summary matches; changing the select updates both panel and URL
- errors are `--danger`; nothing about failure is teal
- submit button holds its width while loading
- `npm test` → 42/42

---

## Phase 6 — Home

**Read:** `04-PAGES.md § P1`.

1. Rebuild `pages/Home.tsx`: left-aligned hero, stat strip **computed from data**, "Next up"
   card, featured grid reusing `EventCard`.
2. **Delete the entire decorative block** (`Home.tsx:81-99`) — blobs, bordered square, clock (D13).

**Verify:** nothing decorative remains · largest type is 44px · stats change when `events.json`
changes · "Next up" shows category, date, time, venue, seats · zero mount animations.

---

## Phase 7 — Purge

**Read:** `06-CLEANUP.md` — it carries the exact file list.

1. Remove `framer-motion`: `npm rm framer-motion`; replace remaining `motion.*` with
   `.animate-enter` or nothing.
2. Delete superseded components: `components/EventCard.tsx`, `TeamCard.tsx`, `FilterBar.tsx`,
   `Navbar.tsx`, `Footer.tsx`. **No re-export shims.**
3. Delete the unreferenced assets listed in `06-CLEANUP.md` (~12.3 MB, 124 files).
4. Install the new favicon set (`06-CLEANUP.md § 4`).
5. Dead exports: delete `registrationRequestSchema`; un-export `programSchema` and
   `RegistrationResult`.
   > `registrationRequestSchema` lives in the frozen `schemas.ts`. Deleting an export with zero
   > references repo-wide does not change validation or any type in use — but if you are not
   > certain, **skip it**. It costs nothing to leave.
6. Drop unused devDeps: `pdf-lib`, `pdf-parse`.

**Verify:** `npm run build` clean · `npm test` → 42/42 · `rg "framer-motion" src/` → 0 ·
`du -sh dist/` well under 5 MB (was ~17 MB) · every page still renders.

---

## Phase 8 — Polish & scoring

Walk all five routes in **both themes** at **320 / 390 / 768 / 1440**, and complete the
Definition of Done below. Then score each page against the targets in `01-AUDIT.md § D`. Any
page below 9 gets one more iteration on its weakest rubric dimension.

---

## Definition of Done

A phase is done only when **all** of these pass.

### Automated

```bash
npm run build           # clean
npm run lint            # clean
npm test                # 42/42 minimum

# token hygiene — every one of these must return zero
rg -n "color-primary|color-secondary|color-accent|shadow-soft|shadow-card|shadow-hover" src/
rg -n "Clash Display|animate-fade-up|whileHover" src/
rg -n "#[0-9A-Fa-f]{6}" src/components src/pages src/App.tsx
rg -n "\[var\(--color-" src/
rg -n "rounded-(2xl|3xl)" src/
rg -n "max-w-\[1120px\]|pt-24" src/
```

### Manual, per page

| Check | Pass condition |
|---|---|
| Light theme | no unstyled/legacy colour |
| Dark theme | no invisible text, no glaring images, borders still read |
| 320px | no horizontal scroll; every control reachable |
| 200% zoom | no clipping or overlap |
| Keyboard | full traversal; focus always visible; order matches layout |
| Screen reader | headings nest correctly; lists announce; errors announce |
| axe DevTools | 0 violations |
| Reduced motion | OS setting on → no animation |
| Loading | skeleton visible, correctly sized, no flash for fast resolves |
| Empty | only where reachable — Events filtered-empty only |

### Scoring gate

| Page | Must reach |
|---|:-:|
| Home | 9.3 |
| Events | 9.4 |
| Team | 9.2 |
| Register | 9.5 |
| 404 | 9.0 |
| Navbar / Footer | 9.3 / 9.0 |

---

## Copy-paste prompts

One per session. Each is self-contained.

> **Phase 0**
> Read `docs/design/00-ARCHITECTURE.md` §8 and `docs/design/02-DESIGN-SYSTEM.md` in full.
> Execute Phase 0 of `docs/design/05-EXECUTION.md` exactly: install the listed deps, add the
> `@/*` path alias to `tsconfig.app.json`, replace `src/styles/index.css` wholesale with the
> block in `02-DESIGN-SYSTEM.md §9`, update the fonts link and add the no-flash theme script in
> `index.html`, and create `src/lib/cn.ts`.
> The app will look broken afterwards — that is expected, do not patch old components.
> Change nothing under `api/` or in `src/lib/{schemas,api,form}.ts`.
> Finish by running `npm run build` and `npm test` and reporting both results.

> **Phase 1**
> Read `docs/design/03-COMPONENTS.md` §2–3 and `02-DESIGN-SYSTEM.md` §5.
> Execute Phase 1 of `docs/design/05-EXECUTION.md`: build every primitive listed under
> `src/components/ui/`, plus `src/lib/format.ts` and `src/lib/use-delayed-loading.ts`.
> `ui/*` must not import from `lib/api`, `lib/schemas`, or `data/`. Use `cva` for all variants.
> No component may define its own focus ring.
> Run the Phase 1 verification commands and report the output.

> **Phase 2**
> Read `docs/design/03-COMPONENTS.md` §4.4–4.7 and `04-PAGES.md` §P5.
> Execute Phase 2 of `docs/design/05-EXECUTION.md`: Logo, ThemeToggle + useTheme, Navbar (fixed
> 56px, no scroll-shrink, Radix Sheet drawer, skip link), Footer with three link columns
> including `/api/docs`, Layout owning the nav offset, and `pages/NotFound.tsx` rebuilt on
> tokens. This must close defects D3, D8, D11, D21, D23, D24 from `01-AUDIT.md`.
> Verify at 320px that the hamburger is visible and the drawer traps focus and closes on Escape.

> **Phase 3**
> Read `docs/design/04-PAGES.md` §P2 and `03-COMPONENTS.md` §4.1.
> Execute Phase 3 of `docs/design/05-EXECUTION.md`: rebuild EventCard (grid + row variants,
> single link per card, category dot, date **and** time), replace FilterBar with a controlled
> EventsToolbar, and rewrite `pages/Events.tsx` to derive all filter state from
> `useSearchParams`.
> This must fix D1 (deep-linked filters never apply) and D2 (clear-filters desync). Use
> `filterLocal` from `lib/api.ts` unchanged.
> Verify `/events?category=Workshop` renders a filtered grid, and report the count you see.

> **Phase 4**
> Read `docs/design/04-PAGES.md` §P3.
> Execute Phase 4 of `docs/design/05-EXECUTION.md`: rebuild TeamCard **without** the duplicate
> `vertical` badge, with a 56px round avatar, real alt text, and no hover state; rewrite
> `pages/Team.tsx` to group members by `vertical` with a 2-up leadership row and 5-up roster.
> Do not invent any content — grouping reads whatever is in `team.json`.

> **Phase 5**
> Read `docs/design/04-PAGES.md` §P4 in full, including the server-error handling block.
> Execute Phase 5 of `docs/design/05-EXECUTION.md`: two-column Register with a sticky
> EventSummary, `Field` wrappers, native selects with visible chevrons, `--danger` for all
> errors, `issues[]` mapped onto fields via `setError`, `mode: "onTouched"`, and a live notes
> counter.
> Do **not** modify `lib/form.ts`, `lib/schemas.ts`, or `lib/api.ts` — parse the error inside
> the page. Confirm `npm test` is still 42/42.

> **Phase 6**
> Read `docs/design/04-PAGES.md` §P1.
> Execute Phase 6 of `docs/design/05-EXECUTION.md`: rebuild `pages/Home.tsx` with a left-aligned
> hero, a stat strip computed from real data, a "Next up" event card, and a featured grid reusing
> EventCard. Delete the decorative block at the old `Home.tsx:81-99` entirely.
> Nothing on the page may exist purely for decoration.

> **Phase 7**
> Read `docs/design/06-CLEANUP.md` in full.
> Execute Phase 7 of `docs/design/05-EXECUTION.md`: remove framer-motion, delete the five
> superseded components, delete the unreferenced assets in the manifest, install the new favicon
> set, and drop the unused devDeps.
> Delete only what the manifest lists. Do not touch `submissions/` or `pr-vertical/`.
> Report `npm run build`, `npm test`, and the resulting `dist/` size.

> **Phase 8**
> Execute Phase 8 of `docs/design/05-EXECUTION.md`: walk all five routes in both themes at 320,
> 390, 768 and 1440px and complete the Definition of Done checklist. Run every token-hygiene
> command and report the output. Score each page against the targets in `01-AUDIT.md §D` and
> list anything still below its target with a specific reason.

---

## Guardrails

If a phase tempts you into any of the following, **stop and flag it instead**:

- editing anything under `api/`
- changing `lib/schemas.ts` validation, field names, or messages
- changing `lib/api.ts` signatures or removing the JSON fallback
- swapping `lib/form.ts` for `@hookform/resolvers`
- adding or removing a route
- breaking `/events?category=&q=` or `/register?event=`
- inventing event or team content
- deleting anything in `submissions/` or `pr-vertical/` (unrelated coursework, not app code)
- letting `npm test` drop below 42 passing
