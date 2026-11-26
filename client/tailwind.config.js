/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#FDFBF7',
        sand: '#F7F1E3',
        goldBorder: '#EBDCC0',
        brand: {
          primary: '#D97706',
          light: '#F59E0B',
          bronze: '#92400E',
          darkBronze: '#78350F',
        },
        ink: {
          primary: '#1C1917',
          secondary: '#57534E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
