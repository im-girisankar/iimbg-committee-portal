# 06 — Cleanup Manifest

Every item below was **verified** by walking `public/` file-by-file and cross-referencing every
path against `src/**`, `index.html`, `api/**`, and `src/data/*.json` — including URL-encoded
forms — and by MD5-comparing suspected duplicates. Nothing here is a guess.

Executed in **Phase 7** (`05-EXECUTION.md`), after the redesign, so nothing is deleted while
still referenced.

---

## 0. 🚫 Explicitly out of scope — do not touch

| Path | What it is |
|---|---|
| `submissions/` | Coursework deliverables — PDFs, task sheets, auditorium/classroom photography, handoff notes |
| `pr-vertical/` | A separate PR-vertical assignment — decks, content, rendered PDFs |
| `docs/design/` | This documentation |
| `.claude/` | Local Claude Code skills |

These are unrelated to the application. They are untracked and contain original work. **They
are never deleted, moved, or modified by any phase of this project.**

---

## 1. Unreferenced assets — 124 files, 12,892,856 bytes (12.30 MB)

`public/` holds **148 files / 16.14 MB**, of which only **24 files / 3.84 MB** are referenced.
Vite has no `publicDir` override, so it copies **all** of `public/` verbatim into `dist/` —
confirmed: the current `dist/` is ~17 MB. **76% of what ships is dead weight.**

### 1a. Two scraped WordPress site dumps — 106 files, 10,291,276 bytes

```
public/images/Logos/E-Cell _ Indian Institute of Management Bodh Gaya_files/   (52 files)
public/images/Logos/E-Cell _ Indian Institute of Management Bodh Gaya.html
public/images/team/E-Cell _ Indian Institute of Management Bodh Gaya_files/    (52 files)
public/images/team/E-Cell _ Indian Institute of Management Bodh Gaya.html
```

The two `_files/` directories are **byte-for-byte identical** (`diff -rq` clean). Contents are a
raw *Save Page As* of the public E-Cell WordPress site: `wp-emoji-release.min.js.download`,
`dashicons.min.css`, a 153 KB `style.css`, a 490 KB file literally named `js`, a Google-Fonts
`css2` response, emoji SVGs, and unrelated event photography (`yes-2023-banner.png` 900 KB,
`IIC-Cal-953x1536-1.png` 1.13 MB). Nothing references any of it; no route serves the `.html`.

**~61% of `public/`. Zero risk.**

### 1b. Orphaned first-generation event images — 7 files, 828,978 bytes

```
public/images/events/av-workshop-08.jpg           130,887
public/images/events/cto-fireside-08.jpg          116,548   (= demo-day.jpg, MD5 match)
public/images/events/data-dash-hackathon-09.jpg    92,833   (= innovation-lab.jpg, MD5 match)
public/images/events/gaming-night-08.jpg           86,540
public/images/events/infra-deepdive-09.jpg        106,930
public/images/events/orientation-support-08.jpg   101,329
public/images/events/tech-tuesday-genai-08.jpg    193,911
```

Produced by `scripts/download-images.mjs` against an events list that `events.json` no longer
uses. Two are duplicate Unsplash photos already shipping under their current names.

### 1c. Duplicate logos — 3 files, 1,764,918 bytes

MD5-confirmed. Each logo currently exists in **three** places:

| MD5 | Bytes | Copies |
|---|---:|---|
| `de229da9…` | 372,110 | `Logos/College logo (transparent).png` *(Footer)* · `Logos/college-logo.png` *(Navbar)* · `team/College logo (transparent).png` ✗ |
| `5b3da5c3…` | 1,078,265 | `Logos/It comm logo (transparent).png` *(Footer)* · `Logos/it-comm-logo.png` *(Navbar)* · `team/It comm logo (transparent).png` ✗ |
| `7f44e778…` | 314,543 | `Logos/logo big.png` ✗ · `Logos/_files/cropped-iimbg_Logo_2026.png` ✗ |

Delete: `public/images/team/College logo (transparent).png`,
`public/images/team/It comm logo (transparent).png`, `public/images/Logos/logo big.png`.

> **Separate, and worth doing regardless (D24):** the space-named and hyphen-named files are
> *the same bytes at different URLs*, so Navbar and Footer each trigger their own download —
> the 1.05 MB IT-committee logo is fetched **twice per page view**. Phase 2 consolidates both
> surfaces onto one filename each. That is a ~1.4 MB per-pageview saving independent of any
> deletion.

### 1d. Placeholder SVGs — 7 files, 2,653 bytes

