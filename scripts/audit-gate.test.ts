import { describe, expect, it } from "vitest";
// @ts-expect-error -- plain ESM script without type declarations
import { ACCEPTED, evaluate } from "./audit-gate.mjs";

/**
 * The exception must stay narrow: one advisory id, not a package, not a
 * severity, and not forever.
 */

const advisory = (id: string, severity: string, title = id) => ({
  source: 1,
  name: "x",
  severity,
  title,
  url: `https://github.com/advisories/${id}`
});

/** A report shaped like `npm audit --json`. */
const report = (entries: Record<string, Array<ReturnType<typeof advisory> | string>>) => ({
  vulnerabilities: Object.fromEntries(Object.entries(entries).map(([name, via]) => [name, { name, via }]))
});

const braces = advisory("GHSA-vfj7-8cjw-p6xm", "high");
const TODAY = "2026-10-07";

describe("the dependency audit gate", () => {
  it("passes when the only high advisory is the accepted one, and its dependents", () => {
    const result = evaluate(
      report({ braces: [braces], micromatch: ["braces"], tailwindcss: ["micromatch", "chokidar"] }),
      ACCEPTED,
      TODAY
    );
    expect(result.blocking).toEqual([]);
    expect(result.allowed.map((a: { id: string }) => a.id)).toEqual(["GHSA-vfj7-8cjw-p6xm"]);
  });

  it("still fails on a new high advisory elsewhere", () => {
    const result = evaluate(report({ braces: [braces], next: [advisory("GHSA-new-1", "critical")] }), ACCEPTED, TODAY);
    expect(result.blocking.map((a: { id: string }) => a.id)).toEqual(["GHSA-new-1"]);
  });

  it("still fails on a new advisory against the same package", () => {
    // Accepted by id, not by package name.
    const result = evaluate(report({ braces: [braces, advisory("GHSA-new-2", "high")] }), ACCEPTED, TODAY);
    expect(result.blocking.map((a: { id: string }) => a.id)).toEqual(["GHSA-new-2"]);
  });

  it("does not block on low or moderate, matching --audit-level=high", () => {
    const result = evaluate(report({ katex: [advisory("GHSA-low", "low")], qs: [advisory("GHSA-mod", "moderate")] }), [], TODAY);
    expect(result.blocking).toEqual([]);
  });

  it("fails once an exception is past its review date", () => {
    const result = evaluate(report({ braces: [braces] }), ACCEPTED, "2099-01-01");
    expect(result.expired).toHaveLength(1);
  });

  it("flags an exception that is no longer needed", () => {
    expect(evaluate(report({}), ACCEPTED, TODAY).stale).toHaveLength(1);
  });

  it("gives every exception a reason and a review date", () => {
    for (const entry of ACCEPTED) {
      expect(entry.reason.length).toBeGreaterThan(40);
      expect(entry.reviewBy).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
