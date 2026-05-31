'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, X, Save, Image as ImageIcon, AlertTriangle } from 'lucide-react'
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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [form, setForm] = useState({ name: '', description: '', base_price: '', category_id: '', stock_type: 'stock' })

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.name.toLowerCase().endsWith('.heic')) {
        toast.error("iPhone HEIC format not supported. Please convert to JPEG or PNG.");
        return;
    }
    setSelectedFile(file);
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.category_id) return toast.error("Select a category");
    setIsSaving(true)
    try {
      const method = editingId ? 'PATCH' : 'POST'
      const path = editingId ? `/admin/products/${editingId}` : '/admin/products'
      const product = await apiFetch<any>(path, {
        method,
        body: JSON.stringify({ ...form, base_price: Number(form.base_price), is_available: true })
      })

      // If new product, create at least ONE default variant so it's not "OUT OF STOCK"
      if (!editingId) {
          await apiFetch(`/admin/products/${product.id}/variants`, {
              method: 'POST',
              body: JSON.stringify({ size: 'Standard', color: 'Default', stock_qty: 100 })
          })
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
      toast.success("Inventory Synchronized")
      setShowPanel(false)
      loadData()
    } catch (err: any) { toast.error(err.message) }
    finally { setIsSaving(false) }
  }

  const columns: Column<any>[] = [
    { key: 'name', label: 'Item', render: r => <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
            {r.image_url ? <img src={r.image_url} className="w-full h-full object-cover" /> : <ImageIcon size={14} className="text-zinc-700"/>}
        </div>
        <span className="font-bold text-white">{r.name}</span>
    </div>},
    { key: 'price', label: 'Price', render: r => <span className="text-gold font-mono">{formatPrice(r.base_price)}</span> },
    { key: 'act', label: '', render: r => <button onClick={() => { setEditingId(r.id); setForm({name:r.name, description:r.description||'', base_price:r.base_price, category_id:r.category_id, stock_type:r.stock_type}); setShowPanel(true); }} className="text-zinc-500 hover:text-gold"><Pencil size={16}/></button> }
  ]

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-8">
        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Inventory</h1>
        <button onClick={() => { setEditingId(null); setForm({name:'', description:'', base_price:'', category_id:'', stock_type:'stock'}); setShowPanel(true); }} className="bg-gold text-black px-6 py-2 font-black uppercase text-xs">Add Merch</button>
      </div>
      <AdminTable columns={columns} rows={products} loading={loading} />
      
      {showPanel && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowPanel(false)} />
          <div className="relative w-full max-w-md bg-black border-l border-zinc-800 p-8 h-full overflow-y-auto">
             <h2 className="text-2xl font-black text-white mb-8 italic uppercase">{editingId ? 'Modify' : 'Create'}</h2>
             <form onSubmit={handleSave} className="space-y-6">
                <div className="p-4 border-2 border-dashed border-zinc-800 text-center">
                    <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} className="w-full text-xs text-zinc-500" />
                    <p className="text-[9px] uppercase font-black text-amber-500 mt-2 flex items-center justify-center gap-1"><AlertTriangle size={10}/> NO HEIC (iPHONE) FILES</p>
                </div>
                <input placeholder="Product Name" className="w-full bg-zinc-900 p-4 text-white outline-none focus:border-gold border border-transparent" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                <input placeholder="Price" type="number" className="w-full bg-zinc-900 p-4 text-white outline-none focus:border-gold border border-transparent" value={form.base_price} onChange={e => setForm({...form, base_price: e.target.value})} required />
                <select className="w-full bg-zinc-900 p-4 text-white outline-none" value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} required>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button disabled={isSaving} className="w-full bg-gold text-black py-4 font-black uppercase tracking-widest">{isSaving ? 'Processing...' : 'Commit to Vault'}</button>
             </form>
          </div>
        </div>
      )}
    </div>
  )
}
