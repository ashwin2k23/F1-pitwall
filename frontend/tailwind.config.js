/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
      },
      colors: {
        background: 'var(--background)',
        card: 'var(--card-bg)',
        primary: '#dc2626', // red-600 F1 brand
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'success': 'success 0.5s ease-out forwards',
        'fadeIn': 'fadeIn 0.5s ease-out',
        'ticker': 'ticker 30s linear infinite',
      },
      keyframes: {
        success: {
          '0%': { transform: 'scale(1)', backgroundColor: '#dc2626' }, // red-600
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', backgroundColor: '#16a34a' }, // green-600
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        ticker: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        }
      }
    },
  },
  plugins: [],
}
