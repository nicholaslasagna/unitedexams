import Link from "next/link";
import { ArrowRight, HeartHandshake } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { HeroIndex } from "@/components/marketing/hero-index";
import { HeroStampCta } from "@/components/marketing/hero-stamp-cta";
import { CourseRail } from "@/components/marketing/course-rail";
import { Reveal } from "@/components/ui/reveal";
import { StudyModesSection } from "@/components/marketing/study-modes";
import { WorkflowSplit } from "@/components/marketing/workflow-split";
import { InstitutionSection } from "@/components/marketing/institution-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { courses, quizSets } from "@/data/seed";
import { resolveQuizSetMode } from "@/lib/study/set-mode";

/**
 * Homepage — the editorial "United Exams" landing page.
 *
 * Modeled on the Claude Design output and built around three
 * commitments:
 *
 *   1. Brand-as-hero. The wordmark is the hero — Rodin Bokutoh
 *      "United" with a Fraunces italic accent on "Exams" — not a
 *      tagline, not a fake product mockup, not a glow card.
 *
 *   2. Editorial publication tone. Hairline rules between sections,
 *      mono uppercase labels, italic-serif titles, oldstyle page
 *      numbers in the corners. Reads like the front of a magazine.
 *
 *   3. One confident CTA. A passport-stamp-style accent button,
 *      flanked by a quiet ghost link. No stack of pill buttons, no
 *      "Get started" repeated five times.
 *
 * Atmospheric backdrop: three fixed overlays (haze + noise + embers)
 * plus the United Exams logo as a soft watermark behind everything.
 * The CourseRail is a fixed vertical strip of mono course-codes on
 * the right edge, scrolling in sync with the courses grid via
 * IntersectionObserver. Both are homepage-only.
 */

// Per-course glyph used in the courses-grid tile art. Mono characters
// that hint at what the course actually contains — a fragment of the
// vocabulary, not a generic icon. Matches the publication tone.
const courseGlyph: Record<string, string> = {
  "software-engineering": "{ }",
  "differential-equations": "∂y / ∂x",
  "computer-architecture": "0x7F",
  "theory-of-automata": "δ(q,a)"
};

