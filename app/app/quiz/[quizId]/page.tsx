"use client";

import { useParams } from "next/navigation";
import { QuizExperiencePageContent } from "@/features/study/quiz-experience-page";

export default function QuizPage() {
  const params = useParams<{ quizId: string }>();
  return <QuizExperiencePageContent quizId={params.quizId} routePrefix="/app" />;
}
