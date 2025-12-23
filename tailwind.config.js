/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // <--- IMPORTANTE: Asegúrate que diga 'class'
  theme: {
    extend: {},
  },
  plugins: [],
};