'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2, ShieldCheck, Users, Loader2 } from 'lucide-react'
import { toast }                             from 'sonner'
import { apiFetch, ApiError }               from '@/lib/api/fetch'
import { createBrowserClient }              from '@/lib/supabase/browser'
import ConfirmDialog                         from '@/components/admin/ConfirmDialog'

const A = '#5B8CFF'

interface AP { id: string; full_name: string; email: string; created_at: string }

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '11px 14px',
  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
  color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '13px',
  outline: 'none', borderRadius: 0, transition: 'border-color 200ms',
}

export default function AdminsPage() {
  const [admins,  setAdmins]  = useState<AP[]>([])
  const [loading, setLoading] = useState(true)
  const [myId,    setMyId]    = useState<string | null>(null)
  const [showPanel, setShowPanel] = useState(false)
  const [form,    setForm]    = useState({ email: '', full_name: '', password: '' })
  const [saving,  setSaving]  = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AP | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const sb = createBrowserClient()
      const { data: { session } } = await sb.auth.getSession()
      setMyId(session?.user.id ?? null)
      // Direct Supabase query — no GET /admin/admins API route exists
      const { data, error } = await sb
        .from('profiles')
        .select('id, full_name, email, created_at')
        .eq('role', 'admin')
        .order('created_at', { ascending: false })
      if (error) throw error
      setAdmins(data as AP[])
    } catch { toast.error('Failed to load admins') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.email.trim() || !form.full_name.trim() || form.password.length < 8) {
      toast.error('All fields required. Password min 8 chars.')
      return
    }
    setSaving(true)
    try {
      await apiFetch('/admin/admins', { method: 'POST', body: JSON.stringify(form) })
      toast.success(`${form.full_name} added as admin`)
      setForm({ email: '', full_name: '', password: '' })
      setShowPanel(false)
      load()
    } catch (err) { toast.error(err instanceof ApiError ? err.message : 'Failed to add admin') }
    finally { setSaving(false) }
  }

  async function handleRemove() {
    if (!deleteTarget) return
    try {
      await apiFetch(`/admin/admins/${deleteTarget.id}`, { method: 'DELETE' })
      toast.success(`${deleteTarget.full_name} removed`)
      setDeleteTarget(null)
      load()
    } catch (err) { toast.error(err instanceof ApiError ? err.message : 'Failed') }
  }

  function initial(name: string) {
    return (name || 'A').charAt(0).toUpperCase()
  }

  return (
    <div style={{ padding: '24px 16px 80px', maxWidth: '680px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: '0 0 4px', fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,5vw,32px)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-primary)', lineHeight: 1 }}>
              Admins
            </h1>
            <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.2em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {admins.length} admin{admins.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={() => setShowPanel(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '10px 20px', background: A, border: 'none', color: '#fff', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
            <Plus size={14} /> Add Admin
          </button>
        </div>
        <div style={{ height: '2px', background: `linear-gradient(90deg, ${A}, transparent)`, marginTop: '14px', maxWidth: '200px' }} />
      </div>

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
          {admins.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: 'var(--bg-surface)' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: `${A}20`, border: `1px solid ${A}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 700, color: A }}>{initial(a.full_name)}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 2px', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {a.full_name}
                  {a.id === myId && <span style={{ marginLeft: '8px', fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--accent)', letterSpacing: '0.1em' }}>YOU</span>}
                </p>
                <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{a.email}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', background: `${A}12`, border: `1px solid ${A}30`, color: A, fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  <ShieldCheck size={9} /> Admin
                </span>
                <button
                  onClick={() => setDeleteTarget(a)}
                  disabled={a.id === myId}
                  title={a.id === myId ? 'Cannot remove yourself' : 'Remove admin'}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', background: 'rgba(224,82,82,0.08)', border: '1px solid rgba(224,82,82,0.3)', color: a.id === myId ? 'var(--text-muted)' : 'var(--danger)', fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, cursor: a.id === myId ? 'not-allowed' : 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: a.id === myId ? 0.4 : 1 }}
                >
                  <Trash2 size={10} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add admin slide-in panel */}
      {showPanel && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} onClick={() => setShowPanel(false)} />
          <div style={{ position: 'relative', width: '100%', maxWidth: '420px', background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)', padding: '28px 24px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '22px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>Add Admin</h2>
              <button onClick={() => setShowPanel(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Full Name',          key: 'full_name', type: 'text',     placeholder: 'John Doe' },
                { label: 'Email',              key: 'email',     type: 'email',    placeholder: 'admin@example.com' },
                { label: 'Password (min 8)',   key: 'password',  type: 'password', placeholder: '••••••••' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    {label}
                  </label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    required
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = A)}
                    onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
              ))}
              <button type="submit" disabled={saving} style={{ marginTop: '8px', width: '100%', minHeight: '48px', background: saving ? 'var(--bg-elevated)' : A, border: 'none', color: saving ? 'var(--text-muted)' : '#fff', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {saving ? <><Loader2 size={14} style={{ animation: 'admin-spin 0.8s linear infinite' }} /> Creating…</> : <><Plus size={14} /> Create Admin</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Remove Admin"
          message={`${deleteTarget.full_name}'s admin access will be revoked. They will no longer access the admin dashboard.`}
          confirmLabel="Remove Admin"
          variant="danger"
          onConfirm={handleRemove}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <style>{`
        @keyframes admin-pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes admin-spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}
