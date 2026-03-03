import {
  defaultPreferences,
  defaultProfile,
  STORAGE_KEYS,
  type DataRepository
} from "@/lib/storage/repository";
import type { AppDataDump, AppPreferences, Attempt, UserProfile } from "@/lib/types";

function parse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function storage() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage;
}

export class LocalRepository implements DataRepository {
  async getAttempts(): Promise<Attempt[]> {
    const store = storage();
    if (!store) return [];
    return parse<Attempt[]>(store.getItem(STORAGE_KEYS.attempts), []);
  }

  async saveAttempt(attempt: Attempt): Promise<void> {
    const store = storage();
    if (!store) return;
    const existing = await this.getAttempts();
    store.setItem(STORAGE_KEYS.attempts, JSON.stringify([attempt, ...existing]));
  }

  async clearAttempts(): Promise<void> {
    const store = storage();
    if (!store) return;
    store.removeItem(STORAGE_KEYS.attempts);
  }

  async getProfile(): Promise<UserProfile> {
    const store = storage();
    if (!store) return defaultProfile;
    return parse<UserProfile>(store.getItem(STORAGE_KEYS.profile), defaultProfile);
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    const store = storage();
    if (!store) return;
    store.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
  }

  async getPreferences(): Promise<AppPreferences> {
    const store = storage();
    if (!store) return defaultPreferences;
    return {
      ...defaultPreferences,
      ...parse<AppPreferences>(store.getItem(STORAGE_KEYS.preferences), defaultPreferences)
    };
  }

  async savePreferences(preferences: AppPreferences): Promise<void> {
    const store = storage();
    if (!store) return;
    store.setItem(STORAGE_KEYS.preferences, JSON.stringify(preferences));
  }

  async exportData(): Promise<AppDataDump> {
    return {
      attempts: await this.getAttempts(),
      profile: await this.getProfile(),
      preferences: await this.getPreferences()
    };
  }

  async importData(data: AppDataDump): Promise<void> {
    const store = storage();
    if (!store) return;
    store.setItem(STORAGE_KEYS.attempts, JSON.stringify(data.attempts ?? []));
    store.setItem(STORAGE_KEYS.profile, JSON.stringify(data.profile ?? defaultProfile));
    store.setItem(
      STORAGE_KEYS.preferences,
      JSON.stringify({ ...defaultPreferences, ...(data.preferences ?? {}) })
    );
  }
}

let singleton: LocalRepository | null = null;

export function getLocalRepository(): LocalRepository {
  if (!singleton) singleton = new LocalRepository();
  return singleton;
}

// Backward compatible export for existing imports.
export const getRepository = getLocalRepository;
