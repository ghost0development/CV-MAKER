/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ede9fe',
          100: '#ddd6fe',
          200: '#c4b5fd',
          300: '#a78bfa',
          400: '#8b5cf6',
          500: '#7c3aed',
          600: '#6c5ce7',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#3b0764',
        },
        surface: {
          DEFAULT: '#0a0a0f',
          50: '#14141f',
          100: '#1a1a2e',
          200: '#222240',
          300: '#2a2a4a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
