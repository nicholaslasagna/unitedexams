/**
 * Contrast utilities for ensuring accent colors remain accessible.
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
    ? { h: 235, s: 32, l: 7 }
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
 * Ensures an accent color meets accessibility thresholds.
 * In dark mode: accent must be light enough (min lightness 52%).
 * In light mode: accent must be dark enough (max lightness 55%).
 * Also enforces minimum saturation.
 */
export function ensureAccessibleAccent(
  hue: number,
  sat: number,
  lit: number,
  isDark: boolean
): { sat: number; lit: number } {
  if (isDark) {
    return {
      sat: Math.max(sat, 40),
      lit: Math.max(lit, 52)
    };
  } else {
    return {
      sat: Math.max(sat, 35),
      lit: Math.min(lit, 55)
    };
  }
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
    ? { h: 235, s: 32, l: 7 }
    : { h: 0, s: 0, l: 100 };

  const ratio = getContrastRatio({ h: hue, s: saturation, l: lightness }, surfaceBg);
  return { passes: ratio >= 3, ratio };
}

/**
 * Pick a foreground that is actually readable on the accent fill.
 *
 * `--accent-fg` was hard-coded to pure white, and the accent is a
 * user-adjustable hue/saturation/lightness whose lightness is clamped to
 * 38-76. At the default amber (38, 92%, 50%) white on accent measures about
 * 2:1, well under the 4.5:1 that WCAG AA asks of body text - and that pair
 * is the app's primary button, so the worst contrast on the site was on the
 * control people are most meant to press.
 *
 * Candidates are tried in order of preference: a very dark tone carrying the
 * accent's own hue (warmer and more on-brand than flat black), then black,
 * then white. The first that clears `minRatio` wins; if none do - only
 * possible at extreme settings - the highest-contrast option is returned so
 * the result degrades to "best available" rather than "whatever was first".
 */
export function accentForegroundHsl(
  hue: number,
  saturation: number,
  lightness: number,
  minRatio = 4.5
): string {
  const accent = { h: hue, s: saturation, l: lightness };
  const candidates: { css: string; hsl: { h: number; s: number; l: number } }[] = [
    { css: `${Math.round(hue)} 45% 10%`, hsl: { h: hue, s: 45, l: 10 } },
    { css: "0 0% 0%", hsl: { h: 0, s: 0, l: 0 } },
    { css: "0 0% 100%", hsl: { h: 0, s: 0, l: 100 } }
  ];

  let best = candidates[0];
  let bestRatio = 0;
  for (const candidate of candidates) {
    const ratio = getContrastRatio(candidate.hsl, accent);
    if (ratio >= minRatio) return candidate.css;
    if (ratio > bestRatio) {
      bestRatio = ratio;
      best = candidate;
    }
  }
  return best.css;
}

/**
 * Foreground for text sitting on the three-stop brand gradient.
 *
 * The gradient runs brand-1 -> brand-2 -> brand-3, and brand-1 is both
 * hue-shifted and darker than the accent, so text crosses fills with very
 * different luminance. A foreground that is ideal on the accent is not
 * automatically ideal here, which is why this is a separate token from
 * `accentForegroundHsl` - one value cannot serve both, and pairing the two
 * off a single `--accent-fg` is what left gradient text at roughly 1.9:1.
 *
 * Scored on the worst stop rather than the average, since the worst stop is
 * where text becomes unreadable.
 */
export function brandGradientForegroundHsl(
  hue: number,
  saturation: number,
  lightness: number
): string {
  const stops = [
    { h: hue - 28, s: saturation - 4, l: lightness - 2 },
    { h: hue, s: saturation - 6, l: lightness },
    { h: hue - 18, s: saturation + 4, l: lightness + 6 }
  ];
  const candidates: { css: string; hsl: { h: number; s: number; l: number } }[] = [
    { css: `${Math.round(hue)} 45% 10%`, hsl: { h: hue, s: 45, l: 10 } },
    { css: "0 0% 0%", hsl: { h: 0, s: 0, l: 0 } },
    { css: "0 0% 100%", hsl: { h: 0, s: 0, l: 100 } }
  ];

  let best = candidates[0];
  let bestWorst = 0;
  for (const candidate of candidates) {
    const worst = Math.min(...stops.map((stop) => getContrastRatio(candidate.hsl, stop)));
    if (worst > bestWorst) {
      bestWorst = worst;
      best = candidate;
    }
  }
  return best.css;
}

/**
 * The accent, adjusted until it is readable *as text* on the page.
 *
 * `--accent` is tuned to be a fill: dark text sits on it, and at 50%
 * lightness that works well. Used as a text colour it is a different
 * problem, and on the light theme's white page an amber at 50% measures
 * 1.98:1 - so every accent word, pill label and eyebrow in light mode was
 * failing badly, which only became visible once the light accent stopped
 * computing to transparent.
 *
 * Dark mode needs no adjustment (the same amber is 9:1 on the near-black
 * page), so this walks lightness only in the direction that helps and
 * returns the first value that clears `minRatio`. Yellows need the most
 * movement, blues almost none, which is why this is computed per hue
 * rather than set as one hand-picked number.
 */
export function accentTextHsl(
  hue: number,
  saturation: number,
  lightness: number,
  isDark: boolean,
  minRatio = 4.5
): string {
  const pageBg = isDark ? { h: 235, s: 32, l: 7 } : { h: 0, s: 0, l: 100 };
  const step = isDark ? 2 : -2;
  const limit = isDark ? 92 : 8;

  let l = lightness;
  for (let i = 0; i < 45; i += 1) {
    if (getContrastRatio({ h: hue, s: saturation, l }, pageBg) >= minRatio) break;
    const next = l + step;
    if (isDark ? next > limit : next < limit) break;
    l = next;
  }
  return `${Math.round(hue)} ${Math.round(saturation)}% ${Math.round(l)}%`;
}
