'use client';
import React from 'react'

/** Legacy typed column — used by confirmed / dispatched / completed / history / receipts pages */
export interface Column<T> { 
  key: string; 
  label: string; 
  render: (row: T) => React.ReactNode 
}

/** Phase-10 column descriptor — used by pending / (future) admin pages */
export interface TableColumn {
  key:      string
  label:    string
  sortable?: boolean
  align?:   'left' | 'center' | 'right'
  width?:   string
}

/* ── Legacy props (Column<T> + rows + render inside column) ── */
interface LegacyProps<T extends { id: string }> {
  columns:      Column<T>[]
  rows:         T[]
  loading:      boolean
  emptyMessage?: string
  // Phase-10 props absent so TS narrows correctly
  data?:        never
  renderCell?:  never
  onRowClick?:  never
  rowKey?:      never
  emptyState?:  never
}

/* ── Phase-10 props (TableColumn + data + external renderCell) ── */
interface Phase10Props {
  columns:     TableColumn[]
  data:        Record<string, unknown>[]
  loading:     boolean
  renderCell:  (row: Record<string, unknown>, key: string) => React.ReactNode
  onRowClick?: (row: Record<string, unknown>) => void
  rowKey:      (row: Record<string, unknown>) => string
  emptyState?: React.ReactNode
  // Legacy props absent
  rows?:       never
  emptyMessage?: never
}

type AdminTableProps<T extends { id: string }> = LegacyProps<T> | Phase10Props

function isPhase10<T extends { id: string }>(
  props: AdminTableProps<T>
): props is Phase10Props {
  return 'data' in props && props.data !== undefined
}

export default function AdminTable<T extends { id: string }>(props: AdminTableProps<T>) {
  const { columns, loading } = props

  /* ── Phase-10 render path ── */
  if (isPhase10(props)) {
    const { data, renderCell, onRowClick, rowKey, emptyState } = props
    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', fontFamily: 'var(--font-body)' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {(columns as TableColumn[]).map(col => (
                <th
                  key={col.key}
                  style={{
                    padding:       '12px 16px',
                    textAlign:     col.align ?? 'left',
                    width:         col.width,
                    fontFamily:    'var(--font-body)',
                    fontSize:      '10px',
                    fontWeight:    700,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color:         'var(--text-muted)',
                    whiteSpace:    'nowrap',
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '11px' }}
                >
                  Loading…
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  {emptyState ?? (
                    <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                      No data.
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              data.map(row => (
                <tr
                  key={rowKey(row)}
                  onClick={() => onRowClick?.(row)}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    cursor:       onRowClick ? 'pointer' : 'default',
                    transition:   'background 150ms',
                  }}
                  onMouseEnter={e => { if (onRowClick) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  {(columns as TableColumn[]).map(col => (
                    <td
                      key={col.key}
                      style={{
                        padding:   '14px 16px',
                        textAlign: col.align ?? 'left',
                        width:     col.width,
                        color:     'var(--text-secondary)',
                        verticalAlign: 'middle',
                      }}
                    >
                      {renderCell(row, col.key)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    )
  }

  /* ── Legacy render path (Column<T> with inline render fn) ── */
  const { rows, emptyMessage = 'No data.' } = props as LegacyProps<T>
  return (
    <div className="border border-white/5 overflow-x-auto">
      <table className="w-full text-[10px] font-body uppercase tracking-[0.15em]">
        <thead>
          <tr className="bg-white/5 text-zinc-600 italic">
            {(columns as Column<T>[]).map(col => (
              <th key={col.key} className="p-4 text-left font-black">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length} className="p-12 text-center text-zinc-800 animate-pulse font-black italic">SYNCING_VAULT...</td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan={columns.length} className="p-12 text-center text-zinc-700 italic">{emptyMessage}</td></tr>
          ) : (
            rows.map(row => (
              <tr key={row.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                {(columns as Column<T>[]).map(col => (
                  <td key={col.key} className="p-4 text-zinc-300 font-medium">{col.render(row)}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
