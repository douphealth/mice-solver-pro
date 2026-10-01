import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { generateReport, SOURCES } from "@/lib/report-generator";
import { trackEvent } from "@/lib/analytics";
import { generatePDF } from "@/lib/pdf-generator";
import type { QuizAnswers } from "@/lib/quiz-data";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import ReportSeveritySection from "@/components/report/ReportSeveritySection";
import ReportSpeciesSection from "@/components/report/ReportSpeciesSection";
import ReportHealthSection from "@/components/report/ReportHealthSection";
import ReportEntryPointsSection from "@/components/report/ReportEntryPointsSection";
import ReportActionsSection from "@/components/report/ReportActionsSection";
import ReportPremiumPreview from "@/components/report/ReportPremiumPreview";
import EmailCaptureModal from "@/components/EmailCaptureModal";

export default function ReportPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showEmail, setShowEmail] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);
  const [status, setStatus] = useState("");
  const [downloading, setDownloading] = useState(false);
  const answers = (location.state as { answers?: QuizAnswers } | null)?.answers;
  const report = useMemo(() => answers ? generateReport(answers) : null, [answers]);
  useEffect(() => { if (!answers) navigate("/quiz", { replace: true }); else trackEvent("report_viewed"); }, [answers, navigate]);
  async function download() {
    if (!report || downloading) return;
    setDownloading(true); setStatus("");
    try { const doc = await generatePDF(report, false, answers); doc.save("MiceGoneGuide-Mouse-Control-Plan.pdf"); trackEvent("pdf_downloaded"); }
    catch { setStatus("The PDF could not be generated. You can still read the full checklist below or print this page."); }
    finally { setDownloading(false); }
  }
  async function share() {
    try {
      const url = "https://elimination.micegoneguide.com/quiz";
      if (navigator.share) await navigator.share({ title: "Mouse Control Planner", text: "An observation-based planning checklist, not an infestation diagnosis.", url });
      else { await navigator.clipboard.writeText(url); setStatus("Planner link copied. Your answers were not shared."); }
    } catch { setStatus("Nothing was shared. You can share the planner address without including your answers."); }
  }
  if (!report) return null;
  return <div className="min-h-screen flex flex-col bg-background"><Navbar/>
    <header className="bg-hero"><div className="container mx-auto px-4 py-12 max-w-3xl text-primary-foreground"><p className="text-sm mb-3">Observation-based planning</p><h1 className="text-3xl md:text-5xl font-display font-bold mb-5">Your Mouse Control Plan</h1><p className="mb-6">Organize inspection, trapping, cleanup and exclusion around the signs you reported.</p><div className="flex flex-wrap gap-3"><Button variant="hero" onClick={download} disabled={downloading}>{downloading ? "Preparing PDF..." : "Download free plan PDF"}</Button><Button variant="hero-outline" onClick={share}>Share the planner</Button></div>{status && <p role="status" className="mt-4 text-sm">{status}</p>}</div></header>
    <main className="container mx-auto px-4 py-10 max-w-3xl space-y-6">
      <ReportSeveritySection report={report}/><ReportActionsSection report={report}/><ReportHealthSection report={report}/><ReportEntryPointsSection report={report}/><ReportSpeciesSection report={report}/>
      <section className="glass-card rounded-2xl p-6"><h2 className="text-xl font-semibold mb-3">How this plan was assembled</h2><p className="text-sm mb-4">Physical observations and unconfirmed indicators are kept separate. Reported hazards trigger specific professional-help prompts. Room choices organize inspection areas; household choices add access precautions. The planner does not calculate species probabilities, population counts or disease risk. Sources inform this guidance without endorsing the tool.</p><ul className="space-y-2 text-sm">{SOURCES.map(source => <li key={source.url}><a className="underline text-primary" href={source.url}>{source.label}</a></li>)}</ul></section>
      <ReportPremiumPreview report={report}/>
      {emailSaved ? <p role="status">Your request was saved. Email delivery has not been independently confirmed; download your plan here for immediate access.</p> : <><Button variant="outline" onClick={() => setShowEmail(!showEmail)} aria-expanded={showEmail}>Optional email check-ins</Button><EmailCaptureModal open={showEmail} onSuccess={() => { setEmailSaved(true); trackEvent("email_captured"); }}/></>}
      <p className="text-sm text-muted-foreground">Download your plan before leaving this page. Individual answers are not included in the shared planner link.</p><Link className="inline-block underline text-primary" to="/quiz">Start a new plan</Link>
    </main><Footer/></div>;
}
