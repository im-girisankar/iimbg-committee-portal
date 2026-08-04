# 03 — Component Library

Target structure:

```
src/
  components/
    ui/                    ← primitives. No app knowledge. No data imports.
      button.tsx  input.tsx  textarea.tsx  label.tsx  field.tsx  select.tsx
      badge.tsx   card.tsx   skeleton.tsx  separator.tsx  icon-button.tsx
      segmented.tsx  search-input.tsx  empty-state.tsx  sheet.tsx  spinner.tsx
    app/                   ← composed, app-aware
      event-card.tsx  event-row.tsx  team-card.tsx  event-summary.tsx
      events-toolbar.tsx  category-dot.tsx  page-header.tsx  section.tsx
      navbar.tsx  footer.tsx  theme-toggle.tsx  logo.tsx
  lib/
    cn.ts                  ← class merge helper
    format.ts              ← date/time/number formatters (pure, testable)
    use-theme.ts
```

Rule: `ui/*` never imports from `lib/api`, `lib/schemas`, or `data/`. Anything that knows what
an "event" is lives in `app/`.

---

## 1. Dependencies

### Required

```bash
npm i clsx tailwind-merge class-variance-authority lucide-react @radix-ui/react-slot @radix-ui/react-dialog
```

| Package | Why | Fixes |
|---|---|---|
| `clsx` + `tailwind-merge` | the `cn()` helper — conflict-free conditional classes | A2 |
| `class-variance-authority` | typed variants; one source of truth per component | A2, A4 |
| `lucide-react` | replaces 12+ hand-inlined SVGs at 6 inconsistent sizes | A8 |
| `@radix-ui/react-slot` | `<Button asChild>` so a `<Link>` can be a button without nesting | D16 |
| `@radix-ui/react-dialog` | the mobile drawer — focus trap, Escape, scroll lock, `aria-modal` for free | D11 |

Total added weight ≈ 30 kB gzipped, and **`framer-motion` (~110 kB) is removed in Phase 6**, so
the bundle gets meaningfully smaller.

### Optional — only if the phase budget allows

```bash
npm i @radix-ui/react-toggle-group @radix-ui/react-dropdown-menu
```

`ToggleGroup` gives the category segmented control arrow-key navigation; `DropdownMenu` gives
the theme toggle a proper menu. Both are upgrades, neither is required to hit 9/10.

### ⚠️ Deliberately NOT adopted

- **`@radix-ui/react-select`** — replacing the native `<select>` would require rewiring
  `react-hook-form` from `register()` to `Controller`, which touches form behaviour. The
  contract freezes `lib/form.ts` and the field wiring. **Keep native `<select>`** and fix D4
  by styling it properly (see §4). Native selects are also better on mobile. If it is ever
  revisited, do it as an isolated change with its own test pass.
- **`@hookform/resolvers`** — explicitly frozen by the contract (`00-ARCHITECTURE.md` §8.4).
- **shadcn CLI (`npx shadcn init`)** — it wants to rewrite `index.css` into its own token names
  (`--primary`, `--muted-foreground`, …), which would fight the Bodhi tokens. **Copy the shadcn
  component patterns by hand** — the cva + `cn()` + Radix structure — while keeping our token
  names. That is the shadcn philosophy anyway: you own the code.

### Prerequisite: fix the `@/` alias

`vite.config.ts` aliases `@ → /src` but `tsconfig.app.json` does not, so `@/` imports fail type
checking today. Add to `tsconfig.app.json` `compilerOptions`:

```json
"baseUrl": ".",
"paths": { "@/*": ["./src/*"] }
```

---

## 2. `cn()` — `src/lib/cn.ts`

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 3. Primitives

### 3.1 `Button` — `ui/button.tsx`

Replaces 9 divergent button implementations across the app.

```tsx
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const button = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-sm font-medium whitespace-nowrap " +
  "transition-colors duration-[--dur-fast] " +
  "disabled:pointer-events-none disabled:opacity-50 " +
  "[&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:   "bg-brand text-brand-fg hover:bg-brand-hover active:bg-brand-active",
        secondary: "bg-surface text-fg border border-border-strong hover:bg-surface-hover active:bg-bg-inset",
        ghost:     "text-fg-muted hover:bg-bg-muted hover:text-fg active:bg-bg-inset",
        danger:    "bg-danger text-white hover:brightness-95 active:brightness-90",
        link:      "text-brand-text underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-7  px-2.5 text-label",
        md: "h-8  px-3   text-label",
        lg: "h-9  px-3.5 text-ui",
        xl: "h-10 px-[18px] text-ui",
        icon: "size-8 px-0",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

type Props = React.ComponentProps<"button"> &
  VariantProps<typeof button> & { asChild?: boolean };

export function Button({ className, variant, size, asChild, ...props }: Props) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(button({ variant, size }), className)} {...props} />;
}
export { button as buttonVariants };
```

