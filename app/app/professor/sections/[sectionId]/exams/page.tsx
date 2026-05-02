import { ProfessorSectionExamsPage } from "@/features/exams/pages/professor-section-exams";


export default async function ProfessorSectionExamsRoutePage({
  params
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = await params;
  return <ProfessorSectionExamsPage sectionId={sectionId} />;
}
