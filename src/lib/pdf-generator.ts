import jsPDF from "jspdf";
import { ReportData } from "./report-generator";
import { QuizAnswers, quizSteps } from "./quiz-data";

/* ============================================================================
   MiceGoneGuide — Premium Elimination Blueprint PDF
   A modern, print-efficient, vector-only report design system.
   Cover + closing are full-bleed; content pages stay light for cheap printing.
   ============================================================================ */

type RGB = [number, number, number];

const C = {
  forest: [18, 46, 29] as RGB,       // deep brand green
  forestDeep: [11, 30, 19] as RGB,   // cover background
  emerald: [27, 107, 60] as RGB,
  gold: [198, 154, 42] as RGB,
  goldDeep: [150, 112, 26] as RGB,
  goldSoft: [247, 238, 212] as RGB,
  paper: [250, 248, 243] as RGB,
  ink: [24, 30, 27] as RGB,
  body: [54, 62, 58] as RGB,
  muted: [112, 119, 114] as RGB,
  line: [229, 225, 215] as RGB,
  white: [255, 255, 255] as RGB,
  danger: [176, 48, 40] as RGB,
  dangerBg: [253, 240, 238] as RGB,
  warn: [172, 122, 24] as RGB,
  warnBg: [253, 247, 232] as RGB,
  ok: [36, 120, 64] as RGB,
  okBg: [235, 246, 239] as RGB,
  blue: [33, 92, 158] as RGB,
  blueBg: [238, 243, 252] as RGB,
};

function severityColor(score: number): { fg: RGB; bg: RGB } {
  if (score <= 3) return { fg: C.ok, bg: C.okBg };
  if (score <= 6) return { fg: C.warn, bg: C.warnBg };
  return { fg: C.danger, bg: C.dangerBg };
}

/* ---------- text sanitation for built-in Helvetica (WinAnsi) ---------- */
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
    .replace(/\u2192/g, ">>")
    .replace(/\u2190/g, "<<")
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

/* ---------- page geometry ---------- */
const MARGIN_L = 18;
const MARGIN_R = 192;
const CONTENT_W = MARGIN_R - MARGIN_L; // 174
const BOTTOM = 272; // content must end above the footer band

/* ---------- per-run state (synchronous generation, so module scope is safe) ---------- */
interface TocEntry {
  num: string;
  title: string;
  page: number;
  tocY: number;
}
let tocEntries: TocEntry[] = [];
let tocPageNum = 0;

function checkPage(doc: jsPDF, y: number, needed = 30): number {
  if (y + needed > BOTTOM) {
    doc.addPage();
    drawTopBar(doc);
    return 22;
  }
  return y;
}

function drawTopBar(doc: jsPDF) {
  doc.setFillColor(...C.paper);
  doc.rect(0, 0, 210, 13, "F");
  doc.setFillColor(...C.gold);
  doc.rect(0, 12.6, 210, 0.6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  doc.text("MICEGONEGUIDE.COM", MARGIN_L, 8);
  doc.text("ELIMINATION BLUEPRINT", MARGIN_R, 8, { align: "right" });
}

/* ---------- typography helpers ---------- */
function h1(doc: jsPDF, text: string, x: number, y: number, size = 19): void {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(size);
  doc.setTextColor(...C.forest);
  doc.text(sanitize(text), x, y);
}

function bodyText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxW: number,
  size = 9
): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(size);
  doc.setTextColor(...C.body);
  const lines = doc.splitTextToSize(sanitize(text), maxW);
  doc.text(lines, x, y);
  return y + lines.length * size * 0.52 + 3;
}

function label(doc: jsPDF, text: string, x: number, y: number, color: RGB = C.muted, size = 7): void {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(size);
  doc.setTextColor(...color);
  doc.text(sanitize(text).toUpperCase(), x, y);
}

/* Wrap text at the exact size it will be rendered — measuring at one size
   and drawing at another is the classic jsPDF overflow bug. */
function wrapLines(
  doc: jsPDF,
  text: string,
  maxW: number,
  size: number,
  style: "normal" | "bold" = "normal"
): string[] {
  doc.setFont("helvetica", style);
  doc.setFontSize(size);
  return doc.splitTextToSize(sanitize(text), maxW);
}

/* ============================================================================
   GALLERY-EDITION ART SYSTEM
   Layered vector art for full-bleed pages: ghost rings, dot fields, ribbons,
   ghost numerals. All WinAnsi-safe, print-friendly.
   ============================================================================ */

/** Track pages that carry full-bleed art so footers skip them. */
let artPages = new Set<number>();
function markArtPage(doc: jsPDF): void {
  artPages.add(doc.getNumberOfPages());
}

function ghost(doc: jsPDF, opacity: number, fn: () => void): void {
  type G = { GState: new (o: object) => object; setGState: (g: object) => void };
  const api = doc as unknown as G;
  // PDF has separate fill vs stroke alpha — set both or stroked art stays solid
  api.setGState(new api.GState({ opacity, "stroke-opacity": opacity }));
  fn();
  api.setGState(new api.GState({ opacity: 1, "stroke-opacity": 1 }));
}

/** Concentric ring arcs radiating from a corner point — topographic feel. */
function ringField(
  doc: jsPDF,
  cx: number,
  cy: number,
  rings: number,
  step: number,
  color: RGB,
  opacity: number
): void {
  ghost(doc, opacity, () => {
    doc.setDrawColor(...color);
    for (let i = 1; i <= rings; i++) {
      doc.setLineWidth(i % 5 === 0 ? 0.55 : 0.28);
      doc.circle(cx, cy, i * step, "D");
    }
  });
}

/** Subtle dot grid over a region. */
function dotField(
  doc: jsPDF,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  gap: number,
  r: number,
  color: RGB,
  opacity: number
): void {
  ghost(doc, opacity, () => {
    doc.setFillColor(...color);
    for (let x = x0; x <= x1; x += gap) {
      for (let y = y0; y <= y1; y += gap) {
        doc.circle(x, y, r, "F");
      }
    }
  });
}

/** Diagonal gold ribbon sweeping across the page. */
function ribbon(
  doc: jsPDF,
  yBase: number,
  thickness: number,
  color: RGB,
  opacity: number
): void {
  ghost(doc, opacity, () => {
    doc.setFillColor(...color);
    // parallelogram: enters left edge below yBase, exits right edge above
    const ax = 0;
    const ay = yBase + 46;
    const bx = 210;
    const by = yBase - 30;
    doc.triangle(ax, ay, bx, by, bx, by + thickness, "F");
    doc.triangle(ax, ay, bx, by + thickness, ax, ay + thickness, "F");
  });
}

/** Giant ghost numeral (e.g. "01") anchored near the bottom of an art page. */
function ghostNumeral(doc: jsPDF, num: string, color: RGB, opacity: number): void {
  ghost(doc, opacity, () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(128);
    doc.setTextColor(...color);
    doc.text(num, 201, 272, { align: "right" });
  });
}

/** The signature full-bleed art backdrop used by cover, dividers, closing. */
function coverArt(doc: jsPDF): void {
  doc.setFillColor(...C.forestDeep);
  doc.rect(0, 0, 210, 297, "F");
  // topographic rings from top-right, dot field bottom-left, gold ribbon sweep
  ringField(doc, 218, -14, 10, 13, C.gold, 0.10);
  dotField(doc, 8, 208, 120, 290, 9, 0.55, C.gold, 0.10);
  ribbon(doc, 150, 7, C.gold, 0.10);
  ribbon(doc, 162, 1.6, C.gold, 0.28);
  // hairline frame
  doc.setDrawColor(...C.gold);
  doc.setLineWidth(0.9);
  doc.rect(11, 11, 188, 275, "D");
  doc.setDrawColor(...C.goldDeep);
  doc.setLineWidth(0.3);
  doc.rect(14.5, 14.5, 181, 268, "D");
}

/** Editorial drop-cap paragraph: oversized first letter spanning ~3 lines. */
function dropCapPara(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxW: number,
  size = 9.2
): number {
  const clean = sanitize(text);
  const first = clean.charAt(0);
  const rest = clean.slice(1);
  const capSize = size * 2.2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(capSize);
  doc.setTextColor(...C.forest);
  // cap top aligns with the first line's cap top; baseline follows from cap height
  const capTop = y - size * 0.72;
  doc.text(first, x, capTop + capSize * 0.72);
  const indent = doc.getTextWidth(first) + 2.4;
  const lineH = size * 0.52;
  const firstLines = wrapLines(doc, rest, maxW - indent, size, "normal");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(size);
  doc.setTextColor(...C.body);
  const indentedCount = Math.min(3, firstLines.length);
  doc.text(firstLines.slice(0, indentedCount), x + indent, y);
  const tail = firstLines.slice(indentedCount);
  if (tail.length > 0) {
    const tailLines = wrapLines(doc, tail.join(" "), maxW, size, "normal");
    doc.text(tailLines, x, y + indentedCount * lineH);
    return y + indentedCount * lineH + tailLines.length * lineH + 3;
  }
  return y + indentedCount * lineH + 3;
}

