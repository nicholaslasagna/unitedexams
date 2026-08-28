import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center px-6 text-center">
      <p className="text-xs uppercase tracking-[0.14em] text-muted">404</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Page not found</h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
        This link doesn&apos;t point anywhere. It may have moved, or the address
        may have a typo in it.
      </p>
      {/*
        These two destinations work whether or not someone is signed in. The
        page used to offer only "Back to dashboard", which sends a signed-out
        visitor to a route they cannot open - straight into a login redirect
        from an error page, which is a poor place to land.
      */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Button asChild>
          <Link href="/courses">Browse courses</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/">Go to homepage</Link>
        </Button>
      </div>
    </main>
  );
}
