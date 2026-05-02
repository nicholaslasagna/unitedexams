import { StudentExamAttemptPage } from "@/features/exams/pages/student-exam-attempt";

export const runtime = "edge";

export default async function AppExamAttemptRoutePage({
  params
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;
  return <StudentExamAttemptPage examId={examId} />;
}
