# 04 — Page Specifications

Each page follows the required loop: **Analyse → Critique → Redesign → Implement → Refactor**,
and closes with acceptance criteria that must all pass before the page is scored.

Shared rules for every page:

- Layout owns the nav offset (`padding-top: var(--nav-h)` in `Layout`). **No page sets `pt-24`.**
- Width comes from `.container-page`. **No page sets `max-w-[1120px]`.**
- Page top padding 40px mobile / 56px desktop; bottom 64 / 96px.
- Every page renders `<PageHeader>` — except Home, which owns its own hero.
- No mount animations on headings, paragraphs, or CTAs.

---

## P1 — Home `/` · 4.0 → target **9.3**

### Analyse
Hero (badge, 60px headline, sub, 2 large CTAs, decorative block) → "Featured Events" → 3 cards
identical to `/events`. Data available but unused: every event's date, time, venue, seats,
category; the full team roster.

### Critique
See `01-AUDIT.md § P1`. The three things that must change: **~200px of decorative void with a
floating clock** (D13), **oversized 54px pill CTAs**, and **no substantive content whatsoever** —
the page could belong to any organisation on earth.

### Redesign

```
┌─ container-page ──────────────────────────────────────────────────┐
│                                                                    │
│  ● Envision · Entrepreneurship Cell            ← eyebrow, micro    │
│                                                                    │
│  Building the next generation of                ← display 44px     │
│  founders at IIM Bodh Gaya                        max-w-[18ch]     │
│                                                                    │
│  Envision is the Entrepreneurship Cell of IIM   ← prose 15px       │
│  Bodh Gaya. Events, mentorship, funding access,   max-w-[58ch]     │
│  and a community of builders.                     text-fg-muted    │
│                                                                    │
│  [ Browse events ]  [ Meet the team ]           ← xl + lg, 40/36px │
│                                                                    │
│  ── border-t ──────────────────────────────────────────────────    │
│   7            12            4            2026                     │
│   EVENTS       MEMBERS       TRACKS       SEASON   ← stat strip    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

┌─ Next up ─────────────────────────────────────── card, rounded-md ─┐
│ ● Workshop   ·  7 Aug 2026 · 6:00 PM  ·  Auditorium  ·  200 seats  │
│ Founder Fridays                                     [ Register → ] │
│ Weekly founder talks featuring successful entrepreneurs…           │
└────────────────────────────────────────────────────────────────────┘

Featured events                                          View all →
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ EventCard     │ │ EventCard     │ │ EventCard     │
└───────────────┘ └───────────────┘ └───────────────┘
```

**Decisions**

| Element | Spec |
|---|---|
| Hero alignment | **Left**, not centred. Centred hero + centred sub + centred CTAs is the template look the brief bans. Left-aligned reads editorial and lets the measure breathe. |
| Eyebrow | `text-micro` uppercase, `text-fg-subtle`, with a 6px `bg-brand` dot. Replaces the "Powered by" pill. |
| Headline | `text-display` (44px, −0.032em), `max-w-[18ch]` → 2 lines. |
| Sub | `text-prose text-fg-muted max-w-[58ch]`. |
| CTAs | `Browse events` = `primary xl` (40px). `Meet the team` = `secondary lg` (36px). Sizes differ so hierarchy is visible without colour shouting. |
| **Stat strip** | 4 cells, `border-t border-border`, 24px top padding. Number `text-title-2 numeric`, label `text-micro uppercase text-fg-subtle`. **Values derive from real data** (`events.length`, `team.length`, `CATEGORIES.length`) — never hardcoded. |
| **Next-up card** | The soonest event with `isUpcoming` true; falls back to the first featured event when none are upcoming. This is the single highest-value block on the page and it costs no new request. |
| Featured grid | Reuses `EventCard`. 3-up ≥`lg`, 2-up ≥`sm`, 1-up below. `gap-5`. |
| Decorative block | **Deleted.** Both blur blobs, the bordered square, the clock — all of it. |
| Section rhythm | 64px between hero / next-up / featured (96px on `≥lg`). |

