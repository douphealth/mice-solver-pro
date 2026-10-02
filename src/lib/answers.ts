import { KEYS, readJSON, removeKey, writeJSON } from "./storage";
import { quizSteps, type QuizAnswers } from "./quiz-data";

/** Keep only answers that match a known question and option, so stale or tampered storage can never reach the plan engine. */
export function sanitizeAnswers(input: unknown): QuizAnswers {
  const out: QuizAnswers = {};
  if (!input || typeof input !== "object" || Array.isArray(input)) return out;
  const src = input as Record<string, unknown>;
  for (const step of quizSteps) {
    const ids = new Set(step.options.map(o => o.id));
    const value = src[step.id];
    if (step.type === "single") {
      if (typeof value === "string" && ids.has(value)) out[step.id] = value;
    } else if (Array.isArray(value)) {
      const list = [...new Set(value.filter((v): v is string => typeof v === "string" && ids.has(v)))];
      if (list.length) out[step.id] = list;
    }
  }
  return out;
}

export const loadAnswers = (): QuizAnswers => sanitizeAnswers(readJSON<unknown>(KEYS.answers, {}));
export const saveAnswers = (answers: QuizAnswers): void => { writeJSON(KEYS.answers, sanitizeAnswers(answers)); };
export const clearAnswers = (): void => removeKey(KEYS.answers);
export const isComplete = (answers: QuizAnswers): boolean => quizSteps.every(step => answers[step.id] !== undefined);
