import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Outfit, Fira_Code } from "next/font/google";
import { Providers } from "@/app/providers";
import { SkipLink } from "@/components/ui/skip-link";
import "@/app/globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
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
    var accentHue = prefs && typeof prefs.accentHue === 'number' ? ((prefs.accentHue % 360) + 360) % 360 : 265;
    var accentSaturation = prefs && typeof prefs.accentSaturation === 'number' ? Math.max(38, Math.min(88, prefs.accentSaturation)) : 72;
    var accentLightness = prefs && typeof prefs.accentLightness === 'number' ? Math.max(38, Math.min(76, prefs.accentLightness)) : 62;
    var accentStrength = prefs && typeof prefs.accentStrength === 'number' ? Math.max(0, Math.min(100, prefs.accentStrength)) : 60;
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${firaCode.variable} font-sans`}>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <SkipLink />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
