import { describe, expect, it } from "vitest";
import { PRO_PACK } from "../../worker/pro-content";
import { generatePlan } from "@/lib/plan";
import { addDays, buildSchedule, currentDay, dayProgress, parseDateKey, toDateKey, trapCheckDays } from "@/lib/schedule";
import { buildIcs, escapeText, foldLine } from "@/lib/ics";
import { LOG_KINDS, logToCsv, quietDays, sanitizeLog, weeklyBuckets, type LogEntry } from "@/lib/evidence-log";

const answers = { evidence: ["droppings", "damaged_wiring"], location: ["kitchen", "attic", "garage", "basement"], household: ["kids"], previous: ["glue_traps", "poison"], home_type: "apartment", duration: "months" };
const start = new Date(2026, 9, 5); // 5 Oct 2026, local time

describe("30-day schedule", () => {
  const plan = generatePlan(answers);
  const days = buildSchedule(PRO_PACK, plan, answers, start);

  it("is dated from the chosen start day and ordered", () => {
    expect(days[0].day).toBe(0);
    expect(toDateKey(days[0].date)).toBe("2026-10-05");
    expect(toDateKey(days.find(d => d.day === 30)!.date)).toBe("2026-11-04");
    expect(days.map(d => d.day)).toEqual([...days.map(d => d.day)].sort((a, b) => a - b));
  });
  it("puts safety first on day 0 and personalises it", () => {
    const ids = days[0].tasks.map(t => t.id);
    expect(ids[0]).toBe("p-haz-wiring");
    expect(ids).toEqual(expect.arrayContaining(["p-access", "p-glue", "p-poison"]));
  });
  it("adds a daily trap check from day 2 to day 27 and a quiet-week review", () => {
    for (let d = 2; d <= 27; d++) expect(days.find(x => x.day === d)!.tasks.some(t => t.id === `check-${d}`)).toBe(true);
    expect(days.find(d => d.day === 28)!.tasks.some(t => t.id === "d28-quiet")).toBe(true);
  });
  it("spreads room inspections over the first days and flags long-running problems and shared walls", () => {
    const roomTasks = days.flatMap(d => d.tasks.filter(t => t.id.startsWith("p-room-")).map(t => [d.day, t.id] as const));
    expect(roomTasks.map(r => r[1]).sort()).toEqual(["p-room-attic", "p-room-basement", "p-room-garage", "p-room-kitchen"].sort());
    expect(Math.max(...roomTasks.map(r => r[0]))).toBeLessThanOrEqual(3);
    expect(days.find(d => d.day === 7)!.tasks.some(t => t.id === "p-pro-assess")).toBe(true);
    expect(days.find(d => d.day === 2)!.tasks.some(t => t.id === "p-landlord")).toBe(true);
  });
  it("keeps task ids unique and independent of the start date so progress survives a date change", () => {
    const ids = days.flatMap(d => d.tasks.map(t => t.id));
    expect(new Set(ids).size).toBe(ids.length);
    const moved = buildSchedule(PRO_PACK, plan, answers, addDays(start, 9)).flatMap(d => d.tasks.map(t => t.id));
    expect(moved).toEqual(ids);
  });
  it("tracks progress and finds the next day to work on", () => {
    const p = dayProgress(days, {});
    expect(p.done).toBe(0);
    expect(p.total).toBe(days.reduce((n, d) => n + d.tasks.length, 0));
    const done = Object.fromEntries(days[0].tasks.map(t => [t.id, true]));
    expect(dayProgress(days, done).done).toBe(days[0].tasks.length);
    expect(currentDay(days, {}, start)).toBe(0);
    expect(currentDay(days, done, start)).toBe(1);
    expect(currentDay(days, {}, addDays(start, 40))).toBe(30);
  });
  it("offers a simple free 14-day trap-check reminder set", () => {
    const free = trapCheckDays(start, 14);
    expect(free).toHaveLength(14);
    expect(toDateKey(free[0].date)).toBe("2026-10-06");
  });
});

