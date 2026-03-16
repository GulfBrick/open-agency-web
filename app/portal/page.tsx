"use client";

import { useState } from "react";
import Link from "next/link";
import Nav from "@/app/components/Nav";

// ─── Demo Data ────────────────────────────────────────────────────────────────
const DEMO_CLIENT = {
  name: "Clearline Markets",
  plan: "Enterprise",
  price: "$999/mo",
  startDate: "1 Mar 2026",
  contactName: "Harry",
};

const DEMO_AGENTS = [
  { id: "nikita", name: "Nikita", role: "CEO", dept: "Leadership", emoji: "👩‍💼", status: "active", lastActive: "2 min ago", tasksCompleted: 47 },
  { id: "marcus", name: "Marcus", role: "CFO", dept: "Finance", emoji: "💰", status: "active", lastActive: "12 min ago", tasksCompleted: 31 },
  { id: "zara", name: "Zara", role: "CTO", dept: "Tech", emoji: "🏗️", status: "active", lastActive: "5 min ago", tasksCompleted: 28 },
  { id: "priya", name: "Priya", role: "CMO", dept: "Marketing", emoji: "📣", status: "active", lastActive: "8 min ago", tasksCompleted: 22 },
  { id: "kai", name: "Kai", role: "Dev Lead", dept: "Dev Team", emoji: "🚀", status: "active", lastActive: "3 min ago", tasksCompleted: 61 },
  { id: "jordan", name: "Jordan", role: "Sales Lead", dept: "Sales Team", emoji: "📈", status: "idle", lastActive: "1 hr ago", tasksCompleted: 19 },
];

const DEMO_TASKS = [
  { id: "t1", title: "Q1 P&L Report — March 2026", agent: "Marcus", emoji: "💰", status: "completed", completedAt: "Today, 9:14 AM", priority: "high", output: "Q1 revenue $247,500 (+18% MoM). Operating costs $89,200. Net profit $158,300 (64% margin). Cash runway: 14 months at current burn. Flagged: Azure infra costs up 34% — Zara briefed." },
  { id: "t2", title: "Tech Stack Audit — Trading Infrastructure", agent: "Zara", emoji: "🏗️", status: "completed", completedAt: "Today, 11:32 AM", priority: "high", output: "Audit complete. 3 critical issues found: (1) WebSocket connection pool exhaustion under load >500 concurrent users. (2) Redis cache TTL misconfiguration causing stale P&L data. (3) No circuit breaker on external market data feeds. Remediation plan drafted — 2 day sprint." },
  { id: "t3", title: "LinkedIn Growth Campaign — April Push", agent: "Priya", emoji: "📣", status: "in_progress", completedAt: null, priority: "medium", output: null },
  { id: "t4", title: "Outbound Sales Sequence — Fund Managers", agent: "Jordan", emoji: "📈", status: "in_progress", completedAt: null, priority: "medium", output: null },
  { id: "t5", title: "API Rate Limiting — Market Data Endpoints", agent: "Kai", emoji: "🚀", status: "completed", completedAt: "Yesterday, 4:45 PM", priority: "high", output: "Implemented token bucket rate limiter on /api/market/* endpoints. Limits: 100 req/min per client, 1000 req/min global. Redis-backed with graceful degradation. Deployed to staging — performance tests pass. Ready for prod." },
  { id: "t6", title: "Investor Deck — Series A Narrative", agent: "Nikita", emoji: "👩‍💼", status: "queued", completedAt: null, priority: "low", output: null },
];

