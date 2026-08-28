import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");

// Strip comments so the explanatory notes in the stylesheet are not scanned
// as if they were declarations.
const declarations = css.replace(/\/\*[\s\S]*?\*\//g, "");

describe("globals.css custom properties", () => {
  it("never appends a bare % to a var() substitution", () => {
    /*
     * `hsl(var(--h) var(--s)% var(--l)%)` is silently invalid. Substituting a
     * custom property inserts an empty-comment token separator between the
     * number and the percent sign, so it is not a valid <percentage>, the
     * whole colour is invalid, and it computes to transparent.
     *
     * This shipped in the light theme's --accent and made every accent fill
     * - primary buttons included - colourless in light mode, while dark mode
     * looked correct because it used the calc() form. Use
     * `calc(var(--x) * 1%)`.
     */
    const offenders = declarations
      .split("\n")
      .map((line, index) => ({ line: line.trim(), number: index + 1 }))
      .filter(({ line }) => /var\(--[a-z0-9-]+\)\s*%/i.test(line));

    expect(
      offenders,
      offenders.map((o) => `line ${o.number}: ${o.line}`).join("\n")
    ).toEqual([]);
  });

  it("keeps both themes' accent definitions unit-safe", () => {
    const accentLines = declarations
      .split("\n")
      .filter((line) => /^\s*--accent:/.test(line));
    // Light (:root) and dark (:root.dark).
    expect(accentLines).toHaveLength(2);
    for (const line of accentLines) {
      expect(line).toMatch(/calc\(/);
      expect(line).not.toMatch(/var\(--[a-z0-9-]+\)\s*%/i);
    }
  });
});
