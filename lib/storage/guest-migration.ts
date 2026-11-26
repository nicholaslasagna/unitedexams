import type { Attempt } from "@/lib/types";

export interface GuestMigrationResult {
  migratedCount: number;
  failed: boolean;
}

export async function migrateGuestAttemptsToAccount({
  guestRepository,
  accountRepository
}: {
  guestRepository: {
    getAttempts(): Promise<Attempt[]>;
    removeAttempts(ids: ReadonlySet<string>): Promise<void>;
  };
  accountRepository: {
    saveGuestAttempt(attempt: Attempt): Promise<"saved" | "local-only">;
  };
}): Promise<GuestMigrationResult> {
  const guestAttempts = await guestRepository.getAttempts();
  const savedIds = new Set<string>();
  let failed = false;
  // Process oldest first as in the ordinary progression flow, without mutating the snapshot.
  for (const attempt of [...guestAttempts].reverse()) {
    if (savedIds.has(attempt.id)) continue;
    try {
      if ((await accountRepository.saveGuestAttempt(attempt)) === "saved") {
        savedIds.add(attempt.id);
      }
    } catch {
      failed = true;
    }
  }

  // Keep unsupported and failed attempts, plus any new work added during migration.
  if (savedIds.size > 0) await guestRepository.removeAttempts(savedIds);
  return { migratedCount: savedIds.size, failed };
}
