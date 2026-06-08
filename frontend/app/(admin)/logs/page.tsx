'use client'

import { useEffect, useState, useCallback } from 'react'
import { ChevronDown, ChevronRight, Activity } from 'lucide-react'
import { toast }                               from 'sonner'
import { apiFetch }                            from '@/lib/api/fetch'

const A = '#5B8CFF'

function formatDateTime(s: string) {
  if (!s) return '—'
  return new Date(s).toLocaleString('en-NG', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

interface LR { id: string; action: string; created_at: string; admin?: { full_name: string }; details?: any }

export default function LogsPage() {
  const [logs,    setLogs]    = useState<LR[]>([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('')
  const [page,    setPage]    = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [expanded, setExpanded] = useState<string | null>(null)

  const load = useCallback(async (p = 1, f = filter) => {
    setLoading(true)
    try {
      const q = new URLSearchParams({ page: String(p), limit: '50' })
      if (f.trim()) q.set('action', f.trim())
      // apiFetch unwraps .data → { logs: [...], pagination: {...} }
      const res = await apiFetch<any>(`/admin/logs?${q}`)
      setLogs(res.logs ?? [])
      setTotalPages(res.pagination?.total_pages ?? 1)
      setPage(p)
    } catch { toast.error('Failed to load logs') }
    finally { setLoading(false) }
  }, [filter])

  useEffect(() => { load(1) }, [load])

  return (
    <div style={{ padding: '24px 16px 80px', maxWidth: '900px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 4px', fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,5vw,32px)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-primary)', lineHeight: 1 }}>Audit Logs</h1>
        <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.2em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Admin action trail</p>
        <div style={{ height: '2px', background: `linear-gradient(90deg, ${A}, transparent)`, marginTop: '14px', maxWidth: '200px' }} />
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          placeholder="Filter by action…"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && load(1, filter)}
          style={{ flex: 1, minWidth: '200px', padding: '10px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '13px', outline: 'none', borderRadius: 0 }}
          onFocus={e => (e.target.style.borderColor = A)}
          onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
        />
        <button onClick={() => load(1, filter)} style={{ padding: '10px 20px', background: A, border: 'none', color: '#fff', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          Search
        </button>
        {filter && (
          <button onClick={() => { setFilter(''); load(1, '') }} style={{ padding: '10px 16px', background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: '12px', cursor: 'pointer' }}>
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'grid', gap: '4px' }}>
          {[1,2,3,4,5].map(i => <div key={i} style={{ height: '48px', background: 'var(--bg-surface)', border: '1px solid var(--border)', animation: 'admin-pulse 1.4s infinite', opacity: 1 - i * 0.1 }} />)}
        </div>
      ) : logs.length === 0 ? (
        <div style={{ padding: '56px 20px', textAlign: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <Activity size={28} style={{ color: 'var(--text-muted)', marginBottom: '10px' }} />
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>No logs found</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '2px', background: 'var(--border)' }}>
          {logs.map(log => (
            <div key={log.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 16px', background: 'var(--bg-surface)', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {formatDateTime(log.created_at)}
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', flexShrink: 0, minWidth: '100px' }}>
                  {log.admin?.full_name ?? '—'}
                </span>
                <span style={{ flex: 1, padding: '2px 8px', background: `${A}12`, border: `1px solid ${A}30`, color: A, fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {log.action}
                </span>
                {log.details && (
                  <button
                    onClick={() => setExpanded(p => p === log.id ? null : log.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '11px', padding: 0, flexShrink: 0 }}
                  >
                    {expanded === log.id ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    Details
                  </button>
                )}
              </div>
              {expanded === log.id && log.details && (
                <div style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border)' }}>
                  <pre style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0, lineHeight: 1.5 }}>
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => load(p)} style={{ width: '36px', height: '36px', border: `1px solid ${p === page ? A : 'var(--border)'}`, background: p === page ? `${A}15` : 'transparent', color: p === page ? A : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', transition: 'all 150ms' }}>
              {p}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes admin-pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>
    </div>
  )
}
