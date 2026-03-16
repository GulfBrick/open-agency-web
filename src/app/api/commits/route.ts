import { NextResponse } from 'next/server'

interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: { date: string; name: string }
  }
  author: { login: string } | null
}

export async function GET() {
  try {
    const res = await fetch(
      'https://api.github.com/repos/GulfBrick/open-agency-web/commits?per_page=8',
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'open-agency-web',
        },
        next: { revalidate: 120 }, // cache for 2 minutes
        signal: AbortSignal.timeout(6000),
      }
    )
    if (!res.ok) {
      return NextResponse.json({ error: 'github_error' }, { status: res.status })
    }
    const data: GitHubCommit[] = await res.json()
    const commits = data.map((c) => ({
      sha: c.sha.substring(0, 7),
      message: c.commit.message.split('\n')[0].substring(0, 80),
      date: c.commit.author.date,
      author: c.author?.login || c.commit.author.name || 'kai',
    }))
    return NextResponse.json(commits)
  } catch {
    return NextResponse.json({ error: 'offline' }, { status: 503 })
  }
}
