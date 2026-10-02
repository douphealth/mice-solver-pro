import type { ScheduleDay } from "./schedule";

const pad = (n: number) => String(n).padStart(2, "0");
const dateValue = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
const stamp = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

export const escapeText = (s: string): string => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** RFC 5545 line folding: lines longer than 75 octets continue on the next line after CRLF + space. */
export function foldLine(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;
  const out: string[] = [];
  let current = "";
  let bytes = 0;
  let limit = 75;
  for (const ch of line) {
    const size = encoder.encode(ch).length;
    if (bytes + size > limit) {
      out.push(current);
      current = " ";
      bytes = 1;
      limit = 75;
    }
    current += ch;
    bytes += size;
  }
  out.push(current);
  return out.join("\r\n");
}

export interface IcsOptions { calName: string; origin: string; now?: Date; alarmHour?: number }

/** All-day events with a 9:00 reminder. Opens in Apple Calendar, Google Calendar and Outlook. */
export function buildIcs(days: ScheduleDay[], opts: IcsOptions): string {
  const now = opts.now ?? new Date();
  const hour = opts.alarmHour ?? 9;
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MiceGoneGuide//Mouse Control Planner//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(opts.calName)}`,
  ];
  for (const d of days) {
    const end = new Date(d.date.getFullYear(), d.date.getMonth(), d.date.getDate() + 1);
    const description = [d.focus, "", ...d.tasks.map(t => `- ${t.text}`), "", `Open your plan: ${opts.origin}`].join("\n");
    lines.push(
      "BEGIN:VEVENT",
      `UID:mgg-${dateValue(d.date)}-${d.day}@${new URL(opts.origin).hostname}`,
      `DTSTAMP:${stamp(now)}`,
      `DTSTART;VALUE=DATE:${dateValue(d.date)}`,
      `DTEND;VALUE=DATE:${dateValue(end)}`,
      `SUMMARY:${escapeText(`MiceGoneGuide - Day ${d.day}: ${d.title}`)}`,
      `DESCRIPTION:${escapeText(description)}`,
      `URL:${opts.origin}`,
      "TRANSP:TRANSPARENT",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeText(d.title)}`,
      `TRIGGER;RELATED=START:PT${hour}H`,
      "END:VALARM",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

export function downloadText(filename: string, mime: string, content: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: `${mime};charset=utf-8` }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
