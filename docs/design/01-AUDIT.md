# 01 — Audit, Critique & Scores

Reviewed against **Linear, Vercel, Stripe, Notion, GitHub Primer, Raycast** as quality bars.
Nothing here is copied from them; they are used only to calibrate what "premium" means.

Method: read every source file, rendered all five routes at 1440×900 and 390×844 with
Playwright, and ran scripted DOM/computed-style probes to verify each defect rather than
eyeball it. Findings marked **[verified]** were confirmed by a computed-style or DOM assertion.

---

## Scoreboard — current state

| # | Surface | Score | One-line verdict |
|---|---|:---:|---|
| P1 | Home `/` | **4.0** | A template hero with a floating clock in 200px of void. Says nothing specific. |
| P2 | Events `/events` | **5.0** | Best page here; still a generic 3-up card grid with two live filter bugs. |
| P3 | Team `/team` | **3.5** | Every card shows the same word twice. Photo-heavy, information-poor. |
| P4 | Register `/register` | **4.0** | Two dropdowns with no chevron. Errors painted in the brand colour. |
| P5 | 404 `*` | **2.0** | Built on a deleted colour palette. Its styling is entirely dead code. |
| C1 | Navbar | **4.0** | Three competing brand marks; hamburger falls off-screen at 390px. |
| C2 | Footer | **3.0** | A pull-quote in uppercase mono. Zero links. |
| — | **Design system** | **2.5** | Not a system. Three syntaxes for one colour, five radii, no scale, no dark mode. |
| — | **Weighted overall** | **3.6** | |

Rubric per page (each dimension /10):

| | Layout | Type | Colour | Craft | Density | States | A11y | Motion | Resp. |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Home | 3 | 4 | 5 | 4 | 2 | 5 | 5 | 3 | 5 |
| Events | 5 | 5 | 5 | 5 | 4 | 6 | 4 | 4 | 6 |
| Team | 4 | 4 | 4 | 3 | 2 | 4 | 4 | 5 | 6 |
| Register | 3 | 5 | 3 | 4 | 3 | 5 | 5 | 4 | 4 |
| 404 | 2 | 3 | 1 | 2 | 2 | — | 5 | — | 4 |
| Navbar | 4 | 4 | 5 | 4 | 4 | — | 3 | 3 | 2 |
| Footer | 4 | 2 | 4 | 3 | 2 | — | 5 | — | 5 |

---

## A. System-level defects

These cause most of the per-page symptoms. Fix these first and several pages improve for free.

### A1. 🔴 Unlayered CSS silently kills every heading colour utility — **[verified]**

`src/styles/index.css:58-65` declares `h1, h2, h3 { color: var(--color-primary) }` **outside any
`@layer`**. Tailwind v4's `@import "tailwindcss"` places all utilities inside `@layer utilities`.
Per the cascade-layer spec, **unlayered rules beat layered rules regardless of specificity**.

Proof — the 404 heading:

```
element : <h1 class="text-6xl font-display font-bold text-[#C9A227] mb-4">404</h1>
computed: color: rgb(17, 24, 39)     ← --color-primary, NOT #C9A227
```

