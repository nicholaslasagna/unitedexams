/**
 * Minimal contrast utilities for ensuring accent colors remain accessible.
 * Targets WCAG AA (3:1 for UI components, 4.5:1 for text).
 */

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function getContrastRatio(
  fg: { h: number; s: number; l: number },
  bg: { h: number; s: number; l: number }
): number {
  const [r1, g1, b1] = hslToRgb(fg.h, fg.s, fg.l);
  const [r2, g2, b2] = hslToRgb(bg.h, bg.s, bg.l);
  return contrastRatio(relativeLuminance(r1, g1, b1), relativeLuminance(r2, g2, b2));
}

/**
 * Adjusts accent lightness to meet minimum contrast against the surface color.
 * Returns the adjusted lightness value.
 */
export function ensureAccessibleLightness(
  hue: number,
  saturation: number,
  lightness: number,
  isDark: boolean,
  minRatio = 3
): number {
  const surfaceBg = isDark
    ? { h: 240, s: 30, l: 6 }
    : { h: 0, s: 0, l: 100 };

  let l = lightness;
  const step = isDark ? 2 : -2;
  const limit = isDark ? 85 : 25;

  for (let i = 0; i < 20; i++) {
    const ratio = getContrastRatio({ h: hue, s: saturation, l }, surfaceBg);
    if (ratio >= minRatio) return l;
    l += step;
    if ((isDark && l > limit) || (!isDark && l < limit)) break;
  }

  return l;
}

/**
 * Checks if a given accent color meets contrast requirements.
 */
export function checkAccentContrast(
  hue: number,
  saturation: number,
  lightness: number,
  isDark: boolean
): { passes: boolean; ratio: number } {
  const surfaceBg = isDark
    ? { h: 240, s: 30, l: 6 }
    : { h: 0, s: 0, l: 100 };

  const ratio = getContrastRatio({ h: hue, s: saturation, l: lightness }, surfaceBg);
  return { passes: ratio >= 3, ratio };
}
