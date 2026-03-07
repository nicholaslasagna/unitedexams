import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { CoursesIndexContent } from "@/features/study/courses-index-page";

export const metadata: Metadata = {
  title: "Courses",
  alternates: {
    canonical: "/courses"
  }
};

export default function PublicCoursesPage() {
  return (
    <PublicShell>
      <CoursesIndexContent routePrefix="" />
    </PublicShell>
  );
}
