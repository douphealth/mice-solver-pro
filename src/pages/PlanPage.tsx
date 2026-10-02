import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, CalendarPlus, CheckCircle2, ChevronRight, Download, Eye, FileDown, Pencil, RotateCcw, Share2 } from "lucide-react";
import PageShell from "@/components/layout/PageShell";
import EmailOptIn from "@/components/EmailOptIn";
import ProPromo from "@/components/ProPromo";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Callout, CheckRow, ProgressRing, ScopeNote, Sources } from "@/components/ui-kit";
import { GapGauge } from "@/components/illustrations";
import { actionsByPhase, firstSentence, generatePlan, PHASE_META, type Phase, type Plan } from "@/lib/plan";
import { CLEANUP_PRO_HELP, CLEANUP_PROCEDURES, MATERIALS } from "@/lib/guides";
import { isComplete, loadAnswers, saveAnswers } from "@/lib/answers";
import { buildIcs, downloadText } from "@/lib/ics";
import { trapCheckDays } from "@/lib/schedule";
import { useChecks } from "@/lib/storage";
import { trackEvent } from "@/lib/analytics";
import { SITE_ORIGIN, SOURCES } from "@/lib/sources";
import type { QuizAnswers } from "@/lib/quiz-data";

const STATUS_STYLE: Record<Plan["status"]["level"], { box: string; chip: string; Icon: typeof AlertTriangle; chipText: string }> = {
  attention: { box: "border-destructive/40 bg-destructive/10", chip: "bg-destructive text-destructive-foreground", Icon: AlertTriangle, chipText: "Qualified help first" },
  verify: { box: "border-accent/50 bg-accent/10", chip: "bg-accent text-accent-foreground", Icon: Eye, chipText: "Signs reported" },
  unconfirmed: { box: "border-primary-foreground/25 bg-primary-foreground/10", chip: "bg-primary-foreground text-primary", Icon: Eye, chipText: "Not yet confirmed" },
};

