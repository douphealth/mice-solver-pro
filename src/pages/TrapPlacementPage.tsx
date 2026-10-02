import { Link } from "react-router-dom";
import { ArrowRight, Ban, Ruler } from "lucide-react";
import PageShell from "@/components/layout/PageShell";
import ToolHeader from "@/components/ToolHeader";
import { Button } from "@/components/ui/button";
import { Callout, SourceBadge } from "@/components/ui-kit";
import { TrapDiagram } from "@/components/illustrations";
import { TRAP_AVOID, TRAP_STEPS } from "@/lib/guides";

export default function TrapPlacementPage() {
  return (
    <PageShell>
      <ToolHeader crumb="Trap placement guide" title="Where to place mouse traps, and how">
        Snap traps work best when they're in the right spots, baited lightly and checked every day. Here's what the CDC and UC IPM recommend.
      </ToolHeader>

      <div className="container-page py-10">
        <div className="card-soft p-4 md:p-6"><TrapDiagram className="mx-auto h-auto w-full max-w-3xl" /></div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
          <section aria-labelledby="steps" className="min-w-0">
            <h2 id="steps" className="mb-4 text-2xl font-bold md:text-3xl">Seven rules for effective trapping</h2>
            <ol className="space-y-4">
              {TRAP_STEPS.map((s, i) => (
                <li key={s.title} className="card-soft flex gap-4 p-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-lg font-bold leading-snug">{s.title}</h3><SourceBadge id={s.source} /></div>
                    <p className="mt-1.5 leading-relaxed text-foreground/85">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <h2 className="mb-4 mt-12 flex items-center gap-2 text-2xl font-bold"><Ban className="h-6 w-6 text-destructive" aria-hidden="true" />What to avoid</h2>
            <ul className="space-y-3">
              {TRAP_AVOID.map(a => (
                <li key={a.title} className="rounded-xl border border-destructive/25 bg-destructive/[0.04] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">{a.title}</h3><SourceBadge id={a.source} /></div>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground/85">{a.body}</p>
                </li>
              ))}
            </ul>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start" aria-label="Related">
            <Callout tone="safety" title="Keep traps out of reach">Always keep traps and bait away from children, pets and non-target animals. Poison baits are dangerous for people and animals and must be used exactly as the label says.</Callout>
            <div className="card-soft p-5">
              <p className="flex items-center gap-2 font-display text-lg font-bold"><Ruler className="h-5 w-5 text-primary" aria-hidden="true" />Plan your layout</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Pro turns your wall lengths into trap positions using UC IPM's spacing, and logs every check so you can see trends.</p>
              <Button asChild variant="default" size="sm" className="mt-3"><Link to="/pro">See Pro<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></Button>
            </div>
            <div className="card-soft p-5 text-sm">
              <p className="font-display text-lg font-bold">Next</p>
              <ul className="mt-2 space-y-2">
                <li><Link className="font-medium text-primary hover:underline" to="/tools/cleanup-guide">How to clean up safely</Link></li>
                <li><Link className="font-medium text-primary hover:underline" to="/tools/entry-points">Find and seal entry gaps</Link></li>
                <li><Link className="font-medium text-primary hover:underline" to="/quiz">Build my full plan</Link></li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}
