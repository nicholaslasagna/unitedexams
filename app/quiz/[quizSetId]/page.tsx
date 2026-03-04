"use client";

import { useParams } from "next/navigation";
import { PublicShell } from "@/components/layout/public-shell";
import { QuizExperiencePageContent } from "@/features/study/quiz-experience-page";

export default function PublicQuizPage() {
  const params = useParams<{ quizSetId: string }>();

  return (
    <PublicShell>
      <QuizExperiencePageContent quizId={params.quizSetId} routePrefix="" />
    </PublicShell>
  );
}
