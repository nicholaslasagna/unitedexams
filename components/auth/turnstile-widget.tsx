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

// Tuning
const SLOW_LOAD_MS = 3500;        // when to show "still loading" hint
const HARD_FAIL_MS = 15000;       // when to give up and offer a full reload

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

  /*
   * Hold the latest `onToken` callback in a ref so we don't list it as
   * a useEffect dependency. Otherwise any parent re-render that passes
   * a fresh function reference would re-run our render/cleanup effects
   * and could remount the iframe — on slow mobile this stacks up to a
   * multi-minute freeze.
   */
  const onTokenRef = useRef(onToken);
  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  const widgetIdRef = useRef<string | null>(null);
  const [scriptState, setScriptState] = useState<ScriptState>(() => {
    if (typeof window !== "undefined" && window.turnstile) return "ready";
    return "loading";
  });
  const [scriptRetryKey, setScriptRetryKey] = useState(0);
  const [slowLoad, setSlowLoad] = useState(false);
  const [hardFail, setHardFail] = useState(false);

  const enabled = useMemo(() => Boolean(siteKey), [siteKey]);

  // If the script was already loaded by a previous mount, jump straight to ready.
  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;
    if (window.turnstile) setScriptState("ready");
  }, [enabled, scriptRetryKey]);

  /*
   * Slow-load + hard-fail timers. The hard-fail timer is what saves the
   * mobile-freeze case: after 15s the widget surfaces a clean "couldn't
   * load — reload page" path instead of leaving the user stuck.
   */
  useEffect(() => {
    if (!enabled) return;
    if (scriptState !== "loading") {
      setSlowLoad(false);
      setHardFail(false);
      return;
    }
    const slow = window.setTimeout(() => setSlowLoad(true), SLOW_LOAD_MS);
    const hard = window.setTimeout(() => setHardFail(true), HARD_FAIL_MS);
    return () => {
      window.clearTimeout(slow);
      window.clearTimeout(hard);
    };
  }, [enabled, scriptState, scriptRetryKey]);

  // Render the Turnstile widget once the script is ready.
  // Note: `onToken` is intentionally NOT in the dependency array — see ref above.
  useEffect(() => {
    if (!enabled) return;
    if (scriptState !== "ready") return;
    if (!window.turnstile) return;
    if (widgetIdRef.current) return;

    try {
      widgetIdRef.current = window.turnstile.render(`#${containerId}`, {
        sitekey: siteKey as string,
        theme,
        action,
        callback: (token) => onTokenRef.current?.(token),
        "error-callback": () => onTokenRef.current?.(null),
        "expired-callback": () => onTokenRef.current?.(null)
      });
    } catch {
      // Defensive: a corrupt or detached iframe can throw on render.
      // Surface the error state instead of letting React's commit phase crash.
      setScriptState("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, containerId, enabled, scriptState, siteKey, theme]);

  // Reset the upstream token whenever we leave the "ready" state.
  // Single-shot per state transition — no parent-callback dependency.
  useEffect(() => {
    if (scriptState === "ready") return;
    onTokenRef.current?.(null);
  }, [scriptState]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // best-effort; we're going away anyway.
        }
      }
      widgetIdRef.current = null;
    };
  }, []);

  if (!enabled) return null;

  const retryLoad = () => {
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {
        /* ignore */
      }
    }
    widgetIdRef.current = null;
    onTokenRef.current?.(null);
    setSlowLoad(false);
    setHardFail(false);
    setScriptState("loading");
    setScriptRetryKey((value) => value + 1);
  };

  const reloadPage = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  const showFailUi = scriptState === "error" || hardFail;

  return (
    <div
      className="space-y-2"
      role="group"
      aria-labelledby={labelId}
      aria-describedby={describedBy ? `${helperId} ${describedBy}` : helperId}
      data-captcha-provider="turnstile"
    >
      {/*
       * lazyOnload defers the Cloudflare bundle until after the page is
       * interactive — critical on mobile where afterInteractive often
       * collides with hydration on a busy main thread.
       */}
      <Script
        key={`turnstile-script-${scriptRetryKey}`}
        src={`https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&_r=${scriptRetryKey}`}
        strategy="lazyOnload"
        onLoad={() => {
          // Defer one tick so window.turnstile has a chance to attach.
          window.setTimeout(() => {
            const nextState =
              typeof window !== "undefined" && window.turnstile ? "ready" : "error";
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
      {showFailUi ? (
        <div className="space-y-2">
          <p id={helperId} className="text-xs text-warn" role="alert">
            {hardFail
              ? "Verification didn't load. Try again or reload the page."
              : "Verification failed to load. Check blockers / network and retry."}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={retryLoad}>
              Retry verification
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={reloadPage}>
              Reload page
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p id={helperId} className="text-xs text-muted" role="status" aria-live="polite">
            {scriptState === "loading"
              ? slowLoad
                ? "Verification is taking a moment. If it doesn't appear, retry."
                : "Loading verification…"
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
