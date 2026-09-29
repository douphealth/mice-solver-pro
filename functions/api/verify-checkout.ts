import {
  APP_ID, decodeAnswersMetadata, errorResponse, expectedModeMatches, json, priceId, stripeRequest
  type StripeEnv,\n} from "./_stripe";

interface FunctionContext {
  request: Request;
  env: StripeEnv;
}

export async function onRequestGet(context: FunctionContext) {
  try {
    const request = context.request as Request;
    const sessionId = new URL(request.url).searchParams.get("session_id")?.trim() || "";
    if (!/^cs_(test_|live_)?[A-Za-z0-9]+$/.test(sessionId)) {
      return json({ error: "A valid Stripe Checkout Session ID is required." }, 400);
    }

    const session = await stripeRequest(
      context.env,
      `/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=line_items.data.price`,
      { method: "GET" }
    );
    if (!expectedModeMatches(context.env, Boolean(session.livemode))) return json({ error: "Stripe mode does not match this deployment." }, 403);
    if (session?.metadata?.app !== APP_ID) return json({ error: "This Checkout Session does not belong to MiceGoneGuide." }, 403);
    if (session?.line_items?.data?.[0]?.price?.id !== priceId(context.env)) return json({ error: "Checkout price mismatch." }, 403);

    const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
    if (!paymentIntentId) return json({ error: "Stripe has not attached a completed payment to this session." }, 409);

    const paymentIntent = await stripeRequest(
      context.env,
      `/payment_intents/${encodeURIComponent(paymentIntentId)}?expand[]=latest_charge`,
      { method: "GET" }
    );
    const charge = paymentIntent?.latest_charge;
    const fullyRefunded = Boolean(charge?.refunded) ||
      (Number.isInteger(charge?.amount_refunded) && Number.isInteger(charge?.amount) && charge.amount > 0 && charge.amount_refunded >= charge.amount);

    if (fullyRefunded) return json({ error: "This payment has been refunded, so Pro access is no longer active." }, 402);
    if (charge?.disputed) return json({ error: "This payment is disputed, so Pro access is temporarily unavailable." }, 402);

    const paid = session.status === "complete" && session.payment_status === "paid" && paymentIntent.status === "succeeded";
    if (!paid) return json({ error: "Stripe has not confirmed this payment as completed." }, 409);

    return json({
      verified: true,
      paid: true,
      sessionId: session.id,
      answers: decodeAnswersMetadata(session.metadata),
      amountTotal: session.amount_total ?? paymentIntent.amount_received ?? 0,
      currency: session.currency || paymentIntent.currency || "usd",
      livemode: Boolean(session.livemode),
    });
  } catch (error) { return errorResponse(error); }
}
