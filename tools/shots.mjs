// Steps through the film and the pages at desktop and phone size, saves screenshots,
// and flags horizontal overflow. Usage: node tools/shots.mjs [baseUrl] [outDir]
import { chromium } from "playwright";
const base = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3] ?? "shots";
const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
for (const [name, w, h, mobile] of [["d", 1440, 900, false], ["m", 390, 844, true]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: mobile, hasTouch: mobile });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(base, { waitUntil: "networkidle" });
  // Film beats: the middle of each hold.
  // Middle of each hold, from the set's steps in src/lib/film.ts.
  const holds = mobile ? { hero: 120, about: 1380, work: 2754, contact: 4218 } : { hero: 200, about: 2300, work: 4590, contact: 7030 };
  for (const [beat, y] of Object.entries(holds)) {
    await page.evaluate((y) => scrollTo(0, y), y);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${out}/${name}-film-${beat}.png` });
  }
  for (const id of ["work", "about", "contact"]) {
    await page.evaluate((id) => document.getElementById(id).scrollIntoView(), id);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${out}/${name}-${id}.png` });
  }
  for (const path of ["/work/ashar-operations", "/work/mizan", "/cv"]) {
    await page.goto(base + path, { waitUntil: "networkidle" });
    await page.screenshot({ path: `${out}/${name}${path.replaceAll("/", "-")}.png`, fullPage: true });
    const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (over > 0) console.log(`OVERFLOW ${name} ${path} by ${over}px`);
  }
  if (errors.length) console.log(name, "errors:", errors);
}
await browser.close();
