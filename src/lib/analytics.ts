/**
 * Privacy-safe funnel counts. Only an allowlisted event name and, for a few events, a fixed app path are ever sent:
 * no answers, no email, no ids, no cookies, no query strings. Nothing is sent when the browser signals Do Not Track or
 * Global Privacy Control, and measurement can never break planning.
 */
import { EVENT_PATH_RE, type EventName } from "./events";

export type { EventName };
type SafeProperties = { steps?: number; path?: string };
type Adapter = (event: EventName, properties: SafeProperties) => void;

let adapter: Adapter | null = null;
let consent = false;
export function configureAnalytics(next: Adapter | null, hasConsent: boolean): void { adapter = next; consent = hasConsent; }
export function trackEvent(event: EventName, properties: Record<string, unknown> = {}): void {
  const safe: SafeProperties = {};
  if (typeof properties.steps === "number" && Number.isInteger(properties.steps) && properties.steps >= 0 && properties.steps <= 100) safe.steps = properties.steps;
  if (typeof properties.path === "string" && EVENT_PATH_RE.test(properties.path)) safe.path = properties.path;
  try { if (consent && adapter) adapter(event, safe); } catch { /* Measurement must never break planning. */ }
}
export function trackPageView(path: string): void { trackEvent("page_viewed", { path }); }

/** True when the visitor has asked not to be tracked (Do Not Track or Global Privacy Control). */
export function optedOut(nav: Navigator | undefined = typeof navigator === "undefined" ? undefined : navigator): boolean {
  if (!nav) return true;
  const n = nav as Navigator & { globalPrivacyControl?: boolean; doNotTrack?: string | null };
  return n.globalPrivacyControl === true || n.doNotTrack === "1";
}

/** Sends each event to this site's own /api/event endpoint with sendBeacon (falls back to a keepalive fetch). */
export const beaconAdapter: Adapter = (event, properties) => {
  const body = JSON.stringify({ event, ...properties });
  const blob = new Blob([body], { type: "application/json" });
  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function" && navigator.sendBeacon("/api/event", blob)) return;
  void fetch("/api/event", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true, credentials: "omit" }).catch(() => {});
};

/** Turn measurement on for real visitors on the real site. Called once from main.tsx. */
export function startAnalytics(hostname: string): void {
  const local = hostname === "localhost" || hostname === "127.0.0.1";
  const real = hostname === "elimination.micegoneguide.com" || local;
  configureAnalytics(beaconAdapter, real && !optedOut());
}
