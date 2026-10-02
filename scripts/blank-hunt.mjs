// Hunts for intermittent blank pages: loads many routes repeatedly in ONE page, logging errors when #root is empty.
import { chromium, devices } from "@playwright/test";
const base = process.argv[2] || "http://127.0.0.1:8787";
const rounds = Number(process.argv[3] || 6);
const routes = ["/", "/quiz", "/tools/calculator", "/tools/entry-points", "/tools/trap-placement", "/tools/cleanup-guide", "/pro", "/restore", "/privacy", "/terms", "/nope"];
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
let log = [];
page.on("pageerror", e => log.push("pageerror: " + e.message.slice(0, 400)));
page.on("console", m => { if (["error", "warning"].includes(m.type())) log.push(`console.${m.type()}: ` + m.text().slice(0, 300)); });
page.on("requestfailed", r => log.push("requestfailed: " + r.url() + " " + r.failure()?.errorText));
page.on("response", r => { if (r.status() >= 400 && !r.url().endsWith("/no-such")) log.push(`http ${r.status()} ${r.url()}`); });
let blanks = 0, total = 0;
for (let i = 0; i < rounds; i++) {
  for (const path of routes) {
    log = [];
    await page.goto(base + path, { waitUntil: "networkidle" });
    total++;
    const h1 = await page.locator("h1").count();
    if (h1 !== 1) {
      blanks++;
      await page.waitForTimeout(1500);
      const h1b = await page.locator("h1").count();
      console.log(`BLANK? round ${i} ${path}: h1=${h1} (after 1.5s: ${h1b}); root length=${(await page.locator("#root").innerHTML()).length}`);
      console.log(log.map(l => "   " + l).join("\n") || "   (no errors logged)");
    }
  }
}
console.log(`done: ${blanks} blank of ${total} loads`);
await browser.close();
