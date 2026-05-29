'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, RefreshCw, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api/fetch'

export default function CategoriesPage() {
  const [cats, setCats] = useState<any[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)

  const load = async () => {
    try {
      const data = await apiFetch<any>('/categories')
      setCats(data.categories || [])
    } catch (e) { 
      console.error(e);
    } finally { 
      setLoading(false); 
    }
  }

  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    if (!name.trim() || isAdding) return;
    
    setIsAdding(true);
    try {
      await apiFetch('/admin/categories', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim() })
      })
      toast.success("Category Added");
      setName('');
      await load();
    } catch (e: any) { 
      toast.error(e.message || "Failed to add category"); 
    } finally { 
      setIsAdding(false); 
    }
  }

  return (
    <div className="max-w-xl space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Categories</h1>
        <p className="text-zinc-500 text-[10px] font-black tracking-[0.4em] uppercase mt-2">Product Classification</p>
      </div>
      
      <div className="flex gap-2">
        <input 
          placeholder="New Category Name..." 
          className="flex-1 bg-zinc-900 border border-zinc-800 p-4 text-white focus:border-gold outline-none font-bold placeholder:text-zinc-700"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          disabled={isAdding}
        />
        <button 
          onClick={handleAdd} 
          disabled={isAdding || !name.trim()}
          className="bg-gold text-black px-8 font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:bg-white transition-all disabled:opacity-50"
        >
          {isAdding ? <Loader2 className="animate-spin" size={16}/> : <Plus size={16} strokeWidth={3}/>}
          {isAdding ? 'Adding...' : 'Add'}
        </button>
      </div>

      <div className="space-y-2 border-t border-zinc-900 pt-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="animate-spin text-zinc-800" size={32}/>
          </div>
        ) : cats.length === 0 ? (
          <p className="text-zinc-600 text-center italic text-sm py-12">No categories found in system.</p>
        ) : cats.map(c => (
          <div key={c.id} className="bg-zinc-950 border border-zinc-900 p-5 flex justify-between items-center group hover:border-zinc-700 transition-colors">
            <span className="font-black text-zinc-300 uppercase tracking-widest text-sm italic">{c.name}</span>
            <button className="text-zinc-800 group-hover:text-red-500 transition-colors p-2">
              <Trash2 size={18}/>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
