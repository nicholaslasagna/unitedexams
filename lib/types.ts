export type QuestionType = "single" | "multi" | "free";

export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  tags: string[];
  topics: string[];
  accent: string;
  icon: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: string[];
  correct?: number[];
  explanation: string;
  walkthroughSteps?: string[];
  hintSteps?: string[];
  sampleAnswer?: string;
  references?: string[];
  tags: string[];
  imageUrl?: string;
}

export interface QuizSet {
  id: string;
  courseId: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estMinutes: number;
  tags: string[];
  timerDefaultMinutes: number;
  questions: Question[];
}

export interface PerQuestionResult {
  questionId: string;
  questionType: QuestionType;
  isCorrect: boolean;
  selected: number[];
  correct: number[];
  responseText?: string;
  selfMarked?: boolean;
  tags: string[];
}

export interface Attempt {
  id: string;
  quizId: string;
  courseId: string;
  date: string;
  score: number;
  correctCount: number;
  totalCount: number;
  timeSpent: number;
  perQuestionResults: PerQuestionResult[];
  topicBreakdown: Record<string, { correct: number; total: number }>;
}

export interface QuizSettings {
  timed: boolean;
  timerMinutes: number;
  randomizeQuestions: boolean;
  explanationMode: "afterEach" | "end";
}

export interface UserProfile {
  name: string;
  school?: string;
}

export interface AppPreferences {
  theme: "light" | "dark" | "system";
  reducedMotion: boolean;
  confettiEnabled: boolean;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  school?: string;
  streak: number;
  points: number;
  role?: "student" | "ta" | "professor";
}

export interface AppDataDump {
  attempts: Attempt[];
  profile: UserProfile;
  preferences: AppPreferences;
}
