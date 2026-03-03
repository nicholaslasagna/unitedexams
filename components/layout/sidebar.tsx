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
    <aside className="sticky top-0 hidden h-screen w-[256px] shrink-0 border-r border-borderc bg-[hsl(var(--layer-1)/0.95)] px-4 pb-5 pt-4 backdrop-blur-xl lg:block">
      <Link href="/" className="mb-8 flex items-center gap-3 rounded-xl px-2 py-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient text-lg text-white shadow-soft">
          <GraduationCap className="h-[18px] w-[18px]" />
        </div>
        <p className="font-display text-[15px] font-semibold leading-tight text-text">United Exams</p>
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
                "group flex items-center gap-3 rounded-xl text-sm font-medium transition duration-150",
                active
                  ? "border-l-2 border-brand-2 bg-brand-2/[0.12] pl-[10px] pr-3 py-2.5 text-text"
                  : "border-l-2 border-transparent pl-[10px] pr-3 py-2.5 text-faint hover:text-muted hover:bg-white/[0.04]"
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-brand-2" : "text-faint group-hover:text-muted")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-2xl bg-soft p-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-faint">Today&apos;s goal</p>
        <p className="mt-2 text-sm font-medium text-text">Complete one quiz set in 20 minutes.</p>
        <p className="mt-1 text-xs text-faint">Low friction. Keep streak momentum.</p>
      </div>
    </aside>
  );
}
