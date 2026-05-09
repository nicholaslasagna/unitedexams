import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Outfit, Fira_Code, Fraunces } from "next/font/google";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://unitedexams.com"),
  title: {
    default: "United Exams",
    template: "%s | United Exams"
  },
  description:
    "United Exams is a premium college study platform with beautiful quizzes, walkthroughs, progress tracking, and course notes.",
  openGraph: {
    title: "United Exams",
    description: "Study smarter. Test stronger.",
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

const themeBootScript = `
(function () {
  try {
    var raw = localStorage.getItem('ue.preferences.v1');
    var prefs = raw ? JSON.parse(raw) : null;
    var theme = prefs && prefs.theme ? prefs.theme : 'system';
    var reduced = !!(prefs && prefs.reducedMotion);
    var accentHue = prefs && typeof prefs.accentHue === 'number' ? ((prefs.accentHue % 360) + 360) % 360 : 38;
    var accentSaturation = prefs && typeof prefs.accentSaturation === 'number' ? Math.max(38, Math.min(95, prefs.accentSaturation)) : 92;
    var accentLightness = prefs && typeof prefs.accentLightness === 'number' ? Math.max(38, Math.min(76, prefs.accentLightness)) : 50;
    var accentStrength = prefs && typeof prefs.accentStrength === 'number' ? Math.max(0, Math.min(100, prefs.accentStrength)) : 56;
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
      <body className={`${outfit.variable} ${fraunces.variable} ${firaCode.variable} font-sans`}>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <script dangerouslySetInnerHTML={{ __html: captchaBootScript }} />
        <SkipLink />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
