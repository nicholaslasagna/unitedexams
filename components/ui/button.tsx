import { cloneElement, forwardRef, isValidElement } from "react";
import type { ButtonHTMLAttributes, ReactElement } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
  asChild?: boolean;
};

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-accent-gradient text-white shadow-soft border border-white/[0.15] hover:shadow-glow hover:-translate-y-[1px] active:translate-y-0 active:shadow-subtle transition-all duration-150",
  secondary:
    "bg-white/[0.035] text-muted border border-white/[0.12] hover:text-text hover:bg-white/[0.065] hover:border-white/[0.18] active:bg-white/[0.035] transition-all duration-150",
  ghost:
    "bg-transparent text-muted border border-transparent hover:text-text hover:bg-white/[0.05] active:bg-white/[0.03] transition-all duration-150",
  danger:
    "bg-danger/90 text-white border border-danger/50 hover:bg-danger hover:-translate-y-[1px] hover:shadow-[0_8px_28px_hsl(351_90%_71%/0.3)] active:translate-y-0 transition-all duration-150"
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "primary", loading = false, disabled, children, asChild = false, ...props },
  ref
) {
  const classes = cn(
    "inline-flex h-11 items-center justify-center gap-2 rounded-[10px] px-5 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/65 disabled:cursor-not-allowed disabled:opacity-60",
    variantStyles[variant],
    className
  );

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string }>;
    return cloneElement(child, {
      className: cn(classes, child.props.className)
    });
  }

  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden /> : null}
      {children}
    </button>
  );
});
