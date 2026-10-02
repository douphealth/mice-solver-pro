// Visual review helper: full-page screenshots of every route at desktop and mobile widths.
// Usage: node scripts/shots.mjs [baseURL]   (local worker + mock services must be running)
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const base = process.argv[2] || "http://127.0.0.1:8787";
const out = "evidence/shots";
mkdirSync(out, { recursive: true });

const answers = {
  evidence: ["droppings", "gnaw_marks", "sounds"], location: ["kitchen", "attic", "garage"], home_type: "townhouse",
  household: ["kids", "pets_cat"], previous: ["glue_traps", "ultrasonic"], food_storage: "mixed", duration: "weeks",
};

const browser = await chromium.launch();
for (const [name, width, height] of [["desktop", 1280, 900], ["mobile", 390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: name === "mobile" ? 2 : 1 });
  await ctx.addInitScript(a => { try { if (!localStorage.getItem("mgg.answers.v2")) localStorage.setItem("mgg.answers.v2", JSON.stringify(a)); } catch {} }, answers);
  const page = await ctx.newPage();
  const shot = async (label, opts = {}) => { await page.waitForTimeout(500); await page.screenshot({ path: `${out}/${label}-${name}.png`, fullPage: true, ...opts }); console.log("shot", label, name); };
  const go = async path => { await page.goto(base + path, { waitUntil: "networkidle" }); };

  await go("/"); await shot("01-home");
  await go("/quiz"); await shot("02-quiz-step1");
  await page.getByLabel("Possible droppings").check(); await page.getByRole("button", { name: "Next" }).click(); await shot("03-quiz-step2");
  await go("/plan"); await shot("04-plan");
  await page.getByRole("tab", { name: "Seal & prevent" }).click(); await shot("05-plan-seal");
  await go("/tools/calculator"); await shot("06-signs");
  await go("/tools/entry-points"); await shot("07-entry-points");
  await go("/tools/trap-placement"); await shot("08-trap-placement");
  await go("/tools/cleanup-guide"); await shot("09-cleanup");
  await go("/pro"); await shot("10-pro-sales");
  await go("/restore"); await shot("11-restore");
  await go("/payment-success?session_id=cs_test_UNPAID0000001"); await shot("12-payment-pending");
  await go("/payment-success?session_id=cs_test_PAID0000000001"); await page.waitForURL("**/pro", { timeout: 8000 }); await page.waitForTimeout(800); await shot("13-pro-overview");
  for (const [tab, label] of [["30-day plan", "14-pro-schedule"], ["Rooms", "15-pro-rooms"], ["Traps", "16-pro-traps"], ["Seal up", "17-pro-seal"], ["Evidence log", "18-pro-log"], ["Supplies", "19-pro-supplies"], ["Get help", "20-pro-help"], ["Prevent", "21-pro-prevent"]]) {
    await page.getByRole("tab", { name: tab, exact: true }).click(); await shot(label);
  }
  await go("/privacy"); await shot("22-privacy");
  await go("/does-not-exist"); await shot("23-404");
  await ctx.close();
}
await browser.close();
