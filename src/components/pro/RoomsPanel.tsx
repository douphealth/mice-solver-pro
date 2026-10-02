import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Callout, Sources } from "@/components/ui-kit";
import type { ProRoom } from "@/lib/pro-types";
import type { WorkspaceCtx } from "./types";

const SECTIONS: { key: keyof Pick<ProRoom, "inspect" | "trapping" | "keep" | "safety">; label: string }[] = [
  { key: "inspect", label: "Inspect" }, { key: "trapping", label: "Trap" }, { key: "keep", label: "Keep clear" }, { key: "safety", label: "Stay safe" },
];

export default function RoomsPanel({ ctx }: { ctx: WorkspaceCtx }) {
  const { pack, plan } = ctx;
  const selected = plan.rooms.map(r => pack.rooms[r.id]).filter(Boolean);
  const others = Object.values(pack.rooms).filter(r => !selected.some(s => s.id === r.id));
  const card = (r: ProRoom) => (
    <AccordionItem key={r.id} value={r.id} className="overflow-hidden rounded-xl border bg-card">
      <AccordionTrigger className="px-5 py-4 text-left font-display text-lg font-bold hover:no-underline">{r.title}</AccordionTrigger>
      <AccordionContent className="px-5 pb-5">
        <div className="grid gap-5 sm:grid-cols-2">
          {SECTIONS.map(s => (
            <div key={s.key} className={s.key === "safety" ? "rounded-xl bg-destructive/[0.05] p-4" : "rounded-xl bg-secondary/50 p-4"}>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">{s.label}</p>
              <ul className="list-disc space-y-1.5 pl-4 text-sm leading-relaxed">{r[s.key].map(t => <li key={t}>{t}</li>)}</ul>
            </div>
          ))}
        </div>
        <div className="mt-4"><Sources ids={r.sources} /></div>
      </AccordionContent>
    </AccordionItem>
  );
  return (
    <div className="space-y-8">
      {selected.length ? (
        <section aria-labelledby="your-rooms">
          <h3 id="your-rooms" className="mb-3 font-display text-xl font-bold">Your rooms</h3>
          <Accordion type="multiple" defaultValue={selected.slice(0, 1).map(r => r.id)} className="space-y-3">{selected.map(card)}</Accordion>
        </section>
      ) : (
        <Callout tone="info" title="No rooms selected">Choose rooms in the quiz and they'll appear here first. Every protocol is below.</Callout>
      )}
      <section aria-labelledby="other-rooms">
        <h3 id="other-rooms" className="mb-3 font-display text-xl font-bold">{selected.length ? "Other areas" : "All areas"}</h3>
        <Accordion type="multiple" className="space-y-3">{others.map(card)}</Accordion>
      </section>
    </div>
  );
}
