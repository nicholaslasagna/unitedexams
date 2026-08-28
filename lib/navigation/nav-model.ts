import {
  Briefcase,
  LayoutDashboard,
  LibraryBig,
  ListChecks,
  Mail,
  NotebookTabs,
  Settings,
  Timer,
  Trophy,
  UserRound,
  type LucideIcon
} from "lucide-react";

/**
 * One definition of the navigation, shared by the in-app sidebar and the
 * public top bar.
 *
 * These used to be two independent lists in two files, and they drifted
 * exactly as you would expect: the same destination was "Courses" in the top
 * bar and "My classes" in the sidebar, "Dashboard" in one and "Home" in the
 * other, the top bar had no icons, the order differed, and Interviews was
 * missing from the top bar altogether. Someone signing in therefore appeared
 * to arrive in a different product from the one they had been browsing.
 *
 * Labels, icons, order and grouping now come from here, so the two cannot
 * disagree again. The sidebar's professor and section sub-trees stay in
 * sidebar.tsx: those are nested navigation that a horizontal bar has no way
 * to express, and forcing them in here would be a worse fit than the
 * duplication this file removes.
 */

/** Mirrors the sidebar's three visual groups. */
export type NavGroup = "primary" | "study" | "you";

export interface NavDestination {
  key: string;
  /** Route for a signed-in visitor. */
  appHref: string;
  /**
   * Public equivalent, when the destination exists outside /app. Null means
   * the item is only shown to signed-in visitors.
   */
  publicHref: string | null;
  label: string;
  /**
   * Label for a signed-out visitor, where "my" would be a lie — they do not
   * own any classes yet.
   */
  guestLabel?: string;
  icon: LucideIcon;
  group: NavGroup;
  /** Shown to signed-out visitors in the public shell. */
  guest: boolean;
}

export const NAV_DESTINATIONS: NavDestination[] = [
  {
    key: "home",
    appHref: "/app/dashboard",
    publicHref: null,
    label: "Home",
    icon: LayoutDashboard,
    group: "primary",
    guest: false
  },
  {
    key: "classes",
    appHref: "/app/courses",
    publicHref: "/courses",
    label: "My classes",
    guestLabel: "Classes",
    icon: LibraryBig,
    group: "primary",
    guest: true
  },
  {
    key: "interviews",
    appHref: "/app/interviews",
    // Interviews live under /app, but the page explains itself and offers a
    // sign-in rather than bouncing, so a visitor can at least find out the
    // section exists — it was invisible from the public site before.
    publicHref: "/app/interviews",
    label: "Interviews",
    icon: Briefcase,
    group: "primary",
    guest: true
  },
  {
    key: "homework",
    appHref: "/app/homework",
    publicHref: "/homework",
    label: "Homework",
    icon: ListChecks,
    group: "study",
    guest: true
  },
  {
    key: "exams",
    appHref: "/app/exams",
    publicHref: null,
    label: "Exams",
    icon: Timer,
    group: "study",
    guest: false
  },
  {
    key: "leaderboard",
    appHref: "/app/leaderboard",
    publicHref: "/leaderboard",
    label: "Leaderboard",
    icon: Trophy,
    group: "primary",
    guest: true
  },
  {
    key: "notes",
    appHref: "/app/notes",
    publicHref: null,
    label: "Notes",
    icon: NotebookTabs,
    group: "study",
    guest: false
  },
  {
    key: "contact",
    appHref: "/contact",
    publicHref: "/contact",
    label: "Contact",
    icon: Mail,
    group: "primary",
    // Only for signed-out visitors: in-app, support is reached from Account.
    guest: true
  },
  {
    key: "account",
    appHref: "/app/account",
    publicHref: null,
    label: "Account",
    icon: UserRound,
    group: "you",
    guest: false
  },
  {
    key: "settings",
    appHref: "/app/settings",
    publicHref: null,
    label: "Settings",
    icon: Settings,
    group: "you",
    guest: false
  }
];

export interface ResolvedNavItem {
  key: string;
  href: string;
  label: string;
  icon: LucideIcon;
  group: NavGroup;
}

/**
 * The nav as one audience sees it.
 *
 * `audience: "guest"` resolves public hrefs and guest labels; "member"
 * resolves the /app routes with the sidebar's labels. Order is the order of
 * NAV_DESTINATIONS in both cases, so the top bar and the sidebar list the
 * same things in the same sequence.
 */
export function resolveNavItems(audience: "guest" | "member"): ResolvedNavItem[] {
  return NAV_DESTINATIONS.flatMap((item) => {
    if (audience === "guest") {
      if (!item.guest || !item.publicHref) return [];
      return [
        {
          key: item.key,
          href: item.publicHref,
          label: item.guestLabel ?? item.label,
          icon: item.icon,
          group: item.group
        }
      ];
    }
    // Contact is a public-only entry; signed-in users reach support from
    // their account page, and duplicating it in the app nav adds noise.
    if (item.key === "contact") return [];
    return [
      {
        key: item.key,
        href: item.appHref,
        label: item.label,
        icon: item.icon,
        group: item.group
      }
    ];
  });
}

/** Items in one group, in model order. */
export function navGroup(items: ResolvedNavItem[], group: NavGroup) {
  return items.filter((item) => item.group === group);
}

/** Hrefs the sidebar files under its "Study tools" heading. */
export const STUDY_TOOL_HREFS = new Set(
  NAV_DESTINATIONS.filter((item) => item.group === "study").map((item) => item.appHref)
);
