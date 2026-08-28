"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavGroupHeading, NavRow, NavWordmark } from "@/components/layout/nav-row";
import { navGroup, type ResolvedNavItem } from "@/lib/navigation/nav-model";
import { cn } from "@/lib/utils";

/**
 * The public site's navigation, as a sidebar.
 *
 * This was a top bar, which meant signing in moved the navigation from the
 * top of the screen to the left edge and changed its shape entirely — the
 * same links, presented as a different thing. It now uses the same aside,
 * the same widths, the same grouping and the same rows as the in-app
 * sidebar (NavRow is literally shared), so the only thing that changes on
 * sign-in is which destinations appear.
 *
 * Mobile keeps the app's pattern too: a bottom dock with a Menu button that
 * opens a full-height drawer.
 */
export function PublicSidebar({
  items,
  pathname,
  authSlot,
  drawerAuthSlot,
  accountName
}: {
  items: ResolvedNavItem[];
  pathname: string;
  /** Sign in / Create account, or the signed-in account controls. */
  authSlot: React.ReactNode;
  drawerAuthSlot: React.ReactNode;
  accountName: string | null;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Stop the page scrolling behind the full-height drawer.
  useEffect(() => {
    if (!menuOpen || typeof document === "undefined") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  const primary = navGroup(items, "primary");
  const study = navGroup(items, "study");
  const personal = navGroup(items, "you");

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // Four destinations plus Menu, matching the in-app dock.
  const dockItems = [...primary, ...study].slice(0, 4);

  const renderGroups = (mobile: boolean, onNavigate?: () => void) => (
    <>
      <nav aria-label={mobile ? "Mobile main" : "Main"} className={cn("space-y-1", mobile && "space-y-1.5")}>
        {primary.map((item) => (
          <NavRow
            key={item.key}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isActive(item.href)}
            onNavigate={onNavigate}
            mobile={mobile}
          />
        ))}
      </nav>

      {study.length > 0 ? (
        <div className={cn("space-y-2", mobile && "space-y-2.5")}>
          <NavGroupHeading>Study tools</NavGroupHeading>
          <nav aria-label="Study tools" className={cn("space-y-1", mobile && "space-y-1.5")}>
            {study.map((item) => (
              <NavRow
                key={item.key}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={isActive(item.href)}
                onNavigate={onNavigate}
                mobile={mobile}
              />
            ))}
          </nav>
        </div>
      ) : null}

      {personal.length > 0 ? (
        <div className={cn("space-y-2", mobile && "space-y-2.5")}>
          <NavGroupHeading>You</NavGroupHeading>
          <nav aria-label="Account" className={cn("space-y-1", mobile && "space-y-1.5")}>
            {personal.map((item) => (
              <NavRow
                key={item.key}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={isActive(item.href)}
                onNavigate={onNavigate}
                mobile={mobile}
              />
            ))}
          </nav>
        </div>
      ) : null}
    </>
  );

  return (
    <>
      <aside className="sticky top-0 z-[2] hidden h-screen w-[260px] shrink-0 flex-col border-r border-borderc bg-surface/85 px-4 pb-5 pt-5 backdrop-blur-xl lg:flex">
        <NavWordmark className="mb-10" />

        <div className="flex-1 space-y-6 overflow-y-auto pr-1">{renderGroups(false)}</div>

        <div className="mt-4 space-y-2 border-t border-borderc pt-4">
          {accountName ? (
            <p className="truncate px-2 text-[11px] text-faint" title={accountName}>
              {accountName}
            </p>
          ) : null}
          {authSlot}
        </div>
      </aside>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <div className="pointer-events-auto mx-auto flex w-full max-w-md items-center gap-1 rounded-[1.75rem] border border-borderc bg-surface/90 p-2 shadow-[0_22px_48px_rgba(2,8,24,0.38)] backdrop-blur-2xl">
          {dockItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-semibold transition-all duration-150",
                  active ? "bg-accent-subtle text-accent" : "text-faint hover:bg-soft hover:text-text"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-semibold text-faint transition-all duration-150 hover:bg-soft hover:text-text"
            aria-label="Open navigation menu"
          >
            <Menu className="h-4 w-4 shrink-0" />
            <span className="truncate">Menu</span>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            className="absolute inset-0 bg-bg/70 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-x-3 bottom-3 top-3 overflow-hidden rounded-[2rem] border border-borderc bg-surface/96 shadow-[0_30px_90px_rgba(2,8,24,0.5)] backdrop-blur-2xl">
            <div className="flex h-full flex-col">
              <div className="safe-top-pad flex items-start justify-between gap-4 border-b border-borderc px-5 pb-4 pt-5">
                <NavWordmark size={20} className="px-0 py-0" />
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-borderc bg-soft text-text transition-colors hover:bg-overlay"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
                {renderGroups(true, () => setMenuOpen(false))}
              </div>

              <div className="border-t border-borderc px-4 py-4">{drawerAuthSlot}</div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

/**
 * The guest call to action, in the two shapes the shell needs.
 *
 * "stack" fills the sidebar footer and the drawer. "inline" is for the
 * mobile bar, where a stacked pair took nearly 190px off the top of every
 * page before the content even started.
 */
export function GuestAuthButtons({
  nextPath,
  layout = "stack"
}: {
  nextPath: string;
  layout?: "stack" | "inline";
}) {
  const inline = layout === "inline";
  return (
    <div className={cn(inline ? "flex items-center justify-end gap-1.5" : "grid grid-cols-1 gap-2")}>
      <Button asChild variant={inline ? "ghost" : "secondary"} size="sm" className={cn(!inline && "order-2")}>
        <Link href={`/login?next=${encodeURIComponent(nextPath)}`}>Sign in</Link>
      </Button>
      <Button asChild size="sm" className={cn(!inline && "order-1")}>
        <Link href={`/signup?next=${encodeURIComponent(nextPath)}`}>
          {inline ? "Sign up" : "Create account"}
        </Link>
      </Button>
    </div>
  );
}

/**
 * The slim bar shown above content on small screens.
 *
 * Rendered inside the content column, not beside the aside: as a sibling of
 * a flex row it became a flex item and consumed the row's width, which
 * pushed every page off screen on a phone. AppShell places its Topbar the
 * same way, inside the column.
 */
export function PublicMobileBar({ authSlot }: { authSlot: React.ReactNode }) {
  return (
    <div className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-borderc bg-surface/90 px-4 py-2.5 backdrop-blur-xl lg:hidden">
      <NavWordmark size={17} className="px-0 py-0" />
      <div className="shrink-0">{authSlot}</div>
    </div>
  );
}
