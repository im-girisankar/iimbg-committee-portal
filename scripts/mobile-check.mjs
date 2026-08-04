/**
 * Mobile fitness check — run against a dev/preview server.
 *   npm run dev            (in another terminal)
 *   npm run check:mobile
 *
 * Two passes per width, because the two things we care about need opposite
 * browser configurations:
 *
 *  - GEOMETRY pass runs WITHOUT `isMobile`. Mobile emulation honours the meta
 *    viewport and zooms out when content doesn't fit, so `window.innerWidth`
 *    silently grows to match the overflow (390 -> 461) and a naive
 *    `scrollWidth > innerWidth` test passes on a visibly broken page.
 *
 *  - TOUCH pass runs WITH `isMobile`, because that is what actually makes
 *    Chromium report `pointer: coarse` — which is the media query our 16px
 *    input rule (iOS focus-zoom) and 44px target rule hang off.
 *
 * Tap targets are checked at the WCAG 2.5.8 AA threshold of 24x24 CSS px, not
 * the AAA 44px. Inline text links legitimately sit below 44px, and flagging
 * every nav and footer link produced pure noise.
 */
import { chromium } from "playwright";

const WIDTHS = [320, 360, 390, 430, 768];
const ROUTES = ["/", "/events", "/team", "/register", "/nope"];
const BASE = process.env.BASE ?? "http://localhost:5173";

const browser = await chromium.launch();
let failures = 0;

for (const width of WIDTHS) {
  const geo = await browser.newContext({ viewport: { width, height: 800 } });
  const touch = await browser.newContext({
    viewport: { width, height: 800 },
    isMobile: width < 768,
    hasTouch: width < 768,
  });

  for (const route of ROUTES) {
    const problems = [];

    // ── geometry ──────────────────────────────────────────────────────────
    const gp = await geo.newPage();
    await gp.goto(BASE + route, { waitUntil: "networkidle" });
    await gp.waitForTimeout(500);
    const g = await gp.evaluate(() => {
      const vw = window.innerWidth;
      /* Descendants of a horizontal scroller are SUPPOSED to extend past the
         viewport — that is what makes it scroll. Only flag elements that
         overflow the page itself. */
      const inScroller = (el) => {
        for (let p = el.parentElement; p; p = p.parentElement) {
          const ox = getComputedStyle(p).overflowX;
          if (ox === "auto" || ox === "scroll") return true;
        }
        return false;
      };
      const offenders = [...document.querySelectorAll("body *")]
        .filter((el) => el.getBoundingClientRect().right > vw + 1 && !inScroller(el))
        .slice(0, 4)
        .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 50)}`);
      const tiny = [...document.querySelectorAll("button, [role=button], [role=radio]")]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && (r.height < 24 || r.width < 24);
        })
        .slice(0, 4)
        .map((el) => (el.getAttribute("aria-label") || el.textContent || "?").trim().slice(0, 28));
      return { scrollW: document.documentElement.scrollWidth, vw, offenders, tiny, h1: !!document.querySelector("h1") };
    });
    await gp.close();

    if (g.scrollW > g.vw) problems.push(`h-scroll: scrollWidth ${g.scrollW} > ${g.vw}`);
    if (g.offenders.length) problems.push(`overflowing: ${g.offenders.join(", ")}`);
    if (g.tiny.length) problems.push(`targets < 24px: ${g.tiny.join(", ")}`);
    if (!g.h1) problems.push("no <h1> on page");

    // ── touch / pointer: coarse ───────────────────────────────────────────
    if (width < 768) {
      const tp = await touch.newPage();
      await tp.goto(BASE + route, { waitUntil: "networkidle" });
      await tp.waitForTimeout(500);
      const t = await tp.evaluate(() =>
        [...document.querySelectorAll("input, select, textarea")]
          .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 16)
          .map((el) => el.id || el.getAttribute("name") || el.type || "?"),
      );
      await tp.close();
      if (t.length) problems.push(`inputs < 16px (iOS will zoom on focus): ${t.join(", ")}`);
    }

    if (problems.length) {
      failures++;
      console.log(`\n❌ ${width}px ${route}`);
      for (const p of problems) console.log(`   ${p}`);
    } else {
      console.log(`✅ ${width}px ${route}`);
    }
  }

  await geo.close();
  await touch.close();
}

await browser.close();
console.log(failures ? `\n${failures} check(s) failed` : "\nAll mobile checks passed");
process.exit(failures ? 1 : 0);
