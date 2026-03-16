'use client'

import { useState, useRef, useEffect } from 'react'

const AGENTS = {
  ceo: [
    { id: 'nikita', name: 'Nikita', role: 'CEO · Owner', initials: 'N', cls: 'ceo', status: 'online', bubble: 'Reviewing agency status...' },
  ],
  csuite: [
    { id: 'marcus', name: 'Marcus', role: 'CFO', initials: 'M', cls: 'csuite', status: 'online', bubble: 'Reconciling accounts...' },
    { id: 'zara', name: 'Zara', role: 'CTO', initials: 'Z', cls: 'csuite', status: 'online', bubble: 'Reviewing infra...' },
    { id: 'priya', name: 'Priya', role: 'CMO', initials: 'P', cls: 'csuite', status: 'online', bubble: 'Drafting campaigns...' },
  ],
  dev: [
    { id: 'kai', name: 'Kai', role: 'Dev Lead', initials: 'K', cls: 'dev', status: 'online', bubble: 'Merging PR #47...' },
    { id: 'sage', name: 'Sage', role: 'Engineer', initials: 'S', cls: 'dev', status: 'online', bubble: 'Fixing bug #312...' },
    { id: 'luna', name: 'Luna', role: 'Engineer', initials: 'L', cls: 'dev', status: 'online', bubble: 'Shipping feature...' },
    { id: 'rex', name: 'Rex', role: 'Engineer', initials: 'R', cls: 'dev', status: 'online', bubble: 'Writing tests...' },
    { id: 'avery', name: 'Avery', role: 'Engineer', initials: 'A', cls: 'dev', status: 'offline', bubble: 'Idle...' },
    { id: 'quinn', name: 'Quinn', role: 'Engineer', initials: 'Q', cls: 'dev', status: 'online', bubble: 'Optimising query...' },
    { id: 'atlas', name: 'Atlas', role: 'Engineer', initials: 'At', cls: 'dev', status: 'online', bubble: 'Deploying...' },
  ],
  sales: [
    { id: 'river', name: 'River', role: 'Sales', initials: 'Ri', cls: 'sales', status: 'online', bubble: 'Sending proposal...' },
    { id: 'jordan', name: 'Jordan', role: 'Sales', initials: 'J', cls: 'sales', status: 'online', bubble: 'Following up...' },
  ],
  creative: [
    { id: 'nova', name: 'Nova', role: 'Creative', initials: 'No', cls: 'creative', status: 'online', bubble: 'Designing assets...' },
    { id: 'echo', name: 'Echo', role: 'Creative', initials: 'E', cls: 'creative', status: 'online', bubble: 'Editing copy...' },
  ],
}

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: `${10 + (i * 7.3) % 80}%`,
  top: `${20 + (i * 11.7) % 60}%`,
  size: i % 3 === 0 ? 3 : 2,
  duration: `${3 + (i * 0.7)}s`,
  delay: `${(i * 0.4)}s`,
  star: i % 4 === 0,
}))

