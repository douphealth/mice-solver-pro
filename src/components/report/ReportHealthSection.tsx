import { SOURCES, type ReportData } from "@/lib/report-generator";
export default function ReportHealthSection({ report }: { report: ReportData }) {
  return <section className="glass-card rounded-2xl p-6 md:p-8"><h2 className="text-xl font-display font-bold mb-3">Safety and professional help</h2><ul className="list-disc pl-5 text-sm space-y-3">{report.healthRisks.map(x => <li key={x}>{x}</li>)}</ul><a className="inline-block mt-4 underline text-primary" href={SOURCES[0].url}>{SOURCES[0].label}</a></section>;
}
