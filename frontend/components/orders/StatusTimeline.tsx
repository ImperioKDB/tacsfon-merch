'use client'
import type { OrderStatus } from '@/types'

const STATUS_STEP: Record<OrderStatus, number> = {
  pending_payment:   0,
  payment_submitted: 0,
  confirmed:         1,
  dispatched:        2,
  received:          3,
  cancelled:         -1,
}

const STEPS = ['Placed', 'Confirmed', 'Dispatched', 'Received'] as const

export default function StatusTimeline({ status }: { status: OrderStatus }) {
  const currentStep = STATUS_STEP[status] ?? 0
  const isCancelled = status === 'cancelled'

  if (isCancelled) {
    return (
      <div className="rounded-xl px-4 py-3 text-sm font-semibold text-center bg-red-500/10 text-red-500 border border-red-500/20">
        This order was cancelled
      </div>
    )
  }

  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 right-0 top-4 h-px bg-zinc-800 z-0" />
        {STEPS.map((label, i) => {
          const done    = currentStep > i
          const active  = currentStep === i
          return (
            <div key={label} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                done || active ? 'bg-gold text-black' : 'bg-zinc-800 text-zinc-500'
              }`}>
                {done ? '✓' : i + 1}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${
                active ? 'text-gold' : 'text-zinc-500'
              }`}>{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
