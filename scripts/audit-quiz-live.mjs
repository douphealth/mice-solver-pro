// Audit helper: runs three quiz scenarios against a deployed site at desktop and 375px, opens "View my plan",
// saves full-page screenshots and reports console errors, overflow and plan contents. Read-only: no purchase, no email.
// Usage: node scripts/audit-quiz-live.mjs [baseURL] [outDir]
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const base = process.argv[2] || "https://elimination.micegoneguide.com";
const out = process.argv[3] || "evidence/audit-2026-11-25";
mkdirSync(out, { recursive: true });

const SCENARIOS = {
  "A-droppings-kitchen-house": { evidence: ["Possible droppings"], location: ["Kitchen"], home: "Detached house", household: ["None of these"], previous: ["Nothing yet"], food: "Thick containers with tight lids", duration: "Just noticed" },
  "B-hazards-apartment-kids-glue": { evidence: ["Possible droppings", "Damaged wiring", "Waste in heating or cooling ducts"], location: ["Kitchen", "Attic"], home: "Apartment or condo", household: ["Children", "Dogs"], previous: ["Glue traps", "Rodenticide or bait stations"], food: "A mix, including bags or cardboard", duration: "It came back" },
  "C-noises-only-walls-pets-ultrasonic": { evidence: ["Scratching or other noises", "An unexplained odor"], location: ["Near or inside walls", "Bedroom"], home: "Manufactured home", household: ["Cats or other pets"], previous: ["Ultrasonic devices", "Scents or essential oils"], food: "Open food or pet bowls", duration: "More than a month" },
};

const lab = l => new RegExp("^" + l.replace(/[.*+?^${}()|[]\]/g, "\$&"));
const results = [];
const browser = await chromium.launch();
for (const [vp, width, height] of [["desktop", 1280, 900], ["mobile375", 375, 812]]) {
  for (const [name, s] of Object.entries(SCENARIOS)) {
    const ctx = await browser.newContext({ viewport: { width, height }, isMobile: vp !== "desktop", hasTouch: vp !== "desktop", deviceScaleFactor: vp === "desktop" ? 1 : 2, acceptDownloads: true });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", e => errors.push(`pageerror: ${e.message}`));
    page.on("console", m => { if (m.type() === "error") errors.push(`console: ${m.text()}`); });
    page.on("requestfailed", r => { if (!/cloudflareinsights/.test(r.url())) errors.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`); });
    const next = label => page.getByRole("button", { name: label }).click();
    await page.goto(base + "/quiz", { waitUntil: "networkidle" });
    for (const l of s.evidence) await page.getByLabel(lab(l)).check();
    await next("Next");
    for (const l of s.location) await page.getByLabel(lab(l)).check();
    await next("Next");
    await page.getByLabel(lab(s.home)).check(); await next("Next");
    for (const l of s.household) await page.getByLabel(lab(l)).check();
    await next("Next");
    for (const l of s.previous) await page.getByLabel(lab(l)).check();
    await next("Next");
    await page.getByLabel(lab(s.food)).check(); await next("Next");
    await page.getByLabel(lab(s.duration)).check();
    await next("View my plan");
    await page.waitForURL("**/plan");
    await page.getByRole("heading", { name: "Your mouse control plan" }).waitFor();
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${out}/${name}-${vp}.png`, fullPage: true });
    const info = await page.evaluate(() => ({
      h1: [...document.querySelectorAll("h1")].map(h => h.textContent.trim()),
      status: document.querySelector("header h2")?.textContent.trim(),
      startHere: [...document.querySelectorAll("#start-here ~ ol h3")].map(h => h.textContent.trim()),
      actions: [...document.querySelectorAll('[role="tabpanel"] li h4, [role="tabpanel"] li .font-semibold')].map(x => x.textContent.trim()).filter(Boolean).slice(0, 40),
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      robots: document.querySelector('meta[name="robots"]')?.getAttribute("content"),
      proCta: [...document.querySelectorAll('a[href="/pro"]')].map(a => a.textContent.trim()),
      text: document.body.innerText,
    }));
    for (const [tab, file] of [["Your rooms", "rooms"], ["When to call a pro", "help"]]) {
      await page.getByRole("tab", { name: tab }).click(); await page.waitForTimeout(300);
      if (vp === "desktop") await page.screenshot({ path: `${out}/${name}-${vp}-${file}.png`, fullPage: true });
      info[file] = await page.locator('[role="tabpanel"][data-state="active"]').innerText();
    }
    let pdf = "not tried";
    try {
      const [d] = await Promise.all([page.waitForEvent("download", { timeout: 20000 }), page.getByRole("button", { name: "Download free plan PDF" }).click()]);
      pdf = `ok ${d.suggestedFilename()}`;
    } catch (e) { pdf = `FAILED ${e.message.split("\n")[0]}`; }
    results.push({ viewport: vp, scenario: name, errors, pdf, ...info, text: undefined, textLength: info.text.length, hasPoisonWarning: /toxic to people, pets/.test(info.text), hasGlueStop: /Stop using glue traps/.test(info.text), hasHazard: /Keep clear of damaged wiring/.test(info.text) });
    if (vp === "desktop") writeFileSync(`${out}/${name}-plan.txt`, info.text + "\n\n--- ROOMS ---\n" + info.rooms + "\n\n--- HELP ---\n" + info.help);
    await ctx.close();
  }
}
await browser.close();
writeFileSync(`${out}/quiz-results.json`, JSON.stringify(results, null, 2));
for (const r of results) console.log(r.viewport, r.scenario, "| h1:", r.h1.length, "| status:", r.status, "| overflow:", r.overflow, "| errors:", r.errors.length, r.errors.join(" ; "), "| pdf:", r.pdf, "| startHere:", r.startHere.join(" / "));
