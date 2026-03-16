import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const agencyUrl = process.env.AGENCY_API_URL || 'https://api.oagencyconsulting.com'
  const apiKey = process.env.AGENCY_API_KEY || ''
  const { searchParams } = new URL(req.url)
  const limit = searchParams.get('limit') || '10'

  const headers: Record<string, string> = {}
  if (apiKey) headers['X-API-Key'] = apiKey

  try {
    const res = await fetch(`${agencyUrl}/api/tasks/results?limit=${limit}`, {
      headers,
      signal: AbortSignal.timeout(6000),
      next: { revalidate: 0 },
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    // Return empty results when backend offline
    return NextResponse.json({ results: [] })
  }
}
