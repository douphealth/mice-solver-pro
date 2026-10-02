# MiceGoneGuide Mouse Control Planner

Live at <https://elimination.micegoneguide.com>. A free, source-backed mouse control planner plus an optional one-time-purchase **Pro Masterplan** workspace.

- **Free:** seven-question quiz → personalised plan (today / this week / ongoing), four interactive tools, PDF, calendar reminders. No account, no email.
- **Pro ($9.99, Stripe Payment Link):** dated 30-day schedule, full room protocols, trap layout helper, evidence log with chart/CSV, sealing materials guide, supply list, pro-call kit, prevention calendar, print-ready PDF workbook.
- **Honesty rules** (enforced by tests and `npm run guardrails`): no diagnosis, no species ID, no mouse counts, no scores, no invented statistics or reviews, no guaranteed results. Every recommendation cites the CDC rodent-control pages or UC IPM house-mouse notes (reviewed 2 October 2026).

## Architecture

```
Browser (React + Vite + Tailwind)  ──►  Cloudflare Worker  ──►  Stripe API   (verify purchases)
        static app in dist/               worker/index.ts   └►  Brevo API    (email check-ins, access links)
```

One Worker (`micegoneguide-elimination-selfhosted-proxy`, route `elimination.micegoneguide.com/*`) serves the built app as static assets **and** the API. There is no database and no user account: access is decided by Stripe on every visit.

| Route | Purpose |
|---|---|
| `GET /api/entitlement?session_id=` | Is this Checkout Session a paid, unrefunded purchase of the Pro product? |
| `GET /api/pro-pack?session_id=` | Returns the Pro content **only** if the above is true (`402` otherwise). The Pro content lives in `worker/pro-content.ts` and is not in the public JS bundle. |
| `POST /api/restore` | Emails an access link to the address used at checkout (same response whether or not a purchase exists). |
| `POST /api/lead` | Optional email check-ins (Brevo list + welcome email). Consent required, honeypot, rate limited. |
| `POST /api/stripe-webhook` | Signed Stripe webhook; emails the access link after a paid checkout. Optional hardening: access never depends on it. |
| `GET /api/health` | Configuration status (booleans only). |

### How a purchase works

1. `/pro` links to the live Stripe Payment Link (`plink_1UCvLgGCqwm95OGXtz60RBjB`, $9.99, success URL `/payment-success?session_id={CHECKOUT_SESSION_ID}`).
2. Stripe returns the buyer to `/payment-success`. The page calls `/api/entitlement`; the Worker retrieves the session from Stripe and checks: product/payment link, `mode=payment`, `status=complete`, `payment_status=paid`, and (when the key allows) that the charge is not refunded or disputed.
3. Only then is the session id stored in the browser and `/pro` opens. Every later visit re-verifies, so a refund ends access. If the server can't be reached, a saved copy opens offline with a visible notice.
4. The access link is emailed (webhook, if configured) and can be re-sent from `/restore`.

A return URL, a click or a stored id **never** grants access by itself.

## Configuration (Cloudflare Worker secrets, never committed)

```sh
npx wrangler secret put STRIPE_SECRET_KEY      # restricted key, read-only, see below
npx wrangler secret put STRIPE_WEBHOOK_SECRET  # optional; signing secret of the webhook endpoint
npx wrangler secret put BREVO_API_KEY          # already set on the existing Worker
```

`STRIPE_SECRET_KEY` should be a **restricted** key created in Stripe → Developers → API keys with *read* access to **Checkout Sessions** (required) and **PaymentIntents + Charges** (enables refund detection). Without charge access the app still verifies payments and reports `refundCheck: false`.

Optional webhook: add an endpoint `https://elimination.micegoneguide.com/api/stripe-webhook` for `checkout.session.completed` and `checkout.session.async_payment_succeeded`, and store its signing secret as `STRIPE_WEBHOOK_SECRET`.

Plain variables (payment link id, product id, list id, sender) live in `wrangler.jsonc`.

## Develop and test

```sh
npm ci --ignore-scripts
npm run dev                 # Vite dev server (UI only; /api needs the Worker)
npm run build && npm run dev:worker   # full stack on http://127.0.0.1:8787 using .dev.vars
npm run mock:services       # local Stripe + Brevo stand-ins (port 9911)
npm run check               # typecheck + unit/API tests + guardrails + build
npx playwright install chromium
npm run test:e2e            # real browser, desktop + mobile, incl. axe accessibility audit
```

Create `.dev.vars` (git-ignored) for local runs:

```
STRIPE_SECRET_KEY=sk_test_local_mock_not_a_real_key
STRIPE_API_BASE=http://127.0.0.1:9911
BREVO_API_KEY=local-mock-key
BREVO_API_BASE=http://127.0.0.1:9911/v3
STRIPE_WEBHOOK_SECRET=whsec_local_mock_secret
DISABLE_RATE_LIMIT=1
```

`STRIPE_API_BASE`/`BREVO_API_BASE` are honoured only for `localhost`/`127.0.0.1`.

## Continuous integration

The existing `.github/workflows/trust-reset-validation.yml` runs typecheck, build, unit/API tests, the guardrails (`scripts/trust-regression.mjs` is a shim for `scripts/guardrails.mjs`) and the full browser suite (`playwright.trust.config.ts` re-exports `playwright.config.ts`; `scripts/ensure-dev-vars.mjs` creates the mock `.dev.vars`). Stricter `ci.yml` and a manual `deploy.yml` live in `docs/workflows/`; copy them to `.github/workflows/` with a token that has the `workflow` scope.

## Deploy

`npm run deploy` (or the manual **Deploy to production** workflow) builds, checks and runs `wrangler deploy`. The Worker keeps its existing secrets. The zone route is managed in the Cloudflare dashboard. Roll back with `npx wrangler rollback` (previous Worker version) — the previous Pages deployment `mice-solver-fixed` is untouched.

## Sources

CDC: cleaning up after rodents, trapping rodents, sealing entry gaps. UC IPM: house mouse. Linking is not endorsement, and the planner makes no claim of review by those organisations.
