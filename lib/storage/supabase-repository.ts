import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  defaultPreferences,
  defaultProfile,
  type DataRepository
} from "@/lib/storage/repository";
import {
  normalizeDisplayName,
  normalizeRealName,
  validateRealName,
  validateDisplayName
} from "@/lib/auth/display-name";
import { findClosestPalette } from "@/lib/theme/palettes";
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
  display_name_locked: boolean | null;
  real_name: string | null;
  real_name_locked: boolean | null;
  show_real_name: boolean;
  university_id: string | null;
  show_university: boolean;
  role: "student" | "professor" | "admin";
  reset_required: boolean;
  mfa_enabled?: boolean;
  universities?: { name: string }[] | null;
}

interface PreferencesRow {
  user_id: string;
  theme_mode: "dark" | "light" | "system";
  accent_preset: string | null;
  accent_hue: number;
  accent_saturation: number | null;
  accent_lightness: number | null;
  accent_strength: number;
  reduce_motion: boolean;
  dashboard_layout?: string | null;
  extra_signin_protection: boolean | null;
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
        correct: Array.isArray(item.correct)
          ? item.correct.map((x) => (typeof x === "number" ? x : String(x)))
          : [],
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
    const normalizedFallbackName = normalizeDisplayName(fallbackName || defaultProfile.name);
    const fallbackValidation = validateDisplayName(normalizedFallbackName);
    const safeFallbackName = fallbackValidation.valid ? normalizedFallbackName : defaultProfile.name;

    const { data: existingProfile, error: profileLookupError } = await this.client
      .from("profiles")
      .select("id")
      .eq("id", this.user.id)
      .maybeSingle();

    if (profileLookupError) {
      throw new Error(profileLookupError.message);
    }

    if (!existingProfile) {
      const { error: insertProfileError } = await this.client.from("profiles").insert({
        id: this.user.id,
        email: this.user.email,
        display_name: safeFallbackName
      });
      if (insertProfileError) {
        throw new Error(insertProfileError.message);
      }
    }

    const { data: existingPrefs, error: prefsLookupError } = await this.client
      .from("user_preferences")
      .select("user_id")
      .eq("user_id", this.user.id)
      .maybeSingle();

    if (prefsLookupError) {
      throw new Error(prefsLookupError.message);
    }

    if (!existingPrefs) {
      let insertPrefsError = (
        await this.client.from("user_preferences").insert({
          user_id: this.user.id,
          theme_mode: defaultPreferences.theme,
          accent_preset: defaultPreferences.accentPreset,
          accent_hue: defaultPreferences.accentHue,
          accent_saturation: defaultPreferences.accentSaturation,
          accent_lightness: defaultPreferences.accentLightness,
          accent_strength: defaultPreferences.accentStrength,
          reduce_motion: defaultPreferences.reducedMotion,
          extra_signin_protection: defaultPreferences.extraSigninProtection
        })
      ).error;

      if (
        insertPrefsError &&
        /accent_preset|accent_saturation|accent_lightness/i.test(
          insertPrefsError.message || ""
        )
      ) {
        insertPrefsError = (
          await this.client.from("user_preferences").insert({
            user_id: this.user.id,
            theme_mode: defaultPreferences.theme,
            accent_preset: defaultPreferences.accentPreset,
            accent_hue: defaultPreferences.accentHue,
            accent_saturation: defaultPreferences.accentSaturation,
            accent_lightness: defaultPreferences.accentLightness,
            accent_strength: defaultPreferences.accentStrength,
            reduce_motion: defaultPreferences.reducedMotion,
            extra_signin_protection: defaultPreferences.extraSigninProtection
          })
        ).error;
      }

      if (
        insertPrefsError &&
        /accent_preset|accent_saturation|accent_lightness/i.test(insertPrefsError.message || "")
      ) {
        insertPrefsError = (
          await this.client.from("user_preferences").insert({
            user_id: this.user.id,
            theme_mode: defaultPreferences.theme,
            accent_hue: defaultPreferences.accentHue,
            accent_strength: defaultPreferences.accentStrength,
            reduce_motion: defaultPreferences.reducedMotion,
            extra_signin_protection: defaultPreferences.extraSigninProtection
          })
        ).error;
      }

      if (insertPrefsError) {
        throw new Error(insertPrefsError.message);
      }
    }

