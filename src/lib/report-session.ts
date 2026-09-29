import type { QuizAnswers } from "./quiz-data";

const QUIZ_ANSWERS_KEY = "mgg:quiz-answers";
const CAPTURED_EMAIL_KEY = "mgg:captured-email";
const LAST_PAID_SESSION_KEY = "mgg:last-paid-session";
const PAID_REPORT_PREFIX = "mgg:paid-report:";

export interface PaidReportCache {
  sessionId: string;
  answers: QuizAnswers;
  verifiedAt: string;
  amountTotal?: number;
  currency?: string;
}

function canUseStorage() { return typeof window !== "undefined"; }

function isQuizAnswers(value: unknown): value is QuizAnswers {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function saveQuizAnswers(answers: QuizAnswers) {
  if (!canUseStorage()) return;
  try { sessionStorage.setItem(QUIZ_ANSWERS_KEY, JSON.stringify(answers)); } catch { /* Storage is optional. */ }
}

export function loadQuizAnswers(): QuizAnswers | null {
  if (!canUseStorage()) return null;
  try {
    const raw = sessionStorage.getItem(QUIZ_ANSWERS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isQuizAnswers(parsed) ? parsed : null;
  } catch { return null; }
}

export function saveCapturedEmail(email: string) {
  if (!canUseStorage()) return;
  try { sessionStorage.setItem(CAPTURED_EMAIL_KEY, email.trim().toLowerCase()); } catch { /* Storage is optional. */ }
}

export function loadCapturedEmail(): string {
  if (!canUseStorage()) return "";
  try { return sessionStorage.getItem(CAPTURED_EMAIL_KEY) || ""; } catch { return ""; }
}

export function savePaidReport(cache: PaidReportCache) {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(PAID_REPORT_PREFIX + cache.sessionId, JSON.stringify(cache));
    localStorage.setItem(LAST_PAID_SESSION_KEY, cache.sessionId);
  } catch { /* Storage is optional. */ }
}

export function loadPaidReport(sessionId?: string | null): PaidReportCache | null {
  if (!canUseStorage()) return null;
  try {
    const resolvedSessionId = sessionId || localStorage.getItem(LAST_PAID_SESSION_KEY);
    if (!resolvedSessionId) return null;
    const raw = localStorage.getItem(PAID_REPORT_PREFIX + resolvedSessionId);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PaidReportCache;
    return parsed?.sessionId === resolvedSessionId &&
      isQuizAnswers(parsed?.answers) &&
      typeof parsed?.verifiedAt === "string" ? parsed : null;
  } catch { return null; }
}
