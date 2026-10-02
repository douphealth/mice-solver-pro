import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ ok: false, message: "Method not allowed." }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    let payload: unknown;
    try { payload = await req.json(); } catch { return new Response(JSON.stringify({ ok: false, message: "Invalid request." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
    const input = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
    const email = input.email, name = input.name;
    if (typeof email !== "string" || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || (name !== undefined && (typeof name !== "string" || name.length > 100))) {
      return new Response(JSON.stringify({ ok: false, message: "Please provide a valid email address and name." }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const { error: dbError } = await supabaseClient.from("email_subscribers").upsert({ email: normalizedEmail, name: typeof name === "string" ? name.trim() || null : null, source: "planner_optin" }, { onConflict: "email" });
    if (dbError) return new Response(JSON.stringify({ ok: false, message: "Could not save your request." }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
    const senderEmail = "MiceGoneGuide <no-reply@micegoneguide.com>";
    const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character] || character));
    const greeting = typeof name === "string" && name.trim() ? `Hello ${escapeHtml(name.trim())},` : "Hello,";
    const template = (title: string, body: string) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f5f7f5;color:#233b2f;font-family:Arial,sans-serif"><main style="max-width:620px;margin:auto;padding:28px"><p style="font-weight:bold">MiceGoneGuide</p><h1 style="font-size:26px;line-height:1.25">${title}</h1><p>${greeting}</p>${body}<hr><p style="font-size:13px;line-height:1.6">This is a requested planning reminder, not a property inspection, species identification, disease assessment or clearance guarantee. Sources inform the guidance; their authors do not endorse this service.</p><p style="font-size:13px">The downloadable plan is generated in your browser. This email does not contain or attach your individual report.</p></main></body></html>`;
    const planner = '<p><a href="https://elimination.micegoneguide.com/quiz">Open the mouse-control planner</a></p>';
    const cleanup = '<p><a href="https://www.cdc.gov/healthy-pets/rodent-control/clean-up.html">CDC: cleanup after rodents</a></p>';
    const trapping = '<p><a href="https://www.cdc.gov/healthy-pets/rodent-control/trap-up.html">CDC: trapping rodents</a></p>';
    const exclusion = '<p><a href="https://www.cdc.gov/healthy-pets/rodent-control/seal-up.html">CDC: sealing entry gaps</a></p>';
    const sequence = [
      { days: 0, title: "Your mouse-control planning resources", body: '<p>Begin with what you actually observed. Record physical signs separately from uncertain noises or odors. No answer can establish how many mice are present or guarantee a completion date.</p><p>Protect accessible food. Inspect safely accessible areas. Keep people and pets away from waste, damaged wiring and traps.</p>' + planner + trapping + cleanup },
      { days: 1, title: "Review the next safe action", body: '<p>Have new physical signs appeared after safe cleanup? Record their location instead of estimating an infestation score.</p><p>CDC recommends appropriate snap traps rather than glue or live traps. Follow the manufacturer instructions, prevent child and pet access and check traps daily.</p><p>Damaged wiring or heavy, inaccessible or ventilation-system contamination needs qualified help. Do not cut into a wall based on sounds alone.</p>' + trapping + cleanup },
      { days: 7, title: "Cleanup and inspection check-in", body: '<p>Never dry-sweep or vacuum untreated rodent waste. Wear rubber or plastic gloves, wet the material thoroughly with a suitable disinfectant and allow the product label contact time before wiping it up.</p><p>Use the full CDC instructions for disposal, ventilation, affected surfaces and situations that require professional assistance. Do not mix cleaning chemicals.</p>' + cleanup + exclusion },
      { days: 30, title: "Review observations, not a clearance deadline", body: '<p>A month on the calendar does not prove a property is free of rodents. Review your recorded signs, trap checks, food access and entry-gap repairs.</p><p>New signs or persistent activity are reasons to reassess and seek qualified help when needed. No recent observations are encouraging but do not guarantee that rodents cannot return.</p>' + planner + exclusion },
    ];
    if (!resendApiKey) return new Response(JSON.stringify({ ok: true, email_sent: false, message: "Request saved; email sending is not configured." }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    const now = Date.now();
    for (const item of sequence) {
      const message: Record<string, unknown> = { from: senderEmail, to: [normalizedEmail], subject: item.title, html: template(item.title, item.body) };
      if (item.days) message.scheduled_at = new Date(now + item.days * 86400000).toISOString();
      const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${resendApiKey}` }, body: JSON.stringify(message) });
      if (!response.ok) throw new Error(`Email service returned status ${response.status}`);
    }
    return new Response(JSON.stringify({ ok: true, message: "Request saved and email service accepted the sequence. Delivery is not confirmed." }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  } catch {
    console.error("Planning email request failed; details suppressed to protect subscriber data.");
    return new Response(JSON.stringify({ ok: false, message: "The email request could not be completed. Your on-page plan is still available." }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
  }
});
