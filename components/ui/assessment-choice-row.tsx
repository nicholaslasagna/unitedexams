import { AlertTriangle, Check, CheckCircle2, XCircle } from "lucide-react";
import { Markdown } from "@/components/ui/markdown";
import { cn } from "@/lib/utils";

export type AssessmentChoiceState = "default" | "selected" | "ok" | "bad" | "missed";

interface AssessmentChoiceRowProps {
  kind: "single" | "multi";
  marker: string;
  content: string;
  checked: boolean;
  state: AssessmentChoiceState;
  disabled?: boolean;
  role?: "radio" | "checkbox";
  onClick: () => void;
}

export function AssessmentChoiceRow({
  kind,
  marker,
  content,
  checked,
  state,
  disabled = false,
  role,
  onClick
}: AssessmentChoiceRowProps) {
  const isActive = state === "selected" || state === "ok" || state === "bad";
  const showMissed = state === "missed";

  return (
    <button
      type="button"
      role={role}
      aria-checked={checked}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "group flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-all duration-150 ease-out-expo",
        state === "selected" && "border-brand-2/55 bg-brand-2/8",
        state === "ok" && "border-success/45 bg-success/12",
        state === "bad" && "border-danger/45 bg-danger/12",
        state === "missed" && "border-warn/45 bg-warn/12",
        state === "default" && "border-borderc bg-soft/80 hover:border-brand-2/35 hover:bg-surface",
        disabled && "cursor-not-allowed opacity-90"
      )}
    >
      <span
        className={cn(
          "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center border transition",
          kind === "single" ? "rounded-full" : "rounded-[6px]",
          state === "selected" && "border-brand-2/55 bg-brand-2/12",
          state === "ok" && "border-success/55 bg-success/15",
          state === "bad" && "border-danger/55 bg-danger/15",
          state === "missed" && "border-warn/55 bg-warn/15",
          state === "default" && "border-borderc bg-surface/80"
        )}
        aria-hidden="true"
      >
        {kind === "single" ? (
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full transition",
              isActive && state === "selected" && "bg-brand-2",
              state === "ok" && "bg-success",
              state === "bad" && "bg-danger",
              !isActive && !showMissed && "bg-transparent"
            )}
          />
        ) : checked || state === "ok" || state === "bad" ? (
          <Check
            className={cn(
              "h-3.5 w-3.5",
              state === "selected" && "text-brand-2",
              state === "ok" && "text-success",
              state === "bad" && "text-danger"
            )}
          />
        ) : null}
      </span>

      <span
        className={cn(
          "inline-flex min-h-6 min-w-6 shrink-0 items-center justify-center rounded-md border px-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] transition",
          state === "selected" && "border-brand-2/45 bg-brand-2/10 text-brand-2",
          state === "ok" && "border-success/45 bg-success/10 text-success",
          state === "bad" && "border-danger/45 bg-danger/10 text-danger",
          state === "missed" && "border-warn/45 bg-warn/10 text-warn",
          state === "default" && "border-borderc bg-surface/70 text-muted"
        )}
      >
        {marker}
      </span>

      <span className="min-w-0 flex-1 pt-0.5 text-sm leading-relaxed text-text">
        <Markdown content={content} promoteMathInInlineCode />
      </span>

      {state === "ok" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> : null}
      {state === "bad" ? <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" /> : null}
      {state === "missed" ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warn" /> : null}
    </button>
  );
}
