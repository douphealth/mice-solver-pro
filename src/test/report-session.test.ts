import { beforeEach, describe, expect, it } from "vitest";
import {
  loadCapturedEmail,
  loadPaidReport,
  loadQuizAnswers,
  saveCapturedEmail,
  savePaidReport,
  saveQuizAnswers,
} from "@/lib/report-session";

describe("report session persistence", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it("restores diagnostic answers after navigation", () => {
    const answers = { evidence: ["droppings"], timeline: "week" };
    saveQuizAnswers(answers);
    expect(loadQuizAnswers()).toEqual(answers);
  });

  it("normalizes captured email", () => {
    saveCapturedEmail(" Test@Example.com ");
    expect(loadCapturedEmail()).toBe("test@example.com");
  });

  it("stores paid report access by Stripe Checkout Session", () => {
    const cache = {
      sessionId: "cs_test_123",
      answers: { evidence: ["sounds"] },
      verifiedAt: new Date().toISOString(),
      amountTotal: 999,
      currency: "usd",
    };
    savePaidReport(cache);
    expect(loadPaidReport("cs_test_123")).toEqual(cache);
    expect(loadPaidReport()).toEqual(cache);
  });
});
