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
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-manrope)", "var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      colors: {
        bg: "hsl(var(--bg))",
        surface: "hsl(var(--surface))",
        soft: "hsl(var(--soft))",
        borderc: "hsl(var(--border))",
        text: "hsl(var(--text))",
        muted: "hsl(var(--muted))",
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
        soft: "0 10px 40px rgba(6, 12, 35, 0.12)",
        glass: "0 1px 0 rgba(255,255,255,0.18) inset, 0 18px 40px rgba(6, 12, 35, 0.18)",
        focus: "0 0 0 3px rgba(59, 130, 246, 0.35)"
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, hsl(var(--brand-1)) 0%, hsl(var(--brand-2)) 45%, hsl(var(--brand-3)) 100%)"
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
        }
      },
      animation: {
        float: "float 9s ease-in-out infinite",
        glow: "glow 7s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
