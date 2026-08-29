export type QuestionType = "single" | "multi" | "fill" | "free";
export type StudySetMode = "quiz" | "exam" | "homework";

export interface Course {
  id: string;
  code: string;
  name: string;
  /**
   * Shorter label for tight layouts. Some official course names run to
   * several words ("Computer Systems Organization and Architecture") and
   * wrap to four lines in the homepage index; the full name still appears
   * on the class page itself.
   */
  shortName?: string;
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
  correct?: Array<number | string>;
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
  correct: Array<number | string>;
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
  professorVerified?: boolean;
  professorVerifiedAt?: string;
  showRealName?: boolean;
  showUniversity?: boolean;
  universityId?: string;
  role?: "student" | "professor" | "admin";
  resetRequired?: boolean;
  mfaEnabled?: boolean;
  /**
   * Entitlement signals — currently UI-only.
   * These flags expose what the access model needs to make decisions.
   * Wire them from the backend (Stripe / institution agreements / etc.)
   * when those systems exist. See `lib/access.ts` for usage.
   */
  premiumActive?: boolean;
  premiumPlan?: "monthly" | "yearly" | null;
  premiumRenewsAt?: string | null;
  /**
   * True when the user's school/department has covered access
   * (e.g. an institution license is active for their university).
   * When true, premium prompts are hidden everywhere.
   */
  institutionCovered?: boolean;
  /**
   * True when the institution itself has been verified by United Exams
   * (i.e. the school is officially partnered).
   */
  institutionVerified?: boolean;
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
