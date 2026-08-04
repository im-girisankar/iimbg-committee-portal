# 02 — The Design System

Codename **Bodhi**. One system, one syntax, two themes.

Governing idea: **neutral-dominant, border-defined, type-led.** Colour is used for meaning,
never for decoration. Elevation is used for layering, never for emphasis. Motion is used for
state change, never for arrival.

Ten rules that make everything else fall out:

1. Surfaces are separated by **1px alpha borders**, not shadows.
2. **Static cards cast no shadow.** Shadows belong to floating layers only.
3. **Corner radius never exceeds 12px.** Cards are 8px.
4. **Base UI text is 14px.** Prose is 15px. Nothing on a page is 60px.
5. **One accent colour.** Everything else is neutral until it means something.
6. **Semantic colour is reserved** — red means error, green means success. Never decorative.
7. **Controls are 32px tall by default**, 36px for inputs. Never 44px+ on a pointer device.
8. **Transitions are 120–160ms.** Nothing animates on mount.
9. **Every interactive element has a visible hover, active, and focus state**, and they are
   defined once, globally.
10. **Every token has a dark-mode counterpart.** No exceptions, no hardcoded hex in components.

---

## 1. Colour

### 1.1 Philosophy

The current palette fails because it has one accent and no semantics (`01-AUDIT.md` A3). Bodhi
splits colour into four tiers with strict rules about who may use which.

| Tier | Purpose | Who may use it |
|---|---|---|
| **Neutral** | 95% of the interface — surfaces, text, borders | everything |
| **Brand** | primary action, active nav, links | one primary action per view |
| **Semantic** | error / success / warning / info | only when it means that |
| **Category** | 6px dots distinguishing event categories | badges only, never as fills |

### 1.2 Neutral ramp

Values are chosen with a very slight cool cast, like Linear and Vercel, so photography sits
naturally on them. Borders are **alpha**, not solid grey — this is what makes hairlines look
right over both white surfaces and images.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#FFFFFF` | `#09090B` | page canvas |
| `--bg-subtle` | `#FAFAFA` | `#0E0E11` | recessed areas, table stripes |
| `--bg-muted` | `#F4F4F5` | `#18181B` | input fill, skeletons, hover fill |
| `--bg-inset` | `#EFEFF1` | `#212124` | pressed states, code blocks |
| `--surface` | `#FFFFFF` | `#111114` | cards, panels, popovers |
| `--surface-hover` | `#FAFAFA` | `#17171B` | card/row hover |
| `--border` | `rgb(9 9 11 / 0.08)` | `rgb(255 255 255 / 0.10)` | default hairline |
| `--border-strong` | `rgb(9 9 11 / 0.14)` | `rgb(255 255 255 / 0.16)` | input borders, dividers under load |
| `--fg` | `#18181B` | `#FAFAFA` | primary text, headings |
| `--fg-muted` | `#52525B` | `#A1A1AA` | body prose, secondary text |
| `--fg-subtle` | `#71717A` | `#8B8B93` | metadata, captions, placeholders |
| `--fg-faint` | `#A1A1AA` | `#5E5E66` | disabled text, decorative icons |

Contrast (verify with the script in §10):
`--fg` on `--bg` = **16.1 : 1** · `--fg-muted` on `--bg` = **7.6 : 1** ·
`--fg-subtle` on `--bg` = **5.4 : 1** — all pass AA for normal text.
`--fg-faint` is **2.8 : 1** and is therefore permitted **only** on disabled controls and
decorative glyphs, never on readable text.

### 1.3 Brand

Continuity is kept with the existing teal so the committee's identity is not thrown away — but
it is now tuned to a role-based set instead of one value used for nine different jobs.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--brand` | `#0F766E` | `#0F766E` | primary button fill, active states |
| `--brand-hover` | `#0C5F58` | `#12857C` | primary button hover |
| `--brand-active` | `#094C47` | `#0C5F58` | primary button pressed |
| `--brand-fg` | `#FFFFFF` | `#FFFFFF` | text on brand fill |
| `--brand-text` | `#0F766E` | `#2DD4BF` | links, active nav label |
| `--brand-subtle` | `#F0FAF8` | `rgb(45 212 191 / 0.10)` | tint backgrounds |
| `--brand-border` | `rgb(15 118 110 / 0.24)` | `rgb(45 212 191 / 0.24)` | tinted borders |
| `--ring` | `rgb(15 118 110 / 0.55)` | `rgb(45 212 191 / 0.55)` | focus ring |

