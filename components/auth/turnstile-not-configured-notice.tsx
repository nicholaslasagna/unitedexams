"use client";

import { useEffect } from "react";

/**
 * Renders nothing, and logs once, when the Turnstile site key is absent.
 *
 * The auth screens used to show the reader a warning naming
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY and telling them to redeploy. That is not
 * a thing a student resetting their password can do anything about, it
 * exposes internal configuration, and the instructions pointed at a hosting
 * platform this project does not use. The form works without the key, so
 * there is nothing to tell the user - only someone with deploy access.
 */
export function TurnstileNotConfiguredNotice() {
  useEffect(() => {
    console.warn(
      "[auth] Human verification is disabled: NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set."
    );
  }, []);

  return null;
}
