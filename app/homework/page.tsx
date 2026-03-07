import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { HomeworkIndexContent } from "@/features/study/homework-index-page";

export const metadata: Metadata = {
  title: "Homework Mode",
  alternates: {
    canonical: "/homework"
  }
};

export default function HomeworkIndexPage() {
  return (
    <PublicShell>
      <HomeworkIndexContent routePrefix="" />
    </PublicShell>
  );
}