`--brand-fg` on `--brand` = **4.9 : 1** ✓ · `--brand-text` on `--bg` = 4.9 : 1 (light),
10.2 : 1 (dark) ✓.

> **Rule:** brand fill appears **at most once per viewport**. If two things are teal, one of
> them is wrong.

### 1.4 Semantic

| Role | Light text | Dark text | Light tint bg | Dark tint bg | Border |
|---|---|---|---|---|---|
| danger | `#C81E1E` | `#F87171` | `#FEF2F2` | `rgb(248 113 113 / .10)` | `rgb(200 30 30 / .24)` |
| success | `#15803D` | `#4ADE80` | `#F0FDF4` | `rgb(74 222 128 / .10)` | `rgb(21 128 61 / .24)` |
| warning | `#B45309` | `#FBBF24` | `#FFFBEB` | `rgb(251 191 36 / .10)` | `rgb(180 83 9 / .24)` |
| info | `#1D4ED8` | `#60A5FA` | `#EFF6FF` | `rgb(96 165 250 / .10)` | `rgb(29 78 216 / .24)` |

All four pass AA on their own backgrounds in both themes.

**This directly fixes D7.** Every asterisk, field error, and error banner moves to `danger`.

### 1.5 Category dots

Categories are distinguished by a **6px dot** beside a neutral label — never by a coloured
pill. This keeps a 7-card grid calm while remaining scannable, and it degrades gracefully for
colour-blind users because the text label is always present.

| Category | Dot |
|---|---|
| Workshop | `#0F766E` |
| Competition | `#D97706` |
| Speaker Session | `#4F46E5` |
| Social | `#E11D48` |

Add nothing here without adding it to `CATEGORIES` in `schemas.ts` — which the contract forbids.
Therefore this table is closed.

---

## 2. Typography

### 2.1 Families — one, plus data

**Drop Space Grotesk and "Clash Display" entirely** (`01-AUDIT.md` A9/D19). Space Grotesk's
quirky geometry reads "startup blog"; every reference product in the brief runs a single
neutral grotesque. Inter Variable at tight tracking is what produces the premium feel.

```
--font-sans: "InterVariable", "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;
--font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
```

`index.html` link becomes exactly:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400..700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

One variable axis replaces three static families — fewer bytes, and it removes the unused
Space Grotesk 500 (D20).

Enable Inter's better defaults globally:
`font-feature-settings: "cv02","cv03","cv04","cv11";` and `font-variant-numeric: tabular-nums`
on anything numeric (dates, seat counts, IDs).

### 2.2 Scale

Base 16px. **UI chrome is 14px; prose is 15px.** Nothing is 60px.

| Token | Size | Line-height | Tracking | Weight | Use |
|---|---|---|---|---|---|
| `text-display` | 44px / 2.75rem | 1.05 | −0.032em | 600 | one per page, hero only |
| `text-title-1` | 32px | 1.15 | −0.026em | 600 | page `h1` |
| `text-title-2` | 24px | 1.25 | −0.02em | 600 | section `h2` |
| `text-title-3` | 18px | 1.35 | −0.014em | 600 | card `h3` |
| `text-title-4` | 15px | 1.4 | −0.008em | 600 | dense headers, form legends |
| `text-prose` | 15px | 1.6 | 0 | 400 | body copy, descriptions |
| `text-ui` | 14px | 1.45 | 0 | 400 | **default** — nav, table cells, inputs |
| `text-label` | 13px | 1.4 | 0 | 500 | form labels, buttons, badges |
| `text-caption` | 12px | 1.4 | 0 | 400 | metadata, helper text |
| `text-micro` | 11px | 1.3 | 0.04em | 500 | uppercase eyebrows — **rationed** |

Responsive: `text-display` steps 32 → 40 → 44px at `sm` / `md`. `text-title-1` steps 26 → 32px.

