import type { ReactNode } from "react";
import { Building2, BookOpen, KeyRound, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "free" | "premium" | "institution" | "locked";

const variantStyles: Record<Variant, string> = {
  free:
    "border-borderc bg-soft text-text-secondary",
  premium:
    "border-accent/35 bg-accent/12 text-accent",
  institution:
    "border-success/30 bg-success/12 text-success",
  locked:
    "border-warn/35 bg-warn/10 text-warn"
};

const variantIcon: Record<Variant, ReactNode> = {
  free: <BookOpen className="h-3 w-3" />,
  premium: <KeyRound className="h-3 w-3" />,
  institution: <Building2 className="h-3 w-3" />,
  locked: <Lock className="h-3 w-3" />
};

const variantLabel: Record<Variant, string> = {
  // Short labels — used as compact chips on cards. The longer
  // "Included with Premium" / "Included through your institution"
  // microcopy lives in <PremiumUnlockNote /> and <InstitutionAccessNote />.
  free: "Free",
  premium: "Premium",
  institution: "Institution",
  locked: "Available in full access"
};

export function AccessBadge({
  variant,
  label,
  className
}: {
  variant: Variant;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.16em]",
        variantStyles[variant],
        className
      )}
    >
      {variantIcon[variant]}
      {label ?? variantLabel[variant]}
    </span>
  );
}
