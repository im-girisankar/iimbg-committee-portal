# 07 — Mobile Mandate

**Every phase must satisfy this document.** Mobile is not a final QA pass — it is the base case.
A page that only looks right at 1440px is not done.

Today the site fails this outright: **the mobile menu is unreachable at 390px** (D3 — the
hamburger's right edge computes to 432px against a 406px viewport), the hero wastes a third of
the first screen on a decorative clock, and every event card is a full-width photo followed by a
full-width teal button.

---

## 1. Mobile-first, literally

Write the **unprefixed** classes for mobile and add breakpoints upward. Never write a desktop
layout and then undo it with `max-*` queries.

```
✅  className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5"
❌  className="grid grid-cols-3 max-lg:grid-cols-1"
```

Breakpoints in use (Tailwind defaults): `sm 640` · `md 768` · `lg 1024` · `xl 1280`.

## 2. Test widths — all of them, every phase

| Width | Device class | Why it matters |
|---|---|---|
| **320** | iPhone SE 1st gen, fold covers | the hard floor — nothing may break here |
| **360** | most budget Android | the single most common width in India |
| **390** | iPhone 13/14/15 | where D3 currently breaks |
| **430** | iPhone Pro Max | widest phone before `sm` |
| **768** | iPad portrait | the `md` boundary — check it, it is where layouts usually snap badly |

Given the audience is an IIM student body, **360 and 390 are the primary design targets**, not
1440. Design there first and let the desktop layout be the enhancement.

## 3. Hard rules

### 3.1 No horizontal scroll. Ever.

```js
// must be true at every test width, on every route
document.documentElement.scrollWidth <= window.innerWidth
```

Usual causes to watch for: `whitespace-nowrap` on long strings (this is exactly what broke the
navbar), fixed pixel widths, `min-w-[…]` on flex children, wide tables, and negative margins.

Any genuinely wide content (a code block, a wide table) goes in its own
`overflow-x-auto` container — **the page body never scrolls sideways.**

### 3.2 Inputs must be 16px on touch devices

iOS Safari **auto-zooms the viewport** whenever a focused input has `font-size < 16px`, then
leaves the page zoomed. Our UI text is 14px, so this would fire on every field in the Register
form.

```css
@media (pointer: coarse) {
  :where(input, select, textarea) { font-size: 16px; }
}
```

Do **not** "fix" this with `maximum-scale=1` or `user-scalable=no` in the viewport meta —
that breaks pinch-zoom and fails WCAG 1.4.4.

### 3.3 Touch targets are 44px

Already handled globally in `02-DESIGN-SYSTEM.md § 5.1` via `@media (pointer: coarse)`. Controls
stay visually 32–36px on desktop and expand only where there's a finger. Additionally: **8px
minimum gap between adjacent tappable elements** so neighbours aren't mis-hit.

### 3.4 Use `dvh`, not `vh`

`100vh` on mobile browsers is measured against the *expanded* viewport, so a `min-h-screen`
block sits ~100px taller than the visible area and pushes content under the URL bar.

```
✅  min-h-[100dvh]      ❌  min-h-screen / min-h-[100vh]
```

This affects `App.tsx` (`main.min-h-screen`), the 404 page, and the drawer.

### 3.5 Respect the safe area

Notched and gesture-bar devices need inset padding on anything fixed to an edge:

```css
padding-inline: max(1rem, env(safe-area-inset-left), env(safe-area-inset-right));
padding-block-end: env(safe-area-inset-bottom);   /* fixed footers, drawers */
```

Requires `viewport-fit=cover` in the viewport meta:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

### 3.6 Reserve space for images

Every `<img>` gets `width`/`height` or an `aspect-ratio` class so the layout doesn't jump as
photos load. On a slow phone connection this is the difference between "fast" and "broken".
Add `loading="lazy"` below the fold and `decoding="async"` throughout.

---

## 4. Per-surface requirements

### Navbar — **the current failure**

- Brand collapses to the **mark only** below `sm`; the wordmark returns at `sm`, and
  `IT Committee` only at `md`. No `whitespace-nowrap` on anything that can't shrink.
- Hamburger is `size-10`, flush to the safe-area inset, and **always inside the viewport**.
- Drawer: `w-[min(320px,86vw)]`, `h-[100dvh]`, its own `overflow-y-auto`, body scroll locked.
- Nav height 56px on mobile too — do not shrink it further; that's below comfortable tap height.

### Events

- Category control **scrolls horizontally** with `overflow-x-auto snap-x [scrollbar-width:none]`
  and edge fade — it must never wrap to three ragged rows.
- Search goes **full width on its own row** below `sm`, above the categories.
- Toolbar is **not sticky below `sm`** — a sticky bar plus a fixed navbar eats ~112px of a
  667px screen. Sticky from `sm` up.
- Grid is 1 column below `sm`. Cards keep their 3:2 image but cap it at `max-h-[180px]` so a
  card isn't a full screen of photograph.
- Result count sits directly above the grid, left-aligned.

### Team

- 2 columns at 360px (not 1) — the 56px-avatar card is compact enough, and 2-up is what makes
  the density gain visible on a phone.
- Leadership row is 1 column below `sm`, 2 from `sm`.
- Group headings stay sticky-free; they're cheap dividers.

### Register

- **Event summary goes ABOVE the form on mobile**, collapsed to a single compact row
  (image thumb 56px + title + date). Context first, then the form.
- One field per row below `sm` — the Phone/Program pair only splits at `sm`.
- Submit is full width and is the last thing before the consent line.
- Success panel replaces the form column and scrolls into view.

### Home

- Hero headline steps to **32px** at 320–390px (`text-display` is responsive per
  `02 § 2.2`). Two CTAs stack full-width below `sm` with 8px between them.
- Stat strip is a **2×2 grid** below `sm`, not four squeezed columns.
- "Next up" card stacks: metadata row wraps, CTA goes full width.

### 404

- `min-h-[calc(100dvh-var(--nav-h))]`, content vertically centred, recovery links wrap to two
  rows rather than overflowing.

---

## 5. Verification — run this at the end of every phase

Add as `scripts/mobile-check.mjs` and wire to `npm run check:mobile`:

```js
import { chromium } from "playwright";

const WIDTHS = [320, 360, 390, 430, 768];
const ROUTES = ["/", "/events", "/team", "/register", "/nope"];
const BASE = process.env.BASE ?? "http://localhost:5173";

const b = await chromium.launch();
let failures = 0;

for (const width of WIDTHS) {
  const ctx = await b.newContext({
    viewport: { width, height: 800 }, isMobile: width < 768, hasTouch: width < 768,
    deviceScaleFactor: 2,
  });
  for (const route of ROUTES) {
    const p = await ctx.newPage();
    await p.goto(BASE + route, { waitUntil: "networkidle" });
    await p.waitForTimeout(400);

    const r = await p.evaluate(() => {
      const de = document.documentElement;
      const overflowing = [...document.querySelectorAll("*")]
        .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1)
        .slice(0, 5)
        .map((el) => el.tagName.toLowerCase() + "." + String(el.className).slice(0, 60));

      const tooSmall = [...document.querySelectorAll("button, a[href], [role=button]")]
        .filter((el) => { const b = el.getBoundingClientRect();
                          return b.width > 0 && (b.height < 44 || b.width < 24); })
        .slice(0, 5)
        .map((el) => (el.textContent || el.getAttribute("aria-label") || "?").trim().slice(0, 30));

      const smallInputs = [...document.querySelectorAll("input, select, textarea")]
        .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 16)
        .map((el) => el.id || el.name || "?");

      return { scrollW: de.scrollWidth, innerW: window.innerWidth, overflowing, tooSmall, smallInputs };
    });

    const scrolls = r.scrollW > r.innerW;
    if (scrolls || r.overflowing.length || r.tooSmall.length || r.smallInputs.length) {
      failures++;
      console.log(`\n❌ ${width}px ${route}`);
      if (scrolls) console.log(`   h-scroll: scrollWidth ${r.scrollW} > ${r.innerW}`);
      if (r.overflowing.length) console.log(`   overflowing: ${r.overflowing.join(", ")}`);
      if (r.tooSmall.length) console.log(`   small targets: ${r.tooSmall.join(", ")}`);
      if (r.smallInputs.length) console.log(`   inputs < 16px (iOS will zoom): ${r.smallInputs.join(", ")}`);
    } else {
      console.log(`✅ ${width}px ${route}`);
    }
    await p.close();
  }
  await ctx.close();
}
await b.close();
console.log(failures ? `\n${failures} check(s) failed` : "\nAll mobile checks passed");
process.exit(failures ? 1 : 0);
```

**A phase is not complete until `npm run check:mobile` exits 0.**

Note the touch-target check tolerates narrow-but-tall elements (inline text links legitimately
report < 24px wide); it flags anything under 44px tall, which is the rule that matters.

---

## 6. Manual pass — once, at Phase 8

Automation catches geometry. These need eyes:

- [ ] Rotate to landscape at 390×844 → 844×390. Nothing is trapped or unreachable.
- [ ] Open the drawer, scroll the page behind it — **the background must not move.**
- [ ] Focus each Register field on a real iPhone (or Safari responsive mode). **No zoom.**
- [ ] Tap every card, chip, and button with a thumb, not a mouse. Nothing mis-fires.
- [ ] Text at 200% browser zoom on a 390px viewport still reflows without clipping.
- [ ] Dark mode at 360px — check photos, borders, and the drawer overlay.
- [ ] Throttle to Slow 4G: images fade in without shifting anything.