### 2.3 Rules

- **Maximum two type sizes per component.** A card with a title, a description, and metadata
  uses `title-3` + `prose` + `caption` — that is the ceiling.
- **Measure is 60–75 characters.** Prose blocks get `max-w-[65ch]`. The current hero at
  `text-6xl` inside `max-w-3xl` gives ~22 characters per line — three times too narrow.
- **Uppercase is rationed** to `text-micro` eyebrows, at most one per section. The current
  design puts uppercase mono on chips, dates, venues, seat counts, team badges and the footer
  quote simultaneously.
- **Mono is for data only** — dates, times, seat counts, IDs, code. Never for buttons, never
  for navigation, never for a pull-quote.
- Headings never use colour utilities to differ from `--fg` unless semantically required.

---

## 3. Space

4px base unit. Use **only** this subset — it is deliberately sparse.

`0 · 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96`
(Tailwind: `0 1 2 3 4 5 6 8 10 12 16 20 24`)

| Context | Value |
|---|---|
| Icon ↔ label | 6–8px |
| Inside a badge | 8px h / 2px v |
| Inside a control | 12px h (sm), 14px h (md) |
| Card padding | 16px (compact) / 20px (default) |
| Grid gap | 16px mobile, 20px desktop |
| Stack gap inside a card | 8px |
| Between form fields | 20px |
| Between sections | 48px mobile, 64px desktop |
| Page top padding (below nav) | 40px mobile, 56px desktop |
| Page bottom padding | 64px / 96px |

**Container:** `--container: 1120px`. Gutters 16 / 24 / 32px at base / `sm` / `lg`.
This finally gives `--max-w` a job (D20) — but expose it as a `.container-page` utility so
pages stop hardcoding `max-w-[1120px]`.

**Nav offset:** the navbar becomes a fixed 56px with **no scroll-shrink** (C1.3). Expose
`--nav-h: 56px` and have the layout apply `padding-top: var(--nav-h)` **once**, in `Layout`.
Pages must never hardcode `pt-24` again.

---

## 4. Radius, border, elevation

### 4.1 Radius

| Token | px | Use |
|---|---|---|
| `--radius-xs` | 4 | dots, tags, tiny chips |
| `--radius-sm` | 6 | buttons, inputs, selects, segmented items |
| `--radius-md` | 8 | **cards, panels, images inside cards** |
| `--radius-lg` | 12 | drawers, modals, popovers |
| `--radius-full` | 9999 | avatars and status dots **only** |

**Ceiling is 12px.** Delete `--radius-xl: 1rem` from `index.css` — it silently redefines a
stock Tailwind value and makes `rounded-xl` and `rounded-2xl` both render 16px (D17).

Nested radius: a child inside an 8px container uses 6px, never 8px.

### 4.2 Borders

Always `1px solid var(--border)`. Never a solid grey hex — alpha borders sit correctly on
white surfaces, on `--bg-muted`, and over photographs, which is precisely why Linear and Vercel
use them.

Dividers inside a card use `--border`; the card's own outline uses `--border`; an input at rest
uses `--border-strong` so it reads as an affordance rather than a container.

### 4.3 Elevation — the strict rule

| Level | Shadow | Applies to |
|---|---|---|
| 0 | `none` (the 1px border **is** the elevation) | **all static cards, all panels, the navbar** |
| 1 | `0 4px 12px -2px rgb(24 24 27 / .08), 0 1px 3px rgb(24 24 27 / .05)` | popovers, dropdowns, tooltips |
| 2 | `0 12px 32px -8px rgb(24 24 27 / .12), 0 2px 8px -2px rgb(24 24 27 / .06)` | drawers, modals, toasts |

Two details, both calibrated against shipped values (§11):

- **Shadow colour is tinted ink at low alpha, never pure black.** Resting alpha never exceeds
  12%. Stripe uses `rgb(64 68 82 / 8%)`; Primer's resting shadows sit at 4–10%.
- In dark mode shadows are nearly invisible; layering is carried by `--surface` being lighter
  than `--bg`, plus the border. Level 1/2 in dark use the same geometry at `.45` alpha.

