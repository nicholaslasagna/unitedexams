import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * Metadata holder for the "use client" page in this folder.
 *
 * Client components cannot export `metadata`, so without this wrapper the
 * page inherited the root title and every browser tab, bookmark and search
 * result read simply "United Exams".
 */
export const metadata: Metadata = {
  title: "Create your account",
  description:
    "Create a free United Exams account to save your attempts, track per-topic progress and join your class sections."
};

export default function SignupLayout({
  children
}: {
  children: ReactNode;
}) {
  return children;
}
