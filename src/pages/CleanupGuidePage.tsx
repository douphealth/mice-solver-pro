import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, ShieldAlert } from "lucide-react";
import PageShell from "@/components/layout/PageShell";
import ToolHeader from "@/components/ToolHeader";
import { Button } from "@/components/ui/button";
import { Callout, ProgressBar, SourceBadge } from "@/components/ui-kit";
import { CLEANUP_PREP, CLEANUP_PRO_HELP, CLEANUP_PROCEDURES } from "@/lib/guides";
import { useChecks } from "@/lib/storage";

export default function CleanupGuidePage() {
  const [active, setActive] = useState(CLEANUP_PROCEDURES[0].id);
  const { checked, toggle, count, reset } = useChecks();
  const proc = CLEANUP_PROCEDURES.find(p => p.id === active) ?? CLEANUP_PROCEDURES[0];
  const ids = proc.steps.map((_, i) => `cu-${proc.id}-${i}`);
  const done = count(ids);

  return (
    <PageShell>
      <ToolHeader crumb="Safe cleanup guide" title="How to clean up after mice, safely">
        The CDC's cleanup method in a step-by-step checklist. The one rule that matters most: never sweep or vacuum rodent waste.
      </ToolHeader>

      <div className="container-page py-10">
        <Callout tone="safety" title="Never vacuum or sweep rodent urine, droppings or nests">{CLEANUP_PREP.never}</Callout>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="card-soft p-6">
            <h2 className="font-display text-xl font-bold">1. Gather what you need</h2>
            <ul className="mt-3 space-y-3 text-sm leading-relaxed text-foreground/85">
              <li><strong>Disinfectant.</strong> {CLEANUP_PREP.disinfectant}</li>
              <li><strong>Protection.</strong> {CLEANUP_PREP.protection}</li>
              <li><strong>Also:</strong> paper towels, plastic bags and a covered garbage can that is emptied regularly.</li>
            </ul>
            <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-destructive"><ShieldAlert className="h-4 w-4" aria-hidden="true" />{CLEANUP_PREP.never_mix}</p>
          </div>
          <div className="card-soft p-6">
            <h2 className="font-display text-xl font-bold">When to stop and call for help</h2>
            <ul className="mt-3 list-disc space-y-2.5 pl-5 text-sm leading-relaxed text-foreground/85">{CLEANUP_PRO_HELP.map(t => <li key={t}>{t}</li>)}</ul>
            <div className="mt-3"><SourceBadge id="cdc-clean" /></div>
          </div>
        </div>

        <h2 className="mb-4 mt-12 text-2xl font-bold md:text-3xl">2. Choose what you're cleaning</h2>
        <div className="-mx-4 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0">
          <div className="flex w-max gap-2" role="tablist" aria-label="Cleanup type">
            {CLEANUP_PROCEDURES.map(p => (
              <button key={p.id} role="tab" type="button" aria-selected={active === p.id} onClick={() => setActive(p.id)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${active === p.id ? "border-primary bg-primary text-primary-foreground shadow" : "bg-card hover:border-primary/50"}`}>{p.title}</button>
            ))}
          </div>
        </div>

        <article className="card-soft mt-5 p-6 md:p-8" role="tabpanel" aria-labelledby="proc-title">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h3 id="proc-title" className="text-2xl font-bold">{proc.title}</h3><p className="mt-1 max-w-2xl text-muted-foreground">{proc.summary}</p></div>
            <SourceBadge id={proc.source} />
          </div>
          <div className="mt-5 flex items-center gap-4"><ProgressBar value={done} total={ids.length} className="flex-1" /><span className="text-sm font-semibold tabular-nums">{done}/{ids.length}</span></div>
          <ol className="mt-5 space-y-3">
            {proc.steps.map((step, i) => {
              const id = ids[i];
              const on = Boolean(checked[id]);
              return (
                <li key={id}>
                  <button type="button" role="checkbox" aria-checked={on} onClick={() => toggle(id)} className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${on ? "bg-secondary/60" : "bg-card hover:border-primary/40"}`}>
                    <span className="check-box mt-0.5" data-state={on ? "on" : "off"}>{on && <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />}</span>
                    <span className={`leading-relaxed ${on ? "text-muted-foreground line-through decoration-1" : ""}`}><span className="mr-2 font-bold text-primary">Step {i + 1}.</span>{step}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          <button type="button" onClick={() => reset(ids)} className="mt-4 text-sm font-semibold text-primary hover:underline">Reset these steps</button>
        </article>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-secondary/60 p-6">
          <div><p className="font-display text-xl font-bold">Cleaned up? Now stop it happening again.</p><p className="text-muted-foreground">Seal entry gaps and set traps along the walls.</p></div>
          <div className="flex flex-wrap gap-3"><Button asChild variant="default"><Link to="/tools/entry-points">Entry-gap checklist</Link></Button><Button asChild variant="hero"><Link to="/quiz">Build my plan<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></Button></div>
        </div>
      </div>
    </PageShell>
  );
}
