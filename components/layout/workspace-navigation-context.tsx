"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { courses, getCourse, quizSets } from "@/data/seed";
import { listJoinedSections, listProfessorSections, type JoinedSectionSummary, type SectionSummary } from "@/features/professor/api";
import { isUniversityAdmin, isVerifiedProfessor } from "@/lib/auth/roles";
import { useAppData } from "@/lib/app-data-context";
import { resolveQuizSetMode } from "@/lib/study/set-mode";

const STATIC_SECTION_SEGMENTS = new Set(["materials", "homework", "gradebook", "analytics"]);
const STATIC_TOOLS: Array<{ href: string; label: string; kind: WorkspaceSearchSuggestion["kind"] }> = [
  { href: "/app/dashboard", label: "Dashboard", kind: "page" },
  { href: "/app/courses", label: "Courses", kind: "page" },
  { href: "/app/sections", label: "Sections", kind: "page" },
  { href: "/app/homework", label: "Homework", kind: "page" },
  { href: "/app/exams", label: "Exams", kind: "page" },
  { href: "/app/announcements", label: "Announcements", kind: "page" },
  { href: "/app/notes", label: "Notes", kind: "page" },
  { href: "/app/grades", label: "Grades", kind: "page" },
  { href: "/app/account", label: "Account", kind: "page" },
  { href: "/app/settings", label: "Settings", kind: "page" }
];

export interface WorkspaceSectionLink {
  id: string;
  name: string;
  courseId: string;
  term: string | null;
  role: "student" | "professor" | "ta";
  primaryHref: string;
  materialsHref: string;
  homeworkHref: string;
  announcementsHref: string;
  gradebookHref: string | null;
  examsHref: string | null;
  analyticsHref: string | null;
}

export interface WorkspaceBreadcrumb {
  href: string;
  label: string;
}

export interface WorkspaceQuickAction {
  href: string;
  label: string;
}

export interface WorkspaceSearchSuggestion {
  key: string;
  label: string;
  href: string;
  kind: "page" | "course" | "section" | "notes" | "quiz" | "exam" | "homework";
}

export interface WorkspacePageMeta {
  eyebrow: string;
  title: string;
  breadcrumbs: WorkspaceBreadcrumb[];
  quickActions: WorkspaceQuickAction[];
}

interface WorkspaceNavigationValue {
  showProfessor: boolean;
  showSchoolAdmin: boolean;
  showSections: boolean;
  showAnnouncements: boolean;
  showGrades: boolean;
  sectionsLoading: boolean;
  sections: WorkspaceSectionLink[];
  currentSection: WorkspaceSectionLink | null;
  pageMeta: WorkspacePageMeta;
  searchSuggestions: (query: string) => WorkspaceSearchSuggestion[];
}

const WorkspaceNavigationContext = createContext<WorkspaceNavigationValue | null>(null);

function clampActions(actions: Array<WorkspaceQuickAction | null | false | undefined>) {
  const seen = new Set<string>();
  return actions
    .filter((action): action is WorkspaceQuickAction => Boolean(action))
    .filter((action) => {
      if (seen.has(action.href)) return false;
      seen.add(action.href);
      return true;
    })
    .slice(0, 4);
}

function pickCurrentSectionId(pathname: string, searchParams: URLSearchParams, sections: WorkspaceSectionLink[]) {
  const pathSegments = pathname.split("/").filter(Boolean);
  if (pathSegments[0] !== "app") return null;

  if (pathSegments[1] === "sections") {
    const rawSectionId = pathSegments[2];
    if (rawSectionId && !STATIC_SECTION_SEGMENTS.has(rawSectionId)) {
      return rawSectionId;
    }
  }

  const sectionFromQuery = searchParams.get("section");
  if (sectionFromQuery) return sectionFromQuery;

  const courseId = pathSegments[1] === "courses" || pathSegments[1] === "notes" ? pathSegments[2] : null;
  if (courseId) {
    const matches = sections.filter((section) => section.courseId === courseId);
    if (matches.length === 1) return matches[0].id;
  }

  return null;
}

