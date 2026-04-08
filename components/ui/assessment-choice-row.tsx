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
        "group flex w-full items-start gap-3 rounded-md border px-3 py-3 text-left transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-2/55 focus-visible:ring-offset-0",
        state === "selected" && "border-brand-2/45 bg-brand-2/6",
        state === "ok" && "border-success/40 bg-success/10",
        state === "bad" && "border-danger/40 bg-danger/10",
        state === "missed" && "border-warn/40 bg-warn/10",
        state === "default" && "border-borderc bg-surface/45 hover:border-brand-2/25 hover:bg-surface/80",
        disabled ? "cursor-not-allowed opacity-90" : "cursor-pointer"
      )}
    >
      <span
        className={cn(
          "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center border-2 transition",
          kind === "single" ? "rounded-full" : "rounded-[4px]",
          state === "selected" && "border-brand-2/60 bg-brand-2/10",
          state === "ok" && "border-success/60 bg-success/12",
          state === "bad" && "border-danger/60 bg-danger/12",
          state === "missed" && "border-warn/60 bg-warn/12",
          state === "default" && "border-borderc bg-background/80"
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
          "inline-flex min-w-5 shrink-0 items-center justify-center pt-0.5 font-mono text-xs font-semibold uppercase tracking-[0.12em] transition",
          state === "selected" && "text-brand-2",
          state === "ok" && "text-success",
          state === "bad" && "text-danger",
          state === "missed" && "text-warn",
          state === "default" && "text-muted"
        )}
      >
        {marker}.
      </span>

      <span className="min-w-0 flex-1 pt-0.5 text-sm leading-6 text-text">
        <Markdown content={content} promoteMathInInlineCode />
      </span>

      {state === "ok" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> : null}
      {state === "bad" ? <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" /> : null}
      {state === "missed" ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warn" /> : null}
    </button>
  );
}
