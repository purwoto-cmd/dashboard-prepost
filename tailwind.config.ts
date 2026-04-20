import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        arabic: ["Noto Naskh Arabic", "Amiri", "serif"],
      },
      colors: {
        brand: {
          50: "#eef7ff",
          100: "#d9edff",
          200: "#bcdfff",
          300: "#8dcaff",
          400: "#57aaff",
          500: "#2f88f7",
          600: "#1c6ce0",
          700: "#1956b3",
          800: "#174990",
          900: "#153d74",
        },
      },
    },
  },
  plugins: [],
};

export default config;
