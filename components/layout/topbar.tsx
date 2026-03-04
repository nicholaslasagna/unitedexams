"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, SunMoon, Sparkles, Command } from "lucide-react";
import { Input } from "@/components/ui/input";
import { courses, quizSets } from "@/data/seed";
import { useAppData } from "@/lib/app-data-context";
import { useToast } from "@/lib/hooks/use-toast";

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, preferences, savePreferences, signOut, user } = useAppData();
  const { push } = useToast();
  const [query, setQuery] = useState("");

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const matches = [
      ...courses
        .filter((course) => course.name.toLowerCase().includes(q) || course.code.toLowerCase().includes(q))
        .map((course) => ({ key: course.id, label: `${course.code} • ${course.name}`, href: `/app/courses/${course.id}` })),
      ...quizSets
        .filter((quiz) => quiz.title.toLowerCase().includes(q) || quiz.tags.join(" ").toLowerCase().includes(q))
        .slice(0, 4)
        .map((quiz) => ({ key: quiz.id, label: `Quiz: ${quiz.title}`, href: `/app/quiz/${quiz.id}` }))
    ];
    return matches.slice(0, 6);
  }, [query]);

  const toggleTheme = async () => {
    const next = preferences.theme === "dark" ? "light" : "dark";
    await savePreferences({ ...preferences, theme: next });
    push({ title: `${next === "dark" ? "Dark" : "Light"} theme enabled` });
  };

  const initials = (profile.name || "S").slice(0, 1).toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[rgba(5,5,16,0.88)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-5 py-3 md:px-8">
        <div className="relative w-full max-w-[620px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/[0.3]" />
          <Input
            aria-label="Search courses and quiz sets"
            className="h-10 rounded-[10px] border-white/[0.07] bg-white/[0.035] pl-9 pr-20 placeholder:text-white/[0.3] focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all"
            placeholder="Search courses, quiz sets, or topics..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-lg border border-white/[0.07] bg-white/[0.04] px-2 py-1 text-[11px] font-semibold text-white/[0.3]">
            <Command className="h-3 w-3" />
            K
          </span>
          {suggestions.length > 0 ? (
            <div className="absolute left-0 right-0 top-[46px] overflow-hidden rounded-[14px] border border-white/[0.07] bg-[rgba(5,5,16,0.95)] shadow-elevated backdrop-blur-xl">
              {suggestions.map((item) => (
                <button
                  type="button"
                  key={item.key}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm text-text hover:bg-white/[0.05]"
                  onClick={() => {
                    router.push(item.href);
                    setQuery("");
                  }}
                >
                  <span>{item.label}</span>
                  <Sparkles className="h-3.5 w-3.5 text-white/[0.3]" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-white/[0.3] transition-colors hover:text-white/[0.55] hover:bg-white/[0.05] md:inline-flex"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <SunMoon className="h-4 w-4" />
          </button>
          {user ? (
            <details className="relative">
              <summary className="flex list-none cursor-pointer items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-3 text-sm font-semibold text-text transition-colors hover:bg-white/[0.05] marker:content-['']">
                <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-accent/[0.15] text-xs font-bold text-accent">
                  {initials}
                </span>
                <span className="hidden md:inline">{profile.name || "Student"}</span>
              </summary>
              <div className="absolute right-0 mt-2 w-60 rounded-[14px] border border-white/[0.07] bg-[rgba(5,5,16,0.95)] p-3 shadow-elevated backdrop-blur-xl">
                <p className="text-[10px] font-bold tracking-[1.5px] text-white/[0.3] uppercase">Account</p>
                <p className="mt-1 text-sm font-semibold text-white">{profile.name || "Student"}</p>
                <p className="text-xs text-white/[0.3]">{user.email || profile.email || "No email"}</p>
                <div className="mt-3 border-t border-white/[0.07] pt-2">
                  <button
                    type="button"
                    className="w-full rounded-lg px-2 py-2 text-left text-sm text-white/[0.55] hover:bg-white/[0.05] hover:text-text"
                    onClick={() => router.push("/app/account")}
                  >
                    Account
                  </button>
                  <button
                    type="button"
                    className="w-full rounded-lg px-2 py-2 text-left text-sm text-white/[0.55] hover:bg-white/[0.05] hover:text-text"
                    onClick={() => router.push("/app/settings")}
                  >
                    Settings
                  </button>
                  <button
                    type="button"
                    className="w-full rounded-lg px-2 py-2 text-left text-sm text-danger hover:bg-danger/10"
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
              className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm font-semibold text-text hover:bg-white/[0.08]"
              onClick={() => router.push(`/login?next=${encodeURIComponent(pathname || "/courses")}`)}
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
