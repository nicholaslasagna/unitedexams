"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  FileCode2,
  Play,
  RotateCcw,
  Terminal,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CursorPosition } from "@/components/ide/code-editor";
import type { InterviewQuestion } from "@/data/seed/interviews";
import type { RunResult } from "@/lib/interviews/run-code";
import { cn } from "@/lib/utils";

/*
 * The editor is loaded on demand. CodeMirror is only needed once someone
 * reaches a coding round, and interview briefs, behavioural rounds and the
 * report screen have no use for it.
 */
const CodeEditor = dynamic(
  () => import("@/components/ide/code-editor").then((m) => m.CodeEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-[12px] text-text-secondary">
        Loading editor…
      </div>
    )
  }
);

type PanelTab = "tests" | "console";

/** ⌘ on Apple platforms, Ctrl elsewhere — shown in the Run button's hint. */
function useModifierLabel() {
  return useMemo(() => {
    if (typeof navigator === "undefined") return "Ctrl";
    return /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent) ? "⌘" : "Ctrl";
  }, []);
}

/**
 * The coding round's workspace, built as a small IDE rather than a text box.
 *
 * A technical interview is not conducted in a comment field, so simulating
 * one in a bare <textarea> — no line numbers, no highlighting, Tab jumping
 * focus out of the code — was undercutting the exercise. This is the frame
 * around the editor: a file tab, a toolbar, a results/console panel and a
 * status bar, in the arrangement anyone who has used an editor already
 * knows how to read.
 */
