'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, X, Save, Image as ImageIcon } from 'lucide-react'
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

  const handleOpenEdit = (p: any) => {
    setEditingId(p.id)
    setForm({ name: p.name, description: p.description || '', base_price: String(p.base_price), category_id: p.category_id, stock_type: p.stock_type })
    setShowPanel(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')
    try {
      const method = editingId ? 'PATCH' : 'POST'
      const path = editingId ? `/admin/products/${editingId}` : '/admin/products'
      
      const product = await apiFetch<any>(path, {
        method,
        body: JSON.stringify({ ...form, base_price: Number(form.base_price), is_available: true })
      })

      if (selectedFile) {
          const formData = new FormData()
          formData.append('image', selectedFile)
          const { data: { session } } = await createBrowserClient().auth.getSession()
          // FIX: Use absolute URL for direct image upload
          await fetch(`${baseUrl}/api/admin/products/${product.id}/image`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${session?.access_token}` },
              body: formData
          })
      }
      toast.success("Vault Updated")
      setShowPanel(false)
      loadData()
    } catch (err: any) { toast.error(err.message) }
  }

  const columns: Column<any>[] = [
    { key: 'name', label: 'Item', render: r => <span className="font-bold text-white">{r.name}</span> },
    { key: 'price', label: 'Price', render: r => <span className="text-gold">{formatPrice(r.base_price)}</span> },
    { key: 'act', label: '', render: r => <button onClick={() => handleOpenEdit(r)} className="text-zinc-600 hover:text-gold"><Pencil size={14}/></button> }
  ]

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-8">
        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Inventory</h1>
        <button onClick={() => { setEditingId(null); setForm({name:'', description:'', base_price:'', category_id:'', stock_type:'stock'}); setShowPanel(true); }} className="bg-gold text-black px-6 py-2 font-black uppercase text-xs">Create New</button>
      </div>
      <AdminTable columns={columns} rows={products} loading={loading} />
      {showPanel && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowPanel(false)} />
          <div className="relative w-full max-w-md bg-zinc-950 p-8 h-full border-l border-zinc-800">
             <h2 className="text-2xl font-black text-white mb-8 italic uppercase">{editingId ? 'Edit Item' : 'New Entry'}</h2>
             <form onSubmit={handleSave} className="space-y-6">
                <input type="file" onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="w-full bg-zinc-900 p-4 text-xs text-zinc-500" />
                <input placeholder="Name" className="w-full bg-zinc-900 p-4 text-white" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                <input placeholder="Price" className="w-full bg-zinc-900 p-4 text-white" value={form.base_price} onChange={e => setForm({...form, base_price: e.target.value})} />
                <select className="w-full bg-zinc-900 p-4 text-white" value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button type="submit" className="w-full bg-gold text-black py-4 font-black uppercase text-xs">Commit Changes</button>
             </form>
          </div>
        </div>
      )}
    </div>
  )
}
