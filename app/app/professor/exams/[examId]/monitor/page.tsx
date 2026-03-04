import { ProfessorExamMonitorPage } from "@/features/exams/pages/professor-exam-monitor";

export default async function ProfessorExamMonitorRoutePage({
  params
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;
  return <ProfessorExamMonitorPage examId={examId} />;
}
