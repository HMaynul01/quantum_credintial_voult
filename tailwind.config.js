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
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
      colors: {
        cyan: { 450: '#00e5ff', 950: '#083344' },
        purple: { 450: '#d946ef', 950: '#4a044e' },
        deep: '#020617',
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'rotate-border': 'rotateBorder 2s linear infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'in-zoom': 'inZoom 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'in-fade': 'fadeIn 0.4s ease-out forwards',
        'out-fade': 'fadeOut 0.4s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'glitch': 'glitch 0.2s ease-in-out infinite',
      },
      keyframes: {
        rotateBorder: {
          '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
          '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' },
        },
        inZoom: {
          '0%': { opacity: '0', transform: 'scale(0.9) translateY(30px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeOut: { '0%': { opacity: '1' }, '100%': { opacity: '0' } },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
