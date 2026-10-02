import { addDays, parseDateKey, startOfDay, toDateKey } from "./schedule";

export type LogKind = "catch" | "droppings" | "gnawing" | "sighting" | "trap_check" | "repair" | "note";

export interface LogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  kind: LogKind;
  location: string;
  count: number;
  note: string;
}

export const LOG_KINDS: { id: LogKind; label: string; countable: boolean; signal: boolean }[] = [
  { id: "catch", label: "Trap catch", countable: true, signal: true },
  { id: "droppings", label: "New droppings", countable: true, signal: true },
  { id: "gnawing", label: "New gnawing", countable: false, signal: true },
  { id: "sighting", label: "Sighting", countable: false, signal: true },
  { id: "trap_check", label: "Trap check (nothing found)", countable: false, signal: false },
  { id: "repair", label: "Gap sealed", countable: true, signal: false },
  { id: "note", label: "Note", countable: false, signal: false },
];

const KIND_IDS = new Set<string>(LOG_KINDS.map(k => k.id));

export function sanitizeLog(input: unknown): LogEntry[] {
  if (!Array.isArray(input)) return [];
  const out: LogEntry[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;
    const e = raw as Record<string, unknown>;
    if (typeof e.id !== "string" || typeof e.date !== "string" || !parseDateKey(e.date) || typeof e.kind !== "string" || !KIND_IDS.has(e.kind)) continue;
    out.push({
      id: e.id.slice(0, 64),
      date: e.date,
      kind: e.kind as LogKind,
      location: typeof e.location === "string" ? e.location.slice(0, 80) : "",
      count: typeof e.count === "number" && Number.isFinite(e.count) ? Math.min(999, Math.max(0, Math.round(e.count))) : 1,
      note: typeof e.note === "string" ? e.note.slice(0, 400) : "",
    });
  }
  return out;
}

export const isSignal = (kind: LogKind): boolean => LOG_KINDS.find(k => k.id === kind)?.signal ?? false;

export interface WeekBucket { start: string; label: string; signals: number; byKind: Partial<Record<LogKind, number>> }

/** Entries per seven-day window ending today. This describes what the user recorded, not how many mice exist. */
export function weeklyBuckets(entries: LogEntry[], weeks = 6, today = new Date()): WeekBucket[] {
  const end = startOfDay(today);
  const buckets: WeekBucket[] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const from = addDays(end, -(w * 7 + 6));
    const to = addDays(end, -(w * 7));
    const fromKey = toDateKey(from);
    const toKey = toDateKey(to);
    const byKind: Partial<Record<LogKind, number>> = {};
    let signals = 0;
    for (const e of entries) {
      if (e.date < fromKey || e.date > toKey || !isSignal(e.kind)) continue;
      const n = LOG_KINDS.find(k => k.id === e.kind)?.countable ? Math.max(1, e.count) : 1;
      byKind[e.kind] = (byKind[e.kind] ?? 0) + n;
      signals += n;
    }
    buckets.push({ start: fromKey, label: `${from.getDate()}/${from.getMonth() + 1}`, signals, byKind });
  }
  return buckets;
}

/** Days since the last recorded signal, or null when none has been recorded. Mirrors the CDC's "no new signs for a week" check-in. */
export function quietDays(entries: LogEntry[], today = new Date()): number | null {
  const signals = entries.filter(e => isSignal(e.kind)).map(e => e.date).sort();
  if (!signals.length) return null;
  const last = parseDateKey(signals[signals.length - 1]);
  if (!last) return null;
  return Math.max(0, Math.round((startOfDay(today).getTime() - last.getTime()) / 86_400_000));
}

const csvCell = (v: string | number): string => {
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // neutralise spreadsheet formulas in user text
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function logToCsv(entries: LogEntry[]): string {
  const rows = [["Date", "Type", "Location", "Count", "Note"], ...[...entries].sort((a, b) => a.date.localeCompare(b.date)).map(e => [e.date, LOG_KINDS.find(k => k.id === e.kind)?.label ?? e.kind, e.location, e.count, e.note])];
  return rows.map(r => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
}
