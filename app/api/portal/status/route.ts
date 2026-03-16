import { NextResponse } from 'next/server'

const AGENCY_URL = process.env.AGENCY_API_URL || 'https://api.oagencyconsulting.com'
const API_KEY = process.env.AGENCY_API_KEY || 'oa_live_b051d6501b9db536e386e19539659a93b9bbf98a5401523b50ca49fd859d86cb'

const headers = {
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY,
}

async function safeFetch(path: string) {
  try {
    const res = await fetch(`${AGENCY_URL}${path}`, { headers, signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function GET() {
  const [status, taskResults, history] = await Promise.all([
    safeFetch('/api/status'),
    safeFetch('/api/tasks/results'),
    safeFetch('/api/nikita/history'),
  ])

  return NextResponse.json({
    status,
    taskResults: taskResults || [],
    history: history || [],
    fetchedAt: new Date().toISOString(),
  })
}
