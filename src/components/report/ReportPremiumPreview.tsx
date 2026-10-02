import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import type { ReportData } from "@/lib/report-generator";

// Existing production destination, recovered from the live application's bundle.
// Do not infer payment or paid access from a click, redirect or query parameter.
export const PRODUCTION_CHECKOUT_URL = "https://buy.stripe.com/dRm6oH61y1qwbUN3UGejK02";

export default function ReportPremiumPreview({ report }: { report: ReportData }) {
  return <section className="glass-card rounded-2xl p-6 md:p-8" id="pricing">
    <h2 className="text-2xl font-display font-bold mb-4">Optional extended planning</h2>
    <p className="text-sm mb-5">The free safety guidance stays above. Extended planning organizes room-specific tasks, supply-selection criteria, work phases and recurring checks. It is not a professional inspection or a promise of elimination.</p>
    <dl className="grid sm:grid-cols-2 gap-4 mb-6">
      <div><dt className="font-semibold">Room-by-room tasks</dt><dd className="text-sm text-muted-foreground">Organized around the areas you selected.</dd></div>
      <div><dt className="font-semibold">Supply checklist</dt><dd className="text-sm text-muted-foreground">{report.shoppingList.length} categories to assess, not required products or exact trap quantities.</dd></div>
      <div><dt className="font-semibold">Work phases</dt><dd className="text-sm text-muted-foreground">Inspect, control, clean and recheck without a guaranteed completion date.</dd></div>
      <div><dt className="font-semibold">Monitoring routine</dt><dd className="text-sm text-muted-foreground">Record observed changes and decide when to seek qualified help.</dd></div>
    </dl>
    <Button variant="premium" asChild><a href={PRODUCTION_CHECKOUT_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("premium_checkout_clicked")}>View secure checkout</a></Button>
    <p className="text-xs text-muted-foreground mt-3">Review the current product, price, delivery and terms on Stripe before paying. Opening checkout does not confirm payment or unlock access in this app. Your free plan remains available here.</p>
  </section>;
}