export default function LandingPage() {
  const totalMinutes = quizSets.reduce((sum, set) => sum + set.estMinutes, 0);
  const totalQuestions = quizSets.reduce((sum, set) => sum + set.questions.length, 0);

  // Build the course atlas the homepage needs for the index, the rail,
  // and the courses grid. Mastery is a coarse heuristic based on the
  // number of seeded sets so the bar shows something believable on the
  // public landing page (the real per-user mastery shows after sign-in).
  const courseAtlas = courses
    .map((course) => {
      const sets = quizSets.filter((set) => set.courseId === course.id);
      const quizCount = sets.filter((set) => resolveQuizSetMode(set) === "quiz").length;
      const examCount = sets.filter((set) => resolveQuizSetMode(set) === "exam").length;
      const homeworkCount = sets.filter((set) => resolveQuizSetMode(set) === "homework").length;
      const estimatedMinutes = sets.reduce((sum, set) => sum + set.estMinutes, 0);
      const questionCount = sets.reduce((sum, set) => sum + set.questions.length, 0);
      // Heuristic: more sets ≈ richer course ≈ a slightly higher
      // mastery bar in the public preview. Caps at 75 so it never
      // looks "complete" on a logged-out view.
      const mastery = Math.min(75, 14 + sets.length * 7);
      return {
        ...course,
        glyph: courseGlyph[course.id] ?? "·",
        quizCount,
        examCount,
        homeworkCount,
        estimatedMinutes,
        questionCount,
        mastery
      };
    })
    .sort(
      (left, right) =>
        right.quizCount + right.examCount + right.homeworkCount -
        (left.quizCount + left.examCount + left.homeworkCount)
    );

  const railEntries = courseAtlas.map((c) => ({ id: c.id, code: c.code }));

  return (
    <PublicShell>
      {/* ── Atmospheric background: haze + noise + drifting embers ──
          plus the United Exams logo as a soft watermark behind it all.
          All four layers are pointer-events: none and z-index 0; main
          content sits at z-index 1 thanks to PublicShell's `relative
          z-[1]`. The CSS lives in globals.css under the "Editorial
          Homepage System" block. */}
      <div className="page-atmosphere" aria-hidden>
        <div
          className="page-logo"
          style={{
            ["--page-logo-image" as string]: "url(/images/logo.png)"
          }}
        />
        <div className="page-haze" />
        <div className="page-noise" />
        <div className="page-embers" />
      </div>

      {/* Persistent right-rail of course shortcuts (desktop only) */}
      <CourseRail entries={railEntries} />

      <div className="space-y-2 pb-8">
        {/* ─── HERO ────────────────────────────────────────────── */}
        <section
          className="grid gap-12 py-10 lg:grid-cols-[1.35fr_0.85fr] lg:items-center lg:gap-16 lg:py-16"
          aria-label="Hero"
        >
          <div className="space-y-9">
            <p className="reveal-up reveal-d-1 hero-kicker">
              Course-native study platform · Spring 2026
            </p>

            {/* Brand-as-hero wordmark — Rodin Bokutoh + Fraunces italic. */}
            <h1 className="reveal-up reveal-d-2 wordmark">
              United <em>Exams</em>
              <span className="period">.</span>
            </h1>

            <p className="reveal-up reveal-d-3 hero-lede">
              A workspace for the courses you&apos;re <strong>actually</strong> taking
              — quizzes, walkthroughs, exam simulations, and notes, kept inside
              the class they belong to.
            </p>

            <div className="reveal-up reveal-d-4">
              <HeroStampCta />
            </div>

            <p className="reveal-up reveal-d-5 trust-line">
              No credit card to try.
              <span className="dot" />
              Free is generous.
              <span className="dot" />
              Verified school users never see a paywall.
            </p>
          </div>

          <div className="reveal-up reveal-d-6">
            <HeroIndex courses={courseAtlas} />
          </div>
        </section>

        <hr className="fold-rule" />

        {/* ─── LIBRARY STATS STRIP ─────────────────────────── */}
        <Reveal as="section" className="ed-section">
          <div className="ed-section-head">
            <h2>
              The <em>library</em>, today.
            </h2>
            <p className="section-meta">Updated continuously</p>
          </div>
          <div className="stats-strip">
            <div>
              <span className="num">{courseAtlas.length}</span>
              <span className="label">Courses</span>
            </div>
            <div>
              <span className="num">{quizSets.length}</span>
              <span className="label">Quiz sets</span>
            </div>
            <div>
              <span className="num">{totalQuestions.toLocaleString()}</span>
              <span className="label">Questions</span>
            </div>
            <div>
              <span className="num">
                {totalMinutes.toLocaleString()}
                <em>m</em>
              </span>
              <span className="label">Practice</span>
            </div>
          </div>
        </Reveal>

        {/* ─── FEATURED COURSES ────────────────────────────── */}
        <section id="courses">
        <Reveal as="section" className="ed-section">
          <div className="ed-section-head">
            <h2>
              Open a class. <em>Start studying.</em>
            </h2>
            <p className="section-meta">Four hubs · Spring 26</p>
          </div>

          <div className="courses-grid">
            {courseAtlas.map((course, idx) => (
              <Link
                key={course.id}
                id={course.id}
                href={`/courses/${course.id}`}
                className="course-card-ed"
              >
                {/* Editorial axis-grid + mono glyph + serif numeral */}
                <div className="course-art-ed" aria-hidden>
                  <div className="axis" />
                  <span className="glyph">{course.glyph}</span>
                  <span className="corner-mark">
                    №&nbsp;{String(idx + 1).padStart(2, "0")}
                  </span>
                </div>

                <span className="course-code-pill">{course.code}</span>
                <h3 className="course-title-ed">{course.name}</h3>
                <p className="course-desc-ed">{course.description}</p>

                <div className="mastery">
                  <div className="mastery-row">
                    <span>Mastery</span>
                    <span>
                      <b>{course.mastery}%</b>
                    </span>
                  </div>
                  <div className="mastery-track">
                    <div
                      className="mastery-fill"
                      style={{ width: `${course.mastery}%` }}
                    />
                  </div>
                </div>

                <span className="course-open">Open hub</span>
              </Link>
            ))}
          </div>
        </Reveal>
        </section>

        {/* ─── STUDY MODES ─────────────────────────────────── */}
        <Reveal>
          <StudyModesSection />
        </Reveal>

        {/* ─── WORKFLOW SPLIT ──────────────────────────────── */}
        <Reveal>
          <WorkflowSplit />
        </Reveal>

        {/* ─── INSTITUTION ─────────────────────────────────── */}
        <Reveal>
          <InstitutionSection />
        </Reveal>

        {/* ─── PRICING ─────────────────────────────────────── */}
        <Reveal>
          <PricingSection />
        </Reveal>

        {/* ─── CLOSER ──────────────────────────────────────── */}
        <Reveal as="section" className="ed-section">
          <h2 className="font-wordmark text-[clamp(32px,5vw,68px)] font-bold leading-[1.0] tracking-[-0.03em] text-text">
            The kind of study tool a student wishes their{" "}
            <em className="font-display italic font-medium text-accent" style={{ fontVariationSettings: '"opsz" 144' }}>
              course already had
            </em>
            .
          </h2>

          <div className="closer-grid">
            <Link href="/contact?intent=implementation" className="closer-card-ed">
              <span className="cc-eyebrow">Already studying?</span>
              <h3 className="cc-title-ed">Bring your class with you.</h3>
              <p className="cc-text-ed">
                Ask us to spin up a hub for your course — we&apos;ll work with the
                instructor or department directly.
              </p>
              <span className="cc-cta">
                Request a class
                <HeartHandshake className="h-3.5 w-3.5" />
              </span>
            </Link>
            <Link
              href="/contact?intent=implementation&role=teacher"
              className="closer-card-ed"
            >
              <span className="cc-eyebrow">Teaching a section?</span>
              <h3 className="cc-title-ed">
                Start with a verified instructor account.
              </h3>
              <p className="cc-text-ed">
                Sections, assignments, announcements, exam settings, grading —
                inside one shell.
              </p>
              <span className="cc-cta">
                Talk to us
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>
        </Reveal>
      </div>
    </PublicShell>
  );
}
