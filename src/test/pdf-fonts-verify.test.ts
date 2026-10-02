import { afterEach, expect, it, vi } from "vitest";
import { generatePDF } from "@/lib/pdf-generator";
import { generateReport } from "@/lib/report-generator";
afterEach(() => vi.unstubAllGlobals());
it("generates a readable PDF offline without requesting fonts or images", async () => {
  const request = vi.fn(() => Promise.reject(new Error("offline")));
  vi.stubGlobal("fetch", request);
  const doc = await generatePDF(generateReport({ evidence: ["sounds"] }));
  expect(doc.getNumberOfPages()).toBeGreaterThan(1);
  expect(request).not.toHaveBeenCalled();
});
