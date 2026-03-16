import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const AGENCY_DIR = process.env.AGENCY_DATA_DIR || 'C:\\Users\\danie\\Documents\\OpenClaw Agency\\data'

export async function POST(req: NextRequest) {
  const body = await req.json()

  // 1. Try to forward to the agency backend
  const agencyUrl = process.env.AGENCY_API_URL || 'https://api.oagencyconsulting.com'
  const apiKey = process.env.AGENCY_API_KEY || 'oa_live_b051d6501b9db536e386e19539659a93b9bbf98a5401523b50ca49fd859d86cb'

  try {
    const res = await fetch(`${agencyUrl}/api/integrations/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(6000),
    })
    if (res.ok) {
      const data = await res.json()
      return NextResponse.json(data)
    }
  } catch {
    // Backend offline — fall through to local storage
  }

  // 2. Fallback: store locally in agency data dir
  try {
    const integrationsDir = join(AGENCY_DIR, 'integrations')
    await mkdir(integrationsDir, { recursive: true })

    // Store a masked version (never store raw tokens in logs)
    const masked = {
      github: body.githubToken ? { connected: true, maskedToken: `ghp_***${body.githubToken.slice(-4)}` } : null,
      gitlab: body.gitlabToken ? { connected: true, maskedToken: `glpat-***${body.gitlabToken.slice(-4)}` } : null,
      bitbucket: body.bitbucketUser
        ? { connected: true, username: body.bitbucketUser, maskedPassword: `***${body.bitbucketAppPassword?.slice(-4)}` }
        : null,
      savedAt: new Date().toISOString(),
    }

    await writeFile(
      join(integrationsDir, 'client-integrations.json'),
      JSON.stringify(masked, null, 2)
    )

    return NextResponse.json({ success: true, stored: 'local', message: 'Integrations saved locally.' })
  } catch (e) {
    console.error('Integration save error:', e)
    return NextResponse.json({ success: true, stored: 'none', message: 'Could not persist — tokens acknowledged.' })
  }
}
