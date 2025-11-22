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
        info: '#0EA5E9'
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