export default function PlanPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const stateAnswers = (location.state as { answers?: QuizAnswers } | null)?.answers;
  const answers = useMemo(() => stateAnswers ?? loadAnswers(), [stateAnswers]);
  const plan = useMemo(() => generatePlan(answers), [answers]);
  const phases = useMemo(() => actionsByPhase(plan), [plan]);
  const { checked, toggle, count, reset } = useChecks();
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState<"" | "pdf">("");

  useEffect(() => {
    if (!isComplete(answers)) { navigate("/quiz", { replace: true }); return; }
    saveAnswers(answers);
    trackEvent("report_viewed");
  }, [answers, navigate]);

  const ids = plan.actions.map(a => a.id);
  const done = count(ids);
  const style = STATUS_STYLE[plan.status.level];

  async function downloadPdf() {
    if (busy) return;
    setBusy("pdf"); setStatus("");
    try {
      const { generateFreePdf } = await import("@/lib/pdf/free-pdf");
      const doc = await generateFreePdf(plan);
      doc.save("MiceGoneGuide-Mouse-Control-Plan.pdf");
      trackEvent("pdf_downloaded");
      setStatus("Your PDF was downloaded.");
    } catch {
      setStatus("The PDF couldn't be created. You can still use this page, or print it with your browser's print command.");
    } finally { setBusy(""); }
  }

  function addCalendar() {
    const ics = buildIcs(trapCheckDays(new Date(), 14), { calName: "Mouse trap checks", origin: SITE_ORIGIN });
    downloadText("MiceGoneGuide-trap-checks.ics", "text/calendar", ics);
    trackEvent("calendar_downloaded");
    setStatus("Calendar file downloaded: 14 daily trap-check reminders starting tomorrow.");
  }

  async function share() {
    const url = `${SITE_ORIGIN}/quiz`;
    try {
      if (navigator.share) await navigator.share({ title: "Mouse Control Planner", text: "A free, source-backed plan for a mouse problem.", url });
      else { await navigator.clipboard.writeText(url); setStatus("Planner link copied. Your answers aren't included."); }
    } catch { setStatus("Nothing was shared. You can copy the planner address from the quiz page."); }
  }

  if (!isComplete(answers)) return null;

  return (
    <PageShell>
      <header className="bg-hero hero-pattern text-primary-foreground">
        <div className="container-page py-10 md:py-14">
          <p className="eyebrow mb-3 !text-accent">Your personalised plan</p>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.1] md:text-5xl">Your mouse control plan</h1>
          <div className={`mt-6 max-w-3xl rounded-2xl border p-5 ${style.box}`}>
            <p className="mb-2 flex flex-wrap items-center gap-2"><span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${style.chip}`}><style.Icon className="h-3.5 w-3.5" aria-hidden="true" />{style.chipText}</span></p>
            <h2 className="font-display text-xl font-bold md:text-2xl">{plan.status.label}</h2>
            <p className="mt-1.5 text-primary-foreground/85">{plan.status.summary}</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="hero" size="lg" onClick={downloadPdf} disabled={busy === "pdf"}><FileDown className="h-4 w-4" aria-hidden="true" />{busy === "pdf" ? "Preparing PDF..." : "Download free plan PDF"}</Button>
            <Button variant="hero-outline" size="lg" onClick={addCalendar}><CalendarPlus className="h-4 w-4" aria-hidden="true" />Add trap-check reminders</Button>
            <Button variant="hero-outline" size="lg" onClick={share}><Share2 className="h-4 w-4" aria-hidden="true" />Share the planner</Button>
          </div>
          <p role="status" aria-live="polite" className="mt-4 min-h-5 text-sm text-primary-foreground/85">{status}</p>
        </div>
      </header>

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 space-y-10">
          <section aria-labelledby="start-here">
            <h2 id="start-here" className="mb-1 text-2xl font-bold md:text-3xl">Start here</h2>
            <p className="mb-5 text-muted-foreground">If you only do three things, do these first.</p>
            <ol className="grid gap-4 md:grid-cols-3">
              {plan.priorities.map((p, i) => (
                <li key={p.id} className={`card-soft relative p-5 ${p.tone === "safety" ? "border-destructive/40" : ""}`}>
                  <span className="absolute -top-3 left-5 flex h-7 w-7 items-center justify-center rounded-full bg-accent-gradient text-sm font-extrabold text-accent-foreground shadow">{i + 1}</span>
                  <h3 className="mt-2 font-display text-lg font-bold leading-snug">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{firstSentence(p.detail)}</p>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="your-plan">
            <h2 id="your-plan" className="sr-only">Plan details</h2>
            <Tabs defaultValue="actions">
              <div className="-mx-4 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0">
                <TabsList className="h-auto w-max justify-start gap-1 rounded-xl bg-secondary p-1.5">
                  {[["actions", "Action plan"], ["rooms", "Your rooms"], ["cleanup", "Safe cleanup"], ["seal", "Seal & prevent"], ["help", "When to call a pro"]].map(([v, label]) => (
                    <TabsTrigger key={v} value={v} className="rounded-lg px-4 py-2.5 text-sm font-semibold">{label}</TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <TabsContent value="actions" className="mt-6 space-y-8">
                {(["today", "week", "ongoing"] as Phase[]).map(phase => (
                  <div key={phase}>
                    <div className="mb-3 flex items-baseline justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold">{PHASE_META[phase].label}</h3>
                        <p className="text-sm text-muted-foreground">{PHASE_META[phase].blurb}</p>
                      </div>
                      <p className="text-sm font-semibold tabular-nums text-muted-foreground">{count(phases[phase].map(a => a.id))}/{phases[phase].length}</p>
                    </div>
                    <ul className="space-y-3">
                      {phases[phase].map(a => (
                        <CheckRow key={a.id} id={a.id} checked={Boolean(checked[a.id])} onToggle={toggle} title={a.title} source={a.source} learnMore={a.learnMore} tone={a.tone}>{a.detail}</CheckRow>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-secondary/40 p-4 text-sm">
                  <p className="text-muted-foreground">Ticks are saved on this device only.</p>
                  <button type="button" onClick={() => reset(ids)} className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"><RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />Reset progress</button>
                </div>
              </TabsContent>

              <TabsContent value="rooms" className="mt-6">
                {plan.rooms.length ? (
                  <ul className="grid gap-4 sm:grid-cols-2">
                    {plan.rooms.map(r => (
                      <li key={r.id} className="card-soft p-5"><h3 className="font-display text-lg font-bold">{r.title}</h3><p className="mt-2 text-sm leading-relaxed text-foreground/80">{r.prompt}</p></li>
                    ))}
                  </ul>
                ) : (
                  <Callout tone="info" title="No rooms selected">Pick the areas where you noticed signs and your plan will add room-specific inspection prompts. <Link to="/quiz" className="font-semibold text-primary underline">Edit your answers</Link>.</Callout>
                )}
                <p className="mt-5 text-sm text-muted-foreground">Pro adds a full protocol for each room: what to inspect, where to trap, what to store and what to watch for.</p>
              </TabsContent>

              <TabsContent value="cleanup" className="mt-6 space-y-5">
                <Callout tone="safety" title="Never sweep or vacuum rodent waste">Diseases mainly spread when people breathe in contaminated air. Always wet the material with disinfectant first.</Callout>
                <div className="card-soft p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-display text-xl font-bold">{CLEANUP_PROCEDURES[0].title}</h3><Sources ids={["cdc-clean"]} /></div>
                  <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed marker:font-bold marker:text-primary">{CLEANUP_PROCEDURES[0].steps.map(s => <li key={s}>{s}</li>)}</ol>
                </div>
                <Link to="/tools/cleanup-guide" className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">Full cleanup guide: nests, traps, fabrics, vehicles<ChevronRight className="h-4 w-4" aria-hidden="true" /></Link>
              </TabsContent>

              <TabsContent value="seal" className="mt-6 space-y-5">
                <div className="grid items-center gap-5 md:grid-cols-[1fr_1.2fr]">
                  <GapGauge className="w-full max-w-sm" />
                  <p className="leading-relaxed text-foreground/85">Mice can fit through a hole the width of a pencil, about 1/4 inch (6 mm). UC IPM adds they can squeeze under a gap 1/4 inch tall and through an opening 3/8 inch wide. Exclusion is the most successful and permanent form of house-mouse control, according to UC IPM.</p>
                </div>
                <ul className="space-y-2">
                  {MATERIALS.map(m => (
                    <li key={m.id} className="flex gap-3 rounded-xl border bg-card p-3.5 text-sm">
                      <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${m.verdict === "works" ? "bg-success/15 text-success" : m.verdict === "temporary" ? "bg-accent/25 text-[hsl(33_90%_26%)]" : "bg-destructive/10 text-destructive"}`}>{m.verdict === "works" ? "Works" : m.verdict === "temporary" ? "Temporary" : "Avoid"}</span>
                      <span><strong className="font-semibold">{m.use}.</strong> <span className="text-foreground/80">{m.note}</span></span>
                    </li>
                  ))}
                </ul>
                <Link to="/tools/entry-points" className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">Open the entry-gap checklist<ChevronRight className="h-4 w-4" aria-hidden="true" /></Link>
              </TabsContent>

              <TabsContent value="help" className="mt-6 space-y-5">
                {plan.hazards.length > 0 && (
                  <div className="space-y-3">{plan.hazards.map(h => <Callout key={h.id} tone="safety" title={h.title}>{h.detail}</Callout>)}</div>
                )}
                <div className="card-soft p-6">
                  <h3 className="font-display text-xl font-bold">Good reasons to call a professional</h3>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed">{plan.watchFor.map(w => <li key={w} className="flex gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" /><span>{w}</span></li>)}</ul>
                </div>
                <div className="card-soft p-6">
                  <h3 className="font-display text-xl font-bold">From the CDC</h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">{CLEANUP_PRO_HELP.map(t => <li key={t}>{t}</li>)}</ul>
                </div>
              </TabsContent>
            </Tabs>
          </section>

          <ProPromo />
          <EmailOptIn />

          <section className="rounded-2xl border bg-secondary/40 p-6" aria-labelledby="how-built">
            <h2 id="how-built" className="text-xl font-bold">How this plan was built</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Your answers are matched to fixed, reviewable rules: physical evidence is kept separate from uncertain signs, reported hazards trigger professional-help steps, rooms organise inspection prompts, and children or pets add trap-access precautions. No score, count or prediction is calculated. The same answers always give the same plan.</p>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">{SOURCES.map(s => <li key={s.id}><a className="font-semibold text-primary underline-offset-4 hover:underline" href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></li>)}</ul>
            <ScopeNote className="mt-4" />
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start" aria-label="Plan summary">
          <div className="card-soft flex items-center gap-4 p-5">
            <ProgressRing value={done} total={ids.length} size={64} label={`${done} of ${ids.length} steps done`} />
            <div><p className="font-display text-lg font-bold leading-tight">{done} of {ids.length} steps</p><p className="text-sm text-muted-foreground">Tick steps off as you go.</p></div>
          </div>
          <div className="card-soft p-5 text-sm">
            <p className="font-display text-lg font-bold">What you told us</p>
            {plan.observed.physical.length + plan.observed.uncertain.length === 0 ? (
              <p className="mt-2 text-muted-foreground">No signs selected yet.</p>
            ) : (
              <ul className="mt-2 list-disc space-y-1.5 pl-4 text-foreground/80">{[...plan.observed.physical, ...plan.observed.uncertain].map(o => <li key={o}>{o.split(". ")[0].replace(/\.$/, "")}</li>)}</ul>
            )}
            <Link to="/quiz" className="mt-4 inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"><Pencil className="h-3.5 w-3.5" aria-hidden="true" />Edit my answers</Link>
          </div>
          <div className="card-soft p-5 text-sm">
            <p className="font-display text-lg font-bold">Free tools</p>
            <ul className="mt-2 space-y-2">
              <li><Link className="font-medium text-primary hover:underline" to="/tools/trap-placement">Trap placement guide</Link></li>
              <li><Link className="font-medium text-primary hover:underline" to="/tools/entry-points">Entry-gap checklist</Link></li>
              <li><Link className="font-medium text-primary hover:underline" to="/tools/cleanup-guide">Safe cleanup guide</Link></li>
              <li><Link className="font-medium text-primary hover:underline" to="/tools/calculator">Signs & next steps</Link></li>
            </ul>
          </div>
          <Button variant="outline" className="w-full" onClick={downloadPdf} disabled={busy === "pdf"}><Download className="h-4 w-4" aria-hidden="true" />Download PDF</Button>
        </aside>
      </div>
    </PageShell>
  );
}
