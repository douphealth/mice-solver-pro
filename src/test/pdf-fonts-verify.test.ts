import { describe, it, expect, vi, afterEach } from "vitest";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { generatePDF } from "@/lib/pdf-generator";
import { generateReport } from "@/lib/report-generator";
import { PD } from "@/lib/pdf-fonts";

const severeAnswers = {
  seen_signs: ["droppings", "gnaw_marks"],
  signs_location: ["kitchen", "pantry"],
  activity_time: "night",
  sounds: ["scratching"],
  property_type: "house",
  entry_awareness: "yes_gaps",
  food_access: ["pet_food", "pantry"],
  pets_children: "both",
  previous_efforts: ["traps"],
  timeline: "asap",
  zip: "10001",
};

function stubFontFetch() {
  const bold = readFileSync("public/fonts/PlayfairDisplay-Bold.ttf");
  const italic = readFileSync("public/fonts/PlayfairDisplay-Italic.ttf");
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      const u = String(url);
      const buf = /Italic/i.test(u) ? italic : /Bold/i.test(u) ? bold : null;
      if (!buf) throw new Error("not found: " + url);
      return {
        ok: true,
        arrayBuffer: async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
      };
    })
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

// Local-only fixture: the TTFs live in public/fonts/ untracked (production
// loads them from the CDN fallback chain). Skip when absent.
const hasFixtures =
  existsSync("public/fonts/PlayfairDisplay-Bold.ttf") &&
  existsSync("public/fonts/PlayfairDisplay-Italic.ttf");

describe.runIf(hasFixtures)("pdf display typography", () => {
  it("embeds Playfair and renders gallery edition", async () => {
    stubFontFetch();
    const report = generateReport(severeAnswers);
    const doc = await generatePDF(report, false, severeAnswers);
    expect(PD.family).toBe("Playfair");
    const pages = doc.getNumberOfPages();
    console.log("GALLERY pages:", pages);
    expect(pages).toBeGreaterThan(8);
    writeFileSync("/tmp/mice-gallery-playfair.pdf", Buffer.from(doc.output("arraybuffer")));
  });

  it("embeds Playfair in the pro masterplan", async () => {
    stubFontFetch();
    const report = generateReport(severeAnswers);
    const doc = await generatePDF(report, true, severeAnswers);
    expect(PD.family).toBe("Playfair");
    console.log("GALLERY PRO pages:", doc.getNumberOfPages());
    writeFileSync("/tmp/mice-gallery-playfair-pro.pdf", Buffer.from(doc.output("arraybuffer")));
  });
});
