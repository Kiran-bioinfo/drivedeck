/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand:   { DEFAULT: '#4F46E5', dark: '#4338CA' },
        accent:  '#2052EB',
        blush:   '#FADBE5',
        canvas:  '#F8FAFC',
        surface: '#FFFFFF',
        ink:     { DEFAULT: '#0F172A', muted: '#64748B' },
        line:    '#E2E8F0',
        success: '#10B981',
        warning: '#F59E0B',
        danger:  '#EF4444',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
        lg: '8px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,0.06)',
        elev: '0 8px 24px rgba(79,70,229,0.08)',
      },
      screens: {
        xs: '375px',
      },
      keyframes: {
        'ring-fill': {
          '0%':   { 'stroke-dashoffset': 'var(--circumference)' },
          '100%': { 'stroke-dashoffset': 'var(--target-offset)' },
        },
        confetti: {
          '0%':   { transform: 'translateY(0) rotate(0)', opacity: '1' },
          '100%': { transform: 'translateY(-120px) rotate(540deg)', opacity: '0' },
        },
      },
      animation: {
        'ring-fill': 'ring-fill 600ms ease-out forwards',
        confetti:    'confetti 1.2s ease-out forwards',
      },
    },
  },
  plugins: [],
};
