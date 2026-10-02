// Diagnostic: load a route and print console messages and failed requests.
import { chromium, devices } from "@playwright/test";
const url = process.argv[2] || "http://127.0.0.1:8787/privacy";
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.on("console", m => console.log("console", m.type(), m.text().slice(0, 300)));
page.on("pageerror", e => console.log("pageerror", e.message.slice(0, 300)));
page.on("requestfailed", r => console.log("requestfailed", r.url(), r.failure()?.errorText));
page.on("response", r => { if (r.status() >= 400) console.log("http", r.status(), r.url()); });
await page.goto(url, { waitUntil: "networkidle" });
console.log("h1 count:", await page.locator("h1").count(), "| root html length:", (await page.locator("#root").innerHTML()).length);
await browser.close();
