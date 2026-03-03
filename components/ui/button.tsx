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
    "bg-brand-gradient text-white shadow-soft hover:shadow-glass active:scale-[0.99] border border-white/10",
  secondary:
    "bg-soft text-text border border-borderc hover:border-white/30 hover:bg-white/5 active:scale-[0.99]",
  ghost:
    "bg-transparent text-text border border-transparent hover:border-borderc hover:bg-soft active:scale-[0.99]",
  danger:
    "bg-danger/90 text-white border border-danger/80 hover:bg-danger active:scale-[0.99]"
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "primary", loading = false, disabled, children, asChild = false, ...props },
  ref
) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-2/70 disabled:cursor-not-allowed disabled:opacity-60",
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
