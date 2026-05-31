'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, X, Save, Image as ImageIcon, Layers, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api/fetch'
import { formatPrice } from '@/lib/utils/formatters'
import AdminTable, { type Column } from '@/components/admin/AdminTable'
import { createBrowserClient } from '@/lib/supabase/browser'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showPanel, setShowPanel] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [form, setForm] = useState({ name: '', description: '', base_price: '', category_id: '', stock_type: 'stock' })
  const [variants, setVariants] = useState([{ size: 'M', color: 'Black', stock_qty: 50 }])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch<any>('/products?is_available=all&limit=100')
      const catData = await apiFetch<any>('/categories')
      setProducts(data.products || [])
      setCategories(catData.categories || [])
    } catch { toast.error('Sync failed') } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This is permanent.")) return;
    try {
      await apiFetch(`/admin/products/${id}`, { method: 'DELETE' });
      toast.success("Item Purged");
      loadData();
    } catch (err: any) { toast.error(err.message); }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const method = editingId ? 'PATCH' : 'POST'
      const path = editingId ? `/admin/products/${editingId}` : '/admin/products'
      
      const product = await apiFetch<any>(path, {
        method,
        body: JSON.stringify({ ...form, base_price: Number(form.base_price), is_available: true })
      })

      if (!editingId) {
        for (const v of variants) {
          await apiFetch(`/admin/products/${product.id}/variants`, { method: 'POST', body: JSON.stringify(v) })
        }
      }

      if (selectedFile) {
          const formData = new FormData()
          formData.append('image', selectedFile)
          const { data: { session } } = await createBrowserClient().auth.getSession()
          const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')
          await fetch(`${baseUrl}/api/admin/products/${product.id}/image`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${session?.access_token}` },
              body: formData
          })
      }

      toast.success("Vault Updated")
      setShowPanel(false)
      setEditingId(null)
      loadData()
    } catch (err: any) { toast.error(err.message) }
    finally { setIsSaving(false) }
  }

  const columns: Column<any>[] = [
    { key: 'name', label: 'Item', render: r => <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-zinc-900 overflow-hidden border border-zinc-800 flex items-center justify-center">
            {r.image_url ? <img src={`${r.image_url}?t=${new Date().getTime()}`} className="w-full h-full object-cover" /> : <ImageIcon size={14} className="text-zinc-700"/>}
        </div>
        <span className="font-bold text-white">{r.name}</span>
    </div>},
    { key: 'price', label: 'Price', render: r => <span className="text-gold">{formatPrice(r.base_price)}</span> },
    { key: 'act', label: 'Actions', render: r => (
        <div className="flex gap-4">
            <button onClick={() => { setEditingId(r.id); setForm({name:r.name, description:r.description||'', base_price:String(r.base_price), category_id:r.category_id, stock_type:r.stock_type}); setShowPanel(true); }} className="text-zinc-600 hover:text-gold"><Pencil size={16}/></button>
            <button onClick={() => handleDelete(r.id)} className="text-zinc-800 hover:text-red-500"><Trash2 size={16}/></button>
        </div>
    )}
  ]

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-8">
        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Inventory</h1>
        <button onClick={() => { setEditingId(null); setForm({name:'', description:'', base_price:'', category_id:'', stock_type:'stock'}); setShowPanel(true); }} className="bg-gold text-black px-8 py-4 font-black uppercase text-xs">Create New</button>
      </div>

      <AdminTable columns={columns} rows={products} loading={loading} />

      {showPanel && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowPanel(false)} />
          <div className="relative w-full max-w-xl bg-zinc-950 p-8 h-full overflow-y-auto">
             <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-white uppercase italic">{editingId ? 'Modify' : 'New Entry'}</h2>
                <button onClick={() => setShowPanel(false)}><X/></button>
             </div>
             <form onSubmit={handleCreate} className="space-y-6">
                <input type="file" accept="image/png, image/jpeg" onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="w-full bg-zinc-900 p-4 text-xs text-zinc-500 border border-zinc-800" />
                <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Name" className="bg-zinc-900 border border-zinc-800 p-4 text-white outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                    <input placeholder="Price" className="bg-zinc-900 border border-zinc-800 p-4 text-white outline-none" value={form.base_price} onChange={e => setForm({...form, base_price: e.target.value})} />
                </div>
                <select className="w-full bg-zinc-900 border border-zinc-800 p-4 text-white outline-none" value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {!editingId && (
                   <div className="border-t border-zinc-800 pt-6">
                      <p className="text-[10px] font-black text-gold uppercase tracking-[0.2em] mb-4">Initial Variant</p>
                      <div className="grid grid-cols-3 gap-2">
                        <input placeholder="Size" className="bg-black p-3 text-xs text-white" value={variants[0].size} onChange={e => { let v = [...variants]; v[0].size = e.target.value; setVariants(v); }} />
                        <input placeholder="Color" className="bg-black p-3 text-xs text-white" value={variants[0].color} onChange={e => { let v = [...variants]; v[0].color = e.target.value; setVariants(v); }} />
                        <input placeholder="Stock" type="number" className="bg-black p-3 text-xs text-white" value={variants[0].stock_qty} onChange={e => { let v = [...variants]; v[0].stock_qty = Number(e.target.value); setVariants(v); }} />
                      </div>
                   </div>
                )}
                <button type="submit" disabled={isSaving} className="w-full bg-gold text-black py-5 font-black uppercase text-xs flex justify-center items-center gap-2">
                    {isSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
                    {isSaving ? "SYNCING..." : "COMMIT CHANGES"}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  )
}
