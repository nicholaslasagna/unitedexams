import { InterviewRunnerContent } from "@/features/interviews/interview-runner-page";

export default async function InterviewPage({
  params
}: {
  params: Promise<{ interviewId: string }>;
}) {
  const { interviewId } = await params;
  return <InterviewRunnerContent interviewId={interviewId} />;
}
