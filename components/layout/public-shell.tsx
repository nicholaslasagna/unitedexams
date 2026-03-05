"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConstellationPattern } from "@/components/ui/constellation-pattern";
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
  const { authReady, isAuthenticated, profile, signOut, supabase, user } = useAppData();
  const [hasJoinedSection, setHasJoinedSection] = useState(false);

  const isProfessor = profile.role === "professor" || profile.role === "admin";

  useEffect(() => {
    if (!isAuthenticated || !supabase || !user || isProfessor) {
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
  }, [isAuthenticated, isProfessor, supabase, user]);

  const showAnnouncements = isProfessor || hasJoinedSection;

  const navItems = useMemo(() => {
    if (!isAuthenticated) return guestNavItems;
    if (!showAnnouncements) return accountNavItems;
    return [
      ...accountNavItems.slice(0, 3),
      { href: "/app/announcements", label: "Announcements" },
      ...accountNavItems.slice(3)
    ];
  }, [isAuthenticated, showAnnouncements]);

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="ambient-glow" />
      <ConstellationPattern className="fixed" opacity={0.02} variant="sparse" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-borderc bg-surface/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-5 py-3 md:px-8">
          <Link href="/" className="inline-flex items-center gap-3 transition-opacity duration-150 hover:opacity-80">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-accent-fg shadow-soft">
              <GraduationCap className="h-4.5 w-4.5" />
            </span>
            <span className="font-display text-lg font-semibold text-text">United Exams</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-150",
                    active
                      ? "bg-accent-subtle text-text"
                      : "text-muted hover:bg-soft hover:text-text"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {!authReady ? (
              <span className="rounded-lg border border-borderc bg-soft px-3 py-2 text-sm text-muted">
                Checking session...
              </span>
            ) : isAuthenticated ? (
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
                <span className="hidden rounded-lg border border-borderc bg-soft px-2 py-1 text-xs text-muted lg:inline">
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

      {/* Main */}
      <main id="main" className="relative z-[1] mx-auto w-full max-w-[1200px] px-5 py-8 md:px-8 lg:px-10">
        <div className="animate-fade-in">{children}</div>
      </main>

      {/* Footer */}
      <footer className="mx-auto w-full max-w-[1200px] border-t border-borderc px-5 py-4 text-center text-sm text-muted md:px-8">
        © {new Date().getFullYear()}{" "}
        <a
          href="https://imagicaststudios.com"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-accent transition-colors duration-150 hover:text-text"
        >
          Imagicast Studios
        </a>
      </footer>
    </div>
  );
}
