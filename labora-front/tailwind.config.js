/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    container: { center: true },
    extend: {
      backgroundImage: {
        mainGradient: 'linear-gradient(to right, #51327d, #a03c80, #db5673)',
        softGradient: 'linear-gradient(135deg, rgba(81,50,125,0.06) 0%, rgba(160,60,128,0.06) 50%, rgba(219,86,115,0.06) 100%)',
        subtleGradient: 'linear-gradient(135deg, #ffffff 0%, #fbf7fb 100%)',
        accentGradient: 'linear-gradient(135deg, #ea5d7b 0%, #b60e81 100%)',
        surfaceGradient: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
      },
      colors: {
        primary: {
          DEFAULT: '#ea5d7bff',
          light: '#fdeef2',
          'dark-light': 'rgba(234,93,123,.12)',
        },
        secondary: {
          DEFAULT: '#ea5d7bff',
          light: '#ebe4f7',
          'dark-light': 'rgb(128 93 202 / 15%)',
        },
        success: {
          DEFAULT: '#00ab55',
          light: '#ddf5f0',
          'dark-light': 'rgba(0,171,85,.15)',
        },
        danger: {
          DEFAULT: '#e7515a',
          light: '#fff5f5',
          'dark-light': 'rgba(231,81,90,.15)',
        },
        warning: {
          DEFAULT: '#e2a03f',
          light: '#fff9ed',
          'dark-light': 'rgba(226,160,63,.15)',
        },
        info: {
          DEFAULT: '#2196f3',
          light: '#e7f7ff',
          'dark-light': 'rgba(33,150,243,.15)',
        },
        dark: {
          DEFAULT: '#3b3f5c',
          light: '#eaeaec',
          'dark-light': 'rgba(59,63,92,.15)',
        },
        black: {
          DEFAULT: '#0e1726',
          light: '#e3e4eb',
          'dark-light': 'rgba(14,23,38,.15)',
        },
        white: {
          DEFAULT: '#ffffff',
          light: '#e0e6ed',
          dark: '#888ea8',
        },
        darkPurple: {
          DEFAULT: '#51327d',
        },
        lightPurple: {
          DEFAULT: '#b60e81ff',
        },
        pink: {
          DEFAULT: '#ea5d7bff',
        },
        darkPink: {
          DEFAULT: '#ce516cff',
        },
        orange: {
          DEFAULT: '#fe8461',
        },
      },
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
      },
      spacing: { 4.5: '18px' },
      borderRadius: {
        'xl-2': '14px',
        '2xl-2': '18px',
      },
      boxShadow: {
        '3xl': '0 2px 2px rgb(224 230 237 / 46%), 1px 6px 7px rgb(224 230 237 / 46%)',
        soft: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.05)',
        elegant: '0 4px 6px -1px rgba(81, 50, 125, 0.04), 0 2px 4px -2px rgba(81, 50, 125, 0.04), 0 0 0 1px rgba(81, 50, 125, 0.02)',
        card: '0 1px 3px rgba(16, 24, 40, 0.04), 0 1px 2px rgba(16, 24, 40, 0.03)',
        'card-hover': '0 12px 24px -8px rgba(81, 50, 125, 0.12), 0 4px 8px -4px rgba(234, 93, 123, 0.08)',
        glow: '0 0 0 4px rgba(234, 93, 123, 0.12)',
        'glow-sm': '0 0 0 3px rgba(234, 93, 123, 0.10)',
        brand: '0 8px 20px -8px rgba(234, 93, 123, 0.45)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'soft-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.35s ease-out',
        'soft-pulse': 'soft-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({ strategy: 'class' }),
    require('@tailwindcss/typography'),

    function ({ addComponents }) {
      addComponents({
        '.btn-main': {
          '@apply inline-flex items-center justify-center gap-1.5 bg-pink hover:bg-darkPink rounded-lg text-xs px-3.5 py-2 font-bold text-white transition-all duration-300 shadow-brand hover:shadow-[0_10px_24px_-8px_rgba(206,81,108,0.55)] hover:-translate-y-0.5 active:translate-y-0':
            {},
        },
        '.btn-aux': {
          '@apply inline-flex items-center justify-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-xs px-3.5 py-2 font-semibold border border-gray-200 transition-all duration-300 hover:border-gray-300 hover:-translate-y-0.5 active:translate-y-0 dark:bg-[#0e1726] dark:hover:bg-[#101a2e] dark:text-gray-300 dark:border-[#1b2e4b]':
            {},
        },
        '.btn-ghost': {
          '@apply inline-flex items-center justify-center gap-1.5 bg-transparent hover:bg-primary/5 text-primary rounded-lg text-xs px-3 py-1.5 font-semibold transition-colors duration-200':
            {},
        },
        '.navbar-link': {
          '@apply cursor-pointer hover:text-lightPurple hover:font-bold transition-all duration-300': {},
        },
        '.footer-link': {
          '@apply transition-transform duration-200 transform hover:scale-105': {},
        },
        '.link-active': {
          '@apply font-bold text-transparent bg-clip-text bg-mainGradient cursor-pointer': {},
        },
        '.chip': {
          '@apply inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide': {},
        },
        '.section-title': {
          '@apply flex items-center gap-3 mb-5': {},
        },
      });
    },
  ],
};
