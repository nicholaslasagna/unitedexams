"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SunMoon, Sparkles, UserRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

  return (
    <header className="sticky top-0 z-40 border-b border-borderc/80 bg-surface/85 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="relative w-full max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            aria-label="Search courses and quiz sets"
            className="pl-9"
            placeholder="Search courses, quiz sets, or topics"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {suggestions.length > 0 ? (
            <div className="absolute left-0 right-0 top-12 rounded-xl border border-borderc bg-surface shadow-soft">
              {suggestions.map((item) => (
                <button
                  type="button"
                  key={item.key}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-text hover:bg-soft"
                  onClick={() => {
                    router.push(item.href);
                    setQuery("");
                  }}
                >
                  <span>{item.label}</span>
                  <Sparkles className="h-3.5 w-3.5 text-muted" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" className="hidden md:inline-flex" onClick={toggleTheme}>
            <SunMoon className="h-4 w-4" />
            Theme
          </Button>
          <details className="relative">
            <summary className="list-none cursor-pointer rounded-xl border border-borderc bg-soft px-3 py-2 text-sm font-semibold text-text marker:content-['']">
              <span className="flex items-center gap-2">
                <UserRound className="h-4 w-4" />
                <span className="hidden md:inline">{profile.name || "Student"}</span>
              </span>
            </summary>
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-borderc bg-surface p-3 shadow-soft">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Account</p>
              <p className="mt-1 text-sm font-semibold text-text">{profile.name || "Student"}</p>
              <p className="text-xs text-muted">{profile.school || "No school set"}</p>
              <div className="mt-3 border-t border-borderc pt-2">
                <button
                  type="button"
                  className="w-full rounded-lg px-2 py-2 text-left text-sm text-muted hover:bg-soft hover:text-text"
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
