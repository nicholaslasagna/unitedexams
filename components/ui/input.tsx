import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-[10px] border border-white/[0.07] bg-white/[0.035] px-3.5 text-sm text-text placeholder:text-faint outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-accent/20",
        className
      )}
      {...props}
    />
  );
});
