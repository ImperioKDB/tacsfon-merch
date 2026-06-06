import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || ''
  try {
    const res  = await fetch(`${apiUrl}/api/categories`, {
      headers: { 'Content-Type': 'application/json' },
      cache:   'no-store',
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
