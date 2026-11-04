// Renders the CV page to public/abdullah-ismail-cv.pdf and the hero to the share image.
// Run against a running build: node tools/export.mjs http://localhost:3000
import { chromium } from "playwright";
const base = process.argv[2] ?? "http://localhost:3000";
const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
const page = await browser.newPage({ colorScheme: "light", reducedMotion: "reduce" });
await page.goto(`${base}/cv`, { waitUntil: "networkidle" });
await page.pdf({ path: "public/abdullah-ismail-cv.pdf", format: "A4", printBackground: true });
const og = await browser.newPage({ viewport: { width: 1200, height: 630 }, colorScheme: "light" });
await og.goto(base, { waitUntil: "networkidle" });
await og.addStyleTag({ content: ".site-header,.actions,.hero__meta{display:none!important}" });
await og.waitForTimeout(800);
await og.screenshot({ path: "src/app/opengraph-image.jpg", type: "jpeg", quality: 85 });
await browser.close();
