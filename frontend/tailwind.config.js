/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0f1419',
        surface: '#1a2332',
        card: '#243447',
      },
    },
  },
  plugins: [],
};
