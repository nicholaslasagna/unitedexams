import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { PricingCard } from "@/components/ui/pricing-card";
import { Button } from "@/components/ui/button";

export function PricingSection() {
  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Simple, respectful pricing"
        title="Free is generous. Premium is optional. Institution is invisible."
        description="The free tier covers the everyday flow. Premium unlocks deeper review and analytics. If your class is covered by your school, you never see a gate at all."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <PricingCard
          tier="free"
          name="Free"
          tagline="The everyday study flow, on the house."
          price="$0"
          cadence="forever"
          features={[
            "Browse all public course hubs",
            "Try guided quizzes",
            "Sample homework walkthroughs",
            "Save basic progress with a free account",
            "View leaderboard top entries"
          ]}
          cta={
            <Button asChild variant="secondary">
              <Link href="/signup">
                Create a free account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          }
          footnote="No credit card required."
        />

        <PricingCard
          tier="premium"
          name="Premium Student"
          tagline="For students who want the deeper review and analytics."
          price="$8"
          cadence="/ month"
          highlighted
          features={[
            "Unlimited saved progress and history",
            "Full quiz banks across courses",
            "Advanced Study Walkthrough",
            "Timed exam simulations + readiness signal",
            "Mistake history + smart review plans",
            "Mastery tracking and weak-topic recs"
          ]}
          cta={
            <>
              <Button asChild>
                <Link href="/signup?plan=premium-monthly">
                  Start Premium
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/signup?plan=premium-yearly">
                  Or save with annual
                </Link>
              </Button>
            </>
          }
          footnote="Annual: $72/yr ($6/mo). Cancel anytime."
        />

        <PricingCard
          tier="institution"
          name="Class / Institution"
          tagline="When the school covers access. The cleanest path for a real course."
          price="Custom"
          cadence="per class / program"
          features={[
            "Verified students get full access — no popups",
            "Section-aware professor workspace",
            "Assignments, announcements, grading",
            "Exam integrity controls",
            "Direct content collaboration with our team",
            "Centralized billing — no per-student forms"
          ]}
          cta={
            <Button asChild>
              <Link href="/contact?intent=implementation&role=teacher">
                Talk to us
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          }
          footnote="Best for instructors, departments, and programs."
        />
      </div>
    </section>
  );
}
