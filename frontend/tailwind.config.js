/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#2f302c',
        muted: '#6f6a5f',
        paper: '#f7f1e8',
        linen: '#fffaf3',
        oat: '#e7dccb',
        sage: '#7f9b87',
        fjord: '#8397a8',
        terracotta: '#b77964',
        berry: '#a76058',
        marigold: '#caa25a',
      },
    },
  },
  plugins: [],
}
