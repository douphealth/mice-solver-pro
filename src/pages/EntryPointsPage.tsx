import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, Home, Tent, Truck } from "lucide-react";
import PageShell from "@/components/layout/PageShell";
import ToolHeader from "@/components/ToolHeader";
import { Button } from "@/components/ui/button";
import { Callout, CheckRow, ProgressBar, SourceBadge, SectionHeading } from "@/components/ui-kit";
import { GapGauge } from "@/components/illustrations";
import { GAP_PLACES, MATERIALS } from "@/lib/guides";
import { useChecks, useStored } from "@/lib/storage";

const HOMES = [
  { id: "detached", label: "Detached house", icon: Home, note: "Check the full perimeter, roofline and foundation line, plus any garage, shed or outbuilding." },
  { id: "apartment", label: "Apartment or condo", icon: Building2, note: "Coordinate shared-wall and common-area inspection with the owner or building manager. Don't alter shared building services yourself. The CDC also suggests contacting your local or state health department with questions." },
  { id: "mobile", label: "Manufactured home", icon: Truck, note: "The CDC specifically lists fixing gaps in trailer skirting and using flashing around the base of the home." },
  { id: "cabin", label: "Cabin or outbuilding", icon: Tent, note: "Seal outbuildings and garages as well. Ventilate a closed building for 30 minutes before cleaning, as the CDC advises." },
];

const verdictStyle = { works: "bg-success/15 text-success", temporary: "bg-accent/25 text-[hsl(33_90%_26%)]", avoid: "bg-destructive/10 text-destructive" } as const;
const verdictLabel = { works: "Works", temporary: "Temporary", avoid: "Avoid" } as const;

export default function EntryPointsPage() {
  const [home, setHome] = useStored<string>("mgg.entry.home.v1", "detached");
  const { checked, toggle, count, reset } = useChecks();
  const [tab, setTab] = useState<"inside" | "outside">("inside");
  const lists = useMemo(() => ({
    inside: GAP_PLACES.inside.map((text, i) => ({ id: `gap-in-${i}`, text })),
    outside: GAP_PLACES.outside.map((text, i) => ({ id: `gap-out-${i}`, text })),
  }), []);
  const all = [...lists.inside, ...lists.outside];
  const done = count(all.map(x => x.id));
  const current = HOMES.find(h => h.id === home) ?? HOMES[0];

  return (
    <PageShell>
      <ToolHeader crumb="Entry-gap checklist" title="Find every gap a mouse could use">
        Exclusion is the most successful and permanent form of house-mouse control, according to UC IPM. Work through where to look, tick each area as you check it and seal what you find.
      </ToolHeader>

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-8">
          <section aria-labelledby="home-type">
            <h2 id="home-type" className="mb-3 text-xl font-bold">1. Your property</h2>
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Property type">
              {HOMES.map(h => (
                <label key={h.id} className={`relative flex cursor-pointer items-center gap-3 rounded-xl border bg-card p-4 transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring ${home === h.id ? "border-primary bg-primary/[0.06] ring-1 ring-primary" : "hover:border-primary/40"}`}>
                  <input type="radio" className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" name="property" value={h.id} checked={home === h.id} onChange={() => setHome(h.id)} />
                  <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${home === h.id ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"}`}><h.icon className="h-5 w-5" aria-hidden="true" /></span>
                  <span className="font-semibold">{h.label}</span>
                </label>
              ))}
            </div>
            <Callout tone="info" className="mt-4" title={current.label}>{current.note}</Callout>
          </section>

          <section aria-labelledby="where">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 id="where" className="text-xl font-bold">2. Where to look</h2>
              <div className="inline-flex rounded-xl bg-secondary p-1" role="tablist" aria-label="Inside or outside">
                {(["inside", "outside"] as const).map(t => (
                  <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`rounded-lg px-5 py-2 text-sm font-semibold capitalize transition-colors ${tab === t ? "bg-card text-primary shadow" : "text-muted-foreground"}`}>{t}</button>
                ))}
              </div>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">Inspect only areas you can reach safely. These are places to inspect, not confirmed entry routes. <SourceBadge id="cdc-seal" /></p>
            <div role="tabpanel" aria-label={`${tab} areas`}>
              <ul className="space-y-2.5">
                {lists[tab].map(item => <CheckRow key={item.id} id={item.id} checked={Boolean(checked[item.id])} onToggle={toggle} title={item.text} />)}
              </ul>
            </div>
          </section>

          <section aria-labelledby="seal">
            <h2 id="seal" className="mb-3 text-xl font-bold">3. Seal with materials mice can't chew</h2>
            <ul className="space-y-2.5">
              {MATERIALS.map(m => (
                <li key={m.id} className="flex gap-3 rounded-xl border bg-card p-4">
                  <span className={`mt-0.5 h-fit shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${verdictStyle[m.verdict]}`}>{verdictLabel[m.verdict]}</span>
                  <div className="min-w-0 flex-1"><p className="font-semibold">{m.use}</p><p className="mt-1 text-sm leading-relaxed text-foreground/80">{m.note}</p></div>
                  <SourceBadge id={m.source} />
                </li>
              ))}
            </ul>
            <Callout tone="safety" className="mt-4" title="Safety notes">
              Never block ventilation or drainage, never add a lint-catching screen to dryer exhaust, and keep conductive packing away from wiring. Ask a qualified tradesperson about utilities, flues and fire-rated construction. Contamination inside heating or cooling ducts needs a professional.
            </Callout>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start" aria-label="Checklist summary">
          <div className="card-soft p-5">
            <p className="font-display text-lg font-bold">{done} of {all.length} areas checked</p>
            <ProgressBar value={done} total={all.length} className="mt-3" />
            <button type="button" onClick={() => reset(all.map(x => x.id))} className="mt-3 text-sm font-semibold text-primary hover:underline">Reset checklist</button>
            <p className="mt-2 text-xs text-muted-foreground">Saved on this device only.</p>
          </div>
          <div className="card-soft p-5">
            <p className="mb-3 font-display text-lg font-bold">How big is too big?</p>
            <GapGauge className="w-full" />
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Mice can fit through a hole the width of a pencil (the CDC's yardstick). UC IPM adds they can squeeze under a gap 1/4 inch tall and through an opening 3/8 inch wide.</p>
          </div>
          <div className="card-soft bg-secondary/50 p-5 text-sm">
            <p className="font-display text-lg font-bold">Want the full sealing plan?</p>
            <p className="mt-1 text-muted-foreground">Pro adds a dated sealing schedule, a materials guide and a supply checklist.</p>
            <Button asChild variant="default" size="sm" className="mt-3"><Link to="/pro">See Pro<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></Button>
          </div>
        </aside>
      </div>

      <section className="bg-secondary/50 py-10">
        <div className="container-read text-center">
          <SectionHeading title="Then put it all in one plan" align="center">Your free plan combines sealing, trapping, cleanup and food control in the right order for your home.</SectionHeading>
          <Button asChild variant="hero" size="lg"><Link to="/quiz">Build my free plan<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></Button>
        </div>
      </section>
    </PageShell>
  );
}
