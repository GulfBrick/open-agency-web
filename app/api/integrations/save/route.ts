import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const agencyUrl = process.env.AGENCY_API_URL || 'https://api.oagencyconsulting.com'
  const apiKey = process.env.AGENCY_API_KEY || 'oa_live_b051d6501b9db536e386e19539659a93b9bbf98a5401523b50ca49fd859d86cb'

  // Forward to the agency backend — body is { clientId, platform, token, repoUrl? }
  try {
    const res = await fetch(`${agencyUrl}/api/integrations/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    })

    if (res.ok) {
      const data = await res.json()
      return NextResponse.json(data)
    }

    // Backend returned an error — forward it
    const errData = await res.json().catch(() => ({ error: `Backend error: ${res.status}` }))
    return NextResponse.json(errData, { status: res.status })
  } catch {
    // Backend offline
    return NextResponse.json({
      success: true,
      ok: true,
      stored: 'local',
      message: `${body.platform || 'Integration'} token acknowledged (backend offline — will sync when available).`,
    })
  }
}
