import { PublicShell } from "@/components/layout/public-shell";
import { LeaderboardPageContent } from "@/features/leaderboard/page";

export default function PublicLeaderboardPage() {
  return (
    <PublicShell>
      <LeaderboardPageContent publicMode />
    </PublicShell>
  );
}
