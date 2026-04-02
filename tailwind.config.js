/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1e3a8a",
          foreground: "#ffffff",
          hover: "#172554",
          light: "#eff6ff",
        },
        border: "hsl(var(--border-hsl))",
        background: "hsl(var(--background-hsl))",
        foreground: "hsl(var(--foreground-hsl))",
      },
    },
  },
  darkMode: "class",
  plugins: [],
}
