"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/app-data-context";

type Variant = "hero" | "closing";

export function PublicAuthActions({ variant }: { variant: Variant }) {
  const { authReady, isAuthenticated } = useAppData();

  if (variant === "hero") {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {!authReady ? (
          <>
            <Button asChild size="lg" className="justify-between px-6">
              <Link href="/courses">
                Explore study materials
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" disabled>
              Checking session...
            </Button>
          </>
        ) : isAuthenticated ? (
          <>
            <Button asChild size="lg" className="justify-between px-6">
              <Link href="/app/dashboard">
                Open dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/app/courses">Open course catalog</Link>
            </Button>
          </>
        ) : (
          <>
            <Button asChild size="lg" className="justify-between px-6">
              <Link href="/signup">
                Create account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/courses">Explore study materials</Link>
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Button asChild size="lg" className="w-full justify-between">
        <Link href={isAuthenticated ? "/app/courses" : "/courses"}>
          {isAuthenticated ? "Open courses" : "Browse courses"}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
      {!authReady ? (
        <Button size="lg" variant="secondary" className="w-full" disabled>
          Checking session...
        </Button>
      ) : isAuthenticated ? (
        <Button asChild size="lg" variant="secondary" className="w-full">
          <Link href="/app/dashboard">Open dashboard</Link>
        </Button>
      ) : (
        <Button asChild size="lg" variant="secondary" className="w-full">
          <Link href="/signup">Create account</Link>
        </Button>
      )}
    </div>
  );
}
