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
      <table className="w-full border-collapse text-[11px] font-body uppercase tracking-wider">
        <thead>
          <tr className="bg-white/5">
            {columns.map(col => (
              <th key={col.key} className="p-4 text-left font-black text-zinc-500 border-b border-white/5 whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            [1,2,3].map(i => (
              <tr key={i} className="border-b border-white/5 animate-pulse">
                {columns.map(c => <td key={c.key} className="p-4"><div className="h-2 bg-white/5 w-12" /></td>)}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr><td colSpan={columns.length} className="p-12 text-center text-zinc-600 italic">{emptyMessage}</td></tr>
          ) : (
            rows.map(row => (
              <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                {columns.map(col => (
                  <td key={col.key} className="p-4 text-[#F5F0E8] vertical-middle">
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}