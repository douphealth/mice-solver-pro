// @vitest-environment node
import { describe, expect, it } from "vitest";
import { evaluateSession, hmacSha256Hex, maskEmail, parseSignatureHeader, SESSION_ID_RE, verifyStripeSignature } from "./stripe";

const cfg = { PAYMENT_LINK_ID: "plink_ours", PRODUCT_ID: "prod_ours" };
const paid = (over: Record<string, unknown> = {}) => ({
  object: "checkout.session", id: "cs_live_a1B2c3D4e5F6g7H8", mode: "payment", status: "complete", payment_status: "paid",
  payment_link: "plink_ours", created: 1790000000, customer_details: { email: "jordan@example.com" }, ...over,
});

describe("evaluateSession", () => {
  it("grants access to a paid session from our payment link and masks the email", () => {
    const e = evaluateSession(paid(), cfg);
    expect(e.active).toBe(true);
    expect(e.email).toMatch(/^j\*+@example\.com$/);
    expect(e.email).not.toContain("jordan");
    expect(e.purchasedAt).toBe(new Date(1790000000 * 1000).toISOString());
  });
  it.each([
    ["unpaid", { payment_status: "unpaid" }],
    ["open session", { status: "open", payment_status: "unpaid" }],
    ["no payment required", { payment_status: "no_payment_required" }],
    ["subscription mode", { mode: "subscription" }],
    ["expired", { status: "expired" }],
  ])("denies %s sessions", (_n, over) => {
    const e = evaluateSession(paid(over), cfg);
    expect(e.active).toBe(false);
    expect(e.reason).toBe("unpaid");
  });
  it("denies sessions bought through a different payment link on the shared Stripe account", () => {
    expect(evaluateSession(paid({ payment_link: "plink_other_site" }), cfg)).toEqual({ active: false, reason: "wrong_product" });
  });
  it("accepts sessions that carry this app's metadata even without a payment_link field", () => {
    expect(evaluateSession(paid({ payment_link: null, metadata: { app: "mice-elimination" } }), cfg).active).toBe(true);
  });
  it("rejects objects that are not checkout sessions", () => {
    expect(evaluateSession({ object: "payment_intent" }, cfg).reason).toBe("not_found");
    expect(evaluateSession(null, cfg).reason).toBe("not_found");
  });
  it("revokes access after a full refund or a dispute", () => {
    const full = { latest_charge: { refunded: true, amount: 999, amount_refunded: 999 } };
    expect(evaluateSession(paid({ payment_intent: full }), cfg)).toEqual({ active: false, reason: "refunded" });
    const amountOnly = { latest_charge: { refunded: false, amount: 999, amount_refunded: 999 } };
    expect(evaluateSession(paid({ payment_intent: amountOnly }), cfg).reason).toBe("refunded");
    const disputed = { latest_charge: { refunded: false, disputed: true, amount: 999, amount_refunded: 0 } };
    expect(evaluateSession(paid({ payment_intent: disputed }), cfg).reason).toBe("refunded");
  });
  it("keeps access after a partial refund smaller than the charge", () => {
    const partial = { latest_charge: { refunded: false, amount: 999, amount_refunded: 200 } };
    expect(evaluateSession(paid({ payment_intent: partial }), cfg).active).toBe(true);
  });
  it("still works when the charge could not be expanded (string id)", () => {
    expect(evaluateSession(paid({ payment_intent: "pi_123" }), cfg).active).toBe(true);
  });
});

describe("helpers", () => {
  it("validates session ids strictly", () => {
    expect(SESSION_ID_RE.test("cs_live_a1B2c3D4e5F6g7H8")).toBe(true);
    expect(SESSION_ID_RE.test("cs_test_a1B2c3D4e5F6g7H8")).toBe(true);
    for (const bad of ["", "cs_live_", "cs_live_short", "pi_live_a1B2c3D4e5F6g7H8", "cs_live_a1B2c3D4e5F6g7H8/../x", "cs_live_a1B2c3D4e5F6g7H8?x=1"]) expect(SESSION_ID_RE.test(bad)).toBe(false);
  });
  it("masks emails", () => {
    expect(maskEmail("a@x.com")).toBe("a**@x.com");
    expect(maskEmail("longname@x.com")).toBe("l******@x.com");
    expect(maskEmail("nope")).toBeUndefined();
    expect(maskEmail(undefined)).toBeUndefined();
  });
});

describe("Stripe webhook signature", () => {
  const secret = "whsec_test_secret";
  const body = JSON.stringify({ id: "evt_1", type: "checkout.session.completed" });
  const now = 1790000000;
  const sign = async (t: number, b = body, s = secret) => `t=${t},v1=${await hmacSha256Hex(s, `${t}.${b}`)}`;

  it("accepts a correctly signed, fresh payload", async () => {
    expect(await verifyStripeSignature(body, await sign(now), secret, 300, now)).toBe(true);
  });
  it("accepts when any one of several v1 signatures matches (secret rotation)", async () => {
    const good = await hmacSha256Hex(secret, `${now}.${body}`);
    expect(await verifyStripeSignature(body, `t=${now},v1=deadbeef,v1=${good}`, secret, 300, now)).toBe(true);
  });
  it("rejects a tampered body, wrong secret, stale timestamp and malformed headers", async () => {
    expect(await verifyStripeSignature(body + " ", await sign(now), secret, 300, now)).toBe(false);
    expect(await verifyStripeSignature(body, await sign(now, body, "whsec_other"), secret, 300, now)).toBe(false);
    expect(await verifyStripeSignature(body, await sign(now - 301), secret, 300, now)).toBe(false);
    expect(await verifyStripeSignature(body, null, secret, 300, now)).toBe(false);
    expect(await verifyStripeSignature(body, "garbage", secret, 300, now)).toBe(false);
    expect(await verifyStripeSignature(body, `t=${now}`, secret, 300, now)).toBe(false);
    expect(await verifyStripeSignature(body, await sign(now), "", 300, now)).toBe(false);
  });
  it("parses headers", () => {
    expect(parseSignatureHeader("t=12, v1=aa, v0=bb, v1=cc")).toEqual({ t: "12", v1: ["aa", "cc"] });
  });
});
