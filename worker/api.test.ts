// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import worker from "./index";
import { hmacSha256Hex } from "./stripe";
import type { Env } from "./types";

const ORIGIN = "https://elimination.micegoneguide.com";
const SID = "cs_live_a1B2c3D4e5F6g7H8";

interface Calls { stripe: string[]; brevo: { path: string; body: any }[] }
let calls: Calls;
let sessions: Record<string, any>;
let stripeStatusOverride: number | null;
let expandDenied: boolean;
let listResult: any[];
let brevoFail: boolean;

const paidSession = (over: Record<string, unknown> = {}) => ({
  object: "checkout.session", id: SID, mode: "payment", status: "complete", payment_status: "paid", payment_link: "plink_ours",
  created: 1790000000, customer_details: { email: "jordan@example.com" }, ...over,
});

const assets = {
  async fetch(req: Request) {
    const { pathname } = new URL(req.url);
    if (pathname === "/" || pathname === "/index.html") return new Response("<!doctype html><title>app</title>", { headers: { "content-type": "text/html; charset=utf-8" } });
    if (pathname === "/assets/index-abc.js") return new Response("console.log(1)", { headers: { "content-type": "text/javascript" } });
    if (pathname === "/robots.txt") return new Response("User-agent: *", { headers: { "content-type": "text/plain" } });
    return new Response("nf", { status: 404 });
  },
};

const baseEnv = (over: Partial<Env> = {}): Env => ({
  ASSETS: assets, PUBLIC_ORIGIN: ORIGIN, RELEASE: "test", PAYMENT_LINK_ID: "plink_ours", PRODUCT_ID: "prod_ours", PRICE_ID: "price_ours",
  BREVO_LIST_ID: "8", STRIPE_SECRET_KEY: "rk_live_dummy", BREVO_API_KEY: "xkeysib-dummy", STRIPE_WEBHOOK_SECRET: "whsec_dummy", ...over,
});

beforeEach(() => {
  calls = { stripe: [], brevo: [] };
  sessions = { [SID]: paidSession() };
  stripeStatusOverride = null;
  expandDenied = false;
  listResult = [];
  brevoFail = false;
  vi.stubGlobal("fetch", async (input: any, init?: any) => {
    const url = new URL(typeof input === "string" ? input : input.url);
    if (url.hostname === "api.stripe.com") {
      calls.stripe.push(url.pathname + url.search);
      expect(init?.headers?.Authorization).toBe("Bearer rk_live_dummy");
      if (stripeStatusOverride) return new Response(JSON.stringify({ error: { message: "boom" } }), { status: stripeStatusOverride });
      const m = url.pathname.match(/^\/v1\/checkout\/sessions\/(cs_[A-Za-z0-9_]+)$/);
      if (m) {
        if (url.searchParams.has("expand[]") && expandDenied) return new Response(JSON.stringify({ error: { message: "The provided key does not have the required permissions" } }), { status: 403 });
        const s = sessions[m[1]];
        return s ? new Response(JSON.stringify(s), { status: 200 }) : new Response(JSON.stringify({ error: { message: `No such checkout.session: '${m[1]}'` } }), { status: 404 });
      }
      if (url.pathname === "/v1/checkout/sessions") return new Response(JSON.stringify({ data: listResult }), { status: 200 });
    }
    if (url.hostname === "api.brevo.com") {
      calls.brevo.push({ path: url.pathname.replace("/v3", ""), body: JSON.parse(init.body) });
      return new Response(JSON.stringify({}), { status: brevoFail ? 500 : 201 });
    }
    return new Response("unexpected", { status: 500 });
  });
});
afterEach(() => vi.unstubAllGlobals());

const get = (path: string, env = baseEnv(), headers: Record<string, string> = {}) => worker.fetch(new Request(ORIGIN + path, { headers }), env);
const post = (path: string, body: unknown, env = baseEnv(), headers: Record<string, string> = {}) =>
  worker.fetch(new Request(ORIGIN + path, { method: "POST", headers: { "content-type": "application/json", origin: ORIGIN, ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) }), env);

