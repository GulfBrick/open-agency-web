'use client'

import { useState, useEffect, useRef } from 'react'

// ─── Types ───────────────────────────────────────────────────

interface ClientProfile {
  id: string
  email: string
  businessName: string
  tier: string
  brief: string | null
  createdAt: string
  assignedAgentCount: number
}

interface AgentRow {
  id: string
  agentId: string
  name: string
  role: string
  department: string
  level: number
  xp: number
  xpToNextLevel: number
}

interface Report {
  id: string
  agentId: string
  type: string
  content: {
    summary?: string
    output?: string
    next_actions?: string[]
    confidence?: string
  }
  createdAt: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

// ─── Demo fallback data ──────────────────────────────────────

const DEMO_PROFILE: ClientProfile = {
  id: 'demo',
  email: 'client@example.com',
  businessName: 'Clearline Markets',
  tier: 'enterprise',
  brief: 'Prop trading firm and algo platform. Looking to grow B2B sales and strengthen brand presence.',
  createdAt: new Date().toISOString(),
  assignedAgentCount: 27,
}

const DEMO_AGENTS: AgentRow[] = [
  { id: '1', agentId: 'nikita',  name: 'Nikita',  role: 'CEO',               department: 'Leadership', level: 3, xp: 280, xpToNextLevel: 20 },
  { id: '2', agentId: 'marcus',  name: 'Marcus',  role: 'Finance Director',  department: 'Finance',    level: 2, xp: 150, xpToNextLevel: 50 },
  { id: '3', agentId: 'priya',   name: 'Priya',   role: 'Marketing Director',department: 'Marketing',  level: 2, xp: 180, xpToNextLevel: 20 },
  { id: '4', agentId: 'zara',    name: 'Zara',    role: 'Creative Director', department: 'Creative',   level: 1, xp: 90,  xpToNextLevel: 10 },
  { id: '5', agentId: 'kai',     name: 'Kai',     role: 'Dev Lead',          department: 'Development',level: 2, xp: 120, xpToNextLevel: 80 },
]

const DEMO_REPORTS: Report[] = [
  {
    id: '1', agentId: 'marcus', type: 'weekly-financial-report', createdAt: new Date().toISOString(),
    content: { summary: 'Financial health strong — cash position positive, 3 growth opportunities identified.', output: 'Full financial analysis available after setup.', next_actions: ['Review Q1 projections', 'Chase 2 pending invoices', 'Approve Q2 budget'], confidence: 'high' },
  },
  {
    id: '2', agentId: 'priya', type: 'weekly-content-calendar', createdAt: new Date().toISOString(),
    content: { summary: '2-week content calendar ready — 10 posts planned across LinkedIn, X, and Instagram.', output: 'Content calendar generated and ready for review.', next_actions: ['Approve week 1 content', 'Brief Mia on social scheduling', 'Review competitor content'], confidence: 'high' },
  },
]

// ─── Helper ──────────────────────────────────────────────────

const TIER_COLORS: Record<string, string> = {
  starter: '#6366f1',
  growth: '#7c3aed',
  enterprise: '#dc2626',
}

const DEPT_COLORS: Record<string, string> = {
  Leadership: '#f59e0b',
  Finance: '#10b981',
  Marketing: '#3b82f6',
  Creative: '#ec4899',
  Development: '#8b5cf6',
  Sales: '#f97316',
  Operations: '#14b8a6',
  Legal: '#6b7280',
  HR: '#84cc16',
}

function agentInitials(name: string) {
  return name.slice(0, 2).toUpperCase()
}

// ─── Portal Page ─────────────────────────────────────────────

export default function PortalPage() {
  const [clientId, setClientId] = useState<string | null>(null)
  const [profile, setProfile] = useState<ClientProfile | null>(null)
  const [agents, setAgents] = useState<AgentRow[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'reports' | 'chat'>('overview')
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [isDemo, setIsDemo] = useState(false)
  const [triggerAgent, setTriggerAgent] = useState<string | null>(null)
  const [triggerStatus, setTriggerStatus] = useState<string | null>(null)
  const [kickoffLoading, setKickoffLoading] = useState(false)
  const [kickoffDone, setKickoffDone] = useState(false)
  const [briefEditing, setBriefEditing] = useState(false)
  const [briefDraft, setBriefDraft] = useState('')
  const [briefSaving, setBriefSaving] = useState(false)
  const chatBottomRef = useRef<HTMLDivElement>(null)

  // Load clientId from localStorage (set after login/onboarding)
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('oa_client_id') : null
    if (stored) {
      setClientId(stored)
      loadClientData(stored)
    } else {
      // Demo mode
      setIsDemo(true)
      setProfile(DEMO_PROFILE)
      setAgents(DEMO_AGENTS)
      setReports(DEMO_REPORTS)
    }

    // Check if this is a fresh sign-up (flag set by onboard page)
    const isNew = typeof window !== 'undefined' ? localStorage.getItem('oa_new_client') : null
    if (isNew === '1') {
      localStorage.removeItem('oa_new_client')
      // Will auto-kickoff once profile loads
    }
  }, [])

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  async function loadClientData(id: string) {
    try {
      const [profileRes, agentsRes, reportsRes, messagesRes] = await Promise.all([
        fetch(`/api/clients/${id}`),
        fetch(`/api/clients/${id}/agents`),
        fetch(`/api/clients/${id}/reports`),
        fetch(`/api/clients/${id}/messages`),
      ])

      if (profileRes.ok) {
        const p = await profileRes.json()
        setProfile(p)
        setBriefDraft(p.brief || '')
      } else {
        setIsDemo(true)
        setProfile(DEMO_PROFILE)
        setBriefDraft(DEMO_PROFILE.brief || '')
      }

      if (agentsRes.ok) setAgents(await agentsRes.json())
      else setAgents(DEMO_AGENTS)

      if (reportsRes.ok) setReports(await reportsRes.json())
      else setReports(DEMO_REPORTS)

      if (messagesRes.ok) setMessages(await messagesRes.json())
    } catch {
      setIsDemo(true)
      setProfile(DEMO_PROFILE)
      setAgents(DEMO_AGENTS)
      setReports(DEMO_REPORTS)
    }
  }

