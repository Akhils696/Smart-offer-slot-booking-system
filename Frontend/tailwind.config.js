/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: '#d9dee7',
        surface: '#f7f8fa',
        ink: '#172033',
        muted: '#667085',
        primary: {
          50: '#eef7ff',
          100: '#d9ecff',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
        },
      },
      boxShadow: {
        soft: '0 12px 30px rgba(23, 32, 51, 0.08)',
      },
    },
  },
  plugins: [],
}
