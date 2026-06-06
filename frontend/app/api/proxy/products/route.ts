import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || ''
  const search = request.nextUrl.search
  try {
    const res  = await fetch(`${apiUrl}/api/products${search}`, {
      headers: { 'Content-Type': 'application/json' },
      cache:   'no-store',
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
