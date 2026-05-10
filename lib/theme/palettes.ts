export type ThemePaletteCategory = "standard" | "seasonal";

export interface ThemePalette {
  id: string;
  label: string;
  hue: number;
  saturation: number;
  lightness: number;
  strength: number;
  /**
   * Category — drives where the swatch shows in the picker.
   *   "standard" — always available. The default UnitedExams palette
   *                lives here ("amber").
   *   "seasonal" — surfaced under a separate "Seasonal" header. These
   *                are themed for holidays/seasons and only shown to
   *                signed-in users (the settings page is auth-gated).
   */
  category?: ThemePaletteCategory;
  /** Short note rendered under the swatch in seasonal mode. */
  blurb?: string;
}

export const THEME_PALETTES: ThemePalette[] = [
  // ── Standard palettes ────────────────────────────────────────────
  // Purple family
  { id: "amethyst",  label: "Amethyst",  hue: 265, saturation: 72, lightness: 62, strength: 60, category: "standard" },
  { id: "nebula",    label: "Nebula",    hue: 248, saturation: 68, lightness: 60, strength: 56, category: "standard" },
  { id: "lavender",  label: "Lavender",  hue: 280, saturation: 60, lightness: 68, strength: 52, category: "standard" },
  // Blue family
  { id: "indigo",    label: "Indigo",    hue: 232, saturation: 70, lightness: 57, strength: 62, category: "standard" },
  { id: "aurora",    label: "Aurora",    hue: 198, saturation: 72, lightness: 56, strength: 58, category: "standard" },
  { id: "midnight",  label: "Midnight",  hue: 220, saturation: 65, lightness: 42, strength: 70, category: "standard" },
  // Warm family
  { id: "rose",      label: "Rose",      hue: 338, saturation: 74, lightness: 58, strength: 60, category: "standard" },
  { id: "coral",     label: "Coral",     hue: 12,  saturation: 80, lightness: 58, strength: 58, category: "standard" },
  { id: "amber",     label: "Amber",     hue: 38,  saturation: 92, lightness: 50, strength: 56, category: "standard" },
  // Green family
  { id: "emerald",   label: "Emerald",   hue: 152, saturation: 62, lightness: 50, strength: 54, category: "standard" },
  { id: "sage",      label: "Sage",      hue: 140, saturation: 30, lightness: 52, strength: 44, category: "standard" },
  // Neutral
  { id: "slate",     label: "Slate",     hue: 215, saturation: 20, lightness: 52, strength: 40, category: "standard" },

  // ── Seasonal palettes ────────────────────────────────────────────
  // Holidays & seasons. Same shape as standard palettes — they slot
  // into the existing accent system. Saturation/lightness are tuned
  // so each one is recognizably "the colour of" the holiday without
  // hurting contrast on either light or dark theme. Listed in roughly
  // chronological order through a calendar year.
  { id: "new-year",       label: "New Year",       hue: 45,  saturation: 88, lightness: 55, strength: 64, category: "seasonal", blurb: "Champagne gold" },
  { id: "lunar-new-year", label: "Lunar New Year", hue: 8,   saturation: 82, lightness: 50, strength: 64, category: "seasonal", blurb: "Cinnabar red" },
  { id: "valentines",     label: "Valentine's",    hue: 340, saturation: 80, lightness: 58, strength: 60, category: "seasonal", blurb: "Hot pink" },
  { id: "st-patricks",    label: "St. Patrick's",  hue: 142, saturation: 72, lightness: 42, strength: 60, category: "seasonal", blurb: "Shamrock green" },
  { id: "spring",         label: "Spring",         hue: 320, saturation: 58, lightness: 70, strength: 50, category: "seasonal", blurb: "Cherry blossom" },
  { id: "easter",         label: "Easter",         hue: 285, saturation: 50, lightness: 72, strength: 46, category: "seasonal", blurb: "Pastel lavender" },
  { id: "pride",          label: "Pride",          hue: 295, saturation: 78, lightness: 56, strength: 60, category: "seasonal", blurb: "Pride magenta" },
  { id: "summer",         label: "Summer",         hue: 192, saturation: 80, lightness: 54, strength: 58, category: "seasonal", blurb: "Beach blue" },
  { id: "independence",   label: "Independence",   hue: 220, saturation: 80, lightness: 46, strength: 68, category: "seasonal", blurb: "Stars-and-stripes blue" },
  { id: "autumn",         label: "Autumn",         hue: 22,  saturation: 70, lightness: 48, strength: 62, category: "seasonal", blurb: "Falling-leaves amber" },
  { id: "halloween",      label: "Halloween",      hue: 22,  saturation: 95, lightness: 52, strength: 70, category: "seasonal", blurb: "Pumpkin orange" },
  { id: "diwali",         label: "Diwali",         hue: 30,  saturation: 88, lightness: 55, strength: 65, category: "seasonal", blurb: "Saffron lamp" },
  { id: "thanksgiving",   label: "Thanksgiving",   hue: 18,  saturation: 65, lightness: 44, strength: 60, category: "seasonal", blurb: "Burnt sienna" },
  { id: "hanukkah",       label: "Hanukkah",       hue: 215, saturation: 80, lightness: 48, strength: 64, category: "seasonal", blurb: "Royal blue & silver" },
  { id: "christmas",      label: "Christmas",      hue: 0,   saturation: 78, lightness: 48, strength: 62, category: "seasonal", blurb: "Christmas red" },
  { id: "winter",         label: "Winter",         hue: 200, saturation: 50, lightness: 60, strength: 50, category: "seasonal", blurb: "Frost glow" },
];

