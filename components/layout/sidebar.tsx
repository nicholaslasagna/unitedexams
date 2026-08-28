"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ListChecks,
  Timer,
  Settings,
  UserRound,
  GraduationCap,
  BookMarked,
  ClipboardList,
  Megaphone,
  ChevronDown,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { resolveNavItems, STUDY_TOOL_HREFS } from "@/lib/navigation/nav-model";
import { NavRow } from "@/components/layout/nav-row";
import { cn } from "@/lib/utils";
import { useAppData } from "@/lib/app-data-context";
import { resolveProfileInternalName } from "@/lib/profile-name";
import { useWorkspaceNavigation, type WorkspaceSectionLink } from "@/components/layout/workspace-navigation-context";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  sectionGroup?: boolean;
  children?: NavItem[];
}

/*
 * Labels, icons and order come from lib/navigation/nav-model.ts, which the
 * public top bar reads too. They used to be declared separately in each
 * file and had drifted — the same destination was "My classes" here and
 * "Courses" up there — so signing in looked like arriving in a different
 * product.
 */
const baseItems: NavItem[] = resolveNavItems("member").map((item) => ({
  href: item.href,
  label: item.label,
  icon: item.icon
}));

function buildItems(params: {
  showProfessor: boolean;
  showSchoolAdmin: boolean;
  showSections: boolean;
  showAnnouncements: boolean;
  showGrades: boolean;
  currentSection: WorkspaceSectionLink | null;
}) {
  const { showProfessor, showSchoolAdmin, showSections, showAnnouncements, showGrades, currentSection } = params;

  if (showSchoolAdmin) {
    return [
      { href: "/app/admin/professors", label: "Professor Staff", icon: GraduationCap },
      { href: "/app/account", label: "Account", icon: UserRound },
      { href: "/app/settings", label: "Settings", icon: Settings }
    ] satisfies NavItem[];
  }

  const announcementItem = {
    href: "/app/announcements",
    label: "Announcements",
    icon: Megaphone
  };
  const gradesItem = {
    href: "/app/grades",
    label: "Grades",
    icon: ClipboardList
  };

  const studentItems = showAnnouncements
    ? [...baseItems.slice(0, 4), announcementItem, ...baseItems.slice(4)]
    : baseItems;

  if (!showProfessor) {
    if (!showSections) return studentItems;
    return [
      studentItems[0],
      studentItems[1],
      {
        href: "/app/sections",
        label: "Sections",
        icon: GraduationCap,
        sectionGroup: true,
        children: currentSection
          ? [
              { href: "/app/sections", label: "Overview", icon: GraduationCap },
              { href: currentSection.materialsHref, label: "Materials", icon: BookMarked },
              { href: currentSection.announcementsHref, label: "Announcements", icon: Megaphone },
              { href: "/app/sections/homework", label: "Homework", icon: ListChecks }
            ]
          : [
              { href: "/app/sections", label: "Overview", icon: GraduationCap },
              { href: "/app/sections/materials", label: "Materials", icon: BookMarked },
              { href: "/app/sections/homework", label: "Homework", icon: ListChecks }
            ]
      },
      ...(showGrades ? [gradesItem] : []),
      ...studentItems.slice(2)
    ];
  }

  const professorBase = showAnnouncements
    ? [...baseItems.slice(0, 4), announcementItem, ...baseItems.slice(4)]
    : baseItems;

  return [
    professorBase[0],
    professorBase[1],
    {
      href: "/app/sections",
      label: "Sections",
      icon: GraduationCap,
      sectionGroup: true,
      children: currentSection
        ? [
            { href: "/app/sections", label: "Overview", icon: GraduationCap },
            { href: `/app/sections/${currentSection.id}`, label: "Section home", icon: BookMarked },
            { href: currentSection.materialsHref, label: "Materials", icon: BookMarked },
            { href: currentSection.gradebookHref ?? "/app/sections/gradebook", label: "Gradebook", icon: ClipboardList },
            { href: currentSection.examsHref ?? "/app/exams", label: "Exams", icon: Timer }
          ]
        : [
            { href: "/app/sections", label: "Overview", icon: GraduationCap },
            { href: "/app/sections/materials", label: "Materials", icon: BookMarked },
            { href: "/app/sections/homework", label: "Homework", icon: ListChecks },
            { href: "/app/sections/gradebook", label: "Gradebook", icon: ClipboardList }
          ]
    },
    ...professorBase.slice(3)
  ];
}

