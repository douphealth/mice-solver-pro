// Audit helper: clicks the Pro buy button on the live /pro page and reads the price Stripe shows. Never fills or submits the form.
import { chromium } from "@playwright/test";
const base = process.argv[2] || "https://elimination.micegoneguide.com";
const out = process.argv[3] || "evidence/audit-2026-11-25";
const browser = await chromium.launch();
for (const [vp, width, height] of [["desktop", 1280, 900], ["mobile375", 375, 812]]) {
  const ctx = await browser.newContext({ viewport: { width, height }, isMobile: vp !== "desktop", hasTouch: vp !== "desktop" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", m => { if (m.type() === "error" && page.url().startsWith(base)) errors.push(m.text()); });
  page.on("pageerror", e => { if (page.url().startsWith(base)) errors.push(e.message); });
  await page.goto(base + "/pro", { waitUntil: "networkidle" });
  await page.screenshot({ path: `${out}/pro-sales-${vp}.png`, fullPage: true });
  const href = await page.getByTestId("checkout-link").first().getAttribute("href");
  await page.getByTestId("checkout-link").first().click();
  await page.waitForURL(/buy\.stripe\.com|checkout\.stripe\.com/, { timeout: 30000 });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(2500);
  const text = await page.locator("body").innerText();
  await page.screenshot({ path: `${out}/stripe-checkout-${vp}.png`, fullPage: false });
  const prices = [...new Set(text.match(/\$\s?\d+\.\d{2}/g) || [])];
  console.log(vp, "| buy href:", href, "| landed:", page.url().split("?")[0].slice(0, 60), "| prices on Stripe page:", prices.join(", "), "| product line:", (text.match(/Pro[^\n]{0,60}/) || [""])[0], "| app console errors before leaving:", errors.length);
  await ctx.close();
}
await browser.close();
