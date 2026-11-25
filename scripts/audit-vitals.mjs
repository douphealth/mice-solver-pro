// Lab Core Web Vitals (LCP, CLS, long-task time as a TBT proxy) on a throttled mobile profile using Playwright Chromium.
// Usage: node scripts/audit-vitals.mjs [baseURL] path...
import { chromium } from "@playwright/test";
const base = process.argv[2] || "https://elimination.micegoneguide.com";
const paths = process.argv.slice(3).length ? process.argv.slice(3) : ["/", "/quiz", "/tools/entry-points", "/pro"];
const browser = await chromium.launch();
for (const path of paths) {
  const runs = [];
  for (let i = 0; i < 3; i++) {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 }); // "Slow 4G" as Lighthouse
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.addInitScript(() => {
      window.__v = { lcp: 0, cls: 0, tbt: 0 };
      new PerformanceObserver(l => { for (const e of l.getEntries()) window.__v.lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__v.cls += e.value; }).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver(l => { for (const e of l.getEntries()) window.__v.tbt += Math.max(0, e.duration - 50); }).observe({ type: "longtask", buffered: true });
    });
    const t0 = Date.now();
    await page.goto(base + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    const v = await page.evaluate(() => window.__v);
    const bytes = await page.evaluate(() => performance.getEntriesByType("resource").reduce((s, r) => s + (r.transferSize || 0), 0) + (performance.getEntriesByType("navigation")[0]?.transferSize || 0));
    runs.push({ ...v, load: Date.now() - t0, kb: Math.round(bytes / 1024) });
    await ctx.close();
  }
  const med = k => runs.map(r => r[k]).sort((a, b) => a - b)[1];
  console.log(`${path.padEnd(22)} LCP ${Math.round(med("lcp"))} ms | CLS ${med("cls").toFixed(3)} | long-task excess ${Math.round(med("tbt"))} ms | transfer ${med("kb")} KB | networkidle ${med("load")} ms`);
}
await browser.close();
