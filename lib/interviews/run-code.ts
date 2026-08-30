/**
 * Runs a candidate's JavaScript against interview test cases.
 *
 * ## Threat model
 *
 * The code is written by the person sitting at the keyboard, so this is not
 * primarily about protecting them from themselves. It is about the cases
 * where running attacker-authored JavaScript on this origin would be a real
 * problem:
 *
 *   - a shared or school machine, where code left in the editor runs for
 *     whoever sits down next while THEIR session is signed in;
 *   - a shared or pasted "solution" that quietly does something else;
 *   - anyone who notices that a page executes arbitrary JavaScript and goes
 *     looking for what that reaches.
 *
 * ## What the previous design allowed
 *
 * A Worker created from a blob URL inherits the *page's* origin. Measured on
 * the running app, code in the editor could:
 *
 *   - `fetch(origin + '/…', { credentials: 'include' })` — succeeded, 200,
 *     with the signed-in user's cookies. Every authenticated API was
 *     reachable as that user.
 *   - `fetch('https://…', { mode: 'no-cors' })` — succeeded. Anything the
 *     code could read could be posted off the machine.
 *   - `importScripts('https://…')` — succeeded. Arbitrary remote code.
 *   - `indexedDB.open(…)` — succeeded. Origin storage was readable.
 *
 * ## What this does instead
 *
 * Two independent layers, because either one alone has a failure mode.
 *
 * 1. **Origin isolation.** The worker is created inside an
 *    `<iframe sandbox="allow-scripts">`. Without `allow-same-origin` the
 *    frame gets an opaque origin, and the worker inherits it. Requests to
 *    this app are then cross-origin from a `null` origin: no cookies are
 *    attached and CORS blocks reading any response. Origin storage throws
 *    SecurityError. Verified against the running app — the same three
 *    probes above return "Failed to fetch", "SecurityError" and
 *    "NetworkError".
 *
 * 2. **Capability removal.** Before the candidate's code is compiled, the
 *    worker deletes the networking, storage and worker-spawning globals from
 *    its own scope *and its prototype chain* — `fetch` and friends live on
 *    `WorkerGlobalScope.prototype`, so assigning `self.fetch = undefined`
 *    alone would leave `Object.getPrototypeOf(self).fetch.call(self)` open.
 *    This is what holds if a browser ever hands the sandboxed frame a real
 *    origin, or if someone edits the iframe attributes later.
 *
 * Results are authenticated with a nonce held in a closure the candidate's
 * code cannot read, so overriding `postMessage` to report a passing run does
 * not work — that is score integrity rather than safety, but it is the same
 * class of "what happens if someone tries".
 *
 * If the sandbox cannot be created, this **fails closed** and runs nothing.
 * A browser too old for iframe sandboxing is not a reason to execute
 * untrusted code on the app's own origin.
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

/**
 * Globals removed before candidate code runs.
 *
 * Everything here is either a way to reach the network, a way to reach
 * origin storage, or a way to obtain a fresh un-neutered realm.
 */
const BLOCKED_GLOBALS = [
  "fetch",
  "XMLHttpRequest",
  "WebSocket",
  "EventSource",
  "importScripts",
  "Worker",
  "SharedWorker",
  "indexedDB",
  "caches",
  "localStorage",
  "sessionStorage",
  "BroadcastChannel",
  "RTCPeerConnection",
  "Notification",
  "navigator",
  "postMessage"
];

const WORKER_SRC = `
var BLOCKED = ${JSON.stringify(BLOCKED_GLOBALS)};

/*
 * Captured before anything the candidate wrote can touch them, so replacing
 * self.postMessage or JSON.stringify cannot forge a result or a comparison.
 */
var POST = self.postMessage.bind(self);
var STRINGIFY = JSON.stringify;
var PARSE = JSON.parse;
var NOW = Date.now;

function preview(value) {
  try { return STRINGIFY(value); } catch (e) { return String(value); }
}
function equal(a, b) {
  return preview(a) === preview(b);
}

/*
 * Remove a capability from the scope AND from every prototype in the chain.
 * These are accessor/data properties on WorkerGlobalScope.prototype, so a
 * plain assignment on self leaves the inherited one reachable via
 * Object.getPrototypeOf(self).fetch.call(self).
 */
function revoke(name) {
  var target = self;
  while (target && target !== Object.prototype) {
    if (Object.prototype.hasOwnProperty.call(target, name)) {
      try { delete target[name]; } catch (e) { /* non-configurable; shadowed below */ }
    }
    target = Object.getPrototypeOf(target);
  }
  try {
    Object.defineProperty(self, name, {
      value: undefined,
      writable: false,
      configurable: false,
      enumerable: false
    });
  } catch (e) { /* already gone */ }
}

var LOGS = [];
var CURRENT_TEST = null;
var LOG_LIMIT = 200;
function capture(level) {
  return function () {
    if (LOGS.length > LOG_LIMIT) return;
    if (LOGS.length === LOG_LIMIT) {
      LOGS.push({ level: "warn", text: "… output truncated after " + LOG_LIMIT + " lines.", test: null });
      return;
    }
    var parts = [];
    for (var i = 0; i < arguments.length; i++) {
      var a = arguments[i];
      parts.push(typeof a === "string" ? a : preview(a));
    }
    LOGS.push({ level: level, text: parts.join(" ").slice(0, 2000), test: CURRENT_TEST });
  };
}

self.onmessage = function (event) {
  var nonce = event.data.nonce;
  var code = event.data.code;
  var fnName = event.data.fnName;
  var tests = event.data.tests;
  var send = function (payload) {
    payload.nonce = nonce;
    POST(payload);
  };

  // Console is replaced rather than revoked — printing to debug is how
  // people work through a problem, and the editor shows what was printed.
  self.console = {
    log: capture("log"), info: capture("log"), debug: capture("log"),
    warn: capture("warn"), error: capture("error"),
    trace: function () {}, dir: capture("log"), table: capture("log"),
    group: function () {}, groupEnd: function () {}, time: function () {}, timeEnd: function () {}
  };

  for (var b = 0; b < BLOCKED.length; b++) revoke(BLOCKED[b]);

  var results = [];
  var fn;
  var startedAt = NOW();
  try {
    fn = new Function(code + "\\nreturn typeof " + fnName + " === 'function' ? " + fnName + " : undefined;")();
  } catch (err) {
    send({ error: "Your code didn't compile: " + (err && err.message ? err.message : String(err)), logs: LOGS });
    return;
  }
  if (typeof fn !== "function") {
    send({ error: "Couldn't find a function named " + fnName + "(). Keep that name so the tests can call it.", logs: LOGS });
    return;
  }
  for (var i = 0; i < tests.length; i++) {
    var test = tests[i];
    CURRENT_TEST = test.name;
    var caseStart = NOW();
    try {
      var actual = fn.apply(null, PARSE(STRINGIFY(test.args)));
      results.push({
        name: test.name,
        passed: equal(actual, test.expected),
        actual: preview(actual),
        expected: preview(test.expected),
        durationMs: NOW() - caseStart
      });
    } catch (err) {
      results.push({
        name: test.name,
        passed: false,
        error: err && err.message ? String(err.message).slice(0, 300) : String(err).slice(0, 300),
        expected: preview(test.expected),
        durationMs: NOW() - caseStart
      });
    }
  }
  CURRENT_TEST = null;
  send({ results: results, logs: LOGS, durationMs: NOW() - startedAt });
};
`;

