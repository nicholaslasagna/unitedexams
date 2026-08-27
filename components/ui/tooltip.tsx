"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState
} from "react";
import type {
  CSSProperties,
  KeyboardEvent,
  ReactElement,
  ReactNode
} from "react";
import { cn } from "@/lib/utils";

/**
 * Tooltip — accessible, dependency-free hover + focus tooltip.
 *
 * Why hand-rolled vs. Radix: we don't use Radix anywhere else in the
 * codebase. A small bespoke component keeps the bundle lean and makes
 * the editorial styling consistent with the rest of the site (hairline
 * border, surface fill, mono caption font).
 *
 * Behavior:
 *   - Shown on `pointerenter` (mouse) AND on `focus` (keyboard).
 *     Hidden on `pointerleave` / `blur`.
 *   - Esc closes the tooltip while it has focus.
 *   - Touch devices: a tap toggles it open; another tap or a tap
 *     outside closes it.
 *   - The `delay` prop debounces hover open so accidental cursor
 *     passes don't flash tooltips on every list item.
 *   - Position is computed once when shown and stays fixed; if the
 *     trigger scrolls, the tooltip closes (better than the tooltip
 *     visibly tracking the trigger and looking jittery).
 *   - Auto-flips above the trigger if there isn't room below.
 *
 * Wrap any focusable element:
 *
 *   <Tooltip content="Adds mistake history & smart review">
 *     <button>Mastery analytics</button>
 *   </Tooltip>
 */
export function Tooltip({
  content,
  children,
  delay = 200,
  side = "auto",
  className
}: {
  /** Tooltip text or richer ReactNode (kept short — one or two sentences). */
  content: ReactNode;
  /** A single focusable child the tooltip is anchored to. */
  children: ReactElement;
  /** Hover-open debounce, ms. Default 200ms. */
  delay?: number;
  /** Force a side or let it auto-flip. */
  side?: "top" | "bottom" | "auto";
  /** Optional className for the bubble. */
  className?: string;
}) {
  const tooltipId = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const showTimer = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    placement: "top" | "bottom";
  } | null>(null);

  // Cancel any pending open when unmounting.
  useEffect(() => {
    return () => {
      if (showTimer.current !== null) {
        window.clearTimeout(showTimer.current);
      }
    };
  }, []);

  // Compute position once when open. If the user scrolls, close (avoids
  // the tooltip lagging behind the trigger which always looks broken).
  useEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    const trigger = triggerRef.current;
    const bubble = bubbleRef.current;
    if (!trigger || !bubble) return;

    const place = () => {
      const rect = trigger.getBoundingClientRect();
      const bubbleRect = bubble.getBoundingClientRect();
      const margin = 8;
      const wantsBottom = side === "bottom";
      const wantsTop = side === "top";
      const fitsBelow = rect.bottom + bubbleRect.height + margin < window.innerHeight;
      const placement: "top" | "bottom" =
        wantsTop ? "top" : wantsBottom ? "bottom" : fitsBelow ? "bottom" : "top";

      // Horizontally center on trigger, but keep within a small inset
      // of the viewport edges.
      const inset = 8;
      const desiredLeft = rect.left + rect.width / 2 - bubbleRect.width / 2;
      const left = Math.max(
        inset,
        Math.min(desiredLeft, window.innerWidth - bubbleRect.width - inset)
      );
      const top =
        placement === "bottom" ? rect.bottom + margin : rect.top - bubbleRect.height - margin;

      setPosition({ top, left, placement });
    };

    place();

    // Close on scroll/resize so we don't render a stale position.
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open, side]);

  // Esc-to-close while focused.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Tap-outside on touch devices.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const trigger = triggerRef.current;
      const bubble = bubbleRef.current;
      if (!trigger || !bubble) return;
      const target = event.target as Node | null;
      if (target && (trigger.contains(target) || bubble.contains(target))) return;
      setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const scheduleOpen = () => {
    if (showTimer.current !== null) window.clearTimeout(showTimer.current);
    showTimer.current = window.setTimeout(() => setOpen(true), delay);
  };
  const cancelOpen = () => {
    if (showTimer.current !== null) {
      window.clearTimeout(showTimer.current);
      showTimer.current = null;
    }
  };

  if (!isValidElement(children)) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Tooltip expects a single React element child.");
    }
    return children as ReactElement | null;
  }

  type ChildProps = {
    onPointerEnter?: (e: React.PointerEvent) => void;
    onPointerLeave?: (e: React.PointerEvent) => void;
    onFocus?: (e: React.FocusEvent) => void;
    onBlur?: (e: React.FocusEvent) => void;
    onClick?: (e: React.MouseEvent) => void;
    onKeyDown?: (e: KeyboardEvent) => void;
    "aria-describedby"?: string;
    ref?: React.Ref<HTMLElement>;
  };
  const child = children as ReactElement<ChildProps>;

  const trigger = cloneElement(child, {
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;
      // Forward any ref the caller put on the child. In React 19 `ref` is a
      // regular prop; reading `element.ref` is removed and warns at runtime.
      const childRef = (child.props as { ref?: React.Ref<HTMLElement> }).ref;
      if (typeof childRef === "function") childRef(node);
      else if (childRef && typeof childRef === "object") {
        (childRef as React.MutableRefObject<HTMLElement | null>).current = node;
      }
    },
    onPointerEnter: (e: React.PointerEvent) => {
      child.props.onPointerEnter?.(e);
      // Pointer type "mouse" → debounce; "touch" → toggle on click.
      if (e.pointerType === "mouse") scheduleOpen();
    },
    onPointerLeave: (e: React.PointerEvent) => {
      child.props.onPointerLeave?.(e);
      cancelOpen();
      setOpen(false);
    },
    onFocus: (e: React.FocusEvent) => {
      child.props.onFocus?.(e);
      setOpen(true);
    },
    onBlur: (e: React.FocusEvent) => {
      child.props.onBlur?.(e);
      setOpen(false);
    },
    onClick: (e: React.MouseEvent) => {
      child.props.onClick?.(e);
      // Touch: toggle open on tap. We can detect by pointerType being
      // empty here; do a permissive toggle which doesn't hurt mouse
      // users either (they keep the hover-driven flow).
      setOpen((prev) => !prev);
    },
    "aria-describedby": open ? tooltipId : undefined
  });

  const bubbleStyle: CSSProperties | undefined = position
    ? { position: "fixed", top: position.top, left: position.left, zIndex: 80 }
    : { position: "fixed", visibility: "hidden", top: 0, left: 0, zIndex: 80 };

  return (
    <>
      {trigger}
      {open ? (
        <div
          ref={bubbleRef}
          id={tooltipId}
          role="tooltip"
          style={bubbleStyle}
          className={cn(
            "pointer-events-none max-w-[280px] rounded-lg border border-borderc",
            "bg-surface px-3 py-2 text-[12px] leading-snug text-text shadow-elevated",
            "animate-fade-rise",
            className
          )}
        >
          {content}
        </div>
      ) : null}
    </>
  );
}
