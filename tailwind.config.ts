import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        // Body / UI: clean neutral sans
        sans: ["var(--font-outfit)", "ui-sans-serif", "system-ui", "sans-serif"],
        // Display: editorial variable serif — used for hero + section titles
        // to give the site a real "designed publication" feel rather than
        // generic Tailwind sans-everywhere.
        display: ["var(--font-fraunces)", "ui-serif", "Georgia", "Times New Roman", "serif"],
        // Backup sans-display class for places where serif would be wrong
        // (small UI labels, button text, dense data tables).
        "display-sans": ["var(--font-outfit)", "ui-sans-serif", "system-ui", "sans-serif"],
        // Wordmark — heavy geometric for the homepage "United Exams" hero.
        // Paired with the Fraunces italic for the accent word.
        wordmark: ["var(--font-rodin)", "var(--font-outfit)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      fontSize: {
        "display-xl": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.025em", fontWeight: "700" }],
        "display-lg": ["2.25rem", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-md": ["1.75rem", { lineHeight: "1.2", letterSpacing: "-0.015em", fontWeight: "650" }],
        "heading":    ["1.375rem", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" }],
        "subheading": ["1rem", { lineHeight: "1.4", letterSpacing: "0", fontWeight: "600" }],
        "body":       ["0.9375rem", { lineHeight: "1.65", letterSpacing: "0", fontWeight: "400" }],
        "body-sm":    ["0.8125rem", { lineHeight: "1.5", letterSpacing: "0.005em", fontWeight: "400" }],
        "caption":    ["0.6875rem", { lineHeight: "1.4", letterSpacing: "0.04em", fontWeight: "500" }],
      },
      colors: {
        bg: "hsl(var(--bg))",
        "bg-inset": "hsl(var(--bg-inset))",
        surface: "hsl(var(--surface))",
        "surface-raised": "hsl(var(--surface-raised))",
        soft: "hsl(var(--soft))",
        overlay: "hsl(var(--overlay))",
        borderc: "hsl(var(--border))",
        "border-bright": "hsl(var(--border-bright))",
        "border-accent": "hsl(var(--border-accent))",
        text: "hsl(var(--text))",
        "text-secondary": "hsl(var(--text-secondary))",
        muted: "hsl(var(--muted))",
        faint: "hsl(var(--faint))",
        accent: "hsl(var(--accent))",
        "accent-dim": "hsl(var(--accent-dim))",
        "accent-subtle": "hsl(var(--accent-subtle))",
        "accent-fg": "hsl(var(--accent-fg))",
        "brand-fg": "hsl(var(--brand-fg))",
        "accent-wash": "hsl(var(--accent-wash))",
        brand: {
          1: "hsl(var(--brand-1))",
          2: "hsl(var(--brand-2))",
          3: "hsl(var(--brand-3))"
        },
        success: "hsl(var(--success))",
        warn: "hsl(var(--warn))",
        danger: "hsl(var(--danger))",
        info: "hsl(var(--info))"
      },
      boxShadow: {
        subtle: "0 1px 3px 0 hsl(var(--text) / var(--shadow-opacity))",
        soft: "0 4px 16px -4px hsl(var(--text) / var(--shadow-opacity-md))",
        glass: "0 1px 0 hsl(var(--surface-raised) / 0.05) inset, 0 12px 32px -16px hsl(var(--text) / var(--shadow-opacity-lg))",
        elevated: "0 12px 36px -8px hsl(var(--text) / var(--shadow-opacity-lg))",
        glow: "0 4px 20px -4px hsl(var(--accent) / 0.25)",
        "glow-lg": "0 8px 32px -4px hsl(var(--accent) / 0.3)",
        "card-hover": "0 8px 24px -8px hsl(var(--accent) / 0.12)",
        focus: "0 0 0 3px hsl(var(--accent) / 0.3)"
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, hsl(var(--brand-1)) 0%, hsl(var(--brand-2)) 100%)",
        "accent-gradient": "linear-gradient(135deg, hsl(235 89% 66%) 0%, hsl(262 83% 66%) 100%)"
      },
      borderRadius: {
        xl2: "1.25rem"
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        },
        glow: {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "0.8" }
        },
        rise: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        "fade-rise": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        "scale-spring": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" }
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(16px)" },
          to: { opacity: "1", transform: "translateX(0)" }
        },
        "slide-out-right": {
          from: { opacity: "1", transform: "translateX(0)" },
          to: { opacity: "0", transform: "translateX(100%)" }
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-6px)" },
          "40%": { transform: "translateX(6px)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" }
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.8" },
          "50%": { opacity: "1" }
        },
        "count-up": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        float: "float 9s ease-in-out infinite",
        glow: "glow 7s ease-in-out infinite",
        rise: "rise 0.5s ease-out",
        "fade-rise": "fade-rise 0.3s cubic-bezier(0.16, 1, 0.3, 1) both",
        "scale-spring": "scale-spring 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "slide-in-right": "slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) both",
        "slide-out-right": "slide-out-right 0.2s ease-in both",
        shake: "shake 0.3s ease-in-out",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
        "count-up": "count-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both"
      }
    }
  },
  plugins: []
};

export default config;
