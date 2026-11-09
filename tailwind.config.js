/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand:   { DEFAULT: '#4F46E5', dark: '#4338CA' },
        accent:  '#2052EB',
        blush:   '#FADBE5',
        mint:    '#F4FFC9',
        cream:   '#E3E0DC',
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
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        rise: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '15%, 45%': { transform: 'scale(1.25)' },
          '30%':      { transform: 'scale(1)' },
        },
        breathe: {
          '0%':   { transform: 'translate(-50%, -50%) scale(1)',   opacity: '0.55' },
          '100%': { transform: 'translate(-50%, -50%) scale(1.12)', opacity: '1' },
        },
      },
      animation: {
        'ring-fill': 'ring-fill 600ms ease-out forwards',
        confetti:    'confetti 1.2s ease-out forwards',
        float:       'float 7s ease-in-out infinite',
        'float-slow': 'float 11s ease-in-out infinite',
        rise:        'rise 800ms ease-out both',
        marquee:     'marquee 40s linear infinite',
        heartbeat:   'heartbeat 2s cubic-bezier(0.25, 1, 0.5, 1) infinite',
        breathe:     'breathe 8s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [],
};
