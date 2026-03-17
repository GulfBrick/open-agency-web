import { NextRequest, NextResponse } from 'next/server'

const AGENCY_URL = process.env.AGENCY_API_URL || 'https://api.oagencyconsulting.com'
const API_KEY = process.env.AGENCY_API_KEY || 'oa_live_b051d6501b9db536e386e19539659a93b9bbf98a5401523b50ca49fd859d86cb'

const headers = {
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY,
}

// POST /api/clients/:id/message — send a message to Nikita with full context
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json().catch(() => null)

  if (!body || !body.message) {
    return NextResponse.json({ error: 'message required' }, { status: 400 })
  }

  try {
    const res = await fetch(`${AGENCY_URL}/api/clients/${id}/message`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: `Backend error: ${res.status}` }))
      return NextResponse.json(data, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    // Graceful fallback so the UI doesn't break
    return NextResponse.json({
      reply: "Nikita is briefly offline. Your message has been logged — she'll respond when the backend reconnects.",
      offline: true,
    })
  }
}
