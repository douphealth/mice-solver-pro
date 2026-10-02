// Viewport-sized shots at a given scroll offset for close visual review.
// Usage: node scripts/fold.mjs <path> <scrollY> <name> [width] [height] [tab]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const [path, y = "0", name = "fold", width = "1280", height = "900", tab = ""] = process.argv.slice(2);
const base = process.env.BASE || "http://127.0.0.1:8787";
mkdirSync("evidence/fold", { recursive: true });
const answers = { evidence: ["droppings", "gnaw_marks", "sounds"], location: ["kitchen", "attic", "garage"], home_type: "townhouse", household: ["kids", "pets_cat"], previous: ["glue_traps", "ultrasonic"], food_storage: "mixed", duration: "weeks" };
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: Number(width), height: Number(height) }, deviceScaleFactor: Number(width) < 600 ? 2 : 1 });
await ctx.addInitScript(a => { try { if (!localStorage.getItem("mgg.answers.v2")) localStorage.setItem("mgg.answers.v2", JSON.stringify(a)); } catch {} }, answers);
const page = await ctx.newPage();
if (path === "/pro-sales") await page.goto(base + "/pro", { waitUntil: "networkidle" });
else if (path.startsWith("/pro")) { await page.goto(base + "/payment-success?session_id=cs_test_PAID0000000001", { waitUntil: "networkidle" }); await page.waitForURL("**/pro", { timeout: 8000 }); }
else await page.goto(base + path, { waitUntil: "networkidle" });
if (tab) { await page.getByRole("tab", { name: tab, exact: true }).click(); }
await page.evaluate(v => window.scrollTo(0, v), Number(y));
await page.waitForTimeout(700);
await page.screenshot({ path: `evidence/fold/${name}.png` });
await browser.close();
console.log("saved", name);
