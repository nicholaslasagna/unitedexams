import Link from "next/link";
import { ArrowRight, Building2, Crown, GraduationCap, Sparkles, UserCheck } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";

const tiers = [
  {
    icon: <Sparkles className="h-4 w-4" />,
    title: "Free students",
    description:
      "Browse public hubs, try guided quizzes, and save basic progress with a free account.",
    accent: "from-cyan-500/12 to-blue-500/10",
    border: "border-cyan-400/25"
  },
  {
    icon: <Crown className="h-4 w-4" />,
    title: "Premium students",
    description:
      "Saved progress, step-by-step solutions, timed practice exams, mistake review, and progress tracking.",
    accent: "from-amber-500/12 to-rose-500/10",
    border: "border-amber-400/25"
  },
  {
    icon: <Building2 className="h-4 w-4" />,
    title: "Verified students through their school",
    description:
      "When the institution covers access, premium gates disappear. No popups, no upgrade nags — just the platform.",
    accent: "from-emerald-500/12 to-teal-500/10",
    border: "border-emerald-400/25"
  },
  {
    icon: <UserCheck className="h-4 w-4" />,
    title: "Professors & verified instructors",
    description:
      "Sections, assignments, announcements, and exam settings. The professor workspace lives alongside the public study library.",
    accent: "from-fuchsia-500/12 to-violet-500/10",
    border: "border-fuchsia-400/25"
  }
];

export function AccessModelSection() {
  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Access model"
        title="Built so the right experience finds the right person."
        description="One platform, four audiences. Each one sees a version of United Exams that respects how they actually work — without burying anyone in upgrade prompts."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {tiers.map((tier) => (
          <div
            key={tier.title}
            className={`relative overflow-hidden rounded-[1.4rem] border ${tier.border} bg-gradient-to-br ${tier.accent} p-5 transition-all duration-200 ease-out-expo hover:-translate-y-0.5 hover:shadow-card-hover`}
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-borderc bg-surface text-accent">
              {tier.icon}
            </span>
            <p className="mt-3 font-display text-lg font-semibold text-text">{tier.title}</p>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-text-secondary">
              {tier.description}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-[1.25rem] border border-borderc bg-surface/85 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13.5px] text-text-secondary">
          Verified students and professors at partner schools{" "}
          <span className="font-semibold text-text">never see premium prompts</span>. The
          institution path is the cleanest.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/contact?intent=implementation&role=teacher"
            className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-[13px] font-semibold text-accent transition-colors hover:bg-accent/15"
          >
            <GraduationCap className="h-3.5 w-3.5" />
            Talk to us about a class
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
