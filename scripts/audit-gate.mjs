#!/usr/bin/env node
/**
 * Dependency audit gate for CI.
 *
 * Fails on any high or critical advisory, like `npm audit --audit-level=high`,
 * except advisories listed in ACCEPTED. An entry is for an advisory that no
 * release fixes, has been looked at by a person, and carries a date by which
 * it must be looked at again. Entries match by advisory id, so a new advisory
 * on the same package still fails the build.
 *
 * Why not lower the threshold or audit production only: both would also hide
 * the next advisory, and this gate was already ignored for weeks once while it
 * was red for a reason nobody could act on.
 */
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export const ACCEPTED = [
  {
    id: "GHSA-vfj7-8cjw-p6xm",
    package: "braces",
    reason:
      "No fixed release exists: 3.0.3 is the final version and the advisory covers <=3.0.3. " +
      "Reached only through dev tooling (tailwindcss 3's watcher and globber, and " +
      "eslint-plugin-next), which expands brace patterns from this repository's own config, " +
      "never from user input. Not in the production dependency tree.",
    reviewBy: "2027-01-31"
  }
];

const BLOCKING = new Set(["high", "critical"]);

/** Every advisory in an `npm audit --json` report, once each. */
export function advisoriesIn(report) {
  const found = new Map();
  for (const [name, entry] of Object.entries(report.vulnerabilities ?? {})) {
    for (const via of entry.via ?? []) {
      // String entries point at another package's advisory; it is listed there.
      if (typeof via !== "object" || !via.url) continue;
      const id = via.url.split("/").pop();
      if (!found.has(id)) found.set(id, { id, package: name, severity: via.severity, title: via.title });
    }
  }
  return [...found.values()];
}

export function evaluate(report, accepted = ACCEPTED, today = new Date().toISOString().slice(0, 10)) {
  const advisories = advisoriesIn(report);
  const acceptedIds = new Set(accepted.map((entry) => entry.id));
  return {
    blocking: advisories.filter((a) => BLOCKING.has(a.severity) && !acceptedIds.has(a.id)),
    // An exception past its date fails the build until someone looks again.
    expired: accepted.filter((entry) => entry.reviewBy < today),
    // Fixed upstream or no longer installed: the exception can go.
    stale: accepted.filter((entry) => !advisories.some((a) => a.id === entry.id)),
    allowed: advisories.filter((a) => acceptedIds.has(a.id))
  };
}

function runAudit() {
  try {
    return execFileSync("npm", ["audit", "--json"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  } catch (error) {
    // npm audit exits non-zero whenever it finds anything; the report is still on stdout.
    if (error.stdout) return error.stdout;
    throw error;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { blocking, expired, stale, allowed } = evaluate(JSON.parse(runAudit()));

  for (const a of allowed) console.log(`accepted  ${a.severity.padEnd(8)} ${a.package}  ${a.id}`);
  for (const e of stale) console.log(`stale     ${e.package}  ${e.id} is no longer reported; remove it from ACCEPTED`);
  for (const e of expired) console.error(`expired   ${e.package}  ${e.id} was due for review by ${e.reviewBy}`);
  for (const a of blocking) console.error(`blocking  ${a.severity.padEnd(8)} ${a.package}  ${a.id}  ${a.title}`);

  if (blocking.length > 0 || expired.length > 0) {
    console.error("\nDependency audit failed. Run `npm audit` for details.");
    process.exit(1);
  }
  console.log("\nDependency audit passed: no unaccepted high or critical advisories.");
}
