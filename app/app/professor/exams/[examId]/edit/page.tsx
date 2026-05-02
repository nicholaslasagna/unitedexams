import { ProfessorExamEditPage } from "@/features/exams/pages/professor-exam-edit";

export const runtime = "edge";

export default async function ProfessorExamEditRoutePage({
  params
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;
  return <ProfessorExamEditPage examId={examId} />;
}