describe("health", () => {
  it("reports configuration without exposing secrets", async () => {
    const res = await get("/api/health");
    const body = await res.json() as any;
    expect(res.status).toBe(200);
    expect(body).toEqual({ ok: true, release: "test", stripe: true, stripeKeySet: true, webhook: true, email: true });
    expect(JSON.stringify(body)).not.toContain("dummy");
    expect(res.headers.get("cache-control")).toBe("no-store");
  });
});

describe("health readiness", () => {
  it("reports stripe:false when the key is rejected for reading Checkout Sessions, so sales stay paused", async () => {
    stripeStatusOverride = 403;
    const body = await (await get("/api/health")).json() as any;
    expect(body.stripe).toBe(false);
    expect(body.stripeKeySet).toBe(true);
  });
  it("reports stripe:false with no key and never calls Stripe", async () => {
    const body = await (await get("/api/health", baseEnv({ STRIPE_SECRET_KEY: undefined }))).json() as any;
    expect(body).toMatchObject({ stripe: false, stripeKeySet: false });
    expect(calls.stripe).toHaveLength(0);
  });
});

describe("/api/entitlement", () => {
  it("activates a paid purchase of the Pro product", async () => {
    const res = await get(`/api/entitlement?session_id=${SID}`);
    const body = await res.json() as any;
    expect(res.status).toBe(200);
    expect(body.entitlement.active).toBe(true);
    expect(body.entitlement.email).toMatch(/^j\*+@example\.com$/);
    expect(body.pack).toBeUndefined();
    expect(calls.stripe[0]).toContain("expand%5B%5D=payment_intent.latest_charge");
  });
  it("rejects malformed ids without calling Stripe", async () => {
    for (const bad of ["", "abc", "cs_live_short", "pi_live_a1B2c3D4e5F6g7H8"]) {
      const res = await get(`/api/entitlement?session_id=${bad}`);
      expect(res.status).toBe(400);
    }
    expect(calls.stripe).toHaveLength(0);
  });
  it("reports unknown sessions as not found", async () => {
    const res = await get("/api/entitlement?session_id=cs_live_zzzzzzzzzzzzzzzz");
    expect(res.status).toBe(200);
    expect((await res.json() as any).entitlement).toEqual({ active: false, reason: "not_found" });
  });
  it("denies unpaid, wrong-product and refunded sessions", async () => {
    sessions[SID] = paidSession({ payment_status: "unpaid" });
    expect(((await (await get(`/api/entitlement?session_id=${SID}`)).json()) as any).entitlement.reason).toBe("unpaid");
    sessions[SID] = paidSession({ payment_link: "plink_other" });
    expect(((await (await get(`/api/entitlement?session_id=${SID}`)).json()) as any).entitlement.reason).toBe("wrong_product");
    sessions[SID] = paidSession({ payment_intent: { latest_charge: { refunded: true, amount: 999, amount_refunded: 999 } } });
    expect(((await (await get(`/api/entitlement?session_id=${SID}`)).json()) as any).entitlement.reason).toBe("refunded");
  });
  it("falls back to a plain read when the key can't expand charges, and says refunds were not checked", async () => {
    expandDenied = true;
    const body = await (await get(`/api/entitlement?session_id=${SID}`)).json() as any;
    expect(body.entitlement.active).toBe(true);
    expect(body.refundCheck).toBe(false);
    expect(calls.stripe).toHaveLength(2);
  });
  it("returns 503 (not a false denial) when Stripe is unreachable or unconfigured", async () => {
    stripeStatusOverride = 500;
    expect((await get(`/api/entitlement?session_id=${SID}`)).status).toBe(503);
    stripeStatusOverride = null;
    expect((await get(`/api/entitlement?session_id=${SID}`, baseEnv({ STRIPE_SECRET_KEY: undefined }))).status).toBe(503);
  });
  it("only allows GET", async () => {
    expect((await post(`/api/entitlement?session_id=${SID}`, {})).status).toBe(405);
  });
});

