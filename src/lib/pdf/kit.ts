import { jsPDF } from "jspdf";

/** Small flow-layout helper over jsPDF. Built-in fonts only, so it works offline and needs no network. */
export const COLORS = {
  green: [23, 63, 44] as [number, number, number],
  greenSoft: [232, 240, 235] as [number, number, number],
  amber: [232, 169, 53] as [number, number, number],
  amberSoft: [253, 243, 220] as [number, number, number],
  ink: [29, 51, 40] as [number, number, number],
  muted: [92, 107, 97] as [number, number, number],
  line: [214, 219, 210] as [number, number, number],
  red: [170, 40, 34] as [number, number, number],
  redSoft: [252, 233, 231] as [number, number, number],
};

/** jsPDF's standard fonts only cover WinAnsi. Map the typographic characters we use to safe equivalents. */
export function clean(s: string): string {
  return s
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/[•●]/g, "-")
    .replace(/ /g, " ")
    .replace(/[^\x09\x0a\x20-\x7e¡-ÿ]/g, "");
}

export interface PdfMeta { title: string; subject: string; running: string; footer: string }

export class Pdf {
  readonly doc: jsPDF;
  y = 0;
  readonly m = 18;
  readonly w = 174;
  readonly bottom = 276;
  private cover = true;

  constructor(private meta: PdfMeta) {
    this.doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
    this.doc.setProperties({ title: meta.title, subject: meta.subject, author: "MiceGoneGuide", creator: "MiceGoneGuide Mouse Control Planner" });
  }

  private font(style: "normal" | "bold" | "italic" = "normal", size = 10, color: [number, number, number] = COLORS.ink, family: "helvetica" | "times" = "helvetica") {
    this.doc.setFont(family, style); this.doc.setFontSize(size); this.doc.setTextColor(...color);
  }

  /** Make sure `h` mm are free, otherwise start a new page. */
  ensure(h: number): void {
    if (this.y + h > this.bottom) this.page();
  }

  page(): void {
    this.doc.addPage();
    this.cover = false;
    this.runningHeader();
    this.y = 28;
  }

  private runningHeader(): void {
    this.doc.setFillColor(...COLORS.green); this.doc.rect(0, 0, 210, 13, "F");
    this.doc.setFillColor(...COLORS.amber); this.doc.rect(0, 13, 210, 1, "F");
    this.font("bold", 8.5, [247, 242, 228]);
    this.doc.text("MICEGONEGUIDE", this.m, 8.2);
    this.font("normal", 8.5, [214, 226, 218]);
    this.doc.text(clean(this.meta.running), 192, 8.2, { align: "right" });
  }

  coverBlock(opts: { kicker: string; title: string; subtitle?: string; lines?: string[] }): void {
    const d = this.doc;
    d.setFillColor(...COLORS.green); d.rect(0, 0, 210, 74, "F");
    d.setFillColor(...COLORS.amber); d.rect(0, 74, 210, 2.2, "F");
    this.font("bold", 9, COLORS.amber); d.text(clean(opts.kicker.toUpperCase()), this.m, 24);
    this.font("bold", 29, [250, 246, 235], "times"); d.text(clean(opts.title), this.m, 40);
    if (opts.subtitle) { this.font("normal", 12, [214, 226, 218]); d.text(d.splitTextToSize(clean(opts.subtitle), this.w), this.m, 50); }
    let y = 62;
    for (const line of opts.lines ?? []) { this.font("normal", 9, [190, 208, 197]); d.text(clean(line), this.m, y); y += 5; }
    this.y = 90;
  }

  h1(text: string): void {
    this.ensure(46);
    this.y += 4;
    this.font("bold", 17, COLORS.green, "times");
    const lines: string[] = this.doc.splitTextToSize(clean(text), this.w);
    this.doc.text(lines, this.m, this.y);
    this.y += lines.length * 7;
    this.doc.setDrawColor(...COLORS.amber); this.doc.setLineWidth(0.8); this.doc.line(this.m, this.y - 3, this.m + 18, this.y - 3);
    this.y += 3;
  }

  h2(text: string): void {
    this.ensure(34);
    this.y += 2;
    this.font("bold", 12, COLORS.green);
    const lines: string[] = this.doc.splitTextToSize(clean(text), this.w);
    this.doc.text(lines, this.m, this.y);
    this.y += lines.length * 5 + 1.5;
  }

  p(text: string, o: { size?: number; color?: [number, number, number]; indent?: number; style?: "normal" | "bold" | "italic"; gap?: number } = {}): void {
    const size = o.size ?? 10;
    this.font(o.style ?? "normal", size, o.color ?? COLORS.ink);
    const indent = o.indent ?? 0;
    const lines: string[] = this.doc.splitTextToSize(clean(text), this.w - indent);
    const lh = size * 0.46;
    for (const line of lines) { this.ensure(lh + 1); this.doc.text(line, this.m + indent, this.y); this.y += lh; }
    this.y += o.gap ?? 2.2;
  }

  bullets(items: string[]): void {
    for (const item of items) {
      this.font("normal", 10);
      const lines: string[] = this.doc.splitTextToSize(clean(item), this.w - 6);
      this.ensure(lines.length * 4.6 + 1);
      this.doc.setFillColor(...COLORS.amber); this.doc.circle(this.m + 1.4, this.y - 1.1, 0.9, "F");
      this.font("normal", 10);
      for (const line of lines) { this.doc.text(line, this.m + 6, this.y); this.y += 4.6; }
      this.y += 1;
    }
    this.y += 1;
  }

