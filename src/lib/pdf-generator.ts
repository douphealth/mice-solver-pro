import jsPDF from "jspdf";
import { ReportData } from "./report-generator";

const C = {
  primary: [22, 58, 36] as [number, number, number],
  primaryLight: [35, 85, 55] as [number, number, number],
  gold: [195, 155, 55] as [number, number, number],
  goldLight: [245, 235, 210] as [number, number, number],
  dark: [20, 25, 22] as [number, number, number],
  text: [35, 42, 38] as [number, number, number],
  muted: [110, 120, 115] as [number, number, number],
  light: [248, 246, 240] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  red: [190, 55, 55] as [number, number, number],
  redBg: [255, 242, 242] as [number, number, number],
  yellow: [195, 150, 35] as [number, number, number],
  green: [40, 130, 70] as [number, number, number],
  greenBg: [238, 248, 242] as [number, number, number],
  blue: [30, 80, 150] as [number, number, number],
  cardBg: [252, 251, 248] as [number, number, number],
  divider: [225, 222, 215] as [number, number, number],
};

function sanitize(text: string): string {
  return text
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
    .replace(/\u2014/g, "--")
    .replace(/\u2013/g, "-")
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\u201C|\u201D/g, '"')
    .replace(/\u2022/g, "-")
    .replace(/\u00BC/g, "1/4")
    .replace(/\u00BD/g, "1/2")
    .replace(/\u00BE/g, "3/4")
    .replace(/\u2026/g, "...")
    .replace(/\u00A0/g, " ")
    .trim();
}

const PAGE_H = 285;
const MARGIN_L = 18;
const MARGIN_R = 192;
const CONTENT_W = MARGIN_R - MARGIN_L;

function checkPage(doc: jsPDF, y: number, needed: number = 30): number {
  if (y + needed > PAGE_H - 15) {
    doc.addPage();
    return 22;
  }
  return y;
}

function drawCoverPage(doc: jsPDF, report: ReportData) {
  // Full dark green cover
  doc.setFillColor(...C.primary);
  doc.rect(0, 0, 210, 297, "F");

  // Subtle diagonal pattern overlay
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.1);
  for (let i = -20; i < 40; i++) {
    doc.line(i * 12, 0, i * 12 + 297, 297);
  }

  // Gold accent band
  doc.setFillColor(...C.gold);
  doc.rect(0, 0, 210, 4, "F");

  // Brand name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("MICEGONEGUIDE.COM", 105, 40, { align: "center" });
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 210, 190);
  doc.text("Professional Rodent Elimination Intelligence", 105, 47, { align: "center" });

  // Decorative line
  doc.setDrawColor(...C.gold);
  doc.setLineWidth(0.8);
  doc.line(60, 55, 150, 55);

  // Main title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text("MOUSE PROBLEM", 105, 90, { align: "center" });
  doc.text("DIAGNOSTIC REPORT", 105, 105, { align: "center" });

  // Subtitle
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(170, 200, 180);
  doc.text("AI-Powered Infestation Analysis & Action Plan", 105, 120, { align: "center" });

  // Severity badge — large centered
  const badgeColor = report.severity <= 3 ? C.green : report.severity <= 6 ? C.yellow : C.red;
  doc.setFillColor(...badgeColor);
  doc.roundedRect(55, 140, 100, 22, 11, 11, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`SEVERITY: ${report.severity}/10`, 105, 150, { align: "center" });
  doc.setFontSize(9);
  doc.text(sanitize(report.severityLabel).toUpperCase(), 105, 157, { align: "center" });

  // Key metrics cards
  const metrics = [
    { label: "SPECIES", value: sanitize(report.species.name) },
    { label: "POPULATION EST.", value: `${report.estimatedPopulation.min}-${report.estimatedPopulation.max} mice` },
    { label: "ACT WITHIN", value: `${report.urgencyDays} days` },
    { label: "30-DAY PROJECTION", value: `${report.populationIn30Days.min}-${report.populationIn30Days.max} mice` },
  ];

  let my = 178;
  doc.setFillColor(30, 65, 42);
  doc.roundedRect(30, my, 150, 60, 5, 5, "F");

  metrics.forEach((m, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const mx = 40 + col * 72;
    const mmy = my + 12 + row * 26;
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 185, 165);
    doc.text(m.label, mx, mmy);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(m.value, mx, mmy + 8);
  });

  // Date
  const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(130, 165, 145);
  doc.text(`Report generated: ${dateStr}`, 105, 258, { align: "center" });

  // Disclaimer
  doc.setFontSize(6.5);
  doc.setTextColor(100, 135, 115);
  doc.text("This report is for informational purposes. For severe infestations, consult a licensed professional.", 105, 268, { align: "center" });

  // Bottom gold bar
  doc.setFillColor(...C.gold);
  doc.rect(0, 293, 210, 4, "F");
}

