/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class", // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#E8F0FF",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#0B5FFF",
          700: "#084CD6",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        teal: "#13B6A8",
        purple: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#7C58FF",
          700: "#7c3aed",
          800: "#6b21a8",
          900: "#581c87",
        },
        bg: "#F7F9FC",
        surface: "#FFFFFF",
        border: "#E6E9EF",
        text: "#111827",
        "text-secondary": "#6B7280",
        muted: "#9CA3AF",
        success: "#16A34A",
        warning: "#F59E0B",
        error: "#DC2626",
        info: "#0EA5E9",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
