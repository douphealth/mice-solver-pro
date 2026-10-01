# MiceGoneGuide - Personalized Mouse Control Planner

This React/TypeScript app organizes inspection, trapping, cleanup and exclusion steps around user-reported observations. It does not diagnose an infestation, identify a species, estimate population, assess disease risk or guarantee clearance.

## Features
- Six-step observation checklist with back navigation and validation.
- Immediate free plan, practical safety guidance and locally generated PDF.
- Observation/action planner at the existing calculator URL.
- Property-specific entry-gap inspection prompts.
- Existing authentication and Stripe checkout integration retained.
- Optional email reminders; this is not a claim of guaranteed email delivery.

## Development and verification
```sh
npm ci --ignore-scripts
npm run build
npx tsc --noEmit -p tsconfig.app.json
npm test
node scripts/trust-regression.mjs
npx playwright install chromium
npx playwright test --config playwright.trust.config.ts
```
Browser regression tests block non-localhost requests: no real payments, emails or accounts are created. PDFs and screenshots are saved under `evidence/`.

## Deployment gates
This change is staged, not a declaration that production was updated. Verify the custom domain's actual Cloudflare Pages/Worker deployment mapping before release. Deploy the email edge function separately after reviewing consent, suppression/unsubscribe and delivery configuration. Public HTML and repository metadata were not identical during the audit.

Existing paid fulfillment needs verification: the current checkout call passes an empty quiz-result ID. A return URL is not payment verification or entitlement. The return page no longer claims a purchase or unlock without proof. Do not market paid fulfillment as tested until Stripe test-mode checkout, signed webhook and entitlement checks pass.

Analytics are consent-gated and require an explicitly configured adapter. No purchase event is emitted from a click or return URL. No analytics-provider setup is claimed by this patch.

## Sources and limitations
Guidance references CDC rodent cleanup, trapping and exclusion and UC IPM house-mouse guidance. These organizations have not reviewed or endorsed this app. Product labels, local rules and qualified professional judgment may require different action.

## Rollback
The pre-change code is preserved at branch `backup/pre-trust-reset-2026-10-01`, commit `d775bab6e834e88574d1b12178d7a65f8422d383`. Revert the reviewed change commit on the deployment branch rather than force-pushing or discarding unrelated work. No database migrations are included.
