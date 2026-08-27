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
}

export interface RunResult {
  results: CodeTestResult[];
  passed: number;
  total: number;
  error?: string;
}

const WORKER_SRC = `
function preview(value) {
  try { return JSON.stringify(value); } catch { return String(value); }
}
function equal(a, b) {
  return preview(a) === preview(b);
}
self.onmessage = function (event) {
  var code = event.data.code;
  var fnName = event.data.fnName;
  var tests = event.data.tests;
  var results = [];
  var fn;
  try {
    fn = new Function(code + "\\nreturn typeof " + fnName + " === 'function' ? " + fnName + " : undefined;")();
  } catch (err) {
    self.postMessage({ error: "Your code didn't compile: " + (err && err.message ? err.message : String(err)) });
    return;
  }
  if (typeof fn !== "function") {
    self.postMessage({ error: "Couldn't find a function named " + fnName + "(). Keep that name so the tests can call it." });
    return;
  }
  for (var i = 0; i < tests.length; i++) {
    var test = tests[i];
    try {
      var actual = fn.apply(null, JSON.parse(JSON.stringify(test.args)));
      results.push({
        name: test.name,
        passed: equal(actual, test.expected),
        actual: preview(actual),
        expected: preview(test.expected)
      });
    } catch (err) {
      results.push({
        name: test.name,
        passed: false,
        error: err && err.message ? err.message : String(err),
        expected: preview(test.expected)
      });
    }
  }
  self.postMessage({ results: results });
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

    const fail = (error: string): void =>
      resolve({ results: [], passed: 0, total: tests.length, error });

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
      const data = event.data as { results?: CodeTestResult[]; error?: string };
      if (data.error) {
        fail(data.error);
        return;
      }
      const results = data.results ?? [];
      resolve({
        results,
        passed: results.filter((r) => r.passed).length,
        total: results.length
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