/** Small filled diamond marker (drawn as two triangles). */
function diamond(doc: jsPDF, cx: number, cy: number, s: number, color: RGB): void {
  doc.setFillColor(...color);
  doc.triangle(cx - s, cy, cx, cy - s, cx + s, cy, "F");
  doc.triangle(cx - s, cy, cx + s, cy, cx, cy + s, "F");
}

/** Gold rule with a center diamond — section ornament for content pages. */
function goldDivider(doc: jsPDF, y: number, x0 = MARGIN_L + 30, x1 = MARGIN_R - 30): number {  doc.setDrawColor(...C.gold);
  doc.setLineWidth(0.7);
  const mid = (x0 + x1) / 2;
  doc.line(x0, y, mid - 7, y);
  doc.line(mid + 7, y, x1, y);
  diamond(doc, mid, y, 2.6, C.gold);
  return y + 6;
}

/** Donut gauge: dotted arc in zone colors, needle, score medallion below. */
function donutGauge(doc: jsPDF, cx: number, cy: number, r: number, score: number): void {
  const dots = 72;
  for (let i = 0; i < dots; i++) {
    // semicircle from 180deg (left) to 0deg (right), over the top
    const ang = Math.PI - (i / (dots - 1)) * Math.PI;
    const x = cx + r * Math.cos(ang);
    const y = cy - r * Math.sin(ang);
    const seg = Math.round(((Math.PI - ang) / Math.PI) * 10);
    const zone: RGB = seg <= 3 ? C.ok : seg <= 7 ? C.warn : C.danger;
    const filled = seg <= score && seg >= 1;
    doc.setFillColor(...(filled ? zone : C.line));
    doc.circle(x, y, filled ? 2.5 : 1.7, "F");
  }
  // needle
  const sc = severityColor(score);
  const nAng = Math.PI - (Math.max(1, Math.min(10, score)) / 10) * Math.PI;
  doc.setDrawColor(...sc.fg);
  doc.setLineWidth(1.6);
  doc.line(cx, cy, cx + (r - 7) * Math.cos(nAng), cy - (r - 7) * Math.sin(nAng));
  doc.setFillColor(...sc.fg);
  doc.circle(cx, cy, 3, "F");
  // score medallion, clear of the arc
  const my = cy + r + 15;
  doc.setFillColor(...C.white);
  doc.circle(cx, my, 11, "F");
  doc.setDrawColor(...sc.fg);
  doc.setLineWidth(1.2);
  doc.circle(cx, my, 11, "D");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11.5);
  doc.setTextColor(...sc.fg);
  doc.text(`${score}/10`, cx, my + 4, { align: "center" });
}

/* ---------- cards & callouts ---------- */
interface CardOpts {
  bg?: RGB;
  border?: RGB;
  accent?: RGB;
  pad?: number;
  x?: number;
  w?: number;
}

function card(doc: jsPDF, y: number, h: number, opts: CardOpts = {}): void {
  const pad = opts.pad ?? 0;
  const x = opts.x ?? MARGIN_L + pad;
  const w = opts.w ?? CONTENT_W - pad * 2;
  doc.setFillColor(...(opts.bg || C.white));
  if (opts.border) {
    doc.setDrawColor(...opts.border);
    doc.setLineWidth(0.4);
    doc.roundedRect(x, y, w, h, 3, 3, "FD");
  } else {
    doc.setDrawColor(...C.line);
    doc.setLineWidth(0.25);
    doc.roundedRect(x, y, w, h, 3, 3, "FD");
  }
  if (opts.accent) {
    doc.setFillColor(...opts.accent);
    doc.roundedRect(x, y, 3.5, h, 1.2, 1.2, "F");
  }
}

function measureCardH(doc: jsPDF, titleSize: number, lines: string[], lineH: number, topPad = 6, gap = 5): number {
  void titleSize;
  return topPad + gap + lines.length * lineH + 4;
}

function infoCard(
  doc: jsPDF,
  y: number,
  kicker: string,
  kickerColor: RGB,
  body: string,
  accent: RGB
): number {
  const lines = wrapLines(doc, body, CONTENT_W - 18, 8.6);
  const h = measureCardH(doc, 7, lines, 4.4);
  y = checkPage(doc, y, h + 4);
  card(doc, y, h, { accent, border: C.line });
  label(doc, kicker, MARGIN_L + 9, y + 6.5, kickerColor, 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.6);
  doc.setTextColor(...C.body);
  doc.text(lines, MARGIN_L + 9, y + 12);
  return y + h + 4;
}

function factCallout(doc: jsPDF, y: number, fact: string, source: string): number {
  const lines = wrapLines(doc, fact, CONTENT_W - 24, 8.6);
  const h = lines.length * 4.3 + 16;
  y = checkPage(doc, y, h + 4);
  card(doc, y, h, { bg: C.blueBg, border: C.blue, accent: C.blue });
  // oversized decorative quotation mark
  ghost(doc, 0.16, () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(44);
    doc.setTextColor(...C.blue);
    doc.text('"', MARGIN_L + 9, y + 19);
  });
  label(doc, "Verified fact", MARGIN_L + 18, y + 6.5, C.blue, 7);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.6);
  doc.setTextColor(...C.body);
  doc.text(lines, MARGIN_L + 18, y + 12);
  doc.setFontSize(6.8);
  doc.setTextColor(...C.muted);
  doc.text(`Source: ${sanitize(source)}`, MARGIN_R - 6, y + h - 3.5, { align: "right" });
  return y + h + 5;
}

function checkbox(doc: jsPDF, x: number, y: number, size = 3.4): void {
  doc.setDrawColor(...C.muted);
  doc.setLineWidth(0.35);
  doc.roundedRect(x, y - size + 1, size, size, 0.8, 0.8, "D");
}

function addLink(doc: jsPDF, text: string, url: string, x: number, y: number, size = 8): void {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(size);
  doc.setTextColor(...C.blue);
  doc.text(sanitize(text), x, y);
  const tw = doc.getTextWidth(sanitize(text));
  doc.setDrawColor(...C.blue);
  doc.setLineWidth(0.2);
  doc.line(x, y + 1, x + tw, y + 1);
  doc.link(x, y - 3.5, tw, 6, { url });
}

/* ---------- section header (records TOC entry) ---------- */
function sectionHeader(
  doc: jsPDF,
  num: string,
  title: string,
  y: number,
  registerToc = true
): number {
  y = checkPage(doc, y, 22);
  const h = 11;
  doc.setFillColor(...C.forest);
  doc.roundedRect(MARGIN_L, y, CONTENT_W, h, 2.5, 2.5, "F");
  doc.setFillColor(...C.gold);
  doc.roundedRect(MARGIN_L, y, 4, h, 1.2, 1.2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...C.gold);
  doc.text(num, MARGIN_L + 8, y + 7.4);
  const numW = doc.getTextWidth(num);
  doc.setTextColor(...C.white);
  doc.text(sanitize(title).toUpperCase(), MARGIN_L + 8 + numW + 4, y + 7.4);
  if (registerToc) {
    tocEntries.push({ num, title: sanitize(title), page: doc.getNumberOfPages(), tocY: 0 });
  }
  return y + h + 6;
}

/* Full-bleed chapter opener: ghost numeral, gold rule, title, teaser.
   Registers its own TOC entry so contents point at the chapter start. */
function chapterDivider(
  doc: jsPDF,
  num: string,
  title: string,
  teaser: string
): void {
  doc.addPage();
  markArtPage(doc);
  coverArt(doc);
  ghostNumeral(doc, num, C.gold, 0.14);

  // eyebrow
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...C.gold);
  doc.text(`S E C T I O N   ${num}`, 105, 78, { align: "center" });

  // title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.setTextColor(...C.white);
  const lines = doc.splitTextToSize(sanitize(title).toUpperCase(), 160);
  doc.text(lines, 105, 104, { align: "center" });
  const titleBottom = 104 + (lines.length - 1) * 13;

  // gold rule + diamond
  const ry = titleBottom + 14;
  doc.setDrawColor(...C.gold);
  doc.setLineWidth(1);
  doc.line(60, ry, 96, ry);
  doc.line(114, ry, 150, ry);
  diamond(doc, 105, ry, 3, C.gold);

  // teaser
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(190, 208, 194);
  const tl = doc.splitTextToSize(sanitize(teaser), 130);
  doc.text(tl, 105, ry + 16, { align: "center" });

  // page hint
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.gold);
  doc.text("TURN THE PAGE  >>", 105, 258, { align: "center" });

  tocEntries.push({ num, title: sanitize(title), page: doc.getNumberOfPages(), tocY: 0 });
}

/* ---------- quiz answer labels for the diagnostic snapshot ---------- */
function answerLabels(answers: QuizAnswers | undefined): Map<string, string> {
  const map = new Map<string, string>();
  for (const step of quizSteps) {
    for (const opt of step.options || []) {
      map.set(`${step.id}:${opt.id}`, opt.label);
    }
  }
  void answers;
  return map;
}

