import { jsPDF } from "jspdf";
import type { QuizAnswers } from "./quiz-data";
import { PLANNER_LIMITATION, SOURCES, type ReportData } from "./report-generator";

/** Printable planning document. No remote font or image requests; works offline. */
export async function generatePDF(report: ReportData, isPro = false, _answers?: QuizAnswers): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: false });
  const left = 20, width = 170, bottom = 271;
  let y = 27;
  const clean = (s: string) => s.replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, "-").replace(/[^\x20-\x7e\n]/g, "");
  function header() {
    doc.setFillColor(24, 64, 50); doc.rect(0, 0, 210, 16, "F");
    doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(9);
    doc.text("MICEGONEGUIDE / PERSONALIZED PLANNING", left, 10);
  }
  function room(height: number) {
    if (y + height > bottom) {
      const color = doc.getTextColor(), font = doc.getFont(), size = doc.getFontSize();
      doc.addPage(); header(); y = 27;
      doc.setFont(font.fontName, font.fontStyle); doc.setFontSize(size); doc.setTextColor(color);
    }
  }
  function paragraph(text: string, indent = 0) {
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(38, 48, 43);
    const lines: string[] = doc.splitTextToSize(clean(text), width - indent);
    for (const line of lines) { room(5); doc.text(line, left + indent, y); y += 5; }
    y += 3;
  }
  function heading(text: string) {
    room(25); y += 5; doc.setFont("times", "bold"); doc.setFontSize(16); doc.setTextColor(24, 64, 50);
    const lines: string[] = doc.splitTextToSize(clean(text), width);
    doc.text(lines, left, y); y += lines.length * 6 + 4;
  }
  function list(items: string[]) { items.forEach((text, i) => paragraph(`${i + 1}. ${text}`, 2)); }
  function section(title: string, items: string[]) { heading(title); list(items); }
  header();
  doc.setFont("times", "bold"); doc.setFontSize(25); doc.setTextColor(24, 64, 50);
  doc.text("Your Mouse Control Plan", left, y); y += 12;
  paragraph(isPro ? "Extended planning workbook" : "Personalized planning checklist");
  paragraph(`Generated ${new Date().toISOString().slice(0, 10)} | Method version ${report.methodVersion}`);
  paragraph(PLANNER_LIMITATION);
  section("What you reported", [...report.physicalSigns, ...report.uncertainSigns].length ? [...report.physicalSigns, ...report.uncertainSigns] : ["No physical evidence was selected. This does not prove that rodents are absent."]);
  if (report.professionalHelp.length) section("Conditions needing qualified help", report.professionalHelp);
  section("Your next actions", report.immediateActions);
  section("Safe cleanup", report.decontaminationSteps);
  paragraph("Cleanup reference: CDC, How to Clean Up After Rodents (source 1). Trapping reference: CDC, How to Trap Up to Remove Rodents (source 2).");
  section("Accessible inspection areas", report.entryPoints);
  paragraph("Exclusion reference: CDC, How to Seal Up to Prevent Rodents (source 3). These are places to inspect, not confirmed routes.");
  if (isPro) {
    section("Room-by-room planning", report.roomByRoomStrategy.length ? report.roomByRoomStrategy : ["Select the affected rooms in the planner for room-specific inspection prompts."]);
    section("Choosing supplies", report.shoppingList.map(x => `${x.name}: ${x.reason}`));
    section("Work in phases, not promised clearance dates", report.eliminationTimeline.map(x => `${x.day}: ${x.action}`));
    section("Ongoing checks", report.preventionCalendar.map(x => `${x.month}: ${x.task}`));
  }
  heading("Observation log");
  paragraph("After safe cleanup, record newly appearing evidence and daily trap checks. Do not infer the total population from counts of droppings or catches.");
  for (let i = 0; i < 4; i++) { room(25); paragraph("Date / location: ____________________________________"); paragraph("Observation / action / next check: ______________________"); }
  heading("Method and sources");
  paragraph("The planner maps your selected observations to inspection, food-access, trap-access and cleanup prompts. It does not use a validated diagnostic model. The sources inform the guidance; their organizations do not endorse this tool.");
  SOURCES.forEach((source, i) => {
    room(22); paragraph(`${i + 1}. ${source.label}`);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(24, 64, 50);
    const lines: string[] = doc.splitTextToSize(source.url, width);
    for (const line of lines) { room(4); doc.textWithLink(line, left, y, { url: source.url }); y += 4; } y += 4;
  });
  const total = doc.getNumberOfPages();
  for (let n = 1; n <= total; n++) {
    doc.setPage(n); doc.setDrawColor(204, 211, 206); doc.line(left, 278, 190, 278);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(85, 99, 90);
    doc.text("Planning guidance, not an inspection or medical assessment", left, 284);
    doc.text(`${n} / ${total}`, 190, 284, { align: "right" });
  }
  doc.setProperties({ title: "Personalized Mouse Control Plan", author: "MiceGoneGuide", subject: "Observation-based planning and source guidance" });
  return doc;
}
