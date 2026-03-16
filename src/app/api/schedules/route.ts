import { NextResponse } from 'next/server'

export async function GET() {
  const agencyUrl = process.env.AGENCY_API_URL || 'http://localhost:3001'
  const apiKey = process.env.AGENCY_API_KEY || ''

  const headers: Record<string, string> = {}
  if (apiKey) headers['X-API-Key'] = apiKey

  try {
    const res = await fetch(`${agencyUrl}/api/schedules`, {
      headers,
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 0 },
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'backend_offline' }, { status: 503 })
  }
}
