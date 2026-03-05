"use client";

import Script from "next/script";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { getTurnstileSiteKeyClient } from "@/lib/security/turnstile-client";

type TurnstileTheme = "light" | "dark" | "auto";

declare global {
  interface Window {
    __UE_TURNSTILE_SITE_KEY?: string;
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
  describedBy?: string;
}

type ScriptState = "loading" | "ready" | "error";

export function TurnstileWidget({
  action,
  theme = "dark",
  onToken,
  describedBy
}: TurnstileWidgetProps) {
  const siteKey = getTurnstileSiteKeyClient();
  const containerId = useId().replace(/:/g, "");
  const helperId = `${containerId}-helper`;
  const labelId = `${containerId}-label`;
  const widgetIdRef = useRef<string | null>(null);
  const [scriptState, setScriptState] = useState<ScriptState>(() => {
    if (typeof window !== "undefined" && window.turnstile) return "ready";
    return "loading";
  });
  const [scriptRetryKey, setScriptRetryKey] = useState(0);
  const [slowLoad, setSlowLoad] = useState(false);

  const enabled = useMemo(() => Boolean(siteKey), [siteKey]);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;
    if (window.turnstile) setScriptState("ready");
  }, [enabled, scriptRetryKey]);

  useEffect(() => {
    if (!enabled) return;
    if (scriptState !== "loading") {
      setSlowLoad(false);
      return;
    }

    const timer = window.setTimeout(() => setSlowLoad(true), 2500);
    return () => window.clearTimeout(timer);
  }, [enabled, scriptState]);

  useEffect(() => {
    if (!enabled) return;
    if (scriptState !== "ready") return;
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
  }, [action, containerId, enabled, onToken, scriptState, siteKey, theme]);

  useEffect(() => {
    if (scriptState === "ready") return;
    onToken(null);
  }, [onToken, scriptState]);

  useEffect(() => {
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, []);

  if (!enabled) return null;

  const retryLoad = () => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.remove(widgetIdRef.current);
    }
    widgetIdRef.current = null;
    onToken(null);
    setSlowLoad(false);
    setScriptState("loading");
    setScriptRetryKey((value) => value + 1);
  };

  return (
    <div
      className="space-y-2"
      role="group"
      aria-labelledby={labelId}
      aria-describedby={describedBy ? `${helperId} ${describedBy}` : helperId}
      data-captcha-provider="turnstile"
    >
      <Script
        key={`turnstile-script-${scriptRetryKey}`}
        src={`https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&retry=${scriptRetryKey}`}
        strategy="afterInteractive"
        onLoad={() => {
          window.setTimeout(() => {
            const nextState = typeof window !== "undefined" && window.turnstile ? "ready" : "error";
            setScriptState(nextState);
          }, 0);
        }}
        onError={() => setScriptState("error")}
      />
      <p id={labelId} className="sr-only">
        Human verification challenge
      </p>
      <div
        id={containerId}
        className="min-h-[64px] rounded-xl border border-borderc bg-soft px-2 py-2 focus-within:ring-2 focus-within:ring-accent/60"
        aria-label="Human verification"
      />
      {scriptState === "error" ? (
        <div className="space-y-2">
          <p id={helperId} className="text-xs text-warn" role="alert">
            Verification failed to load. Check blockers/network and retry.
          </p>
          <Button type="button" variant="secondary" size="sm" onClick={retryLoad}>
            Retry verification
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <p id={helperId} className="text-xs text-muted" role="status" aria-live="polite">
            {scriptState === "loading"
              ? slowLoad
                ? "Loading verification challenge... if it does not appear, retry."
                : "Loading verification challenge..."
              : "Protected by Cloudflare Turnstile."}
          </p>
          {scriptState === "loading" && slowLoad ? (
            <Button type="button" variant="secondary" size="sm" onClick={retryLoad}>
              Reload verification
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
