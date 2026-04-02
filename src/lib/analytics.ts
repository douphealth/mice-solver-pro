/**
 * Lightweight analytics tracker — drop-in ready for PostHog, Plausible, or GA4.
 * Currently logs to console. Replace with your analytics provider.
 */

type EventName =
  | "quiz_started"
  | "quiz_completed"
  | "report_viewed"
  | "pdf_downloaded"
  | "email_captured"
  | "premium_checkout_clicked"
  | "page_viewed";

interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

export function trackEvent(event: EventName, properties?: EventProperties) {
  try {
    // PostHog integration (uncomment when ready):
    // if (typeof window !== 'undefined' && (window as any).posthog) {
    //   (window as any).posthog.capture(event, properties);
    // }

    // Plausible integration (uncomment when ready):
    // if (typeof window !== 'undefined' && (window as any).plausible) {
    //   (window as any).plausible(event, { props: properties });
    // }

    // Console logging for development
    if (import.meta.env.DEV) {
      console.log(`[Analytics] ${event}`, properties || "");
    }
  } catch {
    // Analytics should never break the app
  }
}

export function trackPageView(path: string) {
  trackEvent("page_viewed", { path });
}
