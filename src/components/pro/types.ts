import type { Plan } from "@/lib/plan";
import type { ProPack } from "@/lib/pro-types";
import type { QuizAnswers } from "@/lib/quiz-data";
import type { ScheduleDay } from "@/lib/schedule";

export interface WorkspaceCtx {
  pack: ProPack;
  plan: Plan;
  answers: QuizAnswers;
  start: Date;
  schedule: ScheduleDay[];
  setStartKey: (key: string) => void;
}
