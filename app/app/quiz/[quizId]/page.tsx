import { redirect } from "next/navigation";


export default async function QuizPage({
  params
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = await params;
  redirect(`/quiz/${quizId}`);
}
