import type { DataRepository } from "@/lib/storage/repository";

const MIGRATED_IDS_KEY = "ue.guest.migrated-attempt-ids.v1";

function readMigratedAttemptIds() {
  if (typeof window === "undefined") return new Set<string>();
  try {
    const raw = window.localStorage.getItem(MIGRATED_IDS_KEY);
    if (!raw) return new Set<string>();
    const parsed = JSON.parse(raw) as string[];
    if (!Array.isArray(parsed)) return new Set<string>();
    return new Set(parsed.filter((id) => typeof id === "string" && id.length > 0));
  } catch {
    return new Set<string>();
  }
}

function writeMigratedAttemptIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MIGRATED_IDS_KEY, JSON.stringify([...ids]));
}

export interface GuestMigrationResult {
  migratedCount: number;
  failed: boolean;
}

export async function migrateGuestAttemptsToAccount(
  userId: string,
  {
    guestRepository,
    accountRepository
  }: {
    guestRepository: DataRepository;
    accountRepository: DataRepository;
  }
): Promise<GuestMigrationResult> {
  const guardKey = `ue.guest-migrated:${userId}`;
  if (typeof window !== "undefined" && window.sessionStorage.getItem(guardKey) === "1") {
    return { migratedCount: 0, failed: false };
  }

  const guestAttempts = await guestRepository.getAttempts();
  if (guestAttempts.length === 0) {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(guardKey, "1");
    }
    return { migratedCount: 0, failed: false };
  }

  const migratedIds = readMigratedAttemptIds();
  const pendingAttempts = guestAttempts.filter((attempt) => !migratedIds.has(attempt.id));

  if (pendingAttempts.length === 0) {
    await guestRepository.clearAttempts();
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(guardKey, "1");
    }
    return { migratedCount: 0, failed: false };
  }

  let migratedCount = 0;
  let failedCount = 0;

  for (const attempt of pendingAttempts.reverse()) {
    try {
      await accountRepository.saveAttempt(attempt);
      migratedCount += 1;
      migratedIds.add(attempt.id);
      writeMigratedAttemptIds(migratedIds);
    } catch {
      // Mark failed legacy attempts as processed so users are not
      // blocked by the same incompatible payload forever.
      failedCount += 1;
      migratedIds.add(attempt.id);
      writeMigratedAttemptIds(migratedIds);
    }
  }

  if (migratedCount > 0 || failedCount > 0) {
    await guestRepository.clearAttempts();
  }

  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(guardKey, "1");
  }
  return { migratedCount, failed: failedCount > 0 };
}