**Consequences:** `--shadow-soft` and `--shadow-card` are deleted. `--shadow-hover` (D12)
ceases to exist rather than being fixed.

### 4.4 Hover — a fill change, and nothing else

> This is the single most-copied detail from the reference set, and the easiest to get wrong.

**Hovering a card or a row changes its background fill. It does not change the border, does not
add a shadow, and does not move.**

| Do | Don't |
|---|---|
| `--surface` → `--surface-hover` | change `border-color` |
| ≤120ms, `--ease` | add or grow a shadow |
| icons/links inside may go `--fg-muted` → `--fg` | `scale`, `translate`, or `rotate` |

Verified across all six references: Linear steps a 3% → 7% white fill; Vercel defines
`gray-100` as "hover background"; Notion uses a 6% ink fill at **20ms**; Primer swaps to
`bgColor-muted`. Not one of them outlines, elevates, or transforms a row on hover.

The fill deltas are deliberately small — `#FFFFFF → #FAFAFA` light, `#111114 → #17171B` dark.
If a hover state is obvious in a screenshot, it is too strong.

---

## 5. Controls

### 5.1 Heights and hit targets

| Size | Height | Padding-x | Text | Use |
|---|---|---|---|---|
| `sm` | 28px | 10px | `label` 13px | table row actions, chips |
| `md` | 32px | 12px | `label` 13px | **default** |
| `lg` | 36px | 14px | `ui` 14px | form submit, primary page action |
| `xl` | 40px | 18px | `ui` 14px | hero CTA **only** |

Inputs, selects, and textareas: **36px** (`lg`) so form fields feel comfortable while buttons
stay tight.

**Touch targets without oversized buttons** — this is how we satisfy WCAG 2.5.8 without the
`min-h-[44px]` blobs the brief bans:

```css
@media (pointer: coarse) {
  :where(button, a[role="button"], [role="tab"], .control) { min-block-size: 44px; }
}
```

Visual height stays 32–36px on pointer devices; touch devices get the legal target.

### 5.2 States — defined once, for everything

