import { PublicShell } from "@/components/layout/public-shell";
import { CoursesIndexContent } from "@/features/study/courses-index-page";

export default function PublicCoursesPage() {
  return (
    <PublicShell>
      <CoursesIndexContent routePrefix="" />
    </PublicShell>
  );
}