`public/images/events/{av-bootcamp,data-dash,fireside,gaming-night,infra-deepdive,orientation,tech-tuesday}.svg`
— all seven are byte-identical 379-byte copies of one generic placeholder. They appear only as
inert fixture strings in `tests/events.test.ts` (never resolved to disk), so deleting them
cannot fail the suite.

### 1e. Unused icon sprite — 1 file, 5,031 bytes

`public/icons.svg` — never imported, never `<use>`d. Superseded by `lucide-react`.

### Command

```bash
cd public/images
rm -rf "Logos/E-Cell _ Indian Institute of Management Bodh Gaya_files" \
       "Logos/E-Cell _ Indian Institute of Management Bodh Gaya.html" \
       "team/E-Cell _ Indian Institute of Management Bodh Gaya_files" \
       "team/E-Cell _ Indian Institute of Management Bodh Gaya.html"
rm -f events/*-08.jpg events/*-09.jpg events/*.svg
rm -f "team/College logo (transparent).png" "team/It comm logo (transparent).png" "Logos/logo big.png"
cd .. && rm -f icons.svg
```

Then confirm all 24 survivors are intact:

```bash
# expect: 7 event jpgs, 12 member jpgs, 4 logos, favicon set, manifest
find public -type f | sort
```

---

## 2. Dead code in `src/`

| Item | Location | Action | Risk |
|---|---|---|:-:|
| `registrationRequestSchema` | `lib/schemas.ts:51` | delete — a pure alias of `registrationSchema` with **zero** references repo-wide | none |
| `programSchema` | `lib/schemas.ts:21` | drop the `export` keyword; used only inside its own file | none |
| `RegistrationResult` | `lib/api.ts:55` | drop the `export` keyword; used only inside its own file | none |
| `NotFound` | `App.tsx:36-57` | extracted to `pages/NotFound.tsx` in Phase 2 | — |
| `components/EventCard.tsx` | | superseded by `components/app/event-card.tsx` | — |
| `components/TeamCard.tsx` | | superseded | — |
| `components/FilterBar.tsx` | | superseded by `events-toolbar.tsx` | — |
| `components/Navbar.tsx` | | superseded | — |
| `components/Footer.tsx` | | superseded | — |

> ⚠️ `schemas.ts` is frozen by the contract. Removing an export that has **zero references**
> changes no validation and no type in use — but if there is any doubt, **skip §2 rows 1–3
> entirely.** They cost nothing to leave in place. Never touch the schema *definitions*.

**No re-export shims.** Move the file, update imports, delete the original.

---

## 3. Dead CSS and fonts

All resolved by replacing `index.css` wholesale in Phase 0.

| Item | Problem |
|---|---|
| `--max-w: 1120px` | defined, never read — pages hardcode `max-w-[1120px]`. Replaced by `.container-page`. |
| `--shadow-hover` | **used** at `TeamCard.tsx:19`, **defined nowhere** → hover elevation never worked. Deleted rather than fixed (§4.3 of the design system bans card shadows). |
| `--radius-xl: 1rem` | silently overrides Tailwind's stock `rounded-xl`, making `rounded-xl` and `rounded-2xl` both 16px. |
| `"Clash Display"` | first family in `--font-display`, **never loaded** anywhere. Anyone with it installed locally sees a different site. |
| Space Grotesk 500 | fetched by `index.html`, requested by no class. |
| Space Grotesk (all) | dropped — one variable Inter axis replaces three static families. |
| `.mono` | unlayered class that silently overrides `text-xs` and colour utilities. Replaced by explicit `font-mono` + a size utility. |
| `.animate-fade-up` | replaced by `.animate-enter` (4px travel, not 12px). |
| `h1,h2,h3 {}` unlayered | **the cascade bug (D6)** — moved into `@layer base`. |

---

## 4. Favicon and app icons — ✅ already done

The previous `public/favicon.svg` was a 9,522-byte stock mark: a purple chevron over sixteen
blurred `<ellipse>` elements behind fifteen `feGaussianBlur` filters. It matched nothing in the
brand, was the heaviest kind of SVG a browser can rasterise at 16px, and appears to have been
lifted from an unrelated product.

**Replaced with a custom mark: a Bodhi leaf.** Bodh Gaya is the site of the Bodhi tree, so the
leaf is specific to *this* institution rather than a generic startup glyph — and it reduces to a
readable silhouette at 16px, which a wordmark or a monogram would not. White leaf with a
negative-space midrib on a `#0F766E` squircle; the solid background means it holds on both light
and dark browser chrome. Verified by rendering at 16 / 24 / 32 / 64 / 128px against white and
`#09090B`.

