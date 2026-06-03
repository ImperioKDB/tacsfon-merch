'use client'

/**
 * AdminTable
 *
 * Phase 10 — Generic sortable admin data table.
 * - Sortable column headers (click toggles asc/desc)
 * - Alternating row backgrounds
 * - Horizontally scrollable on mobile
 * - Shimmer loading skeleton
 * - Empty state slot
 * - Optional row onClick
 */

import { useState } from 'react'

const ADMIN_ACCENT = '#5B8CFF'

export interface TableColumn {
  key:      string
  label:    string
  sortable?: boolean
  align?:   'left' | 'center' | 'right'
  width?:   string
}

interface AdminTableProps<T extends Record<string, unknown>> {
  columns:     TableColumn[]
  data:        T[]
  renderCell:  (row: T, key: string) => React.ReactNode
  onRowClick?: (row: T) => void
  loading?:    boolean
  emptyState?: React.ReactNode
  rowKey?:     (row: T) => string
}

function SortIcon({ direction }: { direction: 'asc' | 'desc' | null }) {
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', gap: '1px', marginLeft: '5px', verticalAlign: 'middle' }}>
      <svg width="8" height="5" viewBox="0 0 8 5" fill="currentColor" style={{ opacity: direction === 'asc' ? 1 : 0.25 }}>
        <path d="M4 0L7.46 5H.54L4 0z" />
      </svg>
      <svg width="8" height="5" viewBox="0 0 8 5" fill="currentColor" style={{ opacity: direction === 'desc' ? 1 : 0.25 }}>
        <path d="M4 5L.54 0H7.46L4 5z" />
      </svg>
    </span>
  )
}

export default function AdminTable<T extends Record<string, unknown>>({
  columns, data, renderCell, onRowClick,
  loading = false, emptyState, rowKey,
}: AdminTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  function handleSort(col: TableColumn) {
    if (!col.sortable) return
    if (sortKey === col.key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(col.key); setSortDir('asc') }
  }

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0
    const av = a[sortKey]; const bv = b[sortKey]
    if (av == null) return 1; if (bv == null) return -1
    const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
    return sortDir === 'asc' ? cmp : -cmp
  })

  const thStyle = (col: TableColumn): React.CSSProperties => ({
    padding: '12px 16px',
    textAlign: (col.align ?? 'left') as React.CSSProperties['textAlign'],
    fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600,
    letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)',
    whiteSpace: 'nowrap', cursor: col.sortable ? 'pointer' : 'default',
    userSelect: 'none', width: col.width,
    borderBottom: `1px solid rgba(91,140,255,0.1)`,
  })

  const tdStyle = (col: TableColumn, ri: number): React.CSSProperties => ({
    padding: '13px 16px',
    textAlign: (col.align ?? 'left') as React.CSSProperties['textAlign'],
    fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-primary)',
    background: ri % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
    borderBottom: `1px solid rgba(255,255,255,0.04)`,
    whiteSpace: 'nowrap', verticalAlign: 'middle',
  })

  if (loading) {
    return (
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr>{columns.map(col => <th key={col.key} style={thStyle(col)}>{col.label}</th>)}</tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, ri) => (
              <tr key={ri}>
                {columns.map((col, ci) => (
                  <td key={col.key} style={tdStyle(col, ri)}>
                    <div style={{
                      height: '13px', borderRadius: '3px',
                      background: 'linear-gradient(90deg,#1E1E1E 0%,#2a2a2a 50%,#1E1E1E 100%)',
                      backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
                      width: ci === 0 ? '75%' : ci === columns.length - 1 ? '40%' : '55%',
                    }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div style={{ padding: '64px 24px', textAlign: 'center' }}>
        {emptyState ?? (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)' }}>
            No records found.
          </p>
        )}
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} style={thStyle(col)} onClick={() => handleSort(col)}>
                {col.label}
                {col.sortable && <SortIcon direction={sortKey === col.key ? sortDir : null} />}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, ri) => (
            <tr
              key={rowKey ? rowKey(row) : ri}
              onClick={() => onRowClick?.(row)}
              style={{ cursor: onRowClick ? 'pointer' : 'default', transition: 'background 0.1s' }}
              onMouseEnter={e => { if (onRowClick) e.currentTarget.style.background = `${ADMIN_ACCENT}08` }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              {columns.map(col => (
                <td key={col.key} style={tdStyle(col, ri)}>{renderCell(row, col.key)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
