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
  title: "Contact",
  description:
    "Ask United Exams to support a class, plan a section as an instructor, or talk through a department rollout."
};

export default function ContactLayout({
  children
}: {
  children: ReactNode;
}) {
  return children;
}
