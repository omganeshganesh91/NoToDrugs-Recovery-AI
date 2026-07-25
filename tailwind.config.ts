import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        'crisis-ring': 'crisis-ring 1.5s ease-in-out infinite',
        'slide-down': 'slideDown 0.35s ease-out forwards',
      },
      keyframes: {
        'crisis-ring': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.6)' },
          '50%': { boxShadow: '0 0 0 16px rgba(239, 68, 68, 0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