| State | Treatment |
|---|---|
| hover | background steps one level (`--surface` → `--surface-hover`); ≤120ms; **fill only** (§4.4) |
| active | background steps to `--bg-inset`; **no transform, no scale** |
| focus-visible | `outline: 2px solid var(--ring); outline-offset: 2px` — global, never overridden. Inside an `overflow-hidden` parent use `outline-offset: -2px` so the ring renders inside the box and cannot be clipped or shift layout (Primer's technique). |
| disabled | `opacity: .5; cursor: not-allowed; pointer-events: none` on the inner content |
| loading | label swaps for a spinner; **width is preserved** so nothing reflows |
| invalid | `border-color: var(--danger-border)`, message below in `--danger` |

Buttons never scale on hover. Remove every `whileHover={{ scale }}` (A6).

### 5.3 Button variants

| Variant | Fill | Border | Text | When |
|---|---|---|---|---|
| `primary` | `--brand` | none | `--brand-fg` | one per view |
| `secondary` | `--surface` | `--border-strong` | `--fg` | the common case |
| `ghost` | transparent | none | `--fg-muted` → `--fg` | toolbars, nav, icon buttons |
| `danger` | `--danger` | none | white | destructive confirmation only |
| `link` | none | none | `--brand-text`, underline on hover | inline in prose |

---

## 6. Motion

```
--ease:        cubic-bezier(0.2, 0, 0, 1);      /* default, decelerating */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);    /* overlays */
--dur-fast:    120ms;   /* colour, background, border */
--dur:         160ms;   /* default */
--dur-slow:    240ms;   /* drawers, modals */
```

**What may animate**

- hover / active / focus transitions on colour, background, border, opacity
- overlay enter/exit (drawer slide, popover fade+2px rise)
- content *changes* — a filtered grid re-rendering may fade in over 160ms
- skeleton shimmer

**What may not**

- page or section mount. Headings, paragraphs, and CTAs appear instantly.
- staggered entrances longer than 8 items or 20ms apart
- anything with a delay over 80ms
- `scale` on buttons or cards
- `height` — use `grid-template-rows: 0fr → 1fr` or `@starting-style`

**Deletion target: `framer-motion`.** It is a ~110 kB dependency doing fade-ups that six lines
of CSS do better. Phase 6 removes it. Replacement primitive:

```css
@keyframes enter { from { opacity: 0; transform: translateY(4px) } }
.animate-enter { animation: enter var(--dur) var(--ease) both }
```

Note the travel is **4px, not 20px**. Long travel is what makes an interface feel cheap.

Reduced motion is already handled well at `index.css:34-45`; keep that block, move it into
`@layer base`.

---

## 7. Dark mode

Currently non-existent (A7). Implementation:

1. **Custom variant** — Tailwind v4 has no `darkMode` config option:
   ```css
   @custom-variant dark (&:where(.dark, .dark *));
   ```
2. **Token overrides** in `.dark { … }`, per the tables in §1. Components never write
   `dark:` classes for colour — they use semantic tokens that already know both themes.
   `dark:` is permitted only for genuinely theme-specific tweaks (e.g. image opacity).
3. **Three-state preference** — `light` / `dark` / `system`, stored at `bodhi-theme`.
4. **No flash of wrong theme** — a blocking inline script in `<head>`:
   ```html
   <script>try{var t=localStorage.getItem('bodhi-theme')||'system';
   var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme:dark)').matches);
   document.documentElement.classList.toggle('dark',d);
   document.documentElement.style.colorScheme=d?'dark':'light'}catch(e){}</script>
   ```
5. **`color-scheme`** follows the theme so native scrollbars and form controls match.
   Replaces the hardcoded `color-scheme: light` at `index.css:26`.
6. Toggle lives in the navbar as a `ghost` icon button, and in the mobile drawer.

Dark-mode quality checks: photographs get `filter: brightness(.92)` in dark so they don't glare;
borders step up to `.10` alpha because dark surfaces need more separation; brand fill stays
`#0F766E` (white text still passes at 4.9:1) while brand *text* switches to `#2DD4BF`.

---

## 8. Accessibility baseline

Non-negotiable, verified per page in `05-EXECUTION.md`.

- **Contrast** — AA everywhere; `--fg-faint` restricted to disabled/decorative.
- **Focus** — one global `:focus-visible` rule inside `@layer base`. Components must not
  override it. Focus is never removed.
- **Skip link** — a real `<a href="#main-content" class="skip-link">` as the first focusable
  element, visually hidden until focused (fixes D21).
- **Lists** — if a container has `role="list"`, its children carry `role="listitem"`. Better:
  use real `<ul>`/`<li>` and drop the ARIA (fixes D10).
- **Images** — event images are decorative (`alt=""`, the title is adjacent); **team headshots
  get `alt={member.name}`**.
- **Icons** — always `aria-hidden="true"`; icon-only buttons always carry `aria-label`.
- **Forms** — every input has a real `<label for>`; errors use `aria-describedby` +
  `role="alert"`; `aria-invalid` on failure; the error summary receives focus on submit failure.
- **Overlays** — drawer/modal get `role="dialog"`, `aria-modal`, focus trap, Escape to close,
  body scroll lock, and focus restoration to the trigger (fixes D11).
- **Live regions** — search result counts announce via `aria-live="polite"`; the registration
  success panel already uses `role="status"` — keep it.
- **Keyboard** — every interactive element reachable and operable; no positive `tabindex`;
  tab order follows visual order.
- **Motion** — `prefers-reduced-motion: reduce` disables all non-essential animation.
- **Zoom** — usable at 200% zoom and at 320px width with no horizontal scroll (fixes D3).

---

## 9. Drop-in `src/styles/index.css`

This replaces the current file wholesale. **Note every element-level rule is inside
`@layer base`** — that is the fix for A1/D6, the bug that silently disables heading colour
utilities across the whole app.

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

/* ─── Tokens exposed to Tailwind as utilities ─────────────────────── */
@theme {
  /* neutral */
  --color-bg:            #FFFFFF;
  --color-bg-subtle:     #FAFAFA;
  --color-bg-muted:      #F4F4F5;
  --color-bg-inset:      #EFEFF1;
  --color-surface:       #FFFFFF;
  --color-surface-hover: #FAFAFA;
  --color-border:        rgb(9 9 11 / 0.08);
  --color-border-strong: rgb(9 9 11 / 0.14);
  --color-fg:            #18181B;
  --color-fg-muted:      #52525B;
  --color-fg-subtle:     #71717A;
  --color-fg-faint:      #A1A1AA;

  /* brand */
  --color-brand:         #0F766E;
  --color-brand-hover:   #0C5F58;
  --color-brand-active:  #094C47;
  --color-brand-fg:      #FFFFFF;
  --color-brand-text:    #0F766E;
  --color-brand-subtle:  #F0FAF8;
  --color-brand-border:  rgb(15 118 110 / 0.24);

  /* semantic */
  --color-danger:        #C81E1E;
  --color-danger-subtle: #FEF2F2;
  --color-danger-border: rgb(200 30 30 / 0.24);
  --color-success:       #15803D;
  --color-success-subtle:#F0FDF4;
  --color-success-border:rgb(21 128 61 / 0.24);
  --color-warning:       #B45309;
  --color-warning-subtle:#FFFBEB;
  --color-warning-border:rgb(180 83 9 / 0.24);
  --color-info:          #1D4ED8;
  --color-info-subtle:   #EFF6FF;
  --color-info-border:   rgb(29 78 216 / 0.24);

  /* category dots */
  --color-cat-workshop:   #0F766E;
  --color-cat-competition:#D97706;
  --color-cat-speaker:    #4F46E5;
  --color-cat-social:     #E11D48;

  /* type */
  --font-sans: "InterVariable", "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;

  --text-display:    2.75rem;  --text-display--line-height: 1.05;
  --text-display--letter-spacing: -0.032em; --text-display--font-weight: 600;
  --text-title-1:    2rem;     --text-title-1--line-height: 1.15;
  --text-title-1--letter-spacing: -0.026em; --text-title-1--font-weight: 600;
  --text-title-2:    1.5rem;   --text-title-2--line-height: 1.25;
  --text-title-2--letter-spacing: -0.02em;  --text-title-2--font-weight: 600;
  --text-title-3:    1.125rem; --text-title-3--line-height: 1.35;
  --text-title-3--letter-spacing: -0.014em; --text-title-3--font-weight: 600;
  --text-title-4:    0.9375rem;--text-title-4--line-height: 1.4;
  --text-title-4--letter-spacing: -0.008em; --text-title-4--font-weight: 600;
  --text-prose:      0.9375rem;--text-prose--line-height: 1.6;
  --text-ui:         0.875rem; --text-ui--line-height: 1.45;
  --text-label:      0.8125rem;--text-label--line-height: 1.4;
  --text-label--font-weight: 500;
  --text-caption:    0.75rem;  --text-caption--line-height: 1.4;
  --text-micro:      0.6875rem;--text-micro--line-height: 1.3;
  --text-micro--letter-spacing: 0.04em; --text-micro--font-weight: 500;

  /* radius — ceiling is 12px */
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* elevation — floating layers only. Tinted ink, resting alpha never > 12%. */
  --shadow-popover: 0 4px 12px -2px rgb(24 24 27 / .08), 0 1px 3px rgb(24 24 27 / .05);
  --shadow-overlay: 0 12px 32px -8px rgb(24 24 27 / .12), 0 2px 8px -2px rgb(24 24 27 / .06);

  /* motion */
  --ease:        cubic-bezier(0.2, 0, 0, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --dur-fast: 120ms;
  --dur:      160ms;
  --dur-slow: 240ms;
}

/* ─── Dark theme ──────────────────────────────────────────────────── */
.dark {
  --color-bg:            #09090B;
  --color-bg-subtle:     #0E0E11;
  --color-bg-muted:      #18181B;
  --color-bg-inset:      #212124;
  --color-surface:       #111114;
  --color-surface-hover: #17171B;
  --color-border:        rgb(255 255 255 / 0.10);
  --color-border-strong: rgb(255 255 255 / 0.16);
  --color-fg:            #FAFAFA;
  --color-fg-muted:      #A1A1AA;
  --color-fg-subtle:     #8B8B93;
  --color-fg-faint:      #5E5E66;

  --color-brand-hover:   #12857C;
  --color-brand-active:  #0C5F58;
  --color-brand-text:    #2DD4BF;
  --color-brand-subtle:  rgb(45 212 191 / 0.10);
  --color-brand-border:  rgb(45 212 191 / 0.24);

  --color-danger:        #F87171;
  --color-danger-subtle: rgb(248 113 113 / 0.10);
  --color-success:       #4ADE80;
  --color-success-subtle:rgb(74 222 128 / 0.10);
  --color-warning:       #FBBF24;
  --color-warning-subtle:rgb(251 191 36 / 0.10);
  --color-info:          #60A5FA;
  --color-info-subtle:   rgb(96 165 250 / 0.10);

  --shadow-popover: 0 4px 12px -2px rgb(0 0 0 / .45), 0 1px 3px rgb(0 0 0 / .30);
  --shadow-overlay: 0 12px 32px -8px rgb(0 0 0 / .55), 0 2px 8px -2px rgb(0 0 0 / .35);
}

/* ─── Base — EVERY element rule lives in this layer ───────────────── */
@layer base {
  :root {
    --ring: rgb(15 118 110 / 0.55);
    --container: 1120px;
    --nav-h: 56px;
  }
  .dark { --ring: rgb(45 212 191 / 0.55); }

  * { border-color: var(--color-border); }

  html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }

  body {
    margin: 0;
    background: var(--color-bg);
    color: var(--color-fg);
    font-family: var(--font-sans);
    font-size: var(--text-ui);
    line-height: 1.45;
    font-feature-settings: "cv02","cv03","cv04","cv11";
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Headings inherit colour — utilities must be able to win. */
  h1, h2, h3, h4 { font-weight: 600; letter-spacing: -0.02em; margin: 0; }

  :where(a, button, input, select, textarea, summary, [tabindex]):focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
    border-radius: var(--radius-xs);
  }

  ::selection { background: var(--color-brand-subtle); color: var(--color-fg); }

  ::placeholder { color: var(--color-fg-subtle); }

  @media (pointer: coarse) {
    :where(button, a[role="button"], [role="tab"]) { min-block-size: 44px; }
  }

  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    *, *::before, *::after {
      animation-duration: .001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: .001ms !important;
      scroll-behavior: auto !important;
    }
  }
}

