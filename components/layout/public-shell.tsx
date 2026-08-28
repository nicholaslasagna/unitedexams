"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ClipboardList, GraduationCap, Megaphone, Settings, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/app-data-context";
import { isUniversityAdmin, isVerifiedProfessor } from "@/lib/auth/roles";
import { resolveProfileInternalName } from "@/lib/profile-name";
import { resolveNavItems, type ResolvedNavItem } from "@/lib/navigation/nav-model";
import {
  GuestAuthButtons,
  PublicMobileBar,
  PublicSidebar
} from "@/components/layout/public-sidebar";

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


  const nextPath = pathname || "/courses";

  const authSlot = !authReady ? (
    <span className="rounded-lg border border-borderc bg-soft px-3 py-2 text-[12px] text-muted">
      Checking session…
    </span>
  ) : isAuthenticated ? (
    <Button
      variant="secondary"
      size="sm"
      className="w-full"
      onClick={async () => {
        await signOut();
        router.push("/courses");
        router.refresh();
      }}
    >
      Sign out
    </Button>
  ) : (
    <GuestAuthButtons nextPath={nextPath} />
  );

  // The mobile bar sits above every page, so its CTA has to be compact.
  const mobileAuthSlot = !authReady ? null : isAuthenticated ? (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        await signOut();
        router.push("/courses");
        router.refresh();
      }}
    >
      Sign out
    </Button>
  ) : (
    <GuestAuthButtons nextPath={nextPath} layout="inline" />
  );

  return (
    /*
     * Same frame as AppShell: a sidebar beside a content column. The public
     * pages used to put their navigation in a top bar, so signing in moved
     * the nav from the top of the screen to the left edge — the same links
     * presented as a different thing. Now only the destinations change.
     */
    <div className="relative flex min-h-screen bg-bg text-text">
      {/* Flowing colorful backdrop. Same family as the sign-in page,
          quieter so it doesn't compete with content. On the homepage,
          the editorial `.page-atmosphere` (haze + embers + soft logo)
          renders on top of this and visually dominates — they coexist
          cleanly because both are fixed-position with z-index 0 and
          the homepage's haze layer is more opaque. */}
      <div className="page-aurora" aria-hidden />

      <PublicSidebar
        items={navItems}
        pathname={pathname}
        authSlot={authSlot}
        drawerAuthSlot={
          isAuthenticated ? (
            authSlot
          ) : (
            <GuestAuthButtons nextPath={nextPath} />
          )
        }
        accountName={isAuthenticated ? accountName : null}
      />

      <div className="relative z-[1] flex min-w-0 flex-1 flex-col">
        <PublicMobileBar authSlot={mobileAuthSlot} />

        {/* tabIndex -1: see app-shell — without it the skip link scrolls but
            does not move focus, so Tab returns to the nav. */}
        <main
          id="main"
          tabIndex={-1}
          className="focus:outline-none mx-auto w-full max-w-[1360px] flex-1 px-4 py-6 pb-28 sm:px-5 md:px-8 md:py-8 lg:px-10 lg:pb-10"
        >
          <div className="animate-fade-in">{children}</div>
        </main>

        <footer className="mx-auto w-full max-w-[1360px] border-t border-borderc/70 px-4 py-5 pb-28 text-center text-sm text-muted sm:px-5 md:px-8 lg:pb-4">
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
    </div>
  );
}
