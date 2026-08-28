import { describe, expect, it } from "vitest";
import {
  accentForegroundHsl,
  accentTextHsl,
  brandGradientForegroundHsl,
  getContrastRatio
} from "@/lib/theme/contrast";

/** Parse the "H S% L%" token form these helpers return. */
function parseHsl(token: string) {
  const [h, s, l] = token.split(" ");
  return { h: Number(h), s: Number(s.replace("%", "")), l: Number(l.replace("%", "")) };
}

// The palette picker clamps accent lightness to 38-76 and saturation to
// 38-95 (see lib/theme/css-vars.ts), so those are the bounds that matter.
const LIGHTNESSES = [38, 44, 50, 56, 62, 68, 76];
const SATURATIONS = [38, 60, 92, 95];
const HUES = [0, 38, 120, 210, 280, 340];

describe("accentForegroundHsl", () => {
  it("clears WCAG AA body text contrast across every accent the picker allows", () => {
    for (const h of HUES) {
      for (const s of SATURATIONS) {
        for (const l of LIGHTNESSES) {
          const fg = parseHsl(accentForegroundHsl(h, s, l));
          const ratio = getContrastRatio(fg, { h, s, l });
          expect(
            ratio,
            `hue ${h}, sat ${s}, lit ${l} -> ${ratio.toFixed(2)}:1`
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it("does not return white on the default amber accent", () => {
    // Regression: --accent-fg was hard-coded to white, which measures about
    // 2.1:1 on the default accent - on the app's primary button.
    expect(accentForegroundHsl(38, 92, 50)).not.toBe("0 0% 100%");
    const fg = parseHsl(accentForegroundHsl(38, 92, 50));
    expect(getContrastRatio(fg, { h: 38, s: 92, l: 50 })).toBeGreaterThan(7);
  });
});

describe("brandGradientForegroundHsl", () => {
  it("is scored against the gradient's worst stop, not just the accent", () => {
    for (const h of HUES) {
      for (const l of LIGHTNESSES) {
        const fg = parseHsl(brandGradientForegroundHsl(h, 92, l));
        const stops = [
          { h: h - 28, s: 88, l: l - 2 },
          { h, s: 86, l },
          { h: h - 18, s: 96, l: l + 6 }
        ];
        const worst = Math.min(...stops.map((stop) => getContrastRatio(fg, stop)));
        // The chosen foreground must beat both alternatives on the worst stop.
        const white = Math.min(
          ...stops.map((stop) => getContrastRatio({ h: 0, s: 0, l: 100 }, stop))
        );
        expect(worst).toBeGreaterThanOrEqual(white);
      }
    }
  });
});

describe("accentTextHsl", () => {
  it("reaches AA against the page in both themes, for every allowed accent", () => {
    const pages = [
      { isDark: true, bg: { h: 235, s: 32, l: 7 } },
      { isDark: false, bg: { h: 0, s: 0, l: 100 } }
    ];
    for (const { isDark, bg } of pages) {
      for (const h of HUES) {
        for (const s of SATURATIONS) {
          for (const l of LIGHTNESSES) {
            const text = parseHsl(accentTextHsl(h, s, l, isDark));
            const ratio = getContrastRatio(text, bg);
            expect(
              ratio,
              `${isDark ? "dark" : "light"} hue ${h} sat ${s} lit ${l} -> ${ratio.toFixed(2)}:1`
            ).toBeGreaterThanOrEqual(4.5);
          }
        }
      }
    }
  });

  it("leaves the accent alone in dark mode, where it already passes", () => {
    // Amber on the near-black page is about 9:1 as text; darkening it there
    // would only make the brand colour muddier for no benefit.
    expect(accentTextHsl(38, 92, 50, true)).toBe("38 92% 50%");
  });

  it("darkens the accent for the light theme's white page", () => {
    const text = parseHsl(accentTextHsl(38, 92, 50, false));
    expect(text.l).toBeLessThan(50);
    expect(getContrastRatio(text, { h: 0, s: 0, l: 100 })).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps the hue, so the brand colour is still recognisable", () => {
    for (const h of HUES) {
      expect(parseHsl(accentTextHsl(h, 92, 50, false)).h).toBe(h);
    }
  });
});
