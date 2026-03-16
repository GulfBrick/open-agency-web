import { NextResponse } from 'next/server'

export async function GET() {
  const agencyUrl = process.env.AGENCY_API_URL || 'https://api.oagencyconsulting.com'
  const apiKey = process.env.AGENCY_API_KEY || ''

  const headers: Record<string, string> = {}
  if (apiKey) headers['X-API-Key'] = apiKey

  try {
    const res = await fetch(`${agencyUrl}/api/workflows`, {
      headers,
      signal: AbortSignal.timeout(6000),
      next: { revalidate: 0 },
    })
    if (!res.ok) return NextResponse.json([])
    const data = await res.json()
    return NextResponse.json(Array.isArray(data) ? data : [])
  } catch {
    return NextResponse.json([])
  }
}
