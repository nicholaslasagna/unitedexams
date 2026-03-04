import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  success?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, success, helperText, ...props },
  ref
) {
  const autoId = useId();
  const helperId = helperText || error || success ? `${autoId}-helper` : undefined;

  return (
    <div className="w-full">
      <input
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={helperId}
        className={cn(
          "h-11 w-full rounded-xl border bg-soft px-3.5 text-sm text-text placeholder:text-faint",
          "outline-none transition-all duration-150 ease-out-expo",
          "focus:bg-surface focus:ring-2",
          error
            ? "border-danger/60 focus:border-danger/70 focus:ring-danger/15"
            : success
              ? "border-success/50 focus:border-success/60 focus:ring-success/15"
              : "border-borderc focus:border-accent/50 focus:ring-accent/20",
          className
        )}
        {...props}
      />
      {helperId ? (
        <p
          id={helperId}
          className={cn(
            "mt-1.5 text-xs",
            error ? "text-danger" : success ? "text-success" : "text-muted"
          )}
        >
          {error || success || helperText}
        </p>
      ) : null}
    </div>
  );
});