const DEMO_REPORTS = [
  {
    id: "r1",
    title: "Weekly Agency Briefing — W11 2026",
    author: "Nikita",
    emoji: "👩‍💼",
    date: "16 Mar 2026",
    summary: "Strong week. Dev team shipped rate limiting and fixed the WebSocket issue. Marcus flagged margin improvement opportunity. Priya's LinkedIn impressions up 340% from the new content strategy. Jordan has 3 qualified leads in pipeline worth ~$45k ARR. Recommend: approve Series A deck task for next week.",
    sections: [
      { title: "Finance", content: "Q1 tracking ahead of target. March revenue projected at $87k (budget: $72k). Azure cost spike addressed." },
      { title: "Tech", content: "2 of 3 critical infra issues resolved. Redis fix in staging. WebSocket pool fix scheduled for Tue deployment." },
      { title: "Marketing", content: "340% LinkedIn impression lift. New content cadence working. Targeting CFOs and prop trading firms." },
      { title: "Sales", content: "3 warm leads: Meridian Capital ($18k/yr), Apex Quant ($15k/yr), BlueStar Trading ($12k/yr). Jordan following up Tue." },
      { title: "Next Week", content: "Prod deployment of infra fixes. Series A deck kickoff. Outbound sequence launch for fund managers." },
    ],
  },
  {
    id: "r2",
    title: "Tech Audit Report — Clearline Trading Infrastructure",
    author: "Zara",
    emoji: "🏗️",
    date: "16 Mar 2026",
    summary: "Full audit of trading platform. Found 3 critical, 5 medium, 2 low severity issues. Priority remediation underway.",
    sections: [
      { title: "Critical Issues", content: "1. WebSocket pool exhaustion (>500 concurrent). 2. Redis TTL misconfiguration. 3. No circuit breaker on market data feeds." },
      { title: "Medium Issues", content: "Rate limiting gaps on public API. No health check endpoint. Missing request logging on /trade/* routes." },
      { title: "Architecture", content: "Overall stack is solid. Node.js + Redis + PostgreSQL is appropriate for the workload. Cloud costs can be reduced 20% by right-sizing EC2 instances." },
      { title: "Recommendations", content: "2-day sprint to address criticals. Monthly infra reviews going forward. Consider Cloudflare for DDoS protection ($200/mo)." },
    ],
  },
  {
    id: "r3",
    title: "March P&L Statement",
    author: "Marcus",
    emoji: "💰",
    date: "16 Mar 2026",
    summary: "March financials. Revenue up 18% MoM. Strong margin. One cost flag on cloud infra.",
    sections: [
      { title: "Revenue", content: "$87,000 projected (actual to date: $74,200). Primarily platform subscriptions + 2 new enterprise clients." },
      { title: "Operating Costs", content: "Total: $29,700. Breakdown: Cloud infra $8,400 (+34% — flagged), Tooling $3,200, Contracted services $18,100." },
      { title: "Profit", content: "Projected net profit: $57,300 (65.9% margin). YTD net: $158,300." },
      { title: "Forecast", content: "Q2 outlook: $310k revenue if pipeline closes. Recommend building 3-month cash reserve ($90k) before Series A spend." },
    ],
  },
];

const DEPT_COLORS: Record<string, string> = {
  Leadership: "#7C3AED",
  Finance: "#F59E0B",
  Tech: "#3B82F6",
  Marketing: "#EC4899",
  "Dev Team": "#10B981",
  "Sales Team": "#F97316",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: "Active", cls: "pill-active" },
    idle: { label: "Idle", cls: "pill-idle" },
    completed: { label: "Completed", cls: "pill-completed" },
    in_progress: { label: "In Progress", cls: "pill-progress" },
    queued: { label: "Queued", cls: "pill-queued" },
  };
  const s = map[status] || { label: status, cls: "pill-idle" };
  return <span className={`portal-pill ${s.cls}`}>{s.label}</span>;
}

function AgentCard({ agent }: { agent: typeof DEMO_AGENTS[0] }) {
  const color = DEPT_COLORS[agent.dept] || "#7C3AED";
  return (
    <div className="portal-agent-card">
      <div className="portal-agent-avatar" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
        <span className="portal-agent-emoji">{agent.emoji}</span>
      </div>
      <div className="portal-agent-info">
        <div className="portal-agent-name">{agent.name}</div>
        <div className="portal-agent-role">{agent.role} · {agent.dept}</div>
        <div className="portal-agent-meta">
          <StatusPill status={agent.status} />
          <span className="portal-agent-last">Last active {agent.lastActive}</span>
        </div>
      </div>
      <div className="portal-agent-stat">
        <div className="portal-agent-stat-num">{agent.tasksCompleted}</div>
        <div className="portal-agent-stat-label">tasks done</div>
      </div>
    </div>
  );
}

function TaskRow({ task }: { task: typeof DEMO_TASKS[0] }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`portal-task-row${expanded ? " expanded" : ""}`}>
      <button className="portal-task-header" onClick={() => task.output && setExpanded((v) => !v)}>
        <div className="portal-task-left">
          <span className="portal-task-emoji">{task.emoji}</span>
          <div className="portal-task-info">
            <div className="portal-task-title">{task.title}</div>
            <div className="portal-task-meta">
              {task.agent} · {task.completedAt || "In progress"}
            </div>
          </div>
        </div>
        <div className="portal-task-right">
          <StatusPill status={task.status} />
          {task.output && (
            <span className="portal-task-expand">{expanded ? "▲" : "▼"}</span>
          )}
        </div>
      </button>
      {expanded && task.output && (
        <div className="portal-task-output">
          <div className="portal-task-output-label">Agent Output</div>
          <div className="portal-task-output-text">{task.output}</div>
        </div>
      )}
    </div>
  );
}

function ReportCard({ report, onClick }: { report: typeof DEMO_REPORTS[0]; onClick: () => void }) {
  return (
    <div className="portal-report-card" onClick={onClick}>
      <div className="portal-report-header">
        <span className="portal-report-emoji">{report.emoji}</span>
        <div className="portal-report-meta">
          <div className="portal-report-title">{report.title}</div>
          <div className="portal-report-byline">{report.author} · {report.date}</div>
        </div>
      </div>
      <div className="portal-report-summary">{report.summary}</div>
      <div className="portal-report-read">Read full report →</div>
    </div>
  );
}

