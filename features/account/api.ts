import type { SupabaseClient } from "@supabase/supabase-js";
import type { UniversityRecord } from "@/lib/supabase/types";
import { courses as seededCourses } from "@/data/seed";

interface CourseCatalogRow {
  id: string;
  code: string | null;
}

async function fetchCourseCatalog(client: SupabaseClient) {
  const { data, error } = await client.from("courses").select("id, code");
  if (error) throw error;
  return (data ?? []) as CourseCatalogRow[];
}

function normalizeCode(value: string | null | undefined) {
  return (value ?? "").trim().toUpperCase();
}

export async function fetchUniversities(client: SupabaseClient) {
  const pageSize = 1000;
  let from = 0;
  const all: UniversityRecord[] = [];

  while (true) {
    const to = from + pageSize - 1;
    const { data, error } = await client
      .from("universities")
      .select("id, name")
      .order("name", { ascending: true })
      .range(from, to);

    if (error) throw error;

    const rows = (data ?? []) as UniversityRecord[];
    all.push(...rows);

    if (rows.length < pageSize) break;
    from += pageSize;

    // Safety guard in case a misconfigured backend keeps returning full pages.
    if (from >= 50000) break;
  }

  return all;
}

export async function fetchUserCourses(client: SupabaseClient, userId: string) {
  const [catalog, userCoursesResult] = await Promise.all([
    fetchCourseCatalog(client),
    client
      .from("user_courses")
      .select("course_id")
      .eq("user_id", userId)
  ]);

  const { data, error } = userCoursesResult;
  if (error) throw error;

  const seedById = new Map(seededCourses.map((course) => [course.id, course.id]));
  const seedByCode = new Map(
    seededCourses.map((course) => [normalizeCode(course.code), course.id])
  );
  const catalogById = new Map(catalog.map((course) => [course.id, course]));
  const catalogByCode = new Map(
    catalog.map((course) => [normalizeCode(course.code), course.id])
  );

  return Array.from(
    new Set(
      (data ?? []).map((row) => {
        const raw = String(row.course_id ?? "");
        if (seedById.has(raw)) {
          return raw;
        }

        const rawCode = normalizeCode(raw);
        const seedIdByRawCode = seedByCode.get(rawCode);
        if (seedIdByRawCode) {
          return seedIdByRawCode;
        }

        const catalogRow = catalogById.get(raw);
        const seedIdByCatalogCode = seedByCode.get(normalizeCode(catalogRow?.code));
        if (seedIdByCatalogCode) {
          return seedIdByCatalogCode;
        }

        const catalogIdByCode = catalogByCode.get(rawCode);
        if (catalogIdByCode) {
          const byCatalogCode = seedByCode.get(
            normalizeCode(catalogById.get(catalogIdByCode)?.code)
          );
          if (byCatalogCode) {
            return byCatalogCode;
          }
        }

        return raw;
      })
    )
  );
}

export async function saveUserCourses(client: SupabaseClient, userId: string, courseIds: string[]) {
  const [catalog] = await Promise.all([fetchCourseCatalog(client)]);
  const catalogIdSet = new Set(catalog.map((course) => course.id));
  const catalogByCode = new Map(catalog.map((course) => [normalizeCode(course.code), course.id]));
  const seedById = new Map(seededCourses.map((course) => [course.id, course]));

  const normalizedCourseIds = courseIds.map((courseId) => {
    if (catalogIdSet.has(courseId)) return courseId;
    const seedCourse = seedById.get(courseId);
    if (!seedCourse) return courseId;
    return catalogByCode.get(normalizeCode(seedCourse.code)) ?? courseId;
  });

  const uniqueCourseIds = Array.from(new Set(normalizedCourseIds));

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
