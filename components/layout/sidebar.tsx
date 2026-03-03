"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LibraryBig,
  Trophy,
  NotebookTabs,
  Settings,
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/courses", label: "Courses", icon: LibraryBig },
  { href: "/app/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/app/notes/software-engineering", label: "Notes", icon: NotebookTabs },
  { href: "/app/settings", label: "Settings", icon: Settings }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-[280px] shrink-0 border-r border-borderc/80 bg-surface/90 px-4 pb-6 pt-4 backdrop-blur-xl lg:block">
      <Link href="/" className="mb-8 flex items-center gap-3 rounded-xl px-2 py-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-lg text-white shadow-soft">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <p className="font-display text-lg font-bold leading-tight text-text">United Exams</p>
          <p className="text-xs tracking-wide text-muted">UnitedExams.com</p>
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
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                active
                  ? "bg-brand-gradient text-white shadow-soft"
                  : "text-muted hover:bg-soft hover:text-text"
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-white" : "text-muted group-hover:text-text")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-2xl border border-borderc bg-soft p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">Premium Focus</p>
        <p className="mt-2 text-sm text-text">Start a 15-minute sprint and keep your streak alive today.</p>
      </div>
    </aside>
  );
}
