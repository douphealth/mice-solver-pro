import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const MOCK = "http://127.0.0.1:9911";
const PAID = "cs_test_PAID0000000001";
const UNPAID = "cs_test_UNPAID0000001";
const REFUNDED = "cs_test_REFUNDED000001";
const OTHER = "cs_test_OTHER000000001";
const NOEXPAND = "cs_test_NOEXPAND000001";
const CHECKOUT = "https://buy.stripe.com/dRm6oH61y1qwbUN3UGejK02";

const noOverflow = async (page: Page) => expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBeTruthy();
const mockCalls = async () => (await fetch(`${MOCK}/__calls`)).json() as Promise<{ stripe: any[]; brevo: { path: string; body: any }[] }>;
const resetMock = () => fetch(`${MOCK}/__reset`);

/** Collect console errors and CSP violations so any regression fails the test. */
function watchErrors(page: Page, allow404 = false): string[] {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(`pageerror: ${e.message}`));
  page.on("console", m => { if (m.type() === "error" && !/Failed to load resource.*(fonts\.g|net::ERR)/i.test(m.text()) && !(allow404 && /status of 404/.test(m.text()))) errors.push(`console: ${m.text()}`); });
  return errors;
}

async function completeQuiz(page: Page) {
  await page.goto("/quiz");
  await expect(page.getByRole("button", { name: "Next" })).toBeDisabled();
  await page.getByLabel("Possible droppings").check();
  await page.getByLabel("Damaged wiring").check();
  await expect(page.getByText("Safety first")).toBeVisible();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByLabel("Kitchen", { exact: true }).check();
  await page.getByLabel("Attic", { exact: true }).check();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByLabel("Apartment or condo").check();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByLabel("Children").check();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByLabel("Glue traps").check();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByLabel("A mix, including bags or cardboard").check();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByLabel("It came back").check();
  await page.getByRole("button", { name: "View my plan" }).click();
}

