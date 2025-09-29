/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './**/*.{ts,tsx}',
    '!./node_modules/**/*',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Source Sans 3', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
      colors: {
        'brand-blue': '#2a528a',
        'brand-green': '#5a7d6a',
        'brand-ochre': '#c7893f',
        'brand-terracotta': '#b5654d',
        'brand-light': '#f5f3f0',
        'brand-dark': '#3a3a3a',
      },
    },
  },
  plugins: [],
};
