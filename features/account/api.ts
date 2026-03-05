import type { SupabaseClient } from "@supabase/supabase-js";
import type { UniversityRecord } from "@/lib/supabase/types";
import { courses as seededCourses } from "@/data/seed";

interface CourseCatalogRow {
  id: string;
  code: string | null;
  title: string | null;
}

async function fetchCourseCatalog(client: SupabaseClient) {
  const { data, error } = await client.from("courses").select("id, code, title");
  if (error) throw error;
  return (data ?? []) as CourseCatalogRow[];
}

function normalizeCode(value: string | null | undefined) {
  return (value ?? "").trim().toUpperCase();
}

function normalizeText(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, " ");
}

function resolveCatalogCourseIdForSeedCourse(
  seedCourseId: string,
  catalog: CourseCatalogRow[]
): string | null {
  const directId = catalog.find((course) => course.id === seedCourseId)?.id;
  if (directId) return directId;

  const seedCourse = seededCourses.find((course) => course.id === seedCourseId);
  if (!seedCourse) return null;

  const byCode = catalog.find(
    (course) => normalizeCode(course.code) === normalizeCode(seedCourse.code)
  )?.id;
  if (byCode) return byCode;

  const seedName = normalizeText(seedCourse.name);
  const byExactTitle = catalog.find(
    (course) => normalizeText(course.title) === seedName
  )?.id;
  if (byExactTitle) return byExactTitle;

  const byLooseTitle = catalog.find((course) => {
    const title = normalizeText(course.title);
    return title.includes(seedName) || seedName.includes(title);
  })?.id;
  if (byLooseTitle) return byLooseTitle;

  return null;
}

export async function fetchUniversities(client: SupabaseClient) {
  const pageSize = 1000;
  let from = 0;
  const all: UniversityRecord[] = [];

  while (true) {
    const to = from + pageSize - 1;
    const { data, error } = await client
      .from("universities")
      .select("id, name, state, country")
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
  const seedByCode = new Map(seededCourses.map((course) => [normalizeCode(course.code), course.id]));
  const seedByTitle = new Map(
    seededCourses.map((course) => [normalizeText(course.name), course.id])
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

        const seedIdByCatalogTitle = seedByTitle.get(normalizeText(catalogRow?.title));
        if (seedIdByCatalogTitle) {
          return seedIdByCatalogTitle;
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

  const resolvedCourseIds = courseIds
    .map((courseId) => {
    if (catalogIdSet.has(courseId)) return courseId;
      return resolveCatalogCourseIdForSeedCourse(courseId, catalog);
    })
    .filter((courseId): courseId is string => Boolean(courseId));

  const uniqueCourseIds = Array.from(new Set(resolvedCourseIds));

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
