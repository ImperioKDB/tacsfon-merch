import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-base':      '#0A0A0A',
        'bg-surface':   '#141414',
        'bg-elevated':  '#1E1E1E',
        'text-primary': '#F5F0E8',
        'text-muted':   '#888880',
        accent:         '#3DBA6F',
        'accent-hover': '#E2C46A',
        danger:         '#E05252',
        success:        '#4CAF7D',
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['Space Mono', 'monospace'],
      },
      fontSize: {
        'display-xl': ['clamp(48px, 8vw, 96px)', { lineHeight: '1' }],
        'display-lg': ['clamp(32px, 5vw, 56px)', { lineHeight: '1' }],
        'display-md': ['clamp(24px, 3vw, 36px)', { lineHeight: '1.1' }],
        'display-sm': ['clamp(20px, 2.5vw, 28px)', { lineHeight: '1.1' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      borderRadius: {
        'sm': '2px',
        'md': '4px',
        'lg': '8px',
      },
      transitionDuration: {
        '150': '150ms',
        '250': '250ms',
        '400': '400ms',
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(90deg, #3DBA6F, transparent)',
        'gradient-card': 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)',
      },
      aspectRatio: {
        'product': '3 / 4',
      },
      animation: {
        'fade-in':     'fadeIn 0.4s ease forwards',
        'slide-right': 'slideInRight 0.35s ease forwards',
        'slide-up':    'slideInUp 0.4s ease forwards',
        'shimmer':     'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        slideInUp: {
          from: { opacity: '0', transform: 'translateY(32px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
