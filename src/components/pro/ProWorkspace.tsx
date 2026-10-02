import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarPlus, CheckCircle2, FileDown, Pencil, ShieldCheck, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Callout, CheckRow, ProgressRing, ScopeNote } from "@/components/ui-kit";
import { buildIcs, downloadText } from "@/lib/ics";
import { addDays, buildSchedule, currentDay, dayProgress, parseDateKey, startOfDay, toDateKey } from "@/lib/schedule";
import { generatePlan } from "@/lib/plan";
import { isComplete, loadAnswers } from "@/lib/answers";
import { KEYS, readJSON, useChecks, useStored } from "@/lib/storage";
import { sanitizeLog } from "@/lib/evidence-log";
import { trackEvent } from "@/lib/analytics";
import { SITE_ORIGIN } from "@/lib/sources";
import type { ProState } from "@/hooks/use-pro";
import SchedulePanel from "./SchedulePanel";
import RoomsPanel from "./RoomsPanel";
import TrapsPanel from "./TrapsPanel";
import LogPanel from "./LogPanel";
import { HelpPanel, PreventPanel, SealPanel, SuppliesPanel } from "./ReferencePanels";
import type { WorkspaceCtx } from "./types";

const TABS = [
  ["overview", "Overview"], ["schedule", "30-day plan"], ["rooms", "Rooms"], ["traps", "Traps"], ["seal", "Seal up"],
  ["log", "Evidence log"], ["supplies", "Supplies"], ["help", "Get help"], ["prevent", "Prevent"],
] as const;

