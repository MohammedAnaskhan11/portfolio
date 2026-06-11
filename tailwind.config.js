/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // CSS-variable-driven colors — work in both light & dark automatically
        background: 'rgb(var(--bg) / <alpha-value>)',
        surface:    'rgb(var(--surface) / <alpha-value>)',
        surfaceLight:'rgb(var(--surface-light) / <alpha-value>)',
        accent:     'rgb(var(--accent) / <alpha-value>)',
        violet:     'rgb(var(--violet) / <alpha-value>)',
        border:     'rgb(var(--border-rgb) / <alpha-value>)',
        foreground: 'rgb(var(--fg) / <alpha-value>)',
        muted:      'rgb(var(--muted) / <alpha-value>)',
      },
      fontFamily: {
        body:    ["'Sora'", 'sans-serif'],
        display: ["'Clash Display'", 'sans-serif'],
        mono:    ["'Space Mono'", 'monospace'],
      },
      animation: {
        float:       'float 6s ease-in-out infinite',
        'glow-pulse':'glow-pulse 3s ease-in-out infinite',
        spin:        'spin 6s linear infinite',
        'fade-in':   'fadeIn 0.4s ease forwards',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-12px)' },
        },
        'glow-pulse': {
          '0%,100%': { opacity: '0.4' },
          '50%':     { opacity: '0.9' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      screens: {
        xs: '480px',
      },
    },
  },
  plugins: [],
};
