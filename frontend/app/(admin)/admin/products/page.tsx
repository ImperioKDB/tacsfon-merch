'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, Upload, X, Save, Package } from 'lucide-react'
import { toast } from 'sonner'
import { apiFetch, ApiError } from '@/lib/api/fetch'
import { formatPrice } from '@/lib/utils/formatters'
import AdminTable, { type Column } from '@/components/admin/AdminTable'
import type { Product, Category } from '@/types'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showPanel, setShowPanel] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Form State
  const [form, setForm] = useState({
    name: '',
    description: '',
    base_price: '',
    category_id: '',
    stock_type: 'stock'
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [pData, cData] = await Promise.all([
        apiFetch<any>('/products?is_available=all&limit=100'),
        apiFetch<{categories: Category[]}>('/categories')
      ])
      setProducts(pData.products || [])
      setCategories(cData.categories || [])
    } catch { toast.error('Sync failed') } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.base_price || !form.category_id) {
        toast.error("Please fill required fields")
        return
    }
    
    setIsSaving(true)
    try {
      await apiFetch('/admin/products', {
        method: 'POST',
        body: JSON.stringify({
            ...form,
            base_price: Number(form.base_price),
            is_available: true
        })
      })
      toast.success("Product Added to Vault")
      setShowPanel(false)
      setForm({ name: '', description: '', base_price: '', category_id: '', stock_type: 'stock' })
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Failed to create product")
    } finally {
      setIsSaving(false)
    }
  }

  const columns: Column<Product>[] = [
    { key: 'name', label: 'Item', render: r => <span className="font-bold text-white">{r.name}</span> },
    { key: 'price', label: 'Price', render: r => <span className="text-gold font-mono">{formatPrice(r.base_price)}</span> },
    { key: 'stock', label: 'Mode', render: r => <span className="uppercase text-[9px] font-black tracking-widest px-2 py-0.5 bg-zinc-800 rounded-full">{r.stock_type}</span> },
    { key: 'act', label: '', render: r => <button className="text-zinc-600 hover:text-gold transition-colors"><Pencil size={14}/></button> }
  ]

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* HEADER SECTION - FIXED OVERLAP */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-zinc-800 pb-8">
        <div>
          <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">Inventory<span className="text-gold">.</span></h1>
          <p className="text-zinc-500 text-[10px] font-black tracking-[0.4em] uppercase mt-4">Global Merch Logistics</p>
        </div>
        <button 
          onClick={() => setShowPanel(true)}
          className="bg-gold text-black px-8 py-4 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white transition-all shadow-lg shadow-gold/10 active:scale-95"
        >
            <Plus size={18} strokeWidth={3}/> Create New Entry
        </button>
      </div>

      <div className="bg-black border border-zinc-800 rounded-none overflow-hidden">
        <AdminTable columns={columns} rows={products} loading={loading} emptyMessage="No products discovered in database." />
      </div>

      {/* CREATE PANEL - SLIDE OVER */}
      {showPanel && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowPanel(false)} />
          <div className="relative w-full max-w-md bg-zinc-950 border-l border-zinc-800 p-8 h-full overflow-y-auto animate-fadeIn">
             <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black text-white uppercase italic">Add Merch</h2>
                <button onClick={() => setShowPanel(false)} className="text-zinc-500 hover:text-white"><X size={24}/></button>
             </div>

             <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Product Name*</label>
                   <input required className="w-full bg-zinc-900 border border-zinc-800 p-4 text-white focus:border-gold outline-none" 
                          value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Classic Fellowship Tee" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Base Price (₦)*</label>
                       <input required type="number" className="w-full bg-zinc-900 border border-zinc-800 p-4 text-white focus:border-gold outline-none font-mono" 
                              value={form.base_price} onChange={e => setForm({...form, base_price: e.target.value})} placeholder="5000" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Category*</label>
                       <select required className="w-full bg-zinc-900 border border-zinc-800 p-4 text-white focus:border-gold outline-none appearance-none" 
                               value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}>
                          <option value="">Select...</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                       </select>
                    </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Description</label>
                   <textarea rows={4} className="w-full bg-zinc-900 border border-zinc-800 p-4 text-white focus:border-gold outline-none resize-none" 
                          value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe the material and fit..." />
                </div>

                <button type="submit" disabled={isSaving} className="w-full bg-gold text-black py-5 font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-white transition-all mt-8">
                   {isSaving ? <Package className="animate-pulse"/> : <Save size={18}/>}
                   {isSaving ? "LOGGING ITEM..." : "COMMIT TO INVENTORY"}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  )
}
