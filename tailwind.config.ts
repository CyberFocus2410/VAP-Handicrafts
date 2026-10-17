import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "360px",
      sm: "480px",
      md: "768px",
      lg: "1024px",
      xl: "1440px",
    },
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        ivory: "#FFFDF9",
        blush: "var(--blush)",
        rose: {
          DEFAULT: "var(--rose)",
          deep: "var(--rose-deep)",
          deeper: "var(--rose-deeper)",
        },
        cocoa: {
          DEFAULT: "var(--cocoa)",
          muted: "var(--cocoa-muted)",
        },
        sand: "var(--sand)",
        beige: "var(--beige)",
        lavender: "var(--lavender)",
        sage: "var(--sage)",
        gold: {
          DEFAULT: "var(--gold)",
          deep: "var(--gold-deep)",
        },
        success: "var(--success)",
        error: "var(--error)",
        border: "var(--border)",
        ring: "var(--ring)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "'Times New Roman'", "serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "'Segoe UI'", "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "14px",
        lg: "24px",
        full: "9999px",
      },
      boxShadow: {
        sm: "0 1px 2px rgb(74 45 40 / 0.06)",
        md: "0 8px 24px -8px rgb(74 45 40 / 0.14)",
        lg: "0 24px 48px -16px rgb(74 45 40 / 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