function ReportModal({ report, onClose }: { report: typeof DEMO_REPORTS[0]; onClose: () => void }) {
  return (
    <div className="portal-modal-overlay" onClick={onClose}>
      <div className="portal-modal" onClick={(e) => e.stopPropagation()}>
        <button className="portal-modal-close" onClick={onClose}>✕</button>
        <div className="portal-modal-header">
          <span className="portal-modal-emoji">{report.emoji}</span>
          <div>
            <div className="portal-modal-title">{report.title}</div>
            <div className="portal-modal-byline">{report.author} · {report.date}</div>
          </div>
        </div>
        <div className="portal-modal-summary">{report.summary}</div>
        <div className="portal-modal-sections">
          {report.sections.map((s, i) => (
            <div key={i} className="portal-modal-section">
              <div className="portal-modal-section-title">{s.title}</div>
              <div className="portal-modal-section-content">{s.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MessagePanel() {
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<{ role: "user" | "nikita"; text: string; time: string }[]>([
    { role: "nikita", text: "Hey Harry. Nikita here. Your agency is running well — 3 reports ready, infra issues being resolved. What do you need from me today?", time: "10:00 AM" },
  ]);

  const handleSend = async () => {
    if (!msg.trim()) return;
    const userMsg = msg.trim();
    setMsg("");
    setSending(true);
    setHistory((h) => [...h, { role: "user", text: userMsg, time: "Now" }]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      const reply = data.reply || data.message || "On it. I'll brief the team and get back to you with results.";
      setHistory((h) => [...h, { role: "nikita", text: reply, time: "Just now" }]);
    } catch {
      setHistory((h) => [...h, { role: "nikita", text: "Connection to agency backend is offline right now. Message received — your team is still working.", time: "Just now" }]);
    } finally {
      setSending(false);
      setSent(true);
    }
  };

  return (
    <div className="portal-message-panel">
      <div className="portal-message-history">
        {history.map((m, i) => (
          <div key={i} className={`portal-message-row ${m.role}`}>
            {m.role === "nikita" && <div className="portal-message-avatar">👩‍💼</div>}
            <div className="portal-message-bubble">
              <div className="portal-message-text">{m.text}</div>
              <div className="portal-message-time">{m.time}</div>
            </div>
          </div>
        ))}
        {sending && (
          <div className="portal-message-row nikita">
            <div className="portal-message-avatar">👩‍💼</div>
            <div className="portal-message-bubble">
              <div className="portal-message-typing">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="portal-message-input-row">
        <input
          className="portal-message-input"
          type="text"
          placeholder="Message Nikita..."
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !sending && handleSend()}
          disabled={sending}
        />
        <button className="portal-message-send" onClick={handleSend} disabled={sending || !msg.trim()}>
          {sending ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Portal Page ─────────────────────────────────────────────────────────

type Tab = "overview" | "agents" | "tasks" | "reports" | "message";

export default function PortalPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [activeReport, setActiveReport] = useState<typeof DEMO_REPORTS[0] | null>(null);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "⚡" },
    { id: "agents", label: "Your Team", icon: "👥" },
    { id: "tasks", label: "Tasks", icon: "📋" },
    { id: "reports", label: "Reports", icon: "📊" },
    { id: "message", label: "Message Nikita", icon: "💬" },
  ];

  const completedTasks = DEMO_TASKS.filter((t) => t.status === "completed").length;
  const inProgressTasks = DEMO_TASKS.filter((t) => t.status === "in_progress").length;
  const activeAgents = DEMO_AGENTS.filter((a) => a.status === "active").length;

  return (
    <>
      <Nav />
      {activeReport && (
        <ReportModal report={activeReport} onClose={() => setActiveReport(null)} />
      )}
      <main className="portal-page">
        <div className="portal-container">

          {/* Header */}
          <div className="portal-header">
            <div className="portal-header-left">
              <div className="portal-header-label">Client Portal</div>
              <h1 className="portal-header-name">{DEMO_CLIENT.name}</h1>
              <div className="portal-header-meta">
                <span className="portal-plan-badge">{DEMO_CLIENT.plan} · {DEMO_CLIENT.price}</span>
                <span className="portal-header-since">Since {DEMO_CLIENT.startDate}</span>
              </div>
            </div>
            <div className="portal-header-right">
              <Link href="/integrations" className="portal-header-btn secondary">
                🔗 Integrations
              </Link>
              <Link href="/onboard" className="portal-header-btn primary">
                Upgrade Plan →
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="portal-stats-bar">
            <div className="portal-stat-item">
              <div className="portal-stat-num" style={{ color: "#10B981" }}>{activeAgents}</div>
              <div className="portal-stat-label">Agents Active</div>
            </div>
            <div className="portal-stat-divider" />
            <div className="portal-stat-item">
              <div className="portal-stat-num" style={{ color: "#7C3AED" }}>{completedTasks}</div>
              <div className="portal-stat-label">Tasks Completed</div>
            </div>
            <div className="portal-stat-divider" />
            <div className="portal-stat-item">
              <div className="portal-stat-num" style={{ color: "#F59E0B" }}>{inProgressTasks}</div>
              <div className="portal-stat-label">In Progress</div>
            </div>
            <div className="portal-stat-divider" />
            <div className="portal-stat-item">
              <div className="portal-stat-num" style={{ color: "#EC4899" }}>{DEMO_REPORTS.length}</div>
              <div className="portal-stat-label">Reports Ready</div>
            </div>
            <div className="portal-stat-divider" />
            <div className="portal-stat-item">
              <div className="portal-stat-num" style={{ color: "#3B82F6" }}>$158k</div>
              <div className="portal-stat-label">Net Profit (Q1)</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="portal-tabs">
            {tabs.map((t) => (
              <button
                key={t.id}
                className={`portal-tab${tab === t.id ? " active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                <span className="portal-tab-icon">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="portal-content">

            {/* Overview */}
            {tab === "overview" && (
              <div className="portal-overview">
                {/* Latest Report Highlight */}
                <div className="portal-section">
                  <div className="portal-section-title">Latest Briefing</div>
                  <div
                    className="portal-latest-report"
                    onClick={() => setActiveReport(DEMO_REPORTS[0])}
                  >
                    <div className="portal-latest-report-header">
                      <span>{DEMO_REPORTS[0].emoji}</span>
                      <div>
                        <div className="portal-latest-report-title">{DEMO_REPORTS[0].title}</div>
                        <div className="portal-latest-report-date">{DEMO_REPORTS[0].date}</div>
                      </div>
                    </div>
                    <div className="portal-latest-report-summary">{DEMO_REPORTS[0].summary}</div>
                    <div className="portal-latest-report-read">Read full briefing →</div>
                  </div>
                </div>

                {/* Active Tasks */}
                <div className="portal-section">
                  <div className="portal-section-title">Active Tasks</div>
                  <div className="portal-task-list">
                    {DEMO_TASKS.filter((t) => t.status !== "completed").map((task) => (
                      <TaskRow key={task.id} task={task} />
                    ))}
                  </div>
                </div>

                {/* Team Snapshot */}
                <div className="portal-section">
                  <div className="portal-section-title">Team Snapshot</div>
                  <div className="portal-agents-grid">
                    {DEMO_AGENTS.slice(0, 3).map((agent) => (
                      <AgentCard key={agent.id} agent={agent} />
                    ))}
                  </div>
                  <button className="portal-view-all" onClick={() => setTab("agents")}>
                    View all {DEMO_AGENTS.length} agents →
                  </button>
                </div>
              </div>
            )}

            {/* Agents */}
            {tab === "agents" && (
              <div className="portal-section">
                <div className="portal-section-title">Your AI Team — {DEMO_AGENTS.length} agents</div>
                <div className="portal-agents-list">
                  {DEMO_AGENTS.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                </div>
              </div>
            )}

            {/* Tasks */}
            {tab === "tasks" && (
              <div className="portal-section">
                <div className="portal-section-header-row">
                  <div className="portal-section-title">All Tasks</div>
                  <div className="portal-section-meta">{completedTasks} completed · {inProgressTasks} in progress · {DEMO_TASKS.filter(t => t.status === "queued").length} queued</div>
                </div>
                <div className="portal-task-list">
                  {DEMO_TASKS.map((task) => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}

            {/* Reports */}
            {tab === "reports" && (
              <div className="portal-section">
                <div className="portal-section-title">Reports from your team</div>
                <div className="portal-reports-grid">
                  {DEMO_REPORTS.map((report) => (
                    <ReportCard key={report.id} report={report} onClick={() => setActiveReport(report)} />
                  ))}
                </div>
              </div>
            )}

            {/* Message */}
            {tab === "message" && (
              <div className="portal-section">
                <div className="portal-section-title">Message Nikita</div>
                <div className="portal-message-desc">
                  Nikita briefs your entire team. Send her your priorities, feedback, or new tasks.
                </div>
                <MessagePanel />
              </div>
            )}

          </div>

          {/* Demo Banner */}
          <div className="portal-demo-banner">
            <span>👁 Preview mode — showing demo data for Clearline Markets. </span>
            <Link href="/onboard" className="portal-demo-link">Start your real portal →</Link>
          </div>

        </div>
      </main>
    </>
  );
}
