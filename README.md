# MiceGoneGuide — Mouse Problem Solver

AI-powered mouse infestation diagnostic and personalized elimination plan generator.

## What It Does

- **Free Diagnostic Quiz** — 16 smart, branching questions that identify your species, assess severity (1-10), map entry points, and flag health risks
- **Instant Report** — Personalized analysis with severity gauge, species profile, entry points, health risks, and 3 immediate action steps
- **Pro Report ($9.99)** — Complete elimination masterplan: room-by-room strategy, shopping list with product recommendations, day-by-day protocol, decontamination guide, and downloadable PDF
- **Premium Plan ($19.99/year)** — Pro report + email follow-up series, seasonal prevention checklists, 30-day re-assessment

## Free Tools

- **Infestation Growth Calculator** — Visualize how fast mice multiply over 12 months
- **Entry Point Finder** — Home-type-specific entry point guide with sealing instructions

## Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Framer Motion animations
- Supabase (auth + database)
- Stripe (payments)
- Deployed on Cloudflare Pages

## Getting Started

```bash
npm install
npm run dev
```

## Links

- **App**: [app.micegoneguide.com](https://elimination.micegoneguide.com)
- **Blog**: [micegoneguide.com](https://micegoneguide.com)

---

© MiceGoneGuide. For informational purposes only.


## Production payment architecture

The revenue-critical Stripe flow runs on Cloudflare Pages Functions under `/api/*`. The browser never receives the Stripe secret key. Premium access is granted only after `/api/verify-checkout` retrieves the Checkout Session directly from Stripe, confirms the configured price, confirms the PaymentIntent succeeded, and rejects fully refunded or actively disputed payments.

### Required Cloudflare Pages variables

Set these in Cloudflare Pages for Production, and use Stripe test values for Preview testing:

- `STRIPE_SECRET_KEY` — Stripe secret key for the environment.
- `STRIPE_PRICE_ID` — the one-time Pro price.
- `STRIPE_WEBHOOK_SECRET` — signing secret for the webhook endpoint.
- `PUBLIC_APP_URL` — `https://elimination.micegoneguide.com`.
- `STRIPE_EXPECTED_MODE` — `live` in production and `test` for Stripe test deployments.

Do not commit live secret keys.

### Stripe webhook

Configure this endpoint in Stripe:

`https://elimination.micegoneguide.com/api/stripe-webhook`

Subscribe to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`
- `charge.refunded`
- `charge.dispute.created`
- `charge.dispute.closed`

The webhook validates Stripe's signature using the raw request body. Entitlement verification also queries Stripe at access time, so a fully refunded or actively disputed payment does not pass verification.

### Release verification

1. CI must pass install, lint, unit tests, and production build.
2. On a Preview deployment configured with Stripe test credentials and `STRIPE_EXPECTED_MODE=test`, complete one test Checkout.
3. Confirm the success page verifies the Checkout Session before showing Pro access.
4. Confirm the full Pro report and Pro PDF unlock only after successful payment.
5. Cancel a Checkout and confirm the user returns to the free report without Pro access.
6. Refund the test payment and confirm re-verification no longer grants Pro access.
7. Only then configure production with Stripe live credentials and `STRIPE_EXPECTED_MODE=live`.