  numbered(items: string[]): void {
    items.forEach((item, i) => {
      this.font("normal", 10);
      const lines: string[] = this.doc.splitTextToSize(clean(item), this.w - 8);
      this.ensure(lines.length * 4.6 + 1);
      this.font("bold", 10, COLORS.green); this.doc.text(`${i + 1}.`, this.m, this.y);
      this.font("normal", 10);
      for (const line of lines) { this.doc.text(line, this.m + 8, this.y); this.y += 4.6; }
      this.y += 1;
    });
    this.y += 1;
  }

  /** A checkbox row with a bold title, an optional description and a source tag. */
  checkItem(title: string, detail?: string, source?: string): void {
    const tl: string[] = (this.font("bold", 10.5), this.doc.splitTextToSize(clean(title), this.w - 12));
    const dl: string[] = detail ? (this.font("normal", 9.3), this.doc.splitTextToSize(clean(detail), this.w - 12)) : [];
    const h = tl.length * 4.8 + dl.length * 4.2 + (source ? 4.5 : 0) + 3;
    this.ensure(h);
    this.doc.setDrawColor(...COLORS.green); this.doc.setLineWidth(0.5); this.doc.roundedRect(this.m, this.y - 3.4, 4.2, 4.2, 0.8, 0.8, "S");
    this.font("bold", 10.5); for (const l of tl) { this.doc.text(l, this.m + 8, this.y); this.y += 4.8; }
    if (dl.length) { this.font("normal", 9.3, [60, 78, 68]); for (const l of dl) { this.doc.text(l, this.m + 8, this.y); this.y += 4.2; } }
    if (source) { this.font("bold", 7.5, COLORS.muted); this.doc.text(`SOURCE: ${clean(source).toUpperCase()}`, this.m + 8, this.y + 0.4); this.y += 4.5; }
    this.y += 2.2;
  }

  callout(text: string, tone: "info" | "safety" | "note" = "info", title?: string): void {
    const fill = tone === "safety" ? COLORS.redSoft : tone === "note" ? COLORS.amberSoft : COLORS.greenSoft;
    const bar = tone === "safety" ? COLORS.red : tone === "note" ? COLORS.amber : COLORS.green;
    this.font("normal", 9.5);
    const lines: string[] = this.doc.splitTextToSize(clean(text), this.w - 12);
    const h = lines.length * 4.4 + (title ? 6 : 0) + 6;
    this.ensure(h + 2);
    this.doc.setFillColor(...fill); this.doc.roundedRect(this.m, this.y - 3, this.w, h, 2, 2, "F");
    this.doc.setFillColor(...bar); this.doc.rect(this.m, this.y - 3, 1.6, h, "F");
    let y = this.y + 2;
    if (title) { this.font("bold", 10, bar); this.doc.text(clean(title), this.m + 6, y); y += 5; }
    this.font("normal", 9.5);
    for (const l of lines) { this.doc.text(l, this.m + 6, y); y += 4.4; }
    this.y += h + 1.5;
  }

  /** Simple grid. Column widths are fractions that sum to 1. */
  table(head: string[], rows: string[][], widths: number[], o: { rowHeight?: number; zebra?: boolean } = {}): void {
    const x = (i: number) => this.m + widths.slice(0, i).reduce((a, b) => a + b, 0) * this.w;
    const cw = (i: number) => widths[i] * this.w - 3;
    const drawHead = () => {
      this.doc.setFillColor(...COLORS.green); this.doc.rect(this.m, this.y - 4.2, this.w, 7, "F");
      this.font("bold", 8.5, [250, 246, 235]);
      head.forEach((h, i) => this.doc.text(clean(h), x(i) + 1.5, this.y));
      this.y += 6;
    };
    this.ensure(18); drawHead();
    rows.forEach((row, r) => {
      this.font("normal", 9);
      const cells = row.map((c, i) => this.doc.splitTextToSize(clean(c), cw(i)) as string[]);
      const lines = Math.max(1, ...cells.map(c => c.length));
      const h = Math.max(o.rowHeight ?? 0, lines * 4.2 + 2.4);
      if (this.y + h > this.bottom) { this.page(); this.y = 28; drawHead(); }
      if (o.zebra !== false && r % 2 === 0) { this.doc.setFillColor(...COLORS.greenSoft); this.doc.rect(this.m, this.y - 3.8, this.w, h, "F"); }
      this.doc.setDrawColor(...COLORS.line); this.doc.setLineWidth(0.2); this.doc.line(this.m, this.y - 3.8 + h, this.m + this.w, this.y - 3.8 + h);
      cells.forEach((c, i) => { this.font(i === 0 ? "bold" : "normal", 9); c.forEach((l, li) => this.doc.text(l, x(i) + 1.5, this.y + li * 4.2)); });
      this.y += h;
    });
    this.y += 3;
  }

  link(label: string, url: string): void {
    this.ensure(6);
    this.font("normal", 9, COLORS.green);
    this.doc.textWithLink(clean(label), this.m, this.y, { url });
    this.y += 4.2;
    this.font("normal", 7.5, COLORS.muted);
    const lines: string[] = this.doc.splitTextToSize(url, this.w);
    for (const l of lines) { this.doc.text(l, this.m, this.y); this.y += 3.4; }
    this.y += 2;
  }

  spacer(h = 4): void { this.y += h; }

  /** Stamp page numbers and the standing footer on every page. */
  finish(): jsPDF {
    const total = this.doc.getNumberOfPages();
    for (let n = 1; n <= total; n++) {
      this.doc.setPage(n);
      this.doc.setDrawColor(...COLORS.line); this.doc.setLineWidth(0.3); this.doc.line(this.m, 282, 192, 282);
      this.font("normal", 7.8, COLORS.muted);
      this.doc.text(clean(this.meta.footer), this.m, 287);
      this.doc.text(`${n} / ${total}`, 192, 287, { align: "right" });
    }
    return this.doc;
  }
}

export const todayLabel = (d = new Date()): string => d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
