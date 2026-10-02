import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { generateReport, PLANNER_LIMITATION, SOURCES } from "@/lib/report-generator";
const observations = [
  ["sounds", "Unexplained noises"], ["droppings", "Possible droppings"], ["sighting", "A rodent sighting"],
  ["damaged_wiring", "Damaged wiring"], ["ventilation", "Waste in heating/cooling ducts"], ["heavy_contamination", "Extensive or inaccessible waste"],
];
export default function CalculatorPage() {
  const [observation, setObservation] = useState("");
  const report = useMemo(() => generateReport({ evidence: observation ? [observation] : [] }), [observation]);
  return <div className="min-h-screen flex flex-col bg-background"><Navbar/><main className="container mx-auto px-4 py-12 max-w-3xl"><h1 className="text-3xl md:text-4xl font-display font-bold mb-5">Observation and Action Planner</h1><p className="mb-4">A reported sign cannot tell you how many mice are present or how quickly a population will grow. Use this tool to organize the next safe action instead.</p><p className="text-sm text-muted-foreground mb-8">{PLANNER_LIMITATION}</p><label htmlFor="observation" className="block font-semibold mb-2">Choose the observation to review</label><select id="observation" value={observation} onChange={e => setObservation(e.target.value)} className="w-full border border-border bg-background rounded-lg p-3 mb-6"><option value="">Select an observation</option>{observations.map(([id, text]) => <option key={id} value={id}>{text}</option>)}</select>
    {observation && <section className="glass-card rounded-2xl p-6" aria-live="polite"><h2 className="text-xl font-semibold mb-4">{report.severityLabel}</h2><ol className="list-decimal pl-5 space-y-3 text-sm">{report.immediateActions.map(text => <li key={text}>{text}</li>)}</ol></section>}
    <section className="mt-8"><h2 className="text-xl font-semibold mb-3">Record evidence, not guesses</h2><p className="mb-4">After safe cleanup, note the date, location, newly appearing signs and trap checks. More pellets do not translate into a reliable mouse count. Continued signs are a reason to inspect and adjust the plan.</p><a className="underline text-primary" href={SOURCES[0].url}>{SOURCES[0].label}</a></section><Link className="inline-block mt-8 underline text-primary font-semibold" to="/quiz">Build a plan for your household</Link></main><Footer/></div>;
}
