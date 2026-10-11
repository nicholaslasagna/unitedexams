import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/layout/public-shell";
import { ExamTwoPage } from "@/features/db-exam2/exam-2-page";

export const metadata: Metadata = {
  title: "Exam 2 Preparation | Concepts of Database Systems",
  description:
    "MySQL practice from the course lectures, class activity and homework, with untimed review and 70-minute written mocks.",
  alternates: { canonical: "/courses/database-systems/exam-2" }
};

export default async function PublicExamTwoRoute({
  params
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  if (courseId !== "database-systems") notFound();

  return (
    <PublicShell>
      <ExamTwoPage routePrefix="" />
    </PublicShell>
  );
}