function SectionQuickList({
  sections,
  currentSection,
  showProfessor,
  mobile = false,
  onNavigate
}: {
  sections: WorkspaceSectionLink[];
  currentSection: WorkspaceSectionLink | null;
  showProfessor: boolean;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  if (sections.length === 0) return null;

  return (
    <div className={cn("space-y-2", mobile && "space-y-2.5")}>
      <div className="flex items-center justify-between gap-2 px-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
          {showProfessor ? "Teaching now" : "Your classes"}
        </p>
        <Link
          href="/app/sections"
          onClick={onNavigate}
          className="text-[11px] font-semibold text-faint transition-colors duration-150 hover:text-text"
        >
          View all
        </Link>
      </div>

      <div className="space-y-2">
        {sections.slice(0, mobile ? 5 : 4).map((section) => {
          const active = currentSection?.id === section.id;
          return (
            <Link
              key={section.id}
              href={section.primaryHref}
              onClick={onNavigate}
              className={cn(
                "group flex items-center justify-between gap-3 rounded-xl border px-3 py-3 transition-all duration-150",
                active
                  ? "border-accent/35 bg-accent-subtle"
                  : "border-borderc bg-soft hover:border-border-bright hover:bg-overlay"
              )}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text">{section.name}</p>
                <p className="truncate text-xs text-faint">
                  {section.courseId}
                  {section.term ? ` · ${section.term}` : ""}
                </p>
              </div>
              <span className="shrink-0 text-[11px] font-semibold text-accent">
                {showProfessor ? "Open" : "Materials"}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function NavigationList({
  items,
  pathname,
  sectionsOpen,
  setSectionsOpen,
  onNavigate,
  mobile = false
}: {
  items: NavItem[];
  pathname: string;
  sectionsOpen: boolean;
  setSectionsOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  onNavigate?: () => void;
  mobile?: boolean;
}) {
  const itemClass = mobile
    ? "group relative flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[15px] font-medium transition-all duration-150 ease-out-expo"
    : "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-all duration-150 ease-out-expo";

  const childClass = mobile
    ? "group relative flex items-center gap-3 rounded-2xl py-3 pl-11 pr-4 text-[14px] font-medium transition-all duration-150 ease-out-expo"
    : "group relative flex items-center gap-3 rounded-xl py-2 pl-10 pr-3 text-[13px] font-medium transition-all duration-150 ease-out-expo";

  return (
    <nav aria-label={mobile ? "Mobile main" : "Main"} className={cn("space-y-1", mobile && "space-y-1.5")}>
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname.startsWith(item.href);

        if (item.sectionGroup && item.children) {
          const parentExact = pathname === "/app/sections" || pathname === "/app/sections/";
          const ChevronIcon = sectionsOpen ? ChevronDown : ChevronRight;

          return (
            <div key={item.href}>
              <div className="relative flex items-center">
                <Link
                  href={item.href}
                  aria-current={parentExact ? "page" : undefined}
                  onClick={onNavigate}
                  className={cn(
                    itemClass,
                    "flex-1",
                    active ? "bg-accent-subtle text-text" : "text-faint hover:bg-soft hover:text-muted"
                  )}
                >
                  {active ? (
                    <span
                      className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-x-0.5 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_8px_hsl(var(--accent)/0.4)]"
                      aria-hidden
                    />
                  ) : null}
                  <Icon
                    className={cn(
                      mobile ? "h-[18px] w-[18px]" : "h-[17px] w-[17px]",
                      active ? "text-accent" : "text-faint group-hover:text-muted"
                    )}
                  />
                  <span>{item.label}</span>
                </Link>

                <button
                  type="button"
                  aria-label={sectionsOpen ? "Collapse sections" : "Expand sections"}
                  onClick={(event) => {
                    event.stopPropagation();
                    setSectionsOpen((prev) => !prev);
                  }}
                  className={cn(
                    "absolute right-2 flex items-center justify-center rounded-lg text-faint transition-colors duration-150 hover:bg-soft hover:text-muted",
                    mobile ? "h-8 w-8" : "h-6 w-6"
                  )}
                >
                  <ChevronIcon className={mobile ? "h-4 w-4" : "h-3.5 w-3.5"} />
                </button>
              </div>

              <div
                className="grid transition-[grid-template-rows] duration-200 ease-out"
                style={{ gridTemplateRows: sectionsOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <div className={cn("space-y-1 pt-1", mobile && "space-y-1.5 pt-2")}>
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const childActive =
                        child.href === "/app/sections"
                          ? parentExact
                          : pathname.startsWith(child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          aria-current={childActive ? "page" : undefined}
                          onClick={onNavigate}
                          className={cn(
                            childClass,
                            childActive
                              ? "bg-accent-subtle text-text"
                              : "text-faint hover:bg-soft hover:text-muted"
                          )}
                        >
                          {childActive ? (
                            <span
                              className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-x-0.5 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_8px_hsl(var(--accent)/0.4)]"
                              aria-hidden
                            />
                          ) : null}
                          <ChildIcon
                            className={cn(
                              mobile ? "h-4 w-4" : "h-[15px] w-[15px]",
                              childActive ? "text-accent" : "text-faint group-hover:text-muted"
                            )}
                          />
                          <span>{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        }

        // Shared with the public sidebar so the two render identically.
        return (
          <NavRow
            key={item.href}
            href={item.href}
            label={item.label}
            icon={Icon}
            active={active}
            onNavigate={onNavigate}
            mobile={mobile}
          />
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { profile } = useAppData();
  const accountName = resolveProfileInternalName(profile);
  const {
    showProfessor,
    showSchoolAdmin,
    showSections,
    showAnnouncements,
    showGrades,
    sections,
    currentSection
  } = useWorkspaceNavigation();
  const focusedSection = currentSection ?? sections[0] ?? null;
  const [sectionsOpen, setSectionsOpen] = useState(() => pathname.startsWith("/app/sections"));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/app/sections")) setSectionsOpen(true);
    setMobileMenuOpen(false);
  }, [pathname]);

  const items = useMemo(
    () =>
      buildItems({
        showProfessor,
        showSchoolAdmin,
        showSections,
        showAnnouncements,
        showGrades,
        currentSection: focusedSection
      }),
    [focusedSection, showAnnouncements, showGrades, showProfessor, showSchoolAdmin, showSections]
  );

  // Top of the nav — the few places people actually move between.
  const primaryItems = useMemo(
    () =>
      items.filter(
        (item) =>
          item.href !== "/app/account" &&
          item.href !== "/app/settings" &&
          !STUDY_TOOL_HREFS.has(item.href)
      ),
    [items]
  );
  // Tucked under a quiet "Study tools" header — these also live inside
  // each class, so they don't need to shout at the top level.
  const studyItems = useMemo(
    () => items.filter((item) => STUDY_TOOL_HREFS.has(item.href)),
    [items]
  );
  const personalItems = useMemo(
    () => items.filter((item) => item.href === "/app/account" || item.href === "/app/settings"),
    [items]
  );

  const dockItems = useMemo(() => {
    const byLabel = new Map(items.map((item) => [item.label, item]));
    const labels = showSchoolAdmin
      ? ["Professor Staff", "Account", "Settings"]
      : showProfessor
        ? ["Home", "My classes", "Sections", showAnnouncements ? "Announcements" : "Exams"]
        : showSections
          ? ["Home", "My classes", "Sections", showAnnouncements ? "Announcements" : "Homework"]
          : ["Home", "My classes", "Homework", showAnnouncements ? "Announcements" : "Exams"];

    return labels
      .map((label) => byLabel.get(label))
      .filter(Boolean)
      .slice(0, 4) as NavItem[];
  }, [items, showAnnouncements, showProfessor, showSchoolAdmin, showSections]);

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col border-r border-borderc bg-surface/85 px-4 pb-5 pt-5 backdrop-blur-xl lg:flex">
        {/* Editorial wordmark — matches the auth shell + homepage so
            the brand reads as one mark across the entire site. The
            previous GraduationCap-in-gradient-badge approach felt
            generic SaaS; this carries the display + Fraunces character. */}
        <Link
          href="/"
          className="mb-10 inline-flex items-baseline gap-2 rounded-md px-2 py-2 transition-opacity duration-150 hover:opacity-80"
        >
          <span className="font-wordmark text-[18px] font-bold leading-none tracking-[-0.02em] text-text">
            United{" "}
            <em className="font-display font-medium not-italic text-accent">
              <span className="italic">Exams</span>
            </em>
          </span>
        </Link>

        <div className="flex-1 space-y-6 overflow-y-auto pr-1">
          <div className="space-y-2">
            <NavigationList
              items={primaryItems}
              pathname={pathname}
              sectionsOpen={sectionsOpen}
              setSectionsOpen={setSectionsOpen}
            />
          </div>

          {studyItems.length ? (
            <div className="space-y-2">
              <p className="px-2 text-[10px] font-bold uppercase tracking-[0.22em] text-faint">
                Study tools
              </p>
              <NavigationList
                items={studyItems}
                pathname={pathname}
                sectionsOpen={sectionsOpen}
                setSectionsOpen={setSectionsOpen}
              />
            </div>
          ) : null}

          <SectionQuickList
            sections={sections}
            currentSection={focusedSection}
            showProfessor={showProfessor}
          />
        </div>

        <div className="mt-4 border-t border-borderc pt-4">
          <p className="px-2 text-[10px] font-bold uppercase tracking-[0.22em] text-faint">You</p>
          <div className="mt-2">
            <NavigationList
              items={personalItems}
              pathname={pathname}
              sectionsOpen={sectionsOpen}
              setSectionsOpen={setSectionsOpen}
            />
          </div>
        </div>
      </aside>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <div className="pointer-events-auto mx-auto flex w-full max-w-md items-center gap-1 rounded-[1.75rem] border border-borderc bg-surface/90 p-2 shadow-[0_22px_48px_rgba(2,8,24,0.38)] backdrop-blur-2xl">
          {dockItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-semibold transition-all duration-150",
                  active ? "bg-accent-subtle text-accent" : "text-faint hover:bg-soft hover:text-text"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-semibold text-faint transition-all duration-150 hover:bg-soft hover:text-text"
            aria-label="Open navigation menu"
          >
            <Menu className="h-4 w-4 shrink-0" />
            <span className="truncate">Menu</span>
          </button>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            className="absolute inset-0 bg-bg/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute inset-x-3 bottom-3 top-3 overflow-hidden rounded-[2rem] border border-borderc bg-surface/96 shadow-[0_30px_90px_rgba(2,8,24,0.5)] backdrop-blur-2xl">
            <div className="flex h-full flex-col">
              <div className="safe-top-pad border-b border-borderc px-5 pb-4 pt-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="font-wordmark text-[20px] font-bold leading-none tracking-[-0.02em] text-text">
                      United{" "}
                      <em className="font-display font-medium not-italic text-accent">
                        <span className="italic">Exams</span>
                      </em>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-borderc bg-soft text-text transition-colors duration-150 hover:bg-overlay"
                    aria-label="Close navigation menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-4 rounded-[1.4rem] border border-borderc bg-[linear-gradient(135deg,hsl(var(--brand-1)/0.18),hsl(var(--surface)),hsl(var(--brand-3)/0.14))] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">Workspace</p>
                  <p className="mt-2 text-base font-semibold text-text">{accountName}</p>
                  <p className="mt-1 text-sm text-text-secondary">
                    {showSchoolAdmin
                      ? "University administration tools"
                      : showProfessor
                        ? "Professor workspace and section management"
                        : "Study flow, sections, and course materials"}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                <NavigationList
                  items={primaryItems}
                  pathname={pathname}
                  sectionsOpen={sectionsOpen}
                  setSectionsOpen={setSectionsOpen}
                  onNavigate={() => setMobileMenuOpen(false)}
                  mobile
                />

                {studyItems.length ? (
                  <div className="mt-5">
                    <p className="px-1 text-[10px] font-bold uppercase tracking-[0.22em] text-faint">
                      Study tools
                    </p>
                    <div className="mt-2">
                      <NavigationList
                        items={studyItems}
                        pathname={pathname}
                        sectionsOpen={sectionsOpen}
                        setSectionsOpen={setSectionsOpen}
                        onNavigate={() => setMobileMenuOpen(false)}
                        mobile
                      />
                    </div>
                  </div>
                ) : null}

                <div className="mt-5">
                  <SectionQuickList
                    sections={sections}
                    currentSection={focusedSection}
                    showProfessor={showProfessor}
                    mobile
                    onNavigate={() => setMobileMenuOpen(false)}
                  />
                </div>

                {personalItems.length ? (
                  <div className="mt-6 border-t border-borderc pt-5">
                    <p className="px-1 text-[10px] font-bold uppercase tracking-[0.22em] text-faint">You</p>
                    <div className="mt-2">
                      <NavigationList
                        items={personalItems}
                        pathname={pathname}
                        sectionsOpen={sectionsOpen}
                        setSectionsOpen={setSectionsOpen}
                        onNavigate={() => setMobileMenuOpen(false)}
                        mobile
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
