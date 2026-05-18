/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#172033',
        paper: '#f8fafc',
        sage: '#7aa095',
        berry: '#b4556d',
        marigold: '#e0a73a',
      },
    },
  },
  plugins: [],
}
