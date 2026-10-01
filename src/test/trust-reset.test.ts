import { describe, expect, it, vi } from "vitest";
import { generateReport } from "@/lib/report-generator";
import { configureAnalytics, trackEvent } from "@/lib/analytics";
describe("observation-based planning", () => {
  it("does not diagnose from noises or room location", () => {
    const report = generateReport({ evidence: ["sounds", "urine_smell"], location: ["attic", "basement"], surroundings: "rural" });
    expect(report.physicalSigns).toEqual([]); expect(report.uncertainSigns).toHaveLength(2);
    expect(report.species.name).toBe("Species not established");
    expect(report.severity).toBeNull(); expect(report.estimatedPopulation.max).toBeNull();
    expect(report.populationIn30Days.max).toBeNull(); expect(report.urgencyDays).toBeNull();
  });
  it("keeps physical observations separate from uncertain indicators", () => {
    const r = generateReport({ evidence: ["droppings", "sounds"], household: ["kids"] });
    expect(r.physicalSigns).toHaveLength(1); expect(r.uncertainSigns).toHaveLength(1);
    expect(r.immediateActions.join(" ")).toContain("not a guarantee of child or pet safety");
  });
  it("escalates only explicit practical hazards, not age, geography or guessed population", () => {
    expect(generateReport({ home_age: "very_old", surroundings: "rural", location: ["attic"] }).professionalHelp).toEqual([]);
    expect(generateReport({ evidence: ["damaged_wiring", "ventilation", "heavy_contamination"] }).professionalHelp).toHaveLength(3);
  });
  it.each([null, undefined, [], "noise", 42, { evidence: "droppings", location: null }, { evidence: [null, 3, "__proto__"] }])("handles malformed input safely: %s", input => {
    const report = generateReport(input); expect(report.severity).toBeNull(); expect(report.physicalSigns).toEqual([]);
  });
  it("deduplicates recognized signs and ignores unknown input", () => {
    expect(generateReport({ evidence: ["droppings", "droppings", "invented"] }).physicalSigns).toHaveLength(1);
  });
  it("gates measurement on consent and strips answers, email, zip and query strings", () => {
    const adapter = vi.fn(); configureAnalytics(adapter, false); trackEvent("planner_start"); expect(adapter).not.toHaveBeenCalled();
    configureAnalytics(adapter, true); trackEvent("planner_complete", { steps: 6, email: "secret@example.invalid", severity: 9, species: "rat", zip: "12345", path: "/report?email=secret" });
    expect(adapter).toHaveBeenCalledWith("planner_complete", { steps: 6 }); configureAnalytics(null, false);
  });
});