function lookupLabels(answers: QuizAnswers, stepId: string, labels: Map<string, string>): string[] {
  const raw = answers[stepId];
  if (!raw) return [];
  const ids = Array.isArray(raw) ? raw : [raw];
  return ids
    .map((id) => (stepId === "zip" ? String(id) : labels.get(`${stepId}:${id}`) || String(id)))
    .filter(Boolean);
}

/* ============================================================================
   COVER
   ============================================================================ */
function drawCover(doc: jsPDF, report: ReportData): void {
  coverArt(doc);
  markArtPage(doc);

  // Eyebrow
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...C.gold);
  doc.text("M I C E G O N E G U I D E . C O M", 105, 34, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(168, 196, 178);
  doc.text("Professional Rodent Elimination Intelligence", 105, 41, { align: "center" });

  // Editorial title block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(168, 196, 178);
  doc.text("THE PERSONALIZED", 105, 66, { align: "center" });
  doc.setFontSize(37);
  doc.setTextColor(...C.white);
  doc.text("MOUSE ELIMINATION", 105, 84, { align: "center" });
  doc.setFontSize(37);
  doc.setTextColor(...C.gold);
  doc.text("BLUEPRINT", 105, 100, { align: "center" });

  // gold rule + diamond
  const ry = 110;
  doc.setDrawColor(...C.gold);
  doc.setLineWidth(1);
  doc.line(70, ry, 97, ry);
  doc.line(113, ry, 140, ry);
  diamond(doc, 105, ry, 2.8, C.gold);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(190, 210, 195);
  doc.text("Your diagnostic report, safety plan & action workbook --", 105, 122, { align: "center" });
  doc.text("built from your answers, ready to work tonight.", 105, 129, { align: "center" });

  // Severity medallion
  const sc = severityColor(report.severity);
  const mcx = 105;
  const mcy = 152;
  doc.setDrawColor(...C.gold);
  doc.setLineWidth(1.4);
  doc.circle(mcx, mcy, 24, "D");
  doc.setLineWidth(0.5);
  doc.circle(mcx, mcy, 20.5, "D");
  doc.setFillColor(...sc.fg);
  doc.circle(mcx, mcy, 18.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...C.white);
  doc.text(`${report.severity}/10`, mcx, mcy - 0.5, { align: "center" });
  doc.setFontSize(8);
  doc.text(sanitize(report.severityLabel).toUpperCase(), mcx, mcy + 8, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.gold);
  doc.text("INFESTATION SEVERITY", mcx, mcy + 30, { align: "center" });

  // Stat strip with hairline dividers
  const stats = [
    { k: "LIKELY SPECIES", v: sanitize(report.species.name) },
    { k: "EST. POPULATION", v: `${report.estimatedPopulation.min}-${report.estimatedPopulation.max}` },
    { k: "ACT WITHIN", v: `${report.urgencyDays} days` },
    { k: "30-DAY PROJECTION", v: `${report.populationIn30Days.min}-${report.populationIn30Days.max}` },
  ];
  const sy = 200;
  const colW = 168 / 4;
  doc.setDrawColor(70, 100, 80);
  doc.setLineWidth(0.4);
  stats.forEach((s, i) => {
    const cx = 21 + colW * i + colW / 2;
    if (i > 0) doc.line(21 + colW * i, sy - 4, 21 + colW * i, sy + 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...C.gold);
    doc.text(s.k, cx, sy, { align: "center" });
    doc.setFontSize(12);
    doc.setTextColor(...C.white);
    doc.text(s.v, cx, sy + 10, { align: "center" });
  });

  // Trust ribbons
  const ribbons = ["FACT-CHECKED", "CDC-ALIGNED", "EXPERT-REVIEWED"];
  const rw = 42;
  const gap = 5;
  const totalW = ribbons.length * rw + (ribbons.length - 1) * gap;
  let rx = 105 - totalW / 2;
  ribbons.forEach((r) => {
    doc.setDrawColor(...C.gold);
    doc.setLineWidth(0.5);
    doc.roundedRect(rx, 240, rw, 9, 4.5, 4.5, "D");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...C.gold);
    doc.text(r, rx + rw / 2, 246, { align: "center" });
    rx += rw + gap;
  });

  // Date + disclaimer
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(140, 170, 150);
  doc.text(`Report generated: ${dateStr}`, 105, 260, { align: "center" });
  doc.setFontSize(6.5);
  doc.setTextColor(105, 138, 118);
  doc.text(
    "For informational purposes. For severe infestations, consult a licensed professional.",
    105,
    267,
    { align: "center" }
  );

  doc.setFillColor(...C.gold);
  doc.rect(0, 293, 210, 4, "F");
}

/* ============================================================================
   EXECUTIVE SUMMARY (page 2)
   ============================================================================ */