export function CodingWorkspace({
  workspace,
  value,
  onChange,
  run,
  running,
  onRun
}: {
  workspace: NonNullable<InterviewQuestion["coding"]>;
  value: string;
  onChange: (next: string) => void;
  run?: RunResult;
  running: boolean;
  onRun: () => void;
}) {
  const [panel, setPanel] = useState<PanelTab>("tests");
  const [panelOpen, setPanelOpen] = useState(true);
  const [cursor, setCursor] = useState<CursorPosition>({ line: 1, column: 1, selectionLength: 0 });
  const modifier = useModifierLabel();

  const logs = run?.logs ?? [];
  const allPassing = run && !run.error && run.total > 0 && run.passed === run.total;
  const fileName = `${workspace.functionName}.js`;

  const resetToStarter = () => {
    if (value === workspace.starterCode) return;
    onChange(workspace.starterCode);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-borderc bg-[hsl(var(--bg-inset))]">
      {/* ── Tab bar ─────────────────────────────────────────── */}
      <div className="flex items-stretch justify-between gap-2 border-b border-borderc bg-surface/60">
        <div className="flex min-w-0 items-stretch">
          <span className="inline-flex items-center gap-2 border-r border-borderc bg-[hsl(var(--bg-inset))] px-3.5 py-2 text-[12.5px] font-medium text-text">
            <FileCode2 className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
            <span className="truncate">{fileName}</span>
          </span>
        </div>
        <span className="shrink-0 self-center px-3 font-mono text-[10.5px] uppercase tracking-[0.18em] text-text-secondary">
          JavaScript
        </span>
      </div>

      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-borderc px-3 py-2">
        <p className="text-[12px] text-text-secondary">
          Keep the function named{" "}
          <code className="font-mono text-accent">{workspace.functionName}()</code> — the tests call
          it by that name.
        </p>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={resetToStarter} disabled={value === workspace.starterCode}>
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
          <Button size="sm" onClick={onRun} loading={running} loadingLabel="Running…">
            <Play className="h-3.5 w-3.5" />
            Run tests
            <kbd className="ml-1 hidden rounded border border-accent-fg/25 px-1 font-mono text-[10px] opacity-70 sm:inline">
              {modifier}↵
            </kbd>
          </Button>
        </div>
      </div>

      {/* ── Editor ──────────────────────────────────────────── */}
      <div className="h-[420px] border-b border-borderc">
        <CodeEditor
          value={value}
          onChange={onChange}
          onRun={onRun}
          onCursorChange={setCursor}
          ariaLabel={`Your ${workspace.language} solution for ${workspace.functionName}`}
        />
      </div>

      {/* ── Output panel ────────────────────────────────────── */}
      <div className="border-b border-borderc bg-surface/40">
        <div className="flex items-center justify-between gap-2 px-2">
          <div className="flex items-center" role="tablist" aria-label="Run output">
            {(["tests", "console"] as const).map((id) => {
              const active = panel === id && panelOpen;
              const count = id === "tests" ? run?.results.length ?? 0 : logs.length;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setPanel(id);
                    setPanelOpen(true);
                  }}
                  className={cn(
                    "relative px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors",
                    active ? "text-text" : "text-text-secondary hover:text-text"
                  )}
                >
                  {id === "tests" ? "Tests" : "Console"}
                  {count > 0 ? (
                    <span className="ml-1.5 font-mono text-[10px] text-text-secondary">{count}</span>
                  ) : null}
                  {active ? (
                    <span className="absolute inset-x-2 bottom-0 h-px bg-accent" aria-hidden />
                  ) : null}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setPanelOpen((open) => !open)}
            aria-label={panelOpen ? "Collapse output panel" : "Expand output panel"}
            className="rounded-md p-1.5 text-text-secondary transition-colors hover:text-text"
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform", !panelOpen && "-rotate-90")} />
          </button>
        </div>

        {panelOpen ? (
          <div className="max-h-[260px] overflow-y-auto border-t border-borderc/70">
            {panel === "tests" ? (
              <TestResults run={run} running={running} testCount={workspace.tests.length} />
            ) : (
              <ConsoleOutput logs={logs} hasRun={Boolean(run)} />
            )}
          </div>
        ) : null}
      </div>

      {/* ── Status bar ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-3 py-1.5 font-mono text-[10.5px] text-text-secondary">
        <span className="flex items-center gap-3">
          <span>
            Ln {cursor.line}, Col {cursor.column}
            {cursor.selectionLength > 0 ? ` (${cursor.selectionLength} selected)` : ""}
          </span>
          <span className="hidden sm:inline">Spaces: 2</span>
        </span>
        <span className="flex items-center gap-3">
          {run?.durationMs !== undefined ? <span>{run.durationMs} ms</span> : null}
          {run && !run.error ? (
            <span className={allPassing ? "text-success" : "text-warn"}>
              {run.passed}/{run.total} passing
            </span>
          ) : (
            <span>{workspace.tests.length} tests</span>
          )}
        </span>
      </div>
    </div>
  );
}

function TestResults({
  run,
  running,
  testCount
}: {
  run?: RunResult;
  running: boolean;
  testCount: number;
}) {
  if (running) {
    return <p className="px-3 py-4 font-mono text-[12px] text-text-secondary">Running {testCount} tests…</p>;
  }

  if (!run) {
    return (
      <p className="px-3 py-4 font-mono text-[12px] text-text-secondary">
        {testCount} tests ready. Run them whenever you want — an interviewer expects you to check
        your own work before saying you&apos;re done.
      </p>
    );
  }

  if (run.error) {
    return (
      <p className="px-3 py-4 font-mono text-[12px] leading-relaxed text-danger">{run.error}</p>
    );
  }

  return (
    <ul className="divide-y divide-borderc/60">
      {run.results.map((result) => (
        <li key={result.name} className="flex items-start gap-2.5 px-3 py-2.5">
          {result.passed ? (
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" aria-hidden />
          ) : (
            <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger" aria-hidden />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] text-text">{result.name}</p>
            {!result.passed ? (
              <div className="mt-1 space-y-0.5 font-mono text-[11.5px]">
                {result.error ? (
                  <p className="break-words text-danger">threw: {result.error}</p>
                ) : (
                  <>
                    <p className="break-words text-danger">got &nbsp;&nbsp;&nbsp;{result.actual}</p>
                    <p className="break-words text-success">expected {result.expected}</p>
                  </>
                )}
              </div>
            ) : null}
          </div>
          {result.durationMs !== undefined ? (
            <span className="shrink-0 font-mono text-[10.5px] text-faint">{result.durationMs}ms</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function ConsoleOutput({
  logs,
  hasRun
}: {
  logs: RunResult["logs"];
  hasRun: boolean;
}) {
  if (logs.length === 0) {
    return (
      <p className="flex items-center gap-2 px-3 py-4 font-mono text-[12px] text-text-secondary">
        <Terminal className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {hasRun
          ? "Nothing printed. console.log() from your code shows up here."
          : "Run your code and anything it prints appears here."}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-borderc/40 font-mono text-[11.5px]">
      {logs.map((line, index) => (
        <li
          key={`${index}-${line.text.slice(0, 24)}`}
          className={cn(
            "flex items-start gap-2 px-3 py-1.5",
            line.level === "error" && "text-danger",
            line.level === "warn" && "text-warn",
            line.level === "log" && "text-text-secondary"
          )}
        >
          {line.test ? (
            <span className="shrink-0 text-faint" title={`printed during: ${line.test}`}>
              [{line.test.length > 22 ? `${line.test.slice(0, 21)}…` : line.test}]
            </span>
          ) : null}
          <span className="min-w-0 break-words whitespace-pre-wrap">{line.text}</span>
        </li>
      ))}
    </ul>
  );
}
