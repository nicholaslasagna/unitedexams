import { ArrowRight, GraduationCap, UserCheck } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";

const studentSteps = [
  {
    title: "Open a course hub",
    text: "Everything for that class — quizzes, exams, notes, cheat sheets, resources — sits in one place."
  },
  {
    title: "Pick a study mode",
    text: "Test, Walkthrough, Timed Exam, Homework Desk. The set stays the same — the experience changes."
  },
  {
    title: "See what to fix",
    text: "Mistake history, weak topics, and recommended next actions surface on every return."
  }
];

const professorSteps = [
  {
    title: "Open a section",
    text: "One private space per class section — material, announcements, assignments, and grading live together."
  },
  {
    title: "Assign and observe",
    text: "Hand out a quiz or exam, then watch class progress without leaving the section view."
  },
  {
    title: "Talk to students directly",
    text: "Post announcements, share resources, and adjust the course as the term moves."
  }
];

export function WorkflowSplit() {
  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Two workflows · one platform"
        title="Built for the people on both sides of the class."
        description="Students and instructors share the same course foundation, with separate workflows that respect each role."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <WorkflowColumn
          icon={<GraduationCap className="h-5 w-5" />}
          tag="For students"
          title="Make the term feel quieter."
          steps={studentSteps}
          accentClass="from-cyan-500/15 to-blue-500/15"
          ringClass="border-cyan-400/30"
        />
        <WorkflowColumn
          icon={<UserCheck className="h-5 w-5" />}
          tag="For professors"
          title="Run the section like a real workspace."
          steps={professorSteps}
          accentClass="from-fuchsia-500/15 to-violet-500/15"
          ringClass="border-fuchsia-400/30"
        />
      </div>
    </section>
  );
}

function WorkflowColumn({
  icon,
  tag,
  title,
  steps,
  accentClass,
  ringClass
}: {
  icon: React.ReactNode;
  tag: string;
  title: string;
  steps: { title: string; text: string }[];
  accentClass: string;
  ringClass: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[1.5rem] border ${ringClass} bg-gradient-to-br ${accentClass} p-5 sm:p-6`}
    >
      <div className="absolute inset-0 -z-10 opacity-60">
        <div className="absolute -top-20 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,hsl(var(--accent)/0.16),transparent_70%)] blur-3xl" />
      </div>

      <div className="flex items-center gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-borderc bg-surface text-accent">
          {icon}
        </span>
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-accent">{tag}</p>
          <p className="mt-0.5 font-display text-xl font-semibold text-text">{title}</p>
        </div>
      </div>

      <ol className="mt-5 space-y-3">
        {steps.map((step, idx) => (
          <li
            key={step.title}
            className="flex gap-3 rounded-[1rem] border border-borderc/80 bg-surface/80 p-3 backdrop-blur"
          >
            <span className="step-badge mt-0.5 shrink-0">{idx + 1}</span>
            <div>
              <p className="text-[14.5px] font-semibold text-text">{step.title}</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-text-secondary">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-4 flex items-center gap-2 text-[12.5px] text-text-secondary">
        <span className="text-accent font-semibold">Same shell</span>
        <ArrowRight className="h-3.5 w-3.5 text-text-secondary" />
        <span>different lens</span>
      </div>
    </div>
  );
}