    this.ensured = true;
  }

  async getAttempts(): Promise<Attempt[]> {
    await this.ensureBaseRows();

    const { data, error } = await this.client
      .from("attempts")
      .select("id, quiz_set_id, completed_at, created_at, score, correct_count, total_count, time_spent_seconds, settings")
      .eq("user_id", this.user.id)
      .not("completed_at", "is", null)
      .order("created_at", { ascending: false })
      .limit(750);

    if (error || !data) return [];

    return (data as AttemptRow[]).map((row) => {
      const settings = row.settings ?? {};
      return {
        id: row.id,
        quizId: row.quiz_set_id,
        courseId: String((settings.course_id as string | undefined) ?? ""),
        mode:
          settings.mode === "exam" || settings.mode === "homework" || settings.mode === "quiz"
            ? settings.mode
            : "quiz",
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
        .not("completed_at", "is", null)
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

    const settings = {
      mode: attempt.mode ?? "quiz",
      course_id: attempt.courseId,
      topic_breakdown: attempt.topicBreakdown,
      per_question_results: attempt.perQuestionResults,
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
        settings
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
      const { error: answersError } = await this.client.from("attempt_answers").insert(answerRows);
      if (answersError) {
        throw new Error(answersError.message);
      }
    }
  }

  async clearAttempts(): Promise<void> {
    await this.ensureBaseRows();
    await this.client.from("attempts").delete().eq("user_id", this.user.id);
  }

  async getProfile(): Promise<UserProfile> {
    await this.ensureBaseRows();

    const { data, error } = await this.client.from("profiles").select("*").eq("id", this.user.id).single();

    if (error || !data) {
      return {
        ...defaultProfile,
        id: this.user.id,
        email: this.user.email ?? undefined
      };
    }

    const row = data as ProfileRow & { [key: string]: unknown };
    let school: string | undefined;
    if (row.university_id) {
      const { data: university } = await this.client
        .from("universities")
        .select("name")
        .eq("id", row.university_id)
        .maybeSingle();
      school = university?.name ?? undefined;
    }

    return {
      id: row.id,
      email: row.email ?? this.user.email ?? undefined,
      name: row.display_name,
      displayNameLocked: Boolean(row.display_name_locked),
      school,
      realName: row.real_name ?? undefined,
      realNameLocked: Boolean(row.real_name_locked),
      showRealName: row.show_real_name,
      showUniversity: row.show_university,
      universityId: row.university_id ?? undefined,
      role: row.role,
      resetRequired: row.reset_required,
      mfaEnabled: Boolean((row as { mfa_enabled?: boolean }).mfa_enabled)
    };
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    await this.ensureBaseRows();

    const normalizedRealName = normalizeRealName(profile.realName ?? "");
    const realNameValidation = validateRealName(normalizedRealName);
    if (!realNameValidation.valid) {
      throw new Error(realNameValidation.message || "Invalid name.");
    }

    const updates: Record<string, unknown> = {
      real_name: normalizedRealName || null,
      show_real_name: Boolean(profile.showRealName),
      show_university: Boolean(profile.showUniversity),
      university_id: profile.universityId ?? null
    };

    const { data: lockRow } = await this.client
      .from("profiles")
      .select("display_name_locked")
      .eq("id", this.user.id)
      .maybeSingle();
    const displayNameLocked = Boolean(lockRow?.display_name_locked ?? profile.displayNameLocked);

    // Allow real name / university updates even when display name is locked.
    if (!displayNameLocked) {
      const normalizedName = normalizeDisplayName(profile.name || defaultProfile.name);
      const validation = validateDisplayName(normalizedName);
      if (!validation.valid) {
        throw new Error(validation.message || "Invalid display name.");
      }
      updates.display_name = normalizedName;
    }

    let { error } = await this.client
      .from("profiles")
      .update(updates)
      .eq("id", this.user.id);

    if (error && updates.display_name && /display name is locked/i.test(error.message || "")) {
      const fallbackUpdates = { ...updates };
      delete fallbackUpdates.display_name;
      error = (
        await this.client
          .from("profiles")
          .update(fallbackUpdates)
          .eq("id", this.user.id)
      ).error;
    }

    if (error) {
      throw new Error(error.message);
    }
  }

  async getPreferences(): Promise<AppPreferences> {
    await this.ensureBaseRows();

    const initial = await this.client
      .from("user_preferences")
      .select(
        "user_id, theme_mode, accent_preset, accent_hue, accent_saturation, accent_lightness, accent_strength, reduce_motion, extra_signin_protection"
      )
      .eq("user_id", this.user.id)
      .single();
    let data = (initial.data as Record<string, unknown> | null) ?? null;
    let error = initial.error as { message?: string } | null;

    if (
      error &&
      /accent_preset|accent_saturation|accent_lightness/i.test(
        error.message || ""
      )
    ) {
      const fallback = await this.client
        .from("user_preferences")
        .select(
          "user_id, theme_mode, accent_hue, accent_strength, reduce_motion, extra_signin_protection"
        )
        .eq("user_id", this.user.id)
        .single();
      data = (fallback.data as Record<string, unknown> | null) ?? null;
      error = fallback.error as { message?: string } | null;
    }

    if (error || !data) return defaultPreferences;

    const row = data as unknown as PreferencesRow;
    return {
      theme: row.theme_mode,
      reducedMotion: row.reduce_motion,
      confettiEnabled: true,
      accentPreset: row.accent_preset ?? findClosestPalette(row.accent_hue, row.accent_strength),
      accentHue: row.accent_hue,
      accentSaturation: Number(row.accent_saturation ?? defaultPreferences.accentSaturation),
      accentLightness: Number(row.accent_lightness ?? defaultPreferences.accentLightness),
      accentStrength: row.accent_strength,
      palette: row.accent_preset ?? findClosestPalette(row.accent_hue, row.accent_strength),
      dashboardLayout: defaultPreferences.dashboardLayout,
      extraSigninProtection: Boolean(row.extra_signin_protection)
    };
  }

  async savePreferences(preferences: AppPreferences): Promise<void> {
    await this.ensureBaseRows();

    let { error } = await this.client.from("user_preferences").upsert({
      user_id: this.user.id,
      theme_mode: preferences.theme,
      accent_preset: preferences.accentPreset,
      accent_hue: preferences.accentHue,
      accent_saturation: preferences.accentSaturation,
      accent_lightness: preferences.accentLightness,
      accent_strength: preferences.accentStrength,
      reduce_motion: preferences.reducedMotion,
      extra_signin_protection: preferences.extraSigninProtection
    });

    if (
      error &&
      /accent_preset|accent_saturation|accent_lightness/i.test(
        error.message || ""
      )
    ) {
      error = (
        await this.client.from("user_preferences").upsert({
          user_id: this.user.id,
          theme_mode: preferences.theme,
          accent_preset: preferences.accentPreset,
          accent_hue: preferences.accentHue,
          accent_saturation: preferences.accentSaturation,
          accent_lightness: preferences.accentLightness,
          accent_strength: preferences.accentStrength,
          reduce_motion: preferences.reducedMotion,
          extra_signin_protection: preferences.extraSigninProtection
        })
      ).error;
    }

    if (
      error &&
      /accent_preset|accent_saturation|accent_lightness/i.test(error.message || "")
    ) {
      error = (
        await this.client.from("user_preferences").upsert({
          user_id: this.user.id,
          theme_mode: preferences.theme,
          accent_hue: preferences.accentHue,
          accent_strength: preferences.accentStrength,
          reduce_motion: preferences.reducedMotion,
          extra_signin_protection: preferences.extraSigninProtection
        })
      ).error;
    }

    if (error) {
      throw new Error(error.message);
    }
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
