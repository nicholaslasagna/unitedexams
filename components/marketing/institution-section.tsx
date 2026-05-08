import Link from "next/link";
import { Building2, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const points = [
  {
    icon: <ShieldCheck className="h-4 w-4" />,
    title: "Verified students stay unblocked",
    text: "When the school covers access, premium gates and upgrade prompts disappear. The experience just feels included."
  },
  {
    icon: <Sparkles className="h-4 w-4" />,
    title: "Professors get their own surface",
    text: "Sections, announcements, assignments, grading, and exam settings live alongside the public study library."
  },
  {
    icon: <Building2 className="h-4 w-4" />,
    title: "One central handoff for the class",
    text: "We work directly with the instructor, the department, or the program — no per-student paperwork required."
  }
];

export function InstitutionSection() {
  return (
    /*
     * Editorial section — no aurora background, no backdrop-blur. The
     * institution promise stands on its own typographically; visual
     * decoration would dilute it. A single hairline-bordered card
     * with calm interior layout reads as "considered," not "marketing."
     */
    <section>
      <div className="rounded-[1.6rem] border border-borderc bg-surface p-5 sm:p-7 lg:p-9">
        <div className="grid gap-7 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-4">
            {/* No eyebrow here — the headline itself names the topic. */}
            <h2 className="font-display text-[2.1rem] font-semibold leading-[1.05] tracking-tight text-text sm:text-[2.6rem]">
              When your class is covered, you never see a paywall.
            </h2>
            <p className="max-w-xl text-[15px] leading-relaxed text-text-secondary">
              United Exams works directly with classes, departments, and programs.
              When your school officially partners with us, verified students and
              professors get the full platform — no nags, no popups, no friction.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/contact?intent=implementation&role=teacher">
                  Talk to us about your class
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/contact?intent=implementation&role=student">
                  Suggest us to a professor
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {points.map((point, idx) => (
              <div
                key={point.title}
                className="flex gap-3 rounded-[1.2rem] border border-borderc bg-surface/85 p-4 backdrop-blur"
              >
                <span className="step-badge mt-0.5 shrink-0">{idx + 1}</span>
                <div className="space-y-1">
                  <p className="flex items-center gap-2 text-[14.5px] font-semibold text-text">
                    <span className="text-success">{point.icon}</span>
                    {point.title}
                  </p>
                  <p className="text-[13px] leading-relaxed text-text-secondary">{point.text}</p>
                </div>
              </div>
            ))}

            <div className="flex items-center gap-2 rounded-[1rem] border border-success/30 bg-success/10 px-3 py-2.5 text-[12.5px] text-text">
              <ShieldCheck className="h-4 w-4 text-success" />
              <span>
                Verified school users see <strong className="font-semibold">zero</strong> upgrade prompts.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
