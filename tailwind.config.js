/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0f1117',
          surface: '#1a1d27',
          border: '#2a2d3a',
        },
        amber: {
          500: '#f59e0b',
          600: '#d97706',
        },
        rating: {
          5: '#22c55e',
          4: '#84cc16',
          3: '#eab308',
          2: '#f97316',
          1: '#ef4444',
        }
      },
      fontFamily: {
        heading: ['Barlow Condensed', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
