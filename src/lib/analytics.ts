/** Consent-gated instrumentation. Nothing is sent unless an adapter is installed and the visitor has consented. */
type EventName =
  | "planner_start" | "planner_complete" | "report_viewed" | "pdf_downloaded" | "email_captured"
  | "calendar_downloaded" | "checkout_started" | "pro_verified" | "pro_pdf_downloaded" | "log_exported" | "page_viewed";
type SafeProperties = { steps?: number; path?: string };
type Adapter = (event: EventName, properties: SafeProperties) => void;
let adapter: Adapter | null = null;
let consent = false;
export function configureAnalytics(next: Adapter | null, hasConsent: boolean): void { adapter = next; consent = hasConsent; }
export function trackEvent(event: EventName, properties: Record<string, unknown> = {}): void {
  const safe: SafeProperties = {};
  if (typeof properties.steps === "number" && Number.isInteger(properties.steps) && properties.steps >= 0 && properties.steps <= 100) safe.steps = properties.steps;
  if (typeof properties.path === "string" && /^\/(?:quiz|plan|pro|tools\/(?:calculator|entry-points|trap-placement|cleanup-guide))?$/.test(properties.path)) safe.path = properties.path;
  try { if (consent && adapter) adapter(event, safe); } catch { /* Measurement must never break planning. */ }
}
export function trackPageView(path: string): void { trackEvent("page_viewed", { path }); }
