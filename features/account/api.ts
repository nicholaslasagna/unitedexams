import type { SupabaseClient } from "@supabase/supabase-js";
import type { UniversityRecord } from "@/lib/supabase/types";

export async function fetchUniversities(client: SupabaseClient) {
  const { data, error } = await client
    .from("universities")
    .select("id, name, country, state")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as UniversityRecord[];
}

export async function addUniversity(client: SupabaseClient, name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("University name is required.");
  }

  const { data, error } = await client
    .from("universities")
    .insert({ name: trimmed })
    .select("id, name, country, state")
    .single();

  if (error) {
    if (error.code === "23505") {
      const existing = await client
        .from("universities")
        .select("id, name, country, state")
        .ilike("name", trimmed)
        .maybeSingle();
      if (existing.data) return existing.data as UniversityRecord;
    }
    throw error;
  }

  return data as UniversityRecord;
}

export async function fetchUserCourses(client: SupabaseClient, userId: string) {
  const { data, error } = await client
    .from("user_courses")
    .select("course_id")
    .eq("user_id", userId);

  if (error) throw error;
  return (data ?? []).map((row) => row.course_id as string);
}

export async function saveUserCourses(client: SupabaseClient, userId: string, courseIds: string[]) {
  const uniqueCourseIds = Array.from(new Set(courseIds));

  const { error: deleteError } = await client.from("user_courses").delete().eq("user_id", userId);
  if (deleteError) throw deleteError;

  if (uniqueCourseIds.length === 0) return;

  const rows = uniqueCourseIds.map((courseId) => ({ user_id: userId, course_id: courseId }));
  const { error: insertError } = await client.from("user_courses").insert(rows);
  if (insertError) throw insertError;
}

export async function onboardingStatus(client: SupabaseClient, userId: string) {
  const [{ data: profile }, { data: courses }] = await Promise.all([
    client.from("profiles").select("university_id").eq("id", userId).maybeSingle(),
    client.from("user_courses").select("course_id").eq("user_id", userId).limit(1)
  ]);

  return {
    hasUniversity: Boolean(profile?.university_id),
    hasCourses: (courses?.length ?? 0) > 0
  };
}
