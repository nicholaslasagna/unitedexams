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
    <aside className="sticky top-0 hidden h-screen w-[272px] shrink-0 border-r border-borderc/70 bg-[linear-gradient(180deg,hsl(var(--layer-1)/0.94),hsl(var(--layer-0)/0.98))] px-4 pb-6 pt-5 backdrop-blur-xl lg:block">
      <Link href="/" className="mb-9 flex items-center gap-3 rounded-xl px-2 py-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-lg text-white shadow-soft">
          <GraduationCap className="h-[18px] w-[18px]" />
        </div>
        <div>
          <p className="font-display text-base font-semibold leading-tight text-text">United Exams</p>
          <p className="text-[11px] tracking-[0.14em] text-muted">ACADEMIC PREMIUM</p>
        </div>
      </Link>

      <nav aria-label="Main" className="space-y-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-white/[0.08] text-text ring-1 ring-brand-2/35"
                  : "text-muted hover:bg-soft/75 hover:text-text"
              )}
            >
              <Icon className={cn("h-[17px] w-[17px]", active ? "text-brand-2" : "text-muted group-hover:text-text")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-2xl border border-borderc/70 bg-soft/70 p-4 shadow-soft">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">Today goal</p>
        <p className="mt-2 text-sm font-medium text-text">Complete one quiz set in 20 minutes.</p>
        <p className="mt-1 text-xs text-muted">Low friction. Keep streak momentum.</p>
      </div>
    </aside>
  );
}
