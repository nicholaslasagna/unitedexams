export interface ThemePalette {
  id: string;
  label: string;
  hue: number;
  strength: number;
}

export const THEME_PALETTES: ThemePalette[] = [
  { id: "violet",  label: "Violet",  hue: 265, strength: 60 },
  { id: "indigo",  label: "Indigo",  hue: 235, strength: 65 },
  { id: "blue",    label: "Blue",    hue: 220, strength: 55 },
  { id: "teal",    label: "Teal",    hue: 175, strength: 50 },
  { id: "emerald", label: "Emerald", hue: 155, strength: 55 },
  { id: "amber",   label: "Amber",   hue: 35,  strength: 60 },
  { id: "rose",    label: "Rose",    hue: 345, strength: 55 },
  { id: "crimson", label: "Crimson", hue: 0,   strength: 60 },
  { id: "slate",   label: "Slate",   hue: 220, strength: 10 },
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
