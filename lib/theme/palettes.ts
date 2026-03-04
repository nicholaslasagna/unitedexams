export interface ThemePalette {
  id: string;
  label: string;
  hue: number;
  saturation: number;
  lightness: number;
  strength: number;
}

export const THEME_PALETTES: ThemePalette[] = [
  { id: "amethyst", label: "Amethyst", hue: 265, saturation: 72, lightness: 62, strength: 60 },
  { id: "nebula", label: "Nebula", hue: 248, saturation: 68, lightness: 60, strength: 56 },
  { id: "aurora", label: "Aurora", hue: 198, saturation: 72, lightness: 56, strength: 58 },
  { id: "indigo", label: "Indigo", hue: 232, saturation: 70, lightness: 57, strength: 62 },
  { id: "rose", label: "Rose", hue: 338, saturation: 74, lightness: 58, strength: 60 },
  { id: "emerald", label: "Emerald", hue: 152, saturation: 62, lightness: 50, strength: 54 },
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
