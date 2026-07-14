/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#0F2F2A',
          50: '#F4F7F5',
          100: '#E8EFEB',
          200: '#D5E3DE',
          300: '#A8C5BE',
          400: '#5A7A72',
          500: '#1A4A42',
          600: '#0F2F2A',
          700: '#0A221E',
        },
        brass: {
          DEFAULT: '#C4A574',
          soft: '#E8D5B0',
          deep: '#9A7B4F',
        },
        amber: {
          due: '#B45309',
        },
        parchment: '#F2EBE0',
        ink: '#1A2E2A',
        mist: '#E8EFEB',
        primary: {
          50: '#F4F7F5',
          100: '#E8EFEB',
          200: '#D5E3DE',
          300: '#A8C5BE',
          400: '#5A7A72',
          500: '#1A4A42',
          600: '#0F2F2A',
          700: '#0A221E',
          800: '#071815',
          900: '#04100E',
        },
        brand: {
          DEFAULT: '#0F2F2A',
          dark: '#0A221E',
          light: '#1A4A42',
          accent: '#C4A574',
        },
      },
      fontFamily: {
        display: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,47,42,0.06), 0 1px 3px rgba(15,47,42,0.04)',
        'card-hover': '0 4px 12px rgba(15,47,42,0.08)',
        rail: '4px 0 24px rgba(15,47,42,0.12)',
      },
      transitionDuration: {
        rail: '180ms',
      },
    },
  },
  plugins: [],
};
