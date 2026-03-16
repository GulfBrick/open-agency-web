'use client'

import { useState, useRef, useEffect } from 'react'

const AGENTS = {
  ceo: [
    { id: 'nikita', name: 'Nikita', role: 'CEO · Owner', initials: 'N', cls: 'ceo', status: 'online', bubble: 'Running the agency...' },
  ],
  creative: [
    { id: 'nova', name: 'Nova', role: 'Creative Director', initials: 'No', cls: 'creative', status: 'online', bubble: 'Designing assets...' },
    { id: 'iris', name: 'Iris', role: 'Designer', initials: 'Ir', cls: 'creative', status: 'online', bubble: 'Crafting visuals...' },
    { id: 'finn', name: 'Finn', role: 'Video Editor', initials: 'F', cls: 'creative', status: 'online', bubble: 'Cutting footage...' },
    { id: 'jade', name: 'Jade', role: 'Social Media', initials: 'Jd', cls: 'creative', status: 'online', bubble: 'Scheduling posts...' },
    { id: 'ash', name: 'Ash', role: 'Copywriter', initials: 'Ash', cls: 'creative', status: 'online', bubble: 'Writing copy...' },
  ],
  sales: [
    { id: 'jordan', name: 'Jordan', role: 'Sales Lead', initials: 'J', cls: 'sales', status: 'online', bubble: 'Closing deals...' },
    { id: 'river', name: 'River', role: 'Closer', initials: 'Ri', cls: 'sales', status: 'online', bubble: 'Sending proposal...' },
    { id: 'quinn', name: 'Quinn', role: 'Lead Qualifier', initials: 'Q', cls: 'sales', status: 'online', bubble: 'Qualifying leads...' },
    { id: 'eden', name: 'Eden', role: 'Follow-Up', initials: 'Ed', cls: 'sales', status: 'online', bubble: 'Following up...' },
    { id: 'blake', name: 'Blake', role: 'Proposals', initials: 'Bl', cls: 'sales', status: 'online', bubble: 'Building deck...' },
  ],
  dev: [
    { id: 'kai', name: 'Kai', role: 'Dev Lead', initials: 'K', cls: 'dev', status: 'online', bubble: 'Merging PR #47...' },
    { id: 'sage', name: 'Sage', role: 'Architect', initials: 'S', cls: 'dev', status: 'online', bubble: 'Designing system...' },
    { id: 'luna', name: 'Luna', role: 'Frontend', initials: 'L', cls: 'dev', status: 'online', bubble: 'Shipping feature...' },
    { id: 'rex', name: 'Rex', role: 'Backend', initials: 'R', cls: 'dev', status: 'online', bubble: 'Writing tests...' },
    { id: 'avery', name: 'Avery', role: 'Fullstack', initials: 'A', cls: 'dev', status: 'offline', bubble: 'Idle...' },
    { id: 'atlas', name: 'Atlas', role: 'QA', initials: 'At', cls: 'dev', status: 'online', bubble: 'Reviewing code...' },
    { id: 'orion', name: 'Orion', role: 'Code Review', initials: 'Or', cls: 'dev', status: 'online', bubble: 'Reviewing PR...' },
  ],
  csuite: [
    { id: 'marcus', name: 'Marcus', role: 'CFO', initials: 'M', cls: 'csuite', status: 'online', bubble: 'Reconciling accounts...' },
    { id: 'zara', name: 'Zara', role: 'CTO', initials: 'Z', cls: 'csuite', status: 'online', bubble: 'Reviewing infra...' },
    { id: 'priya', name: 'Priya', role: 'CMO', initials: 'P', cls: 'csuite', status: 'online', bubble: 'Drafting campaigns...' },
  ],
}

// Cycling bubble messages per agent
const AGENT_BUBBLES: Record<string, string[]> = {
  nikita:  ['Running the agency...', 'Reviewing briefing...', 'Checking pipeline...', 'On a call with Harry...', 'Agency is live'],
  nova:    ['Designing assets...', 'Brand refresh...', 'Updating deck...', 'Review in 5...', 'Typography locked'],
  iris:    ['Crafting visuals...', 'UI polished...', 'Icons done...', 'Design system update', 'Pixel-perfect'],
  finn:    ['Cutting footage...', 'Export queued...', 'Colour grading...', 'Motion graphics...', 'Render at 80%'],
  jade:    ['Scheduling posts...', 'Drafting caption...', 'Story uploaded', 'Engagement up...', 'LinkedIn queued'],
  ash:     ['Writing copy...', 'Blog post done', 'Email draft ready', 'SEO optimised...', 'Headlines polished'],
  jordan:  ['Closing deals...', 'Call with prospect', 'Pipeline updated', 'Sending follow-up', 'Warm lead active'],
  river:   ['Sending proposal...', 'Closing call prep', 'Contract sent', 'Following up...', 'Deal in review'],
  quinn:   ['Qualifying leads...', 'CRM updated', 'New lead scored...', 'Outreach sent...', 'Lead qualified'],
  eden:    ['Following up...', 'Sequences live...', 'Reply received', 'Sequence updated', 'Task done'],
  blake:   ['Building deck...', 'Proposal ready...', 'Design updated', 'Pricing confirmed', 'Deck sent'],
  kai:     ['Merging PR #47...', 'Deploy triggered...', 'CI passing', 'Reviewing PR #51', 'Shipped to prod'],
  sage:    ['Designing system...', 'Architecture done', 'Schema reviewed', 'Infra plan locked', 'Scaling strategy'],
  luna:    ['Shipping feature...', 'Component built', 'CSS polished...', 'Mobile responsive', 'Animation smooth'],
  rex:     ['Writing tests...', 'API endpoint live', 'DB migrated', 'Perf optimised...', 'Test coverage 94%'],
  avery:   ['Idle...', 'Standing by...', 'Available...', 'Ready to deploy', 'Waiting for task'],
  atlas:   ['Reviewing code...', 'PR reviewed', 'Bug reported...', 'Test suite green', 'QA done'],
  orion:   ['Reviewing PR...', 'Comments left', 'Approved PR #49', 'Security check...', 'Review complete'],
  marcus:  ['Reconciling accounts...', 'Invoice raised', 'Burn rate checked', 'P&L updated', 'Cash flow green'],
  zara:    ['Reviewing infra...', 'Uptime 99.9%', 'Scaling nodes...', 'Security patched', 'Infra optimised'],
  priya:   ['Drafting campaigns...', 'Campaign live', 'ROI calculated...', 'Ad creative done', 'Funnel optimised'],
}

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: `${(i * 3.33) % 100}%`,
  bottom: `${(i * 7.7) % 40}%`,
  size: i % 5 === 0 ? 3 : i % 3 === 0 ? 2.5 : 2,
  duration: `${4 + (i * 0.4) % 6}s`,
  delay: `${(i * 0.27) % 8}s`,
  star: i % 5 === 0,
  twinkle: false,
  opacity: 0.4 + (i % 4) * 0.15,
}))

