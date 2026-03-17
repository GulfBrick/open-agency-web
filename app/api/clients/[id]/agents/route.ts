import { NextRequest, NextResponse } from 'next/server'

const AGENCY_URL = process.env.AGENCY_API_URL || 'https://api.oagencyconsulting.com'
const API_KEY = process.env.AGENCY_API_KEY || 'oa_live_b051d6501b9db536e386e19539659a93b9bbf98a5401523b50ca49fd859d86cb'

const headers = {
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY,
}

// GET /api/clients/:id/agents — assigned agents with XP and level
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const res = await fetch(`${AGENCY_URL}/api/clients/${id}/agents`, {
      headers,
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: `Backend error: ${res.status}` }))
      return NextResponse.json(data, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    // Return empty array so the portal falls back to demo data gracefully
    return NextResponse.json([])
  }
}