function sectionHeader(doc: jsPDF, y: number, title: string, number: string): number {
  y = checkPage(doc, y, 20);
  // Gold left accent bar + dark header
  doc.setFillColor(...C.primary);
  doc.roundedRect(MARGIN_L, y, CONTENT_W, 11, 2, 2, "F");
  doc.setFillColor(...C.gold);
  doc.roundedRect(MARGIN_L, y, 4, 11, 1, 1, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(`${number}  ${sanitize(title)}`, MARGIN_L + 8, y + 7.5);
  return y + 16;
}

function textBlock(doc: jsPDF, text: string, x: number, y: number, maxW: number, fontSize: number = 8.5): number {
  doc.setFontSize(fontSize);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.text);
  const lines = doc.splitTextToSize(sanitize(text), maxW);
  doc.text(lines, x, y);
  return y + lines.length * (fontSize * 0.48) + 3;
}

function card(doc: jsPDF, y: number, height: number, opts?: { border?: [number, number, number]; bg?: [number, number, number] }): void {
  doc.setFillColor(...(opts?.bg || C.cardBg));
  if (opts?.border) {
    doc.setDrawColor(...opts.border);
    doc.setLineWidth(0.4);
    doc.roundedRect(MARGIN_L, y, CONTENT_W, height, 3, 3, "FD");
    // Left accent
    doc.setFillColor(...opts.border);
    doc.roundedRect(MARGIN_L, y, 3.5, height, 1, 1, "F");
  } else {
    doc.setDrawColor(...C.divider);
    doc.setLineWidth(0.2);
    doc.roundedRect(MARGIN_L, y, CONTENT_W, height, 3, 3, "FD");
  }
}

function drawSeverityBarPremium(doc: jsPDF, x: number, y: number, width: number, score: number) {
  const segW = (width - 18) / 10;
  for (let i = 0; i < 10; i++) {
    const color = i < 3 ? C.green : i < 7 ? C.yellow : C.red;
    if (i < score) {
      doc.setFillColor(...color);
    } else {
      doc.setFillColor(235, 233, 228);
    }
    const sx = x + i * (segW + 2);
    doc.roundedRect(sx, y, segW, 10, 2, 2, "F");

    // Number inside each segment
    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(i < score ? 255 : 180, i < score ? 255 : 180, i < score ? 255 : 178);
    doc.text(String(i + 1), sx + segW / 2, y + 6.5, { align: "center" });
  }
  // Labels
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.green);
  doc.text("LOW", x, y + 16);
  doc.setTextColor(...C.yellow);
  doc.text("MODERATE", x + width / 2, y + 16, { align: "center" });
  doc.setTextColor(...C.red);
  doc.text("SEVERE", x + width, y + 16, { align: "right" });
}

function addLink(doc: jsPDF, text: string, url: string, x: number, y: number, fontSize: number = 8) {
  doc.setFontSize(fontSize);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.blue);
  doc.text(text, x, y);
  const tw = doc.getTextWidth(text);
  doc.setDrawColor(...C.blue);
  doc.setLineWidth(0.15);
  doc.line(x, y + 0.5, x + tw, y + 0.5);
  doc.link(x, y - 3, tw, 5, { url });
}

