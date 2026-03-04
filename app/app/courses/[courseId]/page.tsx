"use client";

import { useParams } from "next/navigation";
import { CourseDetailContent } from "@/features/study/course-detail-page";

export default function CourseDetailPage() {
  const params = useParams<{ courseId: string }>();
  return <CourseDetailContent courseId={params.courseId} routePrefix="/app" />;
}
