'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, Upload, X, Check } from 'lucide-react'
import { toast } from 'sonner'
import { apiFetch, ApiError } from '@/lib/api/fetch'
import { formatPrice } from '@/lib/utils/formatters'
import { createBrowserClient } from '@/lib/supabase/browser'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import AdminTable, { type Column } from '@/components/admin/AdminTable'
import type { Product, Category, ProductVariant } from '@/types'
interface PX extends Product { category?: Category; variants?: ProductVariant[] }
export default function ProductsPage() {
  const [products, setProducts] = useState<PX[]>([])
  const [cats, setCats]         = useState<Category[]>([])
  const [loading, setLoading]   = useState(true)
  const [panel, setPanel]       = useState(false)
  const [editing, setEditing]   = useState<PX | null>(null)
  const [delTarget, setDT]      = useState<PX | null>(null)
  const [saving, setSaving]     = useState(false)
  const [form, setForm]         = useState({ name: '', description: '', base_price: '', category_id: '', stock_type: 'stock', is_available: true })
  const [imgFile, setImg]       = useState<File | null>(null)
  const [glbFile, setGlb]       = useState<File | null>(null)
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [nv, setNv]             = useState({ size: '', color: '', stock_qty: '0', price_override: '' })
  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [pd, cd] = await Promise.all([apiFetch<{ products: PX[] }>('/products?is_available=all&limit=100'), apiFetch<{ categories: Category[] }>('/categories')])
      setProducts(pd.products); setCats(cd.categories)
    } catch { toast.error('Failed to load.') } finally { setLoading(false) }
  }, [])
  useEffect(() => { loadAll() }, [loadAll])
  function openAdd() { setEditing(null); setForm({ name:'', description:'', base_price:'', category_id:cats[0]?.id??'', stock_type:'stock', is_available:true }); setImg(null); setGlb(null); setVariants([]); setPanel(true) }
  function openEdit(p: PX) { setEditing(p); setForm({ name:p.name, description:p.description??'', base_price:String(p.base_price), category_id:p.category_id??'', stock_type:p.stock_type, is_available:p.is_available }); setImg(null); setGlb(null); setVariants(p.variants??[]); setPanel(true) }
  async function upload(pid: string, field: string, file: File, ep: string) {
    const fd = new FormData(); fd.append(field, file)
    const { data: { session } } = await createBrowserClient().auth.getSession()
    await fetch(`/api/admin/products/${pid}/${ep}`, { method:'POST', headers:{ Authorization:`Bearer ${session?.access_token}` }, body:fd })
  }
  async function save() {
    if (!form.name.trim()||!form.base_price||!form.category_id) { toast.error('Name, price and category required.'); return }
    setSaving(true)
    try {
      const body = { name:form.name.trim(), description:form.description.trim()||null, base_price:Number(form.base_price), category_id:form.category_id, stock_type:form.stock_type, is_available:form.is_available }
      const p: Product = editing ? await apiFetch(`/admin/products/${editing.id}`, { method:'PATCH', body:JSON.stringify(body) }) : await apiFetch('/admin/products', { method:'POST', body:JSON.stringify(body) })
      if (imgFile) await upload(p.id,'image',imgFile,'image')
      if (glbFile) await upload(p.id,'model',glbFile,'model')
      toast.success(editing?'Updated.':'Created.'); setPanel(false); loadAll()
    } catch (err) { toast.error(err instanceof ApiError ? err.message : 'Failed.') } finally { setSaving(false) }
  }
  async function del() {
    if (!delTarget) return
    try { await apiFetch(`/admin/products/${delTarget.id}`,{method:'DELETE'}); toast.success('Deleted.'); setProducts(p=>p.filter(x=>x.id!==delTarget.id)) }
    catch (err) { toast.error(err instanceof ApiError ? err.message : 'Delete failed.') } finally { setDT(null) }
  }
  async function addVariant() {
    if (!editing||!nv.size||!nv.color) { toast.error('Size and color required.'); return }
    try { const v = await apiFetch<ProductVariant>(`/admin/products/${editing.id}/variants`,{method:'POST',body:JSON.stringify({size:nv.size,color:nv.color,stock_qty:Number(nv.stock_qty),price_override:nv.price_override?Number(nv.price_override):null})}); setVariants(p=>[...p,v]); setNv({size:'',color:'',stock_qty:'0',price_override:''}); toast.success('Variant added.') }
    catch (err) { toast.error(err instanceof ApiError ? err.message : 'Failed.') }
  }
  async function delVariant(vid: string) {
    if (!editing) return
    try { await apiFetch(`/admin/products/${editing.id}/variants/${vid}`,{method:'DELETE'}); setVariants(p=>p.filter(v=>v.id!==vid)); toast.success('Deleted.') }
    catch (err) { toast.error(err instanceof ApiError ? err.message : 'In use — cannot delete.') }
  }
  const iS: React.CSSProperties = { width:'100%', padding:'9px 12px', background:'var(--color-bg)', border:'1px solid var(--color-border)', color:'var(--color-text-primary)', fontSize:'0.875rem', fontFamily:'var(--font-inter)', outline:'none', boxSizing:'border-box' }
  const lS: React.CSSProperties = { fontSize:'0.6875rem', fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--color-text-secondary)', fontFamily:'var(--font-inter)', marginBottom:'5px', display:'block' }
  const columns: Column<PX>[] = [
    { key:'name',  label:'Name',     render: r => r.name },
    { key:'cat',   label:'Category', render: r => r.category?.name??'—' },
    { key:'price', label:'Price',    render: r => formatPrice(r.base_price) },
    { key:'stock', label:'Stock',    render: r => r.stock_type },
    { key:'avail', label:'Avail',    render: r => <span style={{color:r.is_available?'var(--color-success)':'var(--color-error)',fontSize:'0.75rem',fontWeight:600}}>{r.is_available?'Yes':'No'}</span> },
    { key:'act',   label:'',         render: r => <div style={{display:'flex',gap:'8px'}}><button onClick={()=>openEdit(r)} style={{display:'flex',alignItems:'center',justifyContent:'center',width:'30px',height:'30px',background:'transparent',border:'1px solid var(--color-border)',cursor:'pointer',color:'var(--color-text-secondary)'}}><Pencil size={14} strokeWidth={1.5}/></button><button onClick={()=>setDT(r)} style={{display:'flex',alignItems:'center',justifyContent:'center',width:'30px',height:'30px',background:'transparent',border:'1px solid var(--color-error)',cursor:'pointer',color:'var(--color-error)'}}><Trash2 size={14} strokeWidth={1.5}/></button></div> },
  ]
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'24px'}}>
        <h1 style={{fontSize:'1.375rem',fontWeight:700,fontFamily:'var(--font-urbanist)',color:'var(--color-text-primary)'}}>Products</h1>
        <button onClick={openAdd} style={{display:'flex',alignItems:'center',gap:'6px',padding:'9px 18px',background:'var(--color-gold)',color:'#0A0A0F',border:'none',cursor:'pointer',fontSize:'0.8125rem',fontWeight:600,fontFamily:'var(--font-inter)'}}><Plus size={15} strokeWidth={2}/>Add Product</button>
      </div>
      <AdminTable columns={columns} rows={products} loading={loading} emptyMessage="No products yet." />
      {panel && (
        <div style={{position:'fixed',inset:0,zIndex:60}}>
          <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.6)'}} onClick={()=>setPanel(false)} />
          <div style={{position:'absolute',top:0,right:0,bottom:0,width:'480px',maxWidth:'100vw',background:'var(--color-surface)',borderLeft:'1px solid var(--color-border)',overflowY:'auto',padding:'24px'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'24px'}}>
              <h2 style={{fontSize:'1.125rem',fontWeight:700,fontFamily:'var(--font-urbanist)',color:'var(--color-text-primary)'}}>{editing?'Edit':'Add'} Product</h2>
              <button onClick={()=>setPanel(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--color-text-secondary)',display:'flex'}}><X size={20} strokeWidth={1.5}/></button>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <div><label style={lS}>Name *</label><input style={iS} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
              <div><label style={lS}>Description</label><textarea style={{...iS,resize:'vertical',minHeight:'72px'}} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/></div>
              <div><label style={lS}>Base Price (₦) *</label><input type="number" style={iS} value={form.base_price} onChange={e=>setForm(f=>({...f,base_price:e.target.value}))}/></div>
              <div><label style={lS}>Category *</label><select style={iS} value={form.category_id} onChange={e=>setForm(f=>({...f,category_id:e.target.value}))}><option value="">Select…</option>{cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div><label style={lS}>Stock Type</label><select style={iS} value={form.stock_type} onChange={e=>setForm(f=>({...f,stock_type:e.target.value}))}><option value="stock">Stock</option><option value="preorder">Preorder</option><option value="both">Both</option></select></div>
              <div style={{display:'flex',alignItems:'center',gap:'10px'}}><input type="checkbox" id="av" checked={form.is_available} onChange={e=>setForm(f=>({...f,is_available:e.target.checked}))}/><label htmlFor="av" style={{...lS,marginBottom:0}}>Available for purchase</label></div>
              <div><label style={lS}>Image (JPG/PNG/WebP, max 5MB)</label><label style={{display:'flex',alignItems:'center',gap:'8px',padding:'9px 12px',border:'1px dashed var(--color-border)',cursor:'pointer',color:'var(--color-text-secondary)',fontSize:'0.8125rem',fontFamily:'var(--font-inter)'}}><Upload size={14} strokeWidth={1.5}/>{imgFile?imgFile.name:'Choose image…'}<input type="file" accept="image/jpeg,image/png,image/webp" style={{display:'none'}} onChange={e=>setImg(e.target.files?.[0]??null)}/></label></div>
              <div><label style={lS}>3D Model (.glb, max 50MB)</label><label style={{display:'flex',alignItems:'center',gap:'8px',padding:'9px 12px',border:'1px dashed var(--color-border)',cursor:'pointer',color:'var(--color-text-secondary)',fontSize:'0.8125rem',fontFamily:'var(--font-inter)'}}><Upload size={14} strokeWidth={1.5}/>{glbFile?glbFile.name:'Choose .glb…'}<input type="file" accept=".glb" style={{display:'none'}} onChange={e=>setGlb(e.target.files?.[0]??null)}/></label></div>
              {editing && (
                <div>
                  <label style={lS}>Variants</label>
                  {variants.length > 0 && <table style={{width:'100%',borderCollapse:'collapse',marginBottom:'10px',fontSize:'0.8125rem',fontFamily:'var(--font-inter)'}}><thead><tr style={{borderBottom:'1px solid var(--color-border)'}}>{['Size','Color','Stock','Override',''].map(h=><th key={h} style={{padding:'6px 8px',textAlign:'left',fontSize:'0.6875rem',color:'var(--color-text-secondary)',fontWeight:500}}>{h}</th>)}</tr></thead><tbody>{variants.map(v=><tr key={v.id} style={{borderBottom:'1px solid var(--color-border)'}}><td style={{padding:'6px 8px',color:'var(--color-text-primary)'}}>{v.size}</td><td style={{padding:'6px 8px',color:'var(--color-text-primary)'}}>{v.color}</td><td style={{padding:'6px 8px',color:'var(--color-text-primary)'}}>{v.stock_qty}</td><td style={{padding:'6px 8px',color:'var(--color-text-secondary)'}}>{v.price_override??'—'}</td><td style={{padding:'6px 8px'}}><button onClick={()=>delVariant(v.id)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--color-error)',display:'flex'}}><Trash2 size={13} strokeWidth={1.5}/></button></td></tr>)}</tbody></table>}
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 60px 80px 36px',gap:'6px',alignItems:'end'}}>
                    {[{k:'size',ph:'Size'},{k:'color',ph:'Color'},{k:'stock_qty',ph:'Qty'},{k:'price_override',ph:'₦ ovr'}].map(({k,ph})=><input key={k} placeholder={ph} value={(nv as any)[k]} onChange={e=>setNv(n=>({...n,[k]:e.target.value}))} style={{...iS,padding:'7px 8px',fontSize:'0.75rem'}}/>)}
                    <button onClick={addVariant} style={{height:'34px',background:'var(--color-gold)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#0A0A0F'}}><Check size={14} strokeWidth={2}/></button>
                  </div>
                </div>
              )}
              <button onClick={save} disabled={saving} style={{padding:'11px',background:saving?'var(--color-surface-2)':'var(--color-gold)',color:saving?'var(--color-text-disabled)':'#0A0A0F',border:'none',cursor:saving?'not-allowed':'pointer',fontFamily:'var(--font-inter)',fontWeight:600,fontSize:'0.875rem',marginTop:'8px'}}>{saving?'Saving…':editing?'Save Changes':'Create Product'}</button>
            </div>
          </div>
        </div>
      )}
      {delTarget && <ConfirmDialog title="Delete Product?" message={`"${delTarget.name}" will be deleted or hidden if it has order history.`} confirmLabel="Delete" variant="danger" onConfirm={del} onCancel={()=>setDT(null)}/>}
    </div>
  )
}