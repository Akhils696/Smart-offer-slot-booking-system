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
        canvas: '#fbfcfe',
        primary: {
          50: '#eef7ff',
          100: '#d9ecff',
          200: '#bcdcff',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#1e3a8a',
          850: '#1a326f',
          900: '#14265a',
        },
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '0.875rem' }],
        '4.5xl': ['2.625rem', { lineHeight: '1.08' }],
      },
      spacing: {
        4.5: '1.125rem',
        8.5: '2.125rem',
      },
      boxShadow: {
        soft: '0 12px 30px rgba(23, 32, 51, 0.08)',
        lift: '0 18px 45px rgba(23, 32, 51, 0.12)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 420ms ease-out both',
        'slide-in': 'slide-in 260ms ease-out both',
        shimmer: 'shimmer 1.5s linear infinite',
      },
    },
  },
  plugins: [],
}
