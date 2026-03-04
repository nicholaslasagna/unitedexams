import { ACCENT_RANGE, THEME_DEFAULTS } from "@/lib/theme/defaults";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export interface ThemeVarInput {
  accentHue?: number;
  accentStrength?: number;
}

export function applyThemeCssVars(input: ThemeVarInput) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  const hue = clamp(
    input.accentHue ?? THEME_DEFAULTS.accentHue,
    ACCENT_RANGE.minHue,
    ACCENT_RANGE.maxHue
  );
  const strength = clamp(
    input.accentStrength ?? THEME_DEFAULTS.accentStrength,
    ACCENT_RANGE.minStrength,
    ACCENT_RANGE.maxStrength
  );

  root.style.setProperty("--accent-hue", String(hue));
  root.style.setProperty("--accent-strength", String(strength));
}
