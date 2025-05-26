/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        telegram: {
          bg: 'var(--tg-theme-bg-color, #ffffff)',
          text: 'var(--tg-theme-text-color, #000000)',
          hint: 'var(--tg-theme-hint-color, #707579)',
          link: 'var(--tg-theme-link-color, #2678b6)',
          button: 'var(--tg-theme-button-color, #50a8eb)',
          buttonText: 'var(--tg-theme-button-text-color, #ffffff)',
          secondary: 'var(--tg-theme-secondary-bg-color, #f4f4f5)',
          section: 'var(--tg-theme-section-bg-color, #f4f4f5)',
          sectionText: 'var(--tg-theme-section-header-text-color, #000000)',
        },
        wb: {
          purple: {
            50: '#f5eef8',
            100: '#e8d5f0',
            200: '#d5b0e2',
            300: '#bc82d1',
            400: '#a259bf',
            500: '#8e44ad', // основной цвет WB
            600: '#7d389c',
            700: '#6c3483',
            800: '#5a2d6e',
            900: '#4b265b',
          }
        }
      },
      fontFamily: {
        sans: ['Inter var', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        rubik: ['Rubik', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.12), 0 8px 24px rgba(0, 0, 0, 0.09)',
        'button': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'button-hover': '0 4px 8px rgba(0, 0, 0, 0.15)',
      },
      borderRadius: {
        'card': '0.75rem',
        'button': '0.625rem',
        'input': '0.625rem',
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
      },
    },
  },
  darkMode: ['class', '[data-theme="dark"]'],
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class', // используем классы вместо глобальных стилей
    }),
  ],
}
