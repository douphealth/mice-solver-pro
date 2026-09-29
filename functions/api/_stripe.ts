export interface StripeEnv {
  STRIPE_SECRET_KEY?: string;
  STRIPE_PRICE_ID?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  PUBLIC_APP_URL?: string;
  STRIPE_EXPECTED_MODE?: string;
}

export const APP_ID = "mice-solver-pro";
export const DEFAULT_PRICE_ID = "price_1THmIQGCqwm95OGXRypTpK2X";
const MAX_ANSWERS_LENGTH = 9000;
const METADATA_CHUNK_SIZE = 450;

export class StripeRequestError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.name = "StripeRequestError";
    this.status = status;
  }
}

export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export function appOrigin(request: Request, env: StripeEnv) {
  const configured = env.PUBLIC_APP_URL?.trim();
  if (configured) return new URL(configured).origin;
  return new URL(request.url).origin;
}

export function requireStripeSecret(env: StripeEnv) {
  const secret = env.STRIPE_SECRET_KEY?.trim();
  if (!secret || !secret.startsWith("sk_")) {
    throw new StripeRequestError("Stripe is not configured on this deployment.", 503);
  }
  return secret;
}

export function priceId(env: StripeEnv) {
  return env.STRIPE_PRICE_ID?.trim() || DEFAULT_PRICE_ID;
}

export async function stripeRequest(env: StripeEnv, path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${requireStripeSecret(env)}`);
  headers.set("Accept", "application/json");
  if (init.body instanceof URLSearchParams) {
    headers.set("Content-Type", "application/x-www-form-urlencoded");
  }

  const response = await fetch(`https://api.stripe.com/v1${path}`, { ...init, headers });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new StripeRequestError(body?.error?.message || "Stripe request failed.", response.status < 500 ? 400 : 502);
  }
  return body;
}

export function encodeAnswersMetadata(answers: unknown) {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    throw new StripeRequestError("Diagnostic answers are required.", 400);
  }
  const raw = JSON.stringify(answers);
  if (!raw || raw.length > MAX_ANSWERS_LENGTH) {
    throw new StripeRequestError("Diagnostic payload is invalid or too large.", 400);
  }
  const chunks: string[] = [];
  for (let i = 0; i < raw.length; i += METADATA_CHUNK_SIZE) chunks.push(raw.slice(i, i + METADATA_CHUNK_SIZE));
  const metadata: Record<string,string> = { app: APP_ID, answers_parts: String(chunks.length), schema_version: "1" };
  chunks.forEach((chunk, i) => { metadata[`answers_${i}`] = chunk; });
  return metadata;
}

export function decodeAnswersMetadata(metadata: Record<string,string> | null | undefined) {
  if (!metadata || metadata.app !== APP_ID) {
    throw new StripeRequestError("Checkout Session does not belong to this application.", 403);
  }
  const count = Number.parseInt(metadata.answers_parts || "0", 10);
  if (!Number.isInteger(count) || count <= 0 || count > 30) {
    throw new StripeRequestError("Checkout Session is missing diagnostic data.", 422);
  }
  let raw = "";
  for (let i = 0; i < count; i++) {
    const part = metadata[`answers_${i}`];
    if (typeof part !== "string") throw new StripeRequestError("Checkout Session diagnostic data is incomplete.", 422);
    raw += part;
  }
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new StripeRequestError("Checkout Session diagnostic data is invalid.", 422);
  }
  return parsed;
}

export function expectedModeMatches(env: StripeEnv, livemode: boolean) {
  const expected = env.STRIPE_EXPECTED_MODE?.trim().toLowerCase();
  if (!expected) return true;
  if (expected === "live") return livemode;
  if (expected === "test") return !livemode;
  throw new StripeRequestError("STRIPE_EXPECTED_MODE must be live or test.", 500);
}

export function normalizeEmail(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return "";
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new StripeRequestError("A valid email address is required when email is provided.", 400);
  }
  return email;
}

export function errorResponse(error: unknown) {
  if (error instanceof StripeRequestError) return json({ error: error.message }, error.status);
  console.error("Unexpected payment API error", error);
  return json({ error: "Unexpected payment service error." }, 500);
}
