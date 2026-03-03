import { cn } from "@/lib/utils";
import { validatePassword } from "@/lib/auth/password";

export function PasswordStrength({ password }: { password: string }) {
  const result = validatePassword(password);

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-semibold uppercase tracking-[0.14em] text-white/60">Password strength</span>
        <span className={cn("font-mono", result.valid ? "text-success" : "text-white/70")}>{result.score}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            result.valid ? "bg-success" : result.score >= 60 ? "bg-warn" : "bg-danger"
          )}
          style={{ width: `${Math.max(8, result.score)}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-white/65">{result.message ?? "Strong password."}</p>
    </div>
  );
}
