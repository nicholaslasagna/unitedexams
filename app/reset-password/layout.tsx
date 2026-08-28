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
  title: "Choose a new password",
  description:
    "Set a new password for your United Exams account."
};

export default function ResetPasswordLayout({
  children
}: {
  children: ReactNode;
}) {
  return children;
}
