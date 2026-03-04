"use client";

import { useState } from "react";
import { Check, ChevronDown, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { THEME_PALETTES } from "@/lib/theme/palettes";
import { checkAccentContrast } from "@/lib/theme/contrast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function hslToHex(h: number, s: number, l: number) {
  const sat = s / 100;
  const lit = l / 100;
  const c = (1 - Math.abs(2 * lit - 1)) * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lit - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (value: number) =>
    Math.round((value + m) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToHue(hex: string) {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return 265;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  if (delta === 0) return 265;
  let hue = 0;
  if (max === r) hue = ((g - b) / delta) % 6;
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;
  return Math.round(((hue * 60) + 360) % 360);
}

interface ThemePalettePickerProps {
  palette: string;
  customHue: number;
  customSaturation: number;
  customLightness: number;
  customStrength: number;
  isDark: boolean;
  onPaletteChange: (paletteId: string) => void;
  onCustomChange: (next: {
    hue: number;
    saturation: number;
    lightness: number;
    strength: number;
  }) => void;
}

export function ThemePalettePicker({
  palette,
  customHue,
  customSaturation,
  customLightness,
  customStrength,
  isDark,
  onPaletteChange,
  onCustomChange,
}: ThemePalettePickerProps) {
  const [showCustom, setShowCustom] = useState(palette === "custom");

  const activePalette = THEME_PALETTES.find((p) => p.id === palette);
  const activeHue = palette === "custom" ? customHue : (activePalette?.hue ?? 265);
  const activeSaturation = palette === "custom" ? customSaturation : (activePalette?.saturation ?? 72);
  const activeLightness = palette === "custom" ? customLightness : (activePalette?.lightness ?? (isDark ? 62 : 50));

  const contrastCheck = palette === "custom"
    ? checkAccentContrast(customHue, customSaturation, customLightness, isDark)
    : null;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-text">Accent color</p>
        <p className="mt-0.5 text-xs text-muted">Choose a palette or pick a custom color.</p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {THEME_PALETTES.map((p) => {
          const isActive = palette === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                onPaletteChange(p.id);
                setShowCustom(false);
              }}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-colors duration-150",
                isActive
                  ? "border-accent bg-accent-subtle"
                  : "border-borderc bg-soft hover:bg-overlay"
              )}
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full shadow-subtle"
                style={{ background: `hsl(${p.hue}, ${p.saturation}%, ${p.lightness}%)` }}
              >
                {isActive ? <Check className="h-4 w-4 text-white" /> : null}
              </span>
              <span className="text-[11px] font-medium text-muted">{p.label}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => {
          setShowCustom(!showCustom);
          if (!showCustom && palette !== "custom") {
            onPaletteChange("custom");
          }
        }}
        className="flex w-full items-center justify-between rounded-xl border border-borderc bg-soft px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-overlay hover:text-text"
      >
        <span>Custom color</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", showCustom && "rotate-180")} />
      </button>

      {showCustom ? (
        <div className="space-y-3 rounded-xl border border-borderc bg-soft p-4">
          <div className="flex items-center justify-between rounded-lg border border-borderc bg-surface px-3 py-2">
            <label htmlFor="custom-color" className="text-xs font-semibold text-text">
              Color picker
            </label>
            <input
              id="custom-color"
              type="color"
              value={hslToHex(customHue, customSaturation, customLightness)}
              onChange={(event) =>
                onCustomChange({
                  hue: hexToHue(event.target.value),
                  saturation: customSaturation,
                  lightness: customLightness,
                  strength: customStrength
                })
              }
              className="h-8 w-10 cursor-pointer rounded border border-borderc bg-transparent p-0"
              aria-label="Pick custom accent color"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="custom-hue" className="text-xs font-semibold text-text">Hue</label>
              <span className="font-mono text-xs text-muted">{customHue}°</span>
            </div>
            <input
              id="custom-hue"
              type="range"
              min={0}
              max={359}
              value={customHue}
              onChange={(e) =>
                onCustomChange({
                  hue: Number(e.target.value),
                  saturation: customSaturation,
                  lightness: customLightness,
                  strength: customStrength
                })
              }
              className="w-full accent-[hsl(var(--accent))]"
              style={{
                background: `linear-gradient(to right, hsl(0,72%,50%), hsl(60,72%,50%), hsl(120,72%,50%), hsl(180,72%,50%), hsl(240,72%,50%), hsl(300,72%,50%), hsl(359,72%,50%))`
              }}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="custom-saturation" className="text-xs font-semibold text-text">Saturation</label>
              <span className="font-mono text-xs text-muted">{customSaturation}%</span>
            </div>
            <input
              id="custom-saturation"
              type="range"
              min={38}
              max={88}
              value={customSaturation}
              onChange={(e) =>
                onCustomChange({
                  hue: customHue,
                  saturation: Number(e.target.value),
                  lightness: customLightness,
                  strength: customStrength
                })
              }
              className="w-full accent-[hsl(var(--accent))]"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="custom-lightness" className="text-xs font-semibold text-text">Lightness</label>
              <span className="font-mono text-xs text-muted">{customLightness}%</span>
            </div>
            <input
              id="custom-lightness"
              type="range"
              min={38}
              max={76}
              value={customLightness}
              onChange={(e) =>
                onCustomChange({
                  hue: customHue,
                  saturation: customSaturation,
                  lightness: Number(e.target.value),
                  strength: customStrength
                })
              }
              className="w-full accent-[hsl(var(--accent))]"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="custom-strength" className="text-xs font-semibold text-text">Intensity</label>
              <span className="font-mono text-xs text-muted">{customStrength}%</span>
            </div>
            <input
              id="custom-strength"
              type="range"
              min={0}
              max={100}
              value={customStrength}
              onChange={(e) =>
                onCustomChange({
                  hue: customHue,
                  saturation: customSaturation,
                  lightness: customLightness,
                  strength: Number(e.target.value)
                })
              }
              className="w-full accent-[hsl(var(--accent))]"
            />
          </div>

          {contrastCheck && !contrastCheck.passes ? (
            <div className="flex items-center gap-2 rounded-lg border border-warn/30 bg-warn/10 px-3 py-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-warn" />
              <p className="text-xs text-warn">
                Low contrast ({contrastCheck.ratio.toFixed(1)}:1). Consider adjusting for accessibility.
              </p>
            </div>
          ) : null}

          <div className="rounded-xl border border-borderc bg-surface p-3">
            <p className="mb-2 text-xs font-semibold text-muted">Preview</p>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm">Primary</Button>
              <Button variant="secondary" size="sm">Secondary</Button>
              <Badge tone="accent">Accent</Badge>
              <span
                className="h-6 w-6 rounded-full shadow-subtle"
                style={{ background: `hsl(${activeHue}, ${activeSaturation}%, ${activeLightness}%)` }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
