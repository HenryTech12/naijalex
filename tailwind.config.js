/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1D9E75',
          50: '#F0FBF6',
          100: '#D4F3E6',
          200: '#A9E7CD',
          300: '#7DDBB3',
          400: '#52CF9A',
          500: '#1D9E75',
          600: '#177F5E',
          700: '#115F46',
          800: '#0C3F2F',
          900: '#062018',
        },
        danger: {
          DEFAULT: '#E24B4A',
          50: '#FFF0F0',
          100: '#FFD6D6',
          500: '#E24B4A',
          700: '#B33939',
        },
        warning: {
          DEFAULT: '#BA7517',
          50: '#FFF8ED',
          100: '#FFE8C0',
          500: '#BA7517',
          700: '#8F5A10',
        },
        safe: '#1D9E75',
        brand: {
          bg: '#F8F7F4',
          surface: '#FFFFFF',
          textPrimary: '#1A1916',
          textSecondary: '#5F5E5A',
          border: '#E5E4E0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
