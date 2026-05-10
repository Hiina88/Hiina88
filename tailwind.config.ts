import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          '"Hiragino Kaku Gothic ProN"',
          '"Hiragino Sans"',
          "Meiryo",
          "sans-serif",
        ],
      },
      colors: {
        ink: {
          50: "#f8f9fb",
          100: "#eef0f4",
          200: "#dde1e8",
          300: "#c2c8d2",
          400: "#9ba3b1",
          500: "#6f7787",
          600: "#4f5666",
          700: "#363c49",
          800: "#23272f",
          900: "#13161c",
        },
        accent: {
          50: "#eef4ff",
          100: "#dbe6ff",
          500: "#3b6cf6",
          600: "#2954df",
          700: "#1f43b8",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)",
        pop: "0 6px 24px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(15, 23, 42, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