/* ─── Reusable utilities ──────────────────────────────────────────── */
@utility container-page {
  margin-inline: auto;
  max-inline-size: var(--container);
  padding-inline: 1rem;
  @media (width >= 640px) { padding-inline: 1.5rem; }
  @media (width >= 1024px) { padding-inline: 2rem; }
}

@utility numeric { font-variant-numeric: tabular-nums; }

@utility skip-link {
  position: absolute;
  inset-inline-start: 1rem;
  inset-block-start: -100%;
  z-index: 100;
  padding: .5rem .75rem;
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  box-shadow: var(--shadow-popover);
  font-size: var(--text-label);
  &:focus { inset-block-start: 1rem; }
}

@keyframes enter { from { opacity: 0; transform: translateY(4px); } }
@utility animate-enter { animation: enter var(--dur) var(--ease) both; }

@keyframes shimmer { 100% { transform: translateX(100%); } }
```

Anything that was in the old file and is not here — `--color-primary`, `--color-secondary`,
`--color-accent`, `--color-accent-secondary`, `--radius-xl`, `--shadow-soft`, `--shadow-card`,
`--max-w`, `.mono`, `.animate-fade-up`, `"Clash Display"` — is **deleted on purpose**.

---

## 10. Verification

Run before declaring any phase done.

```bash
# no legacy tokens survive
rg -n "color-primary|color-secondary|color-accent|shadow-soft|shadow-card|shadow-hover|Clash Display|max-w-\[1120px\]|\.mono" src/

