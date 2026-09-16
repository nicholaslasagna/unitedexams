"use client";

import { useEffect } from "react";

/**
 * Lightweight gamepad mapping for Exam 1 screens.
 *
 * The rest of United Exams is pointer/keyboard-first; this keeps the Exam 1
 * labs and sessions usable with a controller without inventing a parallel UI:
 * A confirms the focused control, B cancels, D-pad moves focus.
 */

function focusableElements(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )].filter((element) => {
    if (element.closest("[hidden]")) return false;
    const style = window.getComputedStyle(element);
    if (style.visibility === "hidden" || style.display === "none") return false;
    return element.getClientRects().length > 0;
  });
}

function moveFocus(delta: number) {
  const nodes = focusableElements();
  if (nodes.length === 0) return;
  const active = document.activeElement as HTMLElement | null;
  const current = active ? nodes.indexOf(active) : -1;
  const next = nodes[(current + delta + nodes.length) % nodes.length];
  next?.focus();
}

export function useExamGamepad({
  onConfirm,
  onCancel,
  enabled = true
}: {
  onConfirm?: () => void;
  onCancel?: () => void;
  enabled?: boolean;
}) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !navigator.getGamepads) return;

    let frame = 0;
    const previous = new Array<boolean>(16).fill(false);

    const poll = () => {
      const pad = navigator.getGamepads()[0];
      if (pad) {
        const pressed = pad.buttons.map((button) => button.pressed);
        const just = (index: number) => pressed[index] && !previous[index];

        if (just(0)) {
          const active = document.activeElement as HTMLElement | null;
          if (active && (active.tagName === "BUTTON" || active.tagName === "A")) {
            active.click();
          } else {
            onConfirm?.();
          }
        }
        if (just(1)) onCancel?.();
        if (just(12)) moveFocus(-1);
        if (just(13)) moveFocus(1);
        if (just(14)) moveFocus(-1);
        if (just(15)) moveFocus(1);

        for (let i = 0; i < 16; i += 1) previous[i] = Boolean(pressed[i]);
      }
      frame = window.requestAnimationFrame(poll);
    };

    frame = window.requestAnimationFrame(poll);
    return () => window.cancelAnimationFrame(frame);
  }, [enabled, onCancel, onConfirm]);
}