function drawExecutiveSummary(doc: jsPDF, report: ReportData): void {
  doc.addPage();
  drawTopBar(doc);
  let y = 22;

  h1(doc, "Executive Summary", MARGIN_L, y);
  doc.setDrawColor(...C.gold);
  doc.setLineWidth(1);
  doc.line(MARGIN_L, y + 3.5, MARGIN_L + 58, y + 3.5);
  y += 13;

  y = dropCapPara(
    doc,
    `Based on your diagnostic answers, our analysis identified a ${sanitize(report.severityLabel).toLowerCase()} situation involving the ${sanitize(report.species.name)}. This blueprint turns that diagnosis into a practical plan: what to do tonight, how to seal entry points this week, and how to prove the problem is gone within 30 days.`,
    MARGIN_L,
    y,
    CONTENT_W,
    9.2
  );
  y += 3;

  // Three stat tiles
  const sc = severityColor(report.severity);
  const tiles = [
    { k: "SEVERITY SCORE", v: `${report.severity}/10`, s: sanitize(report.severityLabel), c: sc.fg },
    { k: "MICE NOW (EST.)", v: `${report.estimatedPopulation.min}-${report.estimatedPopulation.max}`, s: "in your home", c: C.forest },
    { k: "IN 30 DAYS", v: `${report.populationIn30Days.min}-${report.populationIn30Days.max}`, s: "if no action", c: C.danger },
  ];
  const tw = (CONTENT_W - 8) / 3;
  tiles.forEach((t, i) => {
    const tx = MARGIN_L + i * (tw + 4);
    doc.setFillColor(...t.c);
    doc.roundedRect(tx, y, tw, 30, 3, 3, "F");
    doc.setFillColor(...C.gold);
    doc.rect(tx + 6, y + 5, tw - 12, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(255, 255, 255);
    doc.text(t.k, tx + tw / 2, y + 11.5, { align: "center" });
    doc.setFontSize(18);
    doc.text(t.v, tx + tw / 2, y + 21.5, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(t.s, tx + tw / 2, y + 27, { align: "center" });
  });
  y += 38;

  y = factCallout(
    doc,
    y,
    "A single pair of mice can produce up to 150 offspring in a single year, and a female can have a new litter every three weeks. Acting within days -- not weeks -- is the single biggest factor in successful elimination.",
    "U.S. CDC & National Pest Management Association"
  );

  // How to use this report
  y = checkPage(doc, y, 46);
  y = goldDivider(doc, y + 2);
  h1(doc, "How to use this blueprint", MARGIN_L, y, 12);
  y += 8;
  const steps = [
    ["Tonight", "Work through Section 05: secure food, place traps on travel routes, wet-clean contamination."],
    ["This week", "Audit and seal entry points (Section 04 + Workbook W3). Keep trap pressure on."],
    ["30 days", "Follow the elimination map (Workbook W4) and log evidence until you hit the success criteria."],
  ];
  steps.forEach(([t, d], i) => {
    y = checkPage(doc, y, 14);
    doc.setFillColor(...C.gold);
    doc.circle(MARGIN_L + 4, y + 1, 3.2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.white);
    doc.text(String(i + 1), MARGIN_L + 4, y + 2.6, { align: "center" });
    doc.setFontSize(9);
    doc.setTextColor(...C.ink);
    doc.text(sanitize(t), MARGIN_L + 12, y + 1.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.6);
    doc.setTextColor(...C.body);
    const dl = doc.splitTextToSize(sanitize(d), CONTENT_W - 16);
    doc.text(dl, MARGIN_L + 12, y + 6.5);
    y += dl.length * 4.5 + 5;
  });
}

/* ============================================================================
   DIAGNOSTIC SNAPSHOT + TABLE OF CONTENTS (page 3)
   ============================================================================ */
function pill(doc: jsPDF, x: number, y: number, text: string, maxX: number): number {
  const t = sanitize(text);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.6);
  const w = Math.min(doc.getTextWidth(t) + 7, maxX - x);
  if (w < 12) return 0;
  doc.setFillColor(...C.goldSoft);
  doc.setDrawColor(...C.goldDeep);
  doc.setLineWidth(0.25);
  doc.roundedRect(x, y - 5, w, 7, 3.5, 3.5, "FD");
  doc.setTextColor(...C.body);
  let shown = t;
  // epsilon guards float rounding in getTextWidth so full-width pills don't
  // lose their last characters to a phantom overflow
  while (doc.getTextWidth(shown) > w - 7 + 0.75 && shown.length > 4) shown = shown.slice(0, -2);
  doc.text(shown, x + 3.5, y);
  return w + 3;
}

function snapshotRow(
  doc: jsPDF,
  y: number,
  rowLabel: string,
  items: string[]
): number {
  if (items.length === 0) return y;
  y = checkPage(doc, y, 14);
  label(doc, rowLabel, MARGIN_L, y, C.forest, 7.5);
  let x = MARGIN_L + 30;
  const lineY = y;
  for (const item of items) {
    const w = pill(doc, x, lineY, item, MARGIN_R);
    if (w === 0) {
      y += 10;
      y = checkPage(doc, y, 12);
      x = MARGIN_L + 30;
      const w2 = pill(doc, x, y, item, MARGIN_R);
      x += w2;
    } else {
      x += w;
      if (x > MARGIN_R - 20) {
        y += 10;
        y = checkPage(doc, y, 12);
        x = MARGIN_L + 30;
      }
    }
  }
  return y + 10;
}

function drawSnapshotAndTOC(doc: jsPDF, report: ReportData, answers?: QuizAnswers): void {
  void report;
  doc.addPage();
  drawTopBar(doc);
  tocPageNum = doc.getNumberOfPages();
  let y = 22;

  h1(doc, "Your Diagnostic Snapshot", MARGIN_L, y, 13);
  doc.setDrawColor(...C.gold);
  doc.setLineWidth(0.8);
  doc.line(MARGIN_L, y + 3.5, MARGIN_L + 52, y + 3.5);
  y += 12;

  if (answers) {
    const labels = answerLabels(answers);
    const rows: [string, string[]][] = [
      ["Signs", lookupLabels(answers, "evidence", labels)],
      ["Areas", lookupLabels(answers, "location", labels)],
      [
        "Home",
        [
          ...lookupLabels(answers, "home_type", labels),
          ...lookupLabels(answers, "home_age", labels),
          ...lookupLabels(answers, "surroundings", labels),
        ],
      ],
      [
        "Timeline",
        [...lookupLabels(answers, "timeline", labels), ...lookupLabels(answers, "season", labels)],
      ],
      [
        "Household",
        [
          ...lookupLabels(answers, "household", labels).filter((l) => !/no special/i.test(l)),
          ...lookupLabels(answers, "food_storage", labels),
        ],
      ],
      [
        "Tried",
        [
          ...lookupLabels(answers, "previous", labels).filter((l) => !/nothing yet/i.test(l)),
          ...lookupLabels(answers, "previous_results", labels),
        ],
      ],
    ];
    for (const [rl, items] of rows) {
      y = snapshotRow(doc, y, rl, items);
    }
    y += 2;
    y = bodyText(
      doc,
      "This is what your plan below is built on. If anything here looks wrong, retake the quiz and download a fresh blueprint.",
      MARGIN_L,
      y,
      CONTENT_W,
      8
    );
  } else {
    y = bodyText(
      doc,
      "Your personalized plan follows. Each section builds on your diagnostic answers.",
      MARGIN_L,
      y,
      CONTENT_W,
      8.6
    );
  }

  // Table of contents (page numbers filled in after layout)
  y += 4;
  y = checkPage(doc, y, 60);
  h1(doc, "Contents", MARGIN_L, y, 13);
  doc.setDrawColor(...C.gold);
  doc.setLineWidth(0.8);
  doc.line(MARGIN_L, y + 3.5, MARGIN_L + 30, y + 3.5);
  y += 12;

  const staticToc: [string, string][] = [
    ["01", "Infestation Severity Analysis"],
    ["02", "Rodent Species Identification"],
    ["03", "Health Risk Assessment"],
    ["04", "Probable Entry Points"],
    ["05", "Tonight's Action Plan"],
    ["06", "Expert Resources"],
  ];
  // Reserve rows; real entries are pushed by sectionHeader in order, so we
  // store the y positions here and match them by index later.
  const rowYs: number[] = [];
  for (const [num, title] of staticToc) {
    y = checkPage(doc, y, 10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...C.goldDeep);
    doc.text(num, MARGIN_L + 2, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.ink);
    doc.text(sanitize(title), MARGIN_L + 14, y);
    rowYs.push(y);
    y += 9;
  }
  // Workbook + pro rows appended dynamically at fill time if space allows;
  // store base for later.
  (doc as unknown as { __tocRowYs?: number[] }).__tocRowYs = rowYs;
  void staticToc;
}

function fillTOC(doc: jsPDF): void {
  if (!tocPageNum) return;
  const rowYs: number[] =
    (doc as unknown as { __tocRowYs?: number[] }).__tocRowYs || [];
  doc.setPage(tocPageNum);
  const n = Math.min(rowYs.length, tocEntries.length);
  for (let i = 0; i < n; i++) {
    const e = tocEntries[i];
    const y = rowYs[i];
    const titleW = doc.getTextWidth(sanitize(tocEntries[i].title));
    // dotted leader
    doc.setDrawColor(...C.line);
    doc.setLineWidth(0.3);
    const x0 = MARGIN_L + 14 + titleW + 4;
    const x1 = MARGIN_R - 12;
    if (x1 > x0) {
      for (let x = x0; x < x1; x += 2.4) {
        doc.circle(x, y - 1, 0.28, "F");
      }
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...C.forest);
    doc.text(String(e.page), MARGIN_R, y, { align: "right" });
  }
  // Extra rows: pro + workbook sections (compact, two columns if needed)
  let ey = rowYs.length ? rowYs[rowYs.length - 1] + 14 : 120;
  const extras = tocEntries.slice(n);
  if (extras.length > 0) {
    doc.setPage(tocPageNum);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C.muted);
    doc.text("ALSO INSIDE", MARGIN_L + 2, ey);
    ey += 7;
    for (const e of extras) {
      if (ey > BOTTOM - 6) break;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.goldDeep);
      doc.text(e.num, MARGIN_L + 2, ey);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.body);
      doc.text(sanitize(e.title), MARGIN_L + 14, ey);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C.forest);
      doc.text(String(e.page), MARGIN_R, ey, { align: "right" });
      ey += 8;
    }
  }
}

/* ============================================================================
   01 — SEVERITY
   ============================================================================ */
function drawSeverity(doc: jsPDF, report: ReportData): void {
  chapterDivider(doc, "01", "Infestation Severity Analysis", "How bad it is, what the number means, and how fast it grows.");
  doc.addPage();
  drawTopBar(doc);
  let y = 24;
  y = sectionHeader(doc, "01", "Infestation Severity Analysis", y, false);

  y = checkPage(doc, y, 40);
  label(doc, "Your score on the 10-point scale", MARGIN_L, y, C.forest, 7.5);
  y += 8;
  y = checkPage(doc, y, 100);
  // gauge card
  doc.setFillColor(...C.paper);
  doc.setDrawColor(...C.line);
  doc.setLineWidth(0.4);
  doc.roundedRect(MARGIN_L, y, CONTENT_W, 92, 4, 4, "FD");
  donutGauge(doc, 105, y + 30, 24, report.severity);
  // zone captions in a clean row
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...C.ok);
  doc.text("LOW 1-3", 58, y + 86, { align: "center" });
  doc.setTextColor(...C.warn);
  doc.text("MODERATE 4-7", 105, y + 86, { align: "center" });
  doc.setTextColor(...C.danger);
  doc.text("SEVERE 8-10", 152, y + 86, { align: "center" });
  y += 100;

  y = bodyText(doc, report.severityDescription, MARGIN_L + 2, y, CONTENT_W - 4, 9.2);
  y += 4;

  // Population cards
  const sc = severityColor(report.severity);
  y = checkPage(doc, y, 30);
  const cw = (CONTENT_W - 6) / 2;
  const cards: { k: string; v: string; u: string; fg: RGB; bg: RGB }[] = [
    { k: "ESTIMATED CURRENT POPULATION", v: `${report.estimatedPopulation.min}-${report.estimatedPopulation.max}`, u: "mice", fg: C.ok, bg: C.okBg },
    { k: "30-DAY PROJECTION (NO ACTION)", v: `${report.populationIn30Days.min}-${report.populationIn30Days.max}`, u: "mice", fg: C.danger, bg: C.dangerBg },
  ];
  cards.forEach((c, i) => {
    const cx = MARGIN_L + i * (cw + 6);
    card(doc, y, 24, { bg: c.bg, border: c.fg, accent: c.fg, x: cx, w: cw });
    label(doc, c.k, cx + 9, y + 6.5, c.fg, 6.8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.setTextColor(...C.ink);
    doc.text(c.v, cx + 9, y + 17.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.muted);
    doc.text(c.u, cx + 9 + doc.getTextWidth(c.v) + 3, y + 17.5);
  });
  y += 30;

  // Urgency banner (consistent with urgencyDays everywhere)
  y = checkPage(doc, y, 20);
  const uh = 15;
  card(doc, y, uh, { bg: C.warnBg, border: C.gold, accent: C.gold });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.ink);
  doc.text(
    `START WITHIN ${report.urgencyDays} ${report.urgencyDays === 1 ? "DAY" : "DAYS"} -- RECOMMENDED`,
    MARGIN_L + 9,
    y + 6.5
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text("Mice can reproduce every 19-21 days. Early action prevents exponential growth.", MARGIN_L + 9, y + 11.5);
  y += uh + 6;

  y = factCallout(
    doc,
    y,
    "Mice can squeeze through openings as small as 1/4 inch (6 mm) -- about the width of a pencil. Sealing entry points matters as much as trapping.",
    "U.S. CDC, Integrated Pest Management Guidance"
  );
}

