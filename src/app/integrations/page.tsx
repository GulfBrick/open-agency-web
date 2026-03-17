'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface IntegrationStatus {
  github: boolean
  gitlab: boolean
  bitbucket: boolean
  githubRepo: string | null
  gitlabRepo: string | null
  bitbucketRepo: string | null
  dbOffline?: boolean
}

// Real SVG logos as React components
function GitHubIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" fill="#e5e5e5"/>
    </svg>
  )
}

function GitLabIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 380 380" xmlns="http://www.w3.org/2000/svg">
      <path d="M282.83 170.73l-.27-.69-26.14-68.22a6.81 6.81 0 00-2.69-3.18 7 7 0 00-8 .43 7 7 0 00-2.32 3.52l-17.65 54h-71l-17.65-54a6.86 6.86 0 00-2.32-3.52 7 7 0 00-8-.43 6.87 6.87 0 00-2.69 3.18L97.44 170l-.26.69a48.54 48.54 0 0016.1 56.1l.09.07.24.17 39.82 29.82 19.7 14.91 12 9.06a8.07 8.07 0 009.6 0l12-9.06 19.7-14.91 40.06-30 .1-.08a48.56 48.56 0 0016.04-56.04z" fill="#fc6d26"/>
      <path d="M282.83 170.73l-.27-.69a88.3 88.3 0 00-35.15 15.8L190 229.25c19.55 14.79 36.57 28.48 36.57 28.48l40.06-30 .1-.08a48.56 48.56 0 0016.1-56.92z" fill="#e24329"/>
      <path d="M153.43 257.73l19.7 14.91 12 9.06a8.07 8.07 0 009.6 0l12-9.06 19.7-14.91S209.45 244 190 229.25c-19.45 14.75-36.57 28.48-36.57 28.48z" fill="#fca326"/>
      <path d="M132.58 185.84A88.19 88.19 0 0097.44 170l-.26.69a48.54 48.54 0 0016.1 56.1l.09.07.24.17 39.82 29.82S170.45 243.15 190 229.25l-57.42-43.41z" fill="#e24329"/>
    </svg>
  )
}

function BitbucketIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 4a2 2 0 00-2 2.31l4.36 19.77A2.08 2.08 0 006.39 28H25.7a1.54 1.54 0 001.52-1.31L31.58 6.3A2 2 0 0030 4zm17.07 14.41h-6.2l-1.67-8.72h9.42z" fill="#0052cc"/>
    </svg>
  )
}

const PLATFORMS = [
  {
    id: 'github',
    name: 'GitHub',
    Icon: GitHubIcon,
    placeholder: 'ghp_xxxxxxxxxxxxxxxxxxxx',
    repoPlaceholder: 'https://github.com/org/repo',
    description: 'Connect your GitHub repos so Kai, Rio, and Nova can push code, open PRs, and deploy.',
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    Icon: GitLabIcon,
    placeholder: 'glpat-xxxxxxxxxxxxxxxxxxxx',
    repoPlaceholder: 'https://gitlab.com/org/repo',
    description: 'Connect GitLab for CI/CD and repository access.',
  },
  {
    id: 'bitbucket',
    name: 'Bitbucket',
    Icon: BitbucketIcon,
    placeholder: 'ATBBXXXXXXXXXXXXXXXXXXXX',
    repoPlaceholder: 'https://bitbucket.org/org/repo',
    description: 'Connect Bitbucket for repository access and pipeline integration.',
  },
]

