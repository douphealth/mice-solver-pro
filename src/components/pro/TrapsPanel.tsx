import { useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Callout, Sources } from "@/components/ui-kit";
import { TrapDiagram } from "@/components/illustrations";
import { layoutRuns, sanitizeRuns, totalTraps, type WallRun } from "@/lib/trap-layout";
import { useStored } from "@/lib/storage";
import type { WorkspaceCtx } from "./types";

const TRAP_KEY = "mgg.traps.v1";

export default function TrapsPanel({ ctx }: { ctx: WorkspaceCtx }) {
  const { pack, plan } = ctx;
  const [runs, setRuns] = useStored<WallRun[]>(TRAP_KEY, []);
  const [pairs, setPairs] = useStored<boolean>("mgg.traps.pairs.v1", false);
  const layout = useMemo(() => layoutRuns(sanitizeRuns(runs), pack.trap.maxSpacingFt), [runs, pack.trap.maxSpacingFt]);
  const total = totalTraps(layout, pairs);

  const update = (id: string, patch: Partial<WallRun>) => setRuns(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));
  const add = () => setRuns(prev => [...prev, { id: crypto.randomUUID(), label: plan.rooms[prev.length % Math.max(1, plan.rooms.length)]?.title ?? "", feet: 0 }].slice(0, 20));

  return (
    <div className="space-y-8">
      <section className="card-soft p-5 md:p-7" aria-labelledby="layout-title">
        <h3 id="layout-title" className="font-display text-xl font-bold">Trap layout helper</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Measure each wall where you found signs. UC IPM says to space traps no more than about {pack.trap.maxSpacingFt} feet apart where mice are active. This helper turns that rule into positions along each wall.</p>

        <div className="mt-5 space-y-3">
          {runs.length === 0 && <p className="rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">No walls yet. Add the first wall where you found droppings, gnawing or tracks.</p>}
          {runs.map(r => (
            <div key={r.id} className="grid gap-3 rounded-xl border bg-card p-3 sm:grid-cols-[1fr_9rem_auto] sm:items-end">
              <label className="text-sm font-medium">Wall or area<input className="mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm" value={r.label} maxLength={60} placeholder="e.g. Kitchen, behind the fridge" onChange={e => update(r.id, { label: e.target.value })} /></label>
              <label className="text-sm font-medium">Length (feet)<input className="mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm" type="number" min={0} max={500} step={0.5} inputMode="decimal" value={r.feet || ""} onChange={e => update(r.id, { feet: Number(e.target.value) })} /></label>
              <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${r.label || "wall"}`} onClick={() => setRuns(prev => prev.filter(x => x.id !== r.id))}><Trash2 className="h-4 w-4" aria-hidden="true" /></Button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <Button type="button" variant="outline" onClick={add}><Plus className="h-4 w-4" aria-hidden="true" />Add a wall</Button>
          <label className="flex items-center gap-2.5 text-sm font-medium"><input type="checkbox" className="h-4 w-4 accent-[hsl(152_48%_21%)]" checked={pairs} onChange={e => setPairs(e.target.checked)} />Use pairs {pack.trap.pairGapIn} inches apart</label>
        </div>

        {layout.length > 0 && (
          <div className="mt-6 rounded-2xl bg-primary p-5 text-primary-foreground" role="status" aria-live="polite">
            <p className="font-display text-3xl font-extrabold">{total} trap{total === 1 ? "" : "s"}</p>
            <p className="text-sm text-primary-foreground/80">across {layout.reduce((n, r) => n + r.positions.length, 0)} position{layout.reduce((n, r) => n + r.positions.length, 0) === 1 ? "" : "s"}{pairs ? ", two per position" : ""}</p>
            <ul className="mt-4 space-y-2 text-sm">{layout.map(l => <li key={l.id}><strong>{l.label}</strong> ({l.feet} ft): at {l.positions.map(p => `${p} ft`).join(", ")} along the wall</li>)}</ul>
          </div>
        )}
        <Callout tone="note" className="mt-5" title="What this is, and isn't">It applies a spacing rule along walls. It is not an estimate of how many mice you have. Add or move traps based on where you find signs and catches.</Callout>
      </section>

      <div className="card-soft p-4 md:p-6"><TrapDiagram className="mx-auto h-auto w-full max-w-2xl" /></div>

      <section className="grid gap-6 md:grid-cols-2" aria-label="Baits and routine">
        <div className="card-soft p-5">
          <h3 className="font-display text-lg font-bold">Baits to try</h3>
          <ul className="mt-3 space-y-3 text-sm">{pack.trap.baits.map(b => <li key={b.name}><strong>{b.name}.</strong> <span className="text-foreground/80">{b.note}</span></li>)}</ul>
          <p className="mt-3 text-xs text-muted-foreground">Use only a small amount on the trigger. If you change bait, change one thing at a time so you can see what works.</p>
        </div>
        <div className="card-soft p-5">
          <h3 className="font-display text-lg font-bold">Every-day routine</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm marker:font-bold marker:text-primary">{pack.trap.rules.map(r => <li key={r}>{r}</li>)}</ol>
          <div className="mt-3"><Sources ids={pack.trap.sources} /></div>
        </div>
      </section>

      <Callout tone="safety" title="Don't use">
        <ul className="list-disc space-y-1 pl-4">{pack.trap.avoid.map(a => <li key={a}>{a}</li>)}</ul>
      </Callout>
    </div>
  );
}
