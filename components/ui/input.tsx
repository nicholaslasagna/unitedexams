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
        "h-11 w-full rounded-xl border border-borderc/80 bg-soft/85 px-3.5 text-sm text-text placeholder:text-muted outline-none transition focus:border-brand-2 focus:ring-2 focus:ring-brand-2/35",
        className
      )}
      {...props}
    />
  );
});