describe("/api/pro-pack", () => {
  it("delivers the Pro content only to a verified purchase", async () => {
    const res = await get(`/api/pro-pack?session_id=${SID}`);
    const body = await res.json() as any;
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("private, no-store");
    expect(body.pack.milestones.length).toBeGreaterThan(8);
    expect(Object.keys(body.pack.rooms)).toContain("kitchen");
  });
  it("answers 402 with no content when unpaid, refunded or from another product", async () => {
    for (const over of [{ payment_status: "unpaid" }, { payment_link: "plink_other" }, { payment_intent: { latest_charge: { refunded: true, amount: 1, amount_refunded: 1 } } }]) {
      sessions[SID] = paidSession(over);
      const res = await get(`/api/pro-pack?session_id=${SID}`);
      const text = await res.text();
      expect(res.status).toBe(402);
      expect(text).not.toContain("milestones");
    }
  });
});

describe("/api/restore", () => {
  it("emails an access link when a paid purchase exists and answers identically when it does not", async () => {
    listResult = [paidSession({ id: "cs_live_OLDOLDOLDOLDOLD1", created: 1 }), paidSession({ id: SID, created: 2 }), { ...paidSession({ id: "cs_live_UNPAID123456789" }), payment_status: "unpaid" }, paidSession({ id: "cs_live_OTHER1234567890", payment_link: "plink_x", created: 99 })];
    const found = await post("/api/restore", { email: "Jordan@Example.com" });
    const foundBody = await found.json() as any;
    expect(found.status).toBe(200);
    const mail = calls.brevo.find(c => c.path === "/smtp/email")!;
    expect(mail.body.to[0].email).toBe("jordan@example.com");
    expect(mail.body.htmlContent).toContain(`/payment-success?session_id=${SID}`);

    calls.brevo.length = 0; listResult = [];
    const none = await post("/api/restore", { email: "nobody@example.com" });
    expect(none.status).toBe(200);
    expect(await none.json()).toEqual(foundBody);
    expect(calls.brevo).toHaveLength(0);
  });
  it("validates input and handles missing configuration", async () => {
    expect((await post("/api/restore", { email: "nope" })).status).toBe(400);
    expect((await post("/api/restore", "{bad json")).status).toBe(400);
    expect((await post("/api/restore", { email: "a@b.co" }, baseEnv({ BREVO_API_KEY: undefined }))).status).toBe(503);
    expect((await post("/api/restore", { email: "a@b.co" }, baseEnv(), { origin: "https://evil.example" })).status).toBe(403);
  });
});

describe("/api/stripe-webhook", () => {
  const event = (over: Record<string, unknown> = {}, type = "checkout.session.completed") => ({ id: "evt_1", type, data: { object: paidSession(over) } });
  const signed = async (payload: unknown, secret = "whsec_dummy", t = Math.floor(Date.now() / 1000)) => {
    const raw = JSON.stringify(payload);
    return worker.fetch(new Request(ORIGIN + "/api/stripe-webhook", { method: "POST", headers: { "stripe-signature": `t=${t},v1=${await hmacSha256Hex(secret, `${t}.${raw}`)}` }, body: raw }), baseEnv());
  };
  it("rejects bad signatures and unconfigured endpoints", async () => {
    expect((await signed(event(), "whsec_wrong")).status).toBe(400);
    expect((await worker.fetch(new Request(ORIGIN + "/api/stripe-webhook", { method: "POST", body: "{}" }), baseEnv())).status).toBe(400);
    expect((await worker.fetch(new Request(ORIGIN + "/api/stripe-webhook", { method: "POST", body: "{}" }), baseEnv({ STRIPE_WEBHOOK_SECRET: undefined }))).status).toBe(503);
  });
  it("sends the access email for a paid Pro checkout", async () => {
    const res = await signed(event());
    expect(res.status).toBe(200);
    const mail = calls.brevo.find(c => c.path === "/smtp/email")!;
    expect(mail.body.to[0].email).toBe("jordan@example.com");
    expect(mail.body.subject).toContain("Pro Masterplan");
  });
  it("ignores other products, unpaid sessions and unrelated events but still acknowledges them", async () => {
    for (const e of [event({ payment_link: "plink_other" }), event({ payment_status: "unpaid" }), { id: "evt_2", type: "charge.refunded", data: { object: {} } }]) {
      expect((await signed(e)).status).toBe(200);
    }
    expect(calls.brevo).toHaveLength(0);
  });
  it("never fails the webhook because email delivery failed", async () => {
    brevoFail = true;
    expect((await signed(event())).status).toBe(200);
  });
});

