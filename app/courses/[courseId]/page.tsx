"use client";

import { useParams } from "next/navigation";
import { PublicShell } from "@/components/layout/public-shell";
import { CourseDetailContent } from "@/features/study/course-detail-page";

export default function PublicCourseDetailPage() {
  const params = useParams<{ courseId: string }>();

  return (
    <PublicShell>
      <CourseDetailContent courseId={params.courseId} routePrefix="" />
    </PublicShell>
  );
}
