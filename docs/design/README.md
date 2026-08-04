# Frontend Redesign — "Bodhi"

A complete UI/UX revamp of the IIM Bodh Gaya Envision × IT Committee portal.
**No functional or backend changes.** Read `00-ARCHITECTURE.md § 8` before touching anything.

## The documents

| # | File | Read it when |
|---|---|---|
| 00 | [`00-ARCHITECTURE.md`](./00-ARCHITECTURE.md) | **Always first.** Backend, data flow, and the frozen contract. |
| 01 | [`01-AUDIT.md`](./01-AUDIT.md) | You want the critique, the scores, and the 25 numbered defects. |
| 02 | [`02-DESIGN-SYSTEM.md`](./02-DESIGN-SYSTEM.md) | Colour, type, space, radius, elevation, motion, dark mode, a11y — plus the drop-in `index.css`. |
| 03 | [`03-COMPONENTS.md`](./03-COMPONENTS.md) | Building any component. Primitives, variants, deps, migration map. |
| 04 | [`04-PAGES.md`](./04-PAGES.md) | Building a page. Analyse → critique → redesign → acceptance criteria. |
| 05 | [`05-EXECUTION.md`](./05-EXECUTION.md) | **Doing the work.** 9 phases, verification, copy-paste prompts. |
| 06 | [`06-CLEANUP.md`](./06-CLEANUP.md) | Deleting things. Verified manifest of 12.3 MB of dead assets. |

## Where it stands

| Surface | Now | Target |
|---|:-:|:-:|
| Home | 4.0 | 9.3 |
| Events | 5.0 | 9.4 |
| Team | 3.5 | 9.2 |
| Register | 4.0 | 9.5 |
| 404 | 2.0 | 9.0 |
| Navbar / Footer | 4.0 / 3.0 | 9.3 / 9.0 |
| Design system | 2.5 | 9.5 |

## The five bugs this surfaced

Found while auditing, all verified in a running browser. Fixing them **restores stated
behaviour** — it does not change functionality.

1. **D1** — `/events?category=Workshop` shows the chip active but renders all 7 events. Deep-linked filters have never worked.
2. **D2** — "Clear filters" resets the grid but not the chips, input, or URL.
3. **D3** — The mobile hamburger is clipped off-screen at 390px. The mobile menu is unreachable.
4. **D4** — Both `<select>` elements have `appearance: none` and no chevron. They look like text inputs.
5. **D5** — Server errors show users the raw JSON response body.

Plus one systemic CSS bug — **D6**: an unlayered `h1,h2,h3` rule beats every Tailwind utility,
so `text-*` on any heading silently does nothing anywhere in the app.

## Already done

- ✅ New favicon and app-icon set (`06-CLEANUP.md § 4`) — a Bodhi leaf mark replacing the 9.5 KB stock purple SVG. `index.html` still needs its `<link>` tags updated in Phase 0.

## Ground rules

- Never edit `api/`, `lib/schemas.ts`, `lib/api.ts`, or `lib/form.ts`.
- Never touch `submissions/` or `pr-vertical/` — unrelated coursework.
- `npm test` stays at 42/42; `npm run build` and `npm run lint` stay clean.
- One phase per session. Verify before moving on.
