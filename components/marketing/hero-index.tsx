import Link from "next/link";
import { CURRENT_TERM } from "@/data/seed/term";

/**
 * Editorial-magazine "Course Index" — the front-of-book sidebar that
 * sits in the homepage hero. Modeled on a printed publication's TOC:
 * a "Vol. I / Issue 01" masthead, a small caps "Course Index" label,
 * a list of italic-serif course names with mono codes and "p. NNN"
 * page-number-style runway minutes, then a colophon and a tiny
 * roman-numeral page mark in the corner.
 *
 * Pure typography — no glow, no live dot, no animation. The hero is
 * the brand wordmark; this is the reference index next to it.
 */
export function HeroIndex({
  courses
}: {
  courses: Array<{
    id: string;
    code: string;
    name: string;
    shortName?: string;
    estimatedMinutes: number;
  }>;
}) {
  /*
   * The index is editorial furniture beside the wordmark, not the catalogue.
   * It was built when there were four classes; at nine it grew taller than
   * the hero itself and pushed the page out of proportion. Show a handful
   * and send the rest to the real listing.
   */
  const MAX_ROWS = 5;
  const shown = courses.slice(0, MAX_ROWS);
  const remaining = courses.length - shown.length;
  return (
    <aside className="course-index" aria-label="Course index">
      <div className="ci-masthead">
        <p className="vol">
          Vol. <b>I</b> · Issue <b>01</b>
        </p>
        <p className="term">{CURRENT_TERM.label}</p>
      </div>

      <p className="ci-label">Course Index</p>

      <ol className="ci-list">
        {shown.map((course, idx) => (
          <li key={course.id}>
            <Link href={`/courses/${course.id}`} className="ci-row">
              <span className="ci-num">{String(idx + 1).padStart(2, "0")}</span>
              <span>
                <span className="ci-name">{course.shortName ?? course.name}</span>
              </span>
              <span className="ci-meta">
                <span>{course.code}</span>
                <span className="page">p.&nbsp;{course.estimatedMinutes}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>

      {remaining > 0 ? (
        <Link href="/courses" className="ci-more">
          + {remaining} more {remaining === 1 ? "class" : "classes"}
        </Link>
      ) : null}

      <p className="ci-colophon">
        Each entry is a complete class — quizzes, exam simulations,
        homework, notes, and reference material — kept inside the class
        it belongs to.
      </p>
      <p className="ci-pageno" aria-hidden>
        — i —
      </p>
    </aside>
  );
}
