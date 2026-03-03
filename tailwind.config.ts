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
        sans: ["var(--font-outfit)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      colors: {
        bg: "hsl(var(--bg))",
        surface: "hsl(var(--surface))",
        "surface-raised": "hsl(var(--surface-raised))",
        soft: "hsl(var(--soft))",
        borderc: "hsl(var(--border))",
        "border-bright": "hsl(var(--border-bright))",
        text: "hsl(var(--text))",
        muted: "hsl(var(--muted))",
        faint: "hsl(var(--faint))",
        accent: "hsl(var(--accent))",
        brand: {
          1: "hsl(var(--brand-1))",
          2: "hsl(var(--brand-2))",
          3: "hsl(var(--brand-3))"
        },
        success: "hsl(var(--success))",
        warn: "hsl(var(--warn))",
        danger: "hsl(var(--danger))"
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(0,0,0,0.4)",
        soft: "0 8px 28px -8px rgba(0,0,0,0.6)",
        glass: "0 1px 0 rgba(255,255,255,0.06) inset, 0 18px 40px -22px rgba(2, 8, 24, 0.78)",
        elevated: "0 20px 48px -16px rgba(0,0,0,0.8)",
        glow: "0 8px 28px hsl(var(--accent) / 0.3)",
        "glow-lg": "0 12px 40px hsl(var(--accent) / 0.4)",
        focus: "0 0 0 3px hsl(var(--accent) / 0.35)"
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, hsl(var(--brand-1)) 0%, hsl(var(--brand-2)) 100%)",
        "accent-gradient": "linear-gradient(135deg, hsl(235 89% 66%) 0%, hsl(262 83% 66%) 100%)"
      },
      borderRadius: {
        xl2: "1.25rem"
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
        }
      },
      animation: {
        float: "float 9s ease-in-out infinite",
        glow: "glow 7s ease-in-out infinite",
        rise: "rise 0.5s ease-out"
      }
    }
  },
  plugins: []
};

export default config;
