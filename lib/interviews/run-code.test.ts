import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Source-level guards on the code sandbox.
 *
 * These read the shipped file rather than executing it, because the
 * mitigation is made of browser primitives — an opaque-origin iframe and a
 * worker — that vitest has no DOM to provide. They are deliberately narrow:
 * they catch someone removing or weakening the sandbox, which is the
 * realistic regression. Behaviour against a real browser was verified by
 * running hostile code in the editor and observing origin "null", every
 * network and storage global undefined, and result forgery rejected.
 */
const source = readFileSync(join(process.cwd(), "lib/interviews/run-code.ts"), "utf8");

/** Source with comments stripped, so prose about a risk is not read as the risk. */
const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

/** The relay script that runs *inside* the sandboxed frame. */
const frameHtml = (source.match(/const FRAME_HTML = `([\s\S]*?)`;/) ?? [])[1] ?? "";
/** Everything else — the parent context, which must never spawn a worker itself. */
const parentCode = code.replace(frameHtml, "");

describe("code sandbox", () => {
  it("creates the runner frame with allow-scripts and nothing else", () => {
    expect(source).toMatch(/setAttribute\("sandbox",\s*"allow-scripts"\)/);
  });

  it("never grants allow-same-origin, which is the entire mitigation", () => {
    /*
     * With allow-same-origin the frame regains this app's origin, and the
     * worker inside it can call authenticated same-origin APIs with the
     * signed-in user's cookies — measured as a working 200 response before
     * this was fixed.
     */
    expect(code).not.toMatch(/allow-same-origin/);
  });

  it("revokes every capability that reaches the network, storage or a new realm", () => {
    for (const capability of [
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
      "BroadcastChannel"
    ]) {
      expect(source, `${capability} is not revoked in the worker`).toMatch(
        new RegExp(`"${capability}"`)
      );
    }
  });

  it("walks the prototype chain when revoking", () => {
    // fetch and friends live on WorkerGlobalScope.prototype, so assigning
    // self.fetch = undefined alone leaves
    // Object.getPrototypeOf(self).fetch.call(self) reachable.
    expect(source).toMatch(/getPrototypeOf/);
  });

  it("captures postMessage before candidate code runs, so results cannot be forged", () => {
    const postCapture = source.indexOf("var POST = self.postMessage.bind(self)");
    const userCodeCompile = source.indexOf("new Function(code");
    expect(postCapture).toBeGreaterThan(-1);
    expect(userCodeCompile).toBeGreaterThan(-1);
    expect(postCapture).toBeLessThan(userCodeCompile);
  });

  it("authenticates results with a nonce the candidate's code cannot read", () => {
    expect(source).toMatch(/crypto\.getRandomValues/);
    expect(source).toMatch(/data\.nonce !== nonce/);
  });

  it("only accepts messages from the frame it created", () => {
    expect(source).toMatch(/event\.source !== frame\.contentWindow/);
  });

  it("fails closed rather than falling back to an unsandboxed worker", () => {
    // A browser too old for iframe sandboxing is not a reason to execute
    // untrusted code on this origin.
    expect(source).toMatch(/Couldn't start the secure code runner/);
    // A worker may only be constructed inside the sandboxed frame, never by
    // the parent — a parent-side fallback would be the original hole.
    expect(frameHtml).toMatch(/new Worker\(/);
    expect(parentCode).not.toMatch(/new Worker\(/);
  });

  it("still enforces a timeout and tears the frame down", () => {
    expect(source).toMatch(/Timed out after/);
    expect(source).toMatch(/frame\?\.remove\(\)/);
  });

  it("caps captured console output so a print loop cannot exhaust memory", () => {
    expect(source).toMatch(/LOG_LIMIT/);
  });

  it("refuses the network in the frame's own CSP, which the worker inherits", () => {
    /*
     * Layer 3. Layers 1 and 2 stop the code from reaching this app and from
     * holding a network function; this stops the browser from opening a
     * connection at all, so a bypass of either one still has nowhere to send
     * anything. Asserted on the frame HTML rather than the file so the
     * comment explaining the policy cannot satisfy the test.
     */
    expect(frameHtml).toMatch(/http-equiv="Content-Security-Policy"/);
    expect(frameHtml).toMatch(/connect-src 'none'/);
    expect(frameHtml).toMatch(/default-src 'none'/);
  });

  it("puts the policy ahead of the script it governs", () => {
    // A meta CSP that appears after a script does not apply to that script.
    const policy = frameHtml.indexOf("Content-Security-Policy");
    const script = frameHtml.indexOf("<script>");
    expect(policy).toBeGreaterThan(-1);
    expect(script).toBeGreaterThan(-1);
    expect(policy).toBeLessThan(script);
  });

  it("still allows the pieces the runner actually needs", () => {
    // The policy has to leave the worker and the compile step working, or
    // the sandbox is secure and useless. blob: for the worker, unsafe-eval
    // for new Function — both confined to the opaque origin.
    expect(frameHtml).toMatch(/worker-src blob:/);
    expect(frameHtml).toMatch(/script-src [^"]*'unsafe-eval'/);
    expect(frameHtml).toMatch(/script-src [^"]*blob:/);
  });
});