// Twinkling star particles for rooftop (matches local dashboard)
const TWINKLE_STARS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${(i * 5.13) % 100}%`,
  top: `${(i * 7.3) % 70}%`,
  size: 2 + (i % 4 === 0 ? 3 : i % 3 === 0 ? 2 : 1),
  duration: `${2 + (i * 0.37) % 4}s`,
  delay: `${(i * 0.24) % 5}s`,
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
  role: 'user' | 'assistant' | 'typing' | 'agent'
  text: string
  time?: string
  agentId?: string
  agentName?: string
  agentInitials?: string
  agentDept?: 'ceo' | 'csuite' | 'dev' | 'sales' | 'creative'
  taskStatus?: 'completed' | 'failed' | 'pending' | 'in_progress'
}

interface AgentReport {
  id: string
  agentId: string
  description: string
  status: 'completed' | 'failed' | 'pending' | 'in_progress'
  createdAt?: string
}

// Map agentId → display info
const AGENT_INFO: Record<string, { name: string; initials: string; dept: 'ceo' | 'csuite' | 'dev' | 'sales' | 'creative' }> = {
  nikita: { name: 'Nikita', initials: 'N',   dept: 'ceo' },
  marcus: { name: 'Marcus', initials: 'M',   dept: 'csuite' },
  zara:   { name: 'Zara',   initials: 'Z',   dept: 'csuite' },
  priya:  { name: 'Priya',  initials: 'P',   dept: 'csuite' },
  kai:    { name: 'Kai',    initials: 'K',   dept: 'dev' },
  sage:   { name: 'Sage',   initials: 'S',   dept: 'dev' },
  luna:   { name: 'Luna',   initials: 'L',   dept: 'dev' },
  rex:    { name: 'Rex',    initials: 'R',   dept: 'dev' },
  avery:  { name: 'Avery',  initials: 'A',   dept: 'dev' },
  atlas:  { name: 'Atlas',  initials: 'At',  dept: 'dev' },
  orion:  { name: 'Orion',  initials: 'Or',  dept: 'dev' },
  river:  { name: 'River',  initials: 'Ri',  dept: 'sales' },
  jordan: { name: 'Jordan', initials: 'J',   dept: 'sales' },
  quinn:  { name: 'Quinn',  initials: 'Q',   dept: 'sales' },
  eden:   { name: 'Eden',   initials: 'Ed',  dept: 'sales' },
  blake:  { name: 'Blake',  initials: 'Bl',  dept: 'sales' },
  nova:   { name: 'Nova',   initials: 'No',  dept: 'creative' },
  iris:   { name: 'Iris',   initials: 'Ir',  dept: 'creative' },
  finn:   { name: 'Finn',   initials: 'F',   dept: 'creative' },
  jade:   { name: 'Jade',   initials: 'Jd',  dept: 'creative' },
  ash:    { name: 'Ash',    initials: 'Ash', dept: 'creative' },
}

function chatTimeStr() {
  return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

// Minimal markdown renderer: **bold**, newlines → <br>, blank lines → paragraphs
function renderBriefingMarkdown(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  // Bold
  const bolded = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  // Bullet points
  const bulleted = bolded.replace(/^[•\-]\s+(.+)$/gm, '<span class="brief-bullet">$1</span>')
  // Paragraph breaks
  const paragraphed = bulleted.replace(/\n{2,}/g, '</p><p class="brief-para">').replace(/\n/g, '<br />')
  return `<p class="brief-para">${paragraphed}</p>`
}


const INITIAL_MESSAGES: ChatMessage[] = [
  { id: 1, role: 'assistant', text: "Hey Harry. Nikita here. Agency is running — what do you need?", time: chatTimeStr() },
]

// Static per-agent "stats" for the popup — tasks done, tasks running
const AGENT_STATS: Record<string, { done: number; active: number; rank: string }> = {
  nikita:  { done: 247, active: 3,  rank: 'CEO · Owner' },
  marcus:  { done: 89,  active: 1,  rank: 'CFO · Finance' },
  zara:    { done: 134, active: 2,  rank: 'CTO · Technology' },
  priya:   { done: 112, active: 2,  rank: 'CMO · Marketing' },
  kai:     { done: 198, active: 4,  rank: 'Dev Lead · Shipping' },
  sage:    { done: 76,  active: 1,  rank: 'Architect · Systems' },
  luna:    { done: 143, active: 3,  rank: 'Frontend · UI' },
  rex:     { done: 97,  active: 2,  rank: 'Backend · APIs' },
  avery:   { done: 44,  active: 0,  rank: 'Fullstack · Idle' },
  atlas:   { done: 88,  active: 1,  rank: 'QA · Reviews' },
  orion:   { done: 67,  active: 1,  rank: 'Code Review' },
  river:   { done: 54,  active: 1,  rank: 'Closer · Sales' },
  jordan:  { done: 72,  active: 2,  rank: 'Sales Lead' },
  quinn:   { done: 61,  active: 1,  rank: 'Lead Qualifier' },
  eden:    { done: 49,  active: 1,  rank: 'Follow-Up · CRM' },
  blake:   { done: 38,  active: 1,  rank: 'Proposals · Decks' },
  nova:    { done: 93,  active: 2,  rank: 'Creative Director' },
  iris:    { done: 81,  active: 2,  rank: 'Designer · Brand' },
  finn:    { done: 57,  active: 1,  rank: 'Video · Motion' },
  jade:    { done: 64,  active: 2,  rank: 'Social · Content' },
  ash:     { done: 79,  active: 2,  rank: 'Copywriter · Copy' },
}

function AgentDesk({ agent }: { agent: typeof AGENTS.csuite[0] }) {
  const [hovered, setHovered] = useState(false)
  const [bubbleIdx, setBubbleIdx] = useState(0)
  const isOnline = agent.status === 'online'
  const isCeo = agent.id === 'nikita'
  const stats = AGENT_STATS[agent.id] || { done: 0, active: 0, rank: agent.role }
  const bubbles = AGENT_BUBBLES[agent.id] || [agent.bubble]

  // Cycle bubble text every 4–8s (stagger by agent index in array)
  useEffect(() => {
    const offset = (agent.id.charCodeAt(0) % 5) * 1200
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setBubbleIdx(i => (i + 1) % bubbles.length)
      }, 5000 + offset)
      return () => clearInterval(interval)
    }, offset)
    return () => clearTimeout(timer)
  }, [bubbles.length, agent.id])

  return (
    <div
      className={`agent-desk${isOnline ? ' is-online' : ''}${isCeo ? ' ceo-desk' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Hover Popup */}
      <div className={`agent-popup${hovered ? ' visible' : ''}`}>
        <div className="popup-header">
          <div className={`popup-avatar ${agent.cls}`}>{agent.initials}</div>
          <div>
            <div className="popup-name">{agent.name}</div>
            <div className="popup-role">{agent.role}</div>
          </div>
        </div>
        <div className="popup-stats">
          <div className="popup-stat">
            <div className={`popup-stat-value color-${agent.cls === 'dev' ? 'blue' : agent.cls === 'sales' ? 'amber' : agent.cls === 'creative' ? 'rose' : 'violet'}`}>{stats.done}</div>
            <div className="popup-stat-label">Tasks Done</div>
          </div>
          <div className="popup-stat">
            <div className="popup-stat-value color-green">{stats.active}</div>
            <div className="popup-stat-label">Active Now</div>
          </div>
        </div>
        <div className="popup-rank">
          <span>{stats.rank}</span>
        </div>
        <div className="popup-status-row">
          <div className={`popup-status-dot ${agent.status}`} />
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      <div className="bubble">{bubbles[bubbleIdx]}</div>
      <div className="desk-surface">
        <div className="desk-monitor">💻</div>
        <div className={`desk-avatar ${agent.cls} ${agent.status}`}>
          {agent.initials}
          <span className={`status-indicator ${agent.status}`} />
        </div>
      </div>
      <div className="desk-name">{agent.name}</div>
      <div className="desk-role">{agent.role}</div>
      <div className="desk-platform" />
    </div>
  )
}

