import { ProfessorSectionGradebookPage } from "@/features/professor/pages/section-gradebook";

export default async function SectionGradebookRoutePage({
  params
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = await params;
  return <ProfessorSectionGradebookPage sectionId={sectionId} />;
}
