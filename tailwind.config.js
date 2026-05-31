/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ground: '#15130F',
        raised: '#1B1814',
        ink: '#F4ECDF',
        'ink-muted': '#A8A097',
        'ink-faint': '#5C5750',
        gain: '#6FAF8D',
        loss: '#B0524A',
        neutral: '#C9A97E',
        accent: '#A8896E',
      },
      fontFamily: {
        display: ["Fraunces", "Newsreader", "Georgia", "serif"],
        body: ["Newsreader", "Georgia", "serif"],
        mono: ["JetBrains Mono", "ui-monospace", "Menlo", "monospace"],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        shimmer: 'shimmer 2.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
