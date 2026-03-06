import { HomeworkExperiencePageContent } from "@/features/study/homework-experience-page";

export default async function AppHomeworkSetRedirect({
  params
}: {
  params: Promise<{ setId: string }>;
}) {
  const { setId } = await params;
  return <HomeworkExperiencePageContent setId={setId} routePrefix="/app" />;
}