# no raw hex in components
rg -n "#[0-9A-Fa-f]{6}" src/components src/pages src/App.tsx

# no arbitrary var() colour syntax
rg -n "\[var\(--color-" src/

# no oversized radii
rg -n "rounded-(2xl|3xl|\[1[6-9]px\]|\[2[0-9]px\])" src/

# no mount animation / scale-on-hover left behind
rg -n "whileHover|animate-fade-up|delay: 0\.[3-9]" src/
```

Each must return **zero matches**. Contrast is checked page-by-page with the axe/Lighthouse
steps in `05-EXECUTION.md § Definition of Done`.

---

## 11. Calibration against the reference set

Bodhi's numbers were checked against **values read out of the shipped CSS** of the reference
products — Primer's published `@primer/primitives` tokens, Vercel's `--ds-*` / `--geist-*`
chunks, Linear's `--radius-*` / `--speed-*` token file, Stripe's Sail tokens on
`docs.stripe.com`, and Notion's bundled literals. Raycast is observation only.

Nothing below is copied. It is used to confirm Bodhi sits inside the band every one of these
products occupies.

| Decision | Bodhi | Reference band (verified) | Verdict |
|---|---|---|---|
| Control radius | **6px** | Linear 4 · Stripe 4 · Geist 6 · Primer 6 | inside |
| Card radius | **8px** | Linear 8–12 · Notion 10 · Stripe 10 · Primer 12 · Geist 12 | inside |
| Radius ceiling | **12px** | Primer max 12 · Geist 12 (16 = fullscreen only) · Notion nothing above 12 | inside |
| Button heights | **28 / 32 / 36 / 40** | Primer 24/28/32/40/48 · Linear 24/32/40/44 · Geist 32/36/40 | inside |
| Input height | **36px** | Geist `--geist-form-height: 36px` · Raycast 36 | matches |
| Touch minimum | **44px** via `pointer: coarse` | Primer `--control-minTarget-coarse: 44px` | matches |
| UI base size | **14px** | Stripe 14 · Geist 14 · Primer 14 · Notion chrome 14 (Linear 15) | matches |
| Prose size | **15px** | Linear `--font-size-regular: .9375rem` | matches |
| Label size | **13px** | Linear secondary 13 · Notion labels 12 · Primer 12 | inside |
| Border width | **1px** | universal; 2px reserved for focus/emphasis in every system | matches |
| Border colour | **8% ink light / 10% white dark** | Linear 5–8% / 8–15% · Geist 8% / 14% · Notion 9–16% | inside |
| Resting shadow | **none on cards** | Primer separates `resting-*` from `floating-*`; Geist cards get a 1px ring, zero blur; Linear's shadows resolve to `none` in dark | matches |
| Shadow alpha | **≤ 12%, tinted** | Stripe `rgb(64 68 82 / 8%)` · Primer 4–10% · Geist 4–8% | inside |
| Focus ring | **2px accent outline, 2px offset** | Primer `2px solid` at `-2px` · Linear `2px` at `+2px` · Geist 2px ring + spacer | matches |
| Hover duration | **120ms** | Notion 20ms · Linear 100–160ms · Geist 150ms | inside |
| Overlay duration | **240ms** | Geist popover 200 / overlay 300 · Linear 250 | inside |
| Easing | **`cubic-bezier(.2,0,0,1)`** (out-curve) | Linear `ease-out-quad` · Geist `swift` · Notion `ease-out` — all out-family | matches |
| Spacing base | **4px, 8px rhythm** | Primer and Stripe scales are identical through 32px | matches |

Two places Bodhi deliberately **differs** from a reference, with reasons:

- **Stripe uses solid hex borders** (`#d5dbe1`). Bodhi uses alpha, because four of the six
  references do and because alpha hairlines sit correctly over the event photography this site
  is full of. Stripe is the exception, not the pattern.
- **Linear ships 4px buttons.** Bodhi uses 6px, matching Geist and Primer, because 4px against
  8px cards reads as a mismatch at this scale rather than as intent.

One idea worth stealing outright, from Geist's published documentation: **the neutral ramp has
fixed role bands.** `100–300` are backgrounds (default / hover / active), `400–600` are borders
(default / hover / active), `900–1000` is text (secondary / primary). Bodhi encodes the same
discipline in names instead of numbers (`--bg-*`, `--border-*`, `--fg-*`), which is Primer's
approach. Either is fine; mixing them is not.
