import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getContrastRatio } from "@/lib/theme/contrast";

/**
 * Reads the real token values out of globals.css so the thresholds are
 * checked against what actually ships, not a copy that can drift.
 */
const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");

function tokensIn(blockSelector: string) {
  const start = css.indexOf(blockSelector);
  if (start < 0) throw new Error(`missing block: ${blockSelector}`);
  const block = css.slice(start, css.indexOf("\n}", start));
  const out: Record<string, { h: number; s: number; l: number }> = {};
  for (const m of block.matchAll(
    /--([a-z-]+):\s*(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%\s*;/g
  )) {
    out[m[1]] = { h: Number(m[2]), s: Number(m[3]), l: Number(m[4]) };
  }
  return out;
}

const THEMES = [
  { name: "light", selector: "\n:root {" },
  { name: "dark", selector: "\n:root.dark {" }
];

// Every background these text tokens are actually painted on.
const SURFACES = ["surface", "surface-raised", "soft", "overlay"];
const TEXT_TOKENS = ["text", "text-secondary", "muted", "faint"];

describe("text tokens meet WCAG AA on every surface", () => {
  for (const theme of THEMES) {
    it(`${theme.name} theme`, () => {
      const tokens = tokensIn(theme.selector);
      for (const textName of TEXT_TOKENS) {
        const fg = tokens[textName];
        expect(fg, `${theme.name} --${textName} not found`).toBeDefined();
        for (const surfaceName of SURFACES) {
          const bg = tokens[surfaceName];
          expect(bg, `${theme.name} --${surfaceName} not found`).toBeDefined();
          const ratio = getContrastRatio(fg, bg);
          expect(
            ratio,
            `${theme.name}: --${textName} on --${surfaceName} = ${ratio.toFixed(2)}:1`
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
    });
  }

  it("keeps the three secondary tiers visually distinct", () => {
    for (const theme of THEMES) {
      const t = tokensIn(theme.selector);
      const steps = [t["text-secondary"].l, t.muted.l, t.faint.l];
      // Ordered away from --text, and separated enough to read as a scale.
      for (let i = 1; i < steps.length; i += 1) {
        expect(Math.abs(steps[i] - steps[i - 1])).toBeGreaterThanOrEqual(3);
      }
    }
  });
});