describe("calendar export", () => {
  const plan = generatePlan(answers);
  const days = buildSchedule(PRO_PACK, plan, answers, start);
  const ics = buildIcs(days, { calName: "Mouse control plan", origin: "https://elimination.micegoneguide.com", now: new Date(Date.UTC(2026, 9, 5, 12, 0, 0)) });

  it("produces a valid, CRLF-delimited VCALENDAR with one all-day event per day", () => {
    expect(ics.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(days.length);
    expect(ics.match(/END:VEVENT/g)).toHaveLength(days.length);
    expect(ics).toContain("DTSTART;VALUE=DATE:20261005");
    expect(ics).toContain("DTEND;VALUE=DATE:20261006");
    expect(ics).toContain("DTSTAMP:20261005T120000Z");
    expect(ics.split("\r\n").every(l => new TextEncoder().encode(l).length <= 75)).toBe(true);
    expect(ics.replace(/\r\n/g, "")).not.toMatch(/\n/);
  });
  it("uses unique UIDs", () => {
    const uids = ics.match(/^UID:.*$/gm)!;
    expect(new Set(uids).size).toBe(uids.length);
  });
  it("escapes special characters and folds long lines without breaking multi-byte characters", () => {
    expect(escapeText("a, b; c\\d\nnew")).toBe("a\\, b\\; c\\\\d\\nnew");
    const long = "SUMMARY:" + "é".repeat(80);
    const folded = foldLine(long);
    expect(folded.split("\r\n").every(l => new TextEncoder().encode(l).length <= 75)).toBe(true);
    expect(folded.replace(/\r\n /g, "")).toBe(long);
  });
});

describe("evidence log", () => {
  const e = (date: string, kind: LogEntry["kind"], count = 1, id = `${date}-${kind}`): LogEntry => ({ id, date, kind, location: "Kitchen", count, note: "" });
  const today = new Date(2026, 9, 20);

  it("validates stored entries", () => {
    const clean = sanitizeLog([e("2026-10-01", "catch"), { id: 1 }, null, { ...e("2026-13-45", "catch") }, { ...e("2026-10-02", "bogus" as any) }, { ...e("2026-10-03", "note"), count: 99999, note: "x".repeat(900) }]);
    expect(clean).toHaveLength(2);
    expect(clean[1].count).toBe(999);
    expect(clean[1].note).toHaveLength(400);
    expect(sanitizeLog("nope")).toEqual([]);
  });
  it("counts only signals per week and ignores checks and repairs", () => {
    const entries = [e("2026-10-20", "catch", 2), e("2026-10-19", "droppings", 3), e("2026-10-18", "trap_check"), e("2026-10-17", "repair", 5), e("2026-10-10", "sighting"), e("2026-09-01", "gnawing")];
    const buckets = weeklyBuckets(entries, 3, today);
    expect(buckets).toHaveLength(3);
    expect(buckets[2].signals).toBe(5);
    expect(buckets[1].signals).toBe(1);
    expect(buckets[0].signals).toBe(0);
    expect(buckets[2].byKind).toEqual({ catch: 2, droppings: 3 });
  });
  it("reports quiet days since the last signal", () => {
    expect(quietDays([], today)).toBeNull();
    expect(quietDays([e("2026-10-13", "catch"), e("2026-10-18", "trap_check")], today)).toBe(7);
    expect(quietDays([e("2026-10-20", "sighting")], today)).toBe(0);
  });
  it("exports CSV that neutralises spreadsheet formulas and quotes special characters", () => {
    const csv = logToCsv([{ ...e("2026-10-02", "note"), note: '=HYPERLINK("http://x")', location: "Attic, east" }]);
    expect(csv.split("\r\n")[0]).toBe("Date,Type,Location,Count,Note");
    expect(csv).toContain("\"Attic, east\"");
    expect(csv).toContain("\"'=HYPERLINK(\"\"http://x\"\")\"");
  });
  it("describes every kind", () => {
    expect(LOG_KINDS.map(k => k.id)).toEqual(["catch", "droppings", "gnawing", "sighting", "trap_check", "repair", "note"]);
    expect(parseDateKey("2026-02-30")).toBeNull();
    expect(parseDateKey("2026-02-28")).not.toBeNull();
  });
});
