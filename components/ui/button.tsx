import { cloneElement, forwardRef, isValidElement } from "react";
import type { ButtonHTMLAttributes, ReactElement } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  asChild?: boolean;
};

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-accent-gradient text-accent-fg shadow-soft border border-accent-dim/30 hover:shadow-glow hover:-translate-y-[1px] active:translate-y-0 active:shadow-subtle transition-all duration-150",
  secondary:
    "bg-soft text-muted border border-borderc hover:text-text hover:bg-overlay hover:border-border-bright active:bg-soft transition-all duration-150",
  ghost:
    "bg-transparent text-muted border border-transparent hover:text-text hover:bg-soft active:bg-overlay transition-all duration-150",
  danger:
    "bg-danger/90 text-white border border-danger/50 hover:bg-danger hover:-translate-y-[1px] hover:shadow-[0_8px_28px_hsl(351_90%_71%/0.3)] active:translate-y-0 transition-all duration-150"
};

const sizeStyles: Record<Size, string> = {
  sm: "h-9 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-11 px-5 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-base gap-2 rounded-xl",
  icon: "h-10 w-10 p-0 rounded-xl justify-center"
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "primary", size = "md", loading = false, disabled, children, asChild = false, ...props },
  ref
) {
  const classes = cn(
    "inline-flex items-center justify-center font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/65 disabled:cursor-not-allowed disabled:opacity-60",
    sizeStyles[size],
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
      {loading ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current/40 border-t-current" aria-hidden /> : null}
      {children}
    </button>
  );
});
