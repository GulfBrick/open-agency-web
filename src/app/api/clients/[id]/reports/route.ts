import { NextRequest, NextResponse } from 'next/server'

const agencyUrl = () => process.env.AGENCY_API_URL || 'https://api.oagencyconsulting.com'
const apiHeaders = (): Record<string, string> => {
  const h: Record<string, string> = {}
  if (process.env.AGENCY_API_KEY) h['X-API-Key'] = process.env.AGENCY_API_KEY
  return h
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const res = await fetch(`${agencyUrl()}/api/clients/${params.id}/reports`, {
      headers: apiHeaders(),
      signal: AbortSignal.timeout(8000),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'backend_offline' }, { status: 503 })
  }
}
