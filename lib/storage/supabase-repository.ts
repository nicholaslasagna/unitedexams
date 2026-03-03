import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  defaultPreferences,
  defaultProfile,
  type DataRepository
} from "@/lib/storage/repository";
import type {
  AppDataDump,
  AppPreferences,
  Attempt,
  PerQuestionResult,
  UserProfile
} from "@/lib/types";

interface ProfileRow {
  id: string;
  email: string | null;
  display_name: string;
  real_name: string | null;
  show_real_name: boolean;
  university_id: string | null;
  show_university: boolean;
  role: "student" | "professor" | "admin";
  reset_required: boolean;
  universities?: { name: string }[] | null;
}

interface PreferencesRow {
  user_id: string;
  theme_mode: "dark" | "light" | "system";
  accent_hue: number;
  accent_strength: number;
  reduce_motion: boolean;
  dashboard_layout: string;
}

interface AttemptRow {
  id: string;
  quiz_set_id: string;
  completed_at: string | null;
  created_at: string;
  score: number | string;
  correct_count: number;
  total_count: number;
  time_spent_seconds: number;
  settings: Record<string, unknown> | null;
}

function asTopicBreakdown(value: unknown): Attempt["topicBreakdown"] {
  if (!value || typeof value !== "object") return {};
  const input = value as Record<string, unknown>;
  const out: Attempt["topicBreakdown"] = {};

  for (const [tag, stat] of Object.entries(input)) {
    if (!stat || typeof stat !== "object") continue;
    const entry = stat as Record<string, unknown>;
    out[tag] = {
      correct: Number(entry.correct ?? 0),
      total: Number(entry.total ?? 0)
    };
  }

  return out;
}

function asPerQuestionResults(value: unknown): PerQuestionResult[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry) => entry && typeof entry === "object")
    .map((entry) => {
      const item = entry as Partial<PerQuestionResult>;
      return {
        questionId: String(item.questionId ?? ""),
        questionType: item.questionType ?? "single",
        isCorrect: Boolean(item.isCorrect),
        selected: Array.isArray(item.selected) ? item.selected.map((x) => Number(x)) : [],
        correct: Array.isArray(item.correct) ? item.correct.map((x) => Number(x)) : [],
        responseText: item.responseText,
        selfMarked: item.selfMarked,
        tags: Array.isArray(item.tags) ? item.tags.map((x) => String(x)) : []
      };
    })
    .filter((entry) => entry.questionId.length > 0);
}

export class SupabaseRepository implements DataRepository {
  private ensured = false;

  constructor(private readonly client: SupabaseClient, private readonly user: User) {}

  private async ensureBaseRows() {
    if (this.ensured) return;

    const fallbackName =
      this.user.user_metadata?.display_name ??
      this.user.email?.split("@")[0] ??
      defaultProfile.name;

    await this.client.from("profiles").upsert({
      id: this.user.id,
      email: this.user.email,
      display_name: fallbackName
    });

    await this.client.from("user_preferences").upsert({
      user_id: this.user.id,
      theme_mode: defaultPreferences.theme,
      accent_hue: defaultPreferences.accentHue,
      accent_strength: defaultPreferences.accentStrength,
      reduce_motion: defaultPreferences.reducedMotion,
      dashboard_layout: defaultPreferences.dashboardLayout
    });

    this.ensured = true;
  }

  async getAttempts(): Promise<Attempt[]> {
    await this.ensureBaseRows();

    const { data, error } = await this.client
      .from("attempts")
      .select("id, quiz_set_id, completed_at, created_at, score, correct_count, total_count, time_spent_seconds, settings")
      .eq("user_id", this.user.id)
      .order("created_at", { ascending: false })
      .limit(750);

    if (error || !data) return [];

    return (data as AttemptRow[]).map((row) => {
      const settings = row.settings ?? {};
      return {
        id: row.id,
        quizId: row.quiz_set_id,
        courseId: String((settings.course_id as string | undefined) ?? ""),
        date: row.completed_at ?? row.created_at,
        score: Number(row.score ?? 0),
        correctCount: Number(row.correct_count ?? 0),
        totalCount: Number(row.total_count ?? 0),
        timeSpent: Number(row.time_spent_seconds ?? 0),
        perQuestionResults: asPerQuestionResults(settings.per_question_results),
        topicBreakdown: asTopicBreakdown(settings.topic_breakdown)
      };
    });
  }

