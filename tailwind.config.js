/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Noto Naskh Arabic', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  'rgb(var(--color-primary-50) / <alpha-value>)',
          100: 'rgb(var(--color-primary-100) / <alpha-value>)',
          200: 'rgb(var(--color-primary-200) / <alpha-value>)',
          300: 'rgb(var(--color-primary-300) / <alpha-value>)',
          400: 'rgb(var(--color-primary-400) / <alpha-value>)',
          500: 'rgb(var(--color-primary-500) / <alpha-value>)',
          600: 'rgb(var(--color-primary-600) / <alpha-value>)',
          700: 'rgb(var(--color-primary-700) / <alpha-value>)',
          800: 'rgb(var(--color-primary-800) / <alpha-value>)',
          900: 'rgb(var(--color-primary-900) / <alpha-value>)',
        },
        accent: {
          orange: 'rgb(var(--color-accent-orange) / <alpha-value>)',
          purple: 'rgb(var(--color-accent-purple) / <alpha-value>)',
          pink:   'rgb(var(--color-accent-pink) / <alpha-value>)',
          blue:   'rgb(var(--color-accent-blue) / <alpha-value>)',
          yellow: 'rgb(var(--color-accent-yellow) / <alpha-value>)',
        },
        surface: {
          0:   'rgb(var(--color-surface-0) / <alpha-value>)',
          50:  'rgb(var(--color-surface-50) / <alpha-value>)',
          100: 'rgb(var(--color-surface-100) / <alpha-value>)',
          200: 'rgb(var(--color-surface-200) / <alpha-value>)',
          300: 'rgb(var(--color-surface-300) / <alpha-value>)',
          400: 'rgb(var(--color-surface-400) / <alpha-value>)',
          500: 'rgb(var(--color-surface-500) / <alpha-value>)',
          600: 'rgb(var(--color-surface-600) / <alpha-value>)',
          700: 'rgb(var(--color-surface-700) / <alpha-value>)',
          800: 'rgb(var(--color-surface-800) / <alpha-value>)',
          900: 'rgb(var(--color-surface-900) / <alpha-value>)',
        }
      },
      boxShadow: {
        card:  '0 2px 8px rgba(var(--color-shadow-rgb), 0.04), 0 10px 30px rgba(var(--color-shadow-rgb), 0.03)',
        'card-hover': '0 10px 20px rgba(var(--color-shadow-rgb), 0.08), 0 20px 40px rgba(var(--color-shadow-rgb), 0.06)',
        sidebar: '2px 0 24px rgba(var(--color-shadow-rgb), 0.04)',
        modal: '0 24px 64px rgba(var(--color-shadow-rgb), 0.15)',
      },
      animation: {
        'fade-in':  'fadeIn 0.35s ease-out forwards',
        'slide-up': 'slideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in': 'slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.25s ease-out forwards',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' },                              '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideIn: { '0%': { opacity: '0', transform: 'translateX(-12px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.96)' },      '100%': { opacity: '1', transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
};
