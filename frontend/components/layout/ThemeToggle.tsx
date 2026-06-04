'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon }           from 'lucide-react'

const STORAGE_KEY = 'tacsfon-theme'
type Theme = 'dark' | 'light'

export default function ThemeToggle() {
  // Start with null to avoid hydration mismatch — icon renders after mount
  const [theme, setTheme] = useState<Theme | null>(null)

  // On mount, read the value that the inline <script> already applied
  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme) ?? 'dark'
    setTheme(stored)
  }, [])

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem(STORAGE_KEY, next)
    document.documentElement.setAttribute('data-theme', next)
  }

  // Don't render until we know the current theme (avoids icon flash)
  if (!theme) return <div style={{ width: '44px', height: '44px' }} />

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      title={theme === 'dark'  ? 'Light mode' : 'Dark mode'}
      style={{
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        width:           '44px',
        height:          '44px',
        background:      'none',
        border:          'none',
        cursor:          'pointer',
        color:           'var(--text-muted)',
        borderRadius:    '2px',
        transition:      'color 150ms ease',
        flexShrink:      0,
      }}
      className="theme-toggle"
    >
      {theme === 'dark'
        ? <Sun  size={16} strokeWidth={1.75} />
        : <Moon size={16} strokeWidth={1.75} />
      }
      <style>{`
        .theme-toggle:hover { color: #3DBA6F !important; }
      `}</style>
    </button>
  )
}
