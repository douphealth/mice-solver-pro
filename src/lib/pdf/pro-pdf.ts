import type { jsPDF } from "jspdf";
import type { Plan } from "../plan";
import { METHOD_VERSION, PLANNER_LIMITATION } from "../plan";
import type { ProPack } from "../pro-types";
import type { ScheduleDay } from "../schedule";
import { LOG_KINDS, type LogEntry } from "../evidence-log";
import { CLEANUP_PREP, CLEANUP_PROCEDURES } from "../guides";
import { SOURCE_BY_ID, SOURCES, SOURCES_REVIEWED } from "../sources";
import { COLORS, Pdf, todayLabel } from "./kit";

export interface ProPdfInput { plan: Plan; pack: ProPack; schedule: ScheduleDay[]; log: LogEntry[]; start: Date }

const dateLabel = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
const org = (id?: keyof typeof SOURCE_BY_ID) => (id ? SOURCE_BY_ID[id].org : undefined);

/** The Pro workbook: everything in the workspace, printable. */
export async function generateProPdf({ plan, pack, schedule, log, start }: ProPdfInput): Promise<jsPDF> {
  const pdf = new Pdf({
    title: "Pro Masterplan: Mouse Control Workbook",
    subject: "Personalised 30-day mouse control workbook",
    running: "Pro Masterplan workbook",
    footer: "Planning guidance, not an inspection, diagnosis or medical assessment. elimination.micegoneguide.com",
  });

  pdf.coverBlock({
    kicker: "Pro Masterplan",
    title: "Your 30-Day Mouse Control Workbook",
    subtitle: plan.status.label,
    lines: [`Prepared ${todayLabel()} · plan starts ${dateLabel(start)}`, `Method ${METHOD_VERSION}. Sources reviewed ${SOURCES_REVIEWED}.`],
  });
  pdf.callout(plan.status.summary, plan.status.level === "attention" ? "safety" : "info", "Where you stand");
  pdf.p(PLANNER_LIMITATION, { size: 9, color: COLORS.muted, style: "italic" });

  pdf.h2("How to use this workbook");
  pdf.bullets([
    "Work through the 30-day schedule one day at a time and tick tasks off.",
    "Use the room protocols when you inspect each area, and the trap layout worksheet to plan positions.",
    "Record every trap check and new sign in the evidence log. Describe what you see. Don't try to turn counts into a number of mice.",
    "Stop and call a qualified professional if the hazards, escalation triggers or advice in this workbook say so.",
  ]);

  if (plan.hazards.length) {
    pdf.h1("Safety first");
    plan.hazards.forEach(h => pdf.callout(h.detail, "safety", h.title));
  }

  pdf.h1("Start here");
  plan.priorities.forEach((p, i) => pdf.checkItem(`${i + 1}. ${p.title}`, p.detail, org(p.source)));

  pdf.h1("Your 30-day schedule");
  schedule.forEach(d => {
    pdf.h2(`Day ${d.day} · ${dateLabel(d.date)} · ${d.title}`);
    d.tasks.forEach(t => pdf.checkItem(t.text, undefined, org(t.source)));
  });

  pdf.h1("Room-by-room protocols");
  const rooms = plan.rooms.length ? plan.rooms.map(r => pack.rooms[r.id]).filter(Boolean) : Object.values(pack.rooms);
  rooms.forEach(r => {
    pdf.h2(r.title);
    pdf.p("Inspect", { style: "bold", gap: 0.5 }); pdf.bullets(r.inspect);
    pdf.p("Trap", { style: "bold", gap: 0.5 }); pdf.bullets(r.trapping);
    pdf.p("Keep clear", { style: "bold", gap: 0.5 }); pdf.bullets(r.keep);
    pdf.p("Stay safe", { style: "bold", color: COLORS.red, gap: 0.5 }); pdf.bullets(r.safety);
  });

  pdf.h1("Trap plan");
  pdf.numbered(pack.trap.rules);
  pdf.h2("Baits to try");
  pdf.table(["Bait", "Note"], pack.trap.baits.map(b => [b.name, b.note]), [0.3, 0.7]);
  pdf.callout(pack.trap.avoid.join(" "), "safety", "Don't use");
  pdf.h2("Layout worksheet");
  pdf.p(`Measure each wall where you found signs. Space traps no more than about ${pack.trap.maxSpacingFt} feet apart (positions = wall length divided by ${pack.trap.maxSpacingFt}, rounded up). Pairs ${pack.trap.pairGapIn} inches apart are optional.`, { size: 9.5 });
  pdf.table(["Wall or area", "Length (ft)", "Positions", "Marked at (ft)"], Array.from({ length: 8 }, () => ["", "", "", ""]), [0.4, 0.18, 0.18, 0.24], { rowHeight: 10, zebra: false });

  pdf.h1("Sealing materials");
  pdf.p("Seal anything about 1/4 inch (6 mm) or larger. Mice can squeeze under a gap 1/4 inch tall and through an opening 3/8 inch wide (UC IPM).");
  pdf.table(["Where", "Use", "Watch out / avoid"], pack.materials.map(m => [m.where, m.use, `${m.caution} Avoid: ${m.avoid}`]), [0.24, 0.36, 0.4]);

  pdf.h1("Safe cleanup");
  pdf.callout(CLEANUP_PREP.never, "safety");
  pdf.p(CLEANUP_PREP.disinfectant, { size: 9.5 });
  ["droppings", "dead", "reuse"].forEach(id => {
    const proc = CLEANUP_PROCEDURES.find(p => p.id === id)!;
    pdf.h2(proc.title); pdf.numbered(proc.steps);
  });

  pdf.h1("Supplies checklist");
  [true, false].forEach(essential => {
    pdf.h2(essential ? "Essentials" : "Helpful extras");
    pack.supplies.filter(s => s.essential === essential).forEach(s => pdf.checkItem(s.name, `${s.why} Look for: ${s.criteria.join("; ")}.`, org(s.sources[0])));
  });

  pdf.h1("When to call a professional");
  pdf.bullets(plan.watchFor);
  pdf.h2("Before you call"); pdf.bullets(pack.escalation.before);
  pdf.h2("Questions to ask"); pdf.bullets(pack.escalation.ask);
  pdf.h2("After the visit"); pdf.bullets(pack.escalation.document);

  pdf.h1("Prevention calendar");
  pack.seasons.forEach(s => { pdf.h2(`${s.title} · ${s.when}`); s.tasks.forEach(t => pdf.checkItem(t.text, undefined, org(t.source))); });

  pdf.page();
  pdf.h1("Evidence log");
  if (log.length) {
    pdf.h2("Entries recorded in your workspace");
    pdf.table(["Date", "Type", "Where", "Note"], [...log].sort((a, b) => a.date.localeCompare(b.date)).map(e => [e.date, `${LOG_KINDS.find(k => k.id === e.kind)?.label ?? e.kind}${e.count > 1 ? ` x${e.count}` : ""}`, e.location, e.note]), [0.15, 0.25, 0.25, 0.35]);
    pdf.page();
  }
  pdf.p("Use these sheets to record each trap check and any new sign. Describe what you find. Don't try to infer how many mice there are.", { size: 9.5 });
  pdf.table(["Date", "Where", "Found (catch, droppings, gnawing, sighting)", "Did / next check"], Array.from({ length: 16 }, () => ["", "", "", ""]), [0.13, 0.2, 0.35, 0.32], { rowHeight: 11, zebra: false });
  pdf.page();
  pdf.table(["Date", "Where", "Found (catch, droppings, gnawing, sighting)", "Did / next check"], Array.from({ length: 20 }, () => ["", "", "", ""]), [0.13, 0.2, 0.35, 0.32], { rowHeight: 11, zebra: false });

  pdf.h1("Method and sources");
  pdf.p("This workbook applies fixed rules to your answers. It does not use a validated diagnostic model and does not calculate scores, species odds, population counts or disease risk. The sources inform the guidance. Their organisations haven't reviewed or endorsed it.");
  SOURCES.forEach(s => pdf.link(s.label, s.url));

  return pdf.finish();
}