export default function ProWorkspace({ pro }: { pro: ProState }) {
  const pack = pro.pack!;
  const answers = useMemo(() => loadAnswers(), []);
  const plan = useMemo(() => generatePlan(answers), [answers]);
  const [startKey, setStartKey] = useStored<string>(KEYS.start, toDateKey(startOfDay(new Date())));
  const start = parseDateKey(startKey) ?? startOfDay(new Date());
  const schedule = useMemo(() => buildSchedule(pack, plan, answers, start), [pack, plan, answers, start]);
  const ctx: WorkspaceCtx = { pack, plan, answers, start, schedule, setStartKey };
  const { checked, toggle } = useChecks();
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("overview");
  const [pdfBusy, setPdfBusy] = useState(false);
  const [note, setNote] = useState("");

  const progress = dayProgress(schedule, checked);
  const focus = schedule.find(d => d.day === currentDay(schedule, checked)) ?? schedule[0];
  const hasPlan = isComplete(answers);

  async function downloadPdf() {
    setPdfBusy(true); setNote("");
    try {
      const { generateProPdf } = await import("@/lib/pdf/pro-pdf");
      const doc = await generateProPdf({ plan, pack, schedule, log: sanitizeLog(readJSON(KEYS.log, [])), start });
      doc.save("MiceGoneGuide-Pro-Masterplan.pdf");
      trackEvent("pro_pdf_downloaded");
    } catch { setNote("The PDF couldn't be created. Your workspace is unaffected, so please try again."); }
    finally { setPdfBusy(false); }
  }
  function calendar() {
    downloadText("MiceGoneGuide-30-day-plan.ics", "text/calendar", buildIcs(schedule, { calName: "Mouse control: 30-day plan", origin: `${SITE_ORIGIN}/pro` }));
    trackEvent("calendar_downloaded");
  }

  return (
    <>
      <header className="bg-hero hero-pattern text-primary-foreground">
        <div className="container-page py-10 md:py-12">
          <p className="eyebrow mb-3 flex flex-wrap items-center gap-3 !text-accent"><span>Pro Masterplan</span><span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/10 px-3 py-1 text-xs normal-case tracking-normal text-primary-foreground"><ShieldCheck className="h-3.5 w-3.5 text-accent" aria-hidden="true" />Purchase verified{pro.entitlement?.email ? ` · ${pro.entitlement.email}` : ""}</span></p>
          <h1 className="text-3xl font-extrabold md:text-5xl">Your Pro workspace</h1>
          <p className="mt-3 max-w-2xl text-lg text-primary-foreground/85">A dated 30-day plan, room protocols, trap layout and an evidence log, all in one place.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="hero" size="lg" onClick={downloadPdf} disabled={pdfBusy}><FileDown className="h-4 w-4" aria-hidden="true" />{pdfBusy ? "Preparing PDF..." : "Download Pro PDF"}</Button>
            <Button variant="hero-outline" size="lg" onClick={calendar}><CalendarPlus className="h-4 w-4" aria-hidden="true" />Add plan to calendar</Button>
          </div>
          <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm text-primary-foreground/85">{note}</p>
        </div>
      </header>

      {pro.offline && (
        <div className="border-b bg-accent/20"><div className="container-page flex flex-wrap items-center gap-3 py-3 text-sm"><WifiOff className="h-4 w-4" aria-hidden="true" /><span>We couldn't reach the server, so this is the copy saved on your device{pro.lastVerified ? ` (verified ${new Date(pro.lastVerified).toLocaleDateString()})` : ""}.</span><button type="button" onClick={() => void pro.refresh()} className="font-semibold underline">Check again</button></div></div>
      )}

      <div className="container-page py-8">
        {!hasPlan && (
          <Callout tone="note" title="Personalise your workspace" className="mb-6">Answer the seven quick questions so your schedule and rooms match your home. Everything below works either way. <Link to="/quiz" className="font-semibold text-primary underline">Build my plan</Link></Callout>
        )}
        <Tabs value={tab} onValueChange={v => setTab(v as typeof tab)}>
          <div className="-mx-4 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0">
            <TabsList className="h-auto w-max justify-start gap-1 rounded-xl bg-secondary p-1.5">
              {TABS.map(([v, label]) => <TabsTrigger key={v} value={v} className="rounded-lg px-4 py-2.5 text-sm font-semibold">{label}</TabsTrigger>)}
            </TabsList>
          </div>

          <TabsContent value="overview" className="mt-6 space-y-8">
            <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
              <section className="card-soft p-6" aria-labelledby="focus-title">
                <p className="eyebrow mb-1">Up next</p>
                {focus ? (
                  <>
                    <h2 id="focus-title" className="font-display text-2xl font-bold">Day {focus.day}: {focus.title}</h2>
                    <p className="text-sm text-muted-foreground">{focus.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} · {focus.focus}</p>
                    <ul className="mt-4 space-y-2.5">{focus.tasks.map(t => <CheckRow key={t.id} id={t.id} checked={Boolean(checked[t.id])} onToggle={toggle} title={t.text} source={t.source} />)}</ul>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => setTab("schedule")}>Open the full schedule</Button>
                  </>
                ) : <h2 id="focus-title" className="font-display text-2xl font-bold">No schedule yet</h2>}
              </section>
              <div className="space-y-5">
                <div className="card-soft flex items-center gap-4 p-5"><ProgressRing value={progress.done} total={progress.total} size={72} label={`${progress.done} of ${progress.total} tasks done`} /><div><p className="font-display text-xl font-bold">{progress.done} of {progress.total}</p><p className="text-sm text-muted-foreground">30-day tasks done</p></div></div>
                <div className="card-soft p-5 text-sm">
                  <p className="font-display text-lg font-bold">Your start date</p>
                  <p className="mt-1 text-muted-foreground">Starts {start.toLocaleDateString("en-US", { month: "long", day: "numeric" })}, ends {addDays(start, 30).toLocaleDateString("en-US", { month: "long", day: "numeric" })}. Change it any time. Your ticks are kept.</p>
                  <input type="date" aria-label="Plan start date" value={toDateKey(start)} onChange={e => e.target.value && setStartKey(e.target.value)} className="mt-3 h-10 rounded-lg border bg-background px-3 text-sm" />
                </div>
                <div className="card-soft p-5 text-sm">
                  <p className="font-display text-lg font-bold">Your plan snapshot</p>
                  <p className="mt-1 font-semibold">{plan.status.label}</p>
                  {hasPlan ? <Link to="/plan" className="mt-2 inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"><CheckCircle2 className="h-4 w-4" aria-hidden="true" />Open my free plan</Link> : null}
                  <Link to="/quiz" className="mt-2 flex items-center gap-1.5 font-semibold text-primary hover:underline"><Pencil className="h-3.5 w-3.5" aria-hidden="true" />{hasPlan ? "Edit my answers" : "Take the quiz"}</Link>
                </div>
              </div>
            </div>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Jump to a tool">
              {TABS.slice(1, 5).map(([v, label]) => (
                <button key={v} type="button" onClick={() => setTab(v)} className="card-soft card-lift p-5 text-left"><span className="font-display text-lg font-bold">{label}</span><span className="mt-1 block text-sm text-muted-foreground">{{ schedule: "Dated tasks, one day at a time.", rooms: "Protocols for every room.", traps: "Spacing and layout helper.", seal: "Materials that work." }[v as string]}</span></button>
              ))}
            </section>
            <div className="rounded-2xl border bg-secondary/40 p-5 text-sm text-muted-foreground"><p>Access: {pro.entitlement?.purchasedAt ? `purchased ${new Date(pro.entitlement.purchasedAt).toLocaleDateString()}. ` : ""}Your access link was emailed after purchase. If you ever lose it, <Link to="/restore" className="font-semibold text-primary underline">restore your purchase</Link>. Questions: admin@micegoneguide.com.</p><ScopeNote className="mt-3" /></div>
          </TabsContent>

          <TabsContent value="schedule" className="mt-6"><SchedulePanel ctx={ctx} /></TabsContent>
          <TabsContent value="rooms" className="mt-6"><RoomsPanel ctx={ctx} /></TabsContent>
          <TabsContent value="traps" className="mt-6"><TrapsPanel ctx={ctx} /></TabsContent>
          <TabsContent value="seal" className="mt-6"><SealPanel ctx={ctx} /></TabsContent>
          <TabsContent value="log" className="mt-6"><LogPanel ctx={ctx} /></TabsContent>
          <TabsContent value="supplies" className="mt-6"><SuppliesPanel ctx={ctx} /></TabsContent>
          <TabsContent value="help" className="mt-6"><HelpPanel ctx={ctx} /></TabsContent>
          <TabsContent value="prevent" className="mt-6"><PreventPanel ctx={ctx} /></TabsContent>
        </Tabs>
      </div>
    </>
  );
}
