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
    <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 border-r border-white/[0.07] bg-[rgba(5,5,16,0.88)] px-4 pb-5 pt-5 backdrop-blur-xl lg:block">
      <Link href="/" className="mb-10 flex items-center gap-3 rounded-xl px-2 py-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-gradient text-lg text-white shadow-glow">
          <GraduationCap className="h-[18px] w-[18px]" />
        </div>
        <div>
          <p className="font-display text-[15px] font-bold leading-tight text-white">United Exams</p>
          <p className="text-[10px] font-semibold tracking-[5px] text-accent uppercase">STUDY</p>
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
                "group flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[14px] font-medium transition duration-150",
                active
                  ? "bg-accent/[0.15] text-white"
                  : "text-white/[0.3] hover:text-white/[0.55] hover:bg-white/[0.04]"
              )}
            >
              <Icon className={cn("h-[17px] w-[17px]", active ? "text-accent" : "text-white/[0.3] group-hover:text-white/[0.55]")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-10 rounded-[14px] border border-white/[0.07] bg-white/[0.025] p-5">
        <p className="text-[11px] font-bold tracking-[1.5px] text-accent uppercase">Today&apos;s goal</p>
        <p className="mt-2 text-[14px] font-medium text-white">Complete one quiz set in 20 minutes.</p>
        <p className="mt-1 text-[13px] text-white/[0.3]">Low friction. Keep streak momentum.</p>
      </div>
    </aside>
  );
}
