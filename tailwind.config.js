/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{svelte,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a1f2e',
          light: '#f7fafc',
        },
        secondary: {
          DEFAULT: '#e2e8f0',
          dark: '#1a1f2e',
        },
        accent: {
          DEFAULT: '#60a5fa',
          hover: '#3b82f6',
        }
      },
    },
  },
  plugins: [],
  safelist: [
    'outline-none',
    'focus:outline-none',
    'focus:ring-4',
    'focus:ring-blue-300'
  ]
}

