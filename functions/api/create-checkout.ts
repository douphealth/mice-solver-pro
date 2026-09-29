import {
  APP_ID, appOrigin, encodeAnswersMetadata, errorResponse, expectedModeMatches,
  json, normalizeEmail, priceId, stripeRequest
  type StripeEnv,\n} from "./_stripe";

interface FunctionContext {
  request: Request;
  env: StripeEnv;
}

export async function onRequestPost(context: FunctionContext) {
  try {
    const request = context.request as Request;
    const payload = await request.json().catch(() => null);
    if (!payload || typeof payload !== "object") return json({ error: "A JSON request body is required." }, 400);

    const metadata = encodeAnswersMetadata(payload.answers);
    const email = normalizeEmail(payload.email);
    const severity = Number(payload.severity);
    const species = typeof payload.species === "string" ? payload.species.trim().slice(0, 120) : "";
    if (Number.isFinite(severity)) metadata.severity = String(Math.max(0, Math.min(10, severity)));
    if (species) metadata.species = species;

    const id = priceId(context.env);
    const price = await stripeRequest(context.env, `/prices/${encodeURIComponent(id)}`, { method: "GET" });
    if (!price?.active || price.type !== "one_time") return json({ error: "The configured Pro price is not available." }, 503);
    if (!expectedModeMatches(context.env, Boolean(price.livemode))) return json({ error: "Stripe mode does not match this deployment." }, 503);

    const origin = appOrigin(request, context.env);
    const form = new URLSearchParams();
    form.set("mode", "payment");
    form.set("line_items[0][price]", id);
    form.set("line_items[0][quantity]", "1");
    form.set("success_url", `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`);
    form.set("cancel_url", `${origin}/report?checkout=cancelled`);
    form.set("client_reference_id", crypto.randomUUID());
    form.set("submit_type", "pay");
    if (email) {
      form.set("customer_email", email);
      form.set("payment_intent_data[receipt_email]", email);
    }
    Object.entries(metadata).forEach(([key, value]) => form.set(`metadata[${key}]`, value));
    form.set("payment_intent_data[metadata][app]", APP_ID);

    const session = await stripeRequest(context.env, "/checkout/sessions", { method: "POST", body: form });
    if (!session?.url || !session?.id) return json({ error: "Stripe did not return a Checkout URL." }, 502);
    return json({
      url: session.url,
      sessionId: session.id,
      amountTotal: session.amount_total ?? price.unit_amount,
      currency: session.currency ?? price.currency,
      livemode: Boolean(session.livemode),
    });
  } catch (error) { return errorResponse(error); }
}
