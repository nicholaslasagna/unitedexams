"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ClipboardList,
  GraduationCap,
  Megaphone,
  Menu,
  Settings,
  UserRound,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/app-data-context";
import { isUniversityAdmin, isVerifiedProfessor } from "@/lib/auth/roles";
import { resolveProfileInternalName } from "@/lib/profile-name";
import {
  navGroup,
  resolveNavItems,
  type ResolvedNavItem
} from "@/lib/navigation/nav-model";
import { cn } from "@/lib/utils";

/*
 * Nav items come from the same model the in-app sidebar uses, so the top bar
 * and the sidebar agree on labels, icons and order. They were previously
 * declared here by hand and had drifted from the sidebar — "Courses" against
 * "My classes", "Dashboard" against "Home", no icons at all, a different
 * order, and no Interviews entry — which made signing in feel like moving to
 * a different site.
 */
const schoolAdminNavItems: ResolvedNavItem[] = [
  {
    key: "professor-staff",
    href: "/app/admin/professors",
    label: "Professor Staff",
    icon: GraduationCap,
    group: "primary"
  },
  { key: "account", href: "/app/account", label: "Account", icon: UserRound, group: "you" },
  { key: "settings", href: "/app/settings", label: "Settings", icon: Settings, group: "you" }
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

  const navItems = useMemo<ResolvedNavItem[]>(() => {
    if (!isAuthenticated) return resolveNavItems("guest");
    if (isSchoolAdmin) return schoolAdminNavItems;

    const next = [...resolveNavItems("member")];
    const insertAfter = (key: string, item: ResolvedNavItem) => {
      const at = next.findIndex((entry) => entry.key === key);
      next.splice(at >= 0 ? at + 1 : next.length, 0, item);
    };
    // Same conditional entries the sidebar adds, in the same places.
    if (showSections) {
      insertAfter("classes", {
        key: "sections",
        href: "/app/sections",
        label: "Sections",
        icon: GraduationCap,
        group: "primary"
      });
    }
    if (showGrades) {
      insertAfter(showSections ? "sections" : "classes", {
        key: "grades",
        href: "/app/grades",
        label: "Grades",
        icon: ClipboardList,
        group: "primary"
      });
    }
    if (showAnnouncements) {
      insertAfter("homework", {
        key: "announcements",
        href: "/app/announcements",
        label: "Announcements",
        icon: Megaphone,
        group: "study"
      });
    }
    return next;
  }, [isAuthenticated, isSchoolAdmin, showAnnouncements, showGrades, showSections]);

  const primaryNavItems = useMemo(() => navGroup(navItems, "primary"), [navItems]);
  const studyNavItems = useMemo(() => navGroup(navItems, "study"), [navItems]);
  /*
   * The sidebar only splits into groups because a signed-in nav is long
   * enough to become a wall of equal items; a signed-out visitor has five
   * entries and reads them faster as one row. Same rule applied here, so the
   * two shells group for the same reason rather than by coincidence.
   */
  const groupTopNav = studyNavItems.length > 1 && primaryNavItems.length > 3;

  return (
    <div className="relative min-h-screen bg-bg text-text">
      {/* Flowing colorful backdrop. Same family as the sign-in page,
          quieter so it doesn't compete with content. On the homepage,
          the editorial `.page-atmosphere` (haze + embers + soft logo)
          renders on top of this and visually dominates — they coexist
          cleanly because both are fixed-position with z-index 0 and
          the homepage's haze layer is more opaque. */}
      <div className="page-aurora" aria-hidden />

      <header className="sticky top-0 z-40 border-b border-borderc bg-surface/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-5 py-3 md:px-8">
          {/* Editorial wordmark — matches the auth shell, the homepage,
              and the in-app sidebar. One mark across the whole site. */}
          <Link href="/" className="inline-flex items-baseline gap-2 transition-opacity duration-150 hover:opacity-80">
            <span className="font-wordmark text-[18px] font-bold leading-none tracking-[-0.02em] text-text">
              United{" "}
              <em className="font-display font-medium not-italic text-accent">
                <span className="italic">Exams</span>
              </em>
            </span>
          </Link>

          {/*
            Icons and labels match the sidebar exactly. The study-tools group
            is separated by a hairline the way the sidebar separates it with a
            heading — the same information architecture, laid out
            horizontally. It is hidden below lg, where the bar would overflow,
            and the drawer carries it there instead with the sidebar's own
            group headings.
          */}
          <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main">
            {groupTopNav ? (
              <>
                {primaryNavItems.map((item) => (
                  <TopNavLink key={item.key} item={item} pathname={pathname} />
                ))}
                <span className="mx-1.5 hidden h-5 w-px shrink-0 bg-borderc lg:block" aria-hidden />
                <span className="hidden items-center gap-0.5 lg:flex">
                  {studyNavItems.map((item) => (
                    <TopNavLink key={item.key} item={item} pathname={pathname} />
                  ))}
                </span>
              </>
            ) : (
              navItems.map((item) => (
                <TopNavLink key={item.key} item={item} pathname={pathname} />
              ))
            )}
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
              {/*
                Grouped exactly like the sidebar, same headings — but only
                when the desktop bar groups too. Otherwise a guest would see
                Homework third in the bar and last under a heading in the
                drawer, which is the same inconsistency this change set out
                to remove.
              */}
              {!groupTopNav
                ? navItems.map((item) => {
                    const active =
                      pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors duration-150",
                          active
                            ? "bg-accent-subtle text-text"
                            : "text-text-secondary hover:bg-soft hover:text-text"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden />
                        {item.label}
                      </Link>
                    );
                  })
                : ([
                { group: "primary" as const, heading: null },
                { group: "study" as const, heading: "Study tools" },
                { group: "you" as const, heading: "You" }
              ]).map(({ group, heading }) => {
                const groupItems = navGroup(navItems, group);
                if (groupItems.length === 0) return null;
                return (
                  <div key={group} className="flex flex-col gap-1">
                    {heading ? (
                      <p className="mt-2 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-faint">
                        {heading}
                      </p>
                    ) : null}
                    {groupItems.map((item) => {
                      const active =
                        pathname === item.href || pathname.startsWith(`${item.href}/`);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.key}
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors duration-150",
                            active
                              ? "bg-accent-subtle text-text"
                              : "text-text-secondary hover:bg-soft hover:text-text"
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" aria-hidden />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
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

      {/* tabIndex -1: see app-shell — without it the skip link scrolls but
          does not move focus, so Tab returns to the header nav. */}
      <main
        id="main"
        tabIndex={-1}
        className="focus:outline-none relative z-[1] mx-auto w-full max-w-[1200px] px-5 py-8 md:px-8 lg:px-10"
      >
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

/**
 * One top-bar link. Icon plus label, matching the sidebar's rows so the same
 * destination looks the same in both places.
 */
function TopNavLink({ item, pathname }: { item: ResolvedNavItem; pathname: string }) {
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-semibold transition-colors duration-150",
        active ? "bg-accent-subtle text-text" : "text-muted hover:bg-soft hover:text-text"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      {item.label}
    </Link>
  );
}
