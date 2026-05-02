import { ProfessorExamResultsPage } from "@/features/exams/pages/professor-exam-results";

export const runtime = "edge";

export default async function ProfessorExamResultsRoutePage({
  params
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;
  return <ProfessorExamResultsPage examId={examId} />;
}
