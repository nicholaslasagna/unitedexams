import { ProfessorSectionMaterialsPage } from "@/features/professor/pages/section-materials";

export const runtime = "edge";

export default async function SectionMaterialsRoutePage({
  params
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = await params;
  return <ProfessorSectionMaterialsPage sectionId={sectionId} />;
}