function buildPageMeta(params: {
  pathname: string;
  showProfessor: boolean;
  showSchoolAdmin: boolean;
  showGrades: boolean;
  currentSection: WorkspaceSectionLink | null;
}) {
  const { pathname, showProfessor, showSchoolAdmin, showGrades, currentSection } = params;
  const pathSegments = pathname.split("/").filter(Boolean).slice(1);
  const root: WorkspaceBreadcrumb = {
    href: showSchoolAdmin ? "/app/admin/professors" : "/app/dashboard",
    label: showSchoolAdmin ? "Professor Staff" : "Dashboard"
  };

  if (showSchoolAdmin) {
    return {
      eyebrow: "University administration",
      title: "Professor Staff",
      breadcrumbs: [root],
      quickActions: clampActions([
        { href: "/app/account", label: "Account" },
        { href: "/app/settings", label: "Settings" }
      ])
    } satisfies WorkspacePageMeta;
  }

  const first = pathSegments[0] ?? "dashboard";
  const courseId = first === "courses" || first === "notes" ? pathSegments[1] ?? null : null;
  const course = courseId ? getCourse(courseId) : null;
  const sectionBreadcrumbs = currentSection
    ? [
        root,
        { href: "/app/sections", label: "Sections" },
        {
          href: showProfessor ? `/app/sections/${currentSection.id}` : currentSection.materialsHref,
          label: currentSection.name
        }
      ]
    : [root, { href: "/app/sections", label: "Sections" }];

  switch (first) {
    case "dashboard":
      return {
        eyebrow: showProfessor ? "Professor workspace" : "Study workspace",
        title: "Dashboard",
        breadcrumbs: [root],
        quickActions: clampActions(
          showProfessor
            ? [
                currentSection
                  ? { href: `/app/sections/${currentSection.id}`, label: currentSection.name }
                  : { href: "/app/sections", label: "Sections" },
                currentSection?.gradebookHref
                  ? { href: currentSection.gradebookHref, label: "Gradebook" }
                  : { href: "/app/exams", label: "Exam studio" },
                { href: "/app/announcements", label: "Announcements" }
              ]
            : [
                currentSection
                  ? { href: currentSection.materialsHref, label: currentSection.name }
                  : { href: "/app/courses", label: "Courses" },
                showGrades ? { href: "/app/grades", label: "Grades" } : null,
                { href: "/app/notes", label: "Notes" }
              ]
        )
      } satisfies WorkspacePageMeta;
    case "courses":
      return {
        eyebrow: course ? "Course" : "Explore and review",
        title: course?.name ?? "Courses",
        breadcrumbs: course
          ? [root, { href: "/app/courses", label: "Courses" }, { href: `/app/courses/${course.id}`, label: course.name }]
          : [root, { href: "/app/courses", label: "Courses" }],
        quickActions: clampActions([
          course ? { href: `/app/notes/${course.id}`, label: "Notes" } : { href: "/app/notes", label: "Notes" },
          currentSection
            ? { href: showProfessor ? `/app/sections/${currentSection.id}` : currentSection.materialsHref, label: "Section workspace" }
            : { href: "/app/sections", label: "Sections" },
          showGrades ? { href: "/app/grades", label: "Grades" } : null
        ])
      } satisfies WorkspacePageMeta;
    case "notes":
      return {
        eyebrow: "Reference material",
        title: course?.name ? `${course.name} notes` : "Notes",
        breadcrumbs: course
          ? [root, { href: "/app/notes", label: "Notes" }, { href: `/app/notes/${course.id}`, label: course.name }]
          : [root, { href: "/app/notes", label: "Notes" }],
        quickActions: clampActions([
          course ? { href: `/app/courses/${course.id}`, label: "Course" } : { href: "/app/courses", label: "Courses" },
          currentSection ? { href: currentSection.materialsHref, label: "Materials" } : null,
          showGrades ? { href: "/app/grades", label: "Grades" } : null
        ])
      } satisfies WorkspacePageMeta;
    case "sections": {
      const subsection = pathSegments[2] ?? pathSegments[1] ?? null;
      let title = currentSection?.name ?? "Sections";
      if (!currentSection && pathSegments[1] === "materials") title = "Section materials";
      if (!currentSection && pathSegments[1] === "homework") title = "Section homework";
      if (!currentSection && pathSegments[1] === "gradebook") title = "Gradebook";
      if (currentSection && subsection === "materials") title = `${currentSection.name} materials`;
      if (currentSection && subsection === "gradebook") title = `${currentSection.name} gradebook`;
      if (currentSection && subsection === "analytics") title = `${currentSection.name} analytics`;

      return {
        eyebrow: showProfessor ? "Teaching workspace" : "Class workspace",
        title,
        breadcrumbs:
          currentSection && subsection
            ? [...sectionBreadcrumbs, { href: pathname, label: title.replace(`${currentSection.name} `, "") }]
            : currentSection
              ? sectionBreadcrumbs
              : [root, { href: "/app/sections", label: "Sections" }],
        quickActions: clampActions(
          currentSection
            ? [
                showProfessor ? { href: `/app/sections/${currentSection.id}`, label: "Section home" } : { href: "/app/sections", label: "All sections" },
                { href: currentSection.materialsHref, label: "Materials" },
                currentSection.gradebookHref ? { href: currentSection.gradebookHref, label: "Gradebook" } : null,
                currentSection.examsHref ? { href: currentSection.examsHref, label: "Exams" } : { href: currentSection.announcementsHref, label: "Announcements" }
              ]
            : [
                { href: "/app/sections", label: "All sections" },
                { href: "/app/sections/materials", label: "Materials" },
                showProfessor ? { href: "/app/sections/gradebook", label: "Gradebook" } : showGrades ? { href: "/app/grades", label: "Grades" } : null
              ]
        )
      } satisfies WorkspacePageMeta;
    }
    case "homework":
      return {
        eyebrow: "Assignments and progress",
        title: "Homework",
        breadcrumbs: [root, { href: "/app/homework", label: "Homework" }],
        quickActions: clampActions([
          currentSection ? { href: currentSection.materialsHref, label: "Current class" } : { href: "/app/sections", label: "Sections" },
          showGrades ? { href: "/app/grades", label: "Grades" } : { href: "/app/notes", label: "Notes" },
          { href: "/app/announcements", label: "Announcements" }
        ])
      } satisfies WorkspacePageMeta;
    case "exams":
      return {
        eyebrow: showProfessor ? "Assessment authoring" : "Timed assessment",
        title: showProfessor ? "Exam studio" : "Exams",
        breadcrumbs: [root, { href: "/app/exams", label: showProfessor ? "Exam studio" : "Exams" }],
        quickActions: clampActions(
          showProfessor
            ? [
                currentSection?.examsHref ? { href: currentSection.examsHref, label: currentSection.name } : { href: "/app/sections", label: "Sections" },
                currentSection?.gradebookHref ? { href: currentSection.gradebookHref, label: "Gradebook" } : null,
                { href: "/app/announcements", label: "Announcements" }
              ]
            : [
                currentSection ? { href: currentSection.materialsHref, label: "Current class" } : { href: "/app/courses", label: "Courses" },
                { href: "/app/notes", label: "Notes" },
                showGrades ? { href: "/app/grades", label: "Grades" } : null
              ]
        )
      } satisfies WorkspacePageMeta;
    case "announcements":
      return {
        eyebrow: "Section communication",
        title: currentSection ? `${currentSection.name} announcements` : "Announcements",
        breadcrumbs: currentSection ? [...sectionBreadcrumbs, { href: currentSection.announcementsHref, label: "Announcements" }] : [root, { href: "/app/announcements", label: "Announcements" }],
        quickActions: clampActions([
          currentSection ? { href: currentSection.materialsHref, label: "Materials" } : { href: "/app/sections", label: "Sections" },
          currentSection?.gradebookHref ? { href: currentSection.gradebookHref, label: "Gradebook" } : showGrades ? { href: "/app/grades", label: "Grades" } : null,
          { href: "/app/notes", label: "Notes" }
        ])
      } satisfies WorkspacePageMeta;
    case "grades":
      return {
        eyebrow: "Standing and feedback",
        title: "Grades",
        breadcrumbs: [root, { href: "/app/grades", label: "Grades" }],
        quickActions: clampActions([
          currentSection ? { href: currentSection.materialsHref, label: "Current class" } : { href: "/app/courses", label: "Courses" },
          { href: "/app/notes", label: "Notes" },
          { href: "/app/announcements", label: "Announcements" }
        ])
      } satisfies WorkspacePageMeta;
    case "interviews":
      return {
        eyebrow: "Interview practice",
        title: "Interviews",
        breadcrumbs: [root, { href: "/app/interviews", label: "Interviews" }],
        quickActions: clampActions([
          { href: "/app/dashboard", label: "Home" },
          { href: "/app/courses", label: "My classes" }
        ])
      } satisfies WorkspacePageMeta;
    case "leaderboard":
      return {
        eyebrow: "Momentum tracking",
        title: "Leaderboard",
        breadcrumbs: [root, { href: "/app/leaderboard", label: "Leaderboard" }],
        quickActions: clampActions([
          { href: "/app/dashboard", label: "Dashboard" },
          showGrades ? { href: "/app/grades", label: "Grades" } : null,
          { href: "/app/courses", label: "Courses" }
        ])
      } satisfies WorkspacePageMeta;
    case "account":
      return {
        eyebrow: "Profile and identity",
        title: "Account",
        breadcrumbs: [root, { href: "/app/account", label: "Account" }],
        quickActions: clampActions([
          { href: "/app/settings", label: "Settings" },
          showProfessor ? { href: "/app/sections", label: "Sections" } : { href: "/app/dashboard", label: "Dashboard" }
        ])
      } satisfies WorkspacePageMeta;
    case "settings":
      return {
        eyebrow: "Preferences and security",
        title: "Settings",
        breadcrumbs: [root, { href: "/app/settings", label: "Settings" }],
        quickActions: clampActions([
          { href: "/app/account", label: "Account" },
          showGrades ? { href: "/app/grades", label: "Grades" } : { href: "/app/dashboard", label: "Dashboard" }
        ])
      } satisfies WorkspacePageMeta;
    default:
      return {
        eyebrow: "United Exams",
        title: "Workspace",
        breadcrumbs: [root],
        quickActions: clampActions([
          { href: "/app/dashboard", label: "Dashboard" },
          { href: "/app/courses", label: "Courses" },
          showProfessor ? { href: "/app/sections", label: "Sections" } : currentSection ? { href: currentSection.materialsHref, label: "Current class" } : null
        ])
      } satisfies WorkspacePageMeta;
  }
}

