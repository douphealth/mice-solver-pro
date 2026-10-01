import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";
import type { ReportData } from "@/lib/report-generator";
export default function ReportPremiumPreview({ report }: { report: ReportData }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function checkout() {
    setLoading(true); setError(""); trackEvent("premium_checkout_clicked");
    // Retain the existing checkout service and price configuration. No purchase is inferred here.
    const tab = window.open("about:blank", "_blank");
    if (tab) tab.opener = null;
    try {
      const { data, error: failure } = await supabase.functions.invoke("create-checkout", { body: { quizResultId: "" } });
      if (failure || typeof data?.url !== "string") throw new Error("checkout unavailable");
      const url = new URL(data.url);
      if (url.protocol !== "https:" || url.hostname !== "checkout.stripe.com") throw new Error("unexpected checkout destination");
      if (tab) tab.location.href = url.href;
      else setError("Your browser blocked the checkout tab. Allow pop-ups for this site and try again. Your plan is still here.");
    } catch { tab?.close(); setError("Checkout could not be opened. No payment was confirmed. Your free plan remains available."); }
    finally { setLoading(false); }
  }
  return <section className="glass-card rounded-2xl p-6 md:p-8" id="pricing"><h2 className="text-2xl font-display font-bold mb-4">Optional extended planning</h2><p className="text-sm mb-5">The free safety guidance stays above. Extended planning organizes room-specific tasks, supply-selection criteria, work phases and recurring checks. It is not a professional inspection or a promise of elimination.</p><dl className="grid sm:grid-cols-2 gap-4 mb-6"><div><dt className="font-semibold">Room-by-room tasks</dt><dd className="text-sm text-muted-foreground">Organized around the areas you selected.</dd></div><div><dt className="font-semibold">Supply checklist</dt><dd className="text-sm text-muted-foreground">{report.shoppingList.length} categories to assess, not required products or exact trap quantities.</dd></div><div><dt className="font-semibold">Work phases</dt><dd className="text-sm text-muted-foreground">Inspect, control, clean and recheck without a guaranteed completion date.</dd></div><div><dt className="font-semibold">Monitoring routine</dt><dd className="text-sm text-muted-foreground">Record observed changes and decide when to seek qualified help.</dd></div></dl><Button variant="premium" onClick={checkout} disabled={loading}>{loading ? "Opening checkout..." : "View secure checkout"}</Button><p className="text-xs text-muted-foreground mt-3">Confirm the current price and terms at checkout. Opening checkout does not confirm a purchase.</p>{error && <p className="text-sm mt-4 text-destructive" role="alert">{error}</p>}</section>;
}
