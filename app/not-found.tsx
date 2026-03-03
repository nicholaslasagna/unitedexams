import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center px-6 text-center">
      <p className="text-xs uppercase tracking-[0.14em] text-muted">404</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-muted">The page you requested is unavailable. Return to your dashboard to keep studying.</p>
      <Button asChild className="mt-6">
        <Link href="/app/dashboard">Back to dashboard</Link>
      </Button>
    </main>
  );
}
