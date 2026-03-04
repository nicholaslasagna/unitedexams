"use client";

import Script from "next/script";
import { useEffect, useId, useMemo, useRef, useState } from "react";

type TurnstileTheme = "light" | "dark" | "auto";

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: string | HTMLElement,
        options: {
          sitekey: string;
          theme?: TurnstileTheme;
          action?: string;
          callback?: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
        }
      ) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId?: string) => void;
    };
  }
}

interface TurnstileWidgetProps {
  action:
    | "signup"
    | "login"
    | "forgot-password"
    | "reset-password"
    | "exam-start";
  theme?: TurnstileTheme;
  onToken: (token: string | null) => void;
}

export function TurnstileWidget({
  action,
  theme = "dark",
  onToken
}: TurnstileWidgetProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerId = useId().replace(/:/g, "");
  const widgetIdRef = useRef<string | null>(null);
  const [ready, setReady] = useState(false);

  const enabled = useMemo(() => Boolean(siteKey), [siteKey]);

  useEffect(() => {
    if (!enabled) return;
    if (!ready) return;
    if (!window.turnstile) return;
    if (widgetIdRef.current) return;

    widgetIdRef.current = window.turnstile.render(`#${containerId}`, {
      sitekey: siteKey as string,
      theme,
      action,
      callback: (token) => onToken(token),
      "error-callback": () => onToken(null),
      "expired-callback": () => onToken(null)
    });
  }, [action, containerId, enabled, onToken, ready, siteKey, theme]);

  useEffect(() => {
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="space-y-2">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />
      <div
        id={containerId}
        className="min-h-[64px] rounded-xl border border-borderc bg-soft px-2 py-2"
        aria-label="Human verification"
      />
      <p className="text-xs text-muted">
        Protected by Cloudflare Turnstile.
      </p>
    </div>
  );
}
