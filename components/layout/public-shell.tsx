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
import { resolveProfileInternalName } from "@/lib/profile-name";
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
  { href: "/app/notes", label: "Notes" },
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

  const isProfessor = isVerifiedProfessor(profile);
  const isSchoolAdmin = isUniversityAdmin(profile);
  const accountName = resolveProfileInternalName(profile, "Account");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile drawer whenever route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock background scroll when drawer is open
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (mobileOpen) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    }
  }, [mobileOpen]);

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

  const showAnnouncements = isProfessor || hasJoinedSection;
  const showSections = isProfessor || hasJoinedSection;
  const showGrades = !isProfessor && !isSchoolAdmin && profile.role === "student";

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
    if (showGrades) {
      const sectionsIndex = next.findIndex((item) => item.href === "/app/sections");
      const insertAt = sectionsIndex >= 0 ? sectionsIndex + 1 : 3;
      next = [
        ...next.slice(0, insertAt),
        { href: "/app/grades", label: "Grades" },
        ...next.slice(insertAt)
      ];
    }
    return next;
  }, [isAuthenticated, isSchoolAdmin, showAnnouncements, showGrades, showSections]);

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="ambient-glow" />
      <ConstellationPattern className="fixed" opacity={0.02} variant="sparse" />

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
            <div className="hidden items-center gap-2 md:flex">
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
                    {accountName}
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
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-borderc bg-soft text-text transition-colors hover:bg-overlay md:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen ? (
          <div
            id="mobile-menu"
            className="border-t border-borderc bg-surface/95 backdrop-blur-xl md:hidden animate-fade-rise"
          >
            <nav
              className="mx-auto flex w-full max-w-[1200px] flex-col gap-1 px-5 py-3"
              aria-label="Mobile"
            >
              {navItems.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-xl px-3 py-3 text-sm font-semibold transition-colors duration-150",
                      active
                        ? "bg-accent-subtle text-text"
                        : "text-text-secondary hover:bg-soft hover:text-text"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <div className="mt-2 grid gap-2 border-t border-borderc pt-3">
                {!authReady ? (
                  <span className="rounded-lg border border-borderc bg-soft px-3 py-2 text-sm text-muted">
                    Checking session...
                  </span>
                ) : isAuthenticated ? (
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      await signOut();
                      router.push("/courses");
                      router.refresh();
                    }}
                  >
                    Sign out
                  </Button>
                ) : (
                  <>
                    <Button asChild>
                      <Link href={`/signup?next=${encodeURIComponent(pathname || "/courses")}`}>
                        Create account
                      </Link>
                    </Button>
                    <Button asChild variant="secondary">
                      <Link href={`/login?next=${encodeURIComponent(pathname || "/courses")}`}>Sign in</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        ) : null}
      </header>

      <main id="main" className="relative z-[1] mx-auto w-full max-w-[1200px] px-5 py-8 md:px-8 lg:px-10">
        <div className="animate-fade-in">{children}</div>
      </main>

      <footer className="mx-auto w-full max-w-[1200px] border-t border-borderc px-5 py-4 text-center text-sm text-muted md:px-8">
        © {new Date().getFullYear()} {" "}
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
