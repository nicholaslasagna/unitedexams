export type QuestionType = "single" | "multi" | "free";
export type StudySetMode = "quiz" | "exam" | "homework";

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
  externalId?: string;
  type: QuestionType;
  prompt: string;
  options?: string[];
  correct?: number[];
  explanation: string;
  solutionMd?: string;
  walkthroughSteps?: string[];
  hintSteps?: string[];
  sampleAnswer?: string;
  references?: string[];
  difficulty?: "easy" | "med" | "hard";
  homeworkFormat?: "short" | "multi-step" | "proof" | "calc";
  fromProfessor?: boolean;
  tags: string[];
  imageUrl?: string;
}

export interface QuizSet {
  id: string;
  externalId?: string;
  courseId: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estMinutes: number;
  tags: string[];
  mode?: StudySetMode;
  questionCountTarget?: number | null;
  isExamSimulation?: boolean;
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
  mode?: StudySetMode;
  date: string;
  score: number;
  correctCount: number;
  totalCount: number;
  timeSpent: number;
  perQuestionResults: PerQuestionResult[];
  topicBreakdown: Record<string, { correct: number; total: number }>;
  status?: "in_progress" | "completed";
  homeworkProgress?: {
    currentIndex: number;
    answeredIds: string[];
    flaggedIds: string[];
  };
}

export interface QuizSettings {
  timed: boolean;
  timerMinutes: number;
  randomizeQuestions: boolean;
  explanationMode: "afterEach" | "end";
  questionCount: number | "all";
  includeFreeResponse?: boolean;
}

export interface UserProfile {
  id?: string;
  email?: string;
  name: string;
  school?: string;
  realName?: string;
  displayNameLocked?: boolean;
  realNameLocked?: boolean;
  showRealName?: boolean;
  showUniversity?: boolean;
  universityId?: string;
  role?: "student" | "professor" | "admin";
  resetRequired?: boolean;
  mfaEnabled?: boolean;
}

export interface AppPreferences {
  theme: "light" | "dark" | "system";
  reducedMotion: boolean;
  confettiEnabled: boolean;
  accentHue: number;
  accentSaturation: number;
  accentLightness: number;
  accentStrength: number;
  palette: string;
  accentPreset: string;
  dashboardLayout: string;
  extraSigninProtection: boolean;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  realName?: string;
  school?: string;
  streak: number;
  points: number;
  rank?: number;
  isCurrentUser?: boolean;
  role?: "student" | "ta" | "professor";
}

export interface AppDataDump {
  attempts: Attempt[];
  profile: UserProfile;
  preferences: AppPreferences;
}
