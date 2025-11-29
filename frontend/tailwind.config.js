/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light mode colors
        'light-bg': '#f8f9fa',
        'light-surface': '#ffffff',
        'light-border': '#e9ecef',
        'light-text-primary': '#212529',
        'light-text-secondary': '#6c757d',
        'light-accent': '#9333ea', // purple-600
        // Dark mode colors
        'dark-bg': '#1a1a1a',
        'dark-surface': '#1a1a1a',
        'dark-border': '#1a1a1a',
        'dark-text-primary': '#ffffff',
        'dark-text-secondary': '#999999',
        'dark-accent': '#c084fc', // purple-400
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-in',
        'fade-out': 'fadeOut 0.5s ease-out',
        'bounce-once': 'bounceOnce 0.6s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.95)' },
        },
        bounceOnce: {
          '0%': { transform: 'scale(0) rotate(-180deg)', opacity: '0' },
          '50%': { transform: 'scale(1.3) rotate(0deg)', opacity: '1' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
