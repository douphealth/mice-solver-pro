import { SOURCES, type ReportData } from "@/lib/report-generator";
export default function ReportEntryPointsSection({ report }: { report: ReportData }) {
  return <section className="glass-card rounded-2xl p-6 md:p-8"><h2 className="text-xl font-display font-bold mb-3">Where to inspect, not a route diagnosis</h2><ul className="list-disc pl-5 text-sm space-y-3">{report.entryPoints.map(x => <li key={x}>{x}</li>)}</ul><a className="inline-block mt-4 underline text-primary" href={SOURCES[2].url}>{SOURCES[2].label}</a></section>;
}
