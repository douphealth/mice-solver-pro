import type { ReportData } from "@/lib/report-generator";
export default function ReportSeveritySection({ report }: { report: ReportData }) {
  return <section className="glass-card rounded-2xl p-6 md:p-8" aria-labelledby="observations-heading">
    <h2 id="observations-heading" className="text-xl font-display font-bold mb-3">{report.severityLabel}</h2>
    <p className="text-sm text-muted-foreground mb-5">{report.severityDescription}</p>
    <h3 className="font-semibold mb-2">Physical observations</h3>
    {report.physicalSigns.length ? <ul className="list-disc pl-5 space-y-2 text-sm">{report.physicalSigns.map(x => <li key={x}>{x}</li>)}</ul> : <p className="text-sm">No physical signs were selected. That does not prove an absence of rodents.</p>}
    {report.uncertainSigns.length > 0 && <><h3 className="font-semibold mt-5 mb-2">Unconfirmed indicators</h3><ul className="list-disc pl-5 space-y-2 text-sm">{report.uncertainSigns.map(x => <li key={x}>{x}</li>)}</ul></>}
  </section>;
}
