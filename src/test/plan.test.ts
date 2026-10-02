import { describe, expect, it, vi } from "vitest";
import { generatePlan, actionsByPhase, PLANNER_LIMITATION } from "@/lib/plan";
import { quizSteps } from "@/lib/quiz-data";
import { sanitizeAnswers } from "@/lib/answers";
import { configureAnalytics, trackEvent } from "@/lib/analytics";

const everything = JSON.stringify;

describe("observation-based planning", () => {
  it("does not diagnose from noises or room location", () => {
    const plan = generatePlan({ evidence: ["sounds", "urine_smell"], location: ["attic", "basement"] });
    expect(plan.observed.physical).toEqual([]);
    expect(plan.observed.uncertain).toHaveLength(2);
    expect(plan.status.level).toBe("unconfirmed");
    expect(plan.flags.physical).toBe(false);
    expect(plan.actions.some(a => a.id === "t-inspect")).toBe(true);
    expect(plan.actions.some(a => a.id === "t-traps")).toBe(false);
  });

  it("keeps physical observations separate from uncertain indicators and protects children and pets", () => {
    const plan = generatePlan({ evidence: ["droppings", "sounds"], household: ["kids"] });
    expect(plan.observed.physical).toHaveLength(1);
    expect(plan.observed.uncertain).toHaveLength(1);
    expect(plan.status.level).toBe("verify");
    const traps = plan.actions.find(a => a.id === "t-traps")!;
    expect(traps.detail).toContain("can't reach");
    expect(traps.detail).toContain("not automatically safe");
    expect(traps.source).toBe("cdc-trap");
  });

  it("escalates only explicit practical hazards, never age, geography or guessed population", () => {
    expect(generatePlan({ home_age: "very_old", surroundings: "rural", location: ["attic"] }).hazards).toEqual([]);
    const hazards = generatePlan({ evidence: ["damaged_wiring", "ventilation", "heavy_contamination"] });
    expect(hazards.hazards).toHaveLength(3);
    expect(hazards.status.level).toBe("attention");
    expect(hazards.priorities.map(p => p.id)).toEqual(["haz-wiring", "haz-duct", "haz-heavy"]);
  });

  it("selects top priorities in a sensible order", () => {
    const plan = generatePlan({ evidence: ["droppings"], food_storage: "open", previous: ["glue_traps"] });
    expect(plan.priorities).toHaveLength(3);
    expect(plan.priorities[0].id).toBe("t-glue");
    expect(plan.priorities.map(p => p.id)).toContain("t-traps");
    expect(plan.priorities.map(p => p.id)).toContain("t-food");
  });

  it("tailors advice to what was already tried", () => {
    const plan = generatePlan({ evidence: ["droppings"], previous: ["glue_traps", "poison", "ultrasonic", "peppermint"] });
    const ids = plan.actions.map(a => a.id);
    expect(ids).toEqual(expect.arrayContaining(["t-glue", "t-poison", "t-devices"]));
    expect(plan.actions.find(a => a.id === "t-devices")!.detail).toMatch(/little evidence/);
    const plain = generatePlan({ evidence: ["droppings"], previous: ["nothing"] });
    expect(plain.actions.map(a => a.id)).not.toEqual(expect.arrayContaining(["t-glue"]));
  });

  it("adds property- and timeline-specific steps", () => {
    expect(generatePlan({ home_type: "apartment" }).actions.some(a => a.id === "w-multiunit")).toBe(true);
    expect(generatePlan({ home_type: "mobile" }).actions.some(a => a.id === "w-mobile")).toBe(true);
    expect(generatePlan({ home_type: "cabin" }).actions.some(a => a.id === "w-cabin")).toBe(true);
    expect(generatePlan({ duration: "returning" }).actions.find(a => a.id === "o-reinspect")!.title).toMatch(/earlier repairs/);
    expect(generatePlan({ duration: "new" }).actions.some(a => a.id === "o-reinspect")).toBe(false);
  });

  it("uses stable ids so checklist progress survives reloads", () => {
    const a = generatePlan({ evidence: ["droppings"], location: ["kitchen"] });
    const b = generatePlan({ evidence: ["droppings"], location: ["kitchen"] });
    expect(a.actions.map(x => x.id)).toEqual(b.actions.map(x => x.id));
    expect(new Set(a.actions.map(x => x.id)).size).toBe(a.actions.length);
  });

  it.each([null, undefined, [], "noise", 42, { evidence: "droppings", location: null }, { evidence: [null, 3, "__proto__", "constructor"] }])("handles malformed input safely: %j", input => {
    const plan = generatePlan(input);
    expect(plan.observed.physical).toEqual([]);
    expect(plan.hazards).toEqual([]);
    expect(plan.priorities.length).toBeGreaterThan(0);
  });

  it("deduplicates recognised signs and ignores unknown input", () => {
    expect(generatePlan({ evidence: ["droppings", "droppings", "invented"] }).observed.physical).toHaveLength(1);
    expect(generatePlan({ location: ["kitchen", "kitchen", "moon"] }).rooms).toHaveLength(1);
  });

  it("groups actions into the three phases", () => {
    const phases = actionsByPhase(generatePlan({ evidence: ["droppings"] }));
    expect(phases.today.length).toBeGreaterThan(2);
    expect(phases.week.length).toBeGreaterThan(2);
    expect(phases.ongoing.length).toBeGreaterThan(2);
  });

  it("cites a primary source for every non-trivial recommendation", () => {
    const plan = generatePlan({ evidence: ["droppings"], previous: ["glue_traps", "poison", "ultrasonic"], home_type: "apartment", duration: "months" });
    const unsourced = plan.actions.filter(a => !a.source && a.id !== "t-record");
    expect(unsourced).toEqual([]);
  });

  it("never states a diagnosis, population, severity score or guarantee", () => {
    const text = everything(generatePlan({ evidence: ["droppings", "sighting", "gnaw_marks", "damaged_wiring"], location: ["attic", "kitchen"], previous: ["poison"] }));
    expect(text).not.toMatch(/\b\d{1,3}%|\bscore\b|estimated population|infestation level|guarantee[sd]? (a |the |your )?(result|clearance|success)|permanently|100% effective/i);
    expect(PLANNER_LIMITATION).toMatch(/cannot diagnose/);
  });
});

describe("quiz data and answer sanitising", () => {
  it("has unique ids and an exclusive 'none' style option where needed", () => {
    for (const step of quizSteps) {
      const ids = step.options.map(o => o.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(step.options.every(o => o.icon)).toBe(true);
    }
  });
  it("drops unknown questions and options", () => {
    expect(sanitizeAnswers({ evidence: ["droppings", "bogus", 4], home_type: "castle", food_storage: "open", extra: ["x"] })).toEqual({ evidence: ["droppings"], food_storage: "open" });
    expect(sanitizeAnswers("nope")).toEqual({});
    expect(sanitizeAnswers([])).toEqual({});
  });
});

describe("consent-gated analytics", () => {
  it("gates measurement on consent and strips answers, email, zip and query strings", () => {
    const adapter = vi.fn();
    configureAnalytics(adapter, false);
    trackEvent("planner_start");
    expect(adapter).not.toHaveBeenCalled();
    configureAnalytics(adapter, true);
    trackEvent("planner_complete", { steps: 7, email: "secret@example.invalid", severity: 9, species: "rat", zip: "12345", path: "/plan?email=secret" });
    expect(adapter).toHaveBeenCalledWith("planner_complete", { steps: 7 });
    configureAnalytics(null, false);
  });
});
