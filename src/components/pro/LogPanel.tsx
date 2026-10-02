import { useMemo, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui-kit";
import { downloadText } from "@/lib/ics";
import { LOG_KINDS, logToCsv, quietDays, sanitizeLog, weeklyBuckets, type LogEntry, type LogKind } from "@/lib/evidence-log";
import { startOfDay, toDateKey } from "@/lib/schedule";
import { KEYS, useStored } from "@/lib/storage";
import { trackEvent } from "@/lib/analytics";
import type { WorkspaceCtx } from "./types";

const KIND_COLORS: Record<string, string> = { catch: "hsl(152 48% 28%)", droppings: "hsl(33 90% 48%)", gnawing: "hsl(2 68% 46%)", sighting: "hsl(210 50% 45%)" };

export default function LogPanel({ ctx }: { ctx: WorkspaceCtx }) {
  const [stored, setEntries] = useStored<LogEntry[]>(KEYS.log, []);
  const entries = useMemo(() => sanitizeLog(stored), [stored]);
  const [date, setDate] = useState(() => toDateKey(startOfDay(new Date())));
  const [kind, setKind] = useState<LogKind>("trap_check");
  const [location, setLocation] = useState("");
  const [count, setCount] = useState(1);
  const [note, setNote] = useState("");
  const meta = LOG_KINDS.find(k => k.id === kind)!;
  const buckets = useMemo(() => weeklyBuckets(entries, 6), [entries]);
  const max = Math.max(1, ...buckets.map(b => b.signals));
  const quiet = quietDays(entries);
  const grouped = useMemo(() => {
    const m = new Map<string, LogEntry[]>();
    [...entries].sort((a, b) => b.date.localeCompare(a.date)).forEach(e => m.set(e.date, [...(m.get(e.date) ?? []), e]));
    return [...m.entries()];
  }, [entries]);
  const rooms = ctx.plan.rooms.map(r => r.title);

  function add(e: React.FormEvent) {
    e.preventDefault();
    setEntries(prev => [...sanitizeLog(prev), { id: crypto.randomUUID(), date, kind, location: location.trim(), count: meta.countable ? Math.max(1, Math.round(count) || 1) : 1, note: note.trim() }]);
    setNote("");
  }
  function exportCsv() {
    downloadText("MiceGoneGuide-evidence-log.csv", "text/csv", logToCsv(entries));
    trackEvent("log_exported");
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <form onSubmit={add} className="card-soft space-y-4 p-5 md:p-6" aria-label="Add a log entry">
          <h3 className="font-display text-xl font-bold">Add an entry</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">Date<input type="date" required value={date} max={toDateKey(startOfDay(new Date()))} onChange={e => setDate(e.target.value)} className="mt-1.5 block h-10 w-full rounded-lg border bg-background px-3 text-sm" /></label>
            <label className="text-sm font-medium">What happened
              <select value={kind} onChange={e => setKind(e.target.value as LogKind)} className="mt-1.5 block h-10 w-full rounded-lg border bg-background px-3 text-sm">{LOG_KINDS.map(k => <option key={k.id} value={k.id}>{k.label}</option>)}</select>
            </label>
            <label className={`text-sm font-medium ${meta.countable ? "" : "sm:col-span-2"}`}>Where
              <input list="log-locations" value={location} maxLength={80} onChange={e => setLocation(e.target.value)} placeholder="e.g. Kitchen, behind the stove" className="mt-1.5 block h-10 w-full rounded-lg border bg-background px-3 text-sm" />
              <datalist id="log-locations">{rooms.map(r => <option key={r} value={r} />)}</datalist>
            </label>
            {meta.countable && <label className="text-sm font-medium">How many<input type="number" min={1} max={999} value={count} onChange={e => setCount(Number(e.target.value))} className="mt-1.5 block h-10 w-full rounded-lg border bg-background px-3 text-sm" /></label>}
          </div>
          <label className="block text-sm font-medium">Note (optional)<textarea value={note} maxLength={400} rows={2} onChange={e => setNote(e.target.value)} className="mt-1.5 block w-full rounded-lg border bg-background px-3 py-2 text-sm" /></label>
          <Button type="submit" variant="default" size="lg">Add to log</Button>
          <p className="text-xs text-muted-foreground">Saved on this device only. Export a CSV before clearing your browser data.</p>
        </form>

        <div className="space-y-4">
          <div className="card-soft p-5 md:p-6">
            <h3 className="font-display text-xl font-bold">Signs recorded per week</h3>
            <p className="text-sm text-muted-foreground">New catches, droppings, gnawing and sightings you logged. This shows what you recorded, not how many mice there are.</p>
            <svg viewBox="0 0 360 170" className="mt-4 h-auto w-full" role="img" aria-label={`Bar chart of signs recorded per week over the last six weeks: ${buckets.map(b => `week of ${b.label}: ${b.signals}`).join(", ")}`}>
              {[0.25, 0.5, 0.75, 1].map(f => <line key={f} x1="28" x2="352" y1={130 - f * 105} y2={130 - f * 105} stroke="hsl(42 22% 88%)" strokeWidth="1" />)}
              <text x="22" y="30" textAnchor="end" fontSize="10" fill="hsl(152 14% 33%)">{max}</text>
              <text x="22" y="132" textAnchor="end" fontSize="10" fill="hsl(152 14% 33%)">0</text>
              {buckets.map((b, i) => {
                const x = 40 + i * 52;
                let yBase = 130;
                return (
                  <g key={b.start}>
                    {Object.entries(b.byKind).map(([k, v]) => { const h = ((v ?? 0) / max) * 105; yBase -= h; return <rect key={k} x={x} y={yBase} width="34" height={Math.max(h, 0)} rx="3" fill={KIND_COLORS[k] ?? "hsl(152 48% 28%)"} />; })}
                    {b.signals === 0 && <rect x={x} y="127" width="34" height="3" rx="1.5" fill="hsl(42 22% 80%)" />}
                    <text x={x + 17} y="148" textAnchor="middle" fontSize="10" fill="hsl(152 14% 33%)">{b.label}</text>
                    <text x={x + 17} y="162" textAnchor="middle" fontSize="9" fill="hsl(152 14% 45%)">{i === buckets.length - 1 ? "this wk" : ""}</text>
                  </g>
                );
              })}
            </svg>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">{Object.entries(KIND_COLORS).map(([k, c]) => <li key={k} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: c }} />{LOG_KINDS.find(x => x.id === k)?.label}</li>)}</ul>
          </div>
          <div className="card-soft p-5">
            {quiet === null ? <p className="text-sm text-muted-foreground">No signs logged yet. When you record one, you'll see how many quiet days have passed since.</p> : (
              <p className="text-sm leading-relaxed"><strong className="font-display text-2xl">{quiet}</strong> day{quiet === 1 ? "" : "s"} since your last logged sign. {quiet >= 7 ? "That meets the CDC's check-in point of a week with no catches or new signs. Keep monitoring." : "The CDC says to keep trapping until nothing has been caught and no new signs appear for a week."}</p>
            )}
          </div>
        </div>
      </div>

      <section aria-labelledby="entries">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 id="entries" className="font-display text-xl font-bold">Your entries <span className="text-base font-normal text-muted-foreground">({entries.length})</span></h3>
          <Button type="button" variant="outline" size="sm" onClick={exportCsv} disabled={!entries.length}><Download className="h-4 w-4" aria-hidden="true" />Export CSV</Button>
        </div>
        {grouped.length === 0 ? <Callout tone="info">Entries you add appear here, newest first.</Callout> : (
          <div className="space-y-4">
            {grouped.map(([d, list]) => (
              <div key={d}>
                <p className="mb-2 text-sm font-bold text-muted-foreground">{new Date(`${d}T00:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
                <ul className="space-y-2">
                  {list.map(e => (
                    <li key={e.id} className="flex items-start justify-between gap-3 rounded-xl border bg-card p-3.5 text-sm">
                      <span><strong>{LOG_KINDS.find(k => k.id === e.kind)?.label}</strong>{LOG_KINDS.find(k => k.id === e.kind)?.countable && ` × ${e.count}`}{e.location && <span className="text-muted-foreground"> · {e.location}</span>}{e.note && <span className="mt-0.5 block text-foreground/75">{e.note}</span>}</span>
                      <button type="button" aria-label="Delete entry" onClick={() => setEntries(prev => sanitizeLog(prev).filter(x => x.id !== e.id))} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
