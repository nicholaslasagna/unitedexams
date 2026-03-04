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

  const rawHue = input.accentHue ?? THEME_DEFAULTS.accentHue;
  const hue = ((rawHue % 360) + 360) % 360; // normalize to 0-360
  const strength = clamp(
    input.accentStrength ?? THEME_DEFAULTS.accentStrength,
    ACCENT_RANGE.minStrength,
    ACCENT_RANGE.maxStrength
  );

  root.style.setProperty("--accent-hue", String(hue));
  root.style.setProperty("--accent-strength", String(strength));
}
