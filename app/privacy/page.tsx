import { PublicShell } from "@/components/layout/public-shell";

const VERSION = "2026-03-04";

export default function PrivacyPage() {
  return (
    <PublicShell>
      <div className="mx-auto w-full max-w-4xl space-y-6 py-2">
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Version {VERSION}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Privacy Policy</h1>
          <p className="mt-3 text-sm text-muted">
            United Exams stores account, study progress, and support metadata so you can use personalization, professor sections, and progress tracking.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-borderc bg-soft p-5">
          <h2 className="font-display text-2xl font-semibold">What we collect</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
            <li>Account profile (email, display name, optional real name and university).</li>
            <li>Quiz/homework attempts and progress tracking.</li>
            <li>Security and abuse signals (hashed IP, user agent snippets, auth challenge data).</li>
            <li>Support messages you submit inside the app.</li>
          </ul>
        </section>

        <section className="space-y-3 rounded-2xl border border-borderc bg-soft p-5">
          <h2 className="font-display text-2xl font-semibold">How we use data</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
            <li>Provide account login, saved progress, and personalized recommendations.</li>
            <li>Operate professor sections, assignments, and grading workflows.</li>
            <li>Protect accounts from abuse and suspicious sign-ins.</li>
            <li>Respond to support requests sent through the contact flow.</li>
          </ul>
        </section>

        <section className="space-y-3 rounded-2xl border border-borderc bg-soft p-5">
          <h2 className="font-display text-2xl font-semibold">Contact</h2>
          <p className="text-sm text-muted">
            Questions about privacy:{" "}
            <a href="mailto:support@unitedexams.com" className="font-semibold text-accent hover:text-text">
              support@unitedexams.com
            </a>
          </p>
        </section>
      </div>
    </PublicShell>
  );
}