const HERO_PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${(i * 5.3) % 100}%`,
  top: `${(i * 7.7) % 100}%`,
  size: i % 4 === 0 ? 3 : 2,
  duration: `${4 + (i * 0.5)}s`,
  delay: `${(i * 0.3)}s`,
  star: i % 5 === 0,
}))

interface ChatMessage {
  id: number
  role: 'user' | 'assistant' | 'typing'
  text: string
}

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: 1, role: 'assistant', text: "Hey Harry. Nikita here. Agency is running — what do you need?" },
]

function AgentDesk({ agent }: { agent: typeof AGENTS.csuite[0] }) {
  return (
    <div className={`agent-desk ${agent.id === 'nikita' ? 'ceo-desk' : ''}`}>
      <div className="bubble">{agent.bubble}</div>
      <div className={`desk-avatar ${agent.cls} ${agent.status}`}>
        {agent.initials}
        <span className={`status-indicator ${agent.status}`} />
      </div>
      <div className="desk-name">{agent.name}</div>
      <div className="desk-role">{agent.role}</div>
      <div className="desk-platform" />
    </div>
  )
}

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fade out loading overlay after a short delay
    const t = setTimeout(() => setLoaded(true), 1200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (chatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, chatOpen])

  async function sendMessage() {
    if (!input.trim() || sending) return
    const userMsg = input.trim()
    setInput('')
    setSending(true)

    setMessages(prev => [...prev,
      { id: Date.now(), role: 'user', text: userMsg },
      { id: Date.now() + 1, role: 'typing', text: 'Nikita is thinking...' }
    ])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      })
      const data = await res.json()
      setMessages(prev => {
        const filtered = prev.filter(m => m.role !== 'typing')
        return [...filtered, { id: Date.now() + 2, role: 'assistant', text: data.reply || "On it." }]
      })
    } catch {
      setMessages(prev => {
        const filtered = prev.filter(m => m.role !== 'typing')
        return [...filtered, { id: Date.now() + 2, role: 'assistant', text: "Something went wrong. Check back in a sec." }]
      })
    }
    setSending(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Loading Overlay */}
      <div className={`loading-overlay${loaded ? ' hidden' : ''}`}>
        <div className="load-logo">Open Agency</div>
        <div className="load-spinner" />
        <div className="load-text">Initialising systems...</div>
      </div>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-particles">
          {HERO_PARTICLES.map(p => (
            <div
              key={p.id}
              className={`hero-particle${p.star ? ' star' : ''}`}
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                animationDuration: p.duration,
                animationDelay: p.delay,
              }}
            />
          ))}
        </div>
        <h1 className="hero-wordmark"><span>Open Agency</span></h1>
        <p className="hero-subtitle">Intelligence at work.</p>
        <div className="hero-ticker">
          <div className="pulse-dot" />
          <span className="ticker-text"><span className="ticker-count">13</span> agents online</span>
        </div>
        <div className="hero-scroll">Scroll</div>
      </section>

      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="header-brand">
            <div className="header-title">Open Agency</div>
            <div className="header-tagline">Intelligence at work.</div>
          </div>
        </div>
        <div className="header-right">
          <div className="status-badge">
            <span className="status-dot" />
            All Systems Operational
          </div>
          <span className="uptime">99.9% uptime</span>
        </div>
      </header>

      {/* Main */}
      <main className="main">
        {/* The Building */}
        <div className="building">
          <div className="building-corner building-corner--tl" />
          <div className="building-corner building-corner--tr" />
          <div className="building-corner building-corner--bl" />
          <div className="building-corner building-corner--br" />

          {/* Rooftop */}
          <div className="rooftop">
            <div className="rooftop-particles">
              {PARTICLES.map(p => (
                <div
                  key={p.id}
                  className={`particle ${p.star ? 'star' : ''}`}
                  style={{
                    left: p.left,
                    top: p.top,
                    width: p.size,
                    height: p.size,
                    animationDuration: p.duration,
                    animationDelay: p.delay,
                  }}
                />
              ))}
            </div>
            <div className="rooftop-monogram"><span>OA</span></div>
            <div className="rooftop-logo"><span>Open Agency</span></div>
            <div className="rooftop-tagline">Intelligence at work.</div>
            <div className="rooftop-status">
              <span className="dot" />
              13 agents online · all departments active
            </div>
          </div>

          {/* Floor 05 — CEO */}
          <div className="floor floor-ceo">
            <div className="floor-inner">
              <div className="floor-label">
                <div className="floor-number-badge">05</div>
                <div className="floor-icon">👑</div>
                <div className="floor-number">Floor 05</div>
                <div className="floor-name">CEO · Nikita 👑</div>
              </div>
              <div className="floor-desks">
                <div className="window-glow" />
                {AGENTS.ceo.map(a => <AgentDesk key={a.id} agent={a} />)}
              </div>
            </div>
          </div>

          {/* Floor 04 — C-Suite */}
          <div className="floor floor-csuite">
            <div className="floor-inner">
              <div className="floor-label">
                <div className="floor-number-badge">04</div>
                <div className="floor-icon">👔</div>
                <div className="floor-number">Floor 04</div>
                <div className="floor-name">C-Suite</div>
              </div>
              <div className="floor-desks">
                <div className="window-glow" />
                {AGENTS.csuite.map(a => <AgentDesk key={a.id} agent={a} />)}
              </div>
            </div>
          </div>

          {/* Floor 03 — Dev */}
          <div className="floor floor-dev">
            <div className="floor-inner">
              <div className="floor-label">
                <div className="floor-number-badge">03</div>
                <div className="floor-icon">💻</div>
                <div className="floor-number">Floor 03</div>
                <div className="floor-name">Dev Team</div>
              </div>
              <div className="floor-desks">
                <div className="window-glow" />
                {AGENTS.dev.map(a => <AgentDesk key={a.id} agent={a} />)}
              </div>
            </div>
          </div>

          {/* Floor 02 — Sales */}
          <div className="floor floor-sales">
            <div className="floor-inner">
              <div className="floor-label">
                <div className="floor-number-badge">02</div>
                <div className="floor-icon">📈</div>
                <div className="floor-number">Floor 02</div>
                <div className="floor-name">Sales</div>
              </div>
              <div className="floor-desks">
                <div className="window-glow" />
                {AGENTS.sales.map(a => <AgentDesk key={a.id} agent={a} />)}
              </div>
            </div>
          </div>

          {/* Floor 01 — Creative */}
          <div className="floor floor-creative">
            <div className="floor-inner">
              <div className="floor-label">
                <div className="floor-number-badge">01</div>
                <div className="floor-icon">🎨</div>
                <div className="floor-number">Floor 01</div>
                <div className="floor-name">Creative</div>
              </div>
              <div className="floor-desks">
                <div className="window-glow" />
                {AGENTS.creative.map(a => <AgentDesk key={a.id} agent={a} />)}
              </div>
            </div>
          </div>

          {/* Ground Floor Stats */}
          <div className="ground-floor">
            <div className="ground-stat">
              <div className="ground-stat-icon">🤖</div>
              <div className="ground-stat-value color-violet">13</div>
              <div className="ground-stat-label">Active Agents</div>
            </div>
            <div className="ground-stat">
              <div className="ground-stat-icon">⚡</div>
              <div className="ground-stat-value color-green">247</div>
              <div className="ground-stat-label">Tasks Today</div>
            </div>
            <div className="ground-stat">
              <div className="ground-stat-icon">🏢</div>
              <div className="ground-stat-value color-purple">1</div>
              <div className="ground-stat-label">Active Clients</div>
            </div>
            <div className="ground-stat">
              <div className="ground-stat-icon">📊</div>
              <div className="ground-stat-value color-amber">99.9%</div>
              <div className="ground-stat-label">Uptime</div>
            </div>
          </div>

          {/* Building Foundation */}
          <div className="building-foundation">
            <div className="building-foundation-texture" />
            <div className="building-footer">
              <span>Open Agency</span> &copy; 2026 &middot; Intelligence at work.
            </div>
          </div>
        </div>

        {/* CEO Brief */}
        <div className="ceo-brief">
          <div className="ceo-brief-header">
            <div className="ceo-brief-avatar">N</div>
            <div className="ceo-brief-label">CEO Briefing</div>
          </div>
          <div className="ceo-brief-text">
            Agency is live. Building is up. Dev team is shipping the website every 10 minutes. Clearline Markets is our first active client — Aquas Trading integration in progress. No blockers. All systems green.
          </div>
          <div className="ceo-brief-time">Monday, 16 March 2026 — 09:37 AM</div>
        </div>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          <div className="dash-card card-financials">
            <div className="dash-card-title">
              <span>💰</span> Financials
            </div>
            <div className="finance-grid">
              <div className="finance-item">
                <div className="finance-label">Revenue</div>
                <div className="finance-value color-green">£0</div>
              </div>
              <div className="finance-item">
                <div className="finance-label">Expenses</div>
                <div className="finance-value color-rose">£0</div>
              </div>
              <div className="finance-item">
                <div className="finance-label">Profit</div>
                <div className="finance-value">£0</div>
              </div>
              <div className="finance-item">
                <div className="finance-label">Cash Position</div>
                <div className="finance-value color-violet">£0</div>
              </div>
            </div>
          </div>

          <div className="dash-card card-pipeline">
            <div className="dash-card-title">
              <span>🔥</span> Pipeline
            </div>
            <ul className="dash-card-list">
              <li>
                <span>Clearline Markets</span>
                <span className="badge badge-green">Active</span>
              </li>
              <li>
                <span>Prospect A</span>
                <span className="badge badge-amber">Outreach</span>
              </li>
            </ul>
          </div>

          <div className="dash-card card-sprint">
            <div className="dash-card-title">
              <span>🚀</span> Current Sprint
            </div>
            <ul className="dash-card-list">
              <li>
                <span>oagencyconsulting.com</span>
                <span className="badge badge-blue">In Progress</span>
              </li>
              <li>
                <span>Agent memory system</span>
                <span className="badge badge-violet">Planned</span>
              </li>
            </ul>
          </div>

          <div className="dash-card card-clients">
            <div className="dash-card-title">
              <span>🏢</span> Clients
            </div>
            <div className="dash-card-value color-violet">1</div>
            <div className="dash-card-sub">Clearline Markets · Active</div>
          </div>

          <div className="dash-card card-schedules">
            <div className="dash-card-title">
              <span>📅</span> Schedules
            </div>
            <ul className="dash-card-list">
              <li>
                <span>UI Builder heartbeat</span>
                <span className="badge badge-green">Every 10m</span>
              </li>
              <li>
                <span>Daily brief</span>
                <span className="badge badge-blue">08:00</span>
              </li>
            </ul>
          </div>

          <div className="dash-card card-activity">
            <div className="dash-card-title">
              <span>⚡</span> Live Activity
            </div>
            <ul className="dash-card-list">
              <li><span>Nikita shipped website</span><span className="badge badge-green">Now</span></li>
              <li><span>Kai reviewed PR #47</span><span className="badge badge-blue">2m ago</span></li>
              <li><span>Priya drafted tweet</span><span className="badge badge-violet">5m ago</span></li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-left">Open Agency © 2026 · Intelligence at work.</div>
        <div className="footer-right">
          <span className="footer-tag live">● LIVE</span>
          <span className="footer-tag">oagencyconsulting.com</span>
        </div>
      </footer>

      {/* Nikita Chat — Slide-out Sidebar */}
      <div className={`nikita-chat ${chatOpen ? 'open' : ''}`}>
        <button className="nikita-chat-close" onClick={() => setChatOpen(false)}>✕</button>
        <div className="nikita-chat-header">
          <div className="nikita-avatar">N</div>
          <div>
            <div className="nikita-panel-name">Nikita</div>
            <div className="nikita-panel-role">CEO · Open Agency</div>
          </div>
        </div>
        <div className="nikita-messages">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`chat-msg ${msg.role === 'user' ? 'user' : msg.role === 'typing' ? 'typing' : 'nikita'}`}
            >
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="nikita-chat-bar">
          <div className="nikita-chat-bar-inner">
            <textarea
              className="nikita-chat-input"
              placeholder="Message Nikita..."
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="nikita-chat-send" onClick={sendMessage} disabled={sending}>
              ↑
            </button>
          </div>
        </div>
      </div>
      <button className="nikita-chat-toggle" onClick={() => setChatOpen(o => !o)}>
        {chatOpen ? '✕' : '👩‍💼'}
      </button>
    </>
  )
}
