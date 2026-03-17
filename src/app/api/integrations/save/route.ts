import { NextRequest, NextResponse } from 'next/server'

const agencyUrl = () => process.env.AGENCY_API_URL || 'https://api.oagencyconsulting.com'
const apiHeaders = (): Record<string, string> => {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (process.env.AGENCY_API_KEY) h['X-API-Key'] = process.env.AGENCY_API_KEY
  return h
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  try {
    const res = await fetch(`${agencyUrl()}/api/integrations/save`, {
      method: 'POST',
      headers: apiHeaders(),
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(12000),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'backend_offline' }, { status: 503 })
  }
}