interface AgencyStatus {
  agents?: Array<{ id: string; name: string; status: string; floor: string; tasksCompleted?: number; successRate?: number; rank?: string | null }>
  clients?: Array<{ id: string; name: string; status: string }>
  finances?: { revenue?: number; expenses?: number; profit?: number; cashPosition?: number }
  pipeline?: { hot?: number; warm?: number; cold?: number; won?: number; wonThisMonth?: number; total?: number }
  activeSprints?: Array<{
    name?: string; sprintName?: string; clientId?: string; status?: string;
    progress?: number; done?: number; inProgress?: number; todo?: number;
    tasksDone?: number; tasksInProgress?: number; totalTasks?: number; blockers?: number;
  }>
  recentLogs?: Array<{ timestamp: string; agent: string; type: string; data?: Record<string, unknown> }>
  lastBriefing?: string
  systemHealth?: { uptime?: number; uptimeFormatted?: string; bootCount?: number; schedulerActive?: boolean; registeredAgents?: number; lastBriefing?: string }
}

interface ScheduleItem {
  name: string
  description?: string
  interval?: string
  nextRun?: string
  lastRun?: string
  enabled?: boolean
  status?: string
}

interface TaskCounts {
  pending: number
  in_progress: number
  completed: number
  failed: number
  total: number
}

// Animated stat number component — counts up from 0 when value changes
function AnimatedStat({ value, isCurrency = false, className = '' }: { value: number; isCurrency?: boolean; className?: string }) {
  const [display, setDisplay] = useState(isCurrency ? '£0' : '0')
  const prevValue = useRef(-1)

  useEffect(() => {
    if (value === prevValue.current) return
    prevValue.current = value

    const duration = 1200
    const start = performance.now()

    function update(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(value * eased)
      setDisplay(isCurrency ? `£${current.toLocaleString()}` : current.toLocaleString())
      if (progress < 1) requestAnimationFrame(update)
    }

    requestAnimationFrame(update)
  }, [value, isCurrency])

  return <span className={className}>{display}</span>
}

function LiveClock() {
  const [time, setTime] = useState<string>('')
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [])
  return <span className="live-clock">{time}</span>
}

const VALUE_PROPS = [
  { text: 'Sales team. Fully autonomous.', dept: 'sales' },
  { text: 'Dev team. Ships around the clock.', dept: 'dev' },
  { text: 'Creative. Always on brief.', dept: 'creative' },
  { text: 'Finance & ops. Zero overhead.', dept: 'csuite' },
  { text: 'Every client. Smarter every day.', dept: 'ceo' },
]

