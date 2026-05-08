import { BookOpenCheck, GraduationCap, Notebook, Timer } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";

// Each mode gets one tone-tinted top stripe so users can tell the cards
// apart without flooding the surface. Saturated stops on the stripe; the
// card body stays calm/neutral.
const modes = [
  {
    icon: <GraduationCap className="h-5 w-5" />,
    name: "Test Mode",
    desc: "Answer-first flow, graded accuracy, explanations on demand. The fastest way to know what you don't know.",
    bullets: ["Instant grading", "Per-question explanations", "Best/last score tracking"],
    tone: "from-cyan-500 to-blue-500"
  },
  {
    icon: <BookOpenCheck className="h-5 w-5" />,
    name: "Study Walkthrough",
    desc: "Hint-by-hint guidance, then a full solution after submit. Learn the method, not just the answer.",
    bullets: ["Step reveal", "Why this answer · why others are wrong", "Mistake history"],
    tone: "from-emerald-500 to-teal-500"
  },
  {
    icon: <Timer className="h-5 w-5" />,
    name: "Timed Exam",
    desc: "Strict timer, randomized order, end-of-exam review. Rehearse the actual section window.",
    bullets: ["Pacing rehearsal", "Exam-style review", "Readiness signal"],
    tone: "from-amber-500 to-rose-500"
  },
  {
    icon: <Notebook className="h-5 w-5" />,
    name: "Homework Desk",
    desc: "One problem at a time, with hints, flag-for-review, and worked examples. Built like an assignment.",
    bullets: ["Per-problem flow", "Reveal solution", "Saved progress"],
    tone: "from-violet-500 to-fuchsia-500"
  }
];

export function StudyModesSection() {
  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Four study modes"
        title="One quiz set, four ways to learn it."
        description="Pick the mode that matches your moment. Switch without losing the question, your selections, or your context."
      />
      {/*
       * Mode cards — pulled back to a calmer treatment. Each card was
       * previously a colored gradient surface with a glowing radial
       * blob; together (4 cards, 4 blobs, 4 gradients) they read as
       * "AI marketing template." Now: hairline border, subtle accent
       * stripe at the top, content carries the differentiation.
       */}
      <div className="grid gap-4 md:grid-cols-2">
        {modes.map((mode) => (
          <div
            key={mode.name}
            className={`group relative flex flex-col overflow-hidden rounded-[1.25rem] border border-borderc bg-surface p-5 transition-all duration-200 ease-out-expo hover:-translate-y-0.5 hover:border-border-accent`}
          >
            {/* tone-tinted top stripe — identifies the mode without flooding the card */}
            <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${mode.tone}`} />
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-borderc bg-soft text-accent">
                {mode.icon}
              </span>
              <p className="font-display text-lg font-semibold text-text">{mode.name}</p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">{mode.desc}</p>
            <ul className="mt-4 space-y-1.5">
              {mode.bullets.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-2 text-[13px] text-text-secondary"
                >
                  <span className="mt-[7px] inline-block h-1 w-1 rounded-full bg-accent" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
