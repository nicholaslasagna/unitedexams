"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary.
 *
 * Without this file a thrown render error falls through to Next's built-in
 * screen, which in production is an unbranded "Application error: a
 * client-side exception has occurred" with no way back. Anyone who hit it
 * was simply stuck.
 *
 * Deliberately plain: no stack trace, no error text in the UI. A digest is
 * shown only because it is the string someone can quote to support, and the
 * real error still goes to the console for anyone debugging locally.
 */
export default function RouteError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[route error]", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center px-6 text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">
        Something broke
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-text sm:text-4xl">
        This page didn&apos;t load.
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-text-secondary">
        The problem is on our side, not yours. Nothing you had saved is
        affected — trying again usually clears it.
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button variant="secondary" asChild>
          <Link href="/">Go to homepage</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/contact">Tell us what happened</Link>
        </Button>
      </div>

      {error.digest ? (
        <p className="mt-6 font-mono text-[11px] text-text-secondary">
          Reference: {error.digest}
        </p>
      ) : null}
    </main>
  );
}
