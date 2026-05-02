import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  trailing,
  className
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  trailing?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div
        className={cn(
          "max-w-3xl space-y-3",
          align === "center" && "mx-auto text-center"
        )}
      >
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h2 className="font-display text-[1.85rem] font-semibold leading-[1.05] tracking-tight text-text sm:text-[2.35rem]">
          {title}
        </h2>
        {description ? (
          <p className="text-[15px] leading-relaxed text-text-secondary">
            {description}
          </p>
        ) : null}
      </div>
      {trailing ? <div className="flex shrink-0 items-end">{trailing}</div> : null}
    </div>
  );
}
