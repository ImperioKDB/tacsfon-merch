'use client'
import React from 'react'

export interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'default' | 'danger'
}

export default function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel, variant = 'default' }: ConfirmDialogProps) {
  const isDanger = variant === 'danger'
  
  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-sm bg-[#0A0A0A] border border-white/10 p-8 shadow-2xl">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-6 italic">System_Confirmation_Required</p>
        
        <h3 className="font-display text-2xl text-white uppercase leading-none mb-3 italic">{title}</h3>
        <p className="font-body text-[13px] text-zinc-400 leading-relaxed mb-8">{message}</p>

        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 border border-white/10 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className={`flex-1 py-3 font-black text-[10px] uppercase tracking-widest transition-all ${
              isDanger ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-[#C9A84C] text-black hover:bg-white'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}