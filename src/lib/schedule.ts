import type { ProPack, ProTask } from "./pro-types";
import type { Plan } from "./plan";
import type { QuizAnswers } from "./quiz-data";

export interface ScheduleDay {
  day: number;
  date: Date;
  title: string;
  focus: string;
  tasks: ProTask[];
}

export const startOfDay = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d: Date, n: number): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const toDateKey = (d: Date): string => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const parseDateKey = (key: string): Date | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) || toDateKey(d) !== key ? null : d;
};

const asList = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

/**
 * Turn the 30-day pack into dated, personalised days. Task ids never contain the date,
 * so changing the start date keeps every checkbox the user has already ticked.
 */
export function buildSchedule(pack: ProPack, plan: Plan, answers: QuizAnswers, start: Date): ScheduleDay[] {
  const begin = startOfDay(start);
  const byDay = new Map<number, ScheduleDay>();
  const ensure = (day: number, title?: string, focus?: string): ScheduleDay => {
    let entry = byDay.get(day);
    if (!entry) {
      entry = { day, date: addDays(begin, day), title: title ?? "Trap check", focus: focus ?? "Check, record and reset.", tasks: [] };
      byDay.set(day, entry);
    } else if (title) {
      entry.title = title;
      entry.focus = focus ?? entry.focus;
    }
    return entry;
  };

  for (const m of pack.milestones) {
    const tasks = plan.hazards.length ? m.tasks : m.tasks.filter(t => t.id !== "d0-hazards");
    ensure(m.day, m.title, m.focus).tasks.push(...tasks);
  }

  // --- personal additions ---
  const day0 = ensure(0);
  const personal: ProTask[] = [];
  for (const hazard of plan.hazards) personal.push({ id: `p-${hazard.id}`, text: `${hazard.title}. Do this before any DIY work.`, source: hazard.source });
  if (plan.flags.kids || plan.flags.pets) personal.push({ id: "p-access", text: "Choose trap and bait spots that children and pets can't reach. A covered trap is not automatically safe.", source: "cdc-trap" });
  const previous = asList(answers.previous);
  if (previous.includes("glue_traps")) personal.push({ id: "p-glue", text: "Remove glue traps and stop using them. The CDC advises against them.", source: "cdc-trap" });
  if (previous.includes("poison")) personal.push({ id: "p-poison", text: "Check that any rodenticide sits in locked, tamper-resistant stations out of reach of children, pets and wildlife, and follow the label.", source: "ucipm" });
  if (previous.includes("ultrasonic") || previous.includes("peppermint")) personal.push({ id: "p-devices", text: "Don't count on ultrasonic devices or scents. Put your effort into food, gaps and traps.", source: "ucipm" });
  day0.tasks.unshift(...personal);

  plan.rooms.forEach((room, i) => {
    ensure(1 + (i % 3)).tasks.push({ id: `p-room-${room.id}`, text: `Inspect the ${room.title.toLowerCase()} using its checklist in the Rooms tab.` });
  });
  if (plan.flags.multiunit) ensure(2).tasks.push({ id: "p-landlord", text: "Tell your landlord or building manager that you've found signs, since shared walls and services are involved.", source: "cdc-seal" });
  if (answers.duration === "months" || answers.duration === "returning") {
    ensure(7).tasks.push({ id: "p-pro-assess", text: "Because signs have lasted a while or returned, request a professional inspection quote this week and compare it with your log.", source: "cdc-trap" });
  }

  // --- daily trap checks ---
  const { fromDay, toDay, text, source } = pack.dailyCheck;
  for (let d = fromDay; d <= toDay; d++) ensure(d).tasks.push({ id: `check-${d}`, text, source });

  return [...byDay.values()].filter(d => d.tasks.length > 0).sort((a, b) => a.day - b.day);
}

/** A light free reminder set: one "check your traps" event per day. */
export function trapCheckDays(start: Date, days = 14): ScheduleDay[] {
  const begin = startOfDay(start);
  return Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    date: addDays(begin, i + 1),
    title: "Check your mouse traps",
    focus: "Check, record and reset.",
    tasks: [{ id: `free-check-${i + 1}`, text: "Check every trap. Wearing gloves, double-bag and dispose of any catch, then reset or move traps where activity continues.", source: "cdc-trap" as const }],
  }));
}

export function dayProgress(days: ScheduleDay[], checked: Record<string, boolean>): { done: number; total: number } {
  let done = 0, total = 0;
  for (const d of days) for (const t of d.tasks) { total++; if (checked[t.id]) done++; }
  return { done, total };
}

/** The first day (from today) that still has an unchecked task. Used to open the schedule at the right spot. */
export function currentDay(days: ScheduleDay[], checked: Record<string, boolean>, today = new Date()): number {
  const key = toDateKey(startOfDay(today));
  const upcoming = days.find(d => toDateKey(d.date) >= key && d.tasks.some(t => !checked[t.id]));
  return upcoming?.day ?? days[days.length - 1]?.day ?? 0;
}