  async saveAttempt(attempt: Attempt): Promise<void> {
    await this.ensureBaseRows();

    const dayStart = new Date(attempt.date);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    const [{ data: bestRows }, { data: existingTodayRows }] = await Promise.all([
      this.client
        .from("attempts")
        .select("score")
        .eq("user_id", this.user.id)
        .eq("quiz_set_id", attempt.quizId)
        .order("score", { ascending: false })
        .limit(1),
      this.client
        .from("attempts")
        .select("id")
        .eq("user_id", this.user.id)
        .gte("completed_at", dayStart.toISOString())
        .lt("completed_at", dayEnd.toISOString())
        .limit(1)
    ]);

    const previousBest = Number(bestRows?.[0]?.score ?? 0);
    const isPersonalBest = attempt.score > previousBest;
    const streakDayMaintained = (existingTodayRows?.length ?? 0) === 0;
    const pointsAwarded =
      Math.round(attempt.score) + (isPersonalBest ? 10 : 0) + (streakDayMaintained ? 5 : 0);

    const settings = {
      course_id: attempt.courseId,
      topic_breakdown: attempt.topicBreakdown,
      per_question_results: attempt.perQuestionResults,
      points_awarded: pointsAwarded,
      personal_best_bonus: isPersonalBest ? 10 : 0,
      streak_bonus: streakDayMaintained ? 5 : 0,
      streak_day_maintained: streakDayMaintained
    };

    const { data: insertedAttempt, error } = await this.client
      .from("attempts")
      .insert({
        user_id: this.user.id,
        quiz_set_id: attempt.quizId,
        started_at: attempt.date,
        completed_at: attempt.date,
        score: attempt.score,
        correct_count: attempt.correctCount,
        total_count: attempt.totalCount,
        time_spent_seconds: attempt.timeSpent,
        settings,
        points_awarded: pointsAwarded
      })
      .select("id")
      .single();

    if (error || !insertedAttempt) {
      throw new Error(error?.message ?? "Failed to save attempt");
    }

    const answerRows = attempt.perQuestionResults.map((entry) => ({
      attempt_id: insertedAttempt.id,
      question_id: entry.questionId,
      selected: entry.selected,
      is_correct: entry.isCorrect,
      time_spent_seconds: null
    }));

    if (answerRows.length > 0) {
      await this.client.from("attempt_answers").insert(answerRows);
    }
  }

  async clearAttempts(): Promise<void> {
    await this.ensureBaseRows();
    await this.client.from("attempts").delete().eq("user_id", this.user.id);
  }

  async getProfile(): Promise<UserProfile> {
    await this.ensureBaseRows();

    const { data, error } = await this.client
      .from("profiles")
      .select(
        "id, email, display_name, real_name, show_real_name, university_id, show_university, role, reset_required, universities(name)"
      )
      .eq("id", this.user.id)
      .single();

    if (error || !data) {
      return {
        ...defaultProfile,
        id: this.user.id,
        email: this.user.email ?? undefined
      };
    }

    const row = data as ProfileRow;

    return {
      id: row.id,
      email: row.email ?? this.user.email ?? undefined,
      name: row.display_name,
      school: row.universities?.[0]?.name,
      realName: row.real_name ?? undefined,
      showRealName: row.show_real_name,
      showUniversity: row.show_university,
      universityId: row.university_id ?? undefined,
      role: row.role,
      resetRequired: row.reset_required
    };
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    await this.ensureBaseRows();

    await this.client
      .from("profiles")
      .update({
        email: profile.email ?? this.user.email,
        display_name: profile.name || defaultProfile.name,
        real_name: profile.realName ?? null,
        show_real_name: Boolean(profile.showRealName),
        show_university: Boolean(profile.showUniversity),
        university_id: profile.universityId ?? null
      })
      .eq("id", this.user.id);
  }

  async getPreferences(): Promise<AppPreferences> {
    await this.ensureBaseRows();

    const { data, error } = await this.client
      .from("user_preferences")
      .select("user_id, theme_mode, accent_hue, accent_strength, reduce_motion, dashboard_layout")
      .eq("user_id", this.user.id)
      .single();

    if (error || !data) return defaultPreferences;

    const row = data as PreferencesRow;
    return {
      theme: row.theme_mode,
      reducedMotion: row.reduce_motion,
      confettiEnabled: true,
      accentHue: row.accent_hue,
      accentStrength: row.accent_strength,
      dashboardLayout: row.dashboard_layout
    };
  }

  async savePreferences(preferences: AppPreferences): Promise<void> {
    await this.ensureBaseRows();

    await this.client.from("user_preferences").upsert({
      user_id: this.user.id,
      theme_mode: preferences.theme,
      accent_hue: preferences.accentHue,
      accent_strength: preferences.accentStrength,
      reduce_motion: preferences.reducedMotion,
      dashboard_layout: preferences.dashboardLayout
    });
  }

  async exportData(): Promise<AppDataDump> {
    const [attempts, profile, preferences] = await Promise.all([
      this.getAttempts(),
      this.getProfile(),
      this.getPreferences()
    ]);

    return {
      attempts,
      profile,
      preferences
    };
  }

  async importData(data: AppDataDump): Promise<void> {
    await this.ensureBaseRows();

    await this.saveProfile({
      ...defaultProfile,
      ...(data.profile ?? {})
    });

    await this.savePreferences({
      ...defaultPreferences,
      ...(data.preferences ?? {})
    });

    if (Array.isArray(data.attempts)) {
      for (const attempt of data.attempts) {
        await this.saveAttempt(attempt);
      }
    }
  }
}
