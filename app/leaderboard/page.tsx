import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { LeaderboardPageContent } from "@/features/leaderboard/page";

export const metadata: Metadata = {
  title: "Leaderboard",
  description:
    "See how students are scoring across United Exams courses. Posting a score is opt-in, and your real name and university stay hidden unless you choose to show them."
};

export default function PublicLeaderboardPage() {
  return (
    <PublicShell>
      <LeaderboardPageContent publicMode />
    </PublicShell>
  );
}
