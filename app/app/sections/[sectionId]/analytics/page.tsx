import { ProfessorSectionAnalyticsPage } from "@/features/professor/pages/section-analytics";


export default async function SectionAnalyticsRoutePage({
  params
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = await params;
  return <ProfessorSectionAnalyticsPage sectionId={sectionId} />;
}
