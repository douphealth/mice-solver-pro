import type { jsPDF } from "jspdf";
import { actionsByPhase, METHOD_VERSION, PHASE_META, PLANNER_LIMITATION, type Phase, type Plan } from "../plan";
import { CLEANUP_PROCEDURES, MATERIALS, TRAP_AVOID } from "../guides";
import { SOURCE_BY_ID, SOURCES, SOURCES_REVIEWED } from "../sources";
import { COLORS, Pdf, todayLabel } from "./kit";

/** Printable free plan. No remote fonts or images, so it works offline. */
export async function generateFreePdf(plan: Plan, now = new Date()): Promise<jsPDF> {
  const pdf = new Pdf({
    title: "Your Mouse Control Plan",
    subject: "Observation-based mouse control planning",
    running: "Your mouse control plan",
    footer: "Planning guidance, not an inspection, diagnosis or medical assessment. elimination.micegoneguide.com",
  });

  pdf.coverBlock({
    kicker: "Free personalised plan",
    title: "Your Mouse Control Plan",
    subtitle: plan.status.label,
    lines: [`Prepared ${todayLabel(now)}`, `Method ${METHOD_VERSION}. Sources reviewed ${SOURCES_REVIEWED}.`],
  });

  pdf.callout(plan.status.summary, plan.status.level === "attention" ? "safety" : "info", "Where you stand");
  pdf.p(PLANNER_LIMITATION, { size: 9, color: COLORS.muted, style: "italic" });

  pdf.h1("Start here");
  plan.priorities.forEach((p, i) => pdf.checkItem(`${i + 1}. ${p.title}`, p.detail, SOURCE_BY_ID[p.source ?? "ucipm"]?.org));

  pdf.h1("What you reported");
  const reported = [...plan.observed.physical, ...plan.observed.uncertain];
  if (reported.length) pdf.bullets(reported);
  else pdf.p("No signs were selected. That doesn't prove rodents are absent. Start by inspecting for physical evidence.");
  if (plan.hazards.length) {
    pdf.h2("Conditions that need qualified help");
    plan.hazards.forEach(h => pdf.callout(h.detail, "safety", h.title));
  }

  pdf.h1("Your action plan");
  const phases = actionsByPhase(plan);
  (["today", "week", "ongoing"] as Phase[]).forEach(phase => {
    pdf.h2(`${PHASE_META[phase].label}: ${PHASE_META[phase].blurb}`);
    phases[phase].forEach(a => pdf.checkItem(a.title, a.detail, a.source ? SOURCE_BY_ID[a.source].org : undefined));
  });

  if (plan.rooms.length) {
    pdf.h1("Rooms to inspect");
    plan.rooms.forEach(r => { pdf.h2(r.title); pdf.p(r.prompt); });
  }

  pdf.h1("Safe cleanup");
  pdf.callout("Never sweep or vacuum rodent urine, droppings or nests. Wet the material with disinfectant first.", "safety");
  pdf.p(CLEANUP_PROCEDURES[0].title, { style: "bold" });
  pdf.numbered(CLEANUP_PROCEDURES[0].steps);
  pdf.p("For dead rodents, nests, traps, fabrics and vehicles, see the full cleanup guide at elimination.micegoneguide.com/tools/cleanup-guide.", { size: 9, color: COLORS.muted });

  pdf.h1("Seal what you find");
  pdf.p("Mice can fit through a hole about 1/4 inch (6 mm) wide, the width of a pencil. UC IPM adds that they can squeeze under a gap 1/4 inch tall and through an opening 3/8 inch wide.");
  pdf.table(["Material", "How to use it", "Verdict"], MATERIALS.map(m => [m.use, m.note, m.verdict === "works" ? "Works" : m.verdict === "temporary" ? "Temporary" : "Avoid"]), [0.3, 0.55, 0.15]);

  pdf.h1("What not to rely on");
  TRAP_AVOID.forEach(t => pdf.checkItem(t.title, t.body, SOURCE_BY_ID[t.source].org));

  pdf.page();
  pdf.h1("Observation log");
  pdf.p("After safe cleanup, record newly appearing signs and each trap check. Describe what you see. Don't try to infer how many mice there are from counts of droppings or catches.", { size: 9.5 });
  pdf.table(["Date", "Where", "What I found", "What I did / next check"], Array.from({ length: 13 }, () => ["", "", "", ""]), [0.14, 0.2, 0.33, 0.33], { rowHeight: 11, zebra: false });

  pdf.h1("Method and sources");
  pdf.p("Your answers were matched to fixed rules. The planner doesn't use a validated diagnostic model and doesn't calculate scores, species odds, population counts or disease risk. The sources below inform the guidance. Their organisations haven't reviewed or endorsed this tool.");
  SOURCES.forEach(s => pdf.link(s.label, s.url));

  return pdf.finish();
}
