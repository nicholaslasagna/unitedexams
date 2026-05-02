import { redirect } from "next/navigation";


export default async function ProfessorSectionAnalyticsAliasPage({
  params
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = await params;
  redirect(`/app/sections/${sectionId}/analytics`);
}
