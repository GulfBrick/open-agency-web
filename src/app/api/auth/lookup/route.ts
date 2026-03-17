import { NextRequest, NextResponse } from 'next/server'

const agencyUrl = () => process.env.AGENCY_API_URL || 'https://api.oagencyconsulting.com'

export async function POST(req: NextRequest) {
  const body = await req.json()
  try {
    const res = await fetch(`${agencyUrl()}/api/auth/lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'backend_offline' }, { status: 503 })
  }
}
