import { ProfessorQuizBuilderPage } from "@/features/professor/pages/quiz-builder";

export default async function ProfessorSectionQuizBuilderRoutePage({
  params
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = await params;
  return <ProfessorQuizBuilderPage sectionId={sectionId} />;
}

