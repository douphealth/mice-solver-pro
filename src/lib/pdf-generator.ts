import jsPDF from "jspdf";
import { ReportData } from "./report-generator";

const COLORS = {
  primary: [30, 70, 42] as [number, number, number],
  accent: [210, 160, 60] as [number, number, number],
  dark: [25, 30, 28] as [number, number, number],
  text: [40, 50, 45] as [number, number, number],
  muted: [120, 130, 125] as [number, number, number],
  light: [245, 242, 235] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  red: [200, 60, 60] as [number, number, number],
  yellow: [210, 160, 40] as [number, number, number],
  green: [50, 140, 80] as [number, number, number],
};

/** Strip emojis and replace problematic Unicode with ASCII equivalents */
function sanitize(text: string): string {
  return text
    // Remove emoji characters (broad range)
    .replace(/[\u{1F600}-\u{1F64F}]/gu, "")
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, "")
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, "")
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, "")
    .replace(/[\u{2600}-\u{26FF}]/gu, "")
    .replace(/[\u{2700}-\u{27BF}]/gu, "")
    .replace(/[\u{FE00}-\u{FE0F}]/gu, "")
    .replace(/[\u{200D}]/gu, "")
    .replace(/[\u{20E3}]/gu, "")
    .replace(/[\u{E0020}-\u{E007F}]/gu, "")
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, "")
    .replace(/[\u{1FA00}-\u{1FA6F}]/gu, "")
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, "")
    // Replace special characters with ASCII
    .replace(/\u2014/g, "--")   // em dash
    .replace(/\u2013/g, "-")    // en dash
    .replace(/\u2018|\u2019/g, "'") // smart quotes
    .replace(/\u201C|\u201D/g, '"') // smart double quotes
    .replace(/\u2022/g, "-")   // bullet
    .replace(/\u00BC/g, "1/4") // ¼
    .replace(/\u00BD/g, "1/2") // ½
    .replace(/\u00BE/g, "3/4") // ¾
    .replace(/\u2026/g, "...")  // ellipsis
    .replace(/\u00A0/g, " ")   // non-breaking space
    .trim();
}

function drawSeverityBar(doc: jsPDF, x: number, y: number, width: number, score: number) {
  const segmentWidth = width / 10;
  for (let i = 0; i < 10; i++) {
    const color = i < 3 ? COLORS.green : i < 7 ? COLORS.yellow : COLORS.red;
    if (i < score) {
      doc.setFillColor(...color);
    } else {
      doc.setFillColor(230, 230, 225);
    }
    doc.roundedRect(x + i * (segmentWidth + 2), y, segmentWidth - 2, 8, 2, 2, "F");
  }
  // Labels under bar
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.muted);
  doc.text("LOW", x, y + 12);
  doc.text("MODERATE", x + width / 2, y + 12, { align: "center" });
  doc.text("SEVERE", x + width, y + 12, { align: "right" });
}

function sectionHeader(doc: jsPDF, y: number, title: string, icon: string): number {
  // Elegant dark green header bar with icon prefix
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(15, y, 180, 10, 2, 2, "F");
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`${icon}  ${sanitize(title)}`, 20, y + 7);
  doc.setTextColor(...COLORS.text);
  return y + 16;
}

function checkPage(doc: jsPDF, y: number, needed: number = 30): number {
  if (y + needed > 272) {
    doc.addPage();
    return 22;
  }
  return y;
}

function addClickableLink(doc: jsPDF, text: string, url: string, x: number, y: number, fontSize: number = 8) {
  doc.setFontSize(fontSize);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 90, 160);
  doc.text(text, x, y);
  const textWidth = doc.getTextWidth(text);
  // Underline
  doc.setDrawColor(30, 90, 160);
  doc.setLineWidth(0.2);
  doc.line(x, y + 0.5, x + textWidth, y + 0.5);
  // Clickable area
  doc.link(x, y - 3, textWidth, 4, { url });
}

function drawDividerLine(doc: jsPDF, y: number): number {
  doc.setDrawColor(220, 218, 210);
  doc.setLineWidth(0.3);
  doc.line(20, y, 190, y);
  return y + 4;
}

