import type { DataRepository } from "@/lib/storage/repository";

export async function migrateGuestAttemptsToAccount(
  userId: string,
  {
    guestRepository,
    accountRepository
  }: {
    guestRepository: DataRepository;
    accountRepository: DataRepository;
  }
) {
  const guardKey = `ue.guest-migrated:${userId}`;
  if (typeof window !== "undefined" && window.sessionStorage.getItem(guardKey) === "1") {
    return 0;
  }

  const guestAttempts = await guestRepository.getAttempts();
  if (guestAttempts.length === 0) {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(guardKey, "1");
    }
    return 0;
  }

  for (const attempt of guestAttempts.reverse()) {
    await accountRepository.saveAttempt(attempt);
  }

  await guestRepository.clearAttempts();

  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(guardKey, "1");
  }
  return guestAttempts.length;
}
