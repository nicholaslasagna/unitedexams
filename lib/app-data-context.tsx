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
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getLocalRepository } from "@/lib/storage/local-repository";
import { SupabaseRepository } from "@/lib/storage/supabase-repository";
import { defaultPreferences, defaultProfile, type DataRepository } from "@/lib/storage/repository";
import { migrateGuestAttemptsToAccount } from "@/lib/storage/guest-migration";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { applyThemeCssVars } from "@/lib/theme/css-vars";
import type { AppDataDump, AppPreferences, Attempt, UserProfile } from "@/lib/types";

interface AppDataContextValue {
  ready: boolean;
  authReady: boolean;
  isAuthenticated: boolean;
  user: User | null;
  supabase: SupabaseClient | null;
  attempts: Attempt[];
  profile: UserProfile;
  preferences: AppPreferences;
  saveAttempt: (attempt: Attempt) => Promise<void>;
  saveProfile: (profile: UserProfile) => Promise<void>;
  savePreferences: (prefs: AppPreferences) => Promise<void>;
  refresh: () => Promise<void>;
  exportData: () => Promise<AppDataDump>;
  importData: (data: AppDataDump) => Promise<void>;
  signOut: () => Promise<void>;
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
  const localRepo = useMemo(() => getLocalRepository(), []);
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [authReady, setAuthReady] = useState(!supabase);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [preferences, setPreferences] = useState<AppPreferences>(defaultPreferences);

  const repo = useMemo<DataRepository>(() => {
    if (supabase && user) {
      return new SupabaseRepository(supabase, user);
    }
    return localRepo;
  }, [supabase, user, localRepo]);

  const applyPreferences = useCallback((prefs: AppPreferences) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const resolved = resolveTheme(prefs.theme);
    root.classList.toggle("dark", resolved === "dark");
    root.style.colorScheme = resolved;
    root.dataset.reduceMotion = prefs.reducedMotion ? "on" : "off";
    applyThemeCssVars({ accentHue: prefs.accentHue, accentStrength: prefs.accentStrength });
  }, []);

  const refresh = useCallback(async () => {
    if (supabase && user && repo instanceof SupabaseRepository) {
      try {
        await migrateGuestAttemptsToAccount(user.id, {
          guestRepository: localRepo,
          accountRepository: repo
        });
      } catch {
        // Non-blocking: app still loads even if migration fails.
      }
    }

    const [nextAttempts, nextProfile, nextPrefs] = await Promise.all([
      repo.getAttempts(),
      repo.getProfile(),
      repo.getPreferences()
    ]);

    setAttempts(nextAttempts);
    setProfile(nextProfile);
    setPreferences(nextPrefs);
    applyPreferences(nextPrefs);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("ue.preferences.v1", JSON.stringify(nextPrefs));
      window.localStorage.setItem("ue.profile.v1", JSON.stringify(nextProfile));
    }
    setReady(true);
  }, [supabase, user, repo, localRepo, applyPreferences]);

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const sessionUser = data.session?.user ?? null;
      if (sessionUser) {
        const remember = localStorage.getItem("ue.rememberSession");
        const sessionActive = sessionStorage.getItem("ue.activeSession");
        if (remember === "0" && !sessionActive) {
          supabase.auth.signOut();
          setUser(null);
          setAuthReady(true);
          return;
        }
        sessionStorage.setItem("ue.activeSession", "1");
      }
      setUser(sessionUser);
      setAuthReady(true);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!authReady) return;
    setReady(false);
    refresh();
  }, [authReady, refresh]);

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
      if (typeof window !== "undefined") {
        window.localStorage.setItem("ue.profile.v1", JSON.stringify(next));
      }
      await repo.saveProfile(next);
    },
    [repo]
  );

  const savePreferences = useCallback(
    async (next: AppPreferences) => {
      setPreferences(next);
      applyPreferences(next);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("ue.preferences.v1", JSON.stringify(next));
      }
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

  const signOut = useCallback(async () => {
    if (!supabase) return;
    try {
      await fetch("/auth/signout", { method: "POST" });
    } catch {
      // Ignore API route failures and still sign out client-side.
    }
    await supabase.auth.signOut();
    sessionStorage.removeItem("ue.activeSession");
    localStorage.removeItem("ue.rememberSession");
  }, [supabase]);

  const value = useMemo<AppDataContextValue>(
    () => ({
      ready,
      authReady,
      isAuthenticated: Boolean(user),
      user,
      supabase,
      attempts,
      profile,
      preferences,
      saveAttempt,
      saveProfile,
      savePreferences,
      refresh,
      exportData,
      importData,
      signOut
    }),
    [
      ready,
      authReady,
      user,
      supabase,
      attempts,
      profile,
      preferences,
      saveAttempt,
      saveProfile,
      savePreferences,
      refresh,
      exportData,
      importData,
      signOut
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
