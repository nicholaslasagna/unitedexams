import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { HomeworkExperiencePageContent } from "@/features/study/homework-experience-page";
import { getQuizSet } from "@/data/seed";

export const runtime = "edge";

export async function generateMetadata({
  params
}: {
  params: Promise<{ setId: string }>;
}): Promise<Metadata> {
  const { setId } = await params;
  const set = getQuizSet(setId);
  return {
    title: set ? `${set.title}` : "Homework",
    alternates: {
      canonical: `/homework/${setId}`
    }
  };
}

export default async function HomeworkSetPage({
  params
}: {
  params: Promise<{ setId: string }>;
}) {
  const { setId } = await params;

  return (
    <PublicShell>
      <HomeworkExperiencePageContent setId={setId} routePrefix="" />
    </PublicShell>
  );
}
