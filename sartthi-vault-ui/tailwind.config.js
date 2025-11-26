/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
        'accent-green': '#10B981',
        'accent-red': '#EF4444',
      },
      fontSize: {
        '2xs': '0.625rem', // 10px
        'xs': '0.75rem',   // 12px
        '13': '0.8125rem', // 13px
      },
    },
  },
  plugins: [],
}
