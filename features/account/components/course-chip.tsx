import { cn } from "@/lib/utils";

export function CourseChip({
  label,
  selected,
  onClick
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm transition-all duration-200 ease-out-expo",
        selected
          ? "border-brand-2/55 bg-brand-2/10 text-text"
          : "border-borderc bg-soft text-muted hover:text-text hover:shadow-card-hover hover:border-border-accent"
      )}
    >
      {label}
    </button>
  );
}
