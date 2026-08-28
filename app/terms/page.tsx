import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms covering your use of United Exams, including accounts, coursework content and billing."
};

const VERSION = "2026-03-04";

export default function TermsPage() {
  return (
    <PublicShell>
      <div className="mx-auto w-full max-w-4xl space-y-6 py-2">
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Version {VERSION}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Terms of Service</h1>
          <p className="mt-3 text-sm text-muted">
            United Exams is provided for educational study and class support workflows. By using the service you agree to these terms.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-borderc bg-soft p-5">
          <h2 className="font-display text-2xl font-semibold">Acceptable use</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
            <li>Use accurate account identity information.</li>
            <li>Do not upload abusive, hateful, or illegal content.</li>
            <li>Do not attempt unauthorized access to other user data or sections.</li>
          </ul>
        </section>

        <section className="space-y-3 rounded-2xl border border-borderc bg-soft p-5">
          <h2 className="font-display text-2xl font-semibold">Professor tools</h2>
          <p className="text-sm text-muted">
            Professors and TAs are responsible for the materials and assignments they publish to sections. Students retain access only according to section membership and platform policies.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-borderc bg-soft p-5">
          <h2 className="font-display text-2xl font-semibold">Support</h2>
          <p className="text-sm text-muted">
            For account or legal questions contact{" "}
            <a href="mailto:support@unitedexams.com" className="font-semibold text-accent hover:text-text">
              support@unitedexams.com
            </a>
            .
          </p>
        </section>
      </div>
    </PublicShell>
  );
}