export default function IntegrationsPage() {
  const [clientId, setClientId] = useState<string | null>(null)
  const [status, setStatus] = useState<IntegrationStatus | null>(null)
  const [tokens, setTokens] = useState<Record<string, string>>({ github: '', gitlab: '', bitbucket: '' })
  const [repos, setRepos] = useState<Record<string, string>>({ github: '', gitlab: '', bitbucket: '' })
  const [saving, setSaving] = useState<string | null>(null)
  const [messages, setMessages] = useState<Record<string, { type: 'success' | 'error'; text: string }>>({})
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('oa_client_id') : null
    if (stored) {
      setClientId(stored)
      loadStatus(stored)
    } else {
      setIsDemo(true)
      setStatus({ github: false, gitlab: false, bitbucket: false, githubRepo: null, gitlabRepo: null, bitbucketRepo: null })
    }
  }, [])

  async function loadStatus(id: string) {
    try {
      const res = await fetch(`/api/integrations/${id}`)
      if (res.ok) setStatus(await res.json())
    } catch {
      setStatus({ github: false, gitlab: false, bitbucket: false, githubRepo: null, gitlabRepo: null, bitbucketRepo: null })
    }
  }

  async function saveToken(platform: string) {
    const token = tokens[platform].trim()
    if (!token) return

    if (isDemo || !clientId) {
      setMessages(prev => ({ ...prev, [platform]: { type: 'error', text: 'Sign in to save tokens' } }))
      return
    }

    setSaving(platform)
    setMessages(prev => ({ ...prev, [platform]: undefined as any }))

    try {
      const body: Record<string, string> = { clientId, platform, token }
      if (repos[platform].trim()) body.repoUrl = repos[platform].trim()

      const res = await fetch('/api/integrations/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (res.ok) {
        setMessages(prev => ({ ...prev, [platform]: { type: 'success', text: `Connected as ${data.username}` } }))
        setTokens(prev => ({ ...prev, [platform]: '' }))
        await loadStatus(clientId!)
      } else {
        setMessages(prev => ({ ...prev, [platform]: { type: 'error', text: data.error || 'Failed to save' } }))
      }
    } catch {
      setMessages(prev => ({ ...prev, [platform]: { type: 'error', text: 'Connection failed — try again' } }))
    } finally {
      setSaving(null)
    }
  }

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', fontFamily: "'Inter', 'Helvetica Neue', sans-serif", color: '#e5e5e5' }}>
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #1a1a1a', padding: '0 32px', display: 'flex', alignItems: 'center', gap: 24, height: 60, position: 'sticky', top: 0, background: '#0a0a0a', zIndex: 100 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image
            src="/logo.png"
            alt="Open Agency"
            width={32}
            height={32}
            style={{ borderRadius: 8, objectFit: 'cover' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>
            Open<span style={{ color: '#7c3aed' }}>Agency</span>
          </span>
        </a>
        <span style={{ color: '#333', fontSize: 20 }}>|</span>
        <span style={{ color: '#666', fontSize: 14 }}>Integrations</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
          <a href="/portal" style={{ color: '#666', textDecoration: 'none', fontSize: 13 }}>Portal</a>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: '#fff' }}>Connect Your Tools</h1>
          <p style={{ color: '#555', fontSize: 15, margin: '8px 0 0', lineHeight: 1.6 }}>
            Give your dev team access to your repositories. Tokens are encrypted with AES-256-GCM before storage.
          </p>
          {isDemo && (
            <div style={{ marginTop: 12, background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '10px 16px', fontSize: 13, color: '#666' }}>
              Demo mode — tokens will not be saved. Sign in via the portal to connect real integrations.
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {PLATFORMS.map(({ id, name, Icon, placeholder, repoPlaceholder, description }) => {
            const isConnected = status?.[id as keyof IntegrationStatus] === true
            const repoUrl = status?.[`${id}Repo` as keyof IntegrationStatus]
            const msg = messages[id]

            return (
              <div
                key={id}
                style={{
                  background: '#111',
                  border: `1px solid ${isConnected ? '#22c55e33' : '#1a1a1a'}`,
                  borderRadius: 14,
                  padding: 28,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{ flexShrink: 0 }}>
                    <Icon />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 17, color: '#fff' }}>{name}</div>
                    <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>{description}</div>
                  </div>
                  {isConnected && (
                    <div style={{ marginLeft: 'auto', background: '#22c55e22', border: '1px solid #22c55e44', color: '#22c55e', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                      Connected ✓
                    </div>
                  )}
                </div>

                {repoUrl && (
                  <div style={{ marginBottom: 14, fontSize: 12, color: '#555', background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 6, padding: '6px 12px' }}>
                    Repo: {String(repoUrl)}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 6 }}>Personal Access Token</label>
                    <input
                      type="password"
                      value={tokens[id]}
                      onChange={e => setTokens(prev => ({ ...prev, [id]: e.target.value }))}
                      placeholder={placeholder}
                      style={{
                        width: '100%', background: '#0a0a0a', border: '1px solid #222', borderRadius: 8,
                        color: '#e5e5e5', fontSize: 13, padding: '10px 14px', outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 6 }}>Repository URL (optional)</label>
                    <input
                      type="url"
                      value={repos[id]}
                      onChange={e => setRepos(prev => ({ ...prev, [id]: e.target.value }))}
                      placeholder={repoPlaceholder}
                      style={{
                        width: '100%', background: '#0a0a0a', border: '1px solid #222', borderRadius: 8,
                        color: '#e5e5e5', fontSize: 13, padding: '10px 14px', outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                    <button
                      onClick={() => saveToken(id)}
                      disabled={saving === id || !tokens[id].trim()}
                      style={{
                        background: '#7c3aed', border: 'none', borderRadius: 8, color: '#fff',
                        padding: '10px 20px', fontSize: 13, fontWeight: 600,
                        cursor: (saving === id || !tokens[id].trim()) ? 'not-allowed' : 'pointer',
                        opacity: (saving === id || !tokens[id].trim()) ? 0.5 : 1,
                        transition: 'opacity 0.15s',
                      }}
                    >
                      {saving === id ? 'Validating...' : isConnected ? 'Update Token' : 'Connect'}
                    </button>

                    {msg && (
                      <span style={{ fontSize: 13, color: msg.type === 'success' ? '#22c55e' : '#ef4444' }}>
                        {msg.text}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: 32, background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 8 }}>Security</div>
          <ul style={{ margin: 0, padding: '0 0 0 20px', color: '#444', fontSize: 13, lineHeight: 2 }}>
            <li>Tokens are validated against the platform API before saving</li>
            <li>Stored encrypted at rest with AES-256-GCM</li>
            <li>Never logged or exposed in API responses</li>
            <li>Only decrypted in-memory when agents need to act</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
