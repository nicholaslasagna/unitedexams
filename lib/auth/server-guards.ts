import type { SupabaseClient, User } from "@supabase/supabase-js";

export interface AuthenticatedRouteContext {
  user: User;
  profile: {
    id: string;
    role: "student" | "professor" | "admin";
    university_id: string | null;
    professor_verified?: boolean | null;
    mfa_enabled?: boolean | null;
  };
}

export async function requireAuthenticatedRouteContext(supabase: SupabaseClient) {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, role, university_id, professor_verified, mfa_enabled")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) {
    throw new Error(error?.message || "Profile not found");
  }

  return {
    user,
    profile: profile as AuthenticatedRouteContext["profile"]
  } satisfies AuthenticatedRouteContext;
}

export function requireVerifiedProfessor(context: AuthenticatedRouteContext) {
  if (
    context.profile.role !== "professor" ||
    !context.profile.university_id ||
    !context.profile.professor_verified
  ) {
    throw new Error("Professor access required");
  }
}

export function requireUniversityAdmin(context: AuthenticatedRouteContext) {
  if (context.profile.role !== "admin" || !context.profile.university_id) {
    throw new Error("University-admin access required");
  }
}
