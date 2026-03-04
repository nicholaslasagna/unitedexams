import { ProfessorSectionPage } from "@/features/professor/pages/section";

export default async function SectionDetailPage({
  params
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = await params;
  return <ProfessorSectionPage sectionId={sectionId} />;
}
