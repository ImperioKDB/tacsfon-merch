'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, Upload, X, Check } from 'lucide-react'
import { toast } from 'sonner'
import { apiFetch, ApiError } from '@/lib/api/fetch'
import { formatPrice } from '@/lib/utils/formatters'
import AdminTable, { type Column } from '@/components/admin/AdminTable'
import type { Product } from '@/types'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch all products, even unavailable ones
      const data = await apiFetch<any>('/products?is_available=all&limit=100')
      setProducts(data.products || [])
    } catch { toast.error('Sync failed') } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const columns: Column<Product>[] = [
    { key: 'name', label: 'Name', render: r => <span className="font-bold">{r.name}</span> },
    { key: 'price', label: 'Base Price', render: r => formatPrice(r.base_price) },
    { key: 'stock', label: 'Type', render: r => <span className="uppercase text-[10px] font-black">{r.stock_type}</span> },
    { key: 'act', label: '', render: r => <button className="text-zinc-600 hover:text-white"><Pencil size={14}/></button> }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Inventory</h1>
        <button className="bg-gold text-black px-6 py-2 font-black text-xs uppercase tracking-widest flex items-center gap-2">
            <Plus size={16}/> Create New
        </button>
      </div>
      <div className="bg-zinc-950 border border-zinc-800">
        <AdminTable columns={columns} rows={products} loading={loading} emptyMessage="Inventory Empty. Create your first product." />
      </div>
    </div>
  )
}