| File | Purpose | Size |
|---|---|---:|
| `public/favicon.svg` | primary icon, all modern browsers | 422 B |
| `public/icon-mono.svg` | flat silhouette for Safari pinned tabs | 217 B |
| `public/apple-touch-icon.png` | 180×180 iOS home screen | 4.9 KB |
| `public/icon-192.png` · `icon-512.png` | PWA / Android | 5.2 / 14.8 KB |
| `public/site.webmanifest` | name, theme colour `#0F766E` | 488 B |
| `public/favicon-old-stock.svg` | the old mark, parked for review | 9.5 KB |

**Remaining work — Phase 0 or 7**, in `index.html`:

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="mask-icon" href="/icon-mono.svg" color="#0F766E" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
<meta name="theme-color" content="#0F766E" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#09090B" media="(prefers-color-scheme: dark)" />
```

Then `rm public/favicon-old-stock.svg` once you have confirmed you don't want it.

---

## 5. Dependencies

### Remove

| Package | Why |
|---|---|
| `framer-motion` | ~110 kB for fade-ups that CSS does better (`02 § 6`). Phase 7. |
| `pdf-lib` | devDependency, **zero** imports in `src/`, `api/`, `scripts/`, `tests/` |
| `pdf-parse` | same |

```bash
npm rm framer-motion pdf-lib pdf-parse
```

### Add (Phase 0)

`clsx` · `tailwind-merge` · `class-variance-authority` · `lucide-react` ·
`@radix-ui/react-slot` · `@radix-ui/react-dialog` — ≈30 kB gzipped total.

**Net bundle change: roughly −80 kB gzipped**, plus ~12 MB off the deployed asset payload.

### Decide

`@testing-library/react`, `@testing-library/jest-dom`, and `jsdom` are installed but **nothing
imports them**, and no jsdom environment is configured — there is no component-level test
coverage at all. Two honest options:

1. **Keep and use them.** Add a `vitest.config.ts` with `environment: "jsdom"` and write a
   handful of component tests (Events filter/URL sync, Register error mapping, drawer a11y).
   Given Phase 3 and Phase 5 both fix real bugs, tests there would have caught them.
2. **Remove them** and accept that the redesign has no safety net beyond the 42 logic tests.

Recommendation: **option 1, scoped to Events and Register only.** Those two pages carry all
five functional bugs.

---

## 6. Scripts

| File | Status | Action |
|---|---|---|
| `scripts/download-images.mjs` | **superseded** — it is the origin of the orphaned `*-08`/`*-09` images | delete |
| `scripts/download-new-events.mjs` | produces the 7 images `events.json` actually uses | keep as provenance; add `"assets:events"` npm script |
| `scripts/download-team-headshots.mjs` | produces `member-1…12.jpg` | keep; add `"assets:team"` npm script |
| `shots.mjs` | Playwright screenshots; hardcodes `C:/Users/GIRI/...` and writes into `submissions/` | move to `scripts/`, make the output path a CLI argument, add `"shots"` npm script |

None of the four is referenced by any npm script today, so they are invisible to anyone new.

---

## 7. Content flags — not design problems, raised for a decision

Neither is fixed by this redesign. Both are the owner's call.

1. **`public/images/team/member-*.jpg` are Western stock headshots** attached to Indian names
   (Arjun Patel, Priya Sharma, Rohit Kumar…). This is a credibility risk on a real committee
   portal — a visitor who recognises the stock photos will distrust everything else on the page.
   The redesign shrinks avatars from 260px to 56px, which reduces the exposure, but the honest
   fix is real photographs or generated initial-avatars.
2. **`team.json` sets `vertical` identical to `role` for all 12 members.** Phase 4 repurposes
   `vertical` as the grouping key, which works with the current data but produces 12 groups of
   one. **If `vertical` is meant to be a broader category** (e.g. Leadership / Growth /
   Operations / Brand), populating it properly would make the Team page substantially better.
   The redesign does not invent that content — it reads whatever is in the file.

---

## 8. Expected end state

| Metric | Before | After |
|---|---:|---:|
| Files in `public/` | 148 | 24 + 6 icon files |
| `public/` size | 16.14 MB | ~3.85 MB |
| `dist/` size | ~17 MB | < 5 MB |
| Logo bytes per page view | ~2.8 MB (duplicated) | ~1.4 MB (single URL each) |
| JS dependencies | framer-motion + 10 | −framer-motion, +6 small |
| Fonts loaded | 3 families, 7 static weights | 1 variable + 1 mono |
| Broken CSS tokens | 2 (`--shadow-hover`, `--max-w`) | 0 |
| Phantom font families | 1 (`Clash Display`) | 0 |
| Dead exports | 3 | 0 |
| Tests passing | 42 | 42 (+ optional new) |