export function generatePDF(report: ReportData, isPro: boolean = false): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // ===== PAGE 1: COVER =====
  drawCoverPage(doc, report);

  // ===== PAGE 2: SEVERITY & SPECIES =====
  doc.addPage();
  let y = 18;

  // Page header
  doc.setFillColor(...C.light);
  doc.rect(0, 0, 210, 12, "F");
  doc.setFillColor(...C.gold);
  doc.rect(0, 11.5, 210, 0.5, "F");
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.muted);
  doc.text("MICEGONEGUIDE.COM", MARGIN_L, 7);
  doc.text("DIAGNOSTIC REPORT", MARGIN_R, 7, { align: "right" });

  // SECTION 1: SEVERITY
  y = sectionHeader(doc, y, "INFESTATION SEVERITY ANALYSIS", "01");
  drawSeverityBarPremium(doc, MARGIN_L + 5, y, CONTENT_W - 10, report.severity);
  y += 22;

  y = textBlock(doc, report.severityDescription, MARGIN_L + 2, y, CONTENT_W - 4, 9);
  y += 2;

  // Population estimate cards (side by side)
  const cardW = (CONTENT_W - 4) / 2;
  y = checkPage(doc, y, 26);

  // Current population card
  doc.setFillColor(...C.greenBg);
  doc.setDrawColor(...C.green);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN_L, y, cardW, 22, 3, 3, "FD");
  doc.setFillColor(...C.green);
  doc.roundedRect(MARGIN_L, y, 3.5, 22, 1, 1, "F");
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.green);
  doc.text("ESTIMATED CURRENT POPULATION", MARGIN_L + 8, y + 6);
  doc.setFontSize(16);
  doc.setTextColor(...C.dark);
  doc.text(`${report.estimatedPopulation.min}-${report.estimatedPopulation.max}`, MARGIN_L + 8, y + 16);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.muted);
  doc.text("mice", MARGIN_L + 42, y + 16);

  // 30-day projection card
  const rx = MARGIN_L + cardW + 4;
  doc.setFillColor(...C.redBg);
  doc.setDrawColor(...C.red);
  doc.roundedRect(rx, y, cardW, 22, 3, 3, "FD");
  doc.setFillColor(...C.red);
  doc.roundedRect(rx, y, 3.5, 22, 1, 1, "F");
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.red);
  doc.text("30-DAY PROJECTION (NO ACTION)", rx + 8, y + 6);
  doc.setFontSize(16);
  doc.setTextColor(...C.dark);
  doc.text(`${report.populationIn30Days.min}-${report.populationIn30Days.max}`, rx + 8, y + 16);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.muted);
  doc.text("mice", rx + 42, y + 16);

  y += 28;

  // Urgency callout
  y = checkPage(doc, y, 16);
  doc.setFillColor(255, 248, 235);
  doc.setDrawColor(...C.gold);
  doc.setLineWidth(0.5);
  doc.roundedRect(MARGIN_L, y, CONTENT_W, 13, 3, 3, "FD");
  doc.setFillColor(...C.gold);
  doc.roundedRect(MARGIN_L, y, 3.5, 13, 1, 1, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.dark);
  doc.text(`ACTION RECOMMENDED WITHIN ${report.urgencyDays} DAYS`, MARGIN_L + 8, y + 5.5);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.muted);
  doc.text("Mice can reproduce every 19-21 days. Early action prevents exponential growth.", MARGIN_L + 8, y + 10.5);
  y += 18;

  // SECTION 2: SPECIES ID
  y = sectionHeader(doc, y, "RODENT SPECIES IDENTIFICATION", "02");

  // Species name card
  y = checkPage(doc, y, 40);
  doc.setFillColor(...C.cardBg);
  doc.setDrawColor(...C.divider);
  doc.setLineWidth(0.2);
  doc.roundedRect(MARGIN_L, y, CONTENT_W, 16, 3, 3, "FD");
  doc.setFillColor(...C.primary);
  doc.roundedRect(MARGIN_L, y, 3.5, 16, 1, 1, "F");

  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.dark);
  doc.text(sanitize(report.species.name), MARGIN_L + 8, y + 7);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...C.muted);
  doc.text(sanitize(report.species.scientificName), MARGIN_L + 8, y + 12.5);

  // "Confirmed" badge
  doc.setFillColor(...C.green);
  doc.roundedRect(MARGIN_R - 30, y + 3, 28, 7, 3, 3, "F");
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("IDENTIFIED", MARGIN_R - 16, y + 8, { align: "center" });

  y += 20;

  y = textBlock(doc, report.species.description, MARGIN_L + 2, y, CONTENT_W - 4, 8.5);
  y += 2;

  // Species detail cards
  const specDetails = [
    { label: "BEHAVIORAL PROFILE", value: report.species.behavior },
    { label: "DIETARY HABITS", value: report.species.diet },
    { label: "REPRODUCTION RATE", value: report.species.reproductionRate },
  ];
  for (const d of specDetails) {
    y = checkPage(doc, y, 18);
    const val = sanitize(d.value);
    const lines = doc.splitTextToSize(val, CONTENT_W - 16);
    const h = lines.length * 4 + 9;
    card(doc, y, h, { border: C.primaryLight });
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.primaryLight);
    doc.text(d.label, MARGIN_L + 8, y + 5.5);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.text);
    doc.text(lines, MARGIN_L + 8, y + 10);
    y += h + 3;
  }

  // ===== PAGE 3: HEALTH RISKS & ENTRY POINTS =====
  doc.addPage();
  y = 18;
  // Page header
  doc.setFillColor(...C.light);
  doc.rect(0, 0, 210, 12, "F");
  doc.setFillColor(...C.gold);
  doc.rect(0, 11.5, 210, 0.5, "F");
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.muted);
  doc.text("MICEGONEGUIDE.COM", MARGIN_L, 7);
  doc.text("DIAGNOSTIC REPORT", MARGIN_R, 7, { align: "right" });

  // SECTION 3: HEALTH RISKS
  y = sectionHeader(doc, y, "HEALTH RISK ASSESSMENT", "03");
  for (const risk of report.healthRisks) {
    y = checkPage(doc, y, 14);
    const clean = sanitize(risk);
    const isHigh = risk.includes("HIGH RISK") || risk.includes("CRITICAL");
    const lines = doc.splitTextToSize(clean, CONTENT_W - 18);
    const h = lines.length * 4 + 6;
    card(doc, y, h, { border: isHigh ? C.red : undefined, bg: isHigh ? C.redBg : C.cardBg });
    doc.setFontSize(8);
    doc.setFont("helvetica", isHigh ? "bold" : "normal");
    doc.setTextColor(...(isHigh ? C.red : C.text));
    doc.text(lines, MARGIN_L + 8, y + 5);
    y += h + 3;
  }

  // SECTION 4: ENTRY POINTS
  y += 3;
  y = sectionHeader(doc, y, "PROBABLE ENTRY POINTS", "04");
  for (let i = 0; i < report.entryPoints.length; i++) {
    y = checkPage(doc, y, 10);
    // Numbered circle
    doc.setFillColor(...C.gold);
    doc.circle(MARGIN_L + 5, y + 1, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(String(i + 1), MARGIN_L + 5, y + 2.5, { align: "center" });

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.text);
    const epLines = doc.splitTextToSize(sanitize(report.entryPoints[i]), CONTENT_W - 18);
    doc.text(epLines, MARGIN_L + 14, y + 1.5);
    y += epLines.length * 4.5 + 4;
  }

  // ===== PAGE 4: IMMEDIATE ACTIONS & RESOURCES =====
  doc.addPage();
  y = 18;
  doc.setFillColor(...C.light);
  doc.rect(0, 0, 210, 12, "F");
  doc.setFillColor(...C.gold);
  doc.rect(0, 11.5, 210, 0.5, "F");
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.muted);
  doc.text("MICEGONEGUIDE.COM", MARGIN_L, 7);
  doc.text("DIAGNOSTIC REPORT", MARGIN_R, 7, { align: "right" });

  // SECTION 5: ACTIONS
  y = sectionHeader(doc, y, "3 THINGS TO DO TONIGHT", "05");

  for (let i = 0; i < report.immediateActions.length; i++) {
    y = checkPage(doc, y, 22);
    const actionText = sanitize(report.immediateActions[i]);
    const lines = doc.splitTextToSize(actionText, CONTENT_W - 22);
    const h = lines.length * 4.2 + 8;

    // Card
    doc.setFillColor(255, 252, 245);
    doc.setDrawColor(...C.gold);
    doc.setLineWidth(0.4);
    doc.roundedRect(MARGIN_L, y, CONTENT_W, h, 3, 3, "FD");

    // Big number
    doc.setFillColor(...C.gold);
    doc.roundedRect(MARGIN_L + 3, y + 3, 14, 14, 7, 7, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(String(i + 1), MARGIN_L + 10, y + 12.5, { align: "center" });

    // Action text
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.text);
    doc.text(lines, MARGIN_L + 22, y + 6);
    y += h + 4;
  }

  // SECTION 6: EXPERT RESOURCES
  y += 4;
  y = sectionHeader(doc, y, "EXPERT RESOURCES FROM MICEGONEGUIDE", "06");

  const resources = [
    {
      title: "Complete Mouse Identification Guide",
      desc: "Learn to identify species, read droppings, and understand behavior patterns specific to your region.",
      url: "https://micegoneguide.com/mouse-identification-guide/",
    },
    {
      title: "How to Mouse-Proof Your Home (Step-by-Step)",
      desc: "Professional-grade sealing guide with exact product recommendations and contractor-level DIY techniques.",
      url: "https://micegoneguide.com/mouse-proof-your-home/",
    },
    {
      title: "Safe Cleanup & CDC Decontamination Protocol",
      desc: "CDC-aligned procedures to safely clean mouse-contaminated areas and protect your family's health.",
      url: "https://micegoneguide.com/mouse-droppings-cleanup/",
    },
  ];

  for (const res of resources) {
    y = checkPage(doc, y, 20);
    doc.setFillColor(...C.cardBg);
    doc.setDrawColor(...C.primaryLight);
    doc.setLineWidth(0.3);
    doc.roundedRect(MARGIN_L, y, CONTENT_W, 18, 3, 3, "FD");
    doc.setFillColor(...C.primaryLight);
    doc.roundedRect(MARGIN_L, y, 3.5, 18, 1, 1, "F");

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.dark);
    doc.text(res.title, MARGIN_L + 8, y + 6.5);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.muted);
    doc.text(res.desc, MARGIN_L + 8, y + 11.5);

    // Clickable "Visit Guide" link
    doc.setTextColor(...C.blue);
    doc.setFontSize(7);
    doc.text("Visit Guide >>", MARGIN_R - 28, y + 6.5);
    doc.link(MARGIN_L, y, CONTENT_W, 18, { url: res.url });

    y += 22;
  }

  // ===== WHAT'S NOT IN THIS REPORT (PRO TEASER) =====
  if (!isPro) {
    y = checkPage(doc, y, 55);
    y += 4;

    // Premium upgrade box
    doc.setFillColor(255, 252, 242);
    doc.setDrawColor(...C.gold);
    doc.setLineWidth(1.2);
    doc.roundedRect(MARGIN_L - 2, y, CONTENT_W + 4, 55, 5, 5, "FD");

    // Gold header bar inside
    doc.setFillColor(...C.gold);
    doc.roundedRect(MARGIN_L + 2, y + 4, CONTENT_W - 4, 12, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("UNLOCK YOUR COMPLETE ELIMINATION MASTERPLAN", 105, y + 12, { align: "center" });

    // Feature list
    const proFeatures = [
      "Room-by-room elimination strategy tailored to YOUR home",
      "Exact product shopping list with recommendations",
      "Day-by-day 30-day elimination timeline",
      "CDC-aligned decontamination protocol",
      "12-month prevention calendar",
      "Pro branded PDF with everything included",
    ];
    let fy = y + 21;
    for (const feat of proFeatures) {
      doc.setFillColor(...C.green);
      doc.circle(MARGIN_L + 8, fy, 1.2, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.text);
      doc.text(feat, MARGIN_L + 14, fy + 1);
      fy += 5;
    }

    // CTA button
    doc.setFillColor(...C.gold);
    doc.roundedRect(55, y + 53 - 5, 100, 11, 5, 5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Upgrade for $9.99 -- One-Time", 105, y + 53 + 2, { align: "center" });
    doc.link(55, y + 53 - 5, 100, 11, { url: "https://app.micegoneguide.com/quiz" });
  }

  // ===== PRO CONTENT =====
  if (isPro) {
    doc.addPage();
    let py = 18;

    // Pro header
    doc.setFillColor(...C.gold);
    doc.rect(0, 0, 210, 14, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("PRO ELIMINATION MASTERPLAN", 105, 9, { align: "center" });

    // Room-by-Room
    py = sectionHeader(doc, py, "ROOM-BY-ROOM ELIMINATION STRATEGY", "P1");
    for (const s of report.roomByRoomStrategy) {
      py = checkPage(doc, py, 16);
      const lines = doc.splitTextToSize(sanitize(s), CONTENT_W - 14);
      const h = lines.length * 4 + 6;
      card(doc, py, h, { border: C.primaryLight });
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.text);
      doc.text(lines, MARGIN_L + 8, py + 5);
      py += h + 3;
    }

    // Shopping List
    py = checkPage(doc, py, 20);
    py = sectionHeader(doc, py, "PERSONALIZED SHOPPING LIST", "P2");
    for (const item of report.shoppingList) {
      py = checkPage(doc, py, 12);
      doc.setFillColor(...C.green);
      doc.circle(MARGIN_L + 5, py + 1, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(6);
      doc.setFont("helvetica", "bold");
      doc.text("$", MARGIN_L + 5, py + 2.5, { align: "center" });

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C.dark);
      doc.text(sanitize(item.name), MARGIN_L + 12, py + 1);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.muted);
      doc.text(sanitize(item.reason), MARGIN_L + 12, py + 6);
      py += 11;
    }

    // Timeline
    py = checkPage(doc, py, 20);
    py = sectionHeader(doc, py, "30-DAY ELIMINATION TIMELINE", "P3");
    for (const t of report.eliminationTimeline) {
      py = checkPage(doc, py, 14);
      // Day badge
      doc.setFillColor(...C.primary);
      const dayText = sanitize(t.day);
      const dayW = Math.max(doc.getTextWidth(dayText) * 1.3 + 6, 28);
      doc.roundedRect(MARGIN_L, py, dayW, 7, 2, 2, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(dayText, MARGIN_L + 3, py + 5);

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.text);
      const tLines = doc.splitTextToSize(sanitize(t.action), CONTENT_W - dayW - 8);
      doc.text(tLines, MARGIN_L + dayW + 4, py + 5);
      py += tLines.length * 4.5 + 5;
    }

    // Decontamination
    py = checkPage(doc, py, 20);
    py = sectionHeader(doc, py, "CDC-ALIGNED DECONTAMINATION PROTOCOL", "P4");
    for (let i = 0; i < report.decontaminationSteps.length; i++) {
      py = checkPage(doc, py, 12);
      doc.setFillColor(...C.red);
      doc.circle(MARGIN_L + 5, py + 1.5, 3, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text(String(i + 1), MARGIN_L + 5, py + 3, { align: "center" });

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.text);
      const lines = doc.splitTextToSize(sanitize(report.decontaminationSteps[i]), CONTENT_W - 18);
      doc.text(lines, MARGIN_L + 14, py + 2);
      py += lines.length * 4 + 4;
    }

    // Prevention Calendar
    py = checkPage(doc, py, 20);
    py = sectionHeader(doc, py, "12-MONTH PREVENTION CALENDAR", "P5");
    for (const p of report.preventionCalendar) {
      py = checkPage(doc, py, 12);
      doc.setFillColor(...C.primary);
      doc.roundedRect(MARGIN_L, py, 22, 7, 2, 2, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(sanitize(p.month).substring(0, 3).toUpperCase(), MARGIN_L + 11, py + 5, { align: "center" });

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.text);
      const pLines = doc.splitTextToSize(sanitize(p.task), CONTENT_W - 30);
      doc.text(pLines, MARGIN_L + 26, py + 5);
      py += pLines.length * 4.5 + 4;
    }
  }

  // ===== FOOTER on every page =====
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    if (i === 1) continue; // Cover has its own footer

    doc.setFillColor(...C.primary);
    doc.rect(0, 288, 210, 9, "F");
    doc.setFillColor(...C.gold);
    doc.rect(0, 287.5, 210, 0.5, "F");

    doc.setTextColor(170, 195, 180);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.text("MiceGoneGuide.com -- Professional-Grade Mouse Elimination Intelligence", 105, 293, { align: "center" });
    doc.text(`Page ${i} of ${pageCount}`, MARGIN_R, 293, { align: "right" });
    doc.link(40, 289, 130, 8, { url: "https://micegoneguide.com" });
  }

  return doc;
}
