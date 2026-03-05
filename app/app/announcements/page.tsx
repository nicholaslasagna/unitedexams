import { Suspense } from "react";
import { AnnouncementsPageContent } from "@/features/announcements/page";

export default function AnnouncementsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading announcements…</p>}>
      <AnnouncementsPageContent />
    </Suspense>
  );
}