  async function saveBrief() {
    if (!clientId || isDemo || briefSaving) return
    setBriefSaving(true)
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: briefDraft.trim() }),
      })
      if (res.ok) {
        const updated = await res.json()
        setProfile(prev => prev ? { ...prev, brief: updated.brief } : prev)
        setBriefEditing(false)
      }
    } catch {
      // silently fail — user can retry
    } finally {
      setBriefSaving(false)
    }
  }

  async function kickoffTeam() {
    if (!clientId || isDemo || kickoffLoading || kickoffDone) return
    setKickoffLoading(true)
    try {
      const res = await fetch(`/api/clients/${clientId}/kickoff`, { method: 'POST' })
      if (res.ok) {
        setKickoffDone(true)
        setTriggerStatus('Your team is spinning up — reports will appear in the Reports tab in ~30–60 seconds.')
        setTimeout(() => setTriggerStatus(null), 8000)
      }
    } catch {
      setTriggerStatus('Kickoff failed — try triggering reports manually below.')
      setTimeout(() => setTriggerStatus(null), 5000)
    } finally {
      setKickoffLoading(false)
    }
  }

  async function sendMessage() {
    if (!chatInput.trim() || chatLoading) return
    const text = chatInput.trim()
    setChatInput('')
    setChatLoading(true)

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, createdAt: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])

    if (isDemo || !clientId) {
      // Demo response
      setTimeout(() => {
        const demoReply: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Got it. I'll look into that for ${profile?.businessName || 'your business'} and come back to you. In the meantime, Marcus is reviewing financials and Priya has your content calendar queued for this week. Anything urgent?`,
          createdAt: new Date().toISOString(),
        }
        setMessages(prev => [...prev, demoReply])
        setChatLoading(false)
      }, 1200)
      return
    }

    try {
      const res = await fetch(`/api/clients/${clientId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json()
      if (data.reply) {
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply,
          createdAt: new Date().toISOString(),
        }
        setMessages(prev => [...prev, assistantMsg])
      }
    } catch {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Something went wrong — I'll be back in a moment.",
        createdAt: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setChatLoading(false)
    }
  }

  async function triggerReport(agentId: string) {
    if (!clientId || isDemo) {
      setTriggerStatus(`Demo mode — ${agentId} report queued (not real)`)
      setTimeout(() => setTriggerStatus(null), 3000)
      return
    }
    setTriggerAgent(agentId)
    setTriggerStatus('Triggering...')
    try {
      const res = await fetch('/api/tasks/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, agentId }),
      })
      const data = await res.json()
      if (data.ok) {
        setTriggerStatus(`${agentId} report started — check reports tab in ~30s`)
      } else {
        setTriggerStatus(`Error: ${data.error || 'unknown'}`)
      }
    } catch {
      setTriggerStatus('Failed to trigger — backend may be offline')
    } finally {
      setTriggerAgent(null)
      setTimeout(() => setTriggerStatus(null), 4000)
    }
  }

  if (!profile) {
    return (
      <div style={{ background: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#666', fontFamily: 'sans-serif' }}>Loading portal...</div>
      </div>
    )
  }

  const tierColor = TIER_COLORS[profile.tier] || '#7c3aed'

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', fontFamily: "'Inter', 'Helvetica Neue', sans-serif", color: '#e5e5e5' }}>
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #1a1a1a', padding: '0 32px', display: 'flex', alignItems: 'center', gap: 24, height: 60 }}>
        <a href="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 18 }}>
          Open<span style={{ color: '#7c3aed' }}>Agency</span>
        </a>
        <span style={{ color: '#333', fontSize: 20 }}>|</span>
        <span style={{ color: '#666', fontSize: 14 }}>Client Portal</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {!isDemo && clientId && (
            <button
              onClick={() => {
                localStorage.removeItem('oa_client_id')
                localStorage.removeItem('oa_business_name')
                localStorage.removeItem('oa_tier')
                window.location.href = '/login'
              }}
              style={{ background: 'none', border: '1px solid #222', borderRadius: 8, color: '#555', fontSize: 12, padding: '5px 12px', cursor: 'pointer' }}
            >
              Sign out
            </button>
          )}
          {isDemo && (
            <span style={{ background: '#1a1a1a', border: '1px solid #333', color: '#666', fontSize: 11, padding: '3px 10px', borderRadius: 20 }}>
              DEMO MODE
            </span>
          )}
          {isDemo && (
            <a href="/login" style={{ color: '#7c3aed', textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>
              Sign in →
            </a>
          )}
          <span style={{ background: `${tierColor}22`, border: `1px solid ${tierColor}`, color: tierColor, fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20 }}>
            {profile.tier.toUpperCase()}
          </span>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: '#fff' }}>{profile.businessName}</h1>
          <p style={{ color: '#555', fontSize: 14, margin: '6px 0 0' }}>
            {profile.assignedAgentCount} agents · {profile.tier} plan · {profile.email}
          </p>
        </div>

        {/* Status bar */}
        {triggerStatus && (
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: 8, padding: '10px 16px', marginBottom: 20, fontSize: 13, color: '#a78bfa' }}>
            {triggerStatus}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: '1px solid #1a1a1a', paddingBottom: 0 }}>
          {(['overview', 'agents', 'reports', 'chat'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '10px 20px',
                color: activeTab === tab ? '#fff' : '#555',
                fontWeight: activeTab === tab ? 600 : 400,
                fontSize: 14,
                borderBottom: activeTab === tab ? '2px solid #7c3aed' : '2px solid transparent',
                marginBottom: -1,
                transition: 'all 0.15s',
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'reports' && reports.length > 0 && (
                <span style={{ marginLeft: 6, background: '#7c3aed', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10 }}>
                  {reports.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
              {[
                { label: 'Agents Assigned', value: profile.assignedAgentCount, icon: '👥' },
                { label: 'Reports Generated', value: reports.length, icon: '📊' },
                { label: 'Messages', value: messages.length, icon: '💬' },
              ].map(stat => (
                <div key={stat.label} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{stat.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{stat.value}</div>
                  <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, padding: 24, marginBottom: 20 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#fff' }}>Trigger Agent Reports</h3>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {(['marcus', 'priya', 'zara', 'nikita'] as const).map(agent => (
                  <button
                    key={agent}
                    onClick={() => triggerReport(agent)}
                    disabled={triggerAgent === agent}
                    style={{
                      background: triggerAgent === agent ? '#1a1a1a' : '#0a0a0a',
                      border: '1px solid #222',
                      color: triggerAgent === agent ? '#555' : '#ccc',
                      padding: '8px 18px',
                      borderRadius: 8,
                      cursor: triggerAgent === agent ? 'not-allowed' : 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                      transition: 'all 0.15s',
                    }}
                  >
                    {triggerAgent === agent ? '...' : `Run ${agent.charAt(0).toUpperCase() + agent.slice(1)}`}
                  </button>
                ))}
              </div>
              <p style={{ margin: '12px 0 0', fontSize: 12, color: '#444' }}>
                Reports take ~20–30 seconds. Results appear in the Reports tab.
              </p>
            </div>

            {/* Kickoff Banner — shown when no reports yet and not in demo */}
            {!isDemo && reports.length === 0 && !kickoffDone && (
              <div style={{ background: '#0d0d1a', border: '1px solid #7c3aed44', borderRadius: 12, padding: 24, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: '#fff', marginBottom: 6 }}>Ready to start your team?</div>
                  <div style={{ fontSize: 13, color: '#666' }}>Fire up your agents for the first time. Nikita and your core team will produce their first reports within 60 seconds.</div>
                </div>
                <button
                  onClick={kickoffTeam}
                  disabled={kickoffLoading}
                  style={{
                    background: '#7c3aed', border: 'none', borderRadius: 10, color: '#fff',
                    padding: '12px 28px', fontSize: 14, fontWeight: 600,
                    cursor: kickoffLoading ? 'not-allowed' : 'pointer',
                    opacity: kickoffLoading ? 0.7 : 1, whiteSpace: 'nowrap', flexShrink: 0,
                  }}
                >
                  {kickoffLoading ? 'Starting...' : 'Start Your Team →'}
                </button>
              </div>
            )}

            {/* Brief */}
            <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Business Brief</h3>
                {!isDemo && !briefEditing && (
                  <button
                    onClick={() => setBriefEditing(true)}
                    style={{ background: 'none', border: '1px solid #222', borderRadius: 6, color: '#555', fontSize: 12, padding: '4px 12px', cursor: 'pointer' }}
                  >
                    {profile.brief ? 'Edit' : 'Add Brief'}
                  </button>
                )}
              </div>
              {briefEditing ? (
                <div>
                  <textarea
                    value={briefDraft}
                    onChange={e => setBriefDraft(e.target.value)}
                    placeholder="Tell your team about your business — what you do, who your customers are, current goals, anything relevant."
                    rows={5}
                    style={{
                      width: '100%', background: '#0a0a0a', border: '1px solid #333', borderRadius: 8,
                      color: '#e5e5e5', fontSize: 14, padding: '12px 14px', outline: 'none',
                      resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    <button
                      onClick={saveBrief}
                      disabled={briefSaving}
                      style={{ background: '#7c3aed', border: 'none', borderRadius: 8, color: '#fff', padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: briefSaving ? 'not-allowed' : 'pointer', opacity: briefSaving ? 0.7 : 1 }}
                    >
                      {briefSaving ? 'Saving...' : 'Save Brief'}
                    </button>
                    <button
                      onClick={() => { setBriefEditing(false); setBriefDraft(profile.brief || '') }}
                      style={{ background: 'none', border: '1px solid #222', borderRadius: 8, color: '#555', padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p style={{ margin: 0, color: profile.brief ? '#aaa' : '#444', lineHeight: 1.7, fontSize: 14, fontStyle: profile.brief ? 'normal' : 'italic' }}>
                  {profile.brief || 'No brief yet — add one so your agents understand your business.'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Agents Tab */}
        {activeTab === 'agents' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {agents.map(agent => {
              const deptColor = DEPT_COLORS[agent.department] || '#666'
              const xpPct = Math.min(100, Math.round((agent.xp / (agent.xp + agent.xpToNextLevel)) * 100))
              return (
                <div key={agent.id} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: `${deptColor}22`, border: `1px solid ${deptColor}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, color: deptColor,
                    }}>
                      {agentInitials(agent.name)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15, color: '#fff' }}>{agent.name}</div>
                      <div style={{ fontSize: 12, color: '#555' }}>{agent.role}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: '#666' }}>Level</div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>{agent.level}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#555', marginBottom: 6 }}>
                    {agent.xp} XP · {agent.xpToNextLevel} to level {agent.level + 1}
                  </div>
                  <div style={{ background: '#0a0a0a', borderRadius: 4, height: 4, overflow: 'hidden' }}>
                    <div style={{ background: deptColor, width: `${xpPct}%`, height: '100%', borderRadius: 4, transition: 'width 0.5s ease' }} />
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                    <span style={{ fontSize: 10, background: `${deptColor}11`, border: `1px solid ${deptColor}33`, color: deptColor, padding: '2px 8px', borderRadius: 10 }}>
                      {agent.department}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div>
            {reports.length === 0 ? (
              <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
                <p style={{ color: '#555', margin: 0 }}>No reports yet. Trigger one from the Overview tab.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {reports.map(report => {
                  const agentMeta = DEMO_AGENTS.find(a => a.agentId === report.agentId)
                  const deptColor = agentMeta ? (DEPT_COLORS[agentMeta.department] || '#666') : '#7c3aed'
                  const content = report.content
                  return (
                    <div key={report.id} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, padding: 24 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: `${deptColor}22`, border: `1px solid ${deptColor}44`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, color: deptColor,
                        }}>
                          {agentInitials(report.agentId)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: '#fff', textTransform: 'capitalize' }}>{report.agentId}</div>
                          <div style={{ fontSize: 11, color: '#555' }}>{report.type.replace(/-/g, ' ')}</div>
                        </div>
                        <div style={{ marginLeft: 'auto', fontSize: 11, color: '#444' }}>
                          {new Date(report.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      {content.summary && (
                        <p style={{ margin: '0 0 12px', fontSize: 14, color: '#ccc', fontWeight: 500 }}>{content.summary}</p>
                      )}
                      {content.output && content.output !== content.summary && (
                        <pre style={{
                          margin: '0 0 14px', fontSize: 12, color: '#777', whiteSpace: 'pre-wrap',
                          background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 8, padding: 16,
                          maxHeight: 200, overflow: 'auto', lineHeight: 1.6,
                        }}>
                          {content.output}
                        </pre>
                      )}
                      {content.next_actions && content.next_actions.length > 0 && (
                        <div>
                          <div style={{ fontSize: 11, color: '#555', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Next Actions</div>
                          {content.next_actions.map((action, i) => (
                            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 4 }}>
                              <span style={{ color: deptColor, fontSize: 12, marginTop: 1 }}>→</span>
                              <span style={{ fontSize: 13, color: '#aaa' }}>{action}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: 500 }}>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.length === 0 && (
                <div style={{ color: '#555', fontSize: 14, textAlign: 'center', marginTop: 40 }}>
                  No messages yet. Say hello to Nikita.
                </div>
              )}
              {messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div style={{
                    maxWidth: '75%',
                    background: msg.role === 'user' ? '#7c3aed22' : '#111',
                    border: `1px solid ${msg.role === 'user' ? '#7c3aed44' : '#1a1a1a'}`,
                    borderRadius: 12,
                    padding: '10px 16px',
                    fontSize: 14,
                    color: '#e5e5e5',
                    lineHeight: 1.6,
                  }}>
                    {msg.role === 'assistant' && (
                      <div style={{ fontSize: 11, color: '#7c3aed', fontWeight: 600, marginBottom: 4 }}>NIKITA</div>
                    )}
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, padding: '10px 16px', fontSize: 13, color: '#555' }}>
                    Nikita is typing...
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Message Nikita..."
                style={{
                  flex: 1, background: '#111', border: '1px solid #222', borderRadius: 10,
                  color: '#e5e5e5', fontSize: 14, padding: '12px 16px', outline: 'none',
                }}
              />
              <button
                onClick={sendMessage}
                disabled={chatLoading || !chatInput.trim()}
                style={{
                  background: '#7c3aed', border: 'none', borderRadius: 10, color: '#fff',
                  padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: chatLoading ? 'not-allowed' : 'pointer',
                  opacity: chatLoading ? 0.5 : 1,
                }}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
