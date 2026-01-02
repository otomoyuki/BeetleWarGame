// client/tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'game-bg': '#2d1810',
        'beetle-red': '#ff3333',
        'beetle-blue': '#0066ff',
        'nectar-gold': '#FFD700',
      },
    },
  },
  plugins: [],
}