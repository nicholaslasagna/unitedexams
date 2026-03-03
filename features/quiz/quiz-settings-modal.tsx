"use client";

import { useState } from "react";
import { useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { QuizSettings } from "@/lib/types";

interface QuizSettingsModalProps {
  open: boolean;
  initial: QuizSettings;
  onClose: () => void;
  onConfirm: (settings: QuizSettings) => void;
}

export function QuizSettingsModal({ open, initial, onClose, onConfirm }: QuizSettingsModalProps) {
  const [settings, setSettings] = useState<QuizSettings>(initial);

  useEffect(() => {
    if (open) {
      setSettings(initial);
    }
  }, [open, initial]);

  return (
    <Modal open={open} onClose={onClose} title="Quiz Settings">
      <div className="space-y-6">
        <div className="rounded-xl border border-borderc bg-soft p-4">
          <label className="flex items-center justify-between gap-3">
            <span>
              <span className="block text-sm font-semibold text-text">Timed mode</span>
              <span className="text-xs text-muted">Enable countdown timer during the attempt.</span>
            </span>
            <input
              type="checkbox"
              className="h-4 w-4 accent-[hsl(var(--brand-2))]"
              checked={settings.timed}
              onChange={(event) => setSettings((prev) => ({ ...prev, timed: event.target.checked }))}
            />
          </label>

          <div className="mt-3">
            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted">Timer (minutes)</label>
            <input
              type="number"
              min={5}
              max={120}
              value={settings.timerMinutes}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  timerMinutes: Math.min(120, Math.max(5, Number(event.target.value || 0)))
                }))
              }
              className="mt-1 h-10 w-full rounded-lg border border-borderc bg-surface px-3 text-sm"
              disabled={!settings.timed}
            />
          </div>
        </div>

        <div className="rounded-xl border border-borderc bg-soft p-4">
          <label className="flex items-center justify-between gap-3">
            <span>
              <span className="block text-sm font-semibold text-text">Randomize question order</span>
              <span className="text-xs text-muted">Useful for retakes and spaced repetition.</span>
            </span>
            <input
              type="checkbox"
              className="h-4 w-4 accent-[hsl(var(--brand-2))]"
              checked={settings.randomizeQuestions}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  randomizeQuestions: event.target.checked
                }))
              }
            />
          </label>
        </div>

        <div className="rounded-xl border border-borderc bg-soft p-4">
          <p className="text-sm font-semibold text-text">Explanation timing</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              className={`rounded-lg border px-3 py-2 text-sm ${
                settings.explanationMode === "afterEach"
                  ? "border-brand-2/60 bg-brand-2/10 text-text"
                  : "border-borderc text-muted"
              }`}
              onClick={() => setSettings((prev) => ({ ...prev, explanationMode: "afterEach" }))}
            >
              After each question
            </button>
            <button
              type="button"
              className={`rounded-lg border px-3 py-2 text-sm ${
                settings.explanationMode === "end"
                  ? "border-brand-2/60 bg-brand-2/10 text-text"
                  : "border-borderc text-muted"
              }`}
              onClick={() => setSettings((prev) => ({ ...prev, explanationMode: "end" }))}
            >
              End of quiz only
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm(settings);
              onClose();
            }}
          >
            Save settings
          </Button>
        </div>
      </div>
    </Modal>
  );
}
