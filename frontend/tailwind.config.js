/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        brand: {
          blue: '#2563eb',
          cyan: '#06b6d4',
          purple: '#7c3aed',
          dark: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.75rem', { lineHeight: '1rem' }],
        'xs': ['0.825rem', { lineHeight: '1.25rem' }],
        'sm': ['0.925rem', { lineHeight: '1.45rem' }],
        'base': ['1.025rem', { lineHeight: '1.65rem' }],
        'lg': ['1.15rem', { lineHeight: '1.75rem' }],
        'xl': ['1.3rem', { lineHeight: '1.85rem' }],
        '2xl': ['1.55rem', { lineHeight: '2.1rem' }],
        '3xl': ['1.9rem', { lineHeight: '2.35rem' }],
      },
    },
  },
  plugins: [],
};