**Loading.** Stat strip renders instantly from bundled JSON. Next-up and featured use
`useDelayedLoading` + shaped skeletons.

**Empty.** No featured events → the Featured section is omitted entirely rather than rendering
an apologetic paragraph. Next-up already has a fallback.

### Acceptance criteria
- [ ] No element on the page exists purely for decoration.
- [ ] Largest type is 44px; hero measure is 16–22 characters.
- [ ] Stat values are computed from data — changing `events.json` changes them.
- [ ] "Next up" shows category, date, time, venue and seats on one line at `≥md`.
- [ ] Zero mount animations; no `framer-motion` import.
- [ ] Passes at 320px with no horizontal scroll.
- [ ] Both themes checked.

---

## P2 — Events `/events` · 5.0 → target **9.4**

### Analyse
Header → `FilterBar` (5 chips + search) → 1/2/3 grid → empty state. 7 events, Aug–Oct 2026.

### Critique
`01-AUDIT.md § P2`. Two live bugs (**D1** deep links don't filter, **D2** clear-filters
desyncs), search that only fires on Enter, no result count, no use of the date axis, and a wall
of 7 identical teal buttons.

### Redesign

```
Events                                              ← PageHeader
Workshops, competitions, and speaker sessions from Envision.

┌─ toolbar ─ sticky top-[var(--nav-h)] bg-bg/80 backdrop-blur ──────┐
│ [All│Workshop│Competition│Speaker Session│Social]  [🔍 Search…  ] │
│                                            [▦ Grid] [☰ List]      │
└────────────────────────────────────────────────────────────────────┘
7 events                                       ← aria-live="polite"

AUGUST 2026 ──────────────────────────────────── ← month heading
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ EventCard     │ │ EventCard     │ │               │
└───────────────┘ └───────────────┘ └───────────────┘

SEPTEMBER 2026 ─────────────────────────────────
┌───────────────┐ ┌───────────────┐
└───────────────┘ └───────────────┘
```

**Decisions**

| Element | Spec |
|---|---|
| Toolbar | Sticky under the nav. `Segmented` category control + `SearchInput`, wrapping to two rows below `sm`. Fixed row height so nothing jumps as chips wrap. |
| Search | **Live, debounced 150ms.** Clear button. `Escape` clears. Still inside a `<form>` so Enter is harmless. |
| Result count | `{n} events` / `1 event` / `No events`, in `text-caption text-fg-subtle`, `aria-live="polite"`. |
| **Month grouping** | Group by `monthKey(date)`, ordered ascending. Heading = `text-micro` uppercase + `border-t`. Off when a search query is active (results are relevance-ordered, not chronological). |
| Grid ↔ List toggle | Optional but recommended — `EventCard variant="row"` gives a genuinely dense 40px-per-event view, which is where "high information density" is actually satisfied. Persist choice to `localStorage`. If the phase runs short, ship grid-only; the page still hits 9. |
| Card CTA | One quiet `Register →` link, `text-label text-fg-subtle`, → `text-fg` on card hover. Whole card is the link. |
| Grid | 1 / 2 / 3 columns, `gap-5`. |

**Bug fixes required (D1, D2)** — restore stated behaviour, do not invent new behaviour:

1. Lift filter state into `Events.tsx` and **derive it from `useSearchParams`**, so the URL is
   the single source of truth. The toolbar becomes controlled (`value` + `onChange`).
2. Apply the URL filter on mount: `filterLocal(all, { category, q })` using the params, not
   `setFiltered(evs)`.
3. "Clear filters" calls `setSearchParams({})`, which — because state now derives from the URL —
   resets chips, input, and grid together.

**States**

