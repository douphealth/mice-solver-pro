import { useMemo } from "react";
import { CalendarPlus, CalendarDays } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CheckRow, ProgressBar } from "@/components/ui-kit";
import { buildIcs, downloadText } from "@/lib/ics";
import { currentDay, dayProgress, startOfDay, toDateKey } from "@/lib/schedule";
import { useChecks } from "@/lib/storage";
import { trackEvent } from "@/lib/analytics";
import { SITE_ORIGIN } from "@/lib/sources";
import type { WorkspaceCtx } from "./types";

const fmt = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

export default function SchedulePanel({ ctx }: { ctx: WorkspaceCtx }) {
  const { schedule, start, setStartKey } = ctx;
  const { checked, toggle } = useChecks();
  const todayKey = toDateKey(startOfDay(new Date()));
  const progress = dayProgress(schedule, checked);
  const focusDay = currentDay(schedule, checked);
  const weeks = useMemo(() => {
    const groups = new Map<number, typeof schedule>();
    for (const d of schedule) groups.set(Math.floor(d.day / 7), [...(groups.get(Math.floor(d.day / 7)) ?? []), d]);
    return [...groups.entries()];
  }, [schedule]);

  function exportCalendar() {
    downloadText("MiceGoneGuide-30-day-plan.ics", "text/calendar", buildIcs(schedule, { calName: "Mouse control: 30-day plan", origin: `${SITE_ORIGIN}/pro` }));
    trackEvent("calendar_downloaded");
  }

  return (
    <div className="space-y-6">
      <div className="card-soft flex flex-wrap items-end justify-between gap-5 p-5">
        <div className="min-w-0 flex-1">
          <p className="font-display text-xl font-bold">{progress.done} of {progress.total} tasks done</p>
          <ProgressBar value={progress.done} total={progress.total} className="mt-3" />
        </div>
        <label className="text-sm font-medium">Plan starts
          <input type="date" value={toDateKey(start)} onChange={e => e.target.value && setStartKey(e.target.value)} className="mt-1.5 block h-10 rounded-lg border bg-background px-3 text-sm" />
        </label>
        <Button type="button" variant="default" onClick={exportCalendar}><CalendarPlus className="h-4 w-4" aria-hidden="true" />Add all to my calendar</Button>
      </div>

      {weeks.map(([week, days]) => (
        <section key={week} aria-labelledby={`week-${week}`}>
          <h3 id={`week-${week}`} className="mb-3 flex items-center gap-2 font-display text-xl font-bold"><CalendarDays className="h-5 w-5 text-primary" aria-hidden="true" />{week === 4 ? "Days 28 to 30" : `Week ${week + 1}`}</h3>
          <Accordion type="multiple" defaultValue={[`d${focusDay}`]} className="space-y-3">
            {days.map(d => {
              const done = d.tasks.filter(t => checked[t.id]).length;
              const isToday = toDateKey(d.date) === todayKey;
              return (
                <AccordionItem key={d.day} value={`d${d.day}`} className={`overflow-hidden rounded-xl border bg-card ${isToday ? "ring-2 ring-accent" : ""}`}>
                  <AccordionTrigger className="px-4 py-3.5 text-left hover:no-underline">
                    <span className="flex min-w-0 flex-1 items-center gap-3 pr-2">
                      <span className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg text-center leading-none ${done === d.tasks.length ? "bg-success text-white" : "bg-primary/10 text-primary"}`}><span className="text-[10px] font-bold uppercase">Day</span><span className="font-display text-lg font-extrabold">{d.day}</span></span>
                      <span className="min-w-0"><span className="block truncate font-semibold">{d.title}</span><span className="block text-xs text-muted-foreground">{fmt(d.date)}{isToday && <strong className="ml-2 rounded-full bg-accent px-2 py-0.5 text-[10px] uppercase text-accent-foreground">Today</strong>} · {done}/{d.tasks.length} done</span></span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <p className="mb-3 text-sm italic text-muted-foreground">{d.focus}</p>
                    <ul className="space-y-2.5">{d.tasks.map(t => <CheckRow key={t.id} id={t.id} checked={Boolean(checked[t.id])} onToggle={toggle} title={t.text} source={t.source} />)}</ul>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </section>
      ))}
    </div>
  );
}