**Rules**
- One `primary` per viewport.
- `asChild` for links: `<Button asChild><Link to="/events">Browse events</Link></Button>` —
  never a `<Link>` wrapped in a `<button>`.
- No `w-full` inside cards. Full-width is for form submits and mobile drawers only.
- Loading: swap the label for `<Spinner/>` but keep the button's width fixed so nothing reflows.

### 3.2 `Input` / `Textarea` — `ui/input.tsx`, `ui/textarea.tsx`

```tsx
const base =
  "w-full rounded-sm border border-border-strong bg-surface text-ui text-fg " +
  "placeholder:text-fg-subtle transition-colors duration-[--dur-fast] " +
  "hover:border-fg-faint " +
  "aria-[invalid=true]:border-danger-border " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

// Input:    cn(base, "h-9 px-3")
// Textarea: cn(base, "min-h-[88px] px-3 py-2 resize-y")
```

No `focus:ring-*` — focus is the single global `:focus-visible` outline. No `min-h-[44px]`;
coarse pointers get their target from the global media query.

### 3.3 `Field` — `ui/field.tsx`

The wrapper that makes correct form a11y the default rather than something to remember. It
owns label association, description, error, and `aria-*` wiring.

```tsx
interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  description?: string;   // helper text, e.g. "Max 400 characters"
  error?: string;         // when present, renders role="alert" and sets aria-invalid
  children: (aria: { id: string; "aria-invalid": boolean; "aria-describedby"?: string }) => React.ReactNode;
}
```

Render contract:
- `<label htmlFor={id} class="text-label text-fg">` + `required` → `<span class="text-danger" aria-hidden>*</span>` and `<span class="sr-only">(required)</span>`
- description → `<p id={`${id}-desc`} class="text-caption text-fg-subtle">`
- error → `<p id={`${id}-error`} role="alert" class="text-caption text-danger">`
- `aria-describedby` points at **error when present, otherwise description**
- spacing: label → control 6px, control → message 6px, field → field 20px

**This is the component that fixes D7** — errors are `--danger`, structurally, everywhere.

### 3.4 `Select` — `ui/select.tsx`

Native `<select>` with a real chevron. **This fixes D4.**

```tsx
export function Select({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(
          "w-full h-9 pl-3 pr-9 rounded-sm appearance-none",
          "border border-border-strong bg-surface text-ui text-fg",
          "transition-colors duration-[--dur-fast] hover:border-fg-faint",
          "aria-[invalid=true]:border-danger-border disabled:opacity-50",
          className,
        )}
        {...props}
      />
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-fg-subtle"
        aria-hidden="true"
      />
    </div>
  );
}
```

Because `register("event_id")` spreads onto the native element unchanged, react-hook-form
behaviour is untouched — which is exactly what the contract requires.

### 3.5 `Badge` — `ui/badge.tsx`

Replaces four different pill treatments.

| Variant | Look |
|---|---|
| `neutral` (default) | `bg-bg-muted text-fg-muted border-transparent` |
| `outline` | `bg-transparent text-fg-muted border-border-strong` |
| `brand` | `bg-brand-subtle text-brand-text border-brand-border` |
| `danger` / `success` / `warning` / `info` | matching `*-subtle` / `*` / `*-border` |

Geometry, fixed: `h-5 · px-2 · gap-1.5 · rounded-xs · text-caption · font-medium · border`.
Never `rounded-full`, never uppercase, never mono.

### 3.6 `CategoryDot` — `app/category-dot.tsx`

```tsx
const CATEGORY_COLOR: Record<string, string> = {
  "Workshop":        "bg-cat-workshop",
  "Competition":     "bg-cat-competition",
  "Speaker Session": "bg-cat-speaker",
  "Social":          "bg-cat-social",
};
// <span className={cn("size-1.5 rounded-full shrink-0", CATEGORY_COLOR[category])} aria-hidden />
```

Always paired with the category's text label, so colour is never the sole carrier of meaning.
Keys must match `CATEGORIES` in `schemas.ts` exactly.

### 3.7 `Card` — `ui/card.tsx`

```
rounded-md border border-border bg-surface
hover (interactive only): bg-surface-hover ONLY — 120ms, fill change and nothing else
NO shadow. NO border-colour change. NO transform.
```

