import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { writeFileSync } from "fs";
import { generateReport } from "@/lib/report-generator";
import { generatePDF } from "@/lib/pdf-generator";
import { QuizAnswers } from "@/lib/quiz-data";

// Offline: fonts must fall back to Helvetica gracefully and fast.
beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      throw new Error("offline");
    })
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
});

const severeAnswers: QuizAnswers = {
  evidence: ["sighting", "droppings", "nesting", "sounds", "urine_smell", "gnaw_marks"],
  droppings_detail: "scattered",
  sighting_detail: "multiple",
  location: ["kitchen", "attic", "basement", "garage", "walls"],
  home_type: "detached",
  home_age: "very_old",
  surroundings: "rural",
  attractants: ["bird_feeder", "compost", "woodpile"],
  timeline: "months",
  season: "fall",
  previous: ["snap_traps", "poison"],
  previous_results: "temporary",
  household: ["kids", "pets_dog", "allergies"],
  food_storage: "open",
  budget: "moderate",
  zip: "90210",
};

const mildAnswers: QuizAnswers = {
  evidence: ["droppings"],
  droppings_detail: "small_dark",
  location: ["kitchen"],
  home_type: "apartment",
  home_age: "new",
  surroundings: "urban",
  attractants: ["none_attractants"],
  timeline: "days",
  season: "spring",
  previous: ["nothing"],
  household: ["none"],
  food_storage: "sealed",
  budget: "minimal",
  zip: "10001",
};

describe("pdf-generator render", () => {
  it("renders the free blueprint without errors", async () => {
    const report = generateReport(severeAnswers);
    const doc = await generatePDF(report, false, severeAnswers);
    const pages = doc.getNumberOfPages();
    console.log("FREE pages:", pages, "| severity:", report.severity, "| species:", report.species.name);
    expect(pages).toBeGreaterThan(8);
    writeFileSync("/tmp/mice-blueprint-free.pdf", Buffer.from(doc.output("arraybuffer")));
  });

  it("renders the pro masterplan without errors", async () => {
    const report = generateReport(severeAnswers);
    const doc = await generatePDF(report, true, severeAnswers);
    const pages = doc.getNumberOfPages();
    console.log("PRO pages:", pages);
    expect(pages).toBeGreaterThan(10);
    writeFileSync("/tmp/mice-blueprint-pro.pdf", Buffer.from(doc.output("arraybuffer")));
  });

  it("renders a mild case without errors", async () => {
    const report = generateReport(mildAnswers);
    const doc = await generatePDF(report, false, mildAnswers);
    const pages = doc.getNumberOfPages();
    console.log("MILD pages:", pages, "| severity:", report.severity, "| species:", report.species.name);
    expect(pages).toBeGreaterThan(8);
    writeFileSync("/tmp/mice-blueprint-mild.pdf", Buffer.from(doc.output("arraybuffer")));
  });
});
