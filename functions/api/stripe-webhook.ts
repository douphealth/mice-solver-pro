import { APP_ID, errorResponse, json   type StripeEnv,\n} from "./_stripe";

function parseStripeSignature(header: string) {
  let timestamp = "";
  const signatures: string[] = [];
  for (const item of header.split(",")) {
    const [key, value] = item.split("=", 2);
    if (key === "t" && value) timestamp = value;
    if (key === "v1" && value) signatures.push(value);
  }
  return { timestamp, signatures };
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) {
    diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return diff === 0;
}

async function validSignature(rawBody: string, header: string, secret: string) {
  const { timestamp, signatures } = parseStripeSignature(header);
  const epoch = Number(timestamp);
  if (!Number.isFinite(epoch) || Math.abs(Date.now() / 1000 - epoch) > 300) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(timestamp + "." + rawBody)
  );
  const expected = toHex(digest);
  return signatures.some((signature) => constantTimeEqual(signature, expected));
}

interface FunctionContext {
  request: Request;
  env: StripeEnv;
}

export async function onRequestPost(context: FunctionContext) {
  try {
    const secret = context.env.STRIPE_WEBHOOK_SECRET?.trim();
    if (!secret || !secret.startsWith("whsec_")) {
      return json({ error: "Stripe webhook secret is not configured." }, 503);
    }

    const request = context.request as Request;
    const signature = request.headers.get("stripe-signature") || "";
    const rawBody = await request.text();
    if (!signature || !(await validSignature(rawBody, signature, secret))) {
      return json({ error: "Invalid Stripe webhook signature." }, 400);
    }

    const event = JSON.parse(rawBody);
    const supported = new Set([
      "checkout.session.completed",
      "checkout.session.async_payment_succeeded",
      "checkout.session.async_payment_failed",
      "checkout.session.expired",
      "charge.refunded",
      "charge.dispute.created",
      "charge.dispute.closed",
    ]);

    if (supported.has(event.type)) {
      const object = event?.data?.object;
      console.log("Stripe webhook received", {
        id: event.id,
        type: event.type,
        app: object?.metadata?.app || null,
        relevant: object?.metadata?.app === APP_ID || event.type.startsWith("charge."),
      });
    }

    return json({ received: true });
  } catch (error) {
    return errorResponse(error);
  }
}
