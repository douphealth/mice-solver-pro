import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { generateReport, SOURCES } from "@/lib/report-generator";
const homes = [["detached", "Detached house"], ["apartment", "Apartment / condo"], ["townhouse", "Townhouse / shared walls"]];
export default function EntryPointsPage() {
  const [home, setHome] = useState("");
  const report = useMemo(() => generateReport({ home_type: home }), [home]);
  return <div className="min-h-screen flex flex-col bg-background"><Navbar/><main className="container mx-auto px-4 py-12 max-w-3xl"><h1 className="text-3xl md:text-4xl font-display font-bold mb-4">Entry-Gap Inspection Checklist</h1><p className="mb-6">A property type suggests places to inspect; it cannot prove which route an animal used. Inspect only safely accessible areas.</p><fieldset><legend className="font-semibold mb-3">Choose your property type</legend><div className="grid sm:grid-cols-3 gap-3">{homes.map(([id, text]) => <label key={id} className="border border-border rounded-xl p-4 flex gap-3"><input type="radio" name="home" value={id} checked={home === id} onChange={() => setHome(id)}/>{text}</label>)}</div></fieldset>
    {home && <section className="mt-7 space-y-3" aria-live="polite">{report.entryPoints.map((text, i) => <details className="glass-card rounded-xl p-5" key={text} open={i === 0}><summary className="font-semibold cursor-pointer">{["Accessible inspection areas", "Materials and repairs", "Building-service precautions", "Shared-building coordination"][i]}</summary><p className="text-sm mt-3">{text}</p></details>)}</section>}
    <p className="mt-7">Never add a lint-catching screen to dryer exhaust or block ventilation, drainage or fire-safety systems. Contamination inside heating or cooling ducts needs professional help.</p><a className="block mt-4 underline text-primary" href={SOURCES[2].url}>{SOURCES[2].label}</a><a className="block mt-3 underline text-primary" href={SOURCES[0].url}>{SOURCES[0].label}</a><Link className="inline-block mt-7 underline text-primary font-semibold" to="/quiz">Build a household planning checklist</Link></main><Footer/></div>;
}
