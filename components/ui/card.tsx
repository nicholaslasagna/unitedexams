import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Card — the elevated paper surface used everywhere across the app.
 *
 * Visual contract (matches the auth card so the entire site feels of
 * a piece):
 *   - 1rem corner radius (rounded-2xl)
 *   - hairline border using the standard --border token
 *   - "raised" surface fill on dark theme so the card visibly floats
 *     above the page-aurora backdrop; clean white on light theme
 *   - layered drop shadow + inner highlight for depth without looking
 *     "glassy"
 *
 * `interactive` adds a hover lift + accent-border treatment for cards
 * that are clickable links to deeper pages.
 */
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export function Card({ className, interactive, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-borderc bg-surface dark:bg-surface-raised",
        // Elevated paper shadow — soft outer drop + faint inner edge
        "shadow-[0_1px_0_hsl(var(--surface-raised)/0.06)_inset,0_18px_44px_-24px_hsl(var(--text)/0.28),0_6px_16px_-10px_hsl(var(--text)/0.16)]",
        "dark:shadow-[0_1px_0_hsl(var(--text)/0.04)_inset,0_18px_44px_-22px_rgba(0,0,0,0.55),0_6px_16px_-10px_rgba(0,0,0,0.45)]",
        interactive && [
          "cursor-pointer",
          "transition-[box-shadow,border-color,transform] duration-[220ms] ease-out-expo",
          "hover:-translate-y-px hover:border-border-accent",
          "hover:shadow-[0_1px_0_hsl(var(--surface-raised)/0.08)_inset,0_24px_56px_-22px_hsl(var(--accent)/0.28),0_8px_18px_-10px_hsl(var(--text)/0.18)]"
        ],
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-b border-borderc px-5 py-4 sm:px-6", className)} {...props} />;
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-5 sm:px-6", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-t border-borderc px-5 py-4 sm:px-6", className)} {...props} />;
}