| State | Treatment |
|---|---|
| Loading | 6 `EventCardSkeleton`s in the real grid, behind `useDelayedLoading` |
| Empty (filtered) | `EmptyState`: `SearchX` icon, "No events match your filters.", the active filters echoed, `Clear filters` secondary button |
| Empty (no data) | Cannot occur — bundled JSON fallback (`00-ARCHITECTURE.md` §5) |
| Error | Unreachable by design. **Do not build one.** |

### Acceptance criteria
- [ ] `/events?category=Workshop` loads **with the grid filtered** and the chip active.
- [ ] `/events?q=pitch` loads with the input populated and the grid filtered.
- [ ] Typing filters live; the URL updates with `replace: true`.
- [ ] "Clear filters" resets chips, input, URL, and grid simultaneously.
- [ ] Result count is announced to screen readers.
- [ ] Each card exposes exactly **one** link to `/register?event=…`.
- [ ] `time` is displayed on every card.
- [ ] Semantic `<ul>/<li>`, or `role="list"` **with** `role="listitem"` children.
- [ ] Both themes; 320px; keyboard-only pass through toolbar → grid.

---

## P3 — Team `/team` · 3.5 → target **9.2**

### Analyse
Header → 12 cards in a 1/2/3/4 grid. Each card: 260px square photo, name, role, one-line bio,
and a badge repeating the role.

### Critique
`01-AUDIT.md § P3`. The duplicate badge (D9), a dead hover shadow (D12), near-zero density, and
no structure across 12 people.

### Redesign

```
Team                                                ← PageHeader
The people building Envision at IIM Bodh Gaya.

LEADERSHIP ───────────────────────────────────────
┌────────────────────────┐ ┌────────────────────────┐
│ ⬤  Arjun Patel         │ │ ⬤  Priya Sharma        │   ← 2-up, 56px avatar
│    President            │ │    Vice President      │
│    Leads the cell's…    │ │    Drives execution…   │
└────────────────────────┘ └────────────────────────┘

GROWTH ───────────────────────────────────────────
┌──────────┐┌──────────┐┌──────────┐┌──────────┐┌──────────┐
│ ⬤ Rohit  ││ ⬤ Anjali ││ ⬤ Karan  ││ ⬤ Neha   ││ ⬤ Ishita │   ← 5-up
└──────────┘└──────────┘└──────────┘└──────────┘└──────────┘

OPERATIONS ───────────────────────────────────────
…
```

**Decisions**

| Element | Spec |
|---|---|
| **Duplicate badge** | **Deleted.** `vertical` is repurposed as the *grouping key*, so the field still earns its place in the data. |
| Grouping | Derive groups from `vertical` in data order. Leadership = the first two (`President`, `Vice President`) rendered 2-up at a larger size; everyone else 5-up on `≥xl`, 4 / 3 / 2 / 1 below. Group headings `text-micro` uppercase + `border-t`. |
| Avatar | 56px `rounded-full` (72px in the leadership row) — not a 260px square. Density rises ~4×. |
| Name | `text-title-4`. Role: `text-caption text-brand-text`. Bio: `text-caption text-fg-muted`, `line-clamp-2`. |
| Hover | **None.** The card is not interactive; do not fake it. |
| `alt` | `alt={member.name}`. |
| Alignment | Equal-height rows via `grid` + `items-start`; bio clamped so baselines line up. |

> If `vertical` values ever diverge from `role`, the grouping stays correct — it reads whatever
> is in the data. No content is invented, which the contract requires.

**States.** Loading → 12 shaped skeletons. Empty/error → unreachable (bundled fallback).

### Acceptance criteria
- [ ] No card renders the same string twice.
- [ ] Members are grouped, with the leadership row visually distinct.
- [ ] ≥5 cards per row at `xl`; all 12 visible within ~1.2 viewports at 1440×900.
- [ ] Headshots have real `alt` text.
- [ ] No hover state on non-interactive cards; `--shadow-hover` is gone from the codebase.
- [ ] Semantic list markup.
- [ ] Both themes; 320px.

---