See `02-DESIGN-SYSTEM.md § 4.4`. Every reference product changes only the fill on hover;
changing the border as well is the tell of a template.

Slots: `Card`, `CardMedia`, `CardBody`, `CardFooter`. Default body padding 20px, `compact`
variant 16px. `interactive` prop adds the hover treatment and requires the whole card to be
the link target (fixes D16).

### 3.8 `Skeleton` — `ui/skeleton.tsx`

**Fixes D15.** Must be visible and must match the real content's box.

```tsx
<div className="animate-pulse rounded-sm bg-bg-muted" style={{ width, height }} />
```

`bg-bg-muted` (`#F4F4F5`) against `--bg` (`#FFFFFF`) is visible — unlike today's
`bg-background` on `bg-background`. Compose page-shaped skeletons (`EventCardSkeleton`,
`TeamCardSkeleton`) whose dimensions equal the real components' to within 8px so nothing jumps.

**Anti-flash timing**, required because `api.ts` silently falls back to bundled JSON and often
resolves in a few ms:

```ts
// show only after 120ms; once shown, hold for at least 200ms
export function useDelayedLoading(isLoading: boolean, delay = 120, min = 200): boolean
```

### 3.9 `EmptyState` — `ui/empty-state.tsx`

Props: `icon`, `title`, `description`, `action`. Layout: 48px icon in `text-fg-faint`, title
`text-title-4`, description `text-caption text-fg-subtle` at `max-w-[42ch]`, one `secondary`
action. Container: `border border-dashed border-border rounded-md py-12 text-center`.

### 3.10 `Sheet` — `ui/sheet.tsx`

Radix Dialog wrapper for the mobile drawer. **Fixes D11 entirely** — focus trap, Escape,
scroll lock, `aria-modal`, and focus restoration all come from Radix.

Overlay `bg-black/40 backdrop-blur-[1px]`; content `bg-surface border-l border-border
shadow-overlay w-[280px] rounded-l-lg`; slide 240ms `--ease-in-out`.

### 3.11 `Segmented` — `ui/segmented.tsx`

Replaces the uppercase-mono pill chips.

```
container: inline-flex p-0.5 gap-0.5 rounded-sm bg-bg-muted border border-border
item:      h-7 px-2.5 rounded-xs text-label text-fg-muted transition-colors
item[selected]: bg-surface text-fg  (+ shadow-popover in dark for separation)
```

Roving `tabindex` with ArrowLeft/ArrowRight; `role="radiogroup"` + `role="radio"`
`aria-checked`. On `<640px` it scrolls horizontally with
`overflow-x-auto [scrollbar-width:none] snap-x`.

### 3.12 `SearchInput` — `ui/search-input.tsx`

Fixes the Events search (P2.3): leading `Search` icon, **live `onChange` filtering debounced
150ms**, a clear `×` button when non-empty, `Escape` clears, `role="searchbox"`, and an
adjacent `aria-live="polite"` result count.

### 3.13 Others

- `IconButton` — `Button` at `size="icon"`, `aria-label` **required by types**.
- `Separator` — `<hr class="border-0 border-t border-border" role="separator">`.
- `Spinner` — 14px, `currentColor`, 600ms linear rotate; hidden under reduced-motion in favour
  of a static label.

---

## 4. App components

### 4.1 `EventCard` — `app/event-card.tsx`

| Now | Redesigned |
|---|---|
| `rounded-2xl`, hover shadow | `rounded-md`, hover = `surface-hover` fill only |
| 16:9 image = half the card | 3:2 image, `rounded-xs`, dark-mode `brightness-92` |
| Uppercase-mono category pill | `CategoryDot` + neutral label |
| Date only; `time` unused | `12 Aug 2026 · 18:00` in `numeric`, one line (**fixes D22**) |
| Two links to one href | whole card is one `<Link>` (**fixes D16**) |
| Full-width teal Register button | text link `Register →` revealed to `--fg` on card hover |
| `FEATURED` pill over the image | `Badge variant="brand"` in the metadata row |
| `line-clamp-2` desc, always cut | `line-clamp-2` at `text-prose`, with `title` attr |

Also gains a `variant="row"` for the dense list layout (see `04-PAGES.md § Events`).

### 4.2 `TeamCard` — `app/team-card.tsx`

**Deletes the duplicate `vertical` badge outright (D9).** `vertical` is instead consumed by the
*page* as a grouping key, so the field is still used — just meaningfully.