/**
 * The standard palettes (always shown). Convenience accessor so
 * callers can render the picker in two sections (standard / seasonal)
 * without recomputing on every render.
 */
export const STANDARD_PALETTES = THEME_PALETTES.filter(
  (p) => (p.category ?? "standard") === "standard"
);

/** The seasonal palettes (shown to signed-in users only). */
export const SEASONAL_PALETTES = THEME_PALETTES.filter(
  (p) => p.category === "seasonal"
);

export function findClosestPalette(hue: number, strength: number): string {
  let closest = "custom";
  let minDist = Infinity;

  for (const palette of THEME_PALETTES) {
    const hueDiff = Math.min(Math.abs(palette.hue - hue), 360 - Math.abs(palette.hue - hue));
    const strengthDiff = Math.abs(palette.strength - strength);
    const dist = hueDiff + strengthDiff * 0.5;
    if (dist < minDist && dist < 15) {
      minDist = dist;
      closest = palette.id;
    }
  }

  return closest;
}

function circularHueDiff(a: number, b: number) {
  return Math.min(Math.abs(a - b), 360 - Math.abs(a - b));
}

function paletteDistance(
  palette: ThemePalette,
  hue: number,
  saturation: number,
  lightness: number,
  strength: number
) {
  const hueDiff = circularHueDiff(palette.hue, hue);
  const saturationDiff = Math.abs(palette.saturation - saturation);
  const lightnessDiff = Math.abs(palette.lightness - lightness);
  const strengthDiff = Math.abs(palette.strength - strength);

  return hueDiff * 1.35 + saturationDiff * 0.85 + lightnessDiff * 0.85 + strengthDiff * 0.65;
}

export function findClosestPaletteByValues(
  hue: number,
  saturation: number,
  lightness: number,
  strength: number
): string {
  let closest = "custom";
  let minDist = Infinity;

  for (const palette of THEME_PALETTES) {
    const dist = paletteDistance(palette, hue, saturation, lightness, strength);
    if (dist < minDist) {
      minDist = dist;
      closest = palette.id;
    }
  }

  return minDist <= 18 ? closest : "custom";
}

export function paletteMatchesValues(
  paletteId: string,
  hue: number,
  saturation: number,
  lightness: number,
  strength: number
) {
  const palette = getPaletteById(paletteId);
  if (!palette) return false;

  return (
    circularHueDiff(palette.hue, hue) <= 2 &&
    Math.abs(palette.saturation - saturation) <= 3 &&
    Math.abs(palette.lightness - lightness) <= 3 &&
    Math.abs(palette.strength - strength) <= 3
  );
}

export function resolvePaletteSelection(
  paletteId: string | null | undefined,
  hue: number,
  saturation: number,
  lightness: number,
  strength: number
): string {
  const requested = paletteId?.trim() || null;

  if (requested === "custom") {
    return "custom";
  }

  if (requested && paletteMatchesValues(requested, hue, saturation, lightness, strength)) {
    return requested;
  }

  const matchedByValues = findClosestPaletteByValues(hue, saturation, lightness, strength);
  if (matchedByValues !== "custom") {
    return matchedByValues;
  }

  if (requested && getPaletteById(requested)) {
    return requested;
  }

  return "custom";
}

export function getPaletteValues(paletteId: string): { hue: number; strength: number } | null {
  const palette = THEME_PALETTES.find((p) => p.id === paletteId);
  return palette ? { hue: palette.hue, strength: palette.strength } : null;
}

export function getPaletteById(paletteId: string): ThemePalette | null {
  return THEME_PALETTES.find((p) => p.id === paletteId) ?? null;
}
