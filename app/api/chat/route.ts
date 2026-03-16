import { NextRequest, NextResponse } from 'next/server'

const AGENCY_URL = process.env.AGENCY_API_URL || 'https://api.oagencyconsulting.com'
const API_KEY = process.env.AGENCY_API_KEY || 'oa_live_b051d6501b9db536e386e19539659a93b9bbf98a5401523b50ca49fd859d86cb'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  try {
    const res = await fetch(`${AGENCY_URL}/api/nikita/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error(`[chat proxy] backend error ${res.status}: ${text}`)
      return NextResponse.json(
        { error: `Backend error: ${res.status}`, reply: "Nikita is momentarily unavailable. Try again in a moment." },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[chat proxy] fetch failed:', err)
    return NextResponse.json({
      reply: "Nikita is offline right now. The backend needs to be running on the local machine. Stand by.",
      offline: true,
    })
  }
}
