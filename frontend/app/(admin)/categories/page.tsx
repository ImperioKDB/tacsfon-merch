'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api/fetch'

export default function CategoriesPage() {
  const [cats, setCats] = useState<any[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const data = await apiFetch<any>('/categories')
      setCats(data.categories || [])
    } catch (e) { toast.error("Failed to load categories") }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    if (!name.trim()) return;
    try {
      await apiFetch('/admin/categories', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim() })
      })
      toast.success("Category Created")
      setName('')
      load()
    } catch (e: any) { toast.error(e.message) }
  }

  return (
    <div className="max-w-xl space-y-8 animate-fadeIn">
      <h1 className="text-4xl font-black text-white uppercase italic italic tracking-tighter">Categories</h1>
      
      <div className="flex gap-2">
        <input 
          placeholder="New Category Name..." 
          className="flex-1 bg-zinc-900 border border-zinc-800 p-4 text-white focus:border-gold outline-none"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <button onClick={handleAdd} className="bg-gold text-black px-8 font-black uppercase text-xs tracking-widest">
          Add
        </button>
      </div>

      <div className="space-y-2">
        {loading ? <RefreshCw className="animate-spin text-zinc-700 mx-auto"/> : cats.map(c => (
          <div key={c.id} className="bg-zinc-950 border border-zinc-900 p-4 flex justify-between items-center group">
            <span className="font-bold text-zinc-300 uppercase tracking-widest text-sm">{c.name}</span>
            <button className="text-zinc-800 group-hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
          </div>
        ))}
      </div>
    </div>
  )
}
