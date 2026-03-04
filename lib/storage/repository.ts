import type { AppDataDump, AppPreferences, Attempt, UserProfile } from "@/lib/types";

export interface DataRepository {
  getAttempts(): Promise<Attempt[]>;
  saveAttempt(attempt: Attempt): Promise<void>;
  clearAttempts(): Promise<void>;
  getProfile(): Promise<UserProfile>;
  saveProfile(profile: UserProfile): Promise<void>;
  getPreferences(): Promise<AppPreferences>;
  savePreferences(preferences: AppPreferences): Promise<void>;
  exportData(): Promise<AppDataDump>;
  importData(data: AppDataDump): Promise<void>;
}

export const STORAGE_KEYS = {
  attempts: "ue.attempts.v1",
  profile: "ue.profile.v1",
  preferences: "ue.preferences.v1"
} as const;

export const defaultProfile: UserProfile = {
  name: "Student",
  showRealName: false,
  showUniversity: false,
  role: "student"
};

export const defaultPreferences: AppPreferences = {
  theme: "dark",
  reducedMotion: false,
  confettiEnabled: true,
  accentHue: 265,
  accentSaturation: 72,
  accentLightness: 62,
  accentStrength: 60,
  palette: "amethyst",
  accentPreset: "amethyst",
  dashboardLayout: "default",
  extraSigninProtection: false
};
