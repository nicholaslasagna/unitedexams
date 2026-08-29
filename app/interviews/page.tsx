import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { InterviewsIndexContent } from "@/features/interviews/interviews-index-page";

export const metadata: Metadata = {
  title: "Interview practice",
  description:
    "Technical interview loops for Google, Meta, Apple, OpenAI and Anthropic — the real rounds, scored against the signals interviewers actually look for."
};

/**
 * The public face of the interview catalogue.
 *
 * The public nav used to point straight at /app/interviews, which meant a
 * signed-out visitor following it landed inside the app shell: the
 * navigation changed shape under them and every link in the new sidebar
 * bounced to sign-in. Browsing what is on offer belongs on the public side;
 * only sitting an interview needs an account, and the cards handle that.
 */
export default function PublicInterviewsPage() {
  return (
    <PublicShell>
      <InterviewsIndexContent />
    </PublicShell>
  );
}