**Consequence: `text-*` on any `h1`/`h2`/`h3` anywhere in this app does nothing.** Any future
designer will "fix" a heading colour, see no change, and not know why. Same trap applies to
`body` (`:47`) and to `.mono` (`:75`), which overrides `text-xs` — verified: an element with
`class="text-xs text-secondary mono"` computes `font-size: 12.48px` (`.mono`'s `0.78rem`),
not `12px` (`text-xs`).

**Fix:** wrap all element-level defaults in `@layer base { … }` and convert `.mono` to a real
`@utility`. This alone is a one-line-per-rule change that unblocks everything else.

### A2. 🔴 Three syntaxes for the same colour

| Syntax | Example | Files |
|---|---|---|
| Theme utility | `bg-surface`, `text-accent` | `Home`, `Events`, `EventCard`, `Register` |
| Arbitrary var | `bg-[var(--color-surface)]` | `Navbar`, `FilterBar`, `TeamCard`, `Footer` |
| Raw hex | `text-[#C9A227]` | `App.tsx` (404) |

`Navbar.tsx:35` is the extreme case — a single `className` containing
`bg-[var(--color-surface)]/95` twice plus `supports-[backdrop-filter]:`. Unreadable and
unmaintainable. **One syntax: semantic utilities only.**

### A3. 🔴 No semantic colour roles — errors are painted in the brand colour

There is no `danger`, `success`, `warning`, or `info` token. Consequences on Register:

- required-field asterisks: `text-accent` (teal)
- every field error message: `text-accent` (teal)
- the server-error banner: `bg-accent/10 border-accent/30 text-accent`

A failed submission is therefore rendered in exactly the palette used for the primary CTA.
Users cannot distinguish "success" from "your phone number is wrong". Stripe and Linear both
treat semantic colour as non-negotiable; this is the single most damaging colour decision here.

### A4. 🟠 Five radii, no scale

`rounded` (4px) badges · `rounded-lg` (8px) drawer links · `rounded-xl` (**overridden to 16px**
by `--radius-xl: 1rem` at `index.css:20`) inputs & buttons · `rounded-2xl` (16px) cards ·
`rounded-full` chips. Note `--radius-xl` silently redefines a stock Tailwind value, so
`rounded-xl` and `rounded-2xl` are *both* 16px — two different class names producing identical
output. The brief bans "huge rounded corners"; 16px on a 350px card is squarely in that zone.

### A5. 🟠 No type scale and no spacing scale

Ten font sizes appear (`text-6xl` → `text-xs`) chosen per-page with no ratio. Vertical rhythm
is equally ad-hoc: `pt-24 pb-20`, `pt-20 pb-28`, `md:pt-32 md:pb-36`, `mb-8`, `mb-10`, `p-5`,
`p-6`, `p-8`, `gap-4`, `gap-6`, `gap-8`. Nothing is derived from a base unit.

### A6. 🟠 Motion is unmotivated, duplicated, and costs 100 kB+

- `framer-motion` is a top-5 bundle contributor and is used **only** for fade-ups.
- Static text animates on mount. Home staggers badge → h1 → sub → CTAs with delays up to
  **0.5 s** (`Home.tsx:25,38,48,59,84`). Content the user came for is deliberately withheld
  for half a second. Linear and Vercel animate *state changes*, not page text.
- **Two animation systems run on the same element.** `EventCard.tsx:20` carries the CSS class
  `animate-fade-up` plus an inline `animationDelay`, while its parent in `Home.tsx:206` /
  `Events.tsx:125` wraps it in a `motion.div` with its own fade-up variant. Every card
  animates twice.
- `whileHover={{ scale: 1.02 }}` on the submit button (`Register.tsx:400`) and `1.03` on the
  success button — growing buttons are a dated tic and cause text reflow shimmer.

### A7. 🟠 No dark mode at all

`index.css:26` hardcodes `color-scheme: light`. There is no `.dark` variant, no
`prefers-color-scheme` handling, no toggle. The brief asks to *improve* dark mode; it must
first be built.

### A8. 🟠 Inline SVG duplicated everywhere; the icon sprite is unused

The right-arrow path `M5 12h14M12 5l7 7-7 7` is hand-inlined **5 times**; the search icon
twice; the check-circle twice. Meanwhile `public/icons.svg` (5 KB) is shipped to production
and referenced by nothing. Icon sizes drift: 12, 14, 16, 18, 24, 32 px with stroke widths
1.5, 2, and 2.5 mixed arbitrarily.

### A9. 🟡 Broken and phantom tokens — **[verified]**

- `--shadow-hover` is used at `TeamCard.tsx:19` and **defined nowhere**. Computed value is
  empty → TeamCard's hover elevation has never worked.
- `--font-display` leads with `"Clash Display"`, which is **never loaded** — not in the Google
  Fonts URL, no `@font-face`, no local file. Verified: the hero `h1` computes the full stack
  but renders Space Grotesk. Anyone with Clash Display installed locally sees a different site.
- `--max-w: 1120px` is defined and never read; pages hardcode `max-w-[1120px]` instead.
- Google Fonts requests **Space Grotesk 500**, which no class ever uses.
- `Footer.tsx:26` uses `font-[var(--font-sans)]`, which is at best redundant (the body already
  sets it) — and is the ambiguous arbitrary-property form Tailwind v4 warns about.

### A10. 🟡 Accessibility gaps

- **Broken list semantics [verified].** `Events.tsx:121` and `Team.tsx:80` set `role="list"`,
  but the 7/12 direct children are `motion.div`s with **no `role="listitem"`**. Verified:
  `role=list` has 7 children, all with role `(none)`. Screen readers announce a malformed list.
- **`#main-content` exists with no skip link.** `App.tsx:27` sets the id; no
  `<a href="#main-content">` is rendered anywhere.
- **Contradictory logo markup.** `Navbar.tsx:53-67`: `<img alt="IIM Bodh Gaya" aria-hidden="true">`
  — a meaningful `alt` on an element removed from the tree.
- **Team headshots use `alt=""`.** A person's photo in a roster is content, not decoration.
- **Focus styling is inconsistent.** A good global `:focus-visible` ring exists (`index.css:68`),
  then components override it with `focus-visible:ring-2`, and inputs use plain `focus:ring-1`
  (fires on mouse click too).
- Mobile drawer has **no focus trap, no Escape handler, no scroll lock**, and its backdrop is
  `absolute inset-0 -z-10` inside a 72px-tall fixed `<nav>` rather than a viewport overlay.

### A11. 🟡 Skeletons don't resemble the content

`Events.tsx:44`, `Team.tsx:36`, `Register.tsx:118` all render `h-10 bg-background` — a
`#FAFAF8` block on a `#FAFAF8` page, i.e. **invisible**. Card skeletons are `h-80` (320px)
against real cards of ~430px, so the layout jumps on load. And because `api.ts` silently falls
back to bundled JSON, these often flash for a few milliseconds.

---

## B. Page-by-page

### P1 — Home `/` · **4.0/10**

**Analyse.** Fixed navbar → centred hero (badge, h1, sub, two CTAs, decorative block) →
"Featured Events" section with the same three cards as `/events`.

**Critique.**

1. **The decorative block is a rendering accident.** `Home.tsx:81-99` wraps ~200px of height
   around: two `blur-2xl` blobs at **10% opacity** (invisible against `#FAFAF8`) and one 64px
   bordered square containing a **clock icon**, absolutely centred. In the screenshot this
   reads as a broken image placeholder floating in empty space. It communicates nothing.
2. It is also the exact aesthetic the brief bans — blurred colour blobs plus
   `bg-surface/50 backdrop-blur-sm` is textbook glassmorphism.
3. **Oversized CTAs.** `px-8 py-3.5 text-lg rounded-2xl` (`Home.tsx:64,74`) — ~180×54px pill
   buttons. Linear/Vercel primary buttons are 32–40px tall with 13–14px labels.
4. **Headline is too large for its measure.** `text-6xl` (60px) inside `max-w-3xl` yields ~3
   words per line over 3 lines. Verified 60px computed.
5. **The page has no substance.** No stats, no dates, no proof, no "what we actually do", no
   reason to believe. A committee portal should lead with the *next event*, not a slogan.
6. `pt-20` equals the 80px nav height exactly — zero breathing room above the badge on mobile.
7. Featured cards are byte-identical to the Events grid, so `/` and `/events` look like the
   same page scrolled to different offsets.

**Redesign direction.** Replace the void with real content: a tight editorial hero (44–52px
headline, left-aligned or centred but with a *measure* of ~20 words/line), an inline
"next event" strip carrying date + venue + seats, a compact stats row sourced from real data
(7 events · 12 members · 4 categories), then Featured as a *differentiated* layout — one lead
card plus two compact rows, not three identical tiles. Full spec in `04-PAGES.md`.

---

### P2 — Events `/events` · **5.0/10**

**Analyse.** Header → `FilterBar` (5 category chips + search) → responsive 1/2/3 card grid →
empty state.

**Critique.**

1. 🔴 **Deep links don't filter — [verified].** Loading `/events?category=Workshop` renders the
   Workshop chip as active *and shows all 7 events*. `FilterBar` seeds its own state from the
   URL (`FilterBar.tsx:15-16`) but `Events.tsx` never applies the URL filter on mount — it
   calls `setFiltered(evs)` unconditionally (`Events.tsx:21`). The shareable-filter feature
   listed in the contract is currently broken. **This is a bug fix, not a feature change.**
2. 🔴 **"Clear filters" desynchronises the UI.** `Events.tsx:106` calls `handleFilter({})`,
   which resets the grid but not `FilterBar`'s internal `selectedCategory`/`searchQuery`, and
   not the URL. Result: chips still show "Workshop" over a grid showing everything.
3. **Search only works on Enter.** It is wrapped in a `<form onSubmit>` with no `onChange`
   filtering, no debounce, no clear button, no result count. Typing does nothing visible.
4. **No result count, no sort, no time structure.** Every event has a date spanning Aug–Oct
   2026 and a `time` field — and `time` is *never rendered*. The primary axis of the data is
   unused. There is no upcoming/past split and no month grouping.
5. **Seven full-width teal Register buttons.** The card's secondary action is styled as the
   loudest element on the page; the grid reads as a wall of buttons.
6. **Two links to the same href per card.** `EventCard.tsx:54` (title) and `:87` (CTA) both
   point at `/register?event=…`. Keyboard users tab the same destination twice per card.
7. **Descriptions are always truncated with no way to read more.** `line-clamp-2` over 200+
   character strings, and there is no event detail route.
8. **Chips are uppercase mono pills** — mono is the "data voice" per the site's own CSS
   comment, misapplied to interactive controls. And because the search input is `flex-1`, its
   width changes as chips wrap: the layout shifts between breakpoints.
9. Half of every card is a generic stock photo (16:9 at ~347px wide).

**Redesign direction.** Keep the grid but make it earn its space: a toolbar with live-filtering
search + result count + segmented category control, month-grouped sections, `time` and seats
surfaced as real metadata, one quiet CTA per card with the whole card as the click target.

---

### P3 — Team `/team` · **3.5/10**

**Critique.**

1. 🔴 **Every card prints the same word twice.** `member.role` renders at `TeamCard.tsx:36`
   and `member.vertical` at `:40` — and in `team.json` these are **identical strings for all
   12 members** ("President"/"President", "Design"/"Design"). The badge is a full-width pill
   restating the line above it. This is the single worst element on the site.
2. **The badge's icon is semantically wrong.** It's a check-in-circle — the universal "verified
   / complete" glyph — used decoratively for a job function.
3. **Photo-dominant, information-poor.** `aspect-square` at 4-up = 260px of stock photography
   per person above one line of bio. Density is near zero.
4. **Ragged card bottoms.** Bios are 1–3 lines inside fixed-height cards; the first row's
   baselines don't align (visible in the screenshot).
5. **Hover states lie.** Cards hover to full-strength `border-accent` and a shadow that
   **doesn't exist** (`--shadow-hover`, A9) — an interactive affordance on a non-interactive
   element that then half-fails.
6. **No structure.** Twelve equal cards, no leadership hierarchy, no grouping by vertical, no
   contact affordance.
7. Content flag (not a design fix): the headshots are Western stock models under Indian names.
   That is a credibility problem the redesign cannot solve — raised in `06-CLEANUP.md`.

**Redesign direction.** Drop the duplicate badge entirely. Group by vertical with section
headers, lead with a 2-person leadership row, then a denser roster (5-up, smaller avatars,
role as the accent line, bio as supporting text). Consider a compact list view — Notion/Linear
would.

---

### P4 — Register `/register` · **4.0/10**

**Critique.**

1. 🔴 **Both `<select>` elements have `appearance: none` and no replacement chevron —
   [verified].** Computed `appearance: none`, `background-image: none`. Two dropdowns that look
   exactly like text inputs. This is a genuine usability defect, not a nit.
2. 🔴 **Errors are teal.** Asterisks, all six field errors, and the server-error banner all use
   `text-accent` / `bg-accent/10`. An alert styled as a success (A3).
3. 🔴 **Raw JSON is shown to users.** `Register.tsx:90` surfaces `err.message`, and
   `api.ts:22` sets that message to the **raw response body**. On a 400 the user literally sees
   `{"error":"Validation failed","issues":[{"path":"email",…}]}`. The API returns perfectly
   structured `issues[]` that map 1:1 onto form fields, and none of it is used.
4. **~1000px of dead space.** A `max-w-md` card centred on a 1440px viewport, with zero context
   about the event being registered for — despite `image`, `date`, `time`, `venue`, and `seats`
   all being loaded into the component already.
5. **Validation only fires on submit.** RHF defaults to `onSubmit`, so the 10-digit phone rule
   is revealed only after the user presses Register.
6. **No character counter** on a field with a hard 400-char limit.
7. **Conflicting sizing:** `min-h-[44px]` on a `py-3.5` button (redundant) and on a `rows={3}`
   textarea (contradictory).
8. **Invisible loading skeleton** — `h-10 bg-background` on `bg-background` (A11).
9. **Thin success state.** Replaces the whole form, echoes only a name and a title, offers a
   single "Browse more events". No date/venue recap, no calendar action, no confirmation-email
   note.
10. `whileHover={{ scale: 1.02 }}` on submit (A6).

**Redesign direction.** Two-column on ≥`lg`: form left, a sticky event summary card right
(image, date+time, venue, seats). Semantic error colour. Map `issues[]` back onto fields via
`setError`. `onTouched` validation. Live counter on notes. Real chevrons. A success state that
recaps the booking.

---

### P5 — 404 `*` · **2.0/10**

**Critique.**

1. 🔴 **The entire page is styled with a deleted palette — [verified].** `App.tsx:40,41,44,49`
   use `#C9A227` (gold), `#F2EDE3` (cream), `#9C948A` (warm grey), `#12100C` (near-black) —
   tokens from a dark/gold theme that no longer exists in `index.css`. The button renders
   mustard-on-white. The headings *appear* correct **only because of bug A1**: their colour
   utilities are silently overridden by the unlayered `h1,h2,h3` rule. Verified — the `h1`
   computes `rgb(17,24,39)`, not `#C9A227`. Fix A1 and this page instantly breaks visually.
2. **Enormous dead space.** The 404 sits inside `main.min-h-screen`, so ~600px of emptiness
   below the button.
3. **No recovery paths.** No links to Events, Team, or Register; no search.
4. **The arrow points the wrong way.** "Back to Home →" is rendered with a **left**-pointing
   arrow, contradicting every other CTA on the site.
5. It is defined inline in `App.tsx` rather than as a page — inconsistent with the other four.

---

### C1 — Navbar · **4.0/10**

1. 🔴 **The hamburger falls off-screen on mobile — [verified].** At 390px CSS width the button's
   right edge computes to **432px against a 406px viewport**, with `scrollWidth` also 406 — so
   the control is clipped and unreachable. Cause: `Navbar.tsx:69` renders
   `"Envision × IT Committee"` at `text-2xl` with `whitespace-nowrap` and no responsive
   truncation, next to two 40px logos. **The mobile menu is currently unusable.**
2. **Three competing brand marks.** Two raster logos of different visual weight plus 24px text
   ≈ a 390px-wide brand block.
3. **Scroll-shrink jitter.** 80px → 72px with `transition-all` reflows the page on every scroll
   past 20px, and the shadow is set *twice* — once in `className`, once in `animate`.
4. Nav links have no hover background and no active indicator beyond a colour change.
5. Drawer a11y gaps (A10): no focus trap, no Escape, no scroll lock, backdrop scoped to the nav.
6. Duplicate logo downloads: Navbar loads `it-comm-logo.png` while Footer loads
   `It%20comm%20logo%20(transparent).png` — **byte-identical files at different URLs**, so the
   1.05 MB image is fetched twice per page view.

---

### C2 — Footer · **3.0/10**

1. **A pull-quote in uppercase mono, in quotation marks** — `"EMPOWERING THE NEXT GENERATION OF
   FOUNDERS"`. Reads as unreplaced placeholder copy.
2. **Zero links.** No navigation, no contact, no social. Critically, the project ships a
   genuinely impressive **Scalar API reference at `/api/docs`** and *nothing on the site links
   to it*.
3. Two more logo images at `h-6 opacity-60` — muddy at that size, and 1.4 MB of PNG for 24px of
   render.
4. `font-[var(--font-sans)]` is redundant (A9).

---

## C. Consolidated defect register

Ordered by severity. ● = functional bug, ○ = design/quality.

| ID | Sev | Type | Defect | Location |
|---|:-:|:-:|---|---|
| D1 | 🔴 | ● | Deep-linked category/search filter never applies **[verified]** | `Events.tsx:18-24` |
| D2 | 🔴 | ● | "Clear filters" desyncs chips, input, and URL from the grid | `Events.tsx:106` |
| D3 | 🔴 | ● | Mobile hamburger clipped off-screen at 390px **[verified]** | `Navbar.tsx:69` |
| D4 | 🔴 | ● | `<select>` has `appearance:none` with no chevron **[verified]** | `Register.tsx:253,351` |
| D5 | 🔴 | ● | Raw JSON error body shown to users | `Register.tsx:90` ← `api.ts:22` |
| D6 | 🔴 | ○ | Unlayered CSS kills all heading colour utilities **[verified]** | `index.css:58` |
| D7 | 🔴 | ○ | Errors/asterisks/alerts rendered in brand teal | `Register.tsx` ×9 |
| D8 | 🔴 | ○ | 404 built on a deleted palette | `App.tsx:36-57` |
| D9 | 🔴 | ○ | Team badge duplicates the role verbatim on all 12 cards | `TeamCard.tsx:40` |
| D10 | 🟠 | ● | `role="list"` children lack `role="listitem"` **[verified]** | `Events.tsx:121`, `Team.tsx:80` |
| D11 | 🟠 | ● | Drawer: no focus trap, Escape, or scroll lock | `Navbar.tsx:122-182` |
| D12 | 🟠 | ● | `--shadow-hover` undefined → dead hover **[verified]** | `TeamCard.tsx:19` |
| D13 | 🟠 | ○ | Home's decorative block is 200px of void + a clock | `Home.tsx:81-99` |
| D14 | 🟠 | ○ | Double animation system on every card | `EventCard.tsx:20` + parents |
| D15 | 🟠 | ○ | Skeletons invisible / wrong size | `Events.tsx:44`, `Team.tsx:36`, `Register.tsx:118` |
| D16 | 🟠 | ○ | Two links to one href per event card | `EventCard.tsx:54,87` |
| D17 | 🟠 | ○ | Three colour syntaxes; five radii; no type/space scale | global |
| D18 | 🟠 | ○ | No dark mode | `index.css:26` |
| D19 | 🟡 | ○ | `"Clash Display"` never loaded **[verified]** | `index.css:16` |
| D20 | 🟡 | ○ | `--max-w` dead; Space Grotesk 500 fetched unused | `index.css:27`, `index.html:15` |
| D21 | 🟡 | ● | No skip link despite `#main-content` target | `App.tsx:27` |
| D22 | 🟡 | ○ | `event.time` in data, never displayed | `EventCard.tsx` |
| D23 | 🟡 | ○ | `/api/docs` shipped but linked nowhere | `Footer.tsx` |
| D24 | 🟡 | ○ | Same logo fetched twice per pageview under two URLs | `Navbar.tsx` vs `Footer.tsx` |
| D25 | 🟡 | ○ | 12.3 MB of unreferenced assets shipped to production | `public/` — see `06-CLEANUP.md` |

> **On D1–D5, D10–D12, D21:** these are *repairs to stated intent*, not changes in
> functionality. The contract in `00-ARCHITECTURE.md` explicitly requires
> `/events?category=…&q=…` to work. Fixing them is in scope; inventing new behaviour is not.

---

## D. Target scores after redesign

| Surface | Now | Target | Gate |
|---|:-:|:-:|---|
| Home | 4.0 | **9.3** | Zero decorative filler; every block carries real data |
| Events | 5.0 | **9.4** | D1/D2 fixed; live search + count + month grouping; one CTA/card |
| Team | 3.5 | **9.2** | Duplicate badge gone; grouped; ≥5-up density |
| Register | 4.0 | **9.5** | Event summary panel; semantic errors; `issues[]` mapped; real chevrons |
| 404 | 2.0 | **9.0** | Tokenised; useful recovery links; correctly sized |
| Navbar | 4.0 | **9.3** | Responsive down to 320px; accessible drawer; single brand mark |
| Footer | 3.0 | **9.0** | Real link columns incl. `/api/docs` |
| Design system | 2.5 | **9.5** | Layered CSS, one syntax, full scales, dark mode |

Acceptance criteria per page are in `04-PAGES.md`; the verification procedure is in
`05-EXECUTION.md § Definition of Done`.
