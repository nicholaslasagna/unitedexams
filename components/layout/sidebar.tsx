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
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppData } from "@/lib/app-data-context";
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
  { href: "/courses", label: "Courses", icon: LibraryBig },
  { href: "/homework", label: "Homework", icon: ListChecks },
  { href: "/app/exams", label: "Exams", icon: Timer },
  { href: "/app/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/app/notes/software-engineering", label: "Notes", icon: NotebookTabs },
  { href: "/app/account", label: "Account", icon: UserRound },
  { href: "/app/settings", label: "Settings", icon: Settings }
];

export function Sidebar() {
  const pathname = usePathname();
  const { profile, isAuthenticated, supabase, user } = useAppData();
  const showProfessor = profile.role === "professor" || profile.role === "admin";
  const [hasJoinedSection, setHasJoinedSection] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !supabase || !user || showProfessor) {
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
  }, [isAuthenticated, showProfessor, supabase, user]);

  const [sectionsOpen, setSectionsOpen] = useState(
    () => pathname.startsWith("/app/sections")
  );

  useEffect(() => {
    if (pathname.startsWith("/app/sections")) setSectionsOpen(true);
  }, [pathname]);

  const showAnnouncements = showProfessor || hasJoinedSection;

  const items = useMemo(() => {
    const announcementItem = {
      href: "/app/announcements",
      label: "Announcements",
      icon: Megaphone
    };

    const studentItems = showAnnouncements
      ? [
          ...baseItems.slice(0, 4),
          announcementItem,
          ...baseItems.slice(4)
        ]
      : baseItems;

    if (!showProfessor) {
      return studentItems;
    }

    const professorBase = showAnnouncements
      ? [
          ...baseItems.slice(0, 4),
          announcementItem,
          ...baseItems.slice(4)
        ]
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
  }, [showAnnouncements, showProfessor]);

  return (
    <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 border-r border-borderc bg-surface/90 px-4 pb-5 pt-5 backdrop-blur-xl lg:block">
      {/* Logo */}
      <Link href="/" className="mb-10 flex items-center gap-3 rounded-xl px-2 py-2 transition-colors duration-150 hover:bg-soft">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-lg text-accent-fg shadow-glow">
          <GraduationCap className="h-[18px] w-[18px]" />
        </div>
        <div>
          <p className="font-display text-[15px] font-bold leading-tight text-text">United Exams</p>
          <p className="text-[10px] font-semibold uppercase tracking-[5px] text-accent">STUDY</p>
        </div>
      </Link>

      {/* Navigation */}
      <nav aria-label="Main" className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);

          /* ---------- Section group parent with collapsible children ---------- */
          if ("sectionGroup" in item && item.sectionGroup && "children" in item) {
            const parentExact = pathname === "/app/sections" || pathname === "/app/sections/";
            const ChevronIcon = sectionsOpen ? ChevronDown : ChevronRight;

            return (
              <div key={item.href}>
                {/* Parent row: link + chevron toggle */}
                <div className="relative flex items-center">
                  <Link
                    href={item.href}
                    aria-current={parentExact ? "page" : undefined}
                    className={cn(
                      "group relative flex flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium",
                      "transition-all duration-150 ease-out-expo",
                      active
                        ? "bg-accent-subtle text-text"
                        : "text-faint hover:bg-soft hover:text-muted"
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
                        "h-[17px] w-[17px] transition-colors duration-150",
                        active ? "text-accent" : "text-faint group-hover:text-muted"
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>

                  {/* Chevron toggle button */}
                  <button
                    type="button"
                    aria-label={sectionsOpen ? "Collapse sections" : "Expand sections"}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSectionsOpen((prev) => !prev);
                    }}
                    className={cn(
                      "absolute right-1.5 flex h-6 w-6 items-center justify-center rounded-md transition-colors duration-150",
                      "text-faint hover:bg-soft hover:text-muted"
                    )}
                  >
                    <ChevronIcon className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Collapsible children */}
                <div
                  className="grid transition-[grid-template-rows] duration-200 ease-out"
                  style={{ gridTemplateRows: sectionsOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <div className="space-y-0.5 pt-0.5">
                      {item.children!.map(
                        (child) => {
                          const ChildIcon = child.icon;
                          const childActive = pathname.startsWith(child.href);
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              aria-current={childActive ? "page" : undefined}
                              className={cn(
                                "group relative flex items-center gap-3 rounded-xl py-2 pl-10 pr-3 text-[13px] font-medium",
                                "transition-all duration-150 ease-out-expo",
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
                                  "h-[15px] w-[15px] transition-colors duration-150",
                                  childActive
                                    ? "text-accent"
                                    : "text-faint group-hover:text-muted"
                                )}
                              />
                              <span>{child.label}</span>
                            </Link>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          /* ---------- Regular nav item ---------- */
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium",
                "transition-all duration-150 ease-out-expo",
                active
                  ? "bg-accent-subtle text-text"
                  : "text-faint hover:bg-soft hover:text-muted"
              )}
            >
              {/* Active glow dot */}
              {active ? (
                <span
                  className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-x-0.5 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_8px_hsl(var(--accent)/0.4)]"
                  aria-hidden
                />
              ) : null}
              <Icon
                className={cn(
                  "h-[17px] w-[17px] transition-colors duration-150",
                  active ? "text-accent" : "text-faint group-hover:text-muted"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Daily goal card */}
      <div className="mt-10 rounded-xl border border-borderc bg-soft p-5 transition-colors duration-150 hover:border-border-bright">
        <p className="text-caption font-bold uppercase tracking-[1.5px] text-accent">Today&apos;s goal</p>
        <p className="mt-2 text-[14px] font-medium text-text">Complete one quiz set in 20 minutes.</p>
        <p className="mt-1 text-[13px] text-faint">Low friction. Keep streak momentum.</p>
      </div>
    </aside>
  );
}
