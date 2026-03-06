"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  LibraryBig,
  ListChecks,
  Timer,
  Trophy,
  NotebookTabs,
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
import { cn } from "@/lib/utils";
import { useAppData } from "@/lib/app-data-context";
import { isUniversityAdmin, isVerifiedProfessor } from "@/lib/auth/roles";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  sectionGroup?: boolean;
  children?: NavItem[];
}

const baseItems: NavItem[] = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/courses", label: "Courses", icon: LibraryBig },
  { href: "/app/homework", label: "Homework", icon: ListChecks },
  { href: "/app/exams", label: "Exams", icon: Timer },
  { href: "/app/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/app/notes/software-engineering", label: "Notes", icon: NotebookTabs },
  { href: "/app/account", label: "Account", icon: UserRound },
  { href: "/app/settings", label: "Settings", icon: Settings }
];

function buildItems(params: {
  showProfessor: boolean;
  showSchoolAdmin: boolean;
  showSections: boolean;
  showAnnouncements: boolean;
}) {
  const { showProfessor, showSchoolAdmin, showSections, showAnnouncements } = params;

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
        children: [
          { href: "/app/sections/materials", label: "Materials", icon: BookMarked },
          { href: "/app/sections/homework", label: "Homework", icon: ListChecks }
        ]
      },
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
      children: [
        { href: "/app/sections/materials", label: "Materials", icon: BookMarked },
        { href: "/app/sections/homework", label: "Homework", icon: ListChecks },
        { href: "/app/sections/gradebook", label: "Gradebook", icon: ClipboardList }
      ]
    },
    ...professorBase.slice(3)
  ];
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
                      const childActive = pathname.startsWith(child.href);
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

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
            className={cn(
              itemClass,
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
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { profile, isAuthenticated, supabase, user } = useAppData();
  const showProfessor = isVerifiedProfessor(profile);
  const showSchoolAdmin = isUniversityAdmin(profile);
  const [hasJoinedSection, setHasJoinedSection] = useState(false);
  const [sectionsOpen, setSectionsOpen] = useState(() => pathname.startsWith("/app/sections"));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !supabase || !user || showProfessor || showSchoolAdmin) {
      setHasJoinedSection(false);
      return;
    }

    let active = true;
    void (async () => {
      try {
        const { data, error } = await supabase
          .from("section_members")
          .select("section_id")
          .eq("user_id", user.id)
          .limit(1);

        if (!active) return;
        if (error) {
          setHasJoinedSection(false);
          return;
        }
        setHasJoinedSection((data?.length ?? 0) > 0);
      } catch {
        if (!active) return;
        setHasJoinedSection(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [isAuthenticated, showProfessor, showSchoolAdmin, supabase, user]);

  useEffect(() => {
    if (pathname.startsWith("/app/sections")) setSectionsOpen(true);
    setMobileMenuOpen(false);
  }, [pathname]);

  const showAnnouncements = showProfessor || hasJoinedSection;
  const showSections = showProfessor || hasJoinedSection;

  const items = useMemo(
    () =>
      buildItems({
        showProfessor,
        showSchoolAdmin,
        showSections,
        showAnnouncements
      }),
    [showAnnouncements, showProfessor, showSchoolAdmin, showSections]
  );

  const dockItems = useMemo(() => {
    const byLabel = new Map(items.map((item) => [item.label, item]));
    const labels = showSchoolAdmin
      ? ["Professor Staff", "Account", "Settings"]
      : showProfessor
        ? ["Dashboard", "Courses", "Sections", showAnnouncements ? "Announcements" : "Exams"]
        : showSections
          ? ["Dashboard", "Courses", "Sections", showAnnouncements ? "Announcements" : "Homework"]
          : ["Dashboard", "Courses", "Homework", showAnnouncements ? "Announcements" : "Exams"];

    return labels
      .map((label) => byLabel.get(label))
      .filter(Boolean)
      .slice(0, 4) as NavItem[];
  }, [items, showAnnouncements, showProfessor, showSchoolAdmin, showSections]);

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 border-r border-borderc bg-surface/90 px-4 pb-5 pt-5 backdrop-blur-xl lg:block">
        <Link
          href="/"
          className="mb-10 flex items-center gap-3 rounded-xl px-2 py-2 transition-colors duration-150 hover:bg-soft"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-lg text-accent-fg shadow-glow">
            <GraduationCap className="h-[18px] w-[18px]" />
          </div>
          <div>
            <p className="font-display text-[15px] font-bold leading-tight text-text">United Exams</p>
            <p className="text-[10px] font-semibold uppercase tracking-[5px] text-accent">STUDY</p>
          </div>
        </Link>

        <NavigationList
          items={items}
          pathname={pathname}
          sectionsOpen={sectionsOpen}
          setSectionsOpen={setSectionsOpen}
        />

        <div className="mt-10 rounded-xl border border-borderc bg-soft p-5 transition-colors duration-150 hover:border-border-bright">
          <p className="text-caption font-bold uppercase tracking-[1.5px] text-accent">Today&apos;s goal</p>
          <p className="mt-2 text-[14px] font-medium text-text">Complete one quiz set in 20 minutes.</p>
          <p className="mt-1 text-[13px] text-faint">Low friction. Keep streak momentum.</p>
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
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-accent-fg shadow-glow">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-display text-lg font-bold text-text">United Exams</p>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-accent">
                        Mobile Nav
                      </p>
                    </div>
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
                  <p className="mt-2 text-base font-semibold text-text">{profile.name || "Student"}</p>
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
                  items={items}
                  pathname={pathname}
                  sectionsOpen={sectionsOpen}
                  setSectionsOpen={setSectionsOpen}
                  onNavigate={() => setMobileMenuOpen(false)}
                  mobile
                />

                <div className="mt-5 rounded-[1.4rem] border border-borderc bg-soft p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">Today&apos;s goal</p>
                  <p className="mt-2 text-sm font-semibold text-text">Complete one quiz set in 20 minutes.</p>
                  <p className="mt-1 text-sm text-text-secondary">
                    Stay focused, keep momentum, and use sections for class materials.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
