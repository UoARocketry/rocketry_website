import { join } from 'path';

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: 'class',
  content: [
    join(__dirname, 'app/**/*.{js,ts,jsx,tsx,mdx}'),
    join(__dirname, 'components/**/*.{js,ts,jsx,tsx,mdx}'),
    join(__dirname, 'lib/**/*.{js,ts,jsx,tsx,mdx}'),
  ],
  theme: {
    extend: {
      colors: {
        primary: '#C25632',
        background: '#181818',
        surface: '#232323',
        accent: '#E0E0E0',
        'text-main': '#FFFFFF',
        'text-secondary': '#B0B0B0',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config; 