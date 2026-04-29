/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#002147',
          light: '#003166',
          dark: '#001430',
        },
        orange: {
          DEFAULT: '#FF8C00',
          light: '#FFA533',
          pale: 'rgba(255,140,0,0.1)',
        },
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        noto: ['Noto Sans KR', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
