import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { QuizExperiencePageContent } from "@/features/study/quiz-experience-page";
import { getQuizSet } from "@/data/seed";

export async function generateMetadata({
  params
}: {
  params: Promise<{ quizSetId: string }>;
}): Promise<Metadata> {
  const { quizSetId } = await params;
  const quiz = getQuizSet(quizSetId);
  return {
    title: quiz ? `${quiz.title}` : "Quiz",
    alternates: {
      canonical: `/quiz/${quizSetId}`
    }
  };
}

export default async function PublicQuizPage({
  params
}: {
  params: Promise<{ quizSetId: string }>;
}) {
  const { quizSetId } = await params;

  return (
    <PublicShell>
      <QuizExperiencePageContent quizId={quizSetId} routePrefix="" />
    </PublicShell>
  );
}
