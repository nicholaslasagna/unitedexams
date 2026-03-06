"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { GraduationCap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConstellationPattern } from "@/components/ui/constellation-pattern";
import { useAppData } from "@/lib/app-data-context";
import { isUniversityAdmin, isVerifiedProfessor } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

const guestNavItems = [
  { href: "/courses", label: "Courses" },
  { href: "/homework", label: "Homework" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/contact", label: "Contact" }
];

const accountNavItems = [
  { href: "/app/dashboard", label: "Dashboard" },
  { href: "/app/courses", label: "Courses" },
  { href: "/app/homework", label: "Homework" },
  { href: "/app/leaderboard", label: "Leaderboard" },
  { href: "/app/account", label: "Account" },
  { href: "/app/settings", label: "Settings" }
];

const schoolAdminNavItems = [
  { href: "/app/admin/professors", label: "Professor Staff" },
  { href: "/app/account", label: "Account" },
  { href: "/app/settings", label: "Settings" }
];

export function PublicShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { authReady, isAuthenticated, profile, signOut, supabase, user } = useAppData();
  const [hasJoinedSection, setHasJoinedSection] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isProfessor = isVerifiedProfessor(profile);
  const isSchoolAdmin = isUniversityAdmin(profile);

  useEffect(() => {
    if (!isAuthenticated || !supabase || !user || isProfessor || isSchoolAdmin) {
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
  }, [isAuthenticated, isProfessor, isSchoolAdmin, supabase, user]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const showAnnouncements = isProfessor || hasJoinedSection;
  const showSections = isProfessor || hasJoinedSection;

  const navItems = useMemo(() => {
    if (!isAuthenticated) return guestNavItems;
    if (isSchoolAdmin) return schoolAdminNavItems;
    let next = [...accountNavItems];
    if (showSections) {
      next = [...next.slice(0, 2), { href: "/app/sections", label: "Sections" }, ...next.slice(2)];
    }
    if (showAnnouncements) {
      const homeworkIndex = next.findIndex((item) => item.href === "/app/homework");
      if (homeworkIndex >= 0) {
        next = [
          ...next.slice(0, homeworkIndex + 1),
          { href: "/app/announcements", label: "Announcements" },
          ...next.slice(homeworkIndex + 1)
        ];
      } else {
        next = [...next, { href: "/app/announcements", label: "Announcements" }];
      }
    }
    return next;
  }, [isAuthenticated, isSchoolAdmin, showAnnouncements, showSections]);

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="ambient-glow" />
      <ConstellationPattern className="fixed" opacity={0.02} variant="sparse" />

      <header className="sticky top-0 z-40 border-b border-borderc bg-surface/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-3 px-4 py-3 sm:px-5 md:px-8">
          <Link href="/" className="inline-flex min-w-0 items-center gap-3 transition-opacity duration-150 hover:opacity-80">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-gradient text-accent-fg shadow-soft">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display text-base font-semibold text-text sm:text-lg">
                United Exams
              </span>
              <span className="hidden text-[10px] font-semibold uppercase tracking-[0.28em] text-accent sm:block">
                Study Platform
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative rounded-xl px-3 py-2 text-sm font-semibold transition-colors duration-150",
                    active ? "bg-accent-subtle text-text" : "text-muted hover:bg-soft hover:text-text"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {!authReady ? (
              <span className="rounded-lg border border-borderc bg-soft px-3 py-2 text-sm text-muted">
                Checking session...
              </span>
            ) : isAuthenticated ? (
              <>
                <Button variant="ghost" onClick={async () => {
                  await signOut();
                  router.push("/courses");
                  router.refresh();
                }}>
                  Sign out
                </Button>
                <span className="rounded-lg border border-borderc bg-soft px-2 py-1 text-xs text-muted">
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

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-borderc bg-soft text-text transition-colors duration-150 hover:bg-overlay md:hidden"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main
        id="main"
        className="relative z-[1] mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-5 md:px-8 lg:px-10"
      >
        <div className="animate-fade-in">{children}</div>
      </main>

      <footer className="mx-auto w-full max-w-[1200px] border-t border-borderc px-4 py-5 text-center text-sm text-muted sm:px-5 md:px-8">
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

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-[70] md:hidden">
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
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
                    {isAuthenticated ? "Continue where you left off" : "Explore the platform"}
                  </p>
                  <p className="mt-2 text-sm text-text-secondary">
                    {isAuthenticated
                      ? "Move between courses, homework, sections, and account tools with one-handed navigation."
                      : "Browse study materials, homework mode, and public rankings from a cleaner mobile layout."}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                <nav className="space-y-1.5" aria-label="Mobile main">
                  {navItems.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center justify-between rounded-2xl px-4 py-3.5 text-[15px] font-medium transition-all duration-150",
                          active ? "bg-accent-subtle text-text" : "text-faint hover:bg-soft hover:text-text"
                        )}
                      >
                        <span>{item.label}</span>
                        <span className="text-sm text-accent">→</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-5 grid gap-2">
                  {!authReady ? (
                    <span className="rounded-2xl border border-borderc bg-soft px-4 py-3 text-sm text-muted">
                      Checking session...
                    </span>
                  ) : isAuthenticated ? (
                    <>
                      <span className="rounded-2xl border border-borderc bg-soft px-4 py-3 text-sm text-text">
                        Signed in as {profile.name || "Account"}
                      </span>
                      <Button
                        variant="ghost"
                        onClick={async () => {
                          await signOut();
                          setMobileMenuOpen(false);
                          router.push("/courses");
                          router.refresh();
                        }}
                      >
                        Sign out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="secondary" asChild>
                        <Link href={`/login?next=${encodeURIComponent(pathname || "/courses")}`}>Sign in</Link>
                      </Button>
                      <Button asChild>
                        <Link href={`/signup?next=${encodeURIComponent(pathname || "/courses")}`}>Create account</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
