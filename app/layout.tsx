import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Outfit, Fira_Code } from "next/font/google";
import { Providers } from "@/app/providers";
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
    icon: "/favicon.ico"
  }
};

const themeBootScript = `
(function () {
  try {
    var raw = localStorage.getItem('ue.preferences.v1');
    var prefs = raw ? JSON.parse(raw) : null;
    var theme = prefs && prefs.theme ? prefs.theme : 'system';
    var reduced = !!(prefs && prefs.reducedMotion);
    var resolved = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    if (resolved === 'dark') document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = resolved;
    document.documentElement.dataset.reduceMotion = reduced ? 'on' : 'off';
  } catch (err) {
    document.documentElement.dataset.reduceMotion = 'off';
  }
})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${firaCode.variable} font-sans`}>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
