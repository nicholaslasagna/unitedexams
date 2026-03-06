"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, SunMoon, Sparkles, Command } from "lucide-react";
import { Input } from "@/components/ui/input";
import { courses, quizSets } from "@/data/seed";
import { useAppData } from "@/lib/app-data-context";
import { useToast } from "@/lib/hooks/use-toast";

function labelForPath(pathname: string) {
  const segment = pathname.split("/").filter(Boolean)[1] ?? "dashboard";
  switch (segment) {
    case "dashboard":
      return { eyebrow: "Study workspace", title: "Dashboard" };
    case "courses":
      return { eyebrow: "Explore and review", title: "Courses" };
    case "homework":
      return { eyebrow: "Assignments and progress", title: "Homework" };
    case "sections":
      return { eyebrow: "Class materials", title: "Sections" };
    case "announcements":
      return { eyebrow: "Instructor updates", title: "Announcements" };
    case "leaderboard":
      return { eyebrow: "Momentum tracking", title: "Leaderboard" };
    case "settings":
      return { eyebrow: "Personalization and security", title: "Settings" };
    case "account":
      return { eyebrow: "Profile and identity", title: "Account" };
    case "notes":
      return { eyebrow: "Reference material", title: "Notes" };
    case "exams":
      return { eyebrow: "Timed assessment", title: "Exams" };
    default:
      return { eyebrow: "United Exams", title: "Workspace" };
  }
}

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, preferences, savePreferences, signOut, user } = useAppData();
  const { push } = useToast();

  const pageMeta = useMemo(() => labelForPath(pathname), [pathname]);

  const [query, setQuery] = useState("");

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const matches = [
      ...courses
        .filter((course) => course.name.toLowerCase().includes(q) || course.code.toLowerCase().includes(q))
        .map((course) => ({
          key: course.id,
          label: `${course.code} • ${course.name}`,
          href: `/app/courses/${course.id}`
        })),
      ...quizSets
        .filter((quiz) => quiz.title.toLowerCase().includes(q) || quiz.tags.join(" ").toLowerCase().includes(q))
        .slice(0, 4)
        .map((quiz) => ({ key: quiz.id, label: `Quiz: ${quiz.title}`, href: `/quiz/${quiz.id}` }))
    ];
    return matches.slice(0, 6);
  }, [query]);

  const toggleTheme = async () => {
    document.documentElement.classList.add("theme-transitioning");
    const next = preferences.theme === "dark" ? "light" : "dark";
    await savePreferences({ ...preferences, theme: next });
    push({ title: `${next === "dark" ? "Dark" : "Light"} theme enabled` });
    window.setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning");
    }, 350);
  };

  const initials = (profile.name || "S").slice(0, 1).toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-borderc bg-surface/90 backdrop-blur-xl">
      <div className="px-4 py-3 sm:px-5 md:px-8">
        <div className="flex items-start justify-between gap-3 md:hidden">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-accent">
              {pageMeta.eyebrow}
            </p>
            <p className="truncate pt-1 font-display text-lg font-semibold text-text">{pageMeta.title}</p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-borderc bg-soft text-faint transition-colors duration-150 hover:bg-overlay hover:text-text"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              <SunMoon className="h-4 w-4" />
            </button>

            {user ? (
              <details className="relative">
                <summary className="flex list-none cursor-pointer items-center gap-2 rounded-2xl border border-borderc bg-soft py-1.5 pl-1.5 pr-2.5 text-sm font-semibold text-text marker:content-['']">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-subtle text-xs font-bold text-accent">
                    {initials}
                  </span>
                </summary>
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-borderc bg-surface p-3 shadow-elevated backdrop-blur-xl animate-fade-rise">
                  <p className="text-caption font-bold uppercase tracking-[1.5px] text-faint">Account</p>
                  <p className="mt-1 text-sm font-semibold text-text">{profile.name || "Student"}</p>
                  <p className="text-xs text-faint">{user.email || profile.email || "No email"}</p>
                  <div className="mt-3 space-y-1 border-t border-borderc pt-2">
                    <button
                      type="button"
                      className="w-full rounded-lg px-2 py-2 text-left text-sm text-muted transition-colors duration-100 hover:bg-soft hover:text-text"
                      onClick={() => router.push("/app/account")}
                    >
                      Account
                    </button>
                    <button
                      type="button"
                      className="w-full rounded-lg px-2 py-2 text-left text-sm text-muted transition-colors duration-100 hover:bg-soft hover:text-text"
                      onClick={() => router.push("/app/settings")}
                    >
                      Settings
                    </button>
                    <button
                      type="button"
                      className="w-full rounded-lg px-2 py-2 text-left text-sm text-danger transition-colors duration-100 hover:bg-danger/10"
                      onClick={async () => {
                        await signOut();
                        router.replace("/login");
                        router.refresh();
                      }}
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </details>
            ) : (
              <button
                type="button"
                className="rounded-2xl border border-borderc bg-soft px-3 py-2 text-sm font-semibold text-text transition-colors duration-150 hover:bg-overlay"
                onClick={() => router.push(`/login?next=${encodeURIComponent(pathname || "/courses")}`)}
              >
                Sign in
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-3 md:mt-0 md:flex-row md:items-center md:justify-between">
          <div className="hidden md:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-accent">{pageMeta.eyebrow}</p>
            <p className="pt-1 font-display text-base font-semibold text-text">{pageMeta.title}</p>
          </div>

          <div className="relative w-full md:max-w-[620px] md:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <Input
              aria-label="Search courses and quiz sets"
              className="h-11 rounded-2xl border-borderc bg-soft pl-9 pr-4 placeholder:text-faint md:pr-20"
              placeholder="Search courses, quiz sets, or topics..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-lg border border-borderc bg-soft px-2 py-1 text-[11px] font-semibold text-faint md:inline-flex">
              <Command className="h-3 w-3" />
              K
            </span>

            {suggestions.length > 0 ? (
              <div className="absolute left-0 right-0 top-[50px] overflow-hidden rounded-2xl border border-borderc bg-surface shadow-elevated backdrop-blur-xl animate-fade-rise">
                {suggestions.map((item) => (
                  <button
                    type="button"
                    key={item.key}
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-text transition-colors duration-100 hover:bg-soft"
                    onClick={() => {
                      router.push(item.href);
                      setQuery("");
                    }}
                  >
                    <span>{item.label}</span>
                    <Sparkles className="h-3.5 w-3.5 text-faint" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-faint transition-colors duration-150 hover:bg-soft hover:text-muted"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              <SunMoon className="h-4 w-4" />
            </button>

            {user ? (
              <details className="relative">
                <summary className="flex list-none cursor-pointer items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-3 text-sm font-semibold text-text transition-colors duration-150 hover:bg-soft marker:content-['']">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-subtle text-xs font-bold text-accent">
                    {initials}
                  </span>
                  <span>{profile.name || "Student"}</span>
                </summary>
                <div className="absolute right-0 mt-2 w-60 rounded-xl border border-borderc bg-surface p-3 shadow-elevated backdrop-blur-xl animate-fade-rise">
                  <p className="text-caption font-bold uppercase tracking-[1.5px] text-faint">Account</p>
                  <p className="mt-1 text-sm font-semibold text-text">{profile.name || "Student"}</p>
                  <p className="text-xs text-faint">{user.email || profile.email || "No email"}</p>
                  <div className="mt-3 space-y-0.5 border-t border-borderc pt-2">
                    <button
                      type="button"
                      className="w-full rounded-lg px-2 py-2 text-left text-sm text-muted transition-colors duration-100 hover:bg-soft hover:text-text"
                      onClick={() => router.push("/app/account")}
                    >
                      Account
                    </button>
                    <button
                      type="button"
                      className="w-full rounded-lg px-2 py-2 text-left text-sm text-muted transition-colors duration-100 hover:bg-soft hover:text-text"
                      onClick={() => router.push("/app/settings")}
                    >
                      Settings
                    </button>
                    <button
                      type="button"
                      className="w-full rounded-lg px-2 py-2 text-left text-sm text-danger transition-colors duration-100 hover:bg-danger/10"
                      onClick={async () => {
                        await signOut();
                        router.replace("/login");
                        router.refresh();
                      }}
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </details>
            ) : (
              <button
                type="button"
                className="rounded-lg border border-borderc bg-soft px-3 py-2 text-sm font-semibold text-text transition-colors duration-150 hover:bg-overlay"
                onClick={() => router.push(`/login?next=${encodeURIComponent(pathname || "/courses")}`)}
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
