import { isLocalBase } from "./stripe";
import type { Env } from "./types";

export const escapeHtml = (value: unknown): string =>
  String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

export const firstName = (name: unknown): string => String(name || "there").trim().split(/\s+/)[0] || "there";

export interface BrevoResult { ok: boolean; status: number; data?: any }

export async function brevo(env: Env, path: string, body: unknown): Promise<BrevoResult> {
  if (!env.BREVO_API_KEY) return { ok: false, status: 503 };
  const base = (isLocalBase(env.BREVO_API_BASE) ? env.BREVO_API_BASE : "https://api.brevo.com/v3").replace(/\/+$/, "");
  const res = await fetch(base + path, {
    method: "POST",
    headers: { "api-key": env.BREVO_API_KEY, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  });
  let data: any;
  try { data = await res.json(); } catch { /* empty body */ }
  return { ok: res.ok, status: res.status, data };
}

const shell = (origin: string, heading: string, inner: string, footer: string): string =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>` +
  `<body style="margin:0;background:#f3f0e6;font-family:Arial,Helvetica,sans-serif;color:#1d3328">` +
  `<div style="max-width:620px;margin:24px auto;background:#ffffff;border-radius:14px;overflow:hidden">` +
  `<div style="background:#173f2c;padding:20px 28px;color:#f7f2e4;font-size:15px;font-weight:bold;letter-spacing:.04em">MICEGONEGUIDE</div>` +
  `<div style="padding:28px"><h1 style="font-size:26px;line-height:1.25;margin:0 0 16px">${escapeHtml(heading)}</h1>${inner}` +
  `<p style="font-size:12px;line-height:1.6;color:#5c6b61;border-top:1px solid #e3e0d2;padding-top:16px;margin-top:28px">${footer}</p></div></div></body></html>`;

const button = (href: string, label: string): string =>
  `<p style="margin:22px 0"><a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 22px;background:#e8a935;color:#1d1a0d;text-decoration:none;font-weight:bold;border-radius:10px">${escapeHtml(label)}</a></p>`;

export function welcomeEmail(env: Env, name: string) {
  const origin = env.PUBLIC_ORIGIN;
  const who = firstName(name);
  const inner =
    `<p>Thanks for requesting planning resources. Your free plan and PDF are always available in the planner without an email.</p>` +
    `<p>The planner organizes inspection, cleanup, trapping and sealing around what you actually observed. It can't diagnose an infestation, count mice or promise a result.</p>` +
    button(`${origin}/quiz`, "Open the free planner") +
    `<p style="font-weight:bold;margin-bottom:6px">Three things that help straight away</p>` +
    `<ul style="padding-left:18px;line-height:1.7"><li>Never sweep or vacuum droppings. <a href="${origin}/tools/cleanup-guide">Follow the cleanup steps</a>.</li>` +
    `<li>Place snap traps against walls with the bait end touching the wall. <a href="${origin}/tools/trap-placement">See the placement guide</a>.</li>` +
    `<li>Mice can use a gap about 1/4 inch wide. <a href="${origin}/tools/entry-points">Use the entry-gap checklist</a>.</li></ul>`;
  const footer = `You requested these resources through MiceGoneGuide. To stop messages, reply with "unsubscribe" to <a href="mailto:admin@micegoneguide.com">admin@micegoneguide.com</a>. Guidance draws on CDC and UC IPM pages; their authors have not reviewed or endorsed this service.`;
  const text =
    `${who}, thanks for requesting MiceGoneGuide planning resources.\n\n` +
    `Your free plan and PDF are always available without an email: ${origin}/quiz\n\n` +
    `Never sweep or vacuum droppings: ${origin}/tools/cleanup-guide\nTrap placement: ${origin}/tools/trap-placement\nEntry gaps: ${origin}/tools/entry-points\n\n` +
    `The planner can't diagnose an infestation, count mice or promise a result.\n\nTo stop messages, reply with "unsubscribe" to admin@micegoneguide.com.`;
  return { subject: "Your MiceGoneGuide planning resources", html: shell(origin, `${who}, organize your next steps`, inner, footer), text };
}

export function accessEmail(env: Env, sessionId: string, opts: { restore: boolean }) {
  const origin = env.PUBLIC_ORIGIN;
  const link = `${origin}/payment-success?session_id=${encodeURIComponent(sessionId)}`;
  const heading = opts.restore ? "Your Pro Masterplan access link" : "Thank you. Your Pro Masterplan is ready";
  const inner =
    `<p>${opts.restore ? "You asked us to resend your access link." : "Your purchase went through."} Open the link below to unlock your Pro workspace on any device.</p>` +
    button(link, "Open my Pro Masterplan") +
    `<p style="font-size:13px;line-height:1.6">Keep this email. The link is personal to you, so please don't share it. If you ever lose it, use <a href="${origin}/restore">Restore my purchase</a> with the email you paid with.</p>` +
    `<p style="font-size:13px;line-height:1.6">Questions about your order? Reply to this email or write to <a href="mailto:admin@micegoneguide.com">admin@micegoneguide.com</a>.</p>`;
  const footer = `The Pro Masterplan is a planning workspace, not a property inspection or a guarantee of results. Payment receipts come from Stripe.`;
  const text = `${heading}\n\nOpen your Pro workspace: ${link}\n\nKeep this email. If you lose the link, use ${origin}/restore with the email you paid with.\nQuestions: admin@micegoneguide.com`;
  return { subject: opts.restore ? "Your MiceGoneGuide access link" : "Your MiceGoneGuide Pro Masterplan access", html: shell(origin, heading, inner, footer), text, link };
}

export async function sendMail(env: Env, to: { email: string; name?: string }, mail: { subject: string; html: string; text: string }, tags: string[]): Promise<BrevoResult> {
  return brevo(env, "/smtp/email", {
    sender: { name: "MiceGoneGuide", email: env.SENDER_EMAIL || "admin@micegoneguide.com" },
    to: [{ email: to.email, name: to.name || undefined }],
    replyTo: { email: "admin@micegoneguide.com", name: "MiceGoneGuide" },
    subject: mail.subject,
    htmlContent: mail.html,
    textContent: mail.text,
    tags,
    headers: { "X-Entity-Ref-ID": crypto.randomUUID() },
  });
}
