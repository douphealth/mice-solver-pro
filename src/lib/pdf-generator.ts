import jsPDF from "jspdf";
import { ReportData } from "./report-generator";

const COLORS = {
  primary: [30, 70, 42] as [number, number, number],      // dark green
  accent: [210, 160, 60] as [number, number, number],      // gold
  dark: [25, 30, 28] as [number, number, number],
  text: [40, 50, 45] as [number, number, number],
  muted: [120, 130, 125] as [number, number, number],
  light: [245, 242, 235] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  red: [200, 60, 60] as [number, number, number],
  yellow: [210, 160, 40] as [number, number, number],
  green: [50, 140, 80] as [number, number, number],
};

function drawSeverityBar(doc: jsPDF, x: number, y: number, width: number, score: number) {
  const segmentWidth = width / 10;
  for (let i = 0; i < 10; i++) {
    const r = i < 3 ? COLORS.green : i < 7 ? COLORS.yellow : COLORS.red;
    if (i < score) {
      doc.setFillColor(...r);
    } else {
      doc.setFillColor(230, 230, 225);
    }
    doc.roundedRect(x + i * (segmentWidth + 2), y, segmentWidth - 2, 8, 2, 2, "F");
  }
}

function sectionHeader(doc: jsPDF, y: number, title: string, emoji: string): number {
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(15, y, 180, 10, 2, 2, "F");
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`${emoji}  ${title}`, 20, y + 7);
  doc.setTextColor(...COLORS.text);
  return y + 16;
}

function checkPage(doc: jsPDF, y: number, needed: number = 30): number {
  if (y + needed > 275) {
    doc.addPage();
    return 20;
  }
  return y;
}

