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
  title: "Reset your password",
  description:
    "Send yourself a password reset link for your United Exams account."
};

export default function ForgotPasswordLayout({
  children
}: {
  children: ReactNode;
}) {
  return children;
}