/**
 * The sandboxed frame. It only relays: it builds the worker from the source
 * the parent hands it and passes messages through. Nothing about the
 * candidate's code is interpreted here.
 */
const FRAME_HTML = `<!doctype html><meta charset="utf-8"><script>
(function () {
  var worker = null;
  window.addEventListener("message", function (event) {
    var data = event.data || {};
    if (data.kind === "start") {
      try {
        var url = URL.createObjectURL(new Blob([data.workerSource], { type: "application/javascript" }));
        worker = new Worker(url);
        URL.revokeObjectURL(url);
        worker.onmessage = function (e) { parent.postMessage(e.data, "*"); };
        worker.onerror = function () {
          parent.postMessage({ nonce: data.payload.nonce, error: "Your code threw before any test ran." }, "*");
        };
        worker.postMessage(data.payload);
      } catch (err) {
        parent.postMessage({ nonce: data.payload && data.payload.nonce, error: "Couldn't start the sandbox in this browser." }, "*");
      }
    }
  });
  parent.postMessage({ kind: "ready" }, "*");
})();
<\/script>`;

function randomNonce() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function runCode(
  code: string,
  fnName: string,
  tests: CodeTest[],
  timeoutMs = 3000
): Promise<RunResult> {
  return new Promise((resolve) => {
    if (typeof document === "undefined") {
      resolve({ results: [], passed: 0, total: tests.length, logs: [], error: "The code runner needs a browser." });
      return;
    }

    const nonce = randomNonce();
    let settled = false;
    let frame: HTMLIFrameElement | null = null;
    let timer = 0;

    const cleanup = () => {
      window.clearTimeout(timer);
      window.removeEventListener("message", onMessage);
      // Removing the frame tears down the worker inside it, so an infinite
      // loop cannot outlive the run.
      frame?.remove();
      frame = null;
    };

    const settle = (result: RunResult) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    };

    const fail = (error: string, logs: ConsoleLine[] = []) =>
      settle({ results: [], passed: 0, total: tests.length, error, logs });

    function onMessage(event: MessageEvent) {
      // Only the frame we created, and only messages carrying the nonce the
      // candidate's code has no way to read.
      if (!frame || event.source !== frame.contentWindow) return;
      const data = event.data as {
        kind?: string;
        nonce?: string;
        results?: CodeTestResult[];
        error?: string;
        logs?: ConsoleLine[];
        durationMs?: number;
      };

      if (data.kind === "ready") {
        frame.contentWindow?.postMessage(
          { kind: "start", workerSource: WORKER_SRC, payload: { nonce, code, fnName, tests } },
          "*"
        );
        return;
      }

      if (data.nonce !== nonce) return;

      const logs = data.logs ?? [];
      if (data.error) {
        fail(data.error, logs);
        return;
      }
      const results = data.results ?? [];
      settle({
        results,
        passed: results.filter((r) => r.passed).length,
        total: results.length,
        logs,
        durationMs: data.durationMs
      });
    }

    try {
      frame = document.createElement("iframe");
      // No allow-same-origin: that is what makes the origin opaque, and it
      // is the whole mitigation. Do not add it.
      frame.setAttribute("sandbox", "allow-scripts");
      frame.setAttribute("aria-hidden", "true");
      frame.setAttribute("title", "Code runner sandbox");
      frame.style.cssText = "position:absolute;width:0;height:0;border:0;visibility:hidden;";
      frame.srcdoc = FRAME_HTML;
      window.addEventListener("message", onMessage);
      document.body.appendChild(frame);
    } catch {
      cleanup();
      // Fail closed. Falling back to an unsandboxed worker would put
      // arbitrary code back on this origin, which is the bug being fixed.
      fail("Couldn't start the secure code runner in this browser.");
      return;
    }

    timer = window.setTimeout(() => {
      fail(`Timed out after ${timeoutMs / 1000}s — check for an infinite loop.`);
    }, timeoutMs);
  });
}
