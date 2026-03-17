import { NextRequest, NextResponse } from 'next/server'

const AGENCY_URL = process.env.AGENCY_API_URL || 'https://api.oagencyconsulting.com'
const API_KEY = process.env.AGENCY_API_KEY || 'oa_live_b051d6501b9db536e386e19539659a93b9bbf98a5401523b50ca49fd859d86cb'

export async function POST(req: NextRequest) {
  const body = await req.json()

  try {
    const res = await fetch(`${AGENCY_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    })

    const data = await res.json().catch(() => ({ error: 'Backend error' }))

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Agency backend unavailable — try again shortly' }, { status: 503 })
  }
}
