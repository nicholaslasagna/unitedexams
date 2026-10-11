import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/layout/public-shell";
import { ExamOnePage } from "@/features/db-exam1/exam-1-page";
import { DB_EXAM1_COURSE_ID } from "@/features/db-exam1/mastery";
import { AlgorithmsExamPrepPage } from "@/features/alg-exam1/exam-prep-page";

export async function generateMetadata({
  params
}: {
  params: Promise<{ courseId: string }>;
}): Promise<Metadata> {
  const { courseId } = await params;
  if (courseId === "analysis-of-algorithms") {
    return {
      title: "Exam 1 Preparation | Analysis of Algorithms",
      description:
        "Study targets from Algorithms homework and class review, with worked proofs, sorting and hashing practice, dynamic programming and a written mock.",
      alternates: { canonical: "/courses/analysis-of-algorithms/exam-1" }
    };
  }
  return {
    title: "Exam 1 Mastery | Concepts of Database Systems",
    description:
      "Relational model, relational algebra, joins, semijoins and division — practice built from the course's own lectures and homework.",
    alternates: { canonical: `/courses/${DB_EXAM1_COURSE_ID}/exam-1` }
  };
}

export default async function PublicExamOneRoute({
  params
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  if (courseId === "analysis-of-algorithms") {
    return (
      <PublicShell>
        <AlgorithmsExamPrepPage routePrefix="" />
      </PublicShell>
    );
  }
  if (courseId !== DB_EXAM1_COURSE_ID) notFound();

  return (
    <PublicShell>
      <Suspense fallback={null}>
        <ExamOnePage routePrefix="" />
      </Suspense>
    </PublicShell>
  );
}
