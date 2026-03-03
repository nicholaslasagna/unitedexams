"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import type { ReactNode } from "react";
import { getRepository } from "@/lib/storage/local-repository";
import { defaultPreferences, defaultProfile } from "@/lib/storage/repository";
import type { AppDataDump, AppPreferences, Attempt, UserProfile } from "@/lib/types";

interface AppDataContextValue {
  ready: boolean;
  attempts: Attempt[];
  profile: UserProfile;
  preferences: AppPreferences;
  saveAttempt: (attempt: Attempt) => Promise<void>;
  saveProfile: (profile: UserProfile) => Promise<void>;
  savePreferences: (prefs: AppPreferences) => Promise<void>;
  refresh: () => Promise<void>;
  exportData: () => Promise<AppDataDump>;
  importData: (data: AppDataDump) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

function resolveTheme(theme: AppPreferences["theme"]) {
  if (theme === "system") {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }
  return theme;
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const repo = useMemo(() => getRepository(), []);
  const [ready, setReady] = useState(false);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [preferences, setPreferences] = useState<AppPreferences>(defaultPreferences);

  const applyPreferences = useCallback((prefs: AppPreferences) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const resolved = resolveTheme(prefs.theme);
    root.classList.toggle("dark", resolved === "dark");
    root.style.colorScheme = resolved;
    root.dataset.reduceMotion = prefs.reducedMotion ? "on" : "off";
  }, []);

  const refresh = useCallback(async () => {
    const [nextAttempts, nextProfile, nextPrefs] = await Promise.all([
      repo.getAttempts(),
      repo.getProfile(),
      repo.getPreferences()
    ]);

    setAttempts(nextAttempts);
    setProfile(nextProfile);
    setPreferences(nextPrefs);
    applyPreferences(nextPrefs);
    setReady(true);
  }, [repo, applyPreferences]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!ready) return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (preferences.theme === "system") {
        applyPreferences(preferences);
      }
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [ready, preferences, applyPreferences]);

  const saveAttempt = useCallback(
    async (attempt: Attempt) => {
      await repo.saveAttempt(attempt);
      const next = await repo.getAttempts();
      setAttempts(next);
    },
    [repo]
  );

  const saveProfile = useCallback(
    async (next: UserProfile) => {
      setProfile(next);
      await repo.saveProfile(next);
    },
    [repo]
  );

  const savePreferences = useCallback(
    async (next: AppPreferences) => {
      setPreferences(next);
      applyPreferences(next);
      await repo.savePreferences(next);
    },
    [repo, applyPreferences]
  );

  const exportData = useCallback(() => repo.exportData(), [repo]);
  const importData = useCallback(
    async (data: AppDataDump) => {
      await repo.importData(data);
      await refresh();
    },
    [repo, refresh]
  );

  const value = useMemo<AppDataContextValue>(
    () => ({
      ready,
      attempts,
      profile,
      preferences,
      saveAttempt,
      saveProfile,
      savePreferences,
      refresh,
      exportData,
      importData
    }),
    [
      ready,
      attempts,
      profile,
      preferences,
      saveAttempt,
      saveProfile,
      savePreferences,
      refresh,
      exportData,
      importData
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error("useAppData must be used within AppDataProvider");
  }
  return ctx;
}
