/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e0e9fe',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#1e1b4b',
        },
        clipchamp: {
          purple: '#6b21a8',
          accent: '#06b6d4',
          dark: '#0f172a',
          surface: '#1e293b',
          border: '#334155'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans KR', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite',
        'bounce-subtle': 'bounceSubtle 1.5s infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 15px rgba(236,72,153,0.8))' },
          '50%': { filter: 'drop-shadow(0 0 5px rgba(236,72,153,0.3))' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
};
