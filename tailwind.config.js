/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './Pages/**/*.{html,razor}',
    './Components/**/*.{html,razor}',
    './Layout/**/*.{html,razor}',
    './Posts/**/*.{html,razor}',
    './wwwroot/index.html'
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}