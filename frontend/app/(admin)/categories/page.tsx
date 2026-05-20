'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { apiFetch, ApiError } from '@/lib/api/fetch'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import type { Category } from '@/types'
export default function CategoriesPage() {
  const [cats, setCats]     = useState<Category[]>([])
  const [loading, setLoad]  = useState(true)
  const [name, setName]     = useState('')
  const [adding, setAdd]    = useState(false)
  const [del, setDel]       = useState<Category | null>(null)
  useEffect(() => { apiFetch<{ categories: Category[] }>('/categories').then(d => setCats(d.categories)).catch(() => toast.error('Failed.')).finally(() => setLoad(false)) }, [])
  async function add() {
    if (!name.trim()) return; setAdd(true)
    try { const c = await apiFetch<Category>('/admin/categories',{method:'POST',body:JSON.stringify({name:name.trim()})}); setCats(p=>[...p,c].sort((a,b)=>a.name.localeCompare(b.name))); setName(''); toast.success('Added.') }
    catch (err) { toast.error(err instanceof ApiError ? err.message : 'Failed.') } finally { setAdd(false) }
  }
  async function remove() {
    if (!del) return
    try { await apiFetch(`/admin/categories/${del.id}`,{method:'DELETE'}); setCats(p=>p.filter(c=>c.id!==del.id)); toast.success('Deleted.') }
    catch (err) { toast.error(err instanceof ApiError ? err.message : 'Cannot delete — products use this category.') } finally { setDel(null) }
  }
  return (
    <div style={{maxWidth:'520px'}}>
      <h1 style={{fontSize:'1.375rem',fontWeight:700,fontFamily:'var(--font-urbanist)',color:'var(--color-text-primary)',marginBottom:'24px'}}>Categories</h1>
      <div style={{display:'flex',gap:'8px',marginBottom:'24px'}}>
        <input placeholder="New category name…" value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()} style={{flex:1,padding:'9px 12px',background:'var(--color-surface)',border:'1px solid var(--color-border)',color:'var(--color-text-primary)',fontSize:'0.875rem',fontFamily:'var(--font-inter)',outline:'none'}}/>
        <button onClick={add} disabled={adding||!name.trim()} style={{display:'flex',alignItems:'center',gap:'6px',padding:'9px 16px',background:'var(--color-gold)',color:'#0A0A0F',border:'none',cursor:'pointer',fontSize:'0.8125rem',fontWeight:600,fontFamily:'var(--font-inter)',opacity:adding?0.6:1}}><Plus size={14} strokeWidth={2}/>Add</button>
      </div>
      {loading ? Array.from({length:5},(_,i)=><div key={i} className="animate-pulse" style={{height:'48px',background:'var(--color-surface-2)',marginBottom:'1px'}}/>)
       : cats.length===0 ? <p style={{color:'var(--color-text-disabled)',fontSize:'0.875rem',fontFamily:'var(--font-inter)'}}>No categories yet.</p>
       : <div style={{border:'1px solid var(--color-border)'}}>{cats.map((c,i)=><div key={c.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'13px 16px',borderBottom:i<cats.length-1?'1px solid var(--color-border)':'none',background:'var(--color-surface)'}}><span style={{fontSize:'0.9375rem',color:'var(--color-text-primary)',fontFamily:'var(--font-inter)'}}>{c.name}</span><button onClick={()=>setDel(c)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--color-error)',display:'flex',padding:'4px'}}><Trash2 size={15} strokeWidth={1.5}/></button></div>)}</div>}
      {del && <ConfirmDialog title="Delete Category?" message={`"${del.name}" will be deleted. Fails if products use it.`} confirmLabel="Delete" variant="danger" onConfirm={remove} onCancel={()=>setDel(null)}/>}
    </div>
  )
}