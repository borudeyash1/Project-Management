/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        primary: '#0B5FFF',
        'primary-700': '#084CD6',
        'primary-100': '#E8F0FF',
        teal: '#13B6A8',
        purple: '#7C58FF',
        bg: '#F7F9FC',
        surface: '#FFFFFF',
        border: '#E6E9EF',
        text: '#111827',
        'text-secondary': '#6B7280',
        muted: '#9CA3AF',
        success: '#16A34A',
        warning: '#F59E0B',
        error: '#DC2626',
        info: '#0EA5E9'
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
