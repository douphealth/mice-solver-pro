export interface Env {
  /** Static assets (the built Vite app). */
  ASSETS: { fetch(request: Request): Promise<Response> };

  // --- plain variables (wrangler.jsonc) ---
  PUBLIC_ORIGIN: string;
  RELEASE: string;
  /** The live Stripe Payment Link that sells the Pro Masterplan. Sessions from any other link or product are rejected. */
  PAYMENT_LINK_ID: string;
  PRODUCT_ID: string;
  PRICE_ID: string;
  BREVO_LIST_ID?: string;
  SENDER_EMAIL?: string;
  /** Test hooks. Never set in production. */
  STRIPE_API_BASE?: string;
  BREVO_API_BASE?: string;
  DISABLE_RATE_LIMIT?: string;

  // --- secrets (wrangler secret put) ---
  /** Restricted key, read-only: Checkout Sessions (and optionally PaymentIntents/Charges for refund detection). */
  STRIPE_SECRET_KEY?: string;
  /** Signing secret of the Stripe webhook endpoint https://<origin>/api/stripe-webhook. Optional hardening. */
  STRIPE_WEBHOOK_SECRET?: string;
  BREVO_API_KEY?: string;
}
