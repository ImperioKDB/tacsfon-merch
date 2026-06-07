'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, Save, Loader2, Package } from 'lucide-react'
import { toast }               from 'sonner'
import { apiFetch }            from '@/lib/api/fetch'
import { formatPrice }         from '@/lib/utils/formatters'
import { createBrowserClient } from '@/lib/supabase/browser'
import ConfirmDialog           from '@/components/admin/ConfirmDialog'

const A = '#5B8CFF'

function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,5vw,32px)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-primary)', lineHeight: 1 }}>
            {title}
          </h1>
          {sub && <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.2em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{sub}</p>}
        </div>
        {action}
      </div>
      <div style={{ height: '2px', background: `linear-gradient(90deg, ${A}, transparent)`, marginTop: '14px', maxWidth: '200px' }} />
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  display: 'block', width: '100%', boxSizing: 'border-box',
  padding: '12px 14px', background: 'var(--bg-elevated)',
  border: '1px solid var(--border)', color: 'var(--text-primary)',
  fontFamily: 'var(--font-body)', fontSize: '13px',
  outline: 'none', borderRadius: 0, transition: 'border-color 200ms',
}

export default function ProductsPage() {
  const [products,    setProducts]    = useState<any[]>([])
  const [categories,  setCategories]  = useState<any[]>([])
  const [loading,     setLoading]     = useState(true)
  const [showPanel,   setShowPanel]   = useState(false)
  const [editingId,   setEditingId]   = useState<string | null>(null)
  const [isSaving,    setIsSaving]    = useState(false)
  const [deleteId,    setDeleteId]    = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    name: '', description: '', base_price: '',
    category_id: '', stock_type: 'stock', stock_qty: '999999',
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [pd, cd] = await Promise.all([
        apiFetch<any>('/products?is_available=all&limit=100'),
        apiFetch<any>('/categories'),
      ])
      setProducts(pd.products ?? pd.data ?? [])
      setCategories(cd.categories ?? cd.data ?? [])
    } catch { toast.error('Failed to load products') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  function openAdd() {
    setEditingId(null)
    setForm({ name: '', description: '', base_price: '', category_id: '', stock_type: 'stock', stock_qty: '999999' })
    setSelectedFile(null)
    setShowPanel(true)
  }

  function openEdit(r: any) {
    setEditingId(r.id)
    setForm({ name: r.name, description: r.description ?? '', base_price: String(r.base_price), category_id: r.category_id ?? '', stock_type: r.stock_type ?? 'stock', stock_qty: '999999' })
    setSelectedFile(null)
    setShowPanel(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.category_id) return toast.error('Category required')
    setIsSaving(true)
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')
    try {
      const method  = editingId ? 'PATCH' : 'POST'
      const product = await apiFetch<any>(
        editingId ? `/admin/products/${editingId}` : '/admin/products',
        { method, body: JSON.stringify({ name: form.name, description: form.description, base_price: Number(form.base_price), category_id: form.category_id, stock_type: form.stock_type, is_available: true }) }
      )
      if (!editingId) {
        await apiFetch(`/admin/products/${product.id}/variants`, {
          method: 'POST',
          body: JSON.stringify({ size: 'Standard', color: 'Default', stock_qty: Number(form.stock_qty) }),
        })
      }
      if (selectedFile) {
        const fd = new FormData()
        fd.append('image', selectedFile)
        const { data: { session } } = await createBrowserClient().auth.getSession()
        await fetch(`${baseUrl}/api/admin/products/${product.id}/image`, {
          method: 'POST', headers: { 'Authorization': `Bearer ${session?.access_token}` }, body: fd,
        })
      }
      toast.success(editingId ? 'Product updated' : 'Product added')
      setShowPanel(false)
      loadData()
    } catch (err: any) { toast.error(err.message) }
    finally { setIsSaving(false) }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      await apiFetch(`/admin/products/${deleteId}`, { method: 'DELETE' })
      toast.success('Product deleted')
      setDeleteId(null)
      loadData()
    } catch (err: any) { toast.error(err.message) }
  }

  return (
    <div style={{ padding: '24px 16px 80px', maxWidth: '900px' }}>
      <PageHeader
        title="Products"
        sub="Manage your catalogue"
        action={
          <button onClick={openAdd} style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            padding: '10px 20px', background: A, border: 'none',
            color: '#fff', fontFamily: 'var(--font-body)', fontSize: '12px',
            fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            cursor: 'pointer',
          }}>
            <Plus size={14} /> Add Product
          </button>
        }
      />

      {/* Product list */}
      {loading ? (
        <div style={{ display: 'grid', gap: '10px' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ height: '72px', background: 'var(--bg-surface)', border: '1px solid var(--border)', animation: 'admin-pulse 1.4s infinite' }} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div style={{ padding: '56px 20px', textAlign: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <Package size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '20px', letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>No products yet</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '2px', background: 'var(--border)' }}>
          {products.map((r: any) => (
            <div key={r.id} style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '16px', background: 'var(--bg-surface)',
            }}>
              {/* Thumbnail */}
              <div style={{ width: '48px', height: '56px', background: 'var(--bg-elevated)', flexShrink: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
                {r.image_url && <img src={r.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 3px', fontFamily: 'var(--font-display)', fontSize: '15px', letterSpacing: '0.04em', color: 'var(--text-primary)', textTransform: 'uppercase', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{r.name}</p>
                <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>{formatPrice(r.base_price)}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button onClick={() => openEdit(r)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: `${A}12`, border: `1px solid ${A}40`, color: A, fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  <Pencil size={11} /> Edit
                </button>
                <button onClick={() => setDeleteId(r.id)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: 'rgba(224,82,82,0.08)', border: '1px solid rgba(224,82,82,0.3)', color: 'var(--danger)', fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  <Trash2 size={11} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-in panel */}
      {showPanel && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} onClick={() => setShowPanel(false)} />
          <div style={{ position: 'relative', width: '100%', maxWidth: '440px', background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)', padding: '28px 24px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '22px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                {editingId ? 'Edit Product' : 'Add Product'}
              </h2>
              <button onClick={() => setShowPanel(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Field label="Product Image">
                <input type="file" accept="image/*" onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                  style={{ ...inputStyle, fontSize: '12px', color: 'var(--text-muted)' }} />
              </Field>
              <Field label="Product Name">
                <input placeholder="e.g. Classic Round Neck" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
                  style={inputStyle} onFocus={e => (e.target.style.borderColor = A)} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
              </Field>
              <Field label="Description (optional)">
                <textarea placeholder="Brief description…" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} onFocus={e => (e.target.style.borderColor = A)} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="Price (₦)">
                  <input type="number" placeholder="6000" value={form.base_price} onChange={e => setForm({...form, base_price: e.target.value})} required
                    style={inputStyle} onFocus={e => (e.target.style.borderColor = A)} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
                </Field>
                <Field label="Initial Stock">
                  <input type="number" placeholder="999999" value={form.stock_qty} onChange={e => setForm({...form, stock_qty: e.target.value})} required
                    style={inputStyle} onFocus={e => (e.target.style.borderColor = A)} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
                </Field>
              </div>
              <Field label="Category">
                <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} required
                  style={{ ...inputStyle, appearance: 'none' }}>
                  <option value="">Select category…</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Stock Type">
                <select value={form.stock_type} onChange={e => setForm({...form, stock_type: e.target.value})}
                  style={{ ...inputStyle, appearance: 'none' }}>
                  <option value="stock">In Stock</option>
                  <option value="preorder">Pre-order</option>
                  <option value="both">Both</option>
                </select>
              </Field>
              <button type="submit" disabled={isSaving} style={{
                marginTop: '8px', width: '100%', minHeight: '48px',
                background: isSaving ? 'var(--bg-elevated)' : A,
                border: 'none', color: isSaving ? 'var(--text-muted)' : '#fff',
                fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}>
                {isSaving ? <><Loader2 size={14} style={{ animation: 'admin-spin 0.8s linear infinite' }} /> Saving…</> : <><Save size={14} /> {editingId ? 'Save Changes' : 'Add Product'}</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete Product"
          message="This permanently removes the product and all its variants. Cannot be undone."
          confirmLabel="Delete"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}

      <style>{`
        @keyframes admin-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes admin-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
        {label}
      </label>
      {children}
    </div>
  )
}
