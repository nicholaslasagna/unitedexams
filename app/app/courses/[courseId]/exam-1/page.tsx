import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ExamOnePage } from "@/features/db-exam1/exam-1-page";
import { DB_EXAM1_COURSE_ID } from "@/features/db-exam1/mastery";
import { AlgorithmsExamPrepPage } from "@/features/alg-exam1/exam-prep-page";

export default async function AppExamOneRoute({
  params
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  if (courseId === "analysis-of-algorithms") {
    return <AlgorithmsExamPrepPage routePrefix="/app" />;
  }
  // The Exam 1 experience is built on CS 4354's own material, so it only
  // exists for that course rather than rendering an empty shell elsewhere.
  if (courseId !== DB_EXAM1_COURSE_ID) notFound();

  return (
    <Suspense fallback={null}>
      <ExamOnePage routePrefix="/app" />
    </Suspense>
  );
}
