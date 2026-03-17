import { NextRequest, NextResponse } from 'next/server'

const agencyUrl = process.env.AGENCY_API_URL || 'https://api.oagencyconsulting.com'
const apiKey = process.env.AGENCY_API_KEY || 'oa_live_b051d6501b9db536e386e19539659a93b9bbf98a5401523b50ca49fd859d86cb'

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  try {
    const res = await fetch(`${agencyUrl}/api/clients/${id}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      console.error(`[clients/${id}/message proxy] backend error ${res.status}`)
      return NextResponse.json({ reply: 'Nikita is offline right now. Message received.' })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error(`[clients/${id}/message proxy] fetch failed:`, err)
    return NextResponse.json({ reply: 'Nikita is offline right now. Message received.' })
  }
}