/* ============================================================================
   02 — SPECIES
   ============================================================================ */
function drawSpecies(doc: jsPDF, report: ReportData): void {
  chapterDivider(doc, "02", "Rodent Species Identification", "Know your opponent -- behavior, nesting, and what it wants in your home.");
  doc.addPage();
  drawTopBar(doc);
  let y = 24;
  y = sectionHeader(doc, "02", "Rodent Species Identification", y, false);

  y = checkPage(doc, y, 30);
  card(doc, y, 19, { accent: C.forest });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...C.ink);
  doc.text(sanitize(report.species.name), MARGIN_L + 9, y + 8);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(...C.muted);
  doc.text(sanitize(report.species.scientificName), MARGIN_L + 9, y + 14);
  // Identified badge
  const bw = 30;
  doc.setFillColor(...C.ok);
  doc.roundedRect(MARGIN_R - bw - 2, y + 6, bw, 7.5, 3.5, 3.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(...C.white);
  doc.text("IDENTIFIED", MARGIN_R - bw / 2 - 2, y + 11.2, { align: "center" });
  y += 24;

  y = bodyText(doc, report.species.description, MARGIN_L + 2, y, CONTENT_W - 4, 9);
  y += 2;

  const details: [string, string, RGB][] = [
    ["Behavioral profile", report.species.behavior, C.forest],
    ["Dietary habits", report.species.diet, C.goldDeep],
    ["Reproduction rate", report.species.reproductionRate, C.danger],
  ];
  for (const [k, v, accent] of details) {
    y = infoCard(doc, y, k, accent, v, accent);
  }

  y = factCallout(
    doc,
    y,
    "Knowing the species changes trap placement: house mice hug walls near food, roof rats run high along rafters, and Norway rats burrow low near foundations. Place traps on the routes your species actually travels.",
    "MiceGoneGuide species behavior database"
  );
}

/* ============================================================================
   03 — HEALTH RISKS
   ============================================================================ */
function drawHealth(doc: jsPDF, report: ReportData): void {
  chapterDivider(doc, "03", "Health Risk Assessment", "What contamination in your home can do to your family -- and how to stay safe.");
  doc.addPage();
  drawTopBar(doc);
  let y = 24;
  y = sectionHeader(doc, "03", "Health Risk Assessment", y, false);

  // CDC safety strip — the single most important safety message
  y = checkPage(doc, y, 26);
  const sh = 21;
  card(doc, y, sh, { bg: C.dangerBg, border: C.danger, accent: C.danger });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...C.danger);
  doc.text("NEVER SWEEP OR VACUUM DRY DROPPINGS", MARGIN_L + 9, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.4);
  doc.setTextColor(...C.body);
  const sl = wrapLines(
    doc,
    "Dry sweeping aerosolizes pathogens. Always wet-clean: ventilate 30 min, wear gloves + mask, soak with disinfectant 5 minutes, wipe with paper towels.",
    CONTENT_W - 18,
    8.4
  );
  doc.text(sl, MARGIN_L + 9, y + 12.5);
  y += sh + 6;

  for (const risk of report.healthRisks) {
    const clean = sanitize(risk);
    const isHigh = /HIGH RISK|CRITICAL/i.test(risk);
    const lines = doc.splitTextToSize(clean, CONTENT_W - 20);
    const h = lines.length * 4.4 + 8;
    y = checkPage(doc, y, h + 4);
    card(doc, y, h, {
      bg: isHigh ? C.dangerBg : C.white,
      border: isHigh ? C.danger : C.line,
      accent: isHigh ? C.danger : C.muted,
    });
    if (isHigh) {
      label(doc, "Priority", MARGIN_L + 9, y + 6, C.danger, 7);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.6);
      doc.setTextColor(...C.danger);
      doc.text(lines, MARGIN_L + 9, y + 11.5);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.6);
      doc.setTextColor(...C.body);
      doc.text(lines, MARGIN_L + 9, y + 6.5);
    }
    y += h + 3.5;
  }

  y = factCallout(
    doc,
    y,
    "Mouse droppings, urine, and saliva can transmit Hantavirus, Salmonella, and LCMV. Children, pregnant people, and anyone with asthma face higher risk -- keep them out of active cleanup zones.",
    "U.S. CDC, Rodent-Borne Disease Prevention"
  );
}

/* ============================================================================
   04 — ENTRY POINTS
   ============================================================================ */
function drawEntryPoints(doc: jsPDF, report: ReportData): void {
  chapterDivider(doc, "04", "Probable Entry Points", "Every gap they use to get in -- and the order to seal them for good.");
  doc.addPage();
  drawTopBar(doc);
  let y = 24;
  y = sectionHeader(doc, "04", "Probable Entry Points", y, false);

  y = bodyText(
    doc,
    "Mice follow walls, pipes, and utility lines. Walk these zones slowly with a flashlight, then tick the box once each gap is sealed with copper mesh + elastomeric caulk (never expanding foam alone).",
    MARGIN_L,
    y,
    CONTENT_W,
    9
  );
  y += 2;

  report.entryPoints.forEach((ep, i) => {
    const lines = wrapLines(doc, ep, CONTENT_W - 26, 8.8);
    const h = Math.max(11, lines.length * 4.6 + 6);
    y = checkPage(doc, y, h + 3);
    card(doc, y, h, {});
    // number
    doc.setFillColor(...C.gold);
    doc.circle(MARGIN_L + 8, y + h / 2, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C.white);
    doc.text(String(i + 1), MARGIN_L + 8, y + h / 2 + 1.6, { align: "center" });
    // text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.8);
    doc.setTextColor(...C.body);
    doc.text(lines, MARGIN_L + 17, y + h / 2 - (lines.length - 1) * 2.3 + 1.2);
    // "sealed" checkbox
    checkbox(doc, MARGIN_R - 9, y + h / 2 + 1, 3.6);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.2);
    doc.setTextColor(...C.muted);
    doc.text("SEALED", MARGIN_R - 9, y + h / 2 - 4.5, { align: "center" });
    y += h + 3;
  });

  y = infoCard(
    doc,
    y,
    "Sealing standard",
    C.forest,
    "Pack every gap 1/4 inch or larger with copper mesh, then seal with elastomeric caulk. One week with zero catches and zero new signs is a monitoring checkpoint -- not proof mice cannot return if gaps stay open.",
    C.forest
  );
}

/* ============================================================================
   TRAP T-PLACEMENT DIAGRAM (vector schematic, top-down view)
   ============================================================================ */
function drawTrapDiagram(doc: jsPDF, y: number): number {
  const h = 62;
  y = checkPage(doc, y, h + 6);
  card(doc, y, h, { bg: C.paper, border: C.line });
  label(doc, "Trap T-placement -- top-down view", MARGIN_L + 9, y + 7, C.forest, 7.5);

  const dx = MARGIN_L + 14;
  const dw = 74;
  const dy = y + 12;

  // Wall band
  doc.setFillColor(...C.forest);
  doc.roundedRect(dx, dy, dw, 9, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(...C.white);
  doc.text("WALL / BASEBOARD", dx + dw / 2, dy + 6, { align: "center" });

  // Trap body — perpendicular to the wall, forming a T
  const tx = dx + dw / 2 - 9;
  const ty = dy + 9;
  doc.setFillColor(...C.goldSoft);
  doc.setDrawColor(...C.goldDeep);
  doc.setLineWidth(0.5);
  doc.roundedRect(tx, ty, 18, 26, 2, 2, "FD");
  // Trigger end (against the wall)
  doc.setFillColor(...C.gold);
  doc.roundedRect(tx + 2, ty + 1.5, 14, 7, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.5);
  doc.setTextColor(...C.ink);
  doc.text("TRIGGER", tx + 9, ty + 6.2, { align: "center" });
  // Bait dot
  doc.setFillColor(...C.danger);
  doc.circle(tx + 9, ty + 13, 1.6, "F");

  // Travel-route arrows along the wall
  doc.setDrawColor(...C.emerald);
  doc.setLineWidth(0.7);
  const ay = dy + 4.5;
  doc.line(dx + 4, ay, tx - 6, ay);
  doc.line(dx + dw - 4, ay, tx + 24, ay);
  doc.setFillColor(...C.emerald);
  doc.triangle(tx - 6, ay - 1.8, tx - 6, ay + 1.8, tx - 2.5, ay, "F");
  doc.triangle(tx + 24, ay - 1.8, tx + 24, ay + 1.8, tx + 20.5, ay, "F");

  // Annotations
  const ax = dx + dw + 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.ink);
  doc.text("Set traps PERPENDICULAR", ax, dy + 4);
  doc.text("to the wall -- like a T.", ax, dy + 9);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  doc.setTextColor(...C.body);
  const notes = wrapLines(
    doc,
    "Trigger end touches the baseboard. Pea-sized dab of chunky peanut butter on the trigger. Mice travel along edges and walk straight in.",
    CONTENT_W - (dw + 26),
    7.8
  );
  doc.text(notes, ax, dy + 15);
  const ny = dy + 15 + notes.length * 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.danger);
  doc.text("Check daily. Keep out of reach of", ax, ny + 3);
  doc.text("children and pets.", ax, ny + 7.5);

  return y + h + 5;
}