function ValuePropTicker() {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % VALUE_PROPS.length)
        setVisible(true)
      }, 350)
    }, 3200)
    return () => clearInterval(interval)
  }, [])

  const prop = VALUE_PROPS[idx]
  return (
    <div className={`value-prop-ticker value-prop-${prop.dept}${visible ? ' visible' : ''}`}>
      {prop.text}
    </div>
  )
}

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [agentReports, setAgentReports] = useState<AgentReport[]>([])
  const [reportsExpanded, setReportsExpanded] = useState(true)
  const [agencyStatus, setAgencyStatus] = useState<AgencyStatus | null>(null)
  const [taskCounts, setTaskCounts] = useState<TaskCounts>({ pending: 0, in_progress: 0, completed: 0, failed: 0, total: 0 })
  const [unreadCount, setUnreadCount] = useState(0)
  const [schedules, setSchedules] = useState<ScheduleItem[]>([])
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [apiOnline, setApiOnline] = useState<boolean | null>(null)
  const [runningSchedule, setRunningSchedule] = useState<string | null>(null)
  const [runToast, setRunToast] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatHasSeeded = useRef(false)
  const unreadReportIds = useRef<Set<string>>(new Set())
  const chatOpenRef = useRef(chatOpen)
  useEffect(() => { chatOpenRef.current = chatOpen }, [chatOpen])

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1200)
    return () => clearTimeout(t)
  }, [])

  // Fetch live agency status every 30s — also tracks API online/offline
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/status')
        if (res.ok) {
          const data = await res.json()
          if (!data.error) {
            setAgencyStatus(data)
            setApiOnline(true)
          } else {
            setApiOnline(false)
          }
        } else {
          setApiOnline(false)
        }
      } catch { setApiOnline(false) }
    }
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  // Fetch task queue counts every 20s
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks/results?limit=100')
        if (res.ok) {
          const data = await res.json()
          if (data.results && Array.isArray(data.results)) {
            const results = data.results as AgentReport[]
            const counts = results.reduce((acc, r) => {
              const s = r.status
              if (s === 'pending') acc.pending++
              else if (s === 'in_progress') acc.in_progress++
              else if (s === 'completed') acc.completed++
              else if (s === 'failed') acc.failed++
              acc.total++
              return acc
            }, { pending: 0, in_progress: 0, completed: 0, failed: 0, total: 0 })
            setTaskCounts(counts)
            // Also store all results so task feed card can display them
            setAgentReports(results)
          }
        }
      } catch { /* backend offline */ }
    }
    fetchTasks()
    const interval = setInterval(fetchTasks, 20000)
    return () => clearInterval(interval)
  }, [])

  // Fetch live schedules from API every 60s
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await fetch('/api/schedules')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data)) setSchedules(data)
        }
      } catch { /* backend offline */ }
    }
    fetchSchedules()
    const interval = setInterval(fetchSchedules, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (chatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, chatOpen])

  // Load Nikita chat history from API on mount (matches local dashboard)
  useEffect(() => {
    if (historyLoaded) return
    const loadHistory = async () => {
      try {
        const res = await fetch('/api/chat/history')
        if (!res.ok) return
        const history = await res.json()
        if (Array.isArray(history) && history.length > 0) {
          const msgs: ChatMessage[] = history.map((m: { role: string; content: string; channel?: string; timestamp?: string }, i: number) => ({
            id: -(i + 1), // negative IDs so they don't conflict with new msgs
            role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
            text: m.content || '',
            time: m.timestamp
              ? new Date(m.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
              : undefined,
          }))
          // Prepend history before the initial greeting, deduplicate
          setMessages(prev => {
            const historyMsgs = msgs.filter(hm => !prev.some(pm => pm.text === hm.text && pm.role === hm.role))
            return historyMsgs.length > 0 ? [...historyMsgs, ...prev] : prev
          })
        }
      } catch { /* history endpoint offline */ }
      setHistoryLoaded(true)
    }
    loadHistory()
  }, [historyLoaded])

  // Track which report IDs have already been shown as chat bubbles
  const seenReportIds = useRef<Set<string>>(new Set())

  // Poll agent reports — inject NEW ones as colored dept bubbles in chat
  // Runs always (not gated on chatOpen) so unread badge works even when panel is closed
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch('/api/tasks/results?limit=10')
        const data = await res.json()
        if (data.results && Array.isArray(data.results)) {
          setAgentReports(data.results)

          // On first run, seed seen IDs so we don't flood old completed tasks
          if (!chatHasSeeded.current) {
            data.results.forEach((r: AgentReport) => seenReportIds.current.add(r.id))
            chatHasSeeded.current = true
            return
          }

          // Inject any newly completed/failed reports as chat bubbles
          const newReports: AgentReport[] = data.results.filter(
            (r: AgentReport) => !seenReportIds.current.has(r.id) &&
            (r.status === 'completed' || r.status === 'failed')
          )
          if (newReports.length > 0) {
            const bubbles: ChatMessage[] = newReports.map((r: AgentReport) => {
              const info = AGENT_INFO[r.agentId?.toLowerCase()] || {
                name: r.agentId || 'Agent',
                initials: (r.agentId || 'A').charAt(0).toUpperCase(),
                dept: 'csuite' as const,
              }
              return {
                id: Date.now() + Math.random(),
                role: 'agent' as const,
                text: r.description,
                time: r.createdAt
                  ? new Date(r.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                  : chatTimeStr(),
                agentId: r.agentId,
                agentName: info.name,
                agentInitials: info.initials,
                agentDept: info.dept,
                taskStatus: r.status,
              }
            })
            newReports.forEach((r: AgentReport) => {
              seenReportIds.current.add(r.id)
              unreadReportIds.current.add(r.id)
            })
            setMessages(prev => [...prev, ...bubbles])
            // If chat is closed, bump unread count
            if (!chatOpenRef.current) {
              setUnreadCount(prev => prev + newReports.length)
            }
          }
        }
      } catch { /* offline */ }
    }
    fetchReports()
    const interval = setInterval(fetchReports, 8000)
    return () => clearInterval(interval)
  }, [])

  async function sendMessage() {
    if (!input.trim() || sending) return
    const userMsg = input.trim()
    setInput('')
    setSending(true)

    const now = chatTimeStr()
    setMessages(prev => [...prev,
      { id: Date.now(), role: 'user', text: userMsg, time: now },
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
        return [...filtered, { id: Date.now() + 2, role: 'assistant', text: data.reply || "On it.", time: chatTimeStr() }]
      })
      // Refresh reports after message — inject new ones as bubbles
      try {
        const rr = await fetch('/api/tasks/results?limit=10')
        const rd = await rr.json()
        if (rd.results && Array.isArray(rd.results)) {
          setAgentReports(rd.results)
          const newReports: AgentReport[] = rd.results.filter(
            (r: AgentReport) => !seenReportIds.current.has(r.id) &&
            (r.status === 'completed' || r.status === 'failed')
          )
          if (newReports.length > 0) {
            const bubbles: ChatMessage[] = newReports.map((r: AgentReport) => {
              const info = AGENT_INFO[r.agentId?.toLowerCase()] || {
                name: r.agentId || 'Agent',
                initials: (r.agentId || 'A').charAt(0).toUpperCase(),
                dept: 'csuite' as const,
              }
              return {
                id: Date.now() + Math.random(),
                role: 'agent' as const,
                text: r.description,
                time: r.createdAt
                  ? new Date(r.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                  : chatTimeStr(),
                agentId: r.agentId,
                agentName: info.name,
                agentInitials: info.initials,
                agentDept: info.dept,
                taskStatus: r.status,
              }
            })
            newReports.forEach((r: AgentReport) => seenReportIds.current.add(r.id))
            setMessages(prev => [...prev, ...bubbles])
          }
        }
      } catch { /* offline */ }
    } catch {
      setMessages(prev => {
        const filtered = prev.filter(m => m.role !== 'typing')
        return [...filtered, { id: Date.now() + 2, role: 'assistant', text: "Connection issue. I might be offline — try again in a moment.", time: chatTimeStr() }]
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

  async function runScheduleNow(name: string) {
    if (runningSchedule) return
    setRunningSchedule(name)
    setRunToast(null)
    try {
      const res = await fetch('/api/schedules/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (data.error) {
        setRunToast(`⚠ ${name}: API offline — couldn't trigger`)
      } else {
        setRunToast(`✓ ${name} triggered`)
      }
    } catch {
      setRunToast(`⚠ ${name}: failed to trigger`)
    }
    setRunningSchedule(null)
    setTimeout(() => setRunToast(null), 3500)
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
        <ValuePropTicker />
        <div className="hero-ticker">
          <div className="pulse-dot" />
          <span className="ticker-text"><span className="ticker-count">{agencyStatus?.agents ? agencyStatus.agents.filter((a) => a.status === 'online' || a.status === 'ACTIVE').length : 20}</span> agents online</span>
        </div>
        <div className="hero-ctas">
          <button
            className="hero-cta-primary"
            onClick={() => { setChatOpen(true); setUnreadCount(0) }}
          >
            Talk to Nikita <span className="hero-cta-arrow">↓</span>
          </button>
          <a className="hero-cta-secondary" href="#building">
            See the team →
          </a>
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
          <LiveClock />
          <div className={`status-badge${apiOnline === false ? ' offline' : ''}`}>
            <span className="status-dot" />
            {apiOnline === false ? 'API Offline' : apiOnline === true ? 'All Systems Operational' : 'Connecting...'}
          </div>
          <span className="uptime">{agencyStatus?.systemHealth?.uptimeFormatted ? `↑ ${agencyStatus.systemHealth.uptimeFormatted}` : '99.9% uptime'}</span>
          <button
            className="header-cta"
            onClick={() => { setChatOpen(true); setUnreadCount(0) }}
          >
            💬 Chat
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="main">
        {/* The Building */}
        <div className="building" id="building">
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
                    bottom: p.bottom,
                    width: p.size,
                    height: p.size,
                    animationDuration: p.duration,
                    animationDelay: p.delay,
                    opacity: p.opacity,
                  }}
                />
              ))}
              {/* Twinkling stars — faithful to local dashboard */}
              {TWINKLE_STARS.map(s => (
                <div
                  key={`tw-${s.id}`}
                  className="particle twinkle star"
                  style={{
                    left: s.left,
                    top: s.top,
                    width: s.size,
                    height: s.size,
                    animationDuration: s.duration,
                    animationDelay: s.delay,
                    bottom: 'auto',
                  }}
                />
              ))}
            </div>
            <div className="rooftop-monogram"><span>OA</span></div>
            <div className="rooftop-logo"><span>Open Agency</span></div>
            <div className="rooftop-tagline">Intelligence at work.</div>
            <div className="rooftop-status">
              <span className="dot" />
              {agencyStatus?.agents ? `${agencyStatus.agents.filter((a) => a.status === 'online' || a.status === 'ACTIVE').length} agents online · all departments active` : '20 agents online · all departments active'}
            </div>
          </div>

          {/* Floor 05 — CEO */}
          <div className="floor floor-ceo floor-enter" style={{ animationDelay: '0.1s' }}>
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

          {/* Floor 04 — Creative */}
          <div className="floor floor-creative floor-enter" style={{ animationDelay: '0.25s' }}>
            <div className="floor-inner">
              <div className="floor-label">
                <div className="floor-number-badge">04</div>
                <div className="floor-icon">🎨</div>
                <div className="floor-number">Floor 04</div>
                <div className="floor-name">Creative</div>
              </div>
              <div className="floor-desks">
                <div className="window-glow" />
                {AGENTS.creative.map(a => <AgentDesk key={a.id} agent={a} />)}
              </div>
            </div>
          </div>

          {/* Floor 03 — Sales */}
          <div className="floor floor-sales floor-enter" style={{ animationDelay: '0.4s' }}>
            <div className="floor-inner">
              <div className="floor-label">
                <div className="floor-number-badge">03</div>
                <div className="floor-icon">📈</div>
                <div className="floor-number">Floor 03</div>
                <div className="floor-name">Sales</div>
              </div>
              <div className="floor-desks">
                <div className="window-glow" />
                {AGENTS.sales.map(a => <AgentDesk key={a.id} agent={a} />)}
              </div>
            </div>
          </div>

          {/* Floor 02 — Dev */}
          <div className="floor floor-dev floor-enter" style={{ animationDelay: '0.55s' }}>
            <div className="floor-inner">
              <div className="floor-label">
                <div className="floor-number-badge">02</div>
                <div className="floor-icon">💻</div>
                <div className="floor-number">Floor 02</div>
                <div className="floor-name">Dev Team</div>
              </div>
              <div className="floor-desks">
                <div className="window-glow" />
                {AGENTS.dev.map(a => <AgentDesk key={a.id} agent={a} />)}
              </div>
            </div>
          </div>

          {/* Floor 01 — C-Suite */}
          <div className="floor floor-csuite floor-enter" style={{ animationDelay: '0.7s' }}>
            <div className="floor-inner">
              <div className="floor-label">
                <div className="floor-number-badge">01</div>
                <div className="floor-icon">👔</div>
                <div className="floor-number">Floor 01</div>
                <div className="floor-name">C-Suite</div>
              </div>
              <div className="floor-desks">
                <div className="window-glow" />
                {AGENTS.csuite.map(a => <AgentDesk key={a.id} agent={a} />)}
              </div>
            </div>
          </div>

          {/* Ground Floor Stats — 6 live data cards */}
          <div className="ground-floor">
            <div className="ground-stat">
              <div className="ground-stat-icon color-violet">●</div>
              <div className="ground-stat-value">
                <AnimatedStat
                  value={agencyStatus?.agents ? agencyStatus.agents.filter((a) => a.status === 'online' || a.status === 'ACTIVE').length : 20}
                  className="color-violet"
                />
              </div>
              <div className="ground-stat-label">Agents Online</div>
            </div>
            <div className="ground-stat">
              <div className="ground-stat-icon color-green">◆</div>
              <div className="ground-stat-value">
                <AnimatedStat
                  value={agencyStatus?.pipeline
                    ? (agencyStatus.pipeline.total ?? (agencyStatus.pipeline.hot || 0) + (agencyStatus.pipeline.warm || 0) + (agencyStatus.pipeline.cold || 0) + (agencyStatus.pipeline.won || 0))
                    : 0}
                  className="color-green"
                />
              </div>
              <div className="ground-stat-label">Pipeline</div>
            </div>
            <div className="ground-stat">
              <div className="ground-stat-icon color-purple">£</div>
              <div className="ground-stat-value">
                <AnimatedStat
                  value={agencyStatus?.finances?.revenue || 0}
                  isCurrency={true}
                  className="color-purple"
                />
              </div>
              <div className="ground-stat-label">Revenue</div>
            </div>
            <div className="ground-stat">
              <div className="ground-stat-icon color-amber">⚡</div>
              <div className="ground-stat-value">
                <AnimatedStat
                  value={agencyStatus?.systemHealth?.bootCount ?? 0}
                  className="color-amber"
                />
              </div>
              <div className="ground-stat-label">Boot Count</div>
            </div>
            <div className="ground-stat">
              <div className="ground-stat-icon color-blue">✓</div>
              <div className="ground-stat-value">
                <AnimatedStat
                  value={
                    agencyStatus?.agents
                      ? agencyStatus.agents.reduce((sum, a) => sum + (a.tasksCompleted || 0), 0)
                      : taskCounts.completed
                  }
                  className="color-blue"
                />
              </div>
              <div className="ground-stat-label">Tasks Done</div>
            </div>
            <div className="ground-stat">
              <div className="ground-stat-icon color-rose">↑</div>
              <div className="ground-stat-value color-rose">
                {agencyStatus?.systemHealth?.uptimeFormatted || '99.9%'}
              </div>
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
            {agencyStatus?.lastBriefing && (
              <span className="ceo-brief-live-badge">● LIVE</span>
            )}
          </div>
          {agencyStatus?.lastBriefing ? (
            <div
              className="ceo-brief-text ceo-brief-rich"
              dangerouslySetInnerHTML={{ __html: renderBriefingMarkdown(agencyStatus.lastBriefing) }}
            />
          ) : (
            <div className="ceo-brief-text empty">
              Agency is live. Building is up. Dev team shipping every 10 minutes. Clearline Markets is our first active client. No blockers. All systems green.
            </div>
          )}
          {/* Department status pills */}
          <div className="ceo-brief-dept-row">
            <span className="ceo-brief-dept-pill dept-pill-ceo">👑 CEO</span>
            <span className="ceo-brief-dept-pill dept-pill-creative">🎨 Creative</span>
            <span className="ceo-brief-dept-pill dept-pill-sales">📈 Sales</span>
            <span className="ceo-brief-dept-pill dept-pill-dev">💻 Dev</span>
            <span className="ceo-brief-dept-pill dept-pill-csuite">👔 C-Suite</span>
          </div>
          <div className="ceo-brief-time">
            {agencyStatus?.systemHealth?.lastBriefing
              ? `Last briefing: ${new Date(agencyStatus.systemHealth.lastBriefing as string).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`
              : `${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} — ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`}
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">

          {/* Financials */}
          <div className="dash-card card-financials">
            <div className="dash-card-title">
              <span className="card-icon">£</span> Financials
            </div>
            <div className="finance-grid">
              <div className="finance-item">
                <div className="finance-label">Revenue</div>
                <div className="finance-value color-green">
                  £{((agencyStatus?.finances?.revenue) || 0).toLocaleString()}
                </div>
              </div>
              <div className="finance-item">
                <div className="finance-label">Expenses</div>
                <div className="finance-value color-rose">
                  £{((agencyStatus?.finances?.expenses) || 0).toLocaleString()}
                </div>
              </div>
              <div className="finance-item">
                <div className="finance-label">Profit</div>
                <div className={`finance-value ${(agencyStatus?.finances?.profit || 0) >= 0 ? 'color-green' : 'color-rose'}`}>
                  £{((agencyStatus?.finances?.profit) || 0).toLocaleString()}
                </div>
              </div>
              <div className="finance-item">
                <div className="finance-label">Cash Position</div>
                <div className="finance-value color-violet">
                  £{((agencyStatus?.finances?.cashPosition) || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Sales Pipeline — visual bar chart */}
          <div className="dash-card card-pipeline">
            <div className="dash-card-title">
              <span className="card-icon">💼</span> Sales Pipeline
            </div>
            {(() => {
              const p = agencyStatus?.pipeline
              const hot = p?.hot || 0
              const warm = p?.warm || 0
              const cold = p?.cold || 0
              const won = p?.won || 0
              const max = Math.max(hot, warm, cold, won, 1)
              return (
                <div className="pipeline-list">
                  <div className="pipeline-row">
                    <div className="pipeline-label">Hot</div>
                    <div className="pipeline-bar-track">
                      <div className="pipeline-bar-fill rose" style={{ width: `${(hot / max) * 100}%` }} />
                    </div>
                    <div className="pipeline-count color-rose">{hot}</div>
                  </div>
                  <div className="pipeline-row">
                    <div className="pipeline-label">Warm</div>
                    <div className="pipeline-bar-track">
                      <div className="pipeline-bar-fill amber" style={{ width: `${(warm / max) * 100}%` }} />
                    </div>
                    <div className="pipeline-count color-amber">{warm}</div>
                  </div>
                  <div className="pipeline-row">
                    <div className="pipeline-label">Cold</div>
                    <div className="pipeline-bar-track">
                      <div className="pipeline-bar-fill violet" style={{ width: `${(cold / max) * 100}%` }} />
                    </div>
                    <div className="pipeline-count color-violet">{cold}</div>
                  </div>
                  <div className="pipeline-row">
                    <div className="pipeline-label">Won</div>
                    <div className="pipeline-bar-track">
                      <div className="pipeline-bar-fill green" style={{ width: `${(won / max) * 100}%` }} />
                    </div>
                    <div className="pipeline-count color-green">{won}</div>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Active Sprint */}
          <div className="dash-card card-sprint">
            <div className="dash-card-title">
              <span className="card-icon">🚀</span> Active Sprint
              <span className="card-badge">
                {agencyStatus?.activeSprints?.[0]
                  ? (agencyStatus.activeSprints[0].name || agencyStatus.activeSprints[0].sprintName || 'Sprint 1')
                  : 'Sprint 1'}
              </span>
            </div>
            {agencyStatus?.activeSprints?.[0] ? (() => {
              const s = agencyStatus.activeSprints![0]
              const done = s.done ?? s.tasksDone ?? 0
              const inProg = s.inProgress ?? s.tasksInProgress ?? 0
              const todo = s.todo ?? Math.max(0, (s.totalTasks ?? 0) - done - inProg)
              const total = s.totalTasks ?? (done + inProg + todo)
              const pct = total > 0 ? Math.round((done / total) * 100) : (s.progress || 0)
              const sprintLabel = s.name || s.sprintName || 'Sprint'
              return (
                <>
                  <div className="sprint-pct">{sprintLabel} · {pct}% complete</div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="sprint-stats">
                    <div className="sprint-stat">
                      <div className="sprint-stat-value color-green">{done}</div>
                      <div className="sprint-stat-label">Done</div>
                    </div>
                    <div className="sprint-stat">
                      <div className="sprint-stat-value color-blue">{inProg}</div>
                      <div className="sprint-stat-label">Active</div>
                    </div>
                    <div className="sprint-stat">
                      <div className="sprint-stat-value color-amber">{todo}</div>
                      <div className="sprint-stat-label">Todo</div>
                    </div>
                  </div>
                </>
              )
            })() : (
              <>
                <div className="sprint-pct">Website build · 40% complete</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '40%' }} />
                </div>
                <div className="sprint-stats">
                  <div className="sprint-stat">
                    <div className="sprint-stat-value color-green">4</div>
                    <div className="sprint-stat-label">Done</div>
                  </div>
                  <div className="sprint-stat">
                    <div className="sprint-stat-value color-blue">2</div>
                    <div className="sprint-stat-label">Active</div>
                  </div>
                  <div className="sprint-stat">
                    <div className="sprint-stat-value color-amber">6</div>
                    <div className="sprint-stat-label">Todo</div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Live Task Queue — spans 2 columns */}
          <div className="dash-card card-tasks dash-card-wide">
            <div className="dash-card-title">
              <span className="card-icon">⚡</span> Live Task Queue
              <span className="card-badge">{taskCounts.total}</span>
            </div>
            <div className="task-status-row">
              <div className="task-status-cell" style={{ background: 'rgba(245,158,11,0.10)' }}>
                <div className="task-status-val color-amber">{taskCounts.pending}</div>
                <div className="task-status-lbl">Pending</div>
              </div>
              <div className="task-status-cell" style={{ background: 'rgba(59,130,246,0.10)' }}>
                <div className="task-status-val color-blue">{taskCounts.in_progress}</div>
                <div className="task-status-lbl">In Progress</div>
              </div>
              <div className="task-status-cell" style={{ background: 'rgba(16,185,129,0.10)' }}>
                <div className="task-status-val color-green">{taskCounts.completed}</div>
                <div className="task-status-lbl">Completed</div>
              </div>
              <div className="task-status-cell" style={{ background: 'rgba(244,63,94,0.10)' }}>
                <div className="task-status-val color-rose">{taskCounts.failed}</div>
                <div className="task-status-lbl">Failed</div>
              </div>
            </div>
            {/* Task detail feed */}
            {agentReports.length === 0 ? (
              <div className="task-feed-empty">No tasks yet — agents standing by.</div>
            ) : (
              <div className="task-feed">
                {(() => {
                  const inProg = agentReports.filter(r => r.status === 'in_progress')
                  const pending = agentReports.filter(r => r.status === 'pending')
                  const completed = agentReports.filter(r => r.status === 'completed').slice(-8).reverse()
                  const failed = agentReports.filter(r => r.status === 'failed').slice(-4).reverse()
                  const all = [...inProg, ...pending, ...completed, ...failed]
                  return all.map((t, i) => {
                    const info = AGENT_INFO[t.agentId?.toLowerCase()] || { name: t.agentId || 'Agent', initials: 'A', dept: 'csuite' as const }
                    const shortDesc = (t.description || '').split('.')[0].substring(0, 90)
                    const statusColor = t.status === 'in_progress' ? 'var(--blue)' : t.status === 'pending' ? 'var(--amber)' : t.status === 'completed' ? 'var(--green)' : 'var(--rose)'
                    const statusLabel = t.status === 'in_progress' ? 'RUNNING' : t.status.toUpperCase()
                    const timeStr = t.createdAt ? new Date(t.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''
                    return (
                      <div key={t.id || i} className="task-feed-row">
                        <div className="task-feed-status" style={{ color: statusColor }}>{statusLabel}</div>
                        <div className="task-feed-body">
                          <div className="task-feed-desc">{shortDesc}</div>
                          <div className="task-feed-meta">
                            <span className={`task-feed-agent dept-${info.dept}`}>{info.name}</span>
                            {timeStr && <span className="task-feed-time">{timeStr}</span>}
                          </div>
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>
            )}
          </div>

          {/* Workflows */}
          <div className="dash-card card-workflows">
            <div className="dash-card-title">
              <span className="card-icon">🔧</span> Workflows
              <span className="card-badge">0</span>
            </div>
            <div className="dash-card-empty">No active workflows</div>
          </div>

          {/* Clients */}
          <div className="dash-card card-clients">
            <div className="dash-card-title">
              <span className="card-icon">👤</span> Clients
            </div>
            <div className="client-list">
              {agencyStatus?.clients && agencyStatus.clients.length > 0 ? agencyStatus.clients.map((c, i) => (
                <div key={i} className="client-card">
                  <div className="client-avatar">{c.name.charAt(0)}</div>
                  <div>
                    <div className="client-name">{c.name}</div>
                    <div className="client-meta">{c.id} · {c.status}</div>
                  </div>
                  <span className={`badge badge-${c.status === 'active' ? 'green' : 'amber'}`} style={{ marginLeft: 'auto' }}>{c.status}</span>
                </div>
              )) : (
                <div className="client-card">
                  <div className="client-avatar">C</div>
                  <div>
                    <div className="client-name">Clearline Markets</div>
                    <div className="client-meta">Prop trading · Active</div>
                  </div>
                  <span className="badge badge-green" style={{ marginLeft: 'auto' }}>Active</span>
                </div>
              )}
            </div>
          </div>

          {/* Schedules */}
          <div className="dash-card card-schedules">
            <div className="dash-card-title">
              <span className="card-icon">🕐</span> Scheduled Tasks
              <span className="card-badge">{schedules.length > 0 ? schedules.length : ''}</span>
            </div>
            {runToast && (
              <div className="schedule-run-toast">{runToast}</div>
            )}
            <div className="schedule-list">
              {schedules.length > 0 ? schedules.slice(0, 6).map((s, i) => {
                const isRunning = s.enabled !== false && (s.status === 'running' || s.status === 'active' || s.enabled)
                const isTriggering = runningSchedule === s.name
                return (
                  <div key={i} className="schedule-item">
                    <div className="schedule-info">
                      <div className="schedule-name">{s.name}</div>
                      <div className="schedule-time">{s.description || s.interval || ''}</div>
                    </div>
                    <span className={`badge badge-${isRunning ? 'green' : 'amber'}`}>
                      {isRunning ? 'Running' : 'Paused'}
                    </span>
                    <button
                      className={`schedule-run-btn${isTriggering ? ' triggering' : ''}`}
                      onClick={() => runScheduleNow(s.name)}
                      disabled={!!runningSchedule}
                      title={`Run ${s.name} now`}
                    >
                      {isTriggering ? '…' : '▶'}
                    </button>
                  </div>
                )
              }) : (
                <>
                  <div className="schedule-item">
                    <div className="schedule-info">
                      <div className="schedule-name">UI Builder heartbeat</div>
                      <div className="schedule-time">Every 10 minutes</div>
                    </div>
                    <span className="badge badge-green">Running</span>
                    <button
                      className="schedule-run-btn"
                      onClick={() => runScheduleNow('UI Builder heartbeat')}
                      disabled={!!runningSchedule}
                      title="Run now"
                    >▶</button>
                  </div>
                  <div className="schedule-item">
                    <div className="schedule-info">
                      <div className="schedule-name">Daily brief</div>
                      <div className="schedule-time">08:00 daily</div>
                    </div>
                    <span className="badge badge-blue">Scheduled</span>
                    <button
                      className="schedule-run-btn"
                      onClick={() => runScheduleNow('Daily brief')}
                      disabled={!!runningSchedule}
                      title="Run now"
                    >▶</button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Activity Log */}
          <div className="dash-card card-activity">
            <div className="dash-card-title">
              <span className="card-icon">📄</span> Activity Log
              <span className="card-badge">{agencyStatus?.recentLogs ? agencyStatus.recentLogs.length : 3}</span>
            </div>
            <div className="activity-ticker">
              {agencyStatus?.recentLogs && agencyStatus.recentLogs.length > 0 ? (
                agencyStatus.recentLogs.slice(0, 8).map((log, i) => {
                  const agentId = log.agent?.toLowerCase() || ''
                  const deptCls = AGENT_INFO[agentId]?.dept
                    ? `log-agent--${AGENT_INFO[agentId].dept}`
                    : 'log-agent--default'
                  const timeStr = log.timestamp
                    ? new Date(log.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                    : '--:--'
                  const action = log.type === 'TASK_COMPLETED' ? 'completed task'
                    : log.type === 'TASK_FAILED' ? 'task failed'
                    : log.type === 'TASK_STARTED' ? 'started task'
                    : log.type?.toLowerCase().replace(/_/g, ' ') || 'logged activity'
                  return (
                    <div key={i} className="log-entry">
                      <div className="log-time">{timeStr}</div>
                      <div className="log-text">
                        <span className={`log-agent ${deptCls}`}>{AGENT_INFO[agentId]?.name || log.agent}</span>{' '}
                        <span className="log-action">{action}</span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <>
                  <div className="log-entry">
                    <div className="log-time">10:57</div>
                    <div className="log-text"><span className="log-agent log-agent--dev">Kai</span> <span className="log-action">shipped website update</span></div>
                  </div>
                  <div className="log-entry">
                    <div className="log-time">10:47</div>
                    <div className="log-text"><span className="log-agent log-agent--csuite">Priya</span> <span className="log-action">posted to Twitter</span></div>
                  </div>
                  <div className="log-entry">
                    <div className="log-time">10:37</div>
                    <div className="log-text"><span className="log-agent log-agent--default">Nikita</span> <span className="log-action">issued morning brief</span></div>
                  </div>
                </>
              )}
            </div>
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
        <button className="nikita-chat-close" onClick={() => { setChatOpen(false); setUnreadCount(0) }} title="Close chat">✕</button>
        <div className="nikita-chat-header">
          <div className="nikita-avatar">N</div>
          <div>
            <div className="nikita-panel-name">Nikita</div>
            <div className="nikita-panel-role">CEO · Open Agency</div>
          </div>
        </div>
        <div className="nikita-messages">
          {messages.map(msg => {
            if (msg.role === 'agent') {
              return (
                <div key={msg.id} className={`chat-msg agent-bubble dept-${msg.agentDept}`}>
                  <div className="agent-bubble-header">
                    <span className={`agent-bubble-avatar dept-${msg.agentDept}`}>{msg.agentInitials}</span>
                    <span className="agent-bubble-name">{msg.agentName}</span>
                    <span className={`agent-bubble-status ${msg.taskStatus}`}>{msg.taskStatus}</span>
                  </div>
                  <div className="chat-msg-text">{msg.text}</div>
                  {msg.time && <div className="chat-msg-time">{msg.time}</div>}
                </div>
              )
            }
            return (
              <div
                key={msg.id}
                className={`chat-msg ${msg.role === 'user' ? 'user' : msg.role === 'typing' ? 'typing' : 'nikita'}`}
              >
                {msg.role === 'typing' ? (
                  <div className="chat-msg-text typing-text">{msg.text}</div>
                ) : msg.role === 'assistant' ? (
                  <div className="chat-nikita-row">
                    <div className="chat-nk-avatar">NK</div>
                    <div className="chat-nikita-body">
                      <div className="chat-msg-text">{msg.text}</div>
                      {msg.time && <div className="chat-msg-time">{msg.time}</div>}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="chat-msg-text">{msg.text}</div>
                    {msg.time && <div className="chat-msg-time">{msg.time}</div>}
                  </>
                )}
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Agent Reports Panel */}
        <div className="agent-reports-panel">
          <div
            className="agent-reports-header"
            onClick={() => setReportsExpanded(e => !e)}
          >
            <span>Agent Reports</span>
            <span className="agent-reports-badge">{agentReports.length}</span>
            <span style={{ marginLeft: 'auto', fontSize: 10 }}>{reportsExpanded ? '▲' : '▼'}</span>
          </div>
          {reportsExpanded && (
            <div className="agent-reports-list">
              {agentReports.length === 0 ? (
                <div className="agent-reports-empty">No reports yet — agents standing by.</div>
              ) : (
                agentReports.map(r => (
                  <div key={r.id} className="agent-report-item">
                    <div className="report-agent">{r.agentId}</div>
                    <div className="report-desc">{r.description}</div>
                    <div className="report-meta">
                      <span className={`report-status ${r.status}`}>{r.status}</span>
                      {r.createdAt && (
                        <span>{new Date(r.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <div className="nikita-chat-bar">
          <div className="nikita-chat-bar-inner">
            <textarea
              className="nikita-chat-input"
              placeholder="Message Nikita..."
              rows={1}
              value={input}
              onChange={e => {
                setInput(e.target.value)
                // Auto-resize textarea
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
              }}
              onKeyDown={handleKeyDown}
            />
            <button className="nikita-chat-send" onClick={sendMessage} disabled={sending}>
              ↑
            </button>
          </div>
        </div>
      </div>
      <button
        className={`nikita-chat-toggle${chatOpen ? ' hidden' : ''}`}
        onClick={() => { setChatOpen(true); setUnreadCount(0) }}
        title="Chat with Nikita"
      >
        💬
        {unreadCount > 0 && (
          <span className="chat-unread-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>
    </>
  )
}
