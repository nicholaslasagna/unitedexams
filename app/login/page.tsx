import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/app/login/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to United Exams to pick up your saved progress, attempts and course sections."
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050510]" />}>
      <LoginForm />
    </Suspense>
  );
}
