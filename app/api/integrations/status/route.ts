import { NextRequest, NextResponse } from 'next/server'

const AGENCY_URL = process.env.AGENCY_API_URL || 'https://api.oagencyconsulting.com'
const API_KEY = process.env.AGENCY_API_KEY || 'oa_live_b051d6501b9db536e386e19539659a93b9bbf98a5401523b50ca49fd859d86cb'

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get('clientId')

  if (!clientId) {
    return NextResponse.json({ error: 'clientId required' }, { status: 400 })
  }

  try {
    const res = await fetch(`${AGENCY_URL}/api/integrations/${clientId}`, {
      headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `Backend error: ${res.status}` }))
      return NextResponse.json(err, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 503 })
  }
}
