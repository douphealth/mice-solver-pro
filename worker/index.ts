import { PRO_PACK } from "./pro-content";
import { accessEmail, brevo, firstName, sendMail, welcomeEmail } from "./mail";
import { SESSION_ID_RE, checkEntitlement, findPaidSessionByEmail, evaluateSession, verifyStripeSignature } from "./stripe";
import type { Env } from "./types";

const APP_ROUTES = new Set([
  "/", "/quiz", "/plan", "/report", "/pro", "/payment-success", "/restore", "/privacy", "/terms",
  "/tools/calculator", "/tools/entry-points", "/tools/trap-placement", "/tools/cleanup-guide",
]);
/** Pages with personal or transactional content: never indexed, never cached. */
const PRIVATE_ROUTES = new Set(["/plan", "/report", "/pro", "/payment-success", "/restore"]);
/** Retired account system. The old Supabase project no longer exists. */
const REDIRECTS: Record<string, string> = { "/auth": "/", "/dashboard": "/" };
const LEGACY_LEAD_PATHS = new Set(["/mice-backend/functions/v1/mice-elimination-lead", "/functions/v1/mice-elimination-lead", "/api/mice-elimination-lead"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CSP = [
  "default-src 'self'",
  "script-src 'self' https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data: blob:",
  "connect-src 'self' https://cloudflareinsights.com",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
].join("; ");

// ------------------------------------------------------------------ helpers

function baseHeaders(env: Env): Record<string, string> {
  return { "x-content-type-options": "nosniff", "x-mgg-release": env.RELEASE, "referrer-policy": "strict-origin-when-cross-origin" };
}

function json(env: Env, status: number, body: unknown, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...baseHeaders(env), "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex", ...extra },
  });
}

const clientIp = (request: Request): string => request.headers.get("cf-connecting-ip") || "local";

/** Best-effort fixed-window limiter backed by the colo-local Cache API. Returns true when the call is allowed. */
async function allow(env: Env, key: string, limit: number, windowSec: number): Promise<boolean> {
  if (env.DISABLE_RATE_LIMIT === "1") return true;
  const store = (globalThis as any).caches?.default as Cache | undefined;
  if (!store) return true;
  const slot = Math.floor(Date.now() / (windowSec * 1000));
  const req = new Request(`https://limiter.invalid/${encodeURIComponent(key)}/${slot}`);
  const hit = await store.match(req);
  const n = hit ? Number(await hit.text()) || 0 : 0;
  if (n >= limit) return false;
  await store.put(req, new Response(String(n + 1), { headers: { "cache-control": `max-age=${windowSec}` } }));
  return true;
}

async function readJson(request: Request, maxBytes = 16384): Promise<{ ok: true; value: Record<string, unknown> } | { ok: false; status: number; message: string }> {
  if (Number(request.headers.get("content-length") || 0) > maxBytes) return { ok: false, status: 413, message: "Request too large." };
  try {
    const text = await request.text();
    if (text.length > maxBytes) return { ok: false, status: 413, message: "Request too large." };
    const value = JSON.parse(text);
    if (!value || typeof value !== "object" || Array.isArray(value)) return { ok: false, status: 400, message: "Invalid request." };
    return { ok: true, value };
  } catch {
    return { ok: false, status: 400, message: "Invalid JSON." };
  }
}

function originAllowed(request: Request, env: Env, url: URL): boolean {
  const origin = request.headers.get("origin");
  return !origin || origin === env.PUBLIC_ORIGIN || origin === url.origin;
}

// ------------------------------------------------------------------ API handlers

async function handleLead(request: Request, env: Env, url: URL, legacy: boolean): Promise<Response> {
  if (request.method !== "POST") return json(env, 405, { ok: false, message: "Use POST." });
  if (!originAllowed(request, env, url)) return json(env, 403, { ok: false, message: "Origin not allowed." });
  const body = await readJson(request);
  if (!body.ok) return json(env, body.status, { ok: false, message: body.message });
  const p = body.value;
  if (typeof p.website === "string" && p.website.trim()) return json(env, 200, { ok: true, email_sent: false, message: "Request saved." }); // honeypot
  const email = String(p.email || "").trim().toLowerCase();
  const name = String(p.name || "").trim().slice(0, 120);
  if (email.length > 254 || !EMAIL_RE.test(email)) return json(env, 400, { ok: false, message: "Enter a valid email address." });
  if (!legacy && p.consent !== true) return json(env, 400, { ok: false, message: "Please confirm you'd like to receive emails." });
  if (!(await allow(env, `lead:${clientIp(request)}`, 8, 3600))) return json(env, 429, { ok: false, message: "Too many requests. Please try again later." });
  const listId = Number(env.BREVO_LIST_ID || 8);
  if (!env.BREVO_API_KEY || !Number.isInteger(listId) || listId < 1) return json(env, 503, { ok: false, message: "Email check-ins are temporarily unavailable. Your plan is unaffected." });
  const attributes = { FIRSTNAME: firstName(name), FULLNAME: name, SOURCE: "mice-elimination-app", LAST_MICE_OPTIN_AT: new Date().toISOString() };
  let contact;
  try { contact = await brevo(env, "/contacts", { email, attributes, listIds: [listId], updateEnabled: true }); }
  catch { return json(env, 503, { ok: false, message: "Could not save your request." }); }
  if (!contact.ok) return json(env, 502, { ok: false, message: "Could not save your request." });
  try {
    const mail = welcomeEmail(env, name);
    const sent = await sendMail(env, { email, name }, mail, ["micegoneguide", "elimination-app", "planning-resources"]);
    return json(env, 200, { ok: true, email_sent: sent.ok, message: sent.ok ? "You're on the list. A welcome email is on its way." : "You're on the list. We couldn't confirm the welcome email was sent." });
  } catch {
    return json(env, 200, { ok: true, email_sent: false, message: "You're on the list. We couldn't confirm the welcome email was sent." });
  }
}

