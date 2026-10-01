import { describe, it, expect } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";
import { generateReport } from "@/lib/report-generator";
import { generatePDF } from "@/lib/pdf-generator";
const physical = { evidence: ["sighting", "droppings", "damaged_wiring"], location: ["kitchen", "attic"], household: ["kids", "pets_dog"], home_type: "apartment" };
describe("printable planning PDF", () => {
  for (const [name, answers, paid] of [["free", physical, false], ["extended", physical, true], ["unconfirmed", { evidence: ["sounds"] }, false]] as const) {
    it(`renders ${name} without fabricated diagnoses`, async () => {
      const doc = await generatePDF(generateReport(answers), paid);
      expect(doc.getNumberOfPages()).toBeGreaterThan(1);
      const raw = doc.output();
      expect(raw).toContain("Your Mouse Control Plan");
      expect(raw).not.toMatch(/94%|12,847|HIGH RISK|SEVERITY SCORE|EXPERT-REVIEWED|FACT-CHECKED|30-DAY PROJECTION/);
      expect(raw).toContain("https://www.cdc.gov/healthy-pets/rodent-control/clean-up.html");
      mkdirSync("evidence/pdfs", { recursive: true });
      writeFileSync(`evidence/pdfs/${name}.pdf`, Buffer.from(doc.output("arraybuffer")));
    });
  }
});