## P4 — Register `/register` · 4.0 → target **9.5**

### Analyse
`max-w-md` card, centred: 6 fields, submit, success panel. Pre-selects from `?event=`; writes
the selection back to the URL. Client-validates via `safeParseRegistration`, then POSTs.

### Critique
`01-AUDIT.md § P4`. Chevron-less selects (D4), teal errors (D7), raw JSON shown to users (D5),
~1000px of dead space next to a form about an event whose details are already in memory.

### Redesign

```
┌─ container-page ───────────────────────────────────────────────────┐
│ Register                                                            │
│ Reserve your seat. Takes about a minute.                            │
│                                                                     │
│ ┌─ form ─ max-w-[420px] ────────┐  ┌─ EventSummary ─ sticky ─────┐ │
│ │ Event *                        │  │ ┌─────────────────────────┐ │ │
│ │ [ Founder Fridays        ▾ ]   │  │ │  event image  3:2       │ │ │
│ │                                │  │ └─────────────────────────┘ │ │
│ │ Full name *                    │  │ ● Workshop                  │ │
│ │ [                          ]   │  │ Founder Fridays             │ │
│ │                                │  │                             │ │
│ │ Email *                        │  │ 📅 7 Aug 2026 · 6:00 PM     │ │
│ │ [                          ]   │  │ 📍 Auditorium               │ │
│ │                                │  │ 👥 200 seats                │ │
│ │ Phone *          Program *     │  └─────────────────────────────┘ │
│ │ [           ]    [       ▾ ]   │                                  │
│ │                                │                                  │
│ │ Notes            0 / 400       │                                  │
│ │ [                          ]   │                                  │
│ │                                │                                  │
│ │ [      Register      ]         │                                  │
│ │ By registering you agree…      │                                  │
│ └────────────────────────────────┘                                  │
└─────────────────────────────────────────────────────────────────────┘
```

**Decisions**

| Element | Spec |
|---|---|
| Layout | `grid lg:grid-cols-[minmax(0,420px)_minmax(0,360px)] gap-12`, top-aligned. Stacks below `lg`, summary **above** the form on mobile so context comes first. |
| `EventSummary` | Sticky at `top: calc(var(--nav-h) + 24px)`. Uses the already-loaded `Event`. **No new request.** No selection → skeleton with "Select an event to see details". |
| Selects | Real chevrons (`ui/select.tsx`). **Fixes D4.** |
| Phone + Program | Side by side on `≥sm` — tightens the form and raises density. |
| Errors | `--danger` everywhere: asterisk, message, border. **Fixes D7.** |
| Validation timing | `useForm({ mode: "onTouched" })` — errors after blur, then live while correcting. `lib/form.ts` untouched. |
| **Server errors** | Parse the response and map `issues[]` back onto fields. **Fixes D5.** |
| Notes counter | `{n} / 400` in `text-caption`, → `text-danger` past 400. Purely visual; the schema still governs. |
| Submit | `primary lg`, full-width. Spinner + "Registering…" with the width held. No `scale`. |
| Consent line | `text-caption text-fg-subtle`, left-aligned under the button. |

**Server error handling** — the only place needing care. `api.ts` throws with the raw body as
`message`, so parse defensively in the page (no change to `api.ts`, per the contract):

```ts
catch (err) {
  const raw = err instanceof Error ? err.message : "";
  let parsed: { error?: string; issues?: { path: string; message: string }[] } | null = null;
  try { parsed = JSON.parse(raw); } catch { /* not JSON */ }

  if (parsed?.issues?.length) {
    for (const i of parsed.issues) setError(i.path as keyof RegistrationInput, { type: "server", message: i.message });
    setServerError(null);                     // errors are now inline, on the fields
  } else {
    setServerError(friendly(parsed?.error, raw));
  }
}
```

`friendly()` maps known cases to human copy and never shows a JSON blob:

| Response | Message shown |
|---|---|
| 503 `Registration storage not configured` | "Registrations are temporarily unavailable. Please try again later or email the committee." |
| 400 with `issues[]` | mapped onto the fields; no banner |
| 400 `Unknown event` | "That event is no longer available. Please pick another." |
| 500 / network | "Something went wrong on our end. Please try again." |

Banner: `bg-danger-subtle border border-danger-border text-danger`, `AlertCircle` icon,
`role="alert"`, and it takes focus so screen-reader users hear it.

**Success state.** Replaces only the form column; the summary stays. `CheckCircle2` in
`--success`, "You're registered", a recap list (name · email · event · date · venue), then
`Register someone else` (secondary) + `Browse events` (ghost). `role="status" aria-live="polite"`
is already there — keep it.

### Acceptance criteria
- [ ] Both selects show a visible chevron.
- [ ] Every error is `--danger`; nothing about failure is teal.
- [ ] A 400 with `issues[]` lands as inline field errors; **no JSON is ever shown**.
- [ ] 503 shows the friendly unavailable message.
- [ ] `?event=<id>` pre-selects and the summary panel matches; changing the select updates both the panel and the URL.
- [ ] Errors appear on blur, not only on submit.
- [ ] Notes counter is live and turns `--danger` past 400.
- [ ] Submit keeps its width while loading.
- [ ] Keyboard-only completion; 200% zoom usable.
- [ ] `npm test` still 42/42 (schemas and form logic untouched).

---

## P5 — 404 `*` · 2.0 → target **9.0**

### Critique
`01-AUDIT.md § P5`. Built entirely on a deleted gold/cream palette (D8) that only *looks* right
because of the cascade bug in A1 — fix the cascade and this page breaks visibly. Plus ~600px of
void, no recovery paths, and an arrow pointing the wrong way.

### Redesign

Move to `src/pages/NotFound.tsx`. Centred, `max-w-[420px]`, vertically centred in
`min-h-[calc(100vh-var(--nav-h)-var(--footer-h))]` — not `min-h-screen` inside a page that
already has a nav and footer.

```
404                              ← text-micro uppercase, fg-subtle, numeric
Page not found                   ← text-title-1
The page you're looking for doesn't exist or has moved.   ← prose, fg-muted

[ Back to home ]  [ Browse events ]      ← primary lg + secondary lg

──────────────────────────────────────
Try one of these                 ← text-micro uppercase
Events · Team · Register · API reference    ← link list
```

Every colour is a token. The arrow on "Back to home" points **left** only if it is placed
*before* the label; the events CTA uses a trailing right arrow. Pick one convention and hold it.

### Acceptance criteria
- [ ] No raw hex anywhere in the file.
- [ ] Content is vertically centred with no more than ~120px of slack.
- [ ] At least four recovery links, including `/api/docs`.
- [ ] Renders correctly in both themes.
- [ ] `<title>`-equivalent heading structure: one `h1`.

---

## Cross-page checklist

Run against every page before scoring:

| Check | How |
|---|---|
| No `max-w-[1120px]`, no `pt-24` | `rg "max-w-\[1120px\]\|pt-24" src/` → 0 |
| No legacy tokens | `rg "color-accent\|color-primary\|color-secondary" src/` → 0 |
| No raw hex | `rg "#[0-9A-Fa-f]{6}" src/pages src/components` → 0 |
| Radius ≤ 12px | `rg "rounded-(2xl\|3xl)" src/` → 0 |
| No mount animation | `rg "whileHover\|animate-fade-up" src/` → 0 |
| Dark mode | toggle on every page; check images, borders, focus rings |
| 320px | DevTools at 320×568, no horizontal scroll |
| 200% zoom | no clipping, no overlap |
| Keyboard | tab the whole page; focus always visible; order matches layout |
| Contrast | axe DevTools → 0 contrast violations |
| Tests | `npm test` → 42/42 |
| Build | `npm run build` clean; `npm run lint` clean |
