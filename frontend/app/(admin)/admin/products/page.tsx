'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, X, Save, Package, Image as ImageIcon, Layers } from 'lucide-react'
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
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [form, setForm] = useState({ name: '', description: '', base_price: '', category_id: '', stock_type: 'stock' })
  const [variants, setVariants] = useState([{ size: 'M', color: 'Black', stock_qty: 50 }])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // Promise.all will now succeed because Bug 1 is fixed in the backend
      const [pData, cData] = await Promise.all([
        apiFetch<any>('/products?is_available=all&limit=100'),
        apiFetch<any>('/categories')
      ])
      setProducts(pData.products || [])
      setCategories(cData.categories || [])
    } catch (e) { 
      toast.error('Data sync failed. Check backend logs.') 
    } finally { 
      setLoading(false) 
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.category_id) {
        toast.error("Category selection is required.");
        return;
    }
    setIsSaving(true)
    try {
      const product = await apiFetch<any>('/admin/products', {
        method: 'POST',
        body: JSON.stringify({ ...form, base_price: Number(form.base_price), is_available: true })
      })

      for (const v of variants) {
          await apiFetch(`/admin/products/${product.id}/variants`, {
              method: 'POST',
              body: JSON.stringify(v)
          })
      }

      if (selectedFile) {
          const formData = new FormData()
          formData.append('image', selectedFile)
          const { data: { session } } = await createBrowserClient().auth.getSession()
          await fetch(`/api/admin/products/${product.id}/image`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${session?.access_token}` },
              body: formData
          })
      }

      toast.success("Inventory Updated")
      setShowPanel(false)
      loadData()
    } catch (err: any) { toast.error(err.message) }
    finally { setIsSaving(false) }
  }

  const columns: Column<any>[] = [
    { key: 'name', label: 'Item', render: r => <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-zinc-800 overflow-hidden">
            {r.image_url && <img src={`${r.image_url}?t=${new Date().getTime()}`} className="w-full h-full object-cover" />}
        </div>
        <span className="font-bold text-white">{r.name}</span>
    </div>},
    { key: 'price', label: 'Price', render: r => <span className="text-gold">{formatPrice(r.base_price)}</span> },
    { key: 'act', label: '', render: r => <button className="text-zinc-600 hover:text-gold"><Pencil size={14}/></button> }
  ]

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end border-b border-zinc-800 pb-8">
        <h1 className="text-5xl font-black text-white italic tracking-tighter leading-none">Inventory<span className="text-gold">.</span></h1>
        <button onClick={() => setShowPanel(true)} className="bg-gold text-black px-8 py-4 font-black uppercase text-xs tracking-widest active:scale-95 transition-all">Create Product</button>
      </div>

      <AdminTable columns={columns} rows={products} loading={loading} emptyMessage="No products discovered." />

      {showPanel && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowPanel(false)} />
          <div className="relative w-full max-w-xl bg-zinc-950 p-8 h-full overflow-y-auto border-l border-zinc-800">
             <h2 className="text-3xl font-black text-white mb-8 italic uppercase tracking-tighter">New Entry</h2>
             
             <form onSubmit={handleCreate} className="space-y-6">
                <input type="file" onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="w-full bg-zinc-900 p-4 text-xs text-zinc-500 border border-zinc-800" />
                
                <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Product Name" className="bg-zinc-900 border border-zinc-800 p-4 text-white focus:border-gold outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                    <input placeholder="Price" className="bg-zinc-900 border border-zinc-800 p-4 text-white focus:border-gold outline-none" value={form.base_price} onChange={e => setForm({...form, base_price: e.target.value})} />
                </div>

                {/* BUG 3 FIX: Added value="" to the placeholder option */}
                <select required className="w-full bg-zinc-900 border border-zinc-800 p-4 text-white focus:border-gold outline-none" value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>

                <div className="border-t border-zinc-800 pt-6">
                    <p className="text-[10px] font-black text-gold uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Layers size={14}/> Variant Matrix</p>
                    {variants.map((v, i) => (
                        <div key={i} className="grid grid-cols-3 gap-2 mb-2">
                            <input placeholder="Size" className="bg-black border border-zinc-900 p-3 text-xs text-white" value={v.size} onChange={e => {
                                const newV = [...variants]; newV[i].size = e.target.value; setVariants(newV);
                            }} />
                            <input placeholder="Color" className="bg-black border border-zinc-900 p-3 text-xs text-white" value={v.color} onChange={e => {
                                const newV = [...variants]; newV[i].color = e.target.value; setVariants(newV);
                            }} />
                            <input placeholder="Stock" type="number" className="bg-black border border-zinc-900 p-3 text-xs text-white" value={v.stock_qty} onChange={e => {
                                const newV = [...variants]; newV[i].stock_qty = Number(e.target.value); setVariants(newV);
                            }} />
                        </div>
                    ))}
                    <button type="button" onClick={() => setVariants([...variants, { size: '', color: '', stock_qty: 0 }])} className="text-[10px] text-zinc-500 font-bold uppercase hover:text-white transition-colors">+ Add Variant Row</button>
                </div>

                <button type="submit" disabled={isSaving} className="w-full bg-gold text-black py-5 font-black uppercase text-xs mt-10 active:scale-95 transition-all">
                    {isSaving ? "SYNCING..." : "COMMIT TO VAULT"}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  )
}
