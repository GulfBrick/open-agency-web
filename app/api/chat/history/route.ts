import { NextResponse } from 'next/server'

const AGENCY_URL = process.env.AGENCY_API_URL || 'https://api.oagencyconsulting.com'
const API_KEY = process.env.AGENCY_API_KEY || 'oa_live_b051d6501b9db536e386e19539659a93b9bbf98a5401523b50ca49fd859d86cb'

export async function GET() {
  try {
    const res = await fetch(`${AGENCY_URL}/api/nikita/history`, {
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      console.error(`[chat/history proxy] backend error ${res.status}`)
      return NextResponse.json([])
    }

    const data = await res.json()
    // Normalise — some backends return { messages: [...] } others return the array directly
    const messages = Array.isArray(data) ? data : (data?.messages ?? data?.value ?? [])
    return NextResponse.json(messages)
  } catch (err) {
    console.error('[chat/history proxy] fetch failed:', err)
    // Return empty array when backend is offline — UI seeds the welcome message
    return NextResponse.json([])
  }
}
