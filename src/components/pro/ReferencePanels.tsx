import { ExternalLink, Phone } from "lucide-react";
import { Callout, CheckRow, ProgressBar, Sources } from "@/components/ui-kit";
import { GapGauge } from "@/components/illustrations";
import { AFFILIATE_DISCLOSURE, amazonSearchUrl } from "@/lib/affiliate";
import { GAP_PLACES } from "@/lib/guides";
import { useChecks } from "@/lib/storage";
import type { WorkspaceCtx } from "./types";

export function SealPanel({ ctx }: { ctx: WorkspaceCtx }) {
  const { pack } = ctx;
  return (
    <div className="space-y-8">
      <div className="grid items-center gap-5 md:grid-cols-[1fr_1.2fr]">
        <GapGauge className="w-full max-w-sm" />
        <div className="space-y-2 leading-relaxed">
          <p>Seal anything about <strong>1/4 inch (6 mm)</strong> or larger. UC IPM adds that mice can squeeze under a gap 1/4 inch tall and through an opening 3/8 inch wide.</p>
          <p className="text-sm text-muted-foreground">Exclusion is the most successful and permanent form of house-mouse control, according to UC IPM. Keep trapping while you seal.</p>
        </div>
      </div>
      <div className="overflow-x-auto rounded-2xl border bg-card" tabIndex={0} role="region" aria-label="Sealing materials table, scrollable">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <caption className="sr-only">Sealing materials by location</caption>
          <thead className="bg-secondary/60"><tr>{["Where", "Use", "Watch out for", "Avoid"].map(h => <th key={h} scope="col" className="p-3.5 font-semibold">{h}</th>)}</tr></thead>
          <tbody>
            {pack.materials.map(m => (
              <tr key={m.id} className="border-t align-top">
                <th scope="row" className="p-3.5 font-semibold">{m.where}<div className="mt-1.5"><Sources ids={m.sources} /></div></th>
                <td className="p-3.5 leading-relaxed">{m.use}</td>
                <td className="p-3.5 leading-relaxed text-foreground/80">{m.caution}</td>
                <td className="p-3.5 leading-relaxed text-destructive/90">{m.avoid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="card-soft p-5"><h3 className="font-display text-lg font-bold">Inside: where to look</h3><ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">{GAP_PLACES.inside.map(p => <li key={p}>{p}</li>)}</ul></div>
        <div className="card-soft p-5"><h3 className="font-display text-lg font-bold">Outside: where to look</h3><ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">{GAP_PLACES.outside.map(p => <li key={p}>{p}</li>)}</ul></div>
      </div>
    </div>
  );
}

export function SuppliesPanel({ ctx }: { ctx: WorkspaceCtx }) {
  const { pack } = ctx;
  const { checked, toggle, count } = useChecks();
  const ids = pack.supplies.map(s => `sup-${s.id}`);
  const done = count(ids);
  return (
    <div className="space-y-6">
      <Callout tone="note" title="Affiliate disclosure">{AFFILIATE_DISCLOSURE}</Callout>
      <div className="flex items-center gap-4"><ProgressBar value={done} total={ids.length} className="flex-1" /><span className="text-sm font-semibold tabular-nums">{done}/{ids.length} ready</span></div>
      {[true, false].map(essential => (
        <section key={String(essential)} aria-label={essential ? "Essentials" : "Helpful extras"}>
          <h3 className="mb-3 font-display text-xl font-bold">{essential ? "Essentials" : "Helpful extras"}</h3>
          <ul className="space-y-3">
            {pack.supplies.filter(s => s.essential === essential).map(s => (
              <CheckRow key={s.id} id={`sup-${s.id}`} checked={Boolean(checked[`sup-${s.id}`])} onToggle={toggle} title={s.name} meta={<span className="text-xs font-semibold text-muted-foreground">Got it</span>}>
                <p>{s.why}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-primary">What to look for</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">{s.criteria.map(c => <li key={c}>{c}</li>)}</ul>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <a href={amazonSearchUrl(s.query)} target="_blank" rel="sponsored noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-sm font-semibold text-primary hover:bg-secondary">Search on Amazon<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>
                  <Sources ids={s.sources} />
                </div>
              </CheckRow>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function HelpPanel({ ctx }: { ctx: WorkspaceCtx }) {
  const { pack, plan } = ctx;
  const { checked, toggle } = useChecks();
  const list = (title: string, items: string[], prefix: string) => (
    <section className="card-soft p-5 md:p-6" aria-label={title}>
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <ul className="mt-3 space-y-2.5">{items.map((t, i) => <CheckRow key={t} id={`${prefix}-${i}`} checked={Boolean(checked[`${prefix}-${i}`])} onToggle={toggle} title={t} />)}</ul>
    </section>
  );
  return (
    <div className="space-y-6">
      <Callout tone="info" title="When to call a professional"><ul className="list-disc space-y-1 pl-4">{plan.watchFor.map(w => <li key={w}>{w}</li>)}</ul></Callout>
      {plan.hazards.map(h => <Callout key={h.id} tone="safety" title={h.title}>{h.detail}</Callout>)}
      <div className="grid gap-6 lg:grid-cols-2">
        {list("Before you call, gather", pack.escalation.before, "esc-before")}
        {list("Questions to ask a provider", pack.escalation.ask, "esc-ask")}
      </div>
      <section className="card-soft p-5 md:p-6"><h3 className="flex items-center gap-2 font-display text-lg font-bold"><Phone className="h-5 w-5 text-primary" aria-hidden="true" />After the visit</h3><ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">{pack.escalation.document.map(d => <li key={d}>{d}</li>)}</ul></section>
    </div>
  );
}

export function PreventPanel({ ctx }: { ctx: WorkspaceCtx }) {
  const { checked, toggle } = useChecks();
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {ctx.pack.seasons.map(s => (
        <section key={s.id} className="card-soft p-5 md:p-6" aria-labelledby={`season-${s.id}`}>
          <h3 id={`season-${s.id}`} className="font-display text-xl font-bold">{s.title}</h3>
          <p className="text-sm text-muted-foreground">{s.when}</p>
          <ul className="mt-4 space-y-2.5">{s.tasks.map(t => <CheckRow key={t.id} id={t.id} checked={Boolean(checked[t.id])} onToggle={toggle} title={t.text} source={t.source} />)}</ul>
        </section>
      ))}
    </div>
  );
}
