import Link from "next/link";

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
    estimatedMinutes: number;
  }>;
}) {
  return (
    <aside className="course-index" aria-label="Course index">
      <div className="ci-masthead">
        <p className="vol">
          Vol. <b>I</b> · Issue <b>01</b>
        </p>
        <p className="term">Spring 2026</p>
      </div>

      <p className="ci-label">Course Index</p>

      <ol className="ci-list">
        {courses.map((course, idx) => (
          <li key={course.id}>
            <Link href={`/courses/${course.id}`} className="ci-row">
              <span className="ci-num">{String(idx + 1).padStart(2, "0")}</span>
              <span>
                <span className="ci-name">{course.name}</span>
              </span>
              <span className="ci-meta">
                <span>{course.code}</span>
                <span className="page">p.&nbsp;{course.estimatedMinutes}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>

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
