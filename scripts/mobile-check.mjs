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
