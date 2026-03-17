import { NextRequest, NextResponse } from 'next/server'

const agencyUrl = process.env.AGENCY_API_URL || 'https://api.oagencyconsulting.com'
const apiKey = process.env.AGENCY_API_KEY || 'oa_live_b051d6501b9db536e386e19539659a93b9bbf98a5401523b50ca49fd859d86cb'

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params

  try {
    const res = await fetch(`${agencyUrl}/api/clients/${id}/agents`, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      console.error(`[clients/${id}/agents proxy] backend error ${res.status}`)
      return NextResponse.json([])
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error(`[clients/${id}/agents proxy] fetch failed:`, err)
    return NextResponse.json([])
  }
}
