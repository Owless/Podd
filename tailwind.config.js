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
          bg: 'var(--tg-theme-bg-color, #fff)',
          text: 'var(--tg-theme-text-color, #000)',
          hint: 'var(--tg-theme-hint-color, #999)',
          link: 'var(--tg-theme-link-color, #2678b6)',
          button: 'var(--tg-theme-button-color, #2678b6)',
          buttonText: 'var(--tg-theme-button-text-color, #fff)',
          secondary: 'var(--tg-theme-secondary-bg-color, #f0f0f0)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.09)',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}
