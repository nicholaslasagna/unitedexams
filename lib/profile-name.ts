import type { UserProfile } from "@/lib/types";

function clean(value: string | null | undefined) {
  const next = value?.trim();
  return next ? next : null;
}

export function resolveInternalName(input: {
  realName?: string | null;
  displayName?: string | null;
  fallback?: string | null;
}) {
  return (
    clean(input.realName) ??
    clean(input.displayName) ??
    clean(input.fallback) ??
    "Student"
  );
}

export function resolveProfileInternalName(
  profile: Pick<UserProfile, "realName" | "name"> | null | undefined,
  fallback = "Student"
) {
  return resolveInternalName({
    realName: profile?.realName,
    displayName: profile?.name,
    fallback
  });
}
