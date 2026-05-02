import { Building2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Small, warm note shown when the user's school covers their access.
 * Use anywhere a premium prompt would normally appear — this replaces
 * the prompt for institution-covered users.
 *
 * The component is purely visual; the gating decision happens upstream
 * in `lib/access.ts` via `resolveAccess(...)`.
 */
export function InstitutionAccessNote({
  variant = "inline",
  className,
  schoolName
}: {
  variant?: "inline" | "block";
  className?: string;
  /** Optional — if you know the school name, surface it. */
  schoolName?: string | null;
}) {
  if (variant === "inline") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-success",
          className
        )}
      >
        <ShieldCheck className="h-3 w-3" />
        Included through your {schoolName ? schoolName : "institution"}
      </span>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-[1.1rem] border border-success/30 bg-success/10 px-4 py-3 text-[13px] text-text",
        className
      )}
    >
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-success/30 bg-success/15 text-success">
        <Building2 className="h-4 w-4" />
      </span>
      <div>
        <p className="font-semibold text-text">
          Included through your {schoolName ? schoolName : "institution"}
        </p>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-text-secondary">
          Your school covers full access. No upgrade prompts, no popups —
          just the platform.
        </p>
      </div>
    </div>
  );
}
