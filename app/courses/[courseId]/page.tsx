import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { CourseDetailContent } from "@/features/study/course-detail-page";
import { getCourse } from "@/data/seed";


export async function generateMetadata({
  params
}: {
  params: Promise<{ courseId: string }>;
}): Promise<Metadata> {
  const { courseId } = await params;
  const course = getCourse(courseId);
  return {
    title: course ? `${course.code} ${course.name}` : "Course",
    alternates: {
      canonical: `/courses/${courseId}`
    }
  };
}

export default async function PublicCourseDetailPage({
  params
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  return (
    <PublicShell>
      <CourseDetailContent courseId={courseId} routePrefix="" />
    </PublicShell>
  );
}
