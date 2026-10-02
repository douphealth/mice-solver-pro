/** Consent-gated instrumentation. An installed analytics adapter must be supplied explicitly. */
type EventName = "quiz_started" | "quiz_completed" | "planner_start" | "planner_complete" | "report_viewed" | "pdf_downloaded" | "email_captured" | "premium_checkout_clicked" | "page_viewed" | "affiliate_click";
type SafeProperties = { steps?: number; path?: string };
type Adapter = (event: EventName, properties: SafeProperties) => void;
let adapter: Adapter | null = null;
let consent = false;
export function configureAnalytics(next: Adapter | null, hasConsent: boolean): void { adapter = next; consent = hasConsent; }
export function trackEvent(event: EventName, properties: Record<string, unknown> = {}): void {
  const safe: SafeProperties = {};
  if (typeof properties.steps === "number" && Number.isInteger(properties.steps) && properties.steps >= 0 && properties.steps <= 100) safe.steps = properties.steps;
  if (typeof properties.path === "string" && /^\/(?:quiz|report|tools\/(?:calculator|entry-points))?$/.test(properties.path)) safe.path = properties.path;
  try { if (consent && adapter) adapter(event, safe); } catch { /* Measurement must never break planning. */ }
}
export function trackPageView(path: string): void { trackEvent("page_viewed", { path }); }
