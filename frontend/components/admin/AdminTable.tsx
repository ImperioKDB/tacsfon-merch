'use client';
import React from 'react'

export interface Column<T> { 
  key: string; 
  label: string; 
  render: (row: T) => React.ReactNode 
}

interface AdminTableProps<T> { 
  columns: Column<T>[]; 
  rows: T[]; 
  loading: boolean; 
  emptyMessage?: string 
}

export default function AdminTable<T extends { id: string }>({ 
  columns, rows, loading, emptyMessage = 'No data.' 
}: AdminTableProps<T>) {
  return (
    <div className="border border-white/5 overflow-x-auto">
      <table className="w-full text-[10px] font-body uppercase tracking-[0.15em]">
        <thead>
          <tr className="bg-white/5 text-zinc-600 italic">
            {columns.map(col => <th key={col.key} className="p-4 text-left font-black">{col.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {loading ? (
             <tr><td colSpan={columns.length} className="p-12 text-center text-zinc-800 animate-pulse font-black italic">SYNCING_VAULT...</td></tr>
          ) : rows.length === 0 ? (
             <tr><td colSpan={columns.length} className="p-12 text-center text-zinc-700 italic">{emptyMessage}</td></tr>
          ) : (
            rows.map(row => (
              <tr key={row.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                {columns.map(col => <td key={col.key} className="p-4 text-zinc-300 font-medium">{col.render(row)}</td>)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}