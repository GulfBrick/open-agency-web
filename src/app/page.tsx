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
  role: 'user' | 'assistant' | 'typing' | 'agent' | 'dispatch'
  text: string
  time?: string
  agentId?: string
  agentName?: string
  agentInitials?: string
  agentDept?: 'ceo' | 'csuite' | 'dev' | 'sales' | 'creative'
  taskStatus?: 'completed' | 'failed' | 'pending' | 'in_progress'
  dispatchedAgents?: string[]
  streaming?: boolean  // true while typewriter is still running
}

interface AgentReport {
  id: string
  agentId: string
  description: string
  status: 'completed' | 'failed' | 'pending' | 'in_progress'
  createdAt?: string
}

interface WorkflowStep {
  status: string
}

interface WorkflowItem {
  workflowId: string
  name: string
  status: 'PENDING' | 'RUNNING' | 'WAITING_APPROVAL' | 'DONE' | 'FAILED'
  clientId?: string
  steps?: WorkflowStep[]
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

// Shared markdown renderer: **bold**, *italic*, bullet lists, headers, newlines → HTML
function renderMarkdown(text: string, opts: { bullets?: string } = {}): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  // Headers: ## Heading
  const headered = escaped.replace(/^#{1,3}\s+(.+)$/gm, '<strong class="md-heading">$1</strong>')
  // Bold
  const bolded = headered.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  // Italic
  const italiced = bolded.replace(/\*([^*]+?)\*/g, '<em>$1</em>')
  // Inline code
  const coded = italiced.replace(/`([^`]+?)`/g, '<code class="md-code">$1</code>')
  // Bullet points
  const bulletCls = opts.bullets || 'brief-bullet'
  const bulleted = coded.replace(/^[•\-\*]\s+(.+)$/gm, `<span class="${bulletCls}">$1</span>`)
  // Paragraph breaks
  const paragraphed = bulleted.replace(/\n{2,}/g, '</p><p class="brief-para">').replace(/\n/g, '<br />')
  return `<p class="brief-para">${paragraphed}</p>`
}

// Minimal markdown renderer: **bold**, newlines → <br>, blank lines → paragraphs
function renderBriefingMarkdown(text: string): string {
  return renderMarkdown(text, { bullets: 'brief-bullet' })
}

// Chat message markdown — same engine, chat-specific bullet class
function renderChatMarkdown(text: string): string {
  return renderMarkdown(text, { bullets: 'chat-bullet' })
}


const INITIAL_MESSAGES: ChatMessage[] = [
  { id: 1, role: 'assistant', text: "Hey Harry. Nikita here. Agency is running — what do you need?", time: chatTimeStr() },
]

const QUICK_PROMPTS = [
  { label: '📊 Status update', text: 'Give me a full agency status update.' },
  { label: '💰 Financials', text: 'What are the current financials?' },
  { label: '🚀 What are devs building?', text: 'What is the dev team working on right now?' },
  { label: '📋 Brief the team', text: 'Send a morning brief to all departments.' },
  { label: '🔥 Sales pipeline', text: 'What\'s in the sales pipeline?' },
  { label: '👤 New client', text: 'I want to onboard a new client — walk me through it.' },
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

function AgentDesk({ agent, activeTask }: { agent: typeof AGENTS.csuite[0]; activeTask?: string }) {
  const [hovered, setHovered] = useState(false)
  const [bubbleIdx, setBubbleIdx] = useState(0)
  const isOnline = agent.status === 'online'
  const isCeo = agent.id === 'nikita'
  const isActive = !!activeTask
  const stats = AGENT_STATS[agent.id] || { done: 0, active: 0, rank: agent.role }
  const bubbles = AGENT_BUBBLES[agent.id] || [agent.bubble]
  // When actively running a task, show truncated task text in bubble
  const displayBubble = isActive
    ? activeTask!.replace(/\[.*?\]\s*/g, '').split('.')[0].substring(0, 50)
    : bubbles[bubbleIdx]

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
      className={`agent-desk${isOnline ? ' is-online' : ''}${isCeo ? ' ceo-desk' : ''}${isActive ? ' is-active' : ''}`}
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

      <div className={`bubble${isActive ? ' bubble-active' : ''}`} key={isActive ? 'active' : bubbleIdx}>{displayBubble}</div>
      <div className="desk-surface">
        <div className="desk-monitor">💻</div>
        <div className={`desk-avatar ${agent.cls} ${agent.status}${isActive ? ' desk-avatar-busy' : ''}`}>
          {agent.initials}
          <span className={`status-indicator ${agent.status}`} />
          {isActive && <span className="busy-ring" />}
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

interface CommitItem {
  sha: string
  message: string
  date: string
  author: string
}

interface TaskCounts {
  pending: number
  in_progress: number
  completed: number
  failed: number
  total: number
}

// ─── Demo-mode fallback data (shown when API is unreachable) ───
// Keeps the site looking alive and impressive for visitors.
// A subtle "Demo" badge appears in the status bar so it's honest.
const DEMO_AGENCY_STATUS: AgencyStatus = {
  agents: [
    { id: 'nikita',  name: 'Nikita',  status: 'online', floor: 'CEO',      tasksCompleted: 247, successRate: 98 },
    { id: 'marcus',  name: 'Marcus',  status: 'online', floor: 'C-Suite',  tasksCompleted: 89,  successRate: 96 },
    { id: 'zara',    name: 'Zara',    status: 'online', floor: 'C-Suite',  tasksCompleted: 134, successRate: 99 },
    { id: 'priya',   name: 'Priya',   status: 'online', floor: 'C-Suite',  tasksCompleted: 112, successRate: 97 },
    { id: 'kai',     name: 'Kai',     status: 'online', floor: 'Dev',      tasksCompleted: 198, successRate: 94 },
    { id: 'sage',    name: 'Sage',    status: 'online', floor: 'Dev',      tasksCompleted: 76,  successRate: 100 },
    { id: 'luna',    name: 'Luna',    status: 'online', floor: 'Dev',      tasksCompleted: 143, successRate: 95 },
    { id: 'rex',     name: 'Rex',     status: 'online', floor: 'Dev',      tasksCompleted: 97,  successRate: 93 },
    { id: 'atlas',   name: 'Atlas',   status: 'online', floor: 'Dev',      tasksCompleted: 88,  successRate: 91 },
    { id: 'jordan',  name: 'Jordan',  status: 'online', floor: 'Sales',    tasksCompleted: 72,  successRate: 88 },
    { id: 'river',   name: 'River',   status: 'online', floor: 'Sales',    tasksCompleted: 54,  successRate: 90 },
    { id: 'quinn',   name: 'Quinn',   status: 'online', floor: 'Sales',    tasksCompleted: 61,  successRate: 92 },
    { id: 'nova',    name: 'Nova',    status: 'online', floor: 'Creative', tasksCompleted: 93,  successRate: 96 },
    { id: 'iris',    name: 'Iris',    status: 'online', floor: 'Creative', tasksCompleted: 81,  successRate: 98 },
    { id: 'jade',    name: 'Jade',    status: 'online', floor: 'Creative', tasksCompleted: 64,  successRate: 94 },
  ],
  clients: [
    { id: 'clearline', name: 'Clearline Markets', status: 'active' },
  ],
  finances: { revenue: 14200, expenses: 3800, profit: 10400, cashPosition: 28600 },
  pipeline: { hot: 3, warm: 7, cold: 12, won: 2, total: 24 },
  activeSprints: [{
    name: 'Website Build', sprintName: 'Website Build', status: 'RUNNING',
    progress: 62, done: 8, inProgress: 3, todo: 2, totalTasks: 13, tasksDone: 8, tasksInProgress: 3, blockers: 0,
  }],
  recentLogs: [
    { timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(), agent: 'kai',   type: 'TASK_COMPLETED' },
    { timestamp: new Date(Date.now() - 9 * 60 * 1000).toISOString(), agent: 'priya', type: 'TASK_COMPLETED' },
    { timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(), agent: 'nikita', type: 'TASK_STARTED' },
    { timestamp: new Date(Date.now() - 21 * 60 * 1000).toISOString(), agent: 'luna',  type: 'TASK_COMPLETED' },
    { timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(), agent: 'marcus', type: 'TASK_COMPLETED' },
  ],
  lastBriefing: '**Agency status:** All systems operational. Clearline Markets onboarded and active. Dev team shipping every 10 minutes. Sales pipeline strong at 24 leads. Finance healthy — £10.4k profit this month. All departments online.',
  systemHealth: { uptimeFormatted: '99.9%', bootCount: 14, schedulerActive: true, registeredAgents: 21 },
}

const DEMO_TASK_COUNTS: TaskCounts = {
  pending: 4, in_progress: 3, completed: 312, failed: 7, total: 326,
}

const DEMO_SCHEDULES: ScheduleItem[] = [
  { name: 'UI Builder heartbeat', description: 'Every 10 minutes', enabled: true },
  { name: 'Daily brief', description: '08:00 daily', enabled: true },
  { name: 'Sales outreach', description: 'Every 2 hours', enabled: true },
  { name: 'Finance reconcile', description: 'Daily at midnight', enabled: true },
]

const DEMO_AGENT_REPORTS: AgentReport[] = [
  { id: 'd1', agentId: 'kai',    description: 'Shipped website update — animations improved, mobile responsiveness patched.', status: 'completed', createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
  { id: 'd2', agentId: 'priya',  description: 'LinkedIn post drafted and scheduled — 3 posts queued for the week.', status: 'completed', createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString() },
  { id: 'd3', agentId: 'jordan', description: 'Hot lead followed up — Nexus Capital interested in full-stack AI ops package.', status: 'in_progress', createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
  { id: 'd4', agentId: 'marcus', description: 'Monthly P&L reconciled — profit up 18% vs last month.', status: 'completed', createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString() },
  { id: 'd5', agentId: 'luna',   description: 'Dashboard mobile layout fixed — all breakpoints passing.', status: 'completed', createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString() },
]

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

function LastRefreshed({ ts }: { ts: number | null }) {
  const [label, setLabel] = useState<string>('—')
  useEffect(() => {
    if (!ts) return
    const update = () => {
      const s = Math.floor((Date.now() - ts) / 1000)
      if (s < 5) setLabel('just now')
      else if (s < 60) setLabel(`${s}s ago`)
      else setLabel(`${Math.floor(s / 60)}m ago`)
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [ts])
  if (!ts) return null
  return <span className="last-refreshed">↻ {label}</span>
}

const VALUE_PROPS = [
  { text: 'Sales team. Fully autonomous.', dept: 'sales' },
  { text: 'Dev team. Ships around the clock.', dept: 'dev' },
  { text: 'Creative. Always on brief.', dept: 'creative' },
  { text: 'Finance & ops. Zero overhead.', dept: 'csuite' },
  { text: 'Every client. Smarter every day.', dept: 'ceo' },
]

// Static ticker events — combined with live log data when available
const STATIC_TICKER_EVENTS = [
  { agent: 'Kai',    dept: 'dev',      text: 'shipped PR #47 — website animations polished' },
  { agent: 'Priya',  dept: 'csuite',   text: 'posted Monday thread to LinkedIn — 3 posts queued' },
  { agent: 'Jordan', dept: 'sales',    text: 'followed up with Nexus Capital — hot lead confirmed' },
  { agent: 'Marcus', dept: 'csuite',   text: 'reconciled monthly P&L — profit up 18%' },
  { agent: 'Luna',   dept: 'dev',      text: 'fixed mobile layout — all breakpoints passing' },
  { agent: 'Jade',   dept: 'creative', text: 'scheduled 5 Instagram stories for the week' },
  { agent: 'Rex',    dept: 'dev',      text: 'deployed API endpoint — response time 48ms' },
  { agent: 'Quinn',  dept: 'sales',    text: 'qualified 2 inbound leads — both moved to warm' },
  { agent: 'Atlas',  dept: 'dev',      text: 'reviewed PR #51 — 3 comments, approved' },
  { agent: 'Ash',    dept: 'creative', text: 'delivered 4 blog posts — SEO scores all above 90' },
  { agent: 'Nikita', dept: 'ceo',      text: 'issued morning brief — all departments confirmed' },
  { agent: 'Zara',   dept: 'csuite',   text: 'scaled infra — uptime holding at 99.9%' },
  { agent: 'Nova',   dept: 'creative', text: 'delivered brand refresh assets — client approved' },
  { agent: 'River',  dept: 'sales',    text: 'sent contract to warm lead — awaiting signature' },
  { agent: 'Finn',   dept: 'creative', text: 'exported 3 promo videos — ready to publish' },
]

// Activity ticker strip — horizontally scrolling live event tape
function ActivityTicker({ recentLogs }: { recentLogs?: AgencyStatus['recentLogs'] }) {
  // Blend live logs into ticker events
  const events = (() => {
    const live = (recentLogs || []).map(log => {
      const agentId = log.agent?.toLowerCase() || ''
      const name = AGENT_INFO[agentId]?.name || log.agent || 'Agent'
      const dept = AGENT_INFO[agentId]?.dept || 'csuite'
      const action = log.type === 'TASK_COMPLETED' ? 'completed task'
        : log.type === 'TASK_FAILED' ? 'task failed'
        : log.type === 'TASK_STARTED' ? 'started task'
        : (log.type || 'logged activity').toLowerCase().replace(/_/g, ' ')
      return { agent: name, dept, text: action }
    })
    const merged = [...live, ...STATIC_TICKER_EVENTS]
    // Duplicate so the scroll loops seamlessly
    return [...merged, ...merged]
  })()

  return (
    <div className="activity-ticker-strip">
      <div className="activity-ticker-label">⚡ LIVE</div>
      <div className="activity-ticker-track">
        <div className="activity-ticker-inner">
          {events.map((ev, i) => (
            <span key={i} className="activity-ticker-event">
              <span className={`ticker-agent-chip ticker-dept-${ev.dept}`}>{ev.agent}</span>
              <span className="ticker-event-text">{ev.text}</span>
              <span className="ticker-dot">·</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Agent Activity Toast System ───
interface AgentToastItem {
  id: number
  agentId: string
  agentName: string
  agentInitials: string
  dept: 'ceo' | 'csuite' | 'dev' | 'sales' | 'creative'
  text: string
  exiting?: boolean
}

// Static demo toast events to cycle through when API is offline
const DEMO_TOAST_EVENTS: Array<{ agentId: string; text: string }> = [
  { agentId: 'kai',    text: 'Shipped PR #47 — animations improved' },
  { agentId: 'priya',  text: 'LinkedIn post scheduled — 3 queued' },
  { agentId: 'jordan', text: 'Hot lead followed up — Nexus Capital' },
  { agentId: 'luna',   text: 'Mobile layout fixed — all breakpoints' },
  { agentId: 'marcus', text: 'P&L reconciled — profit up 18%' },
  { agentId: 'atlas',  text: 'PR #51 reviewed — approved ✓' },
  { agentId: 'jade',   text: 'Instagram stories scheduled for week' },
  { agentId: 'rex',    text: 'API endpoint deployed — 48ms response' },
  { agentId: 'ash',    text: '4 blog posts delivered — SEO 90+' },
  { agentId: 'zara',   text: 'Infra scaled — uptime 99.9%' },
  { agentId: 'quinn',  text: '2 leads qualified — both warm now' },
  { agentId: 'nova',   text: 'Brand refresh assets approved ✓' },
]

function AgentToastStack({ toasts, onDismiss }: { toasts: AgentToastItem[]; onDismiss: (id: number) => void }) {
  return (
    <div className="agent-toast-stack">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`agent-toast${toast.exiting ? ' exiting' : ''}`}
          style={{ position: 'relative', overflow: 'hidden' }}
          onClick={() => onDismiss(toast.id)}
          title="Click to dismiss"
        >
          <div className={`agent-toast-avatar dept-${toast.dept}`}>{toast.agentInitials}</div>
          <div className="agent-toast-body">
            <div className="agent-toast-header">
              <span className="agent-toast-name">{toast.agentName}</span>
              <span className={`agent-toast-tag dept-${toast.dept}`}>{toast.dept}</span>
            </div>
            <div className="agent-toast-text">{toast.text}</div>
          </div>
          <div className="agent-toast-checkmark">✓</div>
          <div className={`agent-toast-progress dept-${toast.dept}`} />
        </div>
      ))}
    </div>
  )
}

// ─── First-Visit Onboarding Panel ───
function OnboardingPanel() {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    try {
      const seen = localStorage.getItem('oa_onboarded')
      if (!seen) {
        const t = setTimeout(() => setVisible(true), 2200)
        return () => clearTimeout(t)
      }
    } catch { /* SSR */ }
  }, [])

  function dismiss() {
    setDismissed(true)
    setTimeout(() => setVisible(false), 320)
    try { localStorage.setItem('oa_onboarded', '1') } catch { /* ok */ }
  }

  if (!visible) return null

  return (
    <div className={`onboarding-panel${dismissed ? ' dismissing' : ' entering'}`}>
      <button className="onboarding-close" onClick={dismiss} title="Got it">✕</button>
      <div className="onboarding-badge">What is this?</div>
      <div className="onboarding-heading">Open Agency</div>
      <p className="onboarding-body">
        A fully autonomous AI agency — running in real time. Every desk you see is a live AI agent: sales, dev, creative, finance, and a CEO who runs it all.
      </p>
      <div className="onboarding-features">
        <div className="onboarding-feature">
          <span className="onboarding-feature-icon">💬</span>
          <span>Chat with Nikita, the CEO</span>
        </div>
        <div className="onboarding-feature">
          <span className="onboarding-feature-icon">📊</span>
          <span>Watch live stats update in real time</span>
        </div>
        <div className="onboarding-feature">
          <span className="onboarding-feature-icon">🚀</span>
          <span>Agents ship code every 10 minutes</span>
        </div>
      </div>
      <button className="onboarding-cta" onClick={dismiss}>
        Got it — show me the agency →
      </button>
    </div>
  )
}

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

interface NewClientForm {
  name: string
  industry: string
  contactName: string
  contactEmail: string
  notes: string
}

// ─── Typewriter streaming hook ───
function useTypewriter(text: string, speed = 18) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const prevText = useRef('')

  useEffect(() => {
    if (text === prevText.current) return
    prevText.current = text
    setDisplayed('')
    setDone(false)

    let i = 0
    const chars = Array.from(text) // handles emoji + unicode correctly
    const interval = setInterval(() => {
      i++
      setDisplayed(chars.slice(0, i).join(''))
      if (i >= chars.length) {
        clearInterval(interval)
        setDone(true)
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed])

  return { displayed, done }
}

// Streaming chat message — types out text char by char, then renders as markdown
function StreamingMessage({ text, time, onDone }: { text: string; time?: string; onDone?: () => void }) {
  const { displayed, done } = useTypewriter(text, 16)
  const calledDone = useRef(false)

  useEffect(() => {
    if (done && onDone && !calledDone.current) {
      calledDone.current = true
      onDone()
    }
  }, [done, onDone])

  return (
    <div className="chat-nikita-row">
      <div className="chat-nk-avatar">NK</div>
      <div className="chat-nikita-body">
        {done ? (
          <div
            className="chat-msg-text chat-msg-rich"
            dangerouslySetInnerHTML={{ __html: renderChatMarkdown(text) }}
          />
        ) : (
          <div className="chat-msg-text">
            {displayed}
            <span className="chat-cursor">▌</span>
          </div>
        )}
        {done && time && <div className="chat-msg-time">{time}</div>}
      </div>
    </div>
  )
}

// ─── Work With Us Lead Capture Form ───
function WorkWithUsForm() {
  const [form, setForm] = useState({ name: '', industry: '', contactName: '', contactEmail: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.contactEmail.trim() || submitting) return
    setSubmitting(true)
    setResult(null)
    try {
      const res = await fetch('/api/clients/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.error) {
        setResult({ ok: false, msg: data.message || 'Something went wrong — please email us directly.' })
      } else {
        setResult({ ok: true, msg: `We've got you, ${form.contactName || form.name}. Nikita will be in touch shortly.` })
        setForm({ name: '', industry: '', contactName: '', contactEmail: '', notes: '' })
      }
    } catch {
      setResult({ ok: false, msg: 'Could not send — please try again or email us directly.' })
    }
    setSubmitting(false)
  }

  return (
    <form className="wwu-form" onSubmit={submit} noValidate>
      <div className="wwu-form-row">
        <div className="wwu-form-field">
          <label className="wwu-form-label">Business Name *</label>
          <input
            className="wwu-form-input"
            placeholder="e.g. Clearline Markets"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div className="wwu-form-field">
          <label className="wwu-form-label">Industry</label>
          <input
            className="wwu-form-input"
            placeholder="e.g. SaaS, eCommerce, Finance"
            value={form.industry}
            onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
          />
        </div>
      </div>
      <div className="wwu-form-row">
        <div className="wwu-form-field">
          <label className="wwu-form-label">Your Name</label>
          <input
            className="wwu-form-input"
            placeholder="Full name"
            value={form.contactName}
            onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))}
          />
        </div>
        <div className="wwu-form-field">
          <label className="wwu-form-label">Email *</label>
          <input
            className="wwu-form-input"
            type="email"
            placeholder="you@yourcompany.com"
            value={form.contactEmail}
            onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))}
            required
          />
        </div>
      </div>
      <div className="wwu-form-field">
        <label className="wwu-form-label">What do you need?</label>
        <textarea
          className="wwu-form-input wwu-form-textarea"
          placeholder="Tell us about your business and what you want to automate or grow..."
          rows={3}
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
        />
      </div>
      {result && (
        <div className={`wwu-form-result ${result.ok ? 'ok' : 'err'}`}>
          {result.ok ? '✓ ' : '⚠ '}{result.msg}
        </div>
      )}
      <button
        type="submit"
        className={`wwu-form-submit${submitting ? ' submitting' : ''}`}
        disabled={submitting || !form.name.trim() || !form.contactEmail.trim()}
      >
        {submitting ? 'Sending...' : 'Get in touch →'}
      </button>
    </form>
  )
}

