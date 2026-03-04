export interface ThemePalette {
  id: string;
  label: string;
  hue: number;
  saturation: number;
  lightness: number;
  strength: number;
}

export const THEME_PALETTES: ThemePalette[] = [
  // Purple family
  { id: "amethyst",  label: "Amethyst",  hue: 265, saturation: 72, lightness: 62, strength: 60 },
  { id: "nebula",    label: "Nebula",    hue: 248, saturation: 68, lightness: 60, strength: 56 },
  { id: "lavender",  label: "Lavender",  hue: 280, saturation: 60, lightness: 68, strength: 52 },
  // Blue family
  { id: "indigo",    label: "Indigo",    hue: 232, saturation: 70, lightness: 57, strength: 62 },
  { id: "aurora",    label: "Aurora",    hue: 198, saturation: 72, lightness: 56, strength: 58 },
  { id: "midnight",  label: "Midnight",  hue: 220, saturation: 65, lightness: 42, strength: 70 },
  // Warm family
  { id: "rose",      label: "Rose",      hue: 338, saturation: 74, lightness: 58, strength: 60 },
  { id: "coral",     label: "Coral",     hue: 12,  saturation: 80, lightness: 58, strength: 58 },
  { id: "amber",     label: "Amber",     hue: 38,  saturation: 92, lightness: 50, strength: 56 },
  // Green family
  { id: "emerald",   label: "Emerald",   hue: 152, saturation: 62, lightness: 50, strength: 54 },
  { id: "sage",      label: "Sage",      hue: 140, saturation: 30, lightness: 52, strength: 44 },
  // Neutral
  { id: "slate",     label: "Slate",     hue: 215, saturation: 20, lightness: 52, strength: 40 },
];

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

export function getPaletteValues(paletteId: string): { hue: number; strength: number } | null {
  const palette = THEME_PALETTES.find((p) => p.id === paletteId);
  return palette ? { hue: palette.hue, strength: palette.strength } : null;
}

export function getPaletteById(paletteId: string): ThemePalette | null {
  return THEME_PALETTES.find((p) => p.id === paletteId) ?? null;
}
