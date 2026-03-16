import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const agencyUrl = process.env.AGENCY_API_URL || 'https://api.oagencyconsulting.com'
  const apiKey = process.env.AGENCY_API_KEY || ''

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (apiKey) headers['X-API-Key'] = apiKey

  try {
    const body = await request.json()
    const { workflowId } = body
    if (!workflowId) return NextResponse.json({ error: 'workflowId required' }, { status: 400 })

    const res = await fetch(`${agencyUrl}/api/workflows/${workflowId}/approve`, {
      method: 'POST',
      headers,
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return NextResponse.json({ error: 'approval_failed' }, { status: res.status })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'backend_offline' }, { status: 503 })
  }
}
