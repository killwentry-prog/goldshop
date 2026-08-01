/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          950: '#050505',
          900: '#0a0a0b',
          800: '#121214',
          700: '#1b1b1e',
        },
        gold: {
          200: '#f6e6b4',
          300: '#f0d88a',
          400: '#e6c164',
          500: '#d4af37',
          600: '#b8912a',
          700: '#8f6f1f',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 0 30px -5px rgba(212, 175, 55, 0.35)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #f6e6b4 0%, #d4af37 45%, #8f6f1f 100%)',
        'radial-glow': 'radial-gradient(circle at 50% 0%, rgba(212,175,55,0.15), transparent 60%)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-500px 0' },
          '100%': { backgroundPosition: '500px 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.8s linear infinite',
      },
    },
  },
  plugins: [],
};