// Build a map of agentId → active task description from live reports
function buildActiveTaskMap(reports: AgentReport[]): Record<string, string> {
  const map: Record<string, string> = {}
  for (const r of reports) {
    if ((r.status === 'in_progress' || r.status === 'pending') && r.agentId && r.description) {
      map[r.agentId.toLowerCase()] = r.description
    }
  }
  return map
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
  // New Client modal
  const [newClientOpen, setNewClientOpen] = useState(false)
  const [newClientForm, setNewClientForm] = useState<NewClientForm>({ name: '', industry: '', contactName: '', contactEmail: '', notes: '' })
  const [newClientSubmitting, setNewClientSubmitting] = useState(false)
  const [newClientToast, setNewClientToast] = useState<{ msg: string; ok: boolean } | null>(null)
  // Workflows
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([])
  const [approvingWorkflow, setApprovingWorkflow] = useState<string | null>(null)
  const [recentCommits, setRecentCommits] = useState<CommitItem[]>([])
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  // Derived: map of agentId → active task description (drives desk glow)
  const activeTaskMap = buildActiveTaskMap(agentReports)
  // Agent activity toasts
  const [agentToasts, setAgentToasts] = useState<AgentToastItem[]>([])
  const demoToastIdx = useRef(0)
  const toastIdCounter = useRef(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatHasSeeded = useRef(false)
  const unreadReportIds = useRef<Set<string>>(new Set())
  const chatOpenRef = useRef(chatOpen)
  useEffect(() => { chatOpenRef.current = chatOpen }, [chatOpen])

  // Helper: push an agent toast and auto-dismiss after 5s
  const pushAgentToast = useRef((agentId: string, text: string) => {
    const info = AGENT_INFO[agentId?.toLowerCase()] || {
      name: agentId || 'Agent',
      initials: (agentId || 'A').charAt(0).toUpperCase(),
      dept: 'csuite' as const,
    }
    const id = ++toastIdCounter.current
    setAgentToasts(prev => [...prev.slice(-2), { // cap at 3 visible
      id,
      agentId,
      agentName: info.name,
      agentInitials: info.initials,
      dept: info.dept,
      text,
    }])
    // Start exit animation after 4.6s, remove after 5s
    setTimeout(() => {
      setAgentToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
    }, 4600)
    setTimeout(() => {
      setAgentToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }).current

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1200)
    return () => clearTimeout(t)
  }, [])

  // Demo toast cycle — fires every 22s when API is offline to simulate live activity
  useEffect(() => {
    if (apiOnline === true) return // live API toasts come from report polling
    // Start with a short delay so the page loads first
    const initial = setTimeout(() => {
      const ev = DEMO_TOAST_EVENTS[demoToastIdx.current % DEMO_TOAST_EVENTS.length]
      demoToastIdx.current++
      pushAgentToast(ev.agentId, ev.text)
    }, 6000)
    const interval = setInterval(() => {
      const ev = DEMO_TOAST_EVENTS[demoToastIdx.current % DEMO_TOAST_EVENTS.length]
      demoToastIdx.current++
      pushAgentToast(ev.agentId, ev.text)
    }, 22000)
    return () => { clearTimeout(initial); clearInterval(interval) }
  }, [apiOnline, pushAgentToast])

  // Fetch live agency status every 10s — fall back to demo data when API is unreachable
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/status')
        if (res.ok) {
          const data = await res.json()
          if (!data.error) {
            setAgencyStatus(data)
            setApiOnline(true)
            setLastUpdated(Date.now())
          } else {
            setApiOnline(false)
            setAgencyStatus(prev => prev ?? DEMO_AGENCY_STATUS)
          }
        } else {
          setApiOnline(false)
          setAgencyStatus(prev => prev ?? DEMO_AGENCY_STATUS)
        }
      } catch {
        setApiOnline(false)
        setAgencyStatus(prev => prev ?? DEMO_AGENCY_STATUS)
        // Still update timestamp even on offline — shows when demo data was last "refreshed"
        setLastUpdated(Date.now())
      }
    }
    fetchStatus()
    const interval = setInterval(fetchStatus, 10000)
    return () => clearInterval(interval)
  }, [])

  // Fetch task queue counts every 20s — fall back to demo data when offline
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
        } else {
          // Use demo data if never had live data
          setAgentReports(prev => prev.length === 0 ? DEMO_AGENT_REPORTS : prev)
          setTaskCounts(prev => prev.total === 0 ? DEMO_TASK_COUNTS : prev)
        }
      } catch {
        setAgentReports(prev => prev.length === 0 ? DEMO_AGENT_REPORTS : prev)
        setTaskCounts(prev => prev.total === 0 ? DEMO_TASK_COUNTS : prev)
      }
    }
    fetchTasks()
    const interval = setInterval(fetchTasks, 20000)
    return () => clearInterval(interval)
  }, [])

  // Fetch live schedules from API every 60s — fall back to demo when offline
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await fetch('/api/schedules')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data)) setSchedules(data)
        } else {
          setSchedules(prev => prev.length === 0 ? DEMO_SCHEDULES : prev)
        }
      } catch {
        setSchedules(prev => prev.length === 0 ? DEMO_SCHEDULES : prev)
      }
    }
    fetchSchedules()
    const interval = setInterval(fetchSchedules, 60000)
    return () => clearInterval(interval)
  }, [])

  // Fetch live workflows every 30s
  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const res = await fetch('/api/workflows')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data)) setWorkflows(data)
        }
      } catch { /* backend offline */ }
    }
    fetchWorkflows()
    const interval = setInterval(fetchWorkflows, 30000)
    return () => clearInterval(interval)
  }, [])

  // Fetch recent GitHub commits every 5 minutes
  useEffect(() => {
    const fetchCommits = async () => {
      try {
        const res = await fetch('/api/commits')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data)) setRecentCommits(data)
        }
      } catch { /* offline */ }
    }
    fetchCommits()
    const interval = setInterval(fetchCommits, 5 * 60 * 1000)
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
            // Push live activity toasts for new completions
            newReports.slice(0, 2).forEach((r: AgentReport) => {
              const shortDesc = (r.description || '').split('.')[0].substring(0, 60)
              if (shortDesc) pushAgentToast(r.agentId, shortDesc)
            })
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
        const next: ChatMessage[] = [
          ...filtered,
          { id: Date.now() + 2, role: 'assistant', text: data.reply || "On it.", time: chatTimeStr(), streaming: true },
        ]
        // If Nikita dispatched agents, inject a dispatch card immediately below the reply
        if (data.dispatched && Array.isArray(data.agents) && data.agents.length > 0) {
          next.push({
            id: Date.now() + 3,
            role: 'dispatch',
            text: '',
            time: chatTimeStr(),
            dispatchedAgents: data.agents as string[],
          })
        }
        return next
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

  async function submitNewClient() {
    if (!newClientForm.name.trim() || newClientSubmitting) return
    setNewClientSubmitting(true)
    try {
      const res = await fetch('/api/clients/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClientForm),
      })
      const data = await res.json()
      if (data.error) {
        setNewClientToast({ msg: `⚠ ${data.message || 'Could not onboard — API offline.'}`, ok: false })
      } else {
        setNewClientToast({ msg: `✓ ${newClientForm.name} onboarded!`, ok: true })
        setNewClientForm({ name: '', industry: '', contactName: '', contactEmail: '', notes: '' })
        setNewClientOpen(false)
        // Refresh status to pick up new client
        try {
          const sr = await fetch('/api/status')
          if (sr.ok) { const sd = await sr.json(); if (!sd.error) setAgencyStatus(sd) }
        } catch { /* offline */ }
      }
    } catch {
      setNewClientToast({ msg: '⚠ Failed to submit — check your connection.', ok: false })
    }
    setNewClientSubmitting(false)
    setTimeout(() => setNewClientToast(null), 4000)
  }

  async function approveWorkflow(workflowId: string) {
    if (approvingWorkflow) return
    setApprovingWorkflow(workflowId)
    try {
      const res = await fetch('/api/workflows/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId }),
      })
      const data = await res.json()
      if (!data.error) {
        // Refresh workflows
        const wr = await fetch('/api/workflows')
        if (wr.ok) { const wd = await wr.json(); if (Array.isArray(wd)) setWorkflows(wd) }
      }
    } catch { /* offline */ }
    setApprovingWorkflow(null)
  }

  return (
    <>
      {/* Ambient overlays — pixel-perfect match to local dashboard */}
      <div className="top-gradient-bar" />
      <div className="scanline-overlay" />
      <div className="noise-overlay" />
      <div className="bg-grid" />

      {/* Loading Overlay */}
      <div className={`loading-overlay${loaded ? ' hidden' : ''}`}>
        <div className="load-logo">Open Agency</div>
        <div className="load-spinner" />
        <div className="load-text">Initialising systems...</div>
      </div>

      {/* First-Visit Onboarding */}
      <OnboardingPanel />

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
          <a className="hero-cta-secondary" href="#work-with-us">
            Work with us →
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
          <LastRefreshed ts={lastUpdated} />
          <div className={`status-badge${apiOnline === false ? ' demo' : apiOnline === null ? ' connecting' : ''}`}>
            <span className="status-dot" />
            {apiOnline === false ? 'Demo Mode' : apiOnline === true ? 'All Systems Operational' : 'Connecting...'}
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
                {AGENTS.ceo.map(a => <AgentDesk key={a.id} agent={a} activeTask={activeTaskMap[a.id]} />)}
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
                {AGENTS.creative.map(a => <AgentDesk key={a.id} agent={a} activeTask={activeTaskMap[a.id]} />)}
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
                {AGENTS.sales.map(a => <AgentDesk key={a.id} agent={a} activeTask={activeTaskMap[a.id]} />)}
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
                {AGENTS.dev.map(a => <AgentDesk key={a.id} agent={a} activeTask={activeTaskMap[a.id]} />)}
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
                {AGENTS.csuite.map(a => <AgentDesk key={a.id} agent={a} activeTask={activeTaskMap[a.id]} />)}
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

        {/* Live Activity Ticker Strip */}
        <ActivityTicker recentLogs={agencyStatus?.recentLogs} />

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

          {/* Workflows */}
          <div className="dash-card card-workflows">
            <div className="dash-card-title">
              <span className="card-icon">⚙</span> Workflows
              <span className="card-badge">{workflows.length > 0 ? workflows.length : ''}</span>
            </div>
            <div className="workflow-list">
              {workflows.length === 0 ? (
                <div className="workflow-empty">No active workflows</div>
              ) : (
                workflows.slice(0, 8).map((wf, i) => {
                  const stepsTotal = wf.steps?.length || 0
                  const stepsDone = wf.steps?.filter(s => s.status === 'DONE').length || 0
                  const shortId = wf.workflowId.substring(0, 8)
                  const needsApproval = wf.status === 'WAITING_APPROVAL'
                  const statusColor = wf.status === 'RUNNING' ? 'var(--blue)'
                    : wf.status === 'WAITING_APPROVAL' ? 'var(--amber)'
                    : wf.status === 'DONE' ? 'var(--green)'
                    : wf.status === 'FAILED' ? 'var(--rose)'
                    : 'var(--text-muted)'
                  const isApproving = approvingWorkflow === wf.workflowId
                  return (
                    <div key={wf.workflowId || i} className="workflow-item">
                      <div className="workflow-row">
                        <div className="workflow-name">{wf.name}</div>
                        <span className="workflow-status" style={{ color: statusColor }}>
                          {wf.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="workflow-meta">
                        {wf.clientId && <span>{wf.clientId} &middot; </span>}
                        {stepsTotal > 0 && <span>{stepsDone}/{stepsTotal} steps &middot; </span>}
                        <span className="workflow-id">{shortId}</span>
                      </div>
                      {needsApproval && (
                        <button
                          className={`workflow-approve-btn${isApproving ? ' approving' : ''}`}
                          onClick={() => approveWorkflow(wf.workflowId)}
                          disabled={!!approvingWorkflow}
                        >
                          {isApproving ? '…' : '✓ Approve'}
                        </button>
                      )}
                    </div>
                  )
                })
              )}
            </div>
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

          {/* Agency Health */}
          <div className="dash-card card-health">
            <div className="dash-card-title">
              <span className="card-icon">🩺</span> Agency Health
              {agencyStatus?.systemHealth?.schedulerActive && (
                <span className="card-live-badge">● LIVE</span>
              )}
            </div>
            <div className="health-grid">
              <div className="health-item">
                <div className="health-label">Scheduler</div>
                <div className={`health-value ${agencyStatus?.systemHealth?.schedulerActive ? 'color-green' : 'color-amber'}`}>
                  {agencyStatus?.systemHealth?.schedulerActive ? 'Active' : apiOnline === null ? '—' : 'Paused'}
                </div>
              </div>
              <div className="health-item">
                <div className="health-label">Agents Registered</div>
                <div className="health-value color-violet">
                  {agencyStatus?.systemHealth?.registeredAgents ?? '—'}
                </div>
              </div>
              <div className="health-item">
                <div className="health-label">Boot Count</div>
                <div className="health-value color-amber">
                  {agencyStatus?.systemHealth?.bootCount ?? '—'}
                </div>
              </div>
              <div className="health-item">
                <div className="health-label">API Status</div>
                <div className={`health-value ${apiOnline === true ? 'color-green' : apiOnline === false ? 'color-rose' : 'color-amber'}`}>
                  {apiOnline === true ? 'Online' : apiOnline === false ? 'Offline' : 'Checking...'}
                </div>
              </div>
              <div className="health-item">
                <div className="health-label">Tasks In Queue</div>
                <div className="health-value color-blue">
                  {taskCounts.pending + taskCounts.in_progress}
                </div>
              </div>
              <div className="health-item">
                <div className="health-label">Success Rate</div>
                <div className={`health-value ${taskCounts.total > 0 && (taskCounts.completed / taskCounts.total) > 0.8 ? 'color-green' : 'color-amber'}`}>
                  {taskCounts.total > 0
                    ? `${Math.round((taskCounts.completed / taskCounts.total) * 100)}%`
                    : '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Clients */}
          <div className="dash-card card-clients">
            <div className="dash-card-title">
              <span className="card-icon">👤</span> Clients
              <button className="new-client-btn" onClick={() => setNewClientOpen(true)} title="Onboard a new client">+ New Client</button>
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

          {/* Recent Commits */}
          <div className="dash-card card-commits">
            <div className="dash-card-title">
              <span className="card-icon">🔀</span> Recent Commits
              <span className="card-badge">{recentCommits.length > 0 ? recentCommits.length : ''}</span>
            </div>
            <div className="commits-list">
              {recentCommits.length === 0 ? (
                <div className="commits-empty">No commits yet — check back shortly.</div>
              ) : (
                recentCommits.slice(0, 6).map((c, i) => {
                  const shortSha = c.sha?.substring(0, 7) || '???????'
                  const shortMsg = (c.message || '').split('\n')[0].substring(0, 72)
                  const timeStr = c.date
                    ? new Date(c.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                    : ''
                  const dateStr = c.date
                    ? new Date(c.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                    : ''
                  return (
                    <div key={c.sha || i} className="commit-item">
                      <div className="commit-sha">{shortSha}</div>
                      <div className="commit-body">
                        <div className="commit-message">{shortMsg}</div>
                        <div className="commit-meta">
                          <span className="commit-author">{c.author || 'Kai'}</span>
                          {timeStr && <span>{timeStr}</span>}
                          {dateStr && <span>{dateStr}</span>}
                        </div>
                      </div>
                    </div>
                  )
                })
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

      {/* ─── Work With Us ─── */}
      <section className="work-with-us" id="work-with-us">
        <div className="wwu-inner">
          <div className="wwu-left">
            <div className="wwu-badge">Open Agency</div>
            <h2 className="wwu-heading">Ready to run your business smarter?</h2>
            <p className="wwu-sub">
              Tell us about your business. We&apos;ll deploy a dedicated AI team — sales, dev, creative, ops — that learns your world and never stops working.
            </p>
            <div className="wwu-features">
              <div className="wwu-feature"><span className="wwu-feat-icon">⚡</span>Live in 48 hours</div>
              <div className="wwu-feature"><span className="wwu-feat-icon">🤖</span>Full AI team — not just a chatbot</div>
              <div className="wwu-feature"><span className="wwu-feat-icon">📈</span>Gets smarter every day</div>
              <div className="wwu-feature"><span className="wwu-feat-icon">🔒</span>Your data stays yours</div>
            </div>
          </div>
          <div className="wwu-right">
            <WorkWithUsForm />
          </div>
        </div>
      </section>

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
            if (msg.role === 'dispatch') {
              const agents = msg.dispatchedAgents || []
              return (
                <div key={msg.id} className="chat-dispatch-card">
                  <div className="dispatch-card-header">
                    <span className="dispatch-card-icon">⚡</span>
                    <span className="dispatch-card-label">Agents Deployed</span>
                    <span className="dispatch-card-count">{agents.length}</span>
                  </div>
                  <div className="dispatch-agent-row">
                    {agents.map((agId, i) => {
                      const info = AGENT_INFO[agId?.toLowerCase()] || { name: agId, initials: (agId || 'A').charAt(0).toUpperCase(), dept: 'csuite' as const }
                      return (
                        <div key={i} className={`dispatch-agent-chip dept-${info.dept}`}>
                          <span className={`dispatch-chip-avatar dept-${info.dept}`}>{info.initials}</span>
                          <span className="dispatch-chip-name">{info.name}</span>
                        </div>
                      )
                    })}
                  </div>
                  {msg.time && <div className="chat-msg-time">{msg.time}</div>}
                </div>
              )
            }
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
                  <div className="chat-nikita-row">
                    <div className="chat-nk-avatar">NK</div>
                    <div className="chat-nikita-body">
                      <div className="nikita-typing-bubble">
                        <div className="agents-working-dots">
                          <span /><span /><span />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : msg.role === 'assistant' ? (
                  msg.streaming ? (
                    <StreamingMessage
                      text={msg.text}
                      time={msg.time}
                      onDone={() => {
                        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, streaming: false } : m))
                      }}
                    />
                  ) : (
                    <div className="chat-nikita-row">
                      <div className="chat-nk-avatar">NK</div>
                      <div className="chat-nikita-body">
                        <div
                          className="chat-msg-text chat-msg-rich"
                          dangerouslySetInnerHTML={{ __html: renderChatMarkdown(msg.text) }}
                        />
                        {msg.time && <div className="chat-msg-time">{msg.time}</div>}
                      </div>
                    </div>
                  )
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

        {/* Quick Prompt Chips — shown when chat is mostly empty */}
        {messages.filter(m => m.role === 'user').length === 0 && (
          <div className="chat-quick-prompts">
            <div className="chat-quick-label">Quick actions</div>
            <div className="chat-quick-chips">
              {QUICK_PROMPTS.map((qp, i) => (
                <button
                  key={i}
                  className="chat-quick-chip"
                  onClick={() => {
                    setInput(qp.text)
                    // auto-send after short delay so user sees it
                    setTimeout(() => {
                      setInput('')
                      setSending(true)
                      const now = chatTimeStr()
                      setMessages(prev => [...prev,
                        { id: Date.now(), role: 'user', text: qp.text, time: now },
                        { id: Date.now() + 1, role: 'typing', text: 'Nikita is thinking...' }
                      ])
                      fetch('/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: qp.text }),
                      })
                        .then(r => r.json())
                        .then(data => {
                          setMessages(prev => {
                            const filtered = prev.filter(m => m.role !== 'typing')
                            const next: ChatMessage[] = [
                              ...filtered,
                              { id: Date.now() + 2, role: 'assistant', text: data.reply || "On it.", time: chatTimeStr(), streaming: true },
                            ]
                            if (data.dispatched && Array.isArray(data.agents) && data.agents.length > 0) {
                              next.push({ id: Date.now() + 3, role: 'dispatch', text: '', time: chatTimeStr(), dispatchedAgents: data.agents as string[] })
                            }
                            return next
                          })
                          setSending(false)
                        })
                        .catch(() => {
                          setMessages(prev => {
                            const filtered = prev.filter(m => m.role !== 'typing')
                            return [...filtered, { id: Date.now() + 2, role: 'assistant', text: "Connection issue — try again in a moment.", time: chatTimeStr() }]
                          })
                          setSending(false)
                        })
                    }, 80)
                  }}
                  disabled={sending}
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>
        )}

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
                agentReports.slice(0, 8).map(r => {
                  const info = AGENT_INFO[r.agentId?.toLowerCase()] || {
                    name: r.agentId || 'Agent',
                    initials: (r.agentId || 'A').charAt(0).toUpperCase(),
                    dept: 'csuite' as const,
                  }
                  const shortDesc = (r.description || '').replace(/\[ONBOARDING\]\s*/i, '').split('.')[0].substring(0, 80)
                  return (
                    <div key={r.id} className="agent-report-item">
                      <div className="report-agent-row">
                        <span className={`report-agent-chip dept-${info.dept}`}>{info.initials}</span>
                        <span className={`report-agent-name dept-${info.dept}`}>{info.name}</span>
                        <span className={`report-status ${r.status}`}>{r.status === 'in_progress' ? 'running' : r.status}</span>
                      </div>
                      <div className="report-desc">{shortDesc || r.description}</div>
                      {r.createdAt && (
                        <div className="report-time">
                          {new Date(r.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  )
                })
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

      {/* New Client Modal */}
      {newClientOpen && (
        <div className="modal-backdrop" onClick={() => setNewClientOpen(false)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">New Client</span>
              <button className="modal-close" onClick={() => setNewClientOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-field">
                <label className="modal-label">Business Name *</label>
                <input
                  className="modal-input"
                  placeholder="e.g. Clearline Markets"
                  value={newClientForm.name}
                  onChange={e => setNewClientForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="modal-field">
                <label className="modal-label">Industry</label>
                <input
                  className="modal-input"
                  placeholder="e.g. Prop Trading, SaaS, eCommerce"
                  value={newClientForm.industry}
                  onChange={e => setNewClientForm(f => ({ ...f, industry: e.target.value }))}
                />
              </div>
              <div className="modal-row">
                <div className="modal-field">
                  <label className="modal-label">Contact Name</label>
                  <input
                    className="modal-input"
                    placeholder="Full name"
                    value={newClientForm.contactName}
                    onChange={e => setNewClientForm(f => ({ ...f, contactName: e.target.value }))}
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Contact Email</label>
                  <input
                    className="modal-input"
                    type="email"
                    placeholder="email@company.com"
                    value={newClientForm.contactEmail}
                    onChange={e => setNewClientForm(f => ({ ...f, contactEmail: e.target.value }))}
                  />
                </div>
              </div>
              <div className="modal-field">
                <label className="modal-label">Notes</label>
                <textarea
                  className="modal-input modal-textarea"
                  placeholder="What does this client need? Goals, context, constraints..."
                  rows={3}
                  value={newClientForm.notes}
                  onChange={e => setNewClientForm(f => ({ ...f, notes: e.target.value }))}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-cancel" onClick={() => setNewClientOpen(false)}>Cancel</button>
              <button
                className={`modal-submit${newClientSubmitting ? ' submitting' : ''}`}
                onClick={submitNewClient}
                disabled={newClientSubmitting || !newClientForm.name.trim()}
              >
                {newClientSubmitting ? 'Onboarding...' : 'Onboard Client'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Client Toast */}
      {newClientToast && (
        <div className={`new-client-toast${newClientToast.ok ? ' ok' : ' err'}`}>
          {newClientToast.msg}
        </div>
      )}

      {/* Agent Activity Toast Stack */}
      <AgentToastStack
        toasts={agentToasts}
        onDismiss={(id) => setAgentToasts(prev => prev.filter(t => t.id !== id))}
      />
    </>
  )
}