export function generatePDF(report: ReportData, isPro: boolean = false): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // ===== COVER / HEADER =====
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, 210, 55, "F");

  // Gold accent line
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 55, 210, 3, "F");

  // Title
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Mouse Problem Report", 105, 22, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Personalized AI-Powered Infestation Analysis", 105, 30, { align: "center" });

  doc.setFontSize(9);
  doc.setTextColor(200, 220, 210);
  doc.text(`Generated ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}  •  MiceGoneGuide.com`, 105, 40, { align: "center" });

  // Severity badge
  const badgeColor = report.severity <= 3 ? COLORS.green : report.severity <= 6 ? COLORS.yellow : COLORS.red;
  doc.setFillColor(...badgeColor);
  doc.roundedRect(70, 44, 70, 9, 4, 4, "F");
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Severity: ${report.severity}/10 — ${report.severityLabel}`, 105, 50, { align: "center" });

  let y = 65;

  // ===== SEVERITY =====
  y = sectionHeader(doc, y, "INFESTATION SEVERITY", "📊");
  drawSeverityBar(doc, 20, y, 170, report.severity);
  y += 14;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);
  const lines = doc.splitTextToSize(report.severityDescription, 170);
  doc.text(lines, 20, y);
  y += lines.length * 4.5 + 6;

  // Population estimate box
  y = checkPage(doc, y, 20);
  doc.setFillColor(250, 248, 242);
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(0.5);
  doc.roundedRect(20, y, 170, 16, 3, 3, "FD");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text(`Estimated Population: ${report.estimatedPopulation.min}–${report.estimatedPopulation.max} mice`, 28, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.muted);
  doc.text(`Without action → ${report.populationIn30Days.min}–${report.populationIn30Days.max} within 30 days`, 28, y + 12);
  y += 22;

  // ===== SPECIES =====
  y = checkPage(doc, y, 40);
  y = sectionHeader(doc, y, "RODENT IDENTIFICATION", "🔬");
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text(report.species.name, 20, y + 1);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...COLORS.muted);
  doc.text(report.species.scientificName, 20, y + 6);
  y += 10;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);
  const descLines = doc.splitTextToSize(report.species.description, 170);
  doc.text(descLines, 20, y);
  y += descLines.length * 4.5 + 4;

  // Species details grid
  const details = [
    { label: "Behavior", value: report.species.behavior },
    { label: "Diet", value: report.species.diet },
    { label: "Reproduction", value: report.species.reproductionRate },
  ];
  for (const d of details) {
    y = checkPage(doc, y, 15);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary);
    doc.text(d.label + ":", 20, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);
    const valLines = doc.splitTextToSize(d.value, 155);
    doc.text(valLines, 35, y);
    y += valLines.length * 4 + 3;
  }

  // ===== HEALTH RISKS =====
  y = checkPage(doc, y, 30);
  y = sectionHeader(doc, y, "HEALTH RISK ASSESSMENT", "⚕️");
  for (const risk of report.healthRisks) {
    y = checkPage(doc, y, 10);
    const isHighRisk = risk.startsWith("⚠️") || risk.startsWith("🔴");
    if (isHighRisk) {
      doc.setFillColor(255, 240, 240);
      doc.setDrawColor(220, 100, 100);
      doc.setLineWidth(0.3);
    } else {
      doc.setFillColor(248, 248, 245);
      doc.setDrawColor(220, 218, 210);
      doc.setLineWidth(0.2);
    }
    const riskLines = doc.splitTextToSize(risk, 160);
    const boxH = riskLines.length * 4 + 5;
    doc.roundedRect(20, y, 170, boxH, 2, 2, "FD");
    doc.setFontSize(8);
    doc.setFont("helvetica", isHighRisk ? "bold" : "normal");
    doc.setTextColor(...(isHighRisk ? COLORS.red : COLORS.text));
    doc.text(riskLines, 25, y + 4);
    y += boxH + 3;
  }

  // ===== ENTRY POINTS =====
  y = checkPage(doc, y, 30);
  y = sectionHeader(doc, y, "PROBABLE ENTRY POINTS", "📍");
  for (let i = 0; i < report.entryPoints.length; i++) {
    y = checkPage(doc, y, 8);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);
    doc.setFillColor(...COLORS.accent);
    doc.circle(24, y - 1, 1.5, "F");
    const epLines = doc.splitTextToSize(report.entryPoints[i], 160);
    doc.text(epLines, 30, y);
    y += epLines.length * 4.5 + 2;
  }

  // ===== 3 IMMEDIATE ACTIONS =====
  y = checkPage(doc, y, 40);
  y = sectionHeader(doc, y, "3 THINGS TO DO TONIGHT", "⚡");
  for (let i = 0; i < report.immediateActions.length; i++) {
    y = checkPage(doc, y, 15);
    // Number circle
    doc.setFillColor(...COLORS.accent);
    doc.circle(24, y + 2, 4, "F");
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(String(i + 1), 24, y + 3.5, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);
    const actionLines = doc.splitTextToSize(report.immediateActions[i], 155);
    doc.text(actionLines, 32, y + 1);
    y += actionLines.length * 4.5 + 6;
  }

  if (!isPro) {
    // Free tier footer
    y = checkPage(doc, y, 30);
    doc.setFillColor(250, 248, 242);
    doc.setDrawColor(...COLORS.accent);
    doc.setLineWidth(0.8);
    doc.roundedRect(15, y, 180, 30, 4, 4, "FD");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.dark);
    doc.text("Want the Complete Elimination Masterplan?", 105, y + 10, { align: "center" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.muted);
    doc.text("Room-by-room strategy • Shopping list • 30-day timeline • Decontamination guide", 105, y + 17, { align: "center" });
    doc.text("Upgrade at app.micegoneguide.com for $9.99", 105, y + 24, { align: "center" });
  }

  if (isPro) {
    // ===== PRO CONTENT =====
    doc.addPage();
    y = 15;

    // Pro header
    doc.setFillColor(...COLORS.accent);
    doc.rect(0, 0, 210, 12, "F");
    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("PRO REPORT — Complete Elimination Masterplan", 105, 8, { align: "center" });
    y = 20;

    // Room-by-Room Strategy
    y = sectionHeader(doc, y, "ROOM-BY-ROOM ELIMINATION STRATEGY", "🏠");
    for (const s of report.roomByRoomStrategy) {
      y = checkPage(doc, y, 15);
      doc.setFillColor(248, 248, 245);
      doc.roundedRect(20, y, 170, 5, 1, 1, "F");
      const stratLines = doc.splitTextToSize(s, 165);
      const boxH = stratLines.length * 4 + 4;
      doc.setFillColor(248, 248, 245);
      doc.roundedRect(20, y, 170, boxH, 2, 2, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.text);
      doc.text(stratLines, 25, y + 4);
      y += boxH + 3;
    }

    // Shopping List
    y = checkPage(doc, y, 30);
    y = sectionHeader(doc, y, "PERSONALIZED SHOPPING LIST", "🛒");
    for (const item of report.shoppingList) {
      y = checkPage(doc, y, 12);
      doc.setFillColor(...COLORS.green);
      doc.circle(24, y + 1, 1.5, "F");
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.dark);
      doc.text(item.name, 30, y + 1);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.muted);
      doc.setFontSize(8);
      doc.text(item.reason, 30, y + 5.5);
      y += 10;
    }

    // 30-Day Timeline
    y = checkPage(doc, y, 30);
    y = sectionHeader(doc, y, "30-DAY ELIMINATION TIMELINE", "📅");
    for (const t of report.eliminationTimeline) {
      y = checkPage(doc, y, 12);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.primary);
      doc.text(t.day, 20, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.text);
      const tLines = doc.splitTextToSize(t.action, 145);
      doc.text(tLines, 55, y);
      y += tLines.length * 4.5 + 4;
    }

    // Decontamination
    y = checkPage(doc, y, 30);
    y = sectionHeader(doc, y, "CDC-ALIGNED DECONTAMINATION PROTOCOL", "🧹");
    for (let i = 0; i < report.decontaminationSteps.length; i++) {
      y = checkPage(doc, y, 10);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.accent);
      doc.text(`Step ${i + 1}:`, 20, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.text);
      const stepLines = doc.splitTextToSize(report.decontaminationSteps[i], 155);
      doc.text(stepLines, 35, y);
      y += stepLines.length * 4 + 4;
    }

    // Prevention Calendar
    y = checkPage(doc, y, 30);
    y = sectionHeader(doc, y, "12-MONTH PREVENTION CALENDAR", "🗓️");
    for (const p of report.preventionCalendar) {
      y = checkPage(doc, y, 10);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.primary);
      doc.text(p.month, 20, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.text);
      const pLines = doc.splitTextToSize(p.task, 140);
      doc.text(pLines, 55, y);
      y += pLines.length * 4.5 + 3;
    }
  }

  // ===== FOOTER on every page =====
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 287, 210, 10, "F");
    doc.setTextColor(180, 200, 190);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("MiceGoneGuide.com — Professional-grade mouse elimination guidance", 105, 292, { align: "center" });
    doc.text(`Page ${i} of ${pageCount}`, 195, 292, { align: "right" });
  }

  return doc;
}
