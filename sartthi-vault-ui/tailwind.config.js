/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'app-bg': 'var(--app-bg)',
        'sidebar-bg': 'var(--sidebar-bg)',
        'card-bg': 'var(--card-bg)',
        'hover-bg': 'var(--hover-bg)',
        'border-subtle': 'var(--border-subtle)',
        'border-light': 'var(--border-light)',
        'text-primary': 'var(--text-primary)',
        'text-muted': 'var(--text-muted)',
        'text-light': 'var(--text-light)',
        'text-lighter': 'var(--text-lighter)',
        'accent-blue': 'var(--accent-blue)',
        'accent-green': 'var(--accent-green)',
        'accent-red': 'var(--accent-red)',
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
