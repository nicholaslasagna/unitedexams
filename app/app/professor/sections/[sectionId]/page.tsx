import { ProfessorSectionPage } from "@/features/professor/pages/section";


export default async function ProfessorSectionAliasRoutePage({
  params
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = await params;
  return <ProfessorSectionPage sectionId={sectionId} />;
}
