"use client";

import { useState } from "react";
import { Check, ChevronDown, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { THEME_PALETTES } from "@/lib/theme/palettes";
import { checkAccentContrast } from "@/lib/theme/contrast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ThemePalettePickerProps {
  palette: string;
  customHue: number;
  customStrength: number;
  isDark: boolean;
  onPaletteChange: (paletteId: string) => void;
  onCustomChange: (hue: number, strength: number) => void;
}

export function ThemePalettePicker({
  palette,
  customHue,
  customStrength,
  isDark,
  onPaletteChange,
  onCustomChange,
}: ThemePalettePickerProps) {
  const [showCustom, setShowCustom] = useState(palette === "custom");

  const activeHue = palette === "custom" ? customHue : (THEME_PALETTES.find((p) => p.id === palette)?.hue ?? 265);

  const contrastCheck = palette === "custom"
    ? checkAccentContrast(customHue, isDark ? 72 + customStrength * 0.2 : 72, isDark ? 64 + customStrength * 0.08 : 50, isDark)
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
                style={{ background: `hsl(${p.hue}, 72%, ${isDark ? 64 : 50}%)` }}
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
              onChange={(e) => onCustomChange(Number(e.target.value), customStrength)}
              className="w-full accent-[hsl(var(--accent))]"
              style={{
                background: `linear-gradient(to right, hsl(0,72%,50%), hsl(60,72%,50%), hsl(120,72%,50%), hsl(180,72%,50%), hsl(240,72%,50%), hsl(300,72%,50%), hsl(359,72%,50%))`
              }}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="custom-strength" className="text-xs font-semibold text-text">Strength</label>
              <span className="font-mono text-xs text-muted">{customStrength}%</span>
            </div>
            <input
              id="custom-strength"
              type="range"
              min={0}
              max={100}
              value={customStrength}
              onChange={(e) => onCustomChange(customHue, Number(e.target.value))}
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
                style={{ background: `hsl(${activeHue}, 72%, ${isDark ? 64 : 50}%)` }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
