"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/app-data-context";
import { cn } from "@/lib/utils";

const guestNavItems = [
  { href: "/courses", label: "Courses" },
  { href: "/homework", label: "Homework" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/contact", label: "Contact" }
];

const accountNavItems = [
  { href: "/app/dashboard", label: "Dashboard" },
  { href: "/courses", label: "Courses" },
  { href: "/homework", label: "Homework" },
  { href: "/app/leaderboard", label: "Leaderboard" },
  { href: "/app/account", label: "Account" },
  { href: "/app/settings", label: "Settings" }
];

export function PublicShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, profile, signOut } = useAppData();
  const navItems = isAuthenticated ? accountNavItems : guestNavItems;

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="ambient-glow" />
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[rgba(5,5,16,0.9)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between gap-4 px-5 py-3 md:px-6">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent-gradient text-white shadow-soft">
              <GraduationCap className="h-4.5 w-4.5" />
            </span>
            <span className="font-display text-lg font-semibold text-white">United Exams</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-semibold transition",
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "bg-white/[0.06] text-white"
                    : "text-white/[0.65] hover:bg-white/[0.05] hover:text-white"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  onClick={async () => {
                    await signOut();
                    router.push("/courses");
                    router.refresh();
                  }}
                >
                  Sign out
                </Button>
                <span className="hidden rounded-lg border border-white/[0.14] bg-white/[0.04] px-2 py-1 text-xs text-white/80 lg:inline">
                  {profile.name || "Account"}
                </span>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href={`/login?next=${encodeURIComponent(pathname || "/courses")}`}>Sign in</Link>
                </Button>
                <Button asChild>
                  <Link href={`/signup?next=${encodeURIComponent(pathname || "/courses")}`}>Create account</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-[1] mx-auto w-full max-w-[1240px] px-5 py-8 md:px-6">{children}</main>
      <footer className="mx-auto w-full max-w-[1240px] border-t border-white/[0.08] px-5 py-4 text-sm text-white/[0.55] md:px-6">
        © {new Date().getFullYear()}{" "}
        <a
          href="https://imagicaststudios.com"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-accent hover:text-white"
        >
          Imagicast Studios
        </a>
      </footer>
    </div>
  );
}
