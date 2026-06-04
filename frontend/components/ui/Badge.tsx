interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'gold'
}

const STYLES: Record<string, React.CSSProperties> = {
  default: {
    background: 'var(--bg-elevated)',
    color: 'var(--text-muted)',
    border: '1px solid var(--border)',
  },
  success: {
    background: 'rgba(45,158,107,0.12)',
    color: 'var(--success)',
    border: '1px solid rgba(45,158,107,0.25)',
  },
  warning: {
    background: 'rgba(232,168,48,0.12)',
    color: 'var(--color-warning)',
    border: '1px solid rgba(232,168,48,0.25)',
  },
  error: {
    background: 'rgba(217,79,79,0.12)',
    color: 'var(--danger)',
    border: '1px solid rgba(217,79,79,0.25)',
  },
  gold: {
    background: 'rgba(61,186,111,0.10)',
    color: 'var(--accent)',
    border: '1px solid rgba(200,134,10,0.3)',
  },
}

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span
      style={{
        ...STYLES[variant],
        display: 'inline-block',
        padding: '2px 8px',
        fontSize: '0.5625rem',
        fontFamily: 'var(--font-body)',
        fontWeight: 500,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </span>
  )
}