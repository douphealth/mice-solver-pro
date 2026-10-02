import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, CircleCheck, CircleHelp } from "lucide-react";
import PageShell from "@/components/layout/PageShell";
import ToolHeader from "@/components/ToolHeader";
import { Button } from "@/components/ui/button";
import { Callout, ScopeNote, SourceBadge } from "@/components/ui-kit";
import { SIGNS } from "@/lib/guides";

/** Route kept at /tools/calculator so existing links and the sitemap URL continue to work. */
export default function CalculatorPage() {
  const [id, setId] = useState(SIGNS[0].id);
  const sign = SIGNS.find(s => s.id === id) ?? SIGNS[0];
  const physical = SIGNS.filter(s => s.physical && !s.hazard);
  const uncertain = SIGNS.filter(s => !s.physical);
  const hazards = SIGNS.filter(s => s.hazard);

  const group = (label: string, hint: string, list: typeof SIGNS) => (
    <div>
      <p className="mb-1 text-sm font-bold">{label}</p>
      <p className="mb-2 text-xs text-muted-foreground">{hint}</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {list.map(s => (
          <button key={s.id} type="button" onClick={() => setId(s.id)} aria-pressed={id === s.id}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${id === s.id ? "border-primary bg-primary text-primary-foreground shadow" : s.hazard ? "border-destructive/40 bg-destructive/5 text-destructive hover:bg-destructive/10" : "bg-card hover:border-primary/50"}`}>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <PageShell>
      <ToolHeader crumb="Signs & next steps" title="What each sign means, and what to do next">
        Droppings, noises, odors and gnaw marks tell you different things. Pick what you found to see what it can and can't tell you, and the safest next step.
      </ToolHeader>

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[22rem_1fr]">
        <div className="space-y-6">
          {group("Physical evidence", "Things you can see or find.", physical)}
          {group("Uncertain signs", "Clues that need confirming.", uncertain)}
          {group("Safety hazards", "Not a DIY job.", hazards)}
        </div>

        <article className="card-soft p-6 md:p-8" aria-live="polite" aria-labelledby="sign-title">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="eyebrow mb-1">{sign.hazard ? "Safety hazard" : sign.physical ? "Physical evidence" : "Uncertain sign"}</p>
              <h2 id="sign-title" className="text-2xl font-bold md:text-3xl">{sign.label}</h2>
            </div>
            <SourceBadge id={sign.source} />
          </div>

          {sign.hazard && <Callout tone="safety" title="Qualified help recommended" className="mt-5">This isn't something to handle yourself. Keep people and pets away and follow the steps below.</Callout>}

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="rounded-xl bg-primary/5 p-5">
              <p className="mb-2 flex items-center gap-2 font-semibold"><CircleCheck className="h-4.5 w-4.5 text-success" aria-hidden="true" />What it can mean</p>
              <p className="text-sm leading-relaxed text-foreground/85">{sign.means}</p>
            </div>
            <div className="rounded-xl bg-secondary p-5">
              <p className="mb-2 flex items-center gap-2 font-semibold"><CircleHelp className="h-4.5 w-4.5 text-[hsl(33_90%_38%)]" aria-hidden="true" />What it can't tell you</p>
              <p className="text-sm leading-relaxed text-foreground/85">{sign.cannot}</p>
            </div>
          </div>

          <h3 className="mt-7 flex items-center gap-2 font-display text-xl font-bold">{sign.hazard && <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />}Safest next steps</h3>
          <ol className="mt-3 space-y-3">
            {sign.next.map((n, i) => (
              <li key={n} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{i + 1}</span><span className="pt-0.5 leading-relaxed">{n}</span></li>
            ))}
          </ol>

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t pt-6">
            <Button asChild variant="hero" size="lg"><Link to="/quiz">Turn this into my full plan<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></Button>
            <Link to="/tools/cleanup-guide" className="font-semibold text-primary hover:underline">Open the cleanup guide</Link>
          </div>
        </article>
      </div>

      <section className="container-read pb-14">
        <h2 className="text-2xl font-bold">Record evidence, not guesses</h2>
        <p className="mt-3 leading-relaxed text-foreground/85">More droppings don't translate into a reliable mouse count, and one sighting doesn't mean one mouse. After safe cleanup, note the date, location, newly appearing signs and trap checks. If signs keep appearing, that's a reason to inspect again and adjust your plan, not to estimate a number.</p>
        <ScopeNote className="mt-5" />
      </section>
    </PageShell>
  );
}
