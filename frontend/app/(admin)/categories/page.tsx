'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2, Tag, Loader2 }       from 'lucide-react'
import { toast }                             from 'sonner'
import { apiFetch }                          from '@/lib/api/fetch'
import ConfirmDialog                         from '@/components/admin/ConfirmDialog'

const A = '#5B8CFF'

export default function CategoriesPage() {
  const [cats,     setCats]     = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const [name,     setName]     = useState('')
  const [saving,   setSaving]   = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      // Public /categories route — apiFetch unwraps .data
      // Response shape after unwrap: { categories: [...] }
      const res = await apiFetch<any>('/categories')
      setCats(res.categories ?? res.data ?? res ?? [])
    } catch { toast.error('Failed to load categories') }
    finally  { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      await apiFetch('/admin/categories', { method: 'POST', body: JSON.stringify({ name: name.trim() }) })
      toast.success(`"${name.trim()}" added`)
      setName('')
      load()
    } catch (err: any) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      await apiFetch(`/admin/categories/${deleteId}`, { method: 'DELETE' })
      toast.success('Category deleted')
      setDeleteId(null)
      load()
    } catch (err: any) { toast.error(err.message) }
  }

  return (
    <div style={{ padding: '24px 16px 80px', maxWidth: '600px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 4px', fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,5vw,32px)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-primary)', lineHeight: 1 }}>
          Categories
        </h1>
        <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.2em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          {cats.length} {cats.length === 1 ? 'category' : 'categories'}
        </p>
        <div style={{ height: '2px', background: `linear-gradient(90deg, ${A}, transparent)`, marginTop: '14px', maxWidth: '200px' }} />
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="New category name…"
          required
          style={{ flex: 1, padding: '12px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '13px', outline: 'none', borderRadius: 0 }}
          onFocus={e => (e.target.style.borderColor = A)}
          onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
          onKeyDown={e => e.key === 'Enter' && handleAdd(e as any)}
        />
        <button type="submit" disabled={saving || !name.trim()} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '12px 20px', background: saving ? 'var(--bg-elevated)' : A, border: 'none', color: saving ? 'var(--text-muted)' : '#fff', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
          {saving ? <Loader2 size={13} style={{ animation: 'admin-spin 0.8s linear infinite' }} /> : <Plus size={13} />}
          Add
        </button>
      </form>

      {/* List */}
      {loading ? (
        <div style={{ display: 'grid', gap: '8px' }}>
          {[1,2,3].map(i => <div key={i} style={{ height: '52px', background: 'var(--bg-surface)', border: '1px solid var(--border)', animation: 'admin-pulse 1.4s infinite' }} />)}
        </div>
      ) : cats.length === 0 ? (
        <div style={{ padding: '48px 20px', textAlign: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <Tag size={28} style={{ color: 'var(--text-muted)', marginBottom: '10px' }} />
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>No categories yet. Add one above.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '2px', background: 'var(--border)' }}>
          {cats.map((c: any) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--bg-surface)', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Tag size={14} style={{ color: A, flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</span>
              </div>
              <button
                onClick={() => setDeleteId(c.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: 'rgba(224,82,82,0.08)', border: '1px solid rgba(224,82,82,0.3)', color: 'var(--danger)', fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}
              >
                <Trash2 size={10} /> Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete Category"
          message="This will fail if products are assigned to this category. Reassign them first."
          confirmLabel="Delete"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}

      <style>{`
        @keyframes admin-pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes admin-spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}
