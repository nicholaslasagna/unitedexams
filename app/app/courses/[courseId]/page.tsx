import { CourseDetailContent } from "@/features/study/course-detail-page";

export default async function CourseDetailPage({
  params
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <CourseDetailContent courseId={courseId} routePrefix="/app" />;
}
