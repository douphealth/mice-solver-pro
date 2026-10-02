import type { Entitlement, ProPack } from "./pro-types";

export type FetchState<T> = { ok: true; data: T } | { ok: false; status: number; message: string; data?: Partial<T> };

async function call(path: string, init?: RequestInit): Promise<{ status: number; body: any }> {
  const res = await fetch(path, { credentials: "same-origin", ...init });
  let body: any = null;
  try { body = await res.json(); } catch { /* empty or non-JSON */ }
  return { status: res.status, body };
}

export async function verifyPurchase(sessionId: string): Promise<FetchState<{ entitlement: Entitlement; refundCheck: boolean }>> {
  try {
    const { status, body } = await call(`/api/entitlement?session_id=${encodeURIComponent(sessionId)}`);
    if (status === 200 && body?.entitlement) return { ok: true, data: { entitlement: body.entitlement, refundCheck: body.refundCheck !== false } };
    return { ok: false, status, message: body?.message || "We couldn't verify this purchase right now.", data: body?.entitlement ? { entitlement: body.entitlement } : undefined };
  } catch {
    return { ok: false, status: 0, message: "You appear to be offline. Check your connection and try again." };
  }
}

export async function loadProPack(sessionId: string): Promise<FetchState<{ entitlement: Entitlement; pack: ProPack }>> {
  try {
    const { status, body } = await call(`/api/pro-pack?session_id=${encodeURIComponent(sessionId)}`);
    if (status === 200 && body?.pack) return { ok: true, data: { entitlement: body.entitlement, pack: body.pack } };
    return { ok: false, status, message: body?.message || "We couldn't load your Pro plan right now.", data: body?.entitlement ? { entitlement: body.entitlement } : undefined };
  } catch {
    return { ok: false, status: 0, message: "You appear to be offline. Check your connection and try again." };
  }
}

export interface LeadResult { ok: boolean; email_sent?: boolean; message: string }
export async function submitLead(input: { email: string; name?: string; consent: boolean; website?: string }): Promise<LeadResult> {
  try {
    const { status, body } = await call("/api/lead", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(input) });
    if (status === 200 && body?.ok) return { ok: true, email_sent: Boolean(body.email_sent), message: body.message || "You're on the list." };
    return { ok: false, message: body?.message || "We couldn't save your request. Your plan and PDF are unaffected." };
  } catch {
    return { ok: false, message: "We couldn't reach the server. Your plan and PDF are unaffected." };
  }
}

export async function requestRestore(email: string): Promise<{ ok: boolean; message: string }> {
  try {
    const { status, body } = await call("/api/restore", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
    return { ok: status === 200 && Boolean(body?.ok), message: body?.message || "Something went wrong. Please try again." };
  } catch {
    return { ok: false, message: "We couldn't reach the server. Please try again." };
  }
}

/** Stripe Payment Link for the Pro Masterplan. Opening or returning from it never grants access by itself. */
export const CHECKOUT_URL = "https://buy.stripe.com/dRm6oH61y1qwbUN3UGejK02";
export const PRO_PRICE_LABEL = "$9.99";
export const PRO_NAME = "Pro Masterplan";