async function handleEntitlement(request: Request, env: Env, url: URL, withPack: boolean): Promise<Response> {
  if (request.method !== "GET") return json(env, 405, { message: "Use GET." });
  if (!(await allow(env, `ent:${clientIp(request)}`, 40, 60))) return json(env, 429, { message: "Too many requests. Please wait a moment." });
  const sessionId = url.searchParams.get("session_id") || "";
  if (!SESSION_ID_RE.test(sessionId)) return json(env, 400, { entitlement: { active: false, reason: "not_found" } });
  const { entitlement, refundCheck } = await checkEntitlement(env, sessionId);
  if (entitlement.reason === "unavailable") return json(env, 503, { entitlement, message: "We couldn't reach the payment service. Please try again in a moment." });
  if (!withPack) return json(env, 200, { entitlement, refundCheck });
  if (!entitlement.active) return json(env, 402, { entitlement });
  return json(env, 200, { entitlement, refundCheck, pack: PRO_PACK }, { "cache-control": "private, no-store" });
}

async function handleRestore(request: Request, env: Env, url: URL): Promise<Response> {
  if (request.method !== "POST") return json(env, 405, { ok: false, message: "Use POST." });
  if (!originAllowed(request, env, url)) return json(env, 403, { ok: false, message: "Origin not allowed." });
  const body = await readJson(request, 2048);
  if (!body.ok) return json(env, body.status, { ok: false, message: body.message });
  const email = String(body.value.email || "").trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) return json(env, 400, { ok: false, message: "Enter the email address you used at checkout." });
  if (!(await allow(env, `restore:${clientIp(request)}`, 5, 3600)) || !(await allow(env, `restore-email:${email}`, 3, 3600))) {
    return json(env, 429, { ok: false, message: "Too many attempts. Please try again later." });
  }
  if (!env.STRIPE_SECRET_KEY || !env.BREVO_API_KEY) return json(env, 503, { ok: false, message: "Restore is temporarily unavailable. Email admin@micegoneguide.com and we'll help." });
  const generic = { ok: true, message: "If a Pro purchase exists for that email, we've sent an access link. It can take a minute to arrive. Check your spam folder too." };
  try {
    const sessionId = await findPaidSessionByEmail(env, email);
    if (sessionId) {
      const mail = accessEmail(env, sessionId, { restore: true });
      await sendMail(env, { email }, mail, ["micegoneguide", "pro-access-restore"]);
    }
  } catch {
    return json(env, 503, { ok: false, message: "Restore is temporarily unavailable. Email admin@micegoneguide.com and we'll help." });
  }
  return json(env, 200, generic);
}

async function handleWebhook(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") return json(env, 405, { ok: false });
  if (!env.STRIPE_WEBHOOK_SECRET) return json(env, 503, { ok: false, message: "Webhook is not configured." });
  const raw = await request.text();
  if (!(await verifyStripeSignature(raw, request.headers.get("stripe-signature"), env.STRIPE_WEBHOOK_SECRET))) {
    return json(env, 400, { ok: false, message: "Invalid signature." });
  }
  let event: any;
  try { event = JSON.parse(raw); } catch { return json(env, 400, { ok: false, message: "Invalid payload." }); }
  const type = String(event?.type || "");
  const session = event?.data?.object;
  if ((type === "checkout.session.completed" || type === "checkout.session.async_payment_succeeded") && session) {
    const verdict = evaluateSession(session, env);
    const toEmail = session.customer_details?.email || session.customer_email;
    if (verdict.active && typeof toEmail === "string" && EMAIL_RE.test(toEmail) && SESSION_ID_RE.test(String(session.id || ""))) {
      // Stripe retries on any non-2xx, so send at most once per event and never fail the webhook because of email.
      if (env.BREVO_API_KEY && (await allow(env, `wh:${event.id}`, 1, 86400))) {
        try { await sendMail(env, { email: toEmail }, accessEmail(env, session.id, { restore: false }), ["micegoneguide", "pro-access"]); } catch { /* logged by Stripe delivery view */ }
      }
    }
  }
  return json(env, 200, { ok: true, received: type });
}

