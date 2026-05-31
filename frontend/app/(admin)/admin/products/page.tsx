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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      // 1. Create Product
      const product = await apiFetch<any>('/admin/products', {
        method: 'POST',
        body: JSON.stringify({ ...form, base_price: Number(form.base_price), is_available: true })
      })

      // 2. Create Variants
      for (const v of variants) {
          await apiFetch(`/admin/products/${product.id}/variants`, {
              method: 'POST',
              body: JSON.stringify(v)
          })
      }

      // 3. Upload Image
      if (selectedFile) {
          const formData = new FormData()
          formData.append('image', selectedFile)
          const { data: { session } } = await createBrowserClient().auth.getSession()
          const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')
          
          const imgRes = await fetch(`${baseUrl}/api/admin/products/${product.id}/image`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${session?.access_token}` },
              body: formData
          })
          
          if (!imgRes.ok) {
              const errData = await imgRes.json();
              throw new Error(errData.error?.message || "Image upload failed (Check size)");
          }
      }

      toast.success("Inventory Updated Successfully")
      setShowPanel(false)
      loadData()
    } catch (err: any) { 
      toast.error(err.message || "An unexpected error occurred");
    } finally { 
      setIsSaving(false) // ALWAYS stop the spinner
    }
  }

  const columns: Column<any>[] = [
    { key: 'name', label: 'Item', render: r => <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
            {r.image_url ? <img src={`${r.image_url}?t=${new Date().getTime()}`} className="w-full h-full object-cover" /> : <ImageIcon size={14} className="text-zinc-700"/>}
        </div>
        <span className="font-bold text-white">{r.name}</span>
    </div>},
    { key: 'price', label: 'Price', render: r => <span className="text-gold">{formatPrice(r.base_price)}</span> },
    { key: 'act', label: '', render: r => <button className="text-zinc-600 hover:text-gold"><Pencil size={14}/></button> }
  ]

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-8">
        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Inventory</h1>
        <button onClick={() => setShowPanel(true)} className="bg-gold text-black px-6 py-2 font-black text-xs">Create New</button>
      </div>

      <AdminTable columns={columns} rows={products} loading={loading} />

      {showPanel && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowPanel(false)} />
          <div className="relative w-full max-w-xl bg-zinc-950 p-8 h-full overflow-y-auto">
             <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-white italic uppercase">Product Entry</h2>
                <button onClick={() => setShowPanel(false)} className="text-zinc-500 hover:text-white"><X/></button>
             </div>
             
             <form onSubmit={handleCreate} className="space-y-6">
                <div className="p-4 border-2 border-dashed border-zinc-800 text-center">
                    <input type="file" accept="image/*" onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="w-full text-xs text-zinc-500" />
                    <p className="text-[9px] uppercase font-black text-zinc-600 mt-2">MAX SIZE: 10MB | NO HEIC</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Item Name" className="bg-zinc-900 border border-zinc-800 p-4 text-white outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                    <input placeholder="Base Price" className="bg-zinc-900 border border-zinc-800 p-4 text-white outline-none" value={form.base_price} onChange={e => setForm({...form, base_price: e.target.value})} />
                </div>

                <select className="w-full bg-zinc-900 border border-zinc-800 p-4 text-white outline-none" value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}>
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
                    <button type="button" onClick={() => setVariants([...variants, { size: '', color: '', stock_qty: 0 }])} className="text-[10px] text-zinc-500 font-bold uppercase">+ Add Row</button>
                </div>

                <button type="submit" disabled={isSaving} className="w-full bg-gold text-black py-5 font-black uppercase text-xs flex justify-center items-center gap-2">
                    {isSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
                    {isSaving ? "TRANSMITTING..." : "COMMIT TO VAULT"}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  )
}