function scoreMatch(label: string, query: string) {
  const normalizedLabel = label.toLowerCase();
  if (normalizedLabel === query) return 100;
  if (normalizedLabel.startsWith(query)) return 80;
  if (normalizedLabel.includes(query)) return 50;
  return 0;
}

function buildSearchSuggestions(params: {
  query: string;
  sections: WorkspaceSectionLink[];
  showGrades: boolean;
  showProfessor: boolean;
  showAnnouncements: boolean;
}) {
  const { query, sections, showGrades, showProfessor, showAnnouncements } = params;
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const pool: WorkspaceSearchSuggestion[] = [];

  for (const tool of STATIC_TOOLS) {
    if (tool.href === "/app/grades" && !showGrades) continue;
    if (tool.href === "/app/announcements" && !showAnnouncements) continue;
    pool.push({
      key: tool.href,
      label: tool.label,
      href: tool.href,
      kind: tool.kind
    });
  }

  for (const course of courses) {
    pool.push({
      key: `course:${course.id}`,
      label: `${course.code} · ${course.name}`,
      href: `/app/courses/${course.id}`,
      kind: "course"
    });
    pool.push({
      key: `notes:${course.id}`,
      label: `${course.name} notes`,
      href: `/app/notes/${course.id}`,
      kind: "notes"
    });
  }

  for (const section of sections) {
    pool.push({
      key: `section:${section.id}`,
      label: `${section.name} · ${section.courseId}`,
      href: showProfessor ? `/app/sections/${section.id}` : section.materialsHref,
      kind: "section"
    });
  }

  for (const quiz of quizSets.slice(0, 40)) {
    const mode = resolveQuizSetMode(quiz);
    pool.push({
      key: `set:${quiz.id}`,
      label: `${quiz.title} · ${getCourse(quiz.courseId)?.code ?? quiz.courseId}`,
      href: `/quiz/${quiz.id}`,
      kind: mode === "exam" ? "exam" : mode === "homework" ? "homework" : "quiz"
    });
  }

  return pool
    .map((suggestion) => ({
      suggestion,
      score: scoreMatch(suggestion.label, q)
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.suggestion.label.localeCompare(right.suggestion.label))
    .map((entry) => entry.suggestion)
    .filter((suggestion, index, all) => all.findIndex((item) => item.href === suggestion.href) === index)
    .slice(0, 8);
}

function mapProfessorSection(section: SectionSummary): WorkspaceSectionLink {
  return {
    id: section.id,
    name: section.name,
    courseId: section.course_id,
    term: section.term,
    role: "professor",
    primaryHref: `/app/sections/${section.id}`,
    materialsHref: `/app/sections/${section.id}/materials`,
    homeworkHref: "/app/sections/homework",
    announcementsHref: `/app/announcements?section=${section.id}`,
    gradebookHref: `/app/sections/${section.id}/gradebook`,
    examsHref: `/app/professor/sections/${section.id}/exams`,
    analyticsHref: `/app/sections/${section.id}/analytics`
  };
}

function mapJoinedSection(section: JoinedSectionSummary): WorkspaceSectionLink {
  return {
    id: section.sectionId,
    name: section.sectionName,
    courseId: section.courseId,
    term: section.term,
    role: section.role,
    primaryHref: `/app/sections/${section.sectionId}/materials`,
    materialsHref: `/app/sections/${section.sectionId}/materials`,
    homeworkHref: "/app/sections/homework",
    announcementsHref: `/app/announcements?section=${section.sectionId}`,
    gradebookHref: null,
    examsHref: null,
    analyticsHref: null
  };
}

export function WorkspaceNavigationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { profile, isAuthenticated, supabase, user } = useAppData();
  const [sections, setSections] = useState<WorkspaceSectionLink[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [searchString, setSearchString] = useState("");

  const showProfessor = isVerifiedProfessor(profile);
  const showSchoolAdmin = isUniversityAdmin(profile);

  useEffect(() => {
    if (!isAuthenticated || !supabase || !user || showSchoolAdmin) {
      setSections([]);
      setSectionsLoading(false);
      return;
    }

    let active = true;
    setSectionsLoading(true);

    const load = async () => {
      try {
        if (showProfessor) {
          const rows = await listProfessorSections(supabase);
          if (!active) return;
          setSections(rows.map(mapProfessorSection));
          return;
        }

        const rows = await listJoinedSections(supabase, user.id);
        if (!active) return;
        setSections(rows.map(mapJoinedSection));
      } catch {
        if (!active) return;
        setSections([]);
      } finally {
        if (!active) return;
        setSectionsLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [isAuthenticated, showProfessor, showSchoolAdmin, supabase, user]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncSearch = () => {
      const nextSearch = window.location.search;
      setSearchString((current) => (current === nextSearch ? current : nextSearch));
    };

    const notify = () => window.dispatchEvent(new Event("ue:navigation-search"));
    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(window.history);

    window.history.pushState = function pushState(...args) {
      originalPushState(...args);
      notify();
    };

    window.history.replaceState = function replaceState(...args) {
      originalReplaceState(...args);
      notify();
    };

    syncSearch();
    window.addEventListener("popstate", syncSearch);
    window.addEventListener("ue:navigation-search", syncSearch);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", syncSearch);
      window.removeEventListener("ue:navigation-search", syncSearch);
    };
  }, []);

  const searchParams = useMemo(() => new URLSearchParams(searchString), [searchString]);

  const currentSectionId = useMemo(
    () => pickCurrentSectionId(pathname, searchParams, sections),
    [pathname, searchParams, sections]
  );

  const currentSection = useMemo(
    () => sections.find((section) => section.id === currentSectionId) ?? null,
    [currentSectionId, sections]
  );

  const showSections = showProfessor || sections.length > 0;
  const showAnnouncements = showProfessor || sections.length > 0;
  const showGrades = !showProfessor && !showSchoolAdmin && profile.role === "student";

  const pageMeta = useMemo(
    () =>
      buildPageMeta({
        pathname,
        showProfessor,
        showSchoolAdmin,
        showGrades,
        currentSection
      }),
    [currentSection, pathname, showGrades, showProfessor, showSchoolAdmin]
  );

  const searchSuggestions = useMemo(
    () =>
      (query: string) =>
        buildSearchSuggestions({
          query,
          sections,
          showGrades,
          showProfessor,
          showAnnouncements
        }),
    [sections, showAnnouncements, showGrades, showProfessor]
  );

  const value = useMemo(
    () =>
      ({
        showProfessor,
        showSchoolAdmin,
        showSections,
        showAnnouncements,
        showGrades,
        sectionsLoading,
        sections,
        currentSection,
        pageMeta,
        searchSuggestions
      }) satisfies WorkspaceNavigationValue,
    [
      currentSection,
      pageMeta,
      searchSuggestions,
      sections,
      sectionsLoading,
      showAnnouncements,
      showGrades,
      showProfessor,
      showSchoolAdmin,
      showSections
    ]
  );

  return <WorkspaceNavigationContext.Provider value={value}>{children}</WorkspaceNavigationContext.Provider>;
}

export function useWorkspaceNavigation() {
  const value = useContext(WorkspaceNavigationContext);
  if (!value) {
    throw new Error("useWorkspaceNavigation must be used within WorkspaceNavigationProvider");
  }
  return value;
}
