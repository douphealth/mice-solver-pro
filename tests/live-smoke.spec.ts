import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const noOverflow = async (page: Page) => expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBeTruthy();

function watchErrors(page: Page, allow404 = false): string[] {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(`pageerror: ${e.message}`));
  page.on("console", m => { if (m.type() === "error" && !(allow404 && /status of 404/.test(m.text()))) errors.push(`console: ${m.text()}`); });
  return errors;
}

test("every public page renders cleanly (no console or CSP errors, no overflow)", async ({ page }) => {
  for (const path of ["/", "/quiz", "/tools/calculator", "/tools/entry-points", "/tools/trap-placement", "/tools/cleanup-guide", "/pro", "/restore", "/privacy", "/terms"]) {
    const errors = watchErrors(page);
    await page.goto(path, { waitUntil: "networkidle" });
    await expect(page.locator("h1")).toHaveCount(1);
    await noOverflow(page);
    expect(errors, path).toEqual([]);
  }
});

test("free flow: quiz, plan, PDF and calendar", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/quiz");
  await page.getByLabel("Possible droppings").check(); await page.getByRole("button", { name: "Next" }).click();
  await page.getByLabel("Kitchen", { exact: true }).check(); await page.getByRole("button", { name: "Next" }).click();
  await page.getByLabel("Detached house").check(); await page.getByRole("button", { name: "Next" }).click();
  await page.getByLabel("None of these").check(); await page.getByRole("button", { name: "Next" }).click();
  await page.getByLabel("Nothing yet").check(); await page.getByRole("button", { name: "Next" }).click();
  await page.getByLabel("Thick containers with tight lids").check(); await page.getByRole("button", { name: "Next" }).click();
  await page.getByLabel("Just noticed").check(); await page.getByRole("button", { name: "View my plan" }).click();
  await expect(page.getByRole("heading", { name: "Your mouse control plan" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Physical signs reported: inspect and verify" })).toBeVisible();
  await noOverflow(page);
  const [pdf] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download free plan PDF" }).click()]);
  expect(readFileSync(await pdf.path()).subarray(0, 5).toString()).toBe("%PDF-");
  const [ics] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Add trap-check reminders" }).click()]);
  expect(readFileSync(await ics.path(), "utf8")).toContain("BEGIN:VCALENDAR");
  expect(errors).toEqual([]);
});

test("Pro page is honest: it sells only while purchases can be verified", async ({ page, request }) => {
  const health = await (await request.get("/api/health")).json();
  await page.goto("/pro");
  if (health.stripe) {
    await expect(page.getByTestId("checkout-link").first()).toHaveAttribute("href", "https://buy.stripe.com/dRm6oH61y1qwbUN3UGejK02");
  } else {
    await expect(page.getByTestId("checkout-unavailable").first()).toBeVisible();
    await expect(page.getByTestId("checkout-link")).toHaveCount(0);
  }
  await expect(page.getByText("Your Pro workspace")).toHaveCount(0);
});

test("a made-up purchase reference never unlocks Pro", async ({ page }) => {
  await page.goto("/payment-success?session_id=cs_live_a1B2c3D4e5F6g7H8i9J0");
  await expect(page.getByRole("heading", { name: /couldn't finish checking|couldn't confirm a Pro purchase/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your Pro workspace" })).toHaveCount(0);
  const r = await page.request.get("/api/pro-pack?session_id=cs_live_a1B2c3D4e5F6g7H8i9J0");
  expect([402, 503]).toContain(r.status());
  expect(await r.text()).not.toContain("milestones");
});

test("platform: headers, legacy routes, input validation (no side effects)", async ({ request }) => {
  const home = await request.get("/");
  expect(home.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(home.headers()["x-mgg-release"]).toBe("pro-workspace-2026-10-02");
  for (const p of ["/plan", "/pro", "/payment-success", "/restore"]) expect((await request.get(p)).headers()["x-robots-tag"]).toContain("noindex");
  expect((await request.get("/mice-backend/auth/v1/health")).status()).toBe(410);
  expect((await request.get("/dashboard", { maxRedirects: 0 })).status()).toBe(301);
  expect((await request.get("/no-such-page")).status()).toBe(404);
  expect((await request.post("/api/lead", { data: { email: "not-an-email", consent: true } })).status()).toBe(400);
  expect((await request.post("/api/lead", { data: { email: "a@example.com", consent: false } })).status()).toBe(400);
  expect((await request.get("/api/entitlement?session_id=bogus")).status()).toBe(400);
  expect((await request.post("/api/stripe-webhook", { data: "{}" })).status()).toBeGreaterThanOrEqual(400);
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Sitemap: https://elimination.micegoneguide.com/sitemap.xml");
  const og = await request.get("/og-image.png");
  expect(og.status()).toBe(200);
  expect(og.headers()["content-type"]).toContain("image/png");
});
