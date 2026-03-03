"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SunMoon, Sparkles, UserRound, Command } from "lucide-react";
import { Input } from "@/components/ui/input";
import { courses, quizSets } from "@/data/seed";
import { useAppData } from "@/lib/app-data-context";
import { useToast } from "@/lib/hooks/use-toast";

export function Topbar() {
  const router = useRouter();
  const { profile, preferences, savePreferences } = useAppData();
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
    <header className="sticky top-0 z-40 border-b border-borderc bg-[hsl(var(--layer-1)/0.90)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-5 py-3 md:px-8">
        <div className="relative w-full max-w-[620px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <Input
            aria-label="Search courses and quiz sets"
            className="h-10 rounded-xl border border-borderc bg-white/[0.04] pl-9 pr-20 placeholder:text-faint focus:border-brand-2/50 focus:ring-2 focus:ring-brand-2/20 transition-all"
            placeholder="Search courses, quiz sets, or topics..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-lg border border-borderc bg-white/[0.06] px-2 py-1 text-[11px] font-semibold text-faint">
            <Command className="h-3 w-3" />
            K
          </span>
          {suggestions.length > 0 ? (
            <div className="absolute left-0 right-0 top-[46px] overflow-hidden rounded-xl border border-borderc bg-surface shadow-elevated">
              {suggestions.map((item) => (
                <button
                  type="button"
                  key={item.key}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm text-text hover:bg-surface-raised"
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-faint transition-colors hover:text-text hover:bg-white/[0.05] md:inline-flex"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <SunMoon className="h-4 w-4" />
          </button>
          <details className="relative">
            <summary className="flex list-none cursor-pointer items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-3 text-sm font-semibold text-text transition-colors hover:bg-white/[0.05] marker:content-['']">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-2/20 text-xs font-bold text-brand-2">
                {initials}
              </span>
              <span className="hidden md:inline">{profile.name || "Student"}</span>
            </summary>
            <div className="absolute right-0 mt-2 w-60 rounded-xl border border-borderc bg-surface p-3 shadow-elevated">
              <p className="text-[10px] uppercase tracking-[0.12em] text-faint">Account</p>
              <p className="mt-1 text-sm font-semibold text-text">{profile.name || "Student"}</p>
              <p className="text-xs text-faint">{profile.school || "No school set"}</p>
              <div className="mt-3 border-t border-borderc pt-2">
                <button
                  type="button"
                  className="w-full rounded-lg px-2 py-2 text-left text-sm text-muted hover:bg-surface-raised hover:text-text"
                  onClick={() => router.push("/app/settings")}
                >
                  Profile & Settings
                </button>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