test.describe("free planner", () => {
  test("quiz to plan, with progress that survives a reload, PDF and calendar", async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("source-backed plan");
    await noOverflow(page);
    await completeQuiz(page);

    await expect(page).toHaveURL(/\/plan$/);
    await expect(page.getByRole("heading", { name: "Your mouse control plan" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Reported conditions need qualified attention" })).toBeVisible();
    await expect(page.getByText("Keep clear of damaged wiring").first()).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, follow");
    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(/\b\d{1,3}%\s*(chance|risk|infest)|estimated population|severity score|[1-9]\/10|12,847|94%/i);
    await noOverflow(page);

    // tick a step, reload, still ticked
    const first = page.getByRole("checkbox").first();
    await first.click();
    await expect(first).toHaveAttribute("aria-checked", "true");
    await page.reload();
    await expect(page.getByRole("checkbox").first()).toHaveAttribute("aria-checked", "true");
    await expect(page.getByText("1 of ").first()).toBeVisible();

    const [pdf] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download free plan PDF" }).click()]);
    expect(pdf.suggestedFilename()).toBe("MiceGoneGuide-Mouse-Control-Plan.pdf");
    const pdfBytes = readFileSync(await pdf.path());
    expect(pdfBytes.subarray(0, 5).toString()).toBe("%PDF-");
    expect(pdfBytes.length).toBeGreaterThan(8000);

    const [ics] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Add trap-check reminders" }).click()]);
    const text = readFileSync(await ics.path(), "utf8");
    expect(text.startsWith("BEGIN:VCALENDAR")).toBe(true);
    expect((text.match(/BEGIN:VEVENT/g) ?? []).length).toBe(14);
    expect(errors).toEqual([]);
  });

  test("the legacy /report URL and unknown pages behave", async ({ page, request }) => {
    await page.goto("/report");
    await expect(page).toHaveURL(/\/quiz$/);
    const res = await request.get("/definitely-not-here");
    expect(res.status()).toBe(404);
    expect(res.headers()["x-robots-tag"]).toBe("noindex");
    const redirect = await request.get("/dashboard", { maxRedirects: 0 });
    expect(redirect.status()).toBe(301);
  });

  test("email check-ins need consent and reach the email provider", async ({ page }) => {
    await resetMock();
    await completeQuiz(page);
    await page.getByLabel("Email", { exact: true }).fill("pat@example.com");
    await page.getByRole("button", { name: "Send me check-ins" }).click();
    await expect(page.getByRole("alert")).toContainText("tick the box");
    await page.getByLabel(/Send me MiceGoneGuide planning emails/).check();
    await page.getByRole("button", { name: "Send me check-ins" }).click();
    await expect(page.getByText("You're on the list", { exact: true })).toBeVisible();
    const { brevo } = await mockCalls();
    expect(brevo.find(c => c.path === "/contacts")?.body.email).toBe("pat@example.com");
    expect(brevo.find(c => c.path === "/smtp/email")?.body.htmlContent).toContain("/tools/cleanup-guide");
  });
});

test.describe("resilience after deploys", () => {
  test("a missing script chunk triggers one automatic reload instead of a blank page", async ({ page }) => {
    let failures = 0;
    await page.route("**/assets/QuizPage-*.js", route => { if (failures++ === 0) return route.abort(); return route.continue(); });
    await page.goto("/");
    await page.getByRole("link", { name: "Build my free plan" }).first().click();
    await expect(page.getByRole("heading", { name: "What have you actually observed?" })).toBeVisible({ timeout: 15000 });
    expect(failures).toBeGreaterThanOrEqual(2);
  });

  test("a permanently broken chunk shows a friendly screen, not a blank page", async ({ page }) => {
    await page.route("**/assets/QuizPage-*.js", route => route.abort());
    await page.goto("/");
    await page.evaluate(() => sessionStorage.setItem("mgg.chunk-reload", String(Date.now())));
    await page.getByRole("link", { name: "Build my free plan" }).first().click();
    await expect(page.getByRole("alert")).toContainText("Something went wrong on this page");
    await expect(page.getByRole("button", { name: "Reload page" })).toBeVisible();
  });
});

test.describe("free tools", () => {
  test("signs guide flags hazards", async ({ page }) => {
    await page.goto("/tools/calculator");
    await page.getByRole("button", { name: "Damaged wiring" }).click();
    await expect(page.getByText("Qualified help recommended")).toBeVisible();
    await expect(page.getByText(/qualified electrician/i).first()).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://elimination.micegoneguide.com/tools/calculator");
    await noOverflow(page);
  });
  test("entry-gap checklist keeps progress", async ({ page }) => {
    await page.goto("/tools/entry-points");
    await page.getByLabel("Apartment or condo").check();
    await expect(page.getByText(/shared-wall/i).first()).toBeVisible();
    await page.getByRole("checkbox").first().click();
    await page.reload();
    await expect(page.getByText("1 of 20 areas checked")).toBeVisible();
    await expect(page.getByLabel("Apartment or condo")).toBeChecked();
    await noOverflow(page);
  });
  test("trap guide and cleanup guide", async ({ page }) => {
    await page.goto("/tools/trap-placement");
    await expect(page.getByRole("heading", { name: "Seven rules for effective trapping" })).toBeVisible();
    await expect(page.getByText(/no more than about 10 feet apart/i).first()).toBeVisible();
    await noOverflow(page);
    await page.goto("/tools/cleanup-guide");
    await expect(page.getByText("Never vacuum or sweep rodent urine, droppings or nests")).toBeVisible();
    await page.getByRole("tab", { name: "Dead rodents and nests" }).click();
    await expect(page.getByText("Tie the bag closed")).toBeVisible();
    await page.getByRole("checkbox").first().click();
    await expect(page.getByText("1/7")).toBeVisible();
    await noOverflow(page);
  });
});

test.describe("Pro purchase and gating", () => {
  test("sales page links to the live Stripe checkout and never unlocks by itself", async ({ page }) => {
    await page.goto("/pro");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Pro Masterplan");
    await expect(page.getByTestId("checkout-link").first()).toHaveAttribute("href", CHECKOUT);
    await expect(page.getByText("Your Pro workspace")).toHaveCount(0);
    await noOverflow(page);
  });

  test("sales pause themselves when the server can't verify purchases", async ({ page }) => {
    await page.route("**/api/health", route => route.fulfill({ json: { ok: true, stripe: false, email: true } }));
    await page.goto("/pro");
    await expect(page.getByTestId("checkout-unavailable").first()).toBeVisible();
    await expect(page.getByTestId("checkout-link")).toHaveCount(0);
  });

  test("if verification is briefly unavailable the buyer's reference is kept and Pro opens once it recovers", async ({ page }) => {
    await page.route("**/api/entitlement*", route => route.fulfill({ status: 503, json: { entitlement: { active: false, reason: "unavailable" }, message: "We couldn't reach the payment service." } }));
    await page.route("**/api/pro-pack*", route => route.fulfill({ status: 503, json: { entitlement: { active: false, reason: "unavailable" } } }));
    await page.goto(`/payment-success?session_id=${PAID}`);
    await expect(page.getByRole("heading", { name: "We couldn't finish checking" })).toBeVisible();
    await expect(page.getByText(/saved on this device/)).toBeVisible();
    await page.unroute("**/api/entitlement*");
    await page.unroute("**/api/pro-pack*");
    await page.goto("/pro");
    await expect(page.getByRole("heading", { name: "Your Pro workspace" })).toBeVisible();
  });

  test("a stored but unpaid or foreign session never unlocks Pro", async ({ page }) => {
    for (const id of [UNPAID, OTHER, "cs_test_NOSUCH00000001"]) {
      await page.goto("/");
      await page.evaluate(sid => localStorage.setItem("mgg.pro.v1", JSON.stringify({ sessionId: sid, savedAt: new Date().toISOString() })), id);
      await page.goto("/pro");
      await expect(page.getByText("Your Pro workspace")).toHaveCount(0);
      await expect(page.getByTestId("checkout-link").first()).toBeVisible();
    }
  });

  test("the paid content is not in the public bundle and is refused without a verified purchase", async ({ request }) => {
    expect(await (await request.get("/pro")).text()).not.toContain("d5-steel");
    const unpaid = await request.get(`/api/pro-pack?session_id=${UNPAID}`);
    expect(unpaid.status()).toBe(402);
    expect(await unpaid.text()).not.toContain("milestones");
    const paid = await request.get(`/api/pro-pack?session_id=${PAID}`);
    expect(paid.status()).toBe(200);
    expect(await paid.text()).toContain("d5-steel");
  });

  test("every bundled script is free of Pro-only content", async ({ page }) => {
    const bodies: string[] = [];
    page.on("response", async r => { if (r.url().endsWith(".js")) bodies.push(await r.text().catch(() => "")); });
    for (const p of ["/", "/quiz", "/plan", "/pro", "/tools/trap-placement"]) await page.goto(p, { waitUntil: "networkidle" });
    expect(bodies.length).toBeGreaterThan(3);
    for (const b of bodies) { expect(b).not.toContain("d5-steel"); expect(b).not.toContain("Pack small holes with coarse steel wool"); }
  });

  test("paid return: verified with Stripe, unlocked, and usable", async ({ page }) => {
    const errors = watchErrors(page);
    await resetMock();
    await completeQuiz(page);
    await page.goto(`/payment-success?session_id=${PAID}`);
    await expect(page.getByRole("heading", { name: /Payment confirmed/ })).toBeVisible();
    await page.waitForURL("**/pro");
    await expect(page.getByRole("heading", { name: "Your Pro workspace" })).toBeVisible();
    await expect(page.getByText(/Purchase verified/)).toBeVisible();
    await noOverflow(page);
    expect((await mockCalls()).stripe.some(c => c.path === `/v1/checkout/sessions/${PAID}`)).toBe(true);

    // schedule: personalised, dated, persistent
    await page.getByRole("tab", { name: "30-day plan", exact: true }).click();
    await expect(page.getByText("Remove glue traps and stop using them")).toBeVisible();
    const task = page.getByRole("checkbox").first();
    await task.click();
    await page.reload();
    await page.getByRole("tab", { name: "30-day plan", exact: true }).click();
    await expect(page.getByRole("checkbox").first()).toHaveAttribute("aria-checked", "true");

    // rooms from the quiz
    await page.getByRole("tab", { name: "Rooms", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Your rooms" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Kitchen" })).toBeVisible();

    // trap layout helper: 24 ft -> 3 positions at 4, 12 and 20 ft
    await page.getByRole("tab", { name: "Traps", exact: true }).click();
    await page.getByRole("button", { name: "Add a wall" }).click();
    await page.getByLabel("Length (feet)").fill("24");
    await expect(page.getByRole("status").filter({ hasText: "3 traps" })).toContainText("4 ft, 12 ft, 20 ft");
    await page.getByLabel(/Use pairs/).check();
    await expect(page.getByRole("status").filter({ hasText: "6 traps" })).toBeVisible();

    // evidence log
    await page.getByRole("tab", { name: "Evidence log", exact: true }).click();
    await page.getByLabel("What happened").selectOption("catch");
    await page.getByLabel("Where").fill("Kitchen, behind the stove");
    await page.getByRole("button", { name: "Add to log" }).click();
    await expect(page.getByText("Trap catch × 1")).toBeVisible();
    await expect(page.getByText("0 days since your last logged sign")).toBeVisible();
    const [csv] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Export CSV" }).click()]);
    expect(readFileSync(await csv.path(), "utf8")).toContain("Trap catch,\"Kitchen, behind the stove\",1");

    // supplies carry the affiliate tag and sponsored rel
    await page.getByRole("tab", { name: "Supplies", exact: true }).click();
    const link = page.getByRole("link", { name: "Search on Amazon" }).first();
    await expect(link).toHaveAttribute("href", /tag=papalex-20/);
    await expect(link).toHaveAttribute("rel", /sponsored/);
    await expect(page.getByText(/As an Amazon Associate/).first()).toBeVisible();

    // downloads
    const [pdf] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download Pro PDF" }).click()]);
    expect(pdf.suggestedFilename()).toBe("MiceGoneGuide-Pro-Masterplan.pdf");
    const bytes = readFileSync(await pdf.path());
    expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
    expect(bytes.length).toBeGreaterThan(20000);
    const [ics] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Add plan to calendar" }).click()]);
    expect(readFileSync(await ics.path(), "utf8")).toContain("SUMMARY:MiceGoneGuide - Day 0: Safety check and setup");
    expect(errors).toEqual([]);
  });

  test("works when the key can't read refund details", async ({ page }) => {
    await page.goto(`/payment-success?session_id=${NOEXPAND}`);
    await page.waitForURL("**/pro");
    await expect(page.getByRole("heading", { name: "Your Pro workspace" })).toBeVisible();
  });

  test("processing, refunded, foreign and missing purchases each get an honest message", async ({ page }) => {
    await page.goto(`/payment-success?session_id=${UNPAID}`);
    await expect(page.getByRole("heading", { name: "Your payment is still processing" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Check again" })).toBeVisible();
    await page.goto(`/payment-success?session_id=${REFUNDED}`);
    await expect(page.getByRole("heading", { name: "This purchase was refunded" })).toBeVisible();
    await page.goto(`/payment-success?session_id=${OTHER}`);
    await expect(page.getByRole("heading", { name: "We couldn't confirm a Pro purchase" })).toBeVisible();
    await page.goto("/payment-success?session_id=not-a-session");
    await expect(page.getByRole("heading", { name: "No purchase reference found" })).toBeVisible();
    await page.goto("/payment-success");
    await expect(page.getByRole("heading", { name: "No purchase reference found" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Your Pro workspace" })).toHaveCount(0);
  });

  test("a refund after purchase ends access on the next visit", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(sid => localStorage.setItem("mgg.pro.v1", JSON.stringify({ sessionId: sid, savedAt: new Date().toISOString() })), REFUNDED);
    await page.goto("/pro");
    await expect(page.getByText(/purchase was refunded/i)).toBeVisible();
    await expect(page.getByText("Your Pro workspace")).toHaveCount(0);
  });

  test("the saved copy opens offline, and says so", async ({ page, context }) => {
    await page.goto(`/payment-success?session_id=${PAID}`);
    await page.waitForURL("**/pro");
    await expect(page.getByRole("heading", { name: "Your Pro workspace" })).toBeVisible();
    await context.route("**/api/pro-pack*", route => route.abort());
    await page.reload();
    await expect(page.getByRole("heading", { name: "Your Pro workspace" })).toBeVisible();
    await expect(page.getByText(/couldn't reach the server/i)).toBeVisible();
  });

  test("restore by email sends a link only when a purchase exists, with identical answers", async ({ page }) => {
    await resetMock();
    await page.goto("/restore");
    await page.getByLabel("Email used at checkout").fill("buyer@example.com");
    await page.getByRole("button", { name: "Send link" }).click();
    const found = await page.getByText(/If a Pro purchase exists/).textContent();
    const mail = (await mockCalls()).brevo.find(c => c.path === "/smtp/email");
    expect(mail?.body.to[0].email).toBe("buyer@example.com");
    expect(mail?.body.htmlContent).toContain("/payment-success?session_id=cs_test_PAID0000RESTORE");

    await resetMock();
    await page.goto("/restore");
    await page.getByLabel("Email used at checkout").fill("nobody@example.com");
    await page.getByRole("button", { name: "Send link" }).click();
    await expect(page.getByText(/If a Pro purchase exists/)).toHaveText(found!);
    expect((await mockCalls()).brevo).toHaveLength(0);
  });

  test("pasting an access link restores access", async ({ page }) => {
    await page.goto("/restore");
    await page.locator("#restore-link").fill(`https://elimination.micegoneguide.com/payment-success?session_id=${PAID}`);
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.waitForURL("**/pro");
    await expect(page.getByRole("heading", { name: "Your Pro workspace" })).toBeVisible();
  });
});

test.describe("Stripe webhook and platform", () => {
  const event = (payload: object) => {
    const raw = JSON.stringify(payload);
    const t = Math.floor(Date.now() / 1000);
    return { raw, header: `t=${t},v1=${createHmac("sha256", "whsec_local_mock_secret").update(`${t}.${raw}`).digest("hex")}` };
  };
  const completed = { id: "evt_e2e_1", type: "checkout.session.completed", data: { object: { object: "checkout.session", id: PAID, mode: "payment", status: "complete", payment_status: "paid", payment_link: "plink_1UCvLgGCqwm95OGXtz60RBjB", customer_details: { email: "buyer@example.com" } } } };

  test("signed events send the access email, and bad signatures are rejected", async ({ request }) => {
    await resetMock();
    const bad = await request.post("/api/stripe-webhook", { data: JSON.stringify(completed), headers: { "stripe-signature": "t=1,v1=bad" } });
    expect(bad.status()).toBe(400);
    const { raw, header } = event({ ...completed, id: `evt_e2e_${Date.now()}` });
    const ok = await request.post("/api/stripe-webhook", { data: raw, headers: { "stripe-signature": header } });
    expect(ok.status()).toBe(200);
    const mail = (await mockCalls()).brevo.find(c => c.path === "/smtp/email");
    expect(mail?.body.to[0].email).toBe("buyer@example.com");
    expect(mail?.body.htmlContent).toContain(`session_id=${PAID}`);
  });

  test("security headers and search-engine hygiene", async ({ request }) => {
    const home = await request.get("/");
    expect(home.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(home.headers()["x-content-type-options"]).toBe("nosniff");
    for (const p of ["/plan", "/pro", "/payment-success", "/restore"]) {
      const r = await request.get(p);
      expect(r.headers()["x-robots-tag"]).toContain("noindex");
      expect(r.headers()["cache-control"]).toBe("no-store");
    }
    const sitemap = await (await request.get("/sitemap.xml")).text();
    for (const p of ["/quiz", "/tools/trap-placement", "/tools/cleanup-guide", "/tools/entry-points", "/tools/calculator"]) expect(sitemap).toContain(`https://elimination.micegoneguide.com${p}`);
    expect(sitemap).not.toMatch(/\/(plan|pro|auth|dashboard|payment-success|restore)</);
    const legacy = await request.get("/mice-backend/auth/v1/health");
    expect(legacy.status()).toBe(410);
  });

  test("health reports configuration, not secrets", async ({ request }) => {
    const body = await (await request.get("/api/health")).json();
    expect(body).toMatchObject({ ok: true, stripe: true, stripeKeySet: true, email: true });
    expect(JSON.stringify(body)).not.toMatch(/sk_|rk_|whsec|xkeysib/);
  });
});

test.describe("every page loads cleanly", () => {
  for (const path of ["/", "/quiz", "/tools/calculator", "/tools/entry-points", "/tools/trap-placement", "/tools/cleanup-guide", "/pro", "/restore", "/privacy", "/terms", "/nope"]) {
    test(`no errors or overflow: ${path}`, async ({ page }) => {
      const errors = watchErrors(page, path === "/nope");
      await page.goto(path, { waitUntil: "networkidle" });
      await expect(page.locator("h1")).toHaveCount(1);
      await noOverflow(page);
      expect(errors).toEqual([]);
    });
  }
});