/* ============================================================================
   05 — TONIGHT'S ACTION PLAN
   ============================================================================ */
function drawActions(doc: jsPDF, report: ReportData): void {
  chapterDivider(doc, "05", "Tonight's Action Plan", "Your first 24 hours: contain, trap, and clean -- step by step.");
  doc.addPage();
  drawTopBar(doc);
  let y = 24;
  y = sectionHeader(doc, "05", "Tonight's Action Plan", y, false);

  // CDC safety strip
  y = checkPage(doc, y, 26);
  const sh = 22;
  card(doc, y, sh, { bg: C.dangerBg, border: C.danger, accent: C.danger });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...C.danger);
  doc.text("SAFETY FIRST -- CDC WET CLEANUP ONLY", MARGIN_L + 9, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.2);
  doc.setTextColor(...C.body);
  const sl = wrapLines(
    doc,
    "Air out closed areas 30 min. Wear gloves + mask. Soak droppings 5 min with disinfectant or 1:9 bleach mix, wipe with paper towels into a covered bin.",
    CONTENT_W - 18,
    8.2
  );
  doc.text(sl, MARGIN_L + 9, y + 12);
  y += sh + 5;

  y = drawTrapDiagram(doc, y);

  label(doc, "Do these tonight, in order", MARGIN_L, y, C.forest, 7.5);
  y += 5;

  report.immediateActions.forEach((a, i) => {
    const lines = wrapLines(doc, a, CONTENT_W - 34, 8.8);
    const h = lines.length * 4.4 + 10;
    y = checkPage(doc, y, h + 4);
    card(doc, y, h, { bg: [255, 253, 247] as RGB, border: C.gold, accent: C.gold });
    // step number
    doc.setFillColor(...C.gold);
    doc.circle(MARGIN_L + 10, y + 9, 6.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...C.white);
    doc.text(String(i + 1), MARGIN_L + 10, y + 12.6, { align: "center" });
    // text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.8);
    doc.setTextColor(...C.body);
    doc.text(lines, MARGIN_L + 22, y + 7.5);
    // done checkbox
    checkbox(doc, MARGIN_R - 9, y + 9, 3.6);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.2);
    doc.setTextColor(...C.muted);
    doc.text("DONE", MARGIN_R - 9, y + 4.5, { align: "center" });
    y += h + 4;
  });

  y = factCallout(
    doc,
    y,
    "CDC advises against glue traps and live traps. Snap traps placed in a T against the baseboard -- trigger touching the wall -- catch more mice with fewer misses.",
    "U.S. CDC, Trap Up Guidance"
  );
}

/* ============================================================================
   06 — EXPERT RESOURCES
   ============================================================================ */
function drawResources(doc: jsPDF, y: number): number {
  y = sectionHeader(doc, "06", "Expert Resources", y, false);
  y = bodyText(
    doc,
    "Go deeper with the full guides on MiceGoneGuide.com -- every link below is clickable in this PDF.",
    MARGIN_L,
    y,
    CONTENT_W,
    8.8
  );
  y += 2;

  const resources = [
    {
      title: "How to Get Rid of Mice -- Safe Home Plan",
      desc: "The complete elimination playbook: inspection, trapping, cleanup, and sealing in the right order.",
      url: "https://micegoneguide.com/how-to-get-rid-of-mice/",
    },
    {
      title: "Mouse Droppings Cleanup -- CDC Wet-Cleaning SOP",
      desc: "Step-by-step CDC-aligned decontamination so cleanup never spreads pathogens through your home.",
      url: "https://micegoneguide.com/mouse-droppings-cleanup/",
    },
    {
      title: "Where to Place Mouse Traps",
      desc: "Room-by-room trap placement maps based on real mouse travel routes and behavior.",
      url: "https://micegoneguide.com/where-to-place-mouse-traps/",
    },
    {
      title: "Mouse Proofing and Exclusion",
      desc: "Seal your home like a pro: materials, tools, and the exact gaps mice exploit most.",
      url: "https://micegoneguide.com/mouse-proofing-and-exclusion/",
    },
  ];

  for (const r of resources) {
    y = checkPage(doc, y, 26);
    const h = 22;
    card(doc, y, h, { accent: C.emerald });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.2);
    doc.setTextColor(...C.ink);
    doc.text(sanitize(r.title), MARGIN_L + 9, y + 7.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.muted);
    const dl = wrapLines(doc, r.desc, CONTENT_W - 34, 8);
    doc.text(dl.slice(0, 2), MARGIN_L + 9, y + 12.5);
    addLink(doc, "Open guide >>", r.url, MARGIN_R - 34, y + 7.5, 7.5);
    doc.link(MARGIN_L, y, CONTENT_W, h, { url: r.url });
    y += h + 4;
  }
  return y;
}

/* ============================================================================
   FREE → PRO UPGRADE TEASER
   ============================================================================ */
function drawProTeaser(doc: jsPDF, y: number): number {
  y = checkPage(doc, y, 72);
  y += 4;
  const h = 64;
  doc.setFillColor(...C.goldSoft);
  doc.setDrawColor(...C.gold);
  doc.setLineWidth(1);
  doc.roundedRect(MARGIN_L - 2, y, CONTENT_W + 4, h, 5, 5, "FD");

  doc.setFillColor(...C.gold);
  doc.roundedRect(MARGIN_L + 4, y + 5, CONTENT_W - 8, 12, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.white);
  doc.text("UNLOCK YOUR COMPLETE ELIMINATION MASTERPLAN", 105, y + 13, { align: "center" });

  const feats = [
    "Room-by-room elimination strategy tailored to YOUR home",
    "Exact product shopping list with recommendations",
    "Day-by-day 30-day elimination timeline",
    "CDC-aligned decontamination protocol",
    "12-month prevention calendar",
  ];
  let fy = y + 24;
  for (const f of feats) {
    doc.setFillColor(...C.ok);
    doc.circle(MARGIN_L + 8, fy - 1, 1.6, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.4);
    doc.setTextColor(...C.body);
    doc.text(sanitize(f), MARGIN_L + 14, fy);
    fy += 5.4;
  }

  doc.setFillColor(...C.gold);
  doc.roundedRect(58, y + h - 13, 94, 11, 5, 5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.white);
  doc.text("Upgrade -- $9.99 one-time", 105, y + h - 5.5, { align: "center" });
  doc.link(58, y + h - 13, 94, 11, { url: "https://elimination.micegoneguide.com/quiz" });
  return y + h + 6;
}

/* ============================================================================
   PRO SECTIONS
   ============================================================================ */
function drawProRoomByRoom(doc: jsPDF, report: ReportData): void {
  doc.addPage();
  drawTopBar(doc);
  // Pro masthead
  doc.setFillColor(...C.gold);
  doc.rect(0, 0, 210, 15, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...C.white);
  doc.text("PRO ELIMINATION MASTERPLAN", 105, 9.8, { align: "center" });

  let y = 24;
  y = sectionHeader(doc, "P1", "Room-by-Room Elimination Strategy", y);
  for (const s of report.roomByRoomStrategy) {
    const clean = sanitize(s);
    const colon = clean.indexOf(":");
    const room = colon > 0 ? clean.slice(0, colon) : "Focus area";
    const rest = colon > 0 ? clean.slice(colon + 1) : clean;
    const lines = wrapLines(doc, rest, CONTENT_W - 18, 8.6);
    const h = lines.length * 4.4 + 13;
    y = checkPage(doc, y, h + 4);
    card(doc, y, h, { accent: C.forest });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...C.forest);
    doc.text(sanitize(room).toUpperCase(), MARGIN_L + 9, y + 7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.6);
    doc.setTextColor(...C.body);
    doc.text(lines, MARGIN_L + 9, y + 12.5);
    y += h + 4;
  }
}

