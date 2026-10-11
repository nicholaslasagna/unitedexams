import { notFound } from "next/navigation";
import { ExamTwoPage } from "@/features/db-exam2/exam-2-page";

export default async function AppExamTwoRoute({
  params
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  if (courseId !== "database-systems") notFound();

  return <ExamTwoPage routePrefix="/app" />;
}
