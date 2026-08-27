import type { Metadata } from "next";
import { InterviewsIndexContent } from "@/features/interviews/interviews-index-page";

export const metadata: Metadata = { title: "Interview practice" };

export default function InterviewsPage() {
  return <InterviewsIndexContent />;
}
