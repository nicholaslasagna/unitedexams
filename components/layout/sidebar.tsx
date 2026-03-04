"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LibraryBig,
  ListChecks,
  Trophy,
  NotebookTabs,
  Settings,
  UserRound,
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppData } from "@/lib/app-data-context";

const baseItems = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/courses", label: "Courses", icon: LibraryBig },
  { href: "/homework", label: "Homework", icon: ListChecks },
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
    ? [...baseItems.slice(0, 3), { href: "/app/sections", label: "Sections", icon: GraduationCap }, ...baseItems.slice(3)]
    : baseItems;

  return (
    <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 border-r border-borderc bg-surface/90 px-4 pb-5 pt-5 backdrop-blur-xl lg:block">
      <Link href="/" className="mb-10 flex items-center gap-3 rounded-xl px-2 py-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-gradient text-lg text-accent-fg shadow-glow">
          <GraduationCap className="h-[18px] w-[18px]" />
        </div>
        <div>
          <p className="font-display text-[15px] font-bold leading-tight text-text">United Exams</p>
          <p className="text-[10px] font-semibold uppercase tracking-[5px] text-accent">STUDY</p>
        </div>
      </Link>

      <nav aria-label="Main" className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors duration-150",
                active
                  ? "bg-accent-subtle text-text"
                  : "text-faint hover:bg-soft hover:text-muted"
              )}
            >
              <Icon className={cn("h-[17px] w-[17px]", active ? "text-accent" : "text-faint group-hover:text-muted")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-10 rounded-xl border border-borderc bg-soft p-5">
        <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-accent">Today&apos;s goal</p>
        <p className="mt-2 text-[14px] font-medium text-text">Complete one quiz set in 20 minutes.</p>
        <p className="mt-1 text-[13px] text-faint">Low friction. Keep streak momentum.</p>
      </div>
    </aside>
  );
}
