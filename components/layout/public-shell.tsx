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

const footerCourseLinks = [
  { href: "/courses/software-engineering", label: "Software Engineering" },
  { href: "/courses/differential-equations", label: "Differential Equations" },
  { href: "/courses/computer-architecture", label: "Computer Architecture" },
  { href: "/courses/theory-of-automata", label: "Theory of Automata" }
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
      <ConstellationPattern className="fixed" opacity={0.025} variant="sparse" />

      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4 md:px-5">
        <div className="mx-auto max-w-[1280px] rounded-[1.8rem] border border-borderc/80 bg-surface/80 shadow-[0_18px_52px_hsl(var(--bg)/0.34)] backdrop-blur-2xl">
          <div className="signal-grid px-4 py-3 sm:px-5 md:px-6">
            <div className="flex items-center justify-between gap-3">
              <Link href="/" className="inline-flex min-w-0 items-center gap-3 transition-opacity duration-150 hover:opacity-80">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient text-accent-fg shadow-soft">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-display text-base font-semibold text-text sm:text-lg">
                    United Exams
                  </span>
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.32em] text-accent">
                    Focused Academic Workspace
                  </span>
                </span>
              </Link>

              <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
                {navItems.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "relative rounded-full px-4 py-2 text-sm font-semibold transition-all duration-150",
                        active
                          ? "bg-accent-subtle text-text shadow-[inset_0_0_0_1px_hsl(var(--accent)/0.18)]"
                          : "text-muted hover:bg-soft hover:text-text"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="hidden items-center gap-2 lg:flex">
                {!authReady ? (
                  <span className="rounded-full border border-borderc bg-soft px-3 py-2 text-sm text-muted">
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
                    <span className="rounded-full border border-borderc bg-soft px-3 py-2 text-xs font-medium text-text-secondary">
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
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-borderc bg-soft text-text transition-colors duration-150 hover:bg-overlay lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 hidden items-center justify-between gap-4 border-t border-borderc/70 pt-3 md:flex">
              <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">
                Public study library, professor-linked sections, timed practice, and calm review flows.
              </p>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <span className="editorial-kicker">Live library</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main
        id="main"
        className="relative z-[1] mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-5 md:px-8 lg:px-10"
      >
        <div className="animate-fade-in">{children}</div>
      </main>

      <footer className="mx-auto w-full max-w-[1280px] px-4 pb-6 pt-2 sm:px-5 md:px-8 lg:px-10">
        <div className="story-panel signal-grid overflow-hidden rounded-[2rem] border border-borderc/80 shadow-[0_22px_70px_hsl(var(--bg)/0.28)]">
          <div className="grid gap-6 px-5 py-6 sm:px-6 md:grid-cols-[1.1fr_0.8fr_0.8fr_0.9fr] md:px-8 lg:px-10 lg:py-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient text-accent-fg shadow-soft">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-lg font-semibold text-text">United Exams</p>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">Study with authorship</p>
                </div>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-text-secondary">
                A calmer academic system for difficult classes: course hubs, quiz review, homework breakdowns,
                timed runs, section material, announcements, and progress that actually helps you decide what to do next.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-borderc bg-surface/76 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                  Quizzes
                </span>
                <span className="rounded-full border border-borderc bg-surface/76 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                  Homework
                </span>
                <span className="rounded-full border border-borderc bg-surface/76 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                  Sections
                </span>
                <span className="rounded-full border border-borderc bg-surface/76 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                  Exam review
                </span>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Explore</p>
              <div className="mt-3 grid gap-2">
                <Link href="/courses" className="text-sm text-text-secondary transition-colors duration-150 hover:text-text">
                  Course catalog
                </Link>
                <Link href="/homework" className="text-sm text-text-secondary transition-colors duration-150 hover:text-text">
                  Homework mode
                </Link>
                <Link href="/leaderboard" className="text-sm text-text-secondary transition-colors duration-150 hover:text-text">
                  Leaderboard
                </Link>
                <Link href="/contact" className="text-sm text-text-secondary transition-colors duration-150 hover:text-text">
                  Contact support
                </Link>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Core courses</p>
              <div className="mt-3 grid gap-2">
                {footerCourseLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm text-text-secondary transition-colors duration-150 hover:text-text"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
                {authReady && isAuthenticated ? "Continue in app" : "Start here"}
              </p>
              <p className="text-sm leading-relaxed text-text-secondary">
                {authReady && isAuthenticated
                  ? "You are already signed in. Re-enter your dashboard or open the study library directly."
                  : "Browse publicly now, then create an account when you want saved progress, sections, and professor workflows."}
              </p>
              <div className="grid gap-2">
                <Button asChild variant="secondary" className="justify-center">
                  <Link href={authReady && isAuthenticated ? "/app/courses" : "/courses"}>
                    {authReady && isAuthenticated ? "Open courses" : "Browse materials"}
                  </Link>
                </Button>
                {!authReady ? (
                  <Button className="justify-center" disabled>
                    Checking session...
                  </Button>
                ) : (
                  <Button asChild className="justify-center">
                    <Link href={isAuthenticated ? "/app/dashboard" : "/signup"}>
                      {isAuthenticated ? "Open dashboard" : "Create account"}
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-borderc px-5 py-4 text-center text-sm text-muted sm:px-6 md:px-8 lg:px-10">
            © {new Date().getFullYear()} {" "}
            <a
              href="https://imagicaststudios.com"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-accent transition-colors duration-150 hover:text-text"
            >
              Imagicast Studios
            </a>
          </div>
        </div>
      </footer>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-[70] lg:hidden">
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

                <div className="story-panel mt-4 rounded-[1.4rem] border border-borderc p-4">
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
