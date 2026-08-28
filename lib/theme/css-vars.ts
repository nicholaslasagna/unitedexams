import {
  accentForegroundHsl,
  accentTextHsl,
  brandGradientForegroundHsl
} from "@/lib/theme/contrast";
import { ACCENT_RANGE, THEME_DEFAULTS } from "@/lib/theme/defaults";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export interface ThemeVarInput {
  accentHue?: number;
  accentSaturation?: number;
  accentLightness?: number;
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
  const saturation = clamp(
    input.accentSaturation ?? THEME_DEFAULTS.accentSaturation,
    38,
    95
  );
  const lightness = clamp(
    input.accentLightness ?? THEME_DEFAULTS.accentLightness,
    38,
    76
  );

  root.style.setProperty("--accent-hue", String(hue));
  root.style.setProperty("--accent-sat", String(saturation));
  root.style.setProperty("--accent-lit", String(lightness));
  root.style.setProperty("--accent-strength", String(strength));
  // Text drawn on the accent fill has to stay readable at every setting the
  // picker allows, so this is derived rather than fixed.
  root.style.setProperty("--accent-fg", accentForegroundHsl(hue, saturation, lightness));
  root.style.setProperty(
    "--brand-fg",
    brandGradientForegroundHsl(hue, saturation, lightness)
  );
  // The accent used as text rather than as a fill; readable on the page
  // background of whichever theme is active.
  const isDark = root.classList.contains("dark");
  root.style.setProperty(
    "--accent-text",
    accentTextHsl(hue, saturation, lightness, isDark)
  );
}
