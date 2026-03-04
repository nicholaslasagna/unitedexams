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
  primary: cn(
    "bg-brand-gradient text-accent-fg font-semibold",
    "shadow-[0_1px_2px_hsl(var(--accent)/0.2)]",
    "hover:shadow-glow hover:-translate-y-px hover:brightness-[1.06]",
    "active:translate-y-0 active:shadow-subtle active:brightness-[0.98]",
    "focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    "disabled:shadow-none"
  ),
  secondary: cn(
    "bg-soft text-text border border-borderc",
    "hover:bg-overlay hover:border-border-bright",
    "active:scale-[0.98]",
    "focus-visible:ring-2 focus-visible:ring-accent/50"
  ),
  ghost: cn(
    "bg-transparent text-muted",
    "hover:bg-soft hover:text-text",
    "active:bg-overlay",
    "focus-visible:ring-2 focus-visible:ring-accent/50"
  ),
  danger: cn(
    "bg-danger text-white font-semibold",
    "hover:brightness-[1.08] hover:-translate-y-px hover:shadow-[0_4px_16px_hsl(var(--danger)/0.3)]",
    "active:translate-y-0 active:brightness-[0.95]",
    "focus-visible:ring-2 focus-visible:ring-danger/50"
  )
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
    "inline-flex items-center justify-center font-semibold outline-none transition-all duration-150 ease-out-expo",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none",
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
      {loading ? (
        <span
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current"
          aria-hidden
        />
      ) : null}
      {children}
    </button>
  );
});
