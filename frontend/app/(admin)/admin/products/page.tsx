'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, X, Save, Image as ImageIcon, Loader2 } from 'lucide-react'
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

  // UPDATED FORM: Now includes stock_qty field
  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    base_price: '', 
    category_id: '', 
    stock_type: 'stock',
    stock_qty: '999999' // Defaults to nearly infinite for unlimited orders
  })

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.category_id) return toast.error("Category required")
    setIsSaving(true)
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')
    try {
      const method = editingId ? 'PATCH' : 'POST'
      const product = await apiFetch<any>(editingId ? `/admin/products/${editingId}` : '/admin/products', {
        method, body: JSON.stringify({ 
            name: form.name, 
            description: form.description, 
            base_price: Number(form.base_price), 
            category_id: form.category_id, 
            stock_type: form.stock_type,
            is_available: true 
        })
      })

      // Create/Update the variant with the specific stock quantity
      if (!editingId) {
          await apiFetch(`/admin/products/${product.id}/variants`, {
              method: 'POST',
              body: JSON.stringify({ 
                  size: 'Standard', 
                  color: 'Default', 
                  stock_qty: Number(form.stock_qty) 
              })
          })
      }

      if (selectedFile) {
          const formData = new FormData()
          formData.append('image', selectedFile)
          const { data: { session } } = await createBrowserClient().auth.getSession()
          await fetch(`${baseUrl}/api/admin/products/${product.id}/image`, {
              method: 'POST', headers: { 'Authorization': `Bearer ${session?.access_token}` }, body: formData
          })
      }
      toast.success("Vault Synchronized")
      setShowPanel(false)
      loadData()
    } catch (err: any) { toast.error(err.message) }
    finally { setIsSaving(false) }
  }

  const columns: Column<any>[] = [
    { key: 'name', label: 'Item', render: r => <span className="font-bold text-white">{r.name}</span> },
    { key: 'price', label: 'Price', render: r => <span className="text-gold font-mono">{formatPrice(r.base_price)}</span> },
    { key: 'act', label: 'Actions', render: r => (
      <div className="flex gap-4">
        <button onClick={() => { 
            setEditingId(r.id); 
            setForm({
                name:r.name, 
                description:r.description||'', 
                base_price:String(r.base_price), 
                category_id:r.category_id, 
                stock_type:r.stock_type,
                stock_qty: '999999'
            }); 
            setShowPanel(true); 
        }} className="text-zinc-500 hover:text-gold"><Pencil size={16}/></button>
        <button onClick={() => handleDelete(r.id)} className="text-zinc-500 hover:text-red-500"><Trash2 size={16}/></button>
      </div>
    )}
  ]

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-8">
        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Inventory</h1>
        <button onClick={() => { 
            setEditingId(null); 
            setForm({name:'', description:'', base_price:'', category_id:'', stock_type:'stock', stock_qty: '999999'}); 
            setShowPanel(true); 
        }} className="bg-gold text-black px-6 py-3 font-black uppercase text-xs">Add Product</button>
      </div>
      <AdminTable columns={columns} rows={products} loading={loading} />
      {showPanel && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowPanel(false)} />
          <div className="relative w-full max-w-md bg-black border-l border-zinc-800 p-8 h-full overflow-y-auto">
             <h2 className="text-2xl font-black text-white uppercase italic mb-10">{editingId ? 'Modify' : 'New Entry'}</h2>
             <form onSubmit={handleSave} className="space-y-6">
                <input type="file" accept="image/*" onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="w-full text-xs text-zinc-500 bg-zinc-900 p-4 border border-zinc-800" />
                <input placeholder="Name" className="w-full bg-zinc-900 p-4 text-white outline-none focus:border-gold border border-transparent" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                
                <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Price" type="number" className="bg-zinc-900 p-4 text-white" value={form.base_price} onChange={e => setForm({...form, base_price: e.target.value})} required />
                    <input placeholder="Initial Stock" type="number" className="bg-zinc-900 p-4 text-white" value={form.stock_qty} onChange={e => setForm({...form, stock_qty: e.target.value})} required />
                </div>

                <select className="w-full bg-zinc-900 p-4 text-white" value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} required>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button disabled={isSaving} className="w-full bg-gold text-black py-4 font-black uppercase tracking-widest flex justify-center items-center gap-2">
                    {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                    {isSaving ? 'Processing...' : 'Save Product'}
                </button>
                <p className="text-[10px] text-zinc-600 text-center uppercase tracking-widest italic">Note: High stock values enable unlimited ordering.</p>
             </form>
          </div>
        </div>
      )}
    </div>
  )
}
