/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        monster: {
          50: '#eefbf3',
          100: '#d6f5e1',
          200: '#b0eac8',
          300: '#7cd9a8',
          400: '#46c184',
          500: '#24a668',
          600: '#168653',
          700: '#126b45',
          800: '#115538',
          900: '#0f462f',
          950: '#07271b',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
