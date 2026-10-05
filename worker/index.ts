import { PRO_PACK } from "./pro-content";
import { accessEmail, brevo, firstName, sendMail, welcomeEmail } from "./mail";
import { SESSION_ID_RE, checkEntitlement, findPaidSessionByEmail, evaluateSession, stripeReady, verifyStripeSignature } from "./stripe";
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

type PublicSeo = {
  title: string;
  description: string;
  h1: string;
  intro: string;
  links: Array<{ href: string; label: string }>;
};

const PUBLIC_SEO: Record<string, PublicSeo> = {
  "/": {
    title: "Mouse Control Planner: Free Step-by-Step Plan | MiceGoneGuide",
    description: "Build a free, source-backed mouse control plan in two minutes: what to do today, this week and ongoing, based on CDC and UC IPM guidance.",
    h1: "A clear, source-backed plan for your mouse problem",
    intro: "Answer seven quick questions about the signs, rooms and household conditions you observed. The planner returns a practical sequence for inspection, trapping, safe cleanup, sealing and follow-up without claiming to diagnose an infestation.",
    links: [
      { href: "/quiz", label: "Build your free mouse control plan" },
      { href: "/tools/entry-points", label: "Inspect mouse entry gaps" },
      { href: "/tools/trap-placement", label: "Plan mouse trap placement" },
      { href: "/tools/cleanup-guide", label: "Follow the safe cleanup guide" },
    ],
  },
  "/quiz": {
    title: "Build Your Free Mouse Control Plan | MiceGoneGuide",
    description: "Answer seven quick questions about what you observed and get a source-backed mouse-control action plan. No email or signup required.",
    h1: "Build your free mouse control plan",
    intro: "Use observed evidence, room location, household constraints and previous control attempts to organize the safest next steps. The planner uses fixed, reviewable rules rather than a black-box diagnosis or mouse-count estimate.",
    links: [
      { href: "/tools/calculator", label: "Check what mouse signs can mean" },
      { href: "/tools/entry-points", label: "Inspect likely entry points" },
      { href: "/tools/trap-placement", label: "Review trap placement guidance" },
      { href: "/tools/cleanup-guide", label: "Review safe cleanup steps" },
    ],
  },
  "/tools/calculator": {
    title: "Mouse Signs: What They Mean and What to Do Next | MiceGoneGuide",
    description: "Review droppings, noises, odors and gnaw marks, what each sign can and cannot establish, and the safest next step using CDC and UC IPM guidance.",
    h1: "Mouse signs: what they can tell you and what to do next",
    intro: "A single sound, odor or dropping does not establish species, population size or infestation severity. Use this evidence guide to separate physical signs from uncertain clues and choose a proportionate next action.",
    links: [
      { href: "/quiz", label: "Build a complete action plan" },
      { href: "/tools/entry-points", label: "Inspect possible entry gaps" },
      { href: "/tools/trap-placement", label: "Choose safer trap locations" },
      { href: "/tools/cleanup-guide", label: "Clean droppings safely" },
    ],
  },
  "/tools/entry-points": {
    title: "Mouse Entry-Gap Inspection Checklist | MiceGoneGuide",
    description: "Inspect common mouse entry points inside and outside your home and match likely gaps to durable exclusion materials and safer next steps.",
    h1: "Mouse entry-gap inspection checklist",
    intro: "Inspect door bottoms, utility penetrations, garage corners, foundations, vents and other realistic access points. Preserve drainage, ventilation and utility safety while prioritizing durable, chew-resistant repairs.",
    links: [
      { href: "/quiz", label: "Build your mouse-control plan" },
      { href: "/tools/calculator", label: "Review the evidence first" },
      { href: "/tools/trap-placement", label: "Plan traps on active routes" },
      { href: "/tools/cleanup-guide", label: "Handle contamination safely" },
    ],
  },
  "/tools/trap-placement": {
    title: "Where to Place Mouse Traps: Visual Guide | MiceGoneGuide",
    description: "Learn where to place, bait and space mouse traps using wall-edge travel patterns and source-backed CDC and UC IPM guidance.",
    h1: "Where to place mouse traps",
    intro: "Trap placement works best when it follows observed travel routes instead of open-floor guesses. Position traps along active wall edges, protect children and pets, and keep monitoring until catches and fresh signs stop.",
    links: [
      { href: "/quiz", label: "Build a complete control plan" },
      { href: "/tools/calculator", label: "Confirm the evidence you observed" },
      { href: "/tools/entry-points", label: "Find and prioritize entry gaps" },
      { href: "/tools/cleanup-guide", label: "Clean affected areas safely" },
    ],
  },
  "/tools/cleanup-guide": {
    title: "How to Clean Up After Mice Safely | MiceGoneGuide",
    description: "Follow a step-by-step mouse-dropping, urine, nest and trap cleanup checklist based on CDC guidance, without dry sweeping or vacuuming.",
    h1: "How to clean up after mice safely",
    intro: "Keep people and pets away from contaminated areas, ventilate enclosed spaces when appropriate, wet contaminated material before wiping, and avoid dry sweeping or vacuuming rodent waste. Escalate inaccessible or extensive contamination to qualified help.",
    links: [
      { href: "/quiz", label: "Build your follow-up action plan" },
      { href: "/tools/calculator", label: "Review the signs you found" },
      { href: "/tools/entry-points", label: "Inspect routes before sealing" },
      { href: "/tools/trap-placement", label: "Plan safer trap placement" },
    ],
  },
  "/privacy": {
    title: "Privacy | MiceGoneGuide",
    description: "How the MiceGoneGuide Mouse Control Planner handles quiz answers, optional email check-ins and purchase verification.",
    h1: "Privacy",
    intro: "Quiz answers are designed to stay in your browser. Optional email check-ins and Pro purchase verification use only the information needed for those services.",
    links: [{ href: "/", label: "Return to the mouse control planner" }],
  },
  "/terms": {
    title: "Terms and Purchase Information | MiceGoneGuide",
    description: "Terms of use and purchase information for the MiceGoneGuide Mouse Control Planner and optional Pro Masterplan.",
    h1: "Terms and purchase information",
    intro: "Review the educational scope of the planner, limits of the guidance and the purchase terms that apply to the optional Pro Masterplan.",
    links: [{ href: "/", label: "Return to the mouse control planner" }],
  },
};

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

