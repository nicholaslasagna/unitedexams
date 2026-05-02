import { ShieldCheck, Lock, Notebook, GraduationCap } from "lucide-react";

const items = [
  {
    icon: <Notebook className="h-4 w-4" />,
    title: "Built for real courses",
    text: "Every quiz set, exam simulation, and walkthrough is anchored to a course code — not a random flashcard pile."
  },
  {
    icon: <GraduationCap className="h-4 w-4" />,
    title: "Professor-ready sections",
    text: "Sections are private, assignment-aware, and respect grading policies (auto, manual, or mixed)."
  },
  {
    icon: <Lock className="h-4 w-4" />,
    title: "Privacy-aware leaderboard",
    text: "Display name, real name, and university visibility are user-controlled. We respect what students choose to share."
  },
  {
    icon: <ShieldCheck className="h-4 w-4" />,
    title: "Transparent access",
    text: "Free is generous. Premium is optional. Institution access removes gates entirely. No nickel-and-diming."
  }
];

export function TrustSection() {
  return (
    <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.title}
          className="rounded-[1.2rem] border border-borderc bg-surface p-4 shadow-subtle transition-all duration-200 ease-out-expo hover:-translate-y-0.5 hover:border-border-accent hover:shadow-card-hover"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
            {item.icon}
          </span>
          <p className="mt-3 font-display text-[15px] font-semibold text-text">{item.title}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">{item.text}</p>
        </div>
      ))}
    </section>
  );
}
