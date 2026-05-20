'use client'
import { useEffect, useState, useCallback } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api/fetch'
import { formatDateTime } from '@/lib/utils/formatters'
interface LR { id: string; action: string; details: Record<string,unknown>; created_at: string; admin: { full_name: string; email: string } | null }
interface PM { page: number; total_pages: number }
export default function LogsPage() {
  const [logs, setLogs]     = useState<LR[]>([])
  const [loading, setLoad]  = useState(true)
  const [filter, setFilter] = useState('')
  const [page, setPage]     = useState(1)
  const [meta, setMeta]     = useState<PM|null>(null)
  const [exp, setExp]       = useState<string|null>(null)
  const load = useCallback(async (p = 1) => {
    setLoad(true)
    try { const q = new URLSearchParams({page:String(p),limit:'50'}); if (filter.trim()) q.set('action',filter.trim()); const d = await apiFetch<{logs:LR[];pagination:PM}>(`/admin/logs?${q}`); setLogs(d.logs); setMeta(d.pagination); setPage(p) }
    catch { toast.error('Failed.') } finally { setLoad(false) }
  }, [filter])
  useEffect(() => { load(1) }, [load])
  const th: React.CSSProperties = {padding:'10px 14px',textAlign:'left',fontSize:'0.6875rem',fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--color-text-secondary)',borderBottom:'1px solid var(--color-border)',whiteSpace:'nowrap'}
  return (
    <div>
      <h1 style={{fontSize:'1.375rem',fontWeight:700,fontFamily:'var(--font-urbanist)',color:'var(--color-text-primary)',marginBottom:'20px'}}>Audit Logs</h1>
      <div style={{marginBottom:'20px'}}>
        <input placeholder="Filter by action (e.g. UPDATE_PAYMENT_STATUS)…" value={filter} onChange={e=>setFilter(e.target.value)} onKeyDown={e=>e.key==='Enter'&&load(1)} style={{width:'340px',padding:'9px 12px',background:'var(--color-surface)',border:'1px solid var(--color-border)',color:'var(--color-text-primary)',fontSize:'0.875rem',fontFamily:'var(--font-inter)',outline:'none',boxSizing:'border-box'}}/>
      </div>
      <div style={{border:'1px solid var(--color-border)',overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.8125rem',fontFamily:'var(--font-inter)'}}>
          <thead><tr style={{background:'var(--color-surface-2)'}}>{['Admin','Action','Date','Details'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>
            {loading ? Array.from({length:8},(_,i)=><tr key={i}><td colSpan={4} style={{padding:'12px 14px'}}><div className="animate-pulse" style={{height:'16px',background:'var(--color-surface-2)',width:'70%'}}/></td></tr>)
             : logs.length===0 ? <tr><td colSpan={4} style={{padding:'32px',textAlign:'center',color:'var(--color-text-disabled)'}}>No logs found.</td></tr>
             : logs.flatMap(log => [
               <tr key={log.id} style={{borderBottom:'1px solid var(--color-border)',background:'var(--color-surface)'}}>
                 <td style={{padding:'10px 14px',color:'var(--color-text-primary)'}}>{log.admin?.full_name??'—'}</td>
                 <td style={{padding:'10px 14px',color:'var(--color-gold)',fontWeight:500}}>{log.action}</td>
                 <td style={{padding:'10px 14px',color:'var(--color-text-secondary)',whiteSpace:'nowrap'}}>{formatDateTime(log.created_at)}</td>
                 <td style={{padding:'10px 14px'}}><button onClick={()=>setExp(p=>p===log.id?null:log.id)} style={{display:'flex',alignItems:'center',gap:'4px',background:'none',border:'none',cursor:'pointer',color:'var(--color-text-secondary)',fontSize:'0.75rem',fontFamily:'var(--font-inter)',padding:0}}>{exp===log.id?<ChevronDown size={13}/>:<ChevronRight size={13}/>}{exp===log.id?'Hide':'Show'}</button></td>
               </tr>,
               ...(exp===log.id ? [<tr key={`${log.id}-d`} style={{background:'var(--color-bg)'}}><td colSpan={4} style={{padding:'0 14px 12px'}}><pre style={{fontSize:'0.75rem',color:'var(--color-text-secondary)',fontFamily:'monospace',whiteSpace:'pre-wrap',wordBreak:'break-all',margin:0,paddingTop:'8px'}}>{JSON.stringify(log.details,null,2)}</pre></td></tr>] : [])
             ])}
          </tbody>
        </table>
      </div>
      {meta && meta.total_pages > 1 && (
        <div style={{display:'flex',gap:'8px',justifyContent:'center',marginTop:'20px'}}>
          {Array.from({length:Math.min(meta.total_pages,10)},(_,i)=>i+1).map(p=><button key={p} onClick={()=>load(p)} style={{width:'36px',height:'36px',border:'1px solid',borderColor:p===page?'var(--color-gold)':'var(--color-border)',background:p===page?'var(--color-gold-muted)':'transparent',color:p===page?'var(--color-gold)':'var(--color-text-secondary)',cursor:'pointer',fontFamily:'var(--font-inter)',fontSize:'0.875rem'}}>{p}</button>)}
        </div>
      )}
    </div>
  )
}