export function generatePDF(report: ReportData, isPro: boolean = false): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // ===== COVER HEADER =====
  // Dark green header block
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, 210, 52, "F");

  // Gold accent stripe
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 52, 210, 2.5, "F");

  // Title
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("MOUSE PROBLEM REPORT", 105, 18, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 220, 210);
  doc.text("Personalized AI-Powered Infestation Analysis", 105, 26, { align: "center" });

  doc.setFontSize(8);
  doc.setTextColor(170, 195, 180);
  const dateStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  doc.text(`Generated ${dateStr}  |  MiceGoneGuide.com`, 105, 34, { align: "center" });

  // Severity badge
  const badgeColor = report.severity <= 3 ? COLORS.green : report.severity <= 6 ? COLORS.yellow : COLORS.red;
  doc.setFillColor(...badgeColor);
  doc.roundedRect(65, 39, 80, 9, 4, 4, "F");
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Severity: ${report.severity}/10 -- ${sanitize(report.severityLabel)}`, 105, 45, { align: "center" });

  let y = 62;

  // ===== SEVERITY SECTION =====
  y = sectionHeader(doc, y, "INFESTATION SEVERITY", ">>>");
  drawSeverityBar(doc, 20, y, 170, report.severity);
  y += 18;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);
  const sevLines = doc.splitTextToSize(sanitize(report.severityDescription), 170);
  doc.text(sevLines, 20, y);
  y += sevLines.length * 4.5 + 6;

  // Population estimate box
  y = checkPage(doc, y, 22);
  doc.setFillColor(250, 248, 242);
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(0.5);
  doc.roundedRect(20, y, 170, 18, 3, 3, "FD");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text(`Estimated Population: ${report.estimatedPopulation.min}-${report.estimatedPopulation.max} mice`, 28, y + 7);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.muted);
  doc.text(`Without action: Could grow to ${report.populationIn30Days.min}-${report.populationIn30Days.max} within 30 days`, 28, y + 13);
  y += 24;

  // ===== SPECIES IDENTIFICATION =====
  y = checkPage(doc, y, 45);
  y = sectionHeader(doc, y, "RODENT IDENTIFICATION", ">>>");

  // Species name card
  doc.setFillColor(248, 248, 245);
  doc.roundedRect(20, y, 170, 14, 3, 3, "F");
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text(sanitize(report.species.name), 28, y + 6);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...COLORS.muted);
  doc.text(sanitize(report.species.scientificName), 28, y + 11);
  y += 18;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);
  const descLines = doc.splitTextToSize(sanitize(report.species.description), 170);
  doc.text(descLines, 20, y);
  y += descLines.length * 4.5 + 4;

  // Species detail cards
  const details = [
    { label: "BEHAVIOR", value: report.species.behavior },
    { label: "DIET", value: report.species.diet },
    { label: "REPRODUCTION", value: report.species.reproductionRate },
  ];
  for (const d of details) {
    y = checkPage(doc, y, 16);
    doc.setFillColor(248, 250, 248);
    doc.setDrawColor(220, 230, 220);
    doc.setLineWidth(0.2);
    const valText = sanitize(d.value);
    const valLines = doc.splitTextToSize(valText, 148);
    const cardH = valLines.length * 3.8 + 8;
    doc.roundedRect(20, y, 170, cardH, 2, 2, "FD");
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary);
    doc.text(d.label, 25, y + 5);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);
    doc.text(valLines, 25, y + 9);
    y += cardH + 3;
  }

  // ===== HEALTH RISKS =====
  y = checkPage(doc, y, 30);
  y = sectionHeader(doc, y, "HEALTH RISK ASSESSMENT", ">>>");
  for (const risk of report.healthRisks) {
    y = checkPage(doc, y, 12);
    const cleanRisk = sanitize(risk);
    const isHighRisk = risk.includes("HIGH RISK") || risk.includes("CRITICAL");
    if (isHighRisk) {
      doc.setFillColor(255, 240, 240);
      doc.setDrawColor(220, 100, 100);
      doc.setLineWidth(0.3);
    } else {
      doc.setFillColor(248, 248, 245);
      doc.setDrawColor(220, 218, 210);
      doc.setLineWidth(0.2);
    }
    const riskLines = doc.splitTextToSize(cleanRisk, 160);
    const boxH = riskLines.length * 4 + 6;
    doc.roundedRect(20, y, 170, boxH, 2, 2, "FD");
    // Warning indicator
    if (isHighRisk) {
      doc.setFillColor(...COLORS.red);
      doc.roundedRect(20, y, 3, boxH, 1, 1, "F");
    }
    doc.setFontSize(8);
    doc.setFont("helvetica", isHighRisk ? "bold" : "normal");
    doc.setTextColor(...(isHighRisk ? COLORS.red : COLORS.text));
    doc.text(riskLines, 27, y + 5);
    y += boxH + 3;
  }

  // ===== ENTRY POINTS =====
  y = checkPage(doc, y, 30);
  y = sectionHeader(doc, y, "PROBABLE ENTRY POINTS", ">>>");
  for (let i = 0; i < report.entryPoints.length; i++) {
    y = checkPage(doc, y, 10);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);
    // Gold bullet
    doc.setFillColor(...COLORS.accent);
    doc.circle(24, y - 1, 1.5, "F");
    const epLines = doc.splitTextToSize(sanitize(report.entryPoints[i]), 158);
    doc.text(epLines, 30, y);
    y += epLines.length * 4.5 + 3;
  }

  // ===== 3 IMMEDIATE ACTIONS =====
  y = checkPage(doc, y, 45);
  y = sectionHeader(doc, y, "3 THINGS TO DO TONIGHT", ">>>");
  for (let i = 0; i < report.immediateActions.length; i++) {
    y = checkPage(doc, y, 18);
    // Numbered circle
    doc.setFillColor(...COLORS.accent);
    doc.circle(24, y + 2, 4.5, "F");
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(String(i + 1), 24, y + 4, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);
    const actionLines = doc.splitTextToSize(sanitize(report.immediateActions[i]), 152);
    doc.text(actionLines, 33, y + 1);
    y += actionLines.length * 4.5 + 7;
  }

  // ===== HELPFUL RESOURCES / WEBSITE LINKS =====
  y = checkPage(doc, y, 40);
  y = drawDividerLine(doc, y);
  y += 2;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text("Helpful Resources from MiceGoneGuide", 105, y, { align: "center" });
  y += 8;

  // Resource cards with clickable links
  const resources = [
    {
      title: "Complete Mouse Identification Guide",
      desc: "Learn to identify species, read droppings, and understand behavior patterns.",
      url: "https://micegoneguide.com/mouse-identification-guide/",
    },
    {
      title: "How to Mouse-Proof Your Home",
      desc: "Step-by-step sealing guide with product recommendations and DIY tips.",
      url: "https://micegoneguide.com/mouse-proof-your-home/",
    },
    {
      title: "Safe Cleanup & Decontamination Protocol",
      desc: "CDC-aligned cleanup procedures to protect your family from rodent-borne diseases.",
      url: "https://micegoneguide.com/mouse-droppings-cleanup/",
    },
  ];

  for (const res of resources) {
    y = checkPage(doc, y, 18);
    doc.setFillColor(248, 250, 248);
    doc.setDrawColor(200, 215, 200);
    doc.setLineWidth(0.3);
    doc.roundedRect(20, y, 170, 16, 3, 3, "FD");
    // Green accent bar on left
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(20, y, 3, 16, 1, 1, "F");

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.dark);
    doc.text(res.title, 28, y + 5.5);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.muted);
    doc.text(res.desc, 28, y + 10.5);

    // Clickable link area on entire card
    doc.link(20, y, 170, 16, { url: res.url });

    // Small "Read more" link text
    doc.setTextColor(30, 90, 160);
    doc.setFontSize(7);
    doc.text("Read more >>", 164, y + 5.5);

    y += 20;
  }

  if (!isPro) {
    // ===== UPGRADE CTA =====
    y = checkPage(doc, y, 38);
    y += 4;

    // Premium upsell box
    doc.setFillColor(250, 248, 242);
    doc.setDrawColor(...COLORS.accent);
    doc.setLineWidth(1);
    doc.roundedRect(15, y, 180, 38, 5, 5, "FD");

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.dark);
    doc.text("Want the Complete Elimination Masterplan?", 105, y + 10, { align: "center" });

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.muted);
    doc.text("Room-by-room strategy  |  Shopping list  |  30-day timeline  |  Decontamination guide", 105, y + 18, { align: "center" });

    // CTA button shape
    doc.setFillColor(...COLORS.accent);
    doc.roundedRect(55, y + 23, 100, 10, 4, 4, "F");
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Upgrade at app.micegoneguide.com", 105, y + 30, { align: "center" });
    doc.link(55, y + 23, 100, 10, { url: "https://app.micegoneguide.com" });
  }

  if (isPro) {
    // ===== PRO CONTENT =====
    doc.addPage();
    let py = 15;

    // Pro header stripe
    doc.setFillColor(...COLORS.accent);
    doc.rect(0, 0, 210, 12, "F");
    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("PRO REPORT -- Complete Elimination Masterplan", 105, 8, { align: "center" });
    py = 20;

    // Room-by-Room Strategy
    py = sectionHeader(doc, py, "ROOM-BY-ROOM ELIMINATION STRATEGY", ">>>");
    for (const s of report.roomByRoomStrategy) {
      py = checkPage(doc, py, 15);
      const stratLines = doc.splitTextToSize(sanitize(s), 165);
      const boxH = stratLines.length * 4 + 5;
      doc.setFillColor(248, 248, 245);
      doc.roundedRect(20, py, 170, boxH, 2, 2, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.text);
      doc.text(stratLines, 25, py + 4);
      py += boxH + 3;
    }

    // Shopping List
    py = checkPage(doc, py, 30);
    py = sectionHeader(doc, py, "PERSONALIZED SHOPPING LIST", ">>>");
    for (const item of report.shoppingList) {
      py = checkPage(doc, py, 12);
      doc.setFillColor(...COLORS.green);
      doc.circle(24, py + 1, 1.5, "F");
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.dark);
      doc.text(sanitize(item.name), 30, py + 1);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.muted);
      doc.setFontSize(8);
      doc.text(sanitize(item.reason), 30, py + 5.5);
      py += 10;
    }

    // 30-Day Timeline
    py = checkPage(doc, py, 30);
    py = sectionHeader(doc, py, "30-DAY ELIMINATION TIMELINE", ">>>");
    for (const t of report.eliminationTimeline) {
      py = checkPage(doc, py, 12);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.primary);
      doc.text(sanitize(t.day), 20, py);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.text);
      const tLines = doc.splitTextToSize(sanitize(t.action), 145);
      doc.text(tLines, 55, py);
      py += tLines.length * 4.5 + 4;
    }

    // Decontamination
    py = checkPage(doc, py, 30);
    py = sectionHeader(doc, py, "CDC-ALIGNED DECONTAMINATION PROTOCOL", ">>>");
    for (let i = 0; i < report.decontaminationSteps.length; i++) {
      py = checkPage(doc, py, 10);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.accent);
      doc.text(`Step ${i + 1}:`, 20, py);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.text);
      const stepLines = doc.splitTextToSize(sanitize(report.decontaminationSteps[i]), 155);
      doc.text(stepLines, 38, py);
      py += stepLines.length * 4 + 4;
    }

    // Prevention Calendar
    py = checkPage(doc, py, 30);
    py = sectionHeader(doc, py, "12-MONTH PREVENTION CALENDAR", ">>>");
    for (const p of report.preventionCalendar) {
      py = checkPage(doc, py, 10);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.primary);
      doc.text(sanitize(p.month), 20, py);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.text);
      const pLines = doc.splitTextToSize(sanitize(p.task), 140);
      doc.text(pLines, 55, py);
      py += pLines.length * 4.5 + 3;
    }
  }

  // ===== FOOTER on every page =====
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    // Footer bar
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 287, 210, 10, "F");
    // Gold accent line above footer
    doc.setFillColor(...COLORS.accent);
    doc.rect(0, 286.5, 210, 0.5, "F");

    doc.setTextColor(180, 200, 190);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("MiceGoneGuide.com -- Professional-grade mouse elimination guidance", 105, 292, { align: "center" });
    doc.text(`Page ${i} of ${pageCount}`, 195, 292, { align: "right" });

    // Make footer URL clickable
    doc.link(40, 289, 130, 8, { url: "https://micegoneguide.com" });
  }

  return doc;
}
