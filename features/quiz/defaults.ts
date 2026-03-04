import type { QuizSettings } from "@/lib/types";

export const defaultQuizSettings = (timerMinutes = 20): QuizSettings => ({
  timed: true,
  timerMinutes,
  randomizeQuestions: true,
  explanationMode: "afterEach",
  questionCount: "all",
  includeFreeResponse: true
});
