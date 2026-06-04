'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { apiFetch, ApiError } from '@/lib/api/fetch'
import { formatDate } from '@/lib/utils/formatters'
import { createBrowserClient } from '@/lib/supabase/browser'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import AdminTable, { type Column } from '@/components/admin/AdminTable'
interface AP { id: string; full_name: string; email: string; created_at: string }
export default function AdminsPage() {
  const [admins, setAdmins]   = useState<AP[]>([])
  const [loading, setLoad]    = useState(true)
  const [myId, setMyId]       = useState<string|null>(null)
  const [modal, setModal]     = useState(false)
  const [form, setForm]       = useState({email:'',full_name:'',password:''})
  const [saving, setSaving]   = useState(false)
  const [del, setDel]         = useState<AP|null>(null)
  useEffect(() => {
    async function load() {
      const sb = createBrowserClient()
      const { data: { session } } = await sb.auth.getSession()
      setMyId(session?.user.id??null)
      const { data, error } = await sb.from('profiles').select('id,full_name,email,created_at').eq('role','admin').order('created_at',{ascending:false})
      if (error) toast.error('Failed.'); else setAdmins(data as AP[])
      setLoad(false)
    }
    load()
  }, [])
  async function add() {
    if (!form.email.trim()||!form.full_name.trim()||form.password.length<8) { toast.error('All fields required. Password min 8 chars.'); return }
    setSaving(true)
    try { const a = await apiFetch<AP>('/admin/admins',{method:'POST',body:JSON.stringify(form)}); setAdmins(p=>[a,...p]); setModal(false); setForm({email:'',full_name:'',password:''}); toast.success('Admin created.') }
    catch (err) { toast.error(err instanceof ApiError ? err.message : 'Failed.') } finally { setSaving(false) }
  }
  async function remove() {
    if (!del) return
    try { await apiFetch(`/admin/admins/${del.id}`,{method:'DELETE'}); setAdmins(p=>p.filter(a=>a.id!==del.id)); toast.success('Deleted.') }
    catch (err) { toast.error(err instanceof ApiError ? err.message : 'Failed.') } finally { setDel(null) }
  }
  const iS: React.CSSProperties = {width:'100%',padding:'9px 12px',background:'var(--bg-base)',border:'1px solid var(--border)',color:'var(--text-primary)',fontSize:'0.875rem',fontFamily:'var(--font-body)',outline:'none',boxSizing:'border-box',marginTop:'5px'}
  const columns: Column<AP>[] = [
    {key:'name', label:'Name',   render: r => r.full_name},
    {key:'email',label:'Email',  render: r => r.email},
    {key:'date', label:'Joined', render: r => formatDate(r.created_at)},
    {key:'act',  label:'',       render: r => <button onClick={()=>setDel(r)} disabled={r.id===myId} title={r.id===myId?'Cannot delete own account':'Delete'} style={{background:'none',border:'none',cursor:r.id===myId?'not-allowed':'pointer',color:r.id===myId?'var(--text-muted)':'var(--danger)',display:'flex',padding:'4px'}}><Trash2 size={15} strokeWidth={1.5}/></button>},
  ]
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'24px'}}>
        <h1 style={{fontSize:'1.375rem',fontWeight:700,fontFamily:'var(--font-body)',color:'var(--text-primary)'}}>Admins</h1>
        <button onClick={()=>setModal(true)} style={{display:'flex',alignItems:'center',gap:'6px',padding:'9px 18px',background:'var(--accent)',color:'#0A0A0F',border:'none',cursor:'pointer',fontSize:'0.8125rem',fontWeight:600,fontFamily:'var(--font-body)'}}><Plus size={15} strokeWidth={2}/>Add Admin</button>
      </div>
      <AdminTable columns={columns} rows={admins} loading={loading} emptyMessage="No admins." />
      {modal && (
        <div style={{position:'fixed',inset:0,zIndex:60,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.65)'}} onClick={()=>setModal(false)}/>
          <div style={{position:'relative',width:'400px',maxWidth:'95vw',background:'var(--bg-surface)',border:'1px solid var(--border)',padding:'24px',zIndex:1}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px'}}><h2 style={{fontSize:'1.125rem',fontWeight:700,fontFamily:'var(--font-body)',color:'var(--text-primary)'}}>Add Admin</h2><button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)',display:'flex'}}><X size={18} strokeWidth={1.5}/></button></div>
            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              {[{l:'Full Name',k:'full_name',t:'text'},{l:'Email',k:'email',t:'email'},{l:'Password (min 8 chars)',k:'password',t:'password'}].map(({l,k,t})=><div key={k}><label style={{fontSize:'0.6875rem',fontWeight:500,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--text-muted)',fontFamily:'var(--font-body)'}}>{l}</label><input type={t} style={iS} value={(form as any)[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}/></div>)}
              <button onClick={add} disabled={saving} style={{padding:'10px',background:saving?'var(--bg-elevated)':'var(--accent)',color:saving?'var(--text-muted)':'#0A0A0F',border:'none',cursor:saving?'not-allowed':'pointer',fontWeight:600,fontSize:'0.875rem',fontFamily:'var(--font-body)',marginTop:'4px'}}>{saving?'Creating…':'Create Admin'}</button>
            </div>
          </div>
        </div>
      )}
      {del && <ConfirmDialog title="Delete Admin?" message={`${del.full_name}'s admin access will be removed.`} confirmLabel="Delete Admin" variant="danger" onConfirm={remove} onCancel={()=>setDel(null)}/>}
    </div>
  )
}