describe("/api/lead", () => {
  const valid = { email: "Pat@Example.com ", name: "Pat Smith", consent: true };
  it("requires consent and a valid email, and ignores honeypot submissions", async () => {
    expect((await post("/api/lead", { ...valid, consent: false })).status).toBe(400);
    expect((await post("/api/lead", { ...valid, email: "x" })).status).toBe(400);
    const bot = await post("/api/lead", { ...valid, website: "http://spam" });
    expect(bot.status).toBe(200);
    expect(calls.brevo).toHaveLength(0);
  });
  it("adds the contact to the list and sends the welcome email", async () => {
    const res = await post("/api/lead", valid);
    const body = await res.json() as any;
    expect(body).toMatchObject({ ok: true, email_sent: true });
    const contact = calls.brevo.find(c => c.path === "/contacts")!;
    expect(contact.body.email).toBe("pat@example.com");
    expect(contact.body.listIds).toEqual([8]);
    expect(contact.body.attributes.FIRSTNAME).toBe("Pat");
    const mail = calls.brevo.find(c => c.path === "/smtp/email")!;
    expect(mail.body.htmlContent).toContain("/tools/cleanup-guide");
    expect(mail.body.htmlContent).not.toMatch(/guarantee[sd]? (a |your )?(result|clearance)/i);
  });
  it("reports provider failure honestly and supports the legacy bundle path without a consent flag", async () => {
    brevoFail = true;
    expect((await post("/api/lead", valid)).status).toBe(502);
    brevoFail = false;
    expect((await post("/mice-backend/functions/v1/mice-elimination-lead", { email: "a@b.co" })).status).toBe(200);
    expect((await post("/api/lead", valid, baseEnv({ BREVO_API_KEY: undefined }))).status).toBe(503);
  });
});

describe("static app", () => {
  it("serves known routes with a strict CSP and keeps private pages out of search", async () => {
    const home = await get("/");
    expect(home.status).toBe(200);
    expect(home.headers.get("content-security-policy")).toContain("script-src 'self'");
    expect(home.headers.get("content-security-policy")).toContain("frame-ancestors 'none'");
    expect(home.headers.get("cache-control")).toBe("no-cache");
    const pro = await get("/pro");
    expect(pro.status).toBe(200);
    expect(pro.headers.get("x-robots-tag")).toContain("noindex");
    expect(pro.headers.get("cache-control")).toBe("no-store");
    const ok = await get("/payment-success?session_id=" + SID);
    expect(ok.headers.get("referrer-policy")).toBe("no-referrer");
  });
  it("returns real 404s for unknown pages, long-cache hashed assets and redirects the retired account routes", async () => {
    const nf = await get("/nothing-here");
    expect(nf.status).toBe(404);
    expect(nf.headers.get("x-robots-tag")).toBe("noindex");
    expect(await nf.text()).toContain("<title>app</title>");
    expect((await get("/assets/index-abc.js")).headers.get("cache-control")).toContain("immutable");
    const redirect = await get("/dashboard");
    expect(redirect.status).toBe(301);
    expect(redirect.headers.get("location")).toBe("/");
    expect((await get("/rest/v1/email_subscribers")).status).toBe(410);
    expect((await get("/missing-file.png")).status).toBe(404);
  });
  it("rejects writes to pages and requests for other hosts", async () => {
    expect((await post("/quiz", {})).status).toBe(405);
    const other = await worker.fetch(new Request("https://evil.example/"), baseEnv());
    expect(other.status).toBe(404);
  });
});
