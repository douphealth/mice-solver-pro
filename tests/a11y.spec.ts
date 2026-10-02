import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const answers = { evidence: ["droppings", "damaged_wiring"], location: ["kitchen", "attic"], home_type: "apartment", household: ["kids"], previous: ["glue_traps"], food_storage: "mixed", duration: "weeks" };
const ROUTES = ["/", "/quiz", "/plan", "/tools/calculator", "/tools/entry-points", "/tools/trap-placement", "/tools/cleanup-guide", "/pro", "/restore", "/privacy", "/terms"];

test.describe("WCAG 2 A/AA automated audit", () => {
  for (const path of ROUTES) {
    test(`no serious or critical violations: ${path}`, async ({ page }) => {
      await page.addInitScript(a => { try { localStorage.setItem("mgg.answers.v2", JSON.stringify(a)); } catch { /* ignore */ } }, answers);
      await page.goto(path, { waitUntil: "networkidle" });
      const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      const bad = result.violations.filter(v => v.impact === "serious" || v.impact === "critical");
      expect(bad.map(v => `${v.id}: ${v.help} (${v.nodes.length}) e.g. ${v.nodes[0]?.html.slice(0, 140)}`)).toEqual([]);
    });
  }

  test("no serious or critical violations: Pro workspace tabs", async ({ page }) => {
    await page.goto("/payment-success?session_id=cs_test_PAID0000000001");
    await page.waitForURL("**/pro");
    for (const tab of ["Overview", "30-day plan", "Rooms", "Traps", "Seal up", "Evidence log", "Supplies", "Get help", "Prevent"]) {
      await page.getByRole("tab", { name: tab, exact: true }).click();
      const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      const bad = result.violations.filter(v => v.impact === "serious" || v.impact === "critical");
      expect(bad.map(v => `${tab} / ${v.id}: ${v.help} (${v.nodes.length}) e.g. ${v.nodes[0]?.html.slice(0, 140)}`)).toEqual([]);
    }
  });
});
