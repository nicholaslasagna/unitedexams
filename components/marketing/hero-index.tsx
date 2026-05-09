import Link from "next/link";

/**
 * Editorial-magazine "Course Index" — replaces the old fake-product
 * window mockup that lived in the hero. The mockup looked like every
 * other AI-generated SaaS landing page: a floating dark card with a
 * pretend live demo inside. This is what a real publication does
 * instead — a typographic table of contents, with serif italics,
 * hairline rules, page-number-style course codes, and a quiet
 * "Volume / Issue" masthead.
 *
 * Pure typography, no glow effects, no live dots, no animation. The
 * hand-crafted course illustrations on /courses are still the visual
 * payoff; this hero block is the front-of-book.
 */
export function HeroIndex({
  courses
}: {
  courses: Array<{
    id: string;
    code: string;
    name: string;
    difficulty: string;
    questionCount: number;
    estimatedMinutes: number;
  }>;
}) {
  return (
    <aside className="relative overflow-hidden rounded-[1.4rem] border border-borderc bg-surface px-6 py-7 sm:px-8 sm:py-9">
      {/* Top masthead row — "Vol. I / Issue 01" left, "Spring 2026" right */}
      <div className="flex items-baseline justify-between border-b border-borderc pb-4">
        <p className="font-display text-[12.5px] italic text-text-secondary">
          Vol. <span className="not-italic font-medium">I</span> · Issue <span className="not-italic font-medium">01</span>
        </p>
        <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-text-secondary">
          Spring 2026
        </p>
      </div>

      {/* Index heading — small caps editorial label */}
      <p className="mt-5 font-display text-[10.5px] uppercase tracking-[0.32em] text-text-secondary">
        Course Index
      </p>

      {/* The list — serif italic course names, mono codes, page-number-style runway minutes */}
      <ol className="mt-3 divide-y divide-borderc">
        {courses.map((course, idx) => (
          <li key={course.id}>
            <Link
              href={`/courses/${course.id}`}
              className="group flex items-baseline justify-between gap-3 py-3 transition-colors duration-150 hover:bg-soft/40"
            >
              {/* Issue numeral (small, oldstyle) */}
              <span
                aria-hidden
                className="w-6 shrink-0 font-mono text-[11px] tabular-nums text-text-secondary/70"
              >
                {String(idx + 1).padStart(2, "0")}
              </span>

              {/* Course name in serif italic — the visual anchor */}
              <span className="flex-1 truncate">
                <span className="font-display text-[20px] italic leading-snug text-text transition-colors group-hover:text-accent">
                  {course.name}
                </span>
              </span>

              {/* Right column: course code + a leader-dot to the runway */}
              <span className="hidden items-baseline gap-2 sm:flex">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-text-secondary">
                  {course.code}
                </span>
              </span>

              {/* Page-number style: runway minutes (mono, oldstyle) */}
              <span className="font-mono text-[12px] tabular-nums text-text-secondary">
                p.&nbsp;{course.estimatedMinutes}
              </span>
            </Link>
          </li>
        ))}
      </ol>

      {/* Footer caption — colophon-style note */}
      <div className="mt-5 border-t border-borderc pt-4">
        <p className="font-display text-[12.5px] italic leading-relaxed text-text-secondary">
          Each entry is a complete course hub — quizzes, exam simulations,
          homework, notes, and reference material — kept inside the class
          it belongs to.
        </p>
      </div>

      {/* Page number in the corner, like a real bound publication */}
      <p
        aria-hidden
        className="absolute bottom-3 right-4 font-display text-[10px] italic text-text-secondary/50"
      >
        — i —
      </p>
    </aside>
  );
}
