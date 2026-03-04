"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppData } from "@/lib/app-data-context";

const baseItems = [
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
  const { profile } = useAppData();
  const showProfessor = profile.role === "professor" || profile.role === "admin";
  const items = showProfessor
    ? [
        baseItems[0],
        baseItems[1],
        { href: "/app/sections", label: "Sections", icon: GraduationCap },
        { href: "/app/sections/materials", label: "Materials", icon: BookMarked },
        { href: "/app/sections/homework", label: "Homework", icon: ListChecks },
        { href: "/app/sections/gradebook", label: "Gradebook", icon: ClipboardList },
        ...baseItems.slice(3)
      ]
    : baseItems;

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
