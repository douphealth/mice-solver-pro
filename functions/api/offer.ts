import { errorResponse, expectedModeMatches, json, priceId, stripeRequest } from "./_stripe";

export async function onRequestGet(context: any) {
  try {
    const id = priceId(context.env);
    const price = await stripeRequest(context.env, `/prices/${encodeURIComponent(id)}`, { method: "GET" });
    if (!price?.active || !Number.isInteger(price?.unit_amount) || !price?.currency) {
      return json({ error: "The Pro offer is not active." }, 503);
    }
    if (!expectedModeMatches(context.env, Boolean(price.livemode))) {
      return json({ error: "Stripe mode does not match this deployment." }, 503);
    }
    return json({ active: true, unitAmount: price.unit_amount, currency: price.currency, livemode: Boolean(price.livemode) });
  } catch (error) { return errorResponse(error); }
}
