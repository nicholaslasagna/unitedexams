/**
 * Runs a candidate's JavaScript against interview test cases.
 *
 * Executed in a Web Worker created from a Blob URL: the worker has no DOM,
 * no cookies, and gets terminated on timeout so an infinite loop can't hang
 * the tab. This is the candidate's own code in their own browser — same
 * trust model as any online judge.
 *
 * ponytail: JS only, structural equality via JSON. Add a language server /
 * Pyodide only if candidates actually ask to interview in another language.
 */

export interface CodeTest {
  name: string;
  args: unknown[];
  expected: unknown;
}

export interface CodeTestResult {
  name: string;
  passed: boolean;
  actual?: string;
  expected?: string;
  error?: string;
  /** Wall-clock milliseconds for this case, shown in the results panel. */
  durationMs?: number;
}

/** One console call made by the candidate's code, with the case it came from. */
export interface ConsoleLine {
  level: "log" | "warn" | "error";
  text: string;
  /** Test case during which it was emitted, or null for top-level code. */
  test: string | null;
}

export interface RunResult {
  results: CodeTestResult[];
  passed: number;
  total: number;
  error?: string;
  /** Everything the code printed — the editor's Console panel reads this. */
  logs: ConsoleLine[];
  /** Total wall-clock time for the run. */
  durationMs?: number;
}

const WORKER_SRC = `
function preview(value) {
  try { return JSON.stringify(value); } catch { return String(value); }
}
function equal(a, b) {
  return preview(a) === preview(b);
}

/*
 * console inside the worker is captured rather than dropped, so the editor
 * can show a real Console panel. Printing to debug is how people actually
 * work through a problem, and an editor that silently swallows it is not
 * one you can think in.
 */
var LOGS = [];
var CURRENT_TEST = null;
var LOG_LIMIT = 200;
function capture(level) {
  return function () {
    if (LOGS.length >= LOG_LIMIT) return;
    var parts = [];
    for (var i = 0; i < arguments.length; i++) {
      var a = arguments[i];
      parts.push(typeof a === "string" ? a : preview(a));
    }
    LOGS.push({ level: level, text: parts.join(" "), test: CURRENT_TEST });
    if (LOGS.length === LOG_LIMIT) {
      LOGS.push({ level: "warn", text: "… output truncated after " + LOG_LIMIT + " lines.", test: null });
    }
  };
}
self.console = { log: capture("log"), warn: capture("warn"), error: capture("error"), info: capture("log"), debug: capture("log") };

self.onmessage = function (event) {
  var code = event.data.code;
  var fnName = event.data.fnName;
  var tests = event.data.tests;
  var results = [];
  var fn;
  var startedAt = Date.now();
  try {
    fn = new Function(code + "\\nreturn typeof " + fnName + " === 'function' ? " + fnName + " : undefined;")();
  } catch (err) {
    self.postMessage({ error: "Your code didn't compile: " + (err && err.message ? err.message : String(err)), logs: LOGS });
    return;
  }
  if (typeof fn !== "function") {
    self.postMessage({ error: "Couldn't find a function named " + fnName + "(). Keep that name so the tests can call it.", logs: LOGS });
    return;
  }
  for (var i = 0; i < tests.length; i++) {
    var test = tests[i];
    CURRENT_TEST = test.name;
    var caseStart = Date.now();
    try {
      var actual = fn.apply(null, JSON.parse(JSON.stringify(test.args)));
      results.push({
        name: test.name,
        passed: equal(actual, test.expected),
        actual: preview(actual),
        expected: preview(test.expected),
        durationMs: Date.now() - caseStart
      });
    } catch (err) {
      results.push({
        name: test.name,
        passed: false,
        error: err && err.message ? err.message : String(err),
        expected: preview(test.expected),
        durationMs: Date.now() - caseStart
      });
    }
  }
  CURRENT_TEST = null;
  self.postMessage({ results: results, logs: LOGS, durationMs: Date.now() - startedAt });
};
`;


export function runCode(
  code: string,
  fnName: string,
  tests: CodeTest[],
  timeoutMs = 3000
): Promise<RunResult> {
  return new Promise((resolve) => {
    let url: string | null = null;
    let worker: Worker | null = null;

    const cleanup = () => {
      worker?.terminate();
      if (url) URL.revokeObjectURL(url);
    };

    const fail = (error: string, logs: ConsoleLine[] = []): void =>
      resolve({ results: [], passed: 0, total: tests.length, error, logs });

    try {
      url = URL.createObjectURL(new Blob([WORKER_SRC], { type: "application/javascript" }));
      worker = new Worker(url);
    } catch {
      cleanup();
      fail("Couldn't start the code runner in this browser.");
      return;
    }

    const timer = window.setTimeout(() => {
      cleanup();
      fail(`Timed out after ${timeoutMs / 1000}s — check for an infinite loop.`);
    }, timeoutMs);

    worker.onmessage = (event: MessageEvent) => {
      window.clearTimeout(timer);
      cleanup();
      const data = event.data as {
        results?: CodeTestResult[];
        error?: string;
        logs?: ConsoleLine[];
        durationMs?: number;
      };
      const logs = data.logs ?? [];
      if (data.error) {
        fail(data.error, logs);
        return;
      }
      const results = data.results ?? [];
      resolve({
        results,
        passed: results.filter((r) => r.passed).length,
        total: results.length,
        logs,
        durationMs: data.durationMs
      });
    };

    worker.onerror = () => {
      window.clearTimeout(timer);
      cleanup();
      fail("Your code threw before any test ran.");
    };

    worker.postMessage({ code, fnName, tests });
  });
}
