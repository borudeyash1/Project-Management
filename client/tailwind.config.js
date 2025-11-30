const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        primary: 'var(--accent-color)', // Use accent color as primary
        'primary-700': 'var(--accent-color)', // Fallback for now
        'primary-100': '#E8F0FF',
        accent: 'var(--accent-color)',
        'accent-dark': 'var(--accent-color)', // We can add a darker variant variable later if needed
        'accent-light': 'var(--accent-color)',
        'accent-hover': 'var(--accent-color)',
        teal: '#13B6A8',
        purple: '#7C58FF',
        bg: 'var(--bg-color, #F7F9FC)',
        surface: 'var(--surface-color, #FFFFFF)',
        border: 'var(--border-color, #E6E9EF)',
        text: 'var(--text-color, #111827)',
        'text-secondary': '#6B7280',
        muted: '#9CA3AF',
        success: '#16A34A',
        warning: '#F59E0B',
        error: '#DC2626',
        info: '#0EA5E9',
        // High-Density Dark Mode Theme
        'app-bg': '#191919',
        'sidebar-bg': '#202020',
        'card-bg': '#202020',
        'hover-bg': '#262626',
        'border-subtle': '#2C2C2C',
        'border-light': '#333333',
        'text-primary': '#E3E3E3',
        'text-muted': '#9CA3AF',
        'text-light': '#D1D5DB',
        'text-lighter': '#6B7280',
        'accent-blue': '#2563EB',
        'accent-red': '#EF4444',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif']
      },
      fontSize: {
        '2xs': '0.625rem', // 10px
        'xs': '0.75rem',   // 12px
        '13': '0.8125rem', // 13px
      },
      aspectRatio: {
        '4/3': '4 / 3',
      },
      animation: {
        aurora: "aurora 60s linear infinite",
      },
      keyframes: {
        aurora: {
          from: {
            backgroundPosition: "50% 50%, 50% 50%",
          },
          to: {
            backgroundPosition: "350% 50%, 350% 50%",
          },
        },
      },
    },
  },
  plugins: [addVariablesForColors],
}

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}
