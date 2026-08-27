import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Bricolage_Grotesque, Outfit, Fira_Code, Fraunces } from "next/font/google";
import { Providers } from "@/app/providers";
import { SkipLink } from "@/components/ui/skip-link";
import "@/app/globals.css";

// Body / UI: Outfit — clean, neutral sans for everything functional.
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

// Display: Fraunces — variable editorial serif with real personality.
// Used on design-led sites (Apple, Stripe-quality publications) where the
// goal is "considered, not generic SaaS." We use it for hero + section
// titles only; body stays in Outfit to keep things readable on small
// screens.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  // Pull a few stylistic axes that give Fraunces its character.
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap"
});

const firaCode = Fira_Code({ subsets: ["latin"], variable: "--font-mono" });

// Wordmark display: Bricolage Grotesque — variable Google font with
// real editorial character (slight angled terminals, optical-size
// variation). Pairs cleanly with Fraunces italics on the same line:
// the heavy geometric body next to the calligraphic accent reads as
// "designed publication," not "default Tailwind sans."
//
// We pull the wider weight band (500–800) plus the optical-size axis
// so the wordmark uses the display-optical-size cut at huge sizes and
// nav cuts at small sizes. The variable name stays --font-rodin so
// existing CSS (homepage hero, section headings, auth shell, sidebar)
// keeps working without touching dozens of call sites.
const rodin = Bricolage_Grotesque({
  subsets: ["latin"],
  // Variable font: omit `weight` and let next/font expose the full
  // 500-800 axis. Adding `axes: ["opsz"]` would conflict with an
  // explicit weight per next/font's loader rules, so we just use the
  // default variable axes (weight + opsz both come along).
  variable: "--font-rodin",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://unitedexams.com"),
  title: {
    default: "United Exams",
    template: "%s | United Exams"
  },
  description:
    "Course hubs for the classes you are actually taking: quiz banks, step-by-step walkthroughs, timed exam simulations, and notes, all kept inside the course they belong to.",
  openGraph: {
    title: "United Exams",
    description: "Quiz banks, walkthroughs, and timed exam simulations, kept inside the class they belong to.",
    type: "website"
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" }
    ],
    shortcut: "/favicon.ico",
    apple: "/icon.svg"
  }
};

// Bootstrap script — runs synchronously before React hydrates so the
// theme is correct at first paint (no flash of unstyled background).
//
// Behaviour:
//   - Logged-in user (Supabase auth cookie present): read the saved
//     preferences from localStorage and apply them immediately.
//   - Guest (no auth cookie): IGNORE any stored preferences and apply
//     the defaults. This kills the bug where a previous user's accent
//     colour bleeds through after they sign out — guests should always
//     see the default United Exams palette and dark theme. We also
//     proactively clear the stored prefs / profile so the next mount
//     can't accidentally pick them up either.
//
// Auth detection: @supabase/ssr writes a cookie named
// `sb-<project-ref>-auth-token` when a session exists. The presence
// of that cookie pattern is the most reliable synchronous signal that
// the user is authenticated.
const themeBootScript = `
(function () {
  try {
    var hasAuthCookie = /(?:^|;\\s*)sb-[A-Za-z0-9_-]+-auth-token=/.test(document.cookie || '');

    // Defaults — match THEME_DEFAULTS in lib/theme/defaults.ts.
    var DEFAULT_THEME = 'dark';
    var DEFAULT_HUE = 38;
    var DEFAULT_SAT = 92;
    var DEFAULT_LIT = 50;
    var DEFAULT_STR = 56;

    var theme = DEFAULT_THEME;
    var reduced = false;
    var accentHue = DEFAULT_HUE;
    var accentSaturation = DEFAULT_SAT;
    var accentLightness = DEFAULT_LIT;
    var accentStrength = DEFAULT_STR;

    if (hasAuthCookie) {
      var raw = localStorage.getItem('ue.preferences.v1');
      var prefs = raw ? JSON.parse(raw) : null;
      if (prefs) {
        if (prefs.theme) theme = prefs.theme;
        reduced = !!prefs.reducedMotion;
        if (typeof prefs.accentHue === 'number') accentHue = ((prefs.accentHue % 360) + 360) % 360;
        if (typeof prefs.accentSaturation === 'number') accentSaturation = Math.max(38, Math.min(95, prefs.accentSaturation));
        if (typeof prefs.accentLightness === 'number') accentLightness = Math.max(38, Math.min(76, prefs.accentLightness));
        if (typeof prefs.accentStrength === 'number') accentStrength = Math.max(0, Math.min(100, prefs.accentStrength));
      }
    } else {
      // Guest: ensure no stale prefs/profile leak across sessions.
      try {
        localStorage.removeItem('ue.preferences.v1');
        localStorage.removeItem('ue.profile.v1');
      } catch (_) { /* storage may be disabled */ }
    }

    var resolved = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    if (resolved === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = resolved;
    document.documentElement.dataset.reduceMotion = reduced ? 'on' : 'off';
    document.documentElement.style.setProperty('--accent-hue', String(accentHue));
    document.documentElement.style.setProperty('--accent-sat', String(accentSaturation));
    document.documentElement.style.setProperty('--accent-lit', String(accentLightness));
    document.documentElement.style.setProperty('--accent-strength', String(accentStrength));
  } catch (err) {
    document.documentElement.dataset.reduceMotion = 'off';
  }
})();`;

const captchaBootScript = `
(function () {
  window.__UE_TURNSTILE_SITE_KEY = ${JSON.stringify(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
      process.env.TURNSTILE_SITE_KEY ||
      ""
  )};
})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${fraunces.variable} ${rodin.variable} ${firaCode.variable} font-sans`}>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <script dangerouslySetInnerHTML={{ __html: captchaBootScript }} />
        <SkipLink />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
