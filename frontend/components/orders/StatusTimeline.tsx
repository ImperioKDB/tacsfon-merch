'use client'

// Maps every possible backend status to a 0-based timeline index.
// pending_payment + payment_submitted both sit at step 0 (order placed, awaiting confirmation).
const STATUS_STEP: Record<string, number> = {
  pending_payment:   0,
  payment_submitted: 0,
  pending:           0,
  confirmed:         1,
  dispatched:        2,
  received:          3,
  cancelled:         -1,   // handled separately
}

const STEPS = ['Placed', 'Confirmed', 'Dispatched', 'Received'] as const

interface Props { status: string }

export default function StatusTimeline({ status }: Props) {
  const currentStep = STATUS_STEP[status] ?? 0
  const cancelled   = status === 'cancelled'

  if (cancelled) {
    return (
      <div
        className="rounded-xl px-4 py-3 text-sm font-semibold text-center"
        style={{ background: '#3f1f1f40', color: '#F87171', border: '1px solid #F8717140' }}
      >
        This order was cancelled
      </div>
    )
  }

  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between relative">

        {/* Connector line behind nodes */}
        <div
          className="absolute left-0 right-0 top-4 h-px"
          style={{ background: 'var(--color-border)', zIndex: 0 }}
        />

        {STEPS.map((label, i) => {
          const done    = currentStep > i
          const active  = currentStep === i
          const future  = currentStep < i

          return (
            <div key={label} className="relative z-10 flex flex-col items-center gap-2">
              {/* Node */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  background: done
                    ? 'var(--color-gold)'
                    : active
                    ? 'var(--color-gold)'
                    : 'var(--color-surface-2)',
                  border: `2px solid ${
                    done || active ? 'var(--color-gold)' : 'var(--color-border)'
                  }`,
                  color: done || active ? '#000' : 'var(--color-text-disabled)',
                  boxShadow: active ? '0 0 0 4px var(--color-gold-muted)' : 'none',
                  animation: active ? 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' : 'none',
                }}
              >
                {done ? '✓' : i + 1}
              </div>

              {/* Label */}
              <span
                className="text-xs font-medium text-center"
                style={{
                  color: done
                    ? 'var(--color-gold)'
                    : active
                    ? 'var(--color-gold)'
                    : future
                    ? 'var(--color-text-disabled)'
                    : 'var(--color-text-secondary)',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}