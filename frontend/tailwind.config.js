/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          950: '#020818',
          900: '#060d1f',
          800: '#0a1628',
          700: '#0f2040',
          600: '#1a3560',
          500: '#1e4080',
          border: '#1a2d50',
          accent: '#00b4d8',
          'accent-dim': '#0096c7',
          purple: '#7c3aed',
          glow: 'rgba(0,180,216,0.15)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scan': 'scan 3s linear infinite',
      },
      keyframes: {
        glowPulse: {
          '0%,100%': { opacity: '0.6' },
          '50%':     { opacity: '1'   },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)'    },
        },
        scan: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'cyber':     '0 0 20px rgba(0,180,216,0.15), 0 0 60px rgba(0,180,216,0.05)',
        'cyber-sm':  '0 0 10px rgba(0,180,216,0.12)',
        'cyber-lg':  '0 0 40px rgba(0,180,216,0.2), 0 0 100px rgba(0,180,216,0.08)',
        'inner-sm':  'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
    },
  },
  plugins: [],
}
