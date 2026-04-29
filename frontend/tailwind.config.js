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
        // Light mode
        'light-bg': '#f5f3ff',        // soft purple-tinted white
        'light-surface': '#ffffff',
        'light-border': '#e5e1f0',     // purple-tinted border
        'light-text-primary': '#1e1b2e',
        'light-text-secondary': '#6b6580',
        'light-accent': '#7c3aed',     // violet-600
        'light-accent-hover': '#6d28d9',
        // Dark mode
        'dark-bg': '#0f0b1a',          // deep purple-black
        'dark-surface': '#1a1528',     // elevated surface
        'dark-border': '#2d2640',      // visible border
        'dark-text-primary': '#f0ecf9',
        'dark-text-secondary': '#9b93b0',
        'dark-accent': '#a78bfa',      // violet-400
        'dark-accent-hover': '#c4b5fd',
      },
      animation: {
        'slide-in': 'slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-out': 'fadeOut 0.2s ease-out',
        'bounce-once': 'bounceOnce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        bounceOnce: {
          '0%': { transform: 'scale(0) rotate(-180deg)', opacity: '0' },
          '50%': { transform: 'scale(1.2) rotate(0deg)', opacity: '1' },
          '70%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(124, 58, 237, 0.2), 0 0 20px rgba(124, 58, 237, 0.1)' },
          '100%': { boxShadow: '0 0 10px rgba(124, 58, 237, 0.4), 0 0 40px rgba(124, 58, 237, 0.2)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(124, 58, 237, 0.15)',
        'glow-md': '0 0 20px rgba(124, 58, 237, 0.2)',
        'glow-lg': '0 0 40px rgba(124, 58, 237, 0.25)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
    },
  },
  plugins: [],
}
