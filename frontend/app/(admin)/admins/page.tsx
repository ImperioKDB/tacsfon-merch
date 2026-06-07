'use client'

import { useEffect, useState, useCallback } from 'react'
import { Trash2, UserPlus, Users, Loader2, ShieldCheck } from 'lucide-react'
import { toast }                             from 'sonner'
import { apiFetch }                          from '@/lib/api/fetch'
import ConfirmDialog                         from '@/components/admin/ConfirmDialog'

const A = '#5B8CFF'

export default function AdminsPage() {
  const [admins,  setAdmins]  = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [email,   setEmail]   = useState('')
  const [adding,  setAdding]  = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try { const d = await apiFetch<any>('/admin/admins'); setAdmins(d.admins ?? d.data ?? []) }
    catch { toast.error('Failed to load admins') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setAdding(true)
    try {
      await apiFetch('/admin/admins', { method: 'POST', body: JSON.stringify({ email: email.trim() }) })
      toast.success('Admin added')
      setEmail('')
      load()
    } catch (err: any) { toast.error(err.message) }
    finally { setAdding(false) }
  }

  async function handleRemove() {
    if (!deleteId) return
    try {
      await apiFetch(`/admin/admins/${deleteId}`, { method: 'DELETE' })
      toast.success('Admin removed')
      setDeleteId(null)
      load()
    } catch (err: any) { toast.error(err.message) }
  }

  return (
    <div style={{ padding: '24px 16px 80px', maxWidth: '600px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 4px', fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,5vw,32px)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-primary)', lineHeight: 1 }}>Admins</h1>
        <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.2em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Manage admin access</p>
        <div style={{ height: '2px', background: `linear-gradient(90deg, ${A}, transparent)`, marginTop: '14px', maxWidth: '200px' }} />
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@email.com" required
          style={{ flex: 1, padding: '12px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '13px', outline: 'none', borderRadius: 0 }}
          onFocus={e => (e.target.style.borderColor = A)} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
        <button type="submit" disabled={adding} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '12px 20px', background: A, border: 'none', color: '#fff', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: adding ? 'not-allowed' : 'pointer', opacity: adding ? 0.6 : 1, whiteSpace: 'nowrap' }}>
          {adding ? <Loader2 size={13} style={{ animation: 'admin-spin 0.8s linear infinite' }} /> : <UserPlus size={13} />}
          Add
        </button>
      </form>

      {/* List */}
      {loading ? (
        <div style={{ display: 'grid', gap: '8px' }}>
          {[1,2].map(i => <div key={i} style={{ height: '64px', background: 'var(--bg-surface)', border: '1px solid var(--border)', animation: 'admin-pulse 1.4s infinite' }} />)}
        </div>
      ) : admins.length === 0 ? (
        <div style={{ padding: '48px 20px', textAlign: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <Users size={28} style={{ color: 'var(--text-muted)', marginBottom: '10px' }} />
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>No admins found</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '2px', background: 'var(--border)' }}>
          {admins.map((a: any) => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: 'var(--bg-surface)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `${A}20`, border: `1px solid ${A}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, color: A }}>{(a.full_name || a.email || 'A').charAt(0).toUpperCase()}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 2px', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{a.full_name || '—'}</p>
                <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{a.email}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', background: `${A}12`, border: `1px solid ${A}30`, color: A, fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  <ShieldCheck size={9} /> Admin
                </span>
                <button onClick={() => setDeleteId(a.id)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', background: 'rgba(224,82,82,0.08)', border: '1px solid rgba(224,82,82,0.3)', color: 'var(--danger)', fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  <Trash2 size={10} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {deleteId && (
        <ConfirmDialog title="Remove Admin" message="This will revoke admin access. The user will no longer be able to access the admin dashboard." confirmLabel="Remove" variant="danger" onConfirm={handleRemove} onCancel={() => setDeleteId(null)} />
      )}
      <style>{`@keyframes admin-pulse{0%,100%{opacity:1}50%{opacity:.5}} @keyframes admin-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