Layout: 64px `rounded-full` avatar (not a 260px square), name at `text-title-4`, role at
`text-caption text-brand-text`, bio at `text-caption text-fg-muted` clamped to 2 lines.
Non-interactive ⇒ **no hover state at all** (fixes the lying affordance and D12).
`alt={member.name}` on the image.

### 4.3 `EventSummary` — `app/event-summary.tsx`

New. The sticky panel beside the Register form. Consumes an `Event` already loaded by the page —
**no new fetch, no API change.** Shows image, title, `CategoryDot` + category, date · time,
venue, seats. Renders a skeleton when no event is selected yet.

### 4.4 `Navbar` — `app/navbar.tsx`

Fixed 56px, `bg-surface/80 backdrop-blur-md border-b border-border`. **No scroll-shrink**
(kills the reflow jitter, C1.3).

- **One brand mark.** A single 24px logo + `Envision` at `text-title-4`, with
  `IT Committee` in `text-caption text-fg-subtle` on `≥md` only. Fixes the 390px overflow (D3)
  and the triple-mark problem.
- Links: `h-8 px-2.5 rounded-sm text-label`, hover `bg-bg-muted`, active `text-fg` + a 2px
  `bg-brand` underline via `after:`.
- Right cluster: `ThemeToggle` (icon ghost) + `Register` (`primary`, `size="md"`).
- `<640px`: `Sheet` drawer.
- Skip link rendered as the first child (fixes D21).

### 4.5 `Footer` — `app/footer.tsx`

Three columns on `≥md`, stacked below: **Portal** (Events / Team / Register) · **Committee**
(About / Contact) · **Developers** (**API Reference → `/api/docs`**, fixing D23; OpenAPI spec).
Bottom bar: one logo, `© {year} Envision × IT Committee · IIM Bodh Gaya`, theme toggle.
The uppercase mono pull-quote is deleted.

### 4.6 `PageHeader` / `Section` — `app/`

`PageHeader`: `h1` at `text-title-1`, optional `text-prose text-fg-muted max-w-[65ch]` subtitle,
optional right-aligned actions slot. Bottom margin 32px. Used by all four pages so headers stop
being re-typed with different sizes.

`Section`: `<section>` + optional `h2` at `text-title-2` + optional "view all" action; vertical
rhythm 48/64px owned here, not sprinkled per page.

### 4.7 `ThemeToggle` + `useTheme`

`light | dark | system`, persisted at `bodhi-theme`, applies `.dark` to `<html>` and sets
`colorScheme`. Listens to `matchMedia('(prefers-color-scheme: dark)')` while in `system`.
Icon-only ghost button with `aria-label` reflecting the *next* state.

---

## 5. `src/lib/format.ts`

Formatting is currently inlined in `EventCard` and would drift the moment a second surface
shows a date. Extract as pure, unit-testable functions:

```ts
formatDate(iso: string): string        // "12 Aug 2026"
formatDateLong(iso: string): string    // "Wednesday, 12 August 2026"
formatTime(hhmm: string): string       // "18:00" → "6:00 PM"
formatDateTime(iso, hhmm): string      // "12 Aug 2026 · 6:00 PM"
monthKey(iso: string): string          // "2026-08"      — for grouping
monthLabel(iso: string): string        // "August 2026"  — section headings
isUpcoming(iso: string, now?: Date): boolean
```

Locale stays `en-IN` to match today's output. These are the only new functions worth adding
tests for — and they are pure, so tests cost nothing.

---

## 6. Migration map

| Old | New | Notes |
|---|---|---|
| `components/EventCard.tsx` | `components/app/event-card.tsx` | + `variant="row"` |
| `components/TeamCard.tsx` | `components/app/team-card.tsx` | badge deleted |
| `components/FilterBar.tsx` | `components/app/events-toolbar.tsx` | rebuilt on `Segmented` + `SearchInput`; owns URL sync |
| `components/Navbar.tsx` | `components/app/navbar.tsx` | + `Sheet`, `ThemeToggle` |
| `components/Footer.tsx` | `components/app/footer.tsx` | link columns |
| `NotFound` inside `App.tsx` | `pages/NotFound.tsx` | tokenised (fixes D8) |
| 12+ inline `<svg>` | `lucide-react` | `ArrowRight, ArrowLeft, Search, X, Menu, MapPin, Users, Calendar, Clock, ChevronDown, CheckCircle2, AlertCircle, Sun, Moon, Monitor` |
| every `motion.*` | CSS `.animate-enter` or nothing | Phase 6 |

**Do not leave the old files in place as re-export shims.** Move, update imports, delete.
