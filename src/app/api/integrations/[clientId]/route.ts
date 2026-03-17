import { NextRequest, NextResponse } from 'next/server'

const agencyUrl = () => process.env.AGENCY_API_URL || 'https://api.oagencyconsulting.com'
const apiHeaders = (): Record<string, string> => {
  const h: Record<string, string> = {}
  if (process.env.AGENCY_API_KEY) h['X-API-Key'] = process.env.AGENCY_API_KEY
  return h
}

export async function GET(_req: NextRequest, { params }: { params: { clientId: string } }) {
  try {
    const res = await fetch(`${agencyUrl()}/api/integrations/${params.clientId}`, {
      headers: apiHeaders(),
      signal: AbortSignal.timeout(8000),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ github: false, gitlab: false, bitbucket: false }, { status: 200 })
  }
}
