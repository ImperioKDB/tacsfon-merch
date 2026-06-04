import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        accent:       'var(--accent)',
        'accent-hover':'var(--accent-hover)',
        'accent-dim': 'var(--accent-dim)',
        'bg-base':    'var(--bg-base)',
        'bg-surface': 'var(--bg-surface)',
        'bg-elevated':'var(--bg-elevated)',
        'text-primary':'var(--text-primary)',
        'text-muted': 'var(--text-muted)',
        success:      'var(--success)',
        danger:       'var(--danger)',
        warning:      'var(--warning)',
        info:         'var(--info)',
        border:       'var(--border)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body:    ['var(--font-body)'],
        mono:    ['var(--font-mono)'],
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
      },
    },
  },
  plugins: [],
}

export default config
