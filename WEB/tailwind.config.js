/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"VT323"', 'monospace'],
      },
      colors: {
        cyber: {
          green: '#00ff00',
          cyan: '#06b6d4',
          dark: '#050505',
          border: '#00f3ff',
        },
      },
    },
  },
  plugins: [],
}