async function handleHealth(env: Env): Promise<Response> {
  return json(env, 200, {
    ok: true,
    release: env.RELEASE,
    // true only if the key is set AND Stripe accepts it for reading Checkout Sessions
    stripe: await stripeReady(env),
    stripeKeySet: Boolean(env.STRIPE_SECRET_KEY),
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

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch] || ch));
}

function replaceHeadValue(html: string, pattern: RegExp, replacement: string): string {
  return pattern.test(html) ? html.replace(pattern, replacement) : html;
}

function serverRenderPublicRoute(html: string, route: string, origin: string): string {
  const seo = PUBLIC_SEO[route];
  if (!seo) return html;
  const canonical = `${origin}${route === "/" ? "/" : route}`;
  const nav = seo.links.map(link => `<li><a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a></li>`).join("");
  const fallback = `<main data-server-seo="true"><h1>${escapeHtml(seo.h1)}</h1><p>${escapeHtml(seo.intro)}</p><nav aria-label="Related mouse control tools"><ul>${nav}</ul></nav><p><a href="https://micegoneguide.com/">Read the MiceGoneGuide mouse-control library</a></p></main>`;

  html = replaceHeadValue(html, /<title>[^<]*<\/title>/i, `<title>${escapeHtml(seo.title)}</title>`);
  html = replaceHeadValue(html, /<meta name="description" content="[^"]*"\s*\/?\s*>/i, `<meta name="description" content="${escapeHtml(seo.description)}" />`);
  html = replaceHeadValue(html, /<meta name="robots" content="[^"]*"\s*\/?\s*>/i, '<meta name="robots" content="index, follow" />');
  html = replaceHeadValue(html, /<link rel="canonical" href="[^"]*"\s*\/?\s*>/i, `<link rel="canonical" href="${canonical}" />`);
  html = replaceHeadValue(html, /<meta property="og:url" content="[^"]*"\s*\/?\s*>/i, `<meta property="og:url" content="${canonical}" />`);
  html = replaceHeadValue(html, /<meta property="og:title" content="[^"]*"\s*\/?\s*>/i, `<meta property="og:title" content="${escapeHtml(seo.title)}" />`);
  html = replaceHeadValue(html, /<meta property="og:description" content="[^"]*"\s*\/?\s*>/i, `<meta property="og:description" content="${escapeHtml(seo.description)}" />`);
  html = replaceHeadValue(html, /<meta name="twitter:title" content="[^"]*"\s*\/?\s*>/i, `<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`);
  html = replaceHeadValue(html, /<meta name="twitter:description" content="[^"]*"\s*\/?\s*>/i, `<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`);
  html = html.replace('<div id="root"></div>', `<div id="root">${fallback}</div>`);
  return html;
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
  if (isHtml && PUBLIC_SEO[route] && request.method !== "HEAD") {
    const body = serverRenderPublicRoute(await res.text(), route, env.PUBLIC_ORIGIN);
    res = new Response(body, { status: res.status, statusText: res.statusText, headers: res.headers });
  }
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
