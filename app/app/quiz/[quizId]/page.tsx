import { redirect } from "next/navigation";

export const runtime = "edge";

export default async function QuizPage({
  params
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = await params;
  redirect(`/quiz/${quizId}`);
}