function drawProShopping(doc: jsPDF, report: ReportData): void {
  doc.addPage();
  drawTopBar(doc);
  let y = 24;
  y = sectionHeader(doc, "P2", "Personalized Shopping List", y);
  y = bodyText(
    doc,
    "Everything below was chosen for your household and severity level. Links open the product search -- prices update live on the store.",
    MARGIN_L,
    y,
    CONTENT_W,
    8.6
  );
  y += 2;

  report.shoppingList.forEach((item, i) => {
    const reason = wrapLines(doc, item.reason, CONTENT_W - 30, 8);
    const h = Math.max(15, reason.length * 4.2 + 11);
    y = checkPage(doc, y, h + 3);
    card(doc, y, h, {});
    doc.setFillColor(...C.goldSoft);
    doc.setDrawColor(...C.goldDeep);
    doc.setLineWidth(0.3);
    doc.circle(MARGIN_L + 9, y + h / 2, 5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...C.goldDeep);
    doc.text(String(i + 1), MARGIN_L + 9, y + h / 2 + 1.8, { align: "center" });

    doc.setFontSize(9.2);
    doc.setTextColor(...C.ink);
    doc.text(sanitize(item.name), MARGIN_L + 19, y + 7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.muted);
    doc.text(reason.slice(0, 2), MARGIN_L + 19, y + 12);
    if (item.affiliateUrl) {
      addLink(doc, "View on Amazon >>", item.affiliateUrl, MARGIN_R - 40, y + h - 5, 7.5);
    }
    y += h + 3;
  });
}

function drawProTimeline(doc: jsPDF, report: ReportData): void {
  doc.addPage();
  drawTopBar(doc);
  let y = 24;
  y = sectionHeader(doc, "P3", "30-Day Elimination Timeline", y);

  const lx = MARGIN_L + 26;
  const startY = y + 2;
  // compute total height first
  type Row = { day: string; lines: string[] };
  const rows: Row[] = report.eliminationTimeline.map((t) => ({
    day: sanitize(t.day),
    lines: wrapLines(doc, t.action, CONTENT_W - 40, 8.8),
  }));
  const rowHs = rows.map((r) => r.lines.length * 4.6 + 12);
  const totalH = rowHs.reduce((a, b) => a + b, 0);
  y = checkPage(doc, y, Math.min(totalH, 120) + 6);

  rows.forEach((r, i) => {
    const rh = rowHs[i];
    y = checkPage(doc, y, rh + 4);
    // connector line
    doc.setDrawColor(...C.line);
    doc.setLineWidth(1.2);
    const lineTop = i === 0 ? y + 8 : y - 4;
    const lineBottom = i === rows.length - 1 ? y + 8 : y + rh + 4;
    doc.line(lx, lineTop, lx, lineBottom);
    // node
    doc.setFillColor(...(i === 0 ? C.gold : C.forest));
    doc.circle(lx, y + 8, 5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...C.white);
    doc.text(String(i + 1), lx, y + 9.8, { align: "center" });
    // day badge + action
    doc.setFontSize(8.5);
    doc.setTextColor(...C.forest);
    doc.text(r.day.toUpperCase(), lx + 10, y + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.8);
    doc.setTextColor(...C.body);
    doc.text(r.lines, lx + 10, y + 11.5);
    y += rh;
  });
  y += 4;
}

function drawProDecon(doc: jsPDF, report: ReportData): void {
  doc.addPage();
  drawTopBar(doc);
  let y = 24;
  y = sectionHeader(doc, "P4", "CDC-Aligned Decontamination Protocol", y);
  y = bodyText(
    doc,
    "Run this protocol only after trapping has reduced activity -- cleaning too early removes the scent trails you need for trap placement. Tick each step as you finish.",
    MARGIN_L,
    y,
    CONTENT_W,
    8.8
  );
  y += 2;

  report.decontaminationSteps.forEach((s, i) => {
    const lines = wrapLines(doc, s, CONTENT_W - 32, 8.6);
    const h = lines.length * 4.4 + 8;
    y = checkPage(doc, y, h + 3);
    card(doc, y, h, { bg: i === 4 ? C.dangerBg : C.white, border: i === 4 ? C.danger : C.line });
    doc.setFillColor(...(i === 4 ? C.danger : C.forest));
    doc.circle(MARGIN_L + 8, y + h / 2, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.white);
    doc.text(String(i + 1), MARGIN_L + 8, y + h / 2 + 1.6, { align: "center" });
    doc.setFont("helvetica", i === 4 ? "bold" : "normal");
    doc.setFontSize(8.6);
    doc.setTextColor(...(i === 4 ? C.danger : C.body));
    doc.text(lines, MARGIN_L + 16, y + 6.5);
    checkbox(doc, MARGIN_R - 9, y + h / 2 + 1, 3.6);
    y += h + 3;
  });
}

function drawProCalendar(doc: jsPDF, report: ReportData): void {
  void report;
  doc.addPage();
  drawTopBar(doc);
  let y = 24;
  y = sectionHeader(doc, "P5", "12-Month Prevention Calendar", y);
  y = bodyText(
    doc,
    "Mice invade hardest in fall when they seek winter shelter. These six checkpoints keep you ahead of the seasonal cycle all year.",
    MARGIN_L,
    y,
    CONTENT_W,
    8.8
  );
  y += 2;

  const cw = (CONTENT_W - 6) / 2;
  const ch = 34;
  const items = report.preventionCalendar;
  for (let i = 0; i < items.length; i += 2) {
    y = checkPage(doc, y, ch + 4);
    for (let col = 0; col < 2 && i + col < items.length; col++) {
      const p = items[i + col];
      const cx = MARGIN_L + col * (cw + 6);
      card(doc, y, ch, { accent: /september/i.test(p.month) ? C.gold : C.forest, x: cx, w: cw });
      monthCard(doc, cx, y, cw, ch, p.month, p.task);
    }
    y += ch + 4;
  }
  y += 2;

  y = infoCard(
    doc,
    y,
    "September is critical",
    C.goldDeep,
    "Pre-fall sealing is the highest-leverage prevention task of the year. Close every gap before cold weather drives mice indoors.",
    C.gold
  );
}

function monthCard(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  month: string,
  task: string
): void {
  doc.setFillColor(...C.forest);
  doc.roundedRect(x + 5, y + 5, 26, 7, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.8);
  doc.setTextColor(...C.white);
  doc.text(sanitize(month).substring(0, 3).toUpperCase(), x + 18, y + 10, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.body);
  const lines = doc.splitTextToSize(sanitize(task), w - 14);
  doc.text(lines.slice(0, 4), x + 7, y + 18);
  void h;
}

/* ============================================================================
   PREMIUM WORKBOOK (W1–W5)
   ============================================================================ */
function workbookLines(doc: jsPDF, y: number, lbl: string, lines = 3): number {
  y = checkPage(doc, y, lines * 8 + 14);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.6);
  doc.setTextColor(...C.forest);
  doc.text(sanitize(lbl), MARGIN_L + 2, y);
  y += 6;
  doc.setDrawColor(...C.line);
  doc.setLineWidth(0.3);
  for (let i = 0; i < lines; i++) {
    doc.line(MARGIN_L + 2, y, MARGIN_R - 2, y);
    y += 8;
  }
  return y + 3;
}

