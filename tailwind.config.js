/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    colors: {
      primary: '#FF204E',
      secondary: '#00224D',
      darkgray: '#030712',
      darklessgray: '#0A0F1A',
    },
    extend: {
      fontSize: {
        xxs: '0.5rem',
      },
    },
  },
  plugins: [],
}
