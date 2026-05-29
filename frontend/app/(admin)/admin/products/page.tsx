'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, Upload, X, Save, Package, Image as ImageIcon } from 'lucide-react'
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

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [pData, cData] = await Promise.all([
        apiFetch<any>('/products?is_available=all&limit=100'),
        apiFetch<any>('/categories')
      ])
      setProducts(pData.products || [])
      setCategories(cData.categories || [])
    } catch { toast.error('Sync failed') } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      // 1. Create Product Text Data
      const product = await apiFetch<any>('/admin/products', {
        method: 'POST',
        body: JSON.stringify({ ...form, base_price: Number(form.base_price), is_available: true })
      })

      // 2. Upload Image if selected
      if (selectedFile && product.id) {
          const formData = new FormData()
          formData.append('image', selectedFile)
          
          const supabase = createBrowserClient()
          const { data: { session } } = await supabase.auth.getSession()
          
          await fetch(`/api/admin/products/${product.id}/image`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${session?.access_token}` },
              body: formData
          })
      }

      toast.success("Merch Logged Successfully")
      setShowPanel(false)
      setSelectedFile(null)
      loadData()
    } catch (err: any) { toast.error(err.message) }
    finally { setIsSaving(false) }
  }

  const columns: Column<any>[] = [
    { key: 'name', label: 'Item', render: r => <span className="font-bold text-white">{r.name}</span> },
    { key: 'price', label: 'Price', render: r => <span className="text-gold font-mono">{formatPrice(r.base_price)}</span> },
    { key: 'stock', label: 'Mode', render: r => <span className="uppercase text-[9px] font-black tracking-widest px-2 py-0.5 bg-zinc-800 rounded-full">{r.stock_type}</span> },
    { key: 'act', label: '', render: r => <button className="text-zinc-600 hover:text-gold transition-colors"><Pencil size={14}/></button> }
  ]

  return (
    <div className="space-y-10 animate-fadeIn">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-zinc-800 pb-8">
        <div>
          <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">Inventory</h1>
        </div>
        <button onClick={() => setShowPanel(true)} className="bg-gold text-black px-8 py-4 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all">
            <Plus size={18} strokeWidth={3}/> Create New Entry
        </button>
      </div>

      <div className="bg-black border border-zinc-800">
        <AdminTable columns={columns} rows={products} loading={loading} emptyMessage="Inventory Empty." />
      </div>

      {showPanel && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowPanel(false)} />
          <div className="relative w-full max-w-md bg-zinc-950 border-l border-zinc-800 p-8 h-full overflow-y-auto animate-fadeIn">
             <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black text-white uppercase italic">Add Merch</h2>
                <button onClick={() => setShowPanel(false)}><X size={24}/></button>
             </div>

             <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Product Photo</label>
                   <div className="relative group">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                        onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                      />
                      <div className="bg-zinc-900 border-2 border-dashed border-zinc-800 p-8 flex flex-col items-center justify-center text-zinc-500 group-hover:border-gold transition-colors">
                         <ImageIcon size={32} className="mb-2"/>
                         <span className="text-xs font-bold uppercase">{selectedFile ? selectedFile.name : "Select 2D Image"}</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Product Name*</label>
                   <input required className="w-full bg-zinc-900 border border-zinc-800 p-4 text-white focus:border-gold outline-none" 
                          value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Price (₦)*</label>
                       <input required type="number" className="w-full bg-zinc-900 border border-zinc-800 p-4 text-white focus:border-gold outline-none" 
                              value={form.base_price} onChange={e => setForm({...form, base_price: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Category*</label>
                       <select required className="w-full bg-zinc-900 border border-zinc-800 p-4 text-white focus:border-gold outline-none" 
                               value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}>
                          <option value="">Select...</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                       </select>
                    </div>
                </div>

                <button type="submit" disabled={isSaving} className="w-full bg-gold text-black py-5 font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3">
                   {isSaving ? <Package className="animate-pulse"/> : <Save size={18}/>}
                   {isSaving ? "SYNCING..." : "COMMIT TO INVENTORY"}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  )
}
