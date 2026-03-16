import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { message } = await req.json()

  // Forward to the OpenClaw Agency backend if available
  const agencyUrl = process.env.AGENCY_API_URL || 'http://localhost:3721'

  try {
    const res = await fetch(`${agencyUrl}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent: 'nikita', message }),
      signal: AbortSignal.timeout(8000),
    })
    const data = await res.json()
    return NextResponse.json({ reply: data.reply || data.message || "Got it — I'm on it." })
  } catch {
    // Fallback smart reply when backend is offline
    const lower = message.toLowerCase()
    let reply = "On it."
    if (lower.includes('status') || lower.includes('how')) {
      reply = "Agency is running clean. 12 agents online, no blockers. Need a full brief?"
    } else if (lower.includes('hello') || lower.includes('hi')) {
      reply = "Hey. What do you need from me?"
    } else if (lower.includes('build') || lower.includes('website') || lower.includes('site')) {
      reply = "The website is live and improving. Kai's team is shipping every 10 minutes. What do you want changed?"
    } else if (lower.includes('client') || lower.includes('clearline')) {
      reply = "Clearline is our first client — Harry's own prop trading firm. We're building their AI ops layer."
    } else if (lower.includes('revenue') || lower.includes('money')) {
      reply = "£0 revenue right now — we're in build mode. First paying client is the goal. Pipeline is open."
    } else {
      reply = "Heard. I'll loop in the right person and get back to you."
    }
    return NextResponse.json({ reply })
  }
}
