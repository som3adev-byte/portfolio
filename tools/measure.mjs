// Bytes transferred on the home page: before the first scroll and after scrolling the whole
// film, on an emulated phone (4G) and a desktop. Usage: node tools/measure.mjs [baseUrl]
import { chromium } from "playwright";
const base = process.argv[2] ?? "http://localhost:3000";
const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
const kb = (n) => `${Math.round(n / 1024)} KB`;
for (const [name, w, h, mobile] of [["phone", 390, 844, true], ["desktop", 1440, 900, false]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: mobile ? 3 : 2, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.enable");
  if (mobile) await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (9 * 1024 * 1024) / 8, uploadThroughput: (1.5 * 1024 * 1024) / 8 });
  let bytes = 0, frames = 0;
  const urls = new Map();
  cdp.on("Network.requestWillBeSent", (e) => urls.set(e.requestId, e.request.url));
  cdp.on("Network.loadingFinished", (e) => {
    bytes += e.encodedDataLength;
    if (urls.get(e.requestId)?.includes("/film/")) frames++;
  });
  const t0 = Date.now();
  await page.goto(base, { waitUntil: "load" });
  const loadMs = Date.now() - t0;
  await page.waitForTimeout(3000);
  console.log(`${name}: load ${loadMs} ms, before first scroll ${kb(bytes)} (${frames} film files)`);
  const total = await page.evaluate(() => document.querySelector(".film").offsetHeight);
  for (let y = 0; y < total; y += 120) {
    await page.evaluate((y) => scrollTo(0, y), y);
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(2000);
  console.log(`${name}: after the whole film ${kb(bytes)} (${frames} film files)`);
  await ctx.close();
}
await browser.close();
