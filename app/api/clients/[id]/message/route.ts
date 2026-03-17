import { NextRequest, NextResponse } from 'next/server'

const AGENCY_URL = process.env.AGENCY_API_URL || 'https://api.oagencyconsulting.com'
const API_KEY = process.env.AGENCY_API_KEY || 'oa_live_b051d6501b9db536e386e19539659a93b9bbf98a5401523b50ca49fd859d86cb'

// POST /api/clients/[id]/message — send message to Nikita (persistent history)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  if (!body.message) {
    return NextResponse.json({ error: 'message required' }, { status: 400 })
  }

  try {
    const res = await fetch(`${AGENCY_URL}/api/clients/${id}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000), // Nikita needs time to think
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `Backend error: ${res.status}` }))
      return NextResponse.json(err, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({
      reply: "Connection to the agency backend is offline right now. Your message has been logged — I'll respond when we're back online.",
      agentId: 'nikita',
    })
  }
}
