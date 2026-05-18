import { Suspense } from 'react'
import type { Metadata } from 'next'
import SignupForm from './SignupForm'
import Skeleton from '@/components/ui/Skeleton'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Join the TACSFON Merch community.',
}

function SignupSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Skeleton height={32} style={{ width: '70%' }} />
      <Skeleton height={16} style={{ width: '85%' }} />
      <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} height={48} style={{ width: '100%' }} />)}
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupSkeleton />}>
      <SignupForm />
    </Suspense>
  )
}