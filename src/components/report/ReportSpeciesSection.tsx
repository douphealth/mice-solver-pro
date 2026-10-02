import type { ReportData } from "@/lib/report-generator";
export default function ReportSpeciesSection({ report }: { report: ReportData }) {
  return <section className="glass-card rounded-2xl p-6 md:p-8"><h2 className="text-xl font-display font-bold mb-3">Identification limits</h2><p className="text-sm text-muted-foreground">{report.species.description}</p><p className="text-sm mt-3">Do not handle a rodent or disturb waste to identify it. Record observations from a safe distance.</p><a className="inline-block mt-4 underline text-primary" href="https://micegoneguide.com/rats-vs-mice-whats-the-difference/">Read the mouse and rat identification guide</a></section>;
}
