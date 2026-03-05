import type { UserProfile } from "@/lib/types";

type RoleShape = Pick<UserProfile, "role" | "universityId" | "professorVerified">;

export function isVerifiedProfessor(profile: RoleShape | null | undefined) {
  return (
    profile?.role === "professor" &&
    Boolean(profile.universityId) &&
    Boolean(profile.professorVerified)
  );
}

export function isUniversityAdmin(profile: Pick<UserProfile, "role" | "universityId"> | null | undefined) {
  return profile?.role === "admin" && Boolean(profile.universityId);
}
