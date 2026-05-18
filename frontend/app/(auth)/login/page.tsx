import { Suspense } from 'react'
import type { Metadata } from 'next'
import LoginForm from './LoginForm'
import Skeleton from '@/components/ui/Skeleton'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your TACSFON Merch account.',
}

function LoginSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Skeleton height={32} style={{ width: '60%' }} />
      <Skeleton height={16} style={{ width: '80%' }} />
      <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Skeleton height={48} style={{ width: '100%' }} />
        <Skeleton height={48} style={{ width: '100%' }} />
        <Skeleton height={48} style={{ width: '100%' }} />
        <Skeleton height={48} style={{ width: '100%' }} />
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  )
}