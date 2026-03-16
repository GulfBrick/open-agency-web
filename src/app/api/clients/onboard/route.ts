import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const agencyUrl = process.env.AGENCY_API_URL || 'https://api.oagencyconsulting.com'
  const apiKey = process.env.AGENCY_API_KEY || ''

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (apiKey) headers['X-API-Key'] = apiKey

  try {
    const res = await fetch(`${agencyUrl}/api/clients/onboard`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(12000),
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    // Backend offline — return a graceful error
    return NextResponse.json(
      { error: 'API offline', message: 'Client saved locally — will sync when backend reconnects.' },
      { status: 503 }
    )
  }
}
