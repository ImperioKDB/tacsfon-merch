import React from 'react'
export interface Column<T> { key: string; label: string; render: (row: T) => React.ReactNode }
interface Props<T> { columns: Column<T>[]; rows: T[]; loading: boolean; emptyMessage?: string }
export default function AdminTable<T extends { id: string }>({ columns, rows, loading, emptyMessage = 'No data.' }: Props<T>) {
  return (
    <div style={{ border: '1px solid var(--color-border)', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', fontFamily: 'var(--font-inter)' }}>
        <thead>
          <tr style={{ background: 'var(--color-surface-2)' }}>
            {columns.map(col => <th key={col.key} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)', whiteSpace: 'nowrap' }}>{col.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }, (_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {columns.map(col => <td key={col.key} style={{ padding: '12px 14px' }}><div className="animate-pulse" style={{ height: '14px', background: 'var(--color-surface-2)', width: '70%' }} /></td>)}
                </tr>
              ))
            : rows.length === 0
              ? <tr><td colSpan={columns.length} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-disabled)', fontSize: '0.875rem' }}>{emptyMessage}</td></tr>
              : rows.map(row => (
                  <tr key={row.id} style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'var(--color-surface-2)'}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'var(--color-surface)'}>
                    {columns.map(col => <td key={col.key} style={{ padding: '12px 14px', color: 'var(--color-text-primary)', verticalAlign: 'middle' }}>{col.render(row)}</td>)}
                  </tr>
                ))
          }
        </tbody>
      </table>
    </div>
  )
}