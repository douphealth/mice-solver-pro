import type { Entitlement } from "../src/lib/pro-types";
import type { Env } from "./types";

const STRIPE_VERSION = "2025-08-27.basil";
export const SESSION_ID_RE = /^cs_(?:live|test)_[A-Za-z0-9]{10,200}$/;

export interface StripeResult<T = any> { ok: boolean; status: number; data: T }

/** Test hooks may only point at a local mock server, so a stray variable can never redirect live API traffic. */
export const isLocalBase = (url?: string): url is string => Boolean(url && /^http:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?(?:\/|$)/.test(url));

export function stripeBase(env: Env): string {
  return (isLocalBase(env.STRIPE_API_BASE) ? env.STRIPE_API_BASE : "https://api.stripe.com").replace(/\/+$/, "");
}

/** Read-only GET against the Stripe API. */
export async function stripeGet(env: Env, path: string, query: Array<[string, string]> = []): Promise<StripeResult> {
  if (!env.STRIPE_SECRET_KEY) return { ok: false, status: 503, data: { error: { message: "Stripe is not configured." } } };
  const url = new URL(stripeBase(env) + path);
  for (const [k, v] of query) url.searchParams.append(k, v);
  const res = await fetch(url.href, {
    method: "GET",
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, "Stripe-Version": STRIPE_VERSION, Accept: "application/json" },
    signal: AbortSignal.timeout(15000),
  });
  let data: any = null;
  try { data = await res.json(); } catch { /* non-JSON error body */ }
  return { ok: res.ok, status: res.status, data };
}

/**
 * True only when the configured key can actually do what purchase verification needs (read Checkout Sessions).
 * Cached briefly so health checks and page loads don't each call Stripe.
 */
export async function stripeReady(env: Env): Promise<boolean> {
  if (!env.STRIPE_SECRET_KEY) return false;
  const store = (globalThis as any).caches?.default as Cache | undefined;
  const probe = new Request("https://probe.invalid/stripe-ready");
  const hit = store ? await store.match(probe) : undefined;
  if (hit) return (await hit.text()) === "1";
  let ok = false;
  try { ok = (await stripeGet(env, "/v1/checkout/sessions", [["limit", "1"]])).ok; } catch { ok = false; }
  if (store) await store.put(probe, new Response(ok ? "1" : "0", { headers: { "cache-control": `max-age=${ok ? 60 : 20}` } }));
  return ok;
}

export function maskEmail(email: unknown): string | undefined {
  if (typeof email !== "string" || !email.includes("@")) return undefined;
  const [local, domain] = email.split("@");
  if (!local || !domain) return undefined;
  return `${local[0]}${"*".repeat(Math.max(2, Math.min(6, local.length - 1)))}@${domain}`;
}

/** True when the Checkout Session is a paid purchase of this app's Pro product. Pure, so it is easy to test. */
export function evaluateSession(session: any, env: Pick<Env, "PAYMENT_LINK_ID" | "PRODUCT_ID">): Entitlement {
  if (!session || session.object !== "checkout.session") return { active: false, reason: "not_found" };
  const fromOurLink = session.payment_link === env.PAYMENT_LINK_ID || session.metadata?.app === "mice-elimination";
  if (!fromOurLink) return { active: false, reason: "wrong_product" };
  if (session.mode !== "payment" || session.status !== "complete" || session.payment_status !== "paid") return { active: false, reason: "unpaid" };
  const charge = session.payment_intent && typeof session.payment_intent === "object" ? session.payment_intent.latest_charge : null;
  if (charge && typeof charge === "object") {
    if (charge.refunded === true || (typeof charge.amount === "number" && typeof charge.amount_refunded === "number" && charge.amount_refunded >= charge.amount && charge.amount > 0)) {
      return { active: false, reason: "refunded" };
    }
    if (charge.disputed === true) return { active: false, reason: "refunded" };
  }
  return {
    active: true,
    reason: "paid",
    email: maskEmail(session.customer_details?.email ?? session.customer_email),
    purchasedAt: typeof session.created === "number" ? new Date(session.created * 1000).toISOString() : undefined,
  };
}

/**
 * Retrieve a Checkout Session and decide whether it grants Pro access.
 * Tries to expand the charge for refund detection and falls back to a plain read if the key lacks that permission.
 */
export async function checkEntitlement(env: Env, sessionId: string): Promise<{ entitlement: Entitlement; session?: any; refundCheck: boolean }> {
  if (!SESSION_ID_RE.test(sessionId)) return { entitlement: { active: false, reason: "not_found" }, refundCheck: false };
  if (!env.STRIPE_SECRET_KEY) return { entitlement: { active: false, reason: "unavailable" }, refundCheck: false };
  let refundCheck = true;
  let res = await stripeGet(env, `/v1/checkout/sessions/${sessionId}`, [["expand[]", "payment_intent.latest_charge"]]);
  if (res.status === 401 || res.status === 403 || (res.status === 400 && /expand|permission/i.test(res.data?.error?.message || ""))) {
    refundCheck = false;
    res = await stripeGet(env, `/v1/checkout/sessions/${sessionId}`);
  }
  if (res.status === 404 || (res.status === 400 && /No such checkout/i.test(res.data?.error?.message || ""))) return { entitlement: { active: false, reason: "not_found" }, refundCheck };
  if (!res.ok) return { entitlement: { active: false, reason: "unavailable" }, refundCheck };
  return { entitlement: evaluateSession(res.data, env), session: res.data, refundCheck };
}

/** Find the latest paid session of this product for a checkout email. Used by "restore my purchase". */
export async function findPaidSessionByEmail(env: Env, email: string): Promise<string | null> {
  const variants = [...new Set([email.trim().toLowerCase(), email.trim()])];
  let best: { id: string; created: number } | null = null;
  for (const v of variants) {
    const res = await stripeGet(env, "/v1/checkout/sessions", [["customer_details[email]", v], ["limit", "20"]]);
    if (!res.ok || !Array.isArray(res.data?.data)) continue;
    for (const s of res.data.data) {
      if (s.payment_link === env.PAYMENT_LINK_ID && s.payment_status === "paid" && s.status === "complete" && (!best || s.created > best.created)) {
        best = { id: s.id, created: s.created };
      }
    }
  }
  return best?.id ?? null;
}

// ---------------------------------------------------------------- webhook signatures

const encoder = new TextEncoder();

export function parseSignatureHeader(header: string): { t: string; v1: string[] } {
  let t = "";
  const v1: string[] = [];
  for (const part of header.split(",")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    if (k === "t") t = v; else if (k === "v1") v1.push(v);
  }
  return { t, v1 };
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, "0")).join("");
}

/** Verify a Stripe-Signature header against the raw request body. */
export async function verifyStripeSignature(rawBody: string, header: string | null, secret: string, toleranceSec = 300, nowSec = Math.floor(Date.now() / 1000)): Promise<boolean> {
  if (!header || !secret) return false;
  const { t, v1 } = parseSignatureHeader(header);
  const ts = Number(t);
  if (!Number.isFinite(ts) || v1.length === 0) return false;
  if (Math.abs(nowSec - ts) > toleranceSec) return false;
  const expected = await hmacSha256Hex(secret, `${t}.${rawBody}`);
  return v1.some(sig => timingSafeEqual(sig, expected));
}