function drawWorkbook(doc: jsPDF, report: ReportData): void {
  // W1 — blueprint intro
  doc.addPage();
  drawTopBar(doc);
  let y = 24;
  y = sectionHeader(doc, "W1", "Premium Elimination Blueprint", y);
  y = bodyText(
    doc,
    `This workbook turns your diagnosis into a homeowner operating plan. Work it in order for a ${sanitize(report.severityLabel).toLowerCase()} ${sanitize(report.species.name)} situation: contain tonight, seal this week, deplete, then prove prevention.`,
    MARGIN_L,
    y,
    CONTENT_W,
    9
  );
  y += 2;
  y = infoCard(doc, y, "Tonight's containment objective", C.goldDeep, "Reduce food access, block movement into clean zones, identify your top 2 likely entry routes, and place traps where mice already travel. Do not deep-clean until contaminated areas are wetted with disinfectant.", C.gold);
  const sc = severityColor(report.severity);
  y = infoCard(doc, y, "Severity-based focus", sc.fg, `Your score is ${report.severity}/10. If activity is spreading across rooms, prioritize containment and sealing before cosmetic cleaning. If you see mice in daylight or find fresh droppings daily, escalate faster and consider a licensed professional.`, sc.fg);
  y = infoCard(doc, y, "Species-specific clue", C.ok, `${sanitize(report.species.name)}: ${sanitize(report.species.behavior)} Place traps along actual routes -- not in open floor space.`, C.ok);

  // W2 — decision filter
  doc.addPage();
  drawTopBar(doc);
  y = 24;
  y = sectionHeader(doc, "W2", "Decision Filter: What To Do First", y);
  const filters: [string, string, RGB][] = [
    ["Safety", "Droppings, urine, or nesting material present? Wet-clean only -- never dry sweep or vacuum contaminated debris.", C.danger],
    ["Food pressure", "What food, pet food, crumbs, trash, bird seed, or pantry item rewards the route? Remove rewards before adding traps.", C.goldDeep],
    ["Travel route", "Where do walls, cabinets, appliances, pipes, or baseboards create a runway? Place traps perpendicular to those routes.", C.forest],
    ["Entry point", "Which gap can you seal today with copper mesh + sealant? Prioritize holes near utilities, doors, garages, and foundations.", C.emerald],
    ["Proof", "What will you track tomorrow morning: trap activity, fresh droppings, new sounds, food disturbance, or camera footage?", C.blue],
  ];
  for (const [t, b, accent] of filters) {
    y = infoCard(doc, y, t, accent, b, accent);
  }

  // W3 — entry-point audit
  doc.addPage();
  drawTopBar(doc);
  y = 24;
  y = sectionHeader(doc, "W3", "Entry-Point Audit Worksheet", y);
  y = bodyText(
    doc,
    "Walk the exterior and interior slowly with a flashlight. Note evidence and your seal plan for each zone.",
    MARGIN_L,
    y,
    CONTENT_W,
    9
  );
  y += 2;
  for (const area of [
    "Kitchen / pantry / appliances",
    "Garage / basement / utility lines",
    "Exterior foundation / siding / vents",
    "Attic / roofline / soffits",
    "Doors / weatherstripping / thresholds",
  ]) {
    y = workbookLines(doc, y, `${area} -- evidence + seal plan`, 3);
  }

  // W4 — 30-day map
  doc.addPage();
  drawTopBar(doc);
  y = 24;
  y = sectionHeader(doc, "W4", "30-Day Elimination Map", y);
  const weeks: [string, string, RGB][] = [
    ["Days 1-3: Contain", "Remove food rewards, isolate contaminated zones, place traps on travel routes, document fresh activity. Wet-clean only after disinfectant contact time.", C.gold],
    ["Days 4-10: Seal", "Close confirmed gaps with rodent-resistant materials. Recheck utilities, doors, garage edges, exterior pipes, and cabinet penetrations.", C.forest],
    ["Days 11-20: Deplete", "Maintain trap pressure. Move traps only when evidence shifts. Watch whether droppings and sounds decrease.", C.emerald],
    ["Days 21-30: Prove prevention", "Confirm no fresh droppings, smells, food disturbance, or sounds. Reset sanitation routines and monthly exterior checks.", C.blue],
  ];
  for (const [t, b, accent] of weeks) {
    y = infoCard(doc, y, t, accent, b, accent);
  }
  y = infoCard(
    doc,
    y,
    "What success looks like",
    C.ok,
    "One full week with zero catches, zero new droppings, zero new sounds, and zero food disturbance is a monitoring checkpoint -- keep monitoring, and keep gaps sealed, because mice return fast if entry points stay open.",
    C.ok
  );
  y = workbookLines(doc, y, "My top 3 actions this week", 4);

  // W5 — tracking log
  doc.addPage();
  drawTopBar(doc);
  y = 24;
  y = sectionHeader(doc, "W5", "Printable Tracking Log", y);
  y = bodyText(
    doc,
    "Log evidence daily. The goal is not just fewer sightings -- it is no new droppings, no fresh sounds, no food disturbance, and no trap activity over time.",
    MARGIN_L,
    y,
    CONTENT_W,
    9
  );
  y += 2;
  for (const lbl of [
    "Day / room / evidence found",
    "Trap placement + result",
    "Food or attractant removed",
    "Gap found or sealed",
    "Next adjustment",
  ]) {
    y = workbookLines(doc, y, lbl, 3);
  }
}

/* ============================================================================
   CLOSING PAGE
   ============================================================================ */
function drawClosing(doc: jsPDF): void {
  doc.addPage();
  markArtPage(doc);
  coverArt(doc);
  ghostNumeral(doc, "GO", C.gold, 0.10);

  doc.setFillColor(...C.gold);
  doc.rect(0, 0, 210, 4, "F");

  // eyebrow
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...C.gold);
  doc.text("M I S S I O N   B R I E F   C O M P L E T E", 105, 72, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.setTextColor(...C.white);
  doc.text("Your plan is ready.", 105, 96, { align: "center" });

  // gold rule + diamond
  const ry = 108;
  doc.setDrawColor(...C.gold);
  doc.setLineWidth(1);
  doc.line(78, ry, 97, ry);
  doc.line(113, ry, 132, ry);
  diamond(doc, 105, ry, 2.8, C.gold);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(185, 205, 190);
  doc.text("Work the blueprint in order -- contain, seal,", 105, 124, { align: "center" });
  doc.text("deplete, then prove prevention.", 105, 131, { align: "center" });

  // four-phase mini strip
  const phases = ["CONTAIN", "SEAL", "DEPLETE", "PROVE"];
  const pw = 30;
  const px0 = 105 - (phases.length * pw) / 2;
  phases.forEach((ph, i) => {
    const cx = px0 + pw * i + pw / 2;
    doc.setFillColor(...C.gold);
    doc.circle(cx, 148, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C.forestDeep);
    doc.text(String(i + 1), cx, 150.8, { align: "center" });
    doc.setFontSize(7);
    doc.setTextColor(...C.white);
    doc.text(ph, cx, 161, { align: "center" });
    if (i < phases.length - 1) {
      doc.setDrawColor(...C.gold);
      doc.setLineWidth(0.6);
      doc.line(cx + 11, 148, cx + pw - 11, 148);
    }
  });

  const links: [string, string][] = [
    ["Safe Home Plan", "https://micegoneguide.com/how-to-get-rid-of-mice/"],
    ["CDC Wet-Cleaning SOP", "https://micegoneguide.com/mouse-droppings-cleanup/"],
    ["Trap Placement Maps", "https://micegoneguide.com/where-to-place-mouse-traps/"],
  ];
  let ly = 180;
  links.forEach(([t, url]) => {
    doc.setFillColor(24, 58, 37);
    doc.setDrawColor(...C.goldDeep);
    doc.setLineWidth(0.4);
    doc.roundedRect(55, ly, 100, 13, 6.5, 6.5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...C.white);
    doc.text(sanitize(t), 105, ly + 8.5, { align: "center" });
    doc.link(55, ly, 100, 13, { url });
    ly += 18;
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(120, 150, 132);
  doc.text("MiceGoneGuide.com -- Professional-Grade Mouse Elimination Intelligence", 105, 258, { align: "center" });
  doc.setFontSize(6.5);
  doc.text(
    "This report is for informational purposes and is not a substitute for professional advice.",
    105,
    265,
    { align: "center" }
  );
  doc.setFillColor(...C.gold);
  doc.rect(0, 293, 210, 4, "F");
  doc.link(30, 252, 150, 18, { url: "https://micegoneguide.com" });
}

/* ============================================================================
   FOOTER (all content pages)
   ============================================================================ */
function drawFooters(doc: jsPDF, skipPages: Set<number>): void {
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    if (skipPages.has(i)) continue;
    doc.setPage(i);
    doc.setFillColor(...C.forest);
    doc.rect(0, 288, 210, 9, "F");
    doc.setFillColor(...C.gold);
    doc.rect(0, 287.4, 210, 0.6, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.8);
    doc.setTextColor(175, 198, 183);
    doc.text("MiceGoneGuide.com -- Mouse Elimination Blueprint", MARGIN_L, 293.6);
    doc.text(`Page ${i} of ${total}`, MARGIN_R, 293.6, { align: "right" });
    doc.link(MARGIN_L, 288.5, 110, 8, { url: "https://micegoneguide.com" });
  }
}

/* ============================================================================
   MAIN ENTRY
   ============================================================================ */
export function generatePDF(
  report: ReportData,
  isPro = false,
  answers?: QuizAnswers
): jsPDF {
  tocEntries = [];
  tocPageNum = 0;
  artPages = new Set<number>();

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  doc.setProperties({
    title: "Mouse Elimination Blueprint -- MiceGoneGuide",
    author: "MiceGoneGuide.com",
    subject: "Personalized mouse elimination diagnostic report, safety plan and action workbook",
    keywords: "mice, mouse elimination, pest control, CDC cleanup, trap placement, sealing entry points",
  });

  drawCover(doc, report);                    // p1
  drawExecutiveSummary(doc, report);          // p2
  drawSnapshotAndTOC(doc, report, answers);   // p3 (TOC numbers filled later)
  drawSeverity(doc, report);                  // 01
  drawSpecies(doc, report);                   // 02
  drawHealth(doc, report);                    // 03
  drawEntryPoints(doc, report);               // 04
  drawActions(doc, report);                   // 05

  chapterDivider(doc, "06", "Expert Resources", "Trusted guides for every step of the fight.");
  doc.addPage();
  drawTopBar(doc);
  let y = 24;
  y = drawResources(doc, y);                  // 06
  if (!isPro) {
    y = drawProTeaser(doc, y);
  }

  if (isPro) {
    drawProRoomByRoom(doc, report);            // P1
    drawProShopping(doc, report);             // P2
    drawProTimeline(doc, report);             // P3
    drawProDecon(doc, report);                // P4
    drawProCalendar(doc, report);             // P5
  }

  drawWorkbook(doc, report);                  // W1–W5
  drawClosing(doc);                           // closing (own footer)

  fillTOC(doc);
  drawFooters(doc, artPages);

  return doc;
}
