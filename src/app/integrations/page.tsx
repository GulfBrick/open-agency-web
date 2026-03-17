'use client'

import { useState, useEffect } from 'react'

interface IntegrationStatus {
  github: boolean
  gitlab: boolean
  bitbucket: boolean
  githubRepo: string | null
  gitlabRepo: string | null
  bitbucketRepo: string | null
  dbOffline?: boolean
}

const PLATFORMS = [
  {
    id: 'github',
    name: 'GitHub',
    icon: '🐙',
    color: '#f0f6fc',
    placeholder: 'ghp_xxxxxxxxxxxxxxxxxxxx',
    repoPlaceholder: 'https://github.com/org/repo',
    description: 'Connect your GitHub repos so Kai, Rio, and Nova can push code, open PRs, and deploy.',
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    icon: '🦊',
    color: '#fc6d26',
    placeholder: 'glpat-xxxxxxxxxxxxxxxxxxxx',
    repoPlaceholder: 'https://gitlab.com/org/repo',
    description: 'Connect GitLab for CI/CD and repository access.',
  },
  {
    id: 'bitbucket',
    name: 'Bitbucket',
    icon: '🪣',
    color: '#0052cc',
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
        setMessages(prev => ({ ...prev, [platform]: { type: 'success', text: `✓ Connected as ${data.username}` } }))
        setTokens(prev => ({ ...prev, [platform]: '' }))
        await loadStatus(clientId)
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
      <nav style={{ borderBottom: '1px solid #1a1a1a', padding: '0 32px', display: 'flex', alignItems: 'center', gap: 24, height: 60 }}>
        <a href="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 18 }}>
          Open<span style={{ color: '#7c3aed' }}>Agency</span>
        </a>
        <span style={{ color: '#333', fontSize: 20 }}>|</span>
        <span style={{ color: '#666', fontSize: 14 }}>Integrations</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
          <a href="/portal" style={{ color: '#666', textDecoration: 'none', fontSize: 13 }}>← Portal</a>
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
              Demo mode — tokens won't be saved. Sign in via the portal to connect real integrations.
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {PLATFORMS.map(platform => {
            const isConnected = status?.[platform.id as keyof IntegrationStatus] === true
            const msg = messages[platform.id]

            return (
              <div
                key={platform.id}
                style={{
                  background: '#111',
                  border: `1px solid ${isConnected ? '#22c55e33' : '#1a1a1a'}`,
                  borderRadius: 14,
                  padding: 28,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <span style={{ fontSize: 28 }}>{platform.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 17, color: '#fff' }}>{platform.name}</div>
                    <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>{platform.description}</div>
                  </div>
                  {isConnected && (
                    <div style={{ marginLeft: 'auto', background: '#22c55e22', border: '1px solid #22c55e44', color: '#22c55e', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20 }}>
                      CONNECTED
                    </div>
                  )}
                </div>

                {status?.[`${platform.id}Repo` as keyof IntegrationStatus] && (
                  <div style={{ marginBottom: 14, fontSize: 12, color: '#555', background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 6, padding: '6px 12px' }}>
                    📁 {status[`${platform.id}Repo` as keyof IntegrationStatus]}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 6 }}>Personal Access Token</label>
                    <input
                      type="password"
                      value={tokens[platform.id]}
                      onChange={e => setTokens(prev => ({ ...prev, [platform.id]: e.target.value }))}
                      placeholder={platform.placeholder}
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
                      value={repos[platform.id]}
                      onChange={e => setRepos(prev => ({ ...prev, [platform.id]: e.target.value }))}
                      placeholder={platform.repoPlaceholder}
                      style={{
                        width: '100%', background: '#0a0a0a', border: '1px solid #222', borderRadius: 8,
                        color: '#e5e5e5', fontSize: 13, padding: '10px 14px', outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                    <button
                      onClick={() => saveToken(platform.id)}
                      disabled={saving === platform.id || !tokens[platform.id].trim()}
                      style={{
                        background: '#7c3aed', border: 'none', borderRadius: 8, color: '#fff',
                        padding: '10px 20px', fontSize: 13, fontWeight: 600,
                        cursor: (saving === platform.id || !tokens[platform.id].trim()) ? 'not-allowed' : 'pointer',
                        opacity: (saving === platform.id || !tokens[platform.id].trim()) ? 0.5 : 1,
                      }}
                    >
                      {saving === platform.id ? 'Validating...' : isConnected ? 'Update Token' : 'Connect'}
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
          <div style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 8 }}>🔒 Security</div>
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
