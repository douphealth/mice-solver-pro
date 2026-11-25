/** Funnel events the app may count, shared by the browser (src/lib/analytics.ts) and the worker (/api/event). */
export const EVENT_NAMES = [
  "planner_start", "planner_complete", "report_viewed", "pdf_downloaded", "email_captured",
  "calendar_downloaded", "pro_cta_clicked", "checkout_started", "pro_verified", "pro_pdf_downloaded", "log_exported", "page_viewed",
] as const;
export type EventName = (typeof EVENT_NAMES)[number];

/** App paths an event may carry. Anything else is dropped on both sides. */
export const EVENT_PATH_RE = /^\/(?:quiz|plan|pro|tools\/(?:calculator|entry-points|trap-placement|cleanup-guide))?$/;
