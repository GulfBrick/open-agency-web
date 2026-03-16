import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const agencyUrl = process.env.AGENCY_API_URL || 'http://localhost:3721'
  const { searchParams } = new URL(req.url)
  const limit = searchParams.get('limit') || '5'

  try {
    const res = await fetch(`${agencyUrl}/api/tasks/results?limit=${limit}`, {
      signal: AbortSignal.timeout(5000),
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    // Return empty results when backend offline
    return NextResponse.json({ results: [] })
  }
}
