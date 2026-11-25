# Mouse Control Planner audit, 25 November 2026

Live site: https://elimination.micegoneguide.com (release `stripe-access-mail-2026-11-22`, unchanged by this audit). All live checks were read-only. Nothing was paid, emailed or deployed.

## 1. Quiz paths (live production, before changes)

Script: `node scripts/audit-quiz-live.mjs` (Playwright Chromium, desktop 1280×900 and 375×812 phone). Raw results: `live-quiz-results.json`. Screenshots: `shots/live-*`.

| Scenario | Answers (short) | Plan status shown | Top 3 "Start here" | One H1 | Overflow at 375px | Console errors (desktop / 375px) | Free PDF |
|---|---|---|---|---|---|---|---|
| A | droppings, kitchen, detached house, no kids/pets, nothing tried, sealed food, just noticed | Physical signs reported: inspect and verify | Set snap traps · Keep food airtight · Gather supplies | yes | none | 0 / 0 | downloads |
| B | droppings + damaged wiring + duct waste, kitchen + attic, apartment, children + dogs, glue traps + rodenticide, mixed food, came back | Reported conditions need qualified attention | Keep clear of damaged wiring · Leave duct contamination to professionals · Stop using glue traps | yes | none | 0 / 0 | downloads |
| C | noises + odor only, walls + bedroom, manufactured home, cats, ultrasonic + scents, open pet bowls, over a month | Activity not confirmed by physical evidence | Close off open food · Look for physical evidence first · Gather supplies | yes | none | 0 / 0 | downloads |

Every plan rendered, followed the rules in `src/lib/plan.ts` and cited CDC or UC IPM on each step. The gaps found are below (C1–C3).

## 2. Findings

| # | Area | Finding | Evidence | Fix in this PR |
|---|---|---|---|---|
| S1 | SEO, high | Every route served the **home page's** `<title>`, description and `canonical=/` in the raw HTML. The client fixed them with JavaScript, but crawlers that don't render (much of Bing's crawl) saw all six indexable pages as copies of `/`. | `curl /tools/entry-points` → `<title>Mouse Control Planner…`, `canonical …/` | Worker rewrites the head per route from `src/lib/site.ts` (`routeHead`). 404s get "Page not found" + `noindex`. Unit and e2e tests added. |
| T1 | Tracking, high | All `trackEvent(...)` calls went nowhere: no analytics adapter was ever installed, so the funnel (quiz → plan → Pro → checkout) wasn't measured. | `configureAnalytics` called only in a unit test | New `POST /api/event`: allowlisted event name + app path + country only, no IP/id/cookie/answers; skipped on Do Not Track / Global Privacy Control. Stored in Analytics Engine dataset `mgg_planner_events` and Workers Logs. Page views and a new `pro_cta_clicked` event added. Privacy page updated to say so. |
| C1 | Safety, high | Homes with **children or pets** got no poison-emergency guidance, and the "call a professional" step suggested a poison bait station with no child/pet caveat. | Scenario B and C plan text | New step for homes with children or pets (EPA: tamper-resistant stations, out of reach, locked storage) with Poison Help 1-800-222-1222 and ASPCA APCC (888) 426-4435; the same numbers are added to the rodenticide step and a tap-to-call callout in "When to call a pro". Escalation step now says tamper-resistant stations only. Pro day-21 task updated the same way. |
| C2 | Content, medium | No humane options anywhere in the plan. | Plan text | New "Prefer not to kill mice?" step: exclusion first (UC IPM), live-trap trade-offs (EPA), CDC caution on live traps, UC IPM's frequent-check and relocation notes, "check local rules". |
| C3 | Sources | Poison and humane claims needed a named source. | — | Added EPA "Safely use rodent bait products" and EPA "Options for dealing with rodent infestations" (both read on 25 Nov 2026); every new claim matches those pages or UC IPM's house-mouse page. |
| P1 | Payments, medium | `/api/restore` emailed the newest paid session even when it was **refunded**, so a buyer with an earlier valid purchase got a link that then failed. It also used a looser match than the unlock. | `findPaidSessionByEmail` | Restore now uses the same rule as the unlock (`evaluateSession`) and re-checks the newest three with `checkEntitlement`, skipping refunded/disputed ones. Tests added. |
| P2 | Payments, medium | No refund route was written anywhere. | Terms, Pro FAQ | Terms and Pro FAQ now say how to ask (email with checkout address), that refunds go back through Stripe, and that access ends automatically. No promise of a refund was added. **Owner: confirm this matches your policy.** |
| P3 | Payments, info | Webhook still not configured (`/api/health` → `webhook:false`). Not needed for access (the success page emails the link), but buyers who close the tab before returning get no email until they use Restore. | live `/api/health` | Not changed (Stripe change → owner). |
| P4 | Payments, info | A real paid purchase has still never been run end to end. | — | Not done (no payment allowed). |
| V1 | Conversion | No free-vs-Pro comparison on the plan page or the Pro page; the plan ended in a generic promo. | screenshots | Shared `FreeProCompare` table (fits 375px without sideways scroll) on home, plan and Pro pages; a "Your next step" CTA after the free plan. |
| L1 | Links | All 46 micegoneguide.com URLs link to the app, but only to `/` (with UTMs). None deep-links to the tools. The app linked back to 4 guides. | sitemap crawl, 25 Nov | App now also links to "Where to place mouse traps" and "Humane mouse removal" and shows the guides on the plan page. Main-site deep links are a WordPress change, not in this PR. |
| W1 | Core Web Vitals | Lab, throttled phone (Slow 4G, 4× CPU), live: LCP 2.36–2.68 s, CLS 0.000 on all routes, long-task time 109–705 ms (home highest). No field (CrUX) data exists for this subdomain. PageSpeed API quota was exhausted and a Lighthouse download was blocked, so these come from `scripts/audit-vitals.mjs`. | script output | Nothing changed. LCP sits right at the 2.5 s "good" line on a slow profile; pre-rendering the public pages is the follow-up that would fix LCP and put an H1 in the raw HTML. |

## 3. Checks on the payment path (live, no purchase)

- Pro button on `/pro` → `https://buy.stripe.com/dRm6oH61y1qwbUN3UGejK02`, Stripe page shows **$9.99**, "Pro Mouse Elimination Masterplan" (desktop and 375px). Not paid. Screenshots: `shots/live-stripe-checkout-*`.
- `/api/health`: `stripe:true, stripeKeySet:true, webhook:false, email:true`.
- Made-up session id → `/api/entitlement` `not_found`, `refundCheck:true` (the key can read charges, so refunds are detected).
- Unlock is decided only by the Worker from Stripe (`evaluateSession`: our payment link, `mode=payment`, `status=complete`, `payment_status=paid`, not refunded or disputed). The Pro content is only in `worker/pro-content.ts` and only served after that check. Existing buyers' stored session ids keep working: the rule didn't change.
- Restore, success page, access email and refund denial are covered against mocked Stripe/Brevo in `npx playwright test` (98 passed) and `worker/api.test.ts`.

## 4. Test results on this branch

- `npm run check`: typecheck OK, 95 unit/API tests passed, guardrails OK, build OK.
- `npx playwright test`: 98 passed (desktop + mobile, incl. axe accessibility).
- The three quiz paths re-run on the local Worker with these changes: 0 console errors, no overflow, PDF OK at desktop and 375px. Screenshots: `shots/after-*`.
