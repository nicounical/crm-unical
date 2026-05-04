/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#EFF8FB',
          100: '#D6EEF6',
          200: '#AEDCEE',
          300: '#7EC6E3',
          400: '#5CB8D1',
          500: '#3DA5C0',
          600: '#2E8BA3',
          700: '#256F83',
          800: '#1D5566',
          900: '#143D4A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