function handleHealth(env: Env): Response {
  return json(env, 200, {
    ok: true,
    release: env.RELEASE,
    stripe: Boolean(env.STRIPE_SECRET_KEY),
    webhook: Boolean(env.STRIPE_WEBHOOK_SECRET),
    email: Boolean(env.BREVO_API_KEY),
  });
}

async function handleApi(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname.replace(/\/+$/, "") || "/";
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: { ...baseHeaders(env), "access-control-allow-origin": env.PUBLIC_ORIGIN, "access-control-allow-methods": "GET, POST, OPTIONS", "access-control-allow-headers": "content-type", vary: "Origin" } });
  }
  if (path === "/api/lead") return handleLead(request, env, url, false);
  if (LEGACY_LEAD_PATHS.has(path)) return handleLead(request, env, url, true);
  if (path === "/api/entitlement") return handleEntitlement(request, env, url, false);
  if (path === "/api/pro-pack") return handleEntitlement(request, env, url, true);
  if (path === "/api/restore") return handleRestore(request, env, url);
  if (path === "/api/stripe-webhook") return handleWebhook(request, env);
  if (path === "/api/health") return handleHealth(env);
  return json(env, 404, { ok: false, message: "Unknown API route." });
}

// ------------------------------------------------------------------ static app

function isAssetPath(pathname: string): boolean {
  const last = pathname.split("/").pop() || "";
  return last.includes(".");
}

function decorate(env: Env, res: Response, pathname: string, isHtml: boolean, status?: number): Response {
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(baseHeaders(env))) headers.set(k, v);
  const route = pathname.replace(/\/+$/, "") || "/";
  if (isHtml) {
    headers.set("content-security-policy", CSP);
    headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=()");
    headers.set("x-frame-options", "DENY");
    headers.set("cache-control", PRIVATE_ROUTES.has(route) ? "no-store" : "no-cache");
    if (PRIVATE_ROUTES.has(route)) headers.set("x-robots-tag", "noindex, follow");
    if (status === 404) headers.set("x-robots-tag", "noindex");
    if (route === "/payment-success") headers.set("referrer-policy", "no-referrer");
  } else if (pathname.startsWith("/assets/")) {
    headers.set("cache-control", "public, max-age=31536000, immutable");
  } else if (pathname.startsWith("/fonts/")) {
    headers.set("cache-control", "public, max-age=2592000");
  } else if (pathname === "/mgg-release.json") {
    headers.set("cache-control", "no-store");
  } else if (!headers.has("cache-control")) {
    headers.set("cache-control", "public, max-age=3600");
  }
  return new Response(res.body, { status: status ?? res.status, statusText: res.statusText, headers });
}

async function serveStatic(request: Request, env: Env, url: URL): Promise<Response> {
  const route = url.pathname.replace(/\/+$/, "") || "/";
  if (REDIRECTS[route]) return new Response(null, { status: 301, headers: { location: REDIRECTS[route], ...baseHeaders(env) } });
  const known = APP_ROUTES.has(route);
  if (!known && !isAssetPath(url.pathname)) {
    // Unknown navigation: serve the app shell so the client can show its not-found page, but with a real 404 status.
    const shell = await env.ASSETS.fetch(new Request(new URL("/", url), { headers: request.headers }));
    return decorate(env, shell, url.pathname, true, 404);
  }
  let res = await env.ASSETS.fetch(request);
  if (res.status === 404 && known) res = await env.ASSETS.fetch(new Request(new URL("/", url), { headers: request.headers }));
  const isHtml = (res.headers.get("content-type") || "").includes("text/html");
  return decorate(env, res, url.pathname, isHtml);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const publicHost = new URL(env.PUBLIC_ORIGIN).hostname;
    const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (url.hostname !== publicHost && !local) return new Response("Not found", { status: 404 });
    const path = url.pathname.replace(/\/+$/, "") || "/";
    if (path.startsWith("/api/") || LEGACY_LEAD_PATHS.has(path)) return handleApi(request, env, url);
    if (/^\/(mice-backend|auth\/v1|rest\/v1|functions\/v1|storage\/v1)(\/|$)/.test(url.pathname)) {
      return json(env, 410, { ok: false, message: "This legacy account service has been retired. Your free planner and Pro workspace don't need an account." });
    }
    if (request.method !== "GET" && request.method !== "HEAD") return json(env, 405, { ok: false, message: "Use GET for pages." });
    return serveStatic(request, env, url);
  },
};
