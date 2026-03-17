"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Nav from "@/app/components/Nav";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ClientProfile {
  id: string;
  email: string;
  businessName: string;
  tier: string;
  brief: string | null;
  timezone: string;
  createdAt: string;
  assignedAgentCount: number;
}

interface AgentData {
  id: string;
  agentId: string;
  name: string;
  role: string;
  department: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
}

interface TaskData {
  id: string;
  agentId: string;
  type: string;
  status: string;
  input: unknown;
  output: unknown;
  createdAt: string;
  completedAt: string | null;
}

interface ReportData {
  id: string;
  agentId: string;
  type: string;
  content: { summary?: string; output?: string; next_actions?: string[]; confidence?: string } | string;
  createdAt: string;
}

interface MessageData {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

// ─── Demo Data (fallback) ────────────────────────────────────────────────────
const DEMO_CLIENT = {
  name: "Clearline Markets",
  plan: "Enterprise",
  price: "$999/mo",
  startDate: "1 Mar 2026",
};

const DEMO_AGENTS = [
  { id: "nikita", name: "Nikita", role: "CEO", dept: "Leadership", emoji: "👩‍💼", status: "active", lastActive: "2 min ago", tasksCompleted: 47 },
  { id: "marcus", name: "Marcus", role: "CFO", dept: "Finance", emoji: "💰", status: "active", lastActive: "12 min ago", tasksCompleted: 31 },
  { id: "zara", name: "Zara", role: "Creative Director", dept: "Creative", emoji: "🎨", status: "active", lastActive: "5 min ago", tasksCompleted: 28 },
  { id: "priya", name: "Priya", role: "CMO", dept: "Marketing", emoji: "📣", status: "active", lastActive: "8 min ago", tasksCompleted: 22 },
  { id: "kai", name: "Kai", role: "Dev Lead", dept: "Development", emoji: "🚀", status: "active", lastActive: "3 min ago", tasksCompleted: 61 },
  { id: "lena", name: "Lena", role: "Lead Gen", dept: "Sales", emoji: "📈", status: "idle", lastActive: "1 hr ago", tasksCompleted: 19 },
];

const DEMO_TASKS = [
  { id: "t1", title: "Q1 P&L Report — March 2026", agent: "Marcus", emoji: "💰", status: "completed", completedAt: "Today, 9:14 AM", priority: "high", output: "Q1 revenue $247,500 (+18% MoM). Operating costs $89,200. Net profit $158,300 (64% margin). Cash runway: 14 months at current burn." },
  { id: "t2", title: "Brand & Creative Audit", agent: "Zara", emoji: "🎨", status: "completed", completedAt: "Today, 11:32 AM", priority: "high", output: "Full brand audit complete. Brand consistency at 78% — improvement needed on social media visual identity. 3 creative opportunities identified." },
  { id: "t3", title: "Content Calendar — Next 2 Weeks", agent: "Priya", emoji: "📣", status: "in_progress", completedAt: null, priority: "medium", output: null },
  { id: "t4", title: "Daily Lead Generation", agent: "Lena", emoji: "📈", status: "in_progress", completedAt: null, priority: "medium", output: null },
  { id: "t5", title: "API Rate Limiting — Market Data Endpoints", agent: "Kai", emoji: "🚀", status: "completed", completedAt: "Yesterday, 4:45 PM", priority: "high", output: "Implemented token bucket rate limiter. Limits: 100 req/min per client. Deployed to staging — tests pass." },
  { id: "t6", title: "Investor Deck — Series A Narrative", agent: "Nikita", emoji: "👩‍💼", status: "queued", completedAt: null, priority: "low", output: null },
];

const DEMO_REPORTS = [
  {
    id: "r1", title: "Weekly Agency Briefing", author: "Nikita", emoji: "👩‍💼", date: "16 Mar 2026",
    summary: "Strong week. Dev team shipped rate limiting. Marcus flagged margin improvement. Priya's LinkedIn impressions up 340%.",
    sections: [
      { title: "Finance", content: "Q1 tracking ahead of target. March revenue projected at $87k." },
      { title: "Creative", content: "Brand audit complete. Social visual identity needs refresh." },
      { title: "Marketing", content: "340% LinkedIn impression lift. New content cadence working." },
      { title: "Next Week", content: "Content calendar rollout. Series A deck kickoff." },
    ],
  },
  {
    id: "r2", title: "Brand & Creative Audit", author: "Zara", emoji: "🎨", date: "16 Mar 2026",
    summary: "Full audit complete. Brand consistency at 78%. 3 creative opportunities identified.",
    sections: [
      { title: "Brand Consistency", content: "Logo usage correct across web. Social media visuals inconsistent — need style guide enforcement." },
      { title: "Opportunities", content: "1. Video content series. 2. Refreshed social templates. 3. Updated pitch deck visuals." },
      { title: "Recommendations", content: "Create brand style guide v2. Monthly visual audits going forward." },
    ],
  },
  {
    id: "r3", title: "March P&L Statement", author: "Marcus", emoji: "💰", date: "16 Mar 2026",
    summary: "March financials. Revenue up 18% MoM. Strong margin.",
    sections: [
      { title: "Revenue", content: "$87,000 projected. Platform subscriptions + 2 new enterprise clients." },
      { title: "Costs", content: "Total: $29,700. Cloud infra $8,400, Tooling $3,200, Services $18,100." },
      { title: "Profit", content: "Projected net profit: $57,300 (65.9% margin)." },
    ],
  },
];

const TIER_PRICES: Record<string, string> = { starter: "$299/mo", growth: "$499/mo", enterprise: "$999/mo" };

const DEPT_COLORS: Record<string, string> = {
  Leadership: "#7C3AED", Finance: "#F59E0B", Creative: "#EC4899",
  Marketing: "#EC4899", Development: "#10B981", Sales: "#F97316",
  Operations: "#6B7280", Legal: "#8B5CF6", HR: "#F472B6",
};

const AGENT_EMOJIS: Record<string, string> = {
  nikita: "👩‍💼", marcus: "💰", zara: "🎨", priya: "📣", kai: "🚀",
  rex: "📈", lena: "📈", cleo: "✉️", sam: "📊", mia: "📱",
  theo: "🔍", luna: "🎯", rio: "🖥️", nova: "⚙️", byte: "🧪",
  iris: "📒", felix: "📈", eli: "✍️", nora: "🎨", otto: "⚙️",
  vera: "📋", lex: "⚖️", cora: "📋", jules: "📄", harper: "👥",
  drew: "🧑‍💼", sage: "🤝",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: "Active", cls: "pill-active" },
    idle: { label: "Idle", cls: "pill-idle" },
    completed: { label: "Completed", cls: "pill-completed" },
    complete: { label: "Completed", cls: "pill-completed" },
    in_progress: { label: "In Progress", cls: "pill-progress" },
    running: { label: "Running", cls: "pill-progress" },
    pending: { label: "Pending", cls: "pill-queued" },
    queued: { label: "Queued", cls: "pill-queued" },
    failed: { label: "Failed", cls: "pill-idle" },
  };
  const s = map[status] || { label: status, cls: "pill-idle" };
  return <span className={`portal-pill ${s.cls}`}>{s.label}</span>;
}

function AgentCard({ agent }: { agent: { id: string; name: string; role: string; dept: string; emoji: string; status: string; lastActive: string; tasksCompleted: number; level?: number; xp?: number } }) {
  const color = DEPT_COLORS[agent.dept] || "#7C3AED";
  return (
    <div className="portal-agent-card">
      <div className="portal-agent-avatar" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
        <span className="portal-agent-emoji">{agent.emoji}</span>
      </div>
      <div className="portal-agent-info">
        <div className="portal-agent-name">
          {agent.name}
          {agent.level && agent.level > 1 && <span style={{ marginLeft: 6, fontSize: "0.7rem", color: "#7C3AED", fontWeight: 600 }}>Lv.{agent.level}</span>}
        </div>
        <div className="portal-agent-role">{agent.role} · {agent.dept}</div>
        <div className="portal-agent-meta">
          <StatusPill status={agent.status} />
          <span className="portal-agent-last">{agent.lastActive}</span>
        </div>
      </div>
      <div className="portal-agent-stat">
        <div className="portal-agent-stat-num">{agent.tasksCompleted}</div>
        <div className="portal-agent-stat-label">XP</div>
      </div>
    </div>
  );
}

function TaskRow({ task }: { task: { id: string; title: string; agent: string; emoji: string; status: string; completedAt: string | null; output: string | null } }) {
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

function ReportCard({ report, onClick }: { report: { id: string; title: string; author: string; emoji: string; date: string; summary: string }; onClick: () => void }) {
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

function ReportModal({ report, onClose }: { report: { title: string; author: string; emoji: string; date: string; summary: string; sections: { title: string; content: string }[] }; onClose: () => void }) {
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

function MessagePanel({ clientId }: { clientId: string | null }) {
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<{ role: "user" | "nikita"; text: string; time: string }[]>([
    { role: "nikita", text: "Hey there. Nikita here. Your agency is running — what do you need from me today?", time: "10:00 AM" },
  ]);

  // Load message history if we have a clientId
  useEffect(() => {
    if (!clientId) return;
    (async () => {
      try {
        const res = await fetch(`/api/clients/${clientId}/messages`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setHistory(data.map((m: MessageData) => ({
              role: m.role === "user" ? "user" as const : "nikita" as const,
              text: m.content,
              time: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            })));
          }
        }
      } catch { /* keep default */ }
    })();
  }, [clientId]);

  const handleSend = async () => {
    if (!msg.trim()) return;
    const userMsg = msg.trim();
    setMsg("");
    setSending(true);
    setHistory((h) => [...h, { role: "user", text: userMsg, time: "Now" }]);

    try {
      const endpoint = clientId ? `/api/clients/${clientId}/message` : "/api/chat";
      const res = await fetch(endpoint, {
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
  const [activeReport, setActiveReport] = useState<{ title: string; author: string; emoji: string; date: string; summary: string; sections: { title: string; content: string }[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);

  // Live data from API
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [liveAgents, setLiveAgents] = useState<AgentData[]>([]);
  const [liveTasks, setLiveTasks] = useState<TaskData[]>([]);
  const [liveReports, setLiveReports] = useState<ReportData[]>([]);

  // Also fetch agency-wide status for the overview
  const [agencyStatus, setAgencyStatus] = useState<{ lastBriefing?: string; finances?: { revenue: number; expenses: number; profit: number } } | null>(null);

  const loadClientData = useCallback(async (cid: string) => {
    const results = await Promise.allSettled([
      fetch(`/api/clients/${cid}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/clients/${cid}/agents`).then(r => r.ok ? r.json() : []),
      fetch(`/api/clients/${cid}/tasks`).then(r => r.ok ? r.json() : []),
      fetch(`/api/clients/${cid}/reports`).then(r => r.ok ? r.json() : []),
      fetch("/api/portal/status").then(r => r.ok ? r.json() : null),
    ]);

    const profile = results[0].status === "fulfilled" ? results[0].value : null;
    const agents = results[1].status === "fulfilled" ? results[1].value : [];
    const tasks = results[2].status === "fulfilled" ? results[2].value : [];
    const reports = results[3].status === "fulfilled" ? results[3].value : [];
    const status = results[4].status === "fulfilled" ? results[4].value : null;

    if (profile && profile.id) {
      setClientProfile(profile);
      setIsLive(true);
    }
    if (Array.isArray(agents) && agents.length > 0) setLiveAgents(agents);
    if (Array.isArray(tasks)) setLiveTasks(tasks);
    if (Array.isArray(reports)) setLiveReports(reports);
    if (status?.status) setAgencyStatus(status.status);

    setLoading(false);
  }, []);

  useEffect(() => {
    const storedId = typeof window !== "undefined" ? localStorage.getItem("oa_client_id") : null;
    if (storedId) {
      setClientId(storedId);
      loadClientData(storedId);
      const interval = setInterval(() => loadClientData(storedId), 30000);
      return () => clearInterval(interval);
    } else {
      // Try the agency status endpoint for backward compat
      (async () => {
        try {
          const res = await fetch("/api/portal/status");
          if (res.ok) {
            const data = await res.json();
            if (data.status) setAgencyStatus(data.status);
          }
        } catch { /* demo mode */ }
        setLoading(false);
      })();
    }
  }, [loadClientData]);

  // ─── Build display data ───────────────────────────────────

  const clientName = clientProfile?.businessName || DEMO_CLIENT.name;
  const clientTier = clientProfile?.tier || "enterprise";
  const clientPrice = TIER_PRICES[clientTier] || DEMO_CLIENT.price;
  const clientSince = clientProfile?.createdAt
    ? new Date(clientProfile.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : DEMO_CLIENT.startDate;

  // Agents
  const displayAgents = liveAgents.length > 0
    ? liveAgents.map(a => ({
        id: a.agentId,
        name: a.name,
        role: a.role,
        dept: a.department,
        emoji: AGENT_EMOJIS[a.agentId] || "🤖",
        status: "active",
        lastActive: `Lv.${a.level} · ${a.xp} XP`,
        tasksCompleted: a.xp,
        level: a.level,
        xp: a.xp,
      }))
    : DEMO_AGENTS;

  // Tasks
  const displayTasks = liveTasks.length > 0
    ? liveTasks.map(t => {
        const outputText = t.output
          ? (typeof t.output === "object" && t.output !== null && "summary" in (t.output as Record<string, unknown>))
            ? String((t.output as Record<string, unknown>).summary || "") + "\n" + String((t.output as Record<string, unknown>).output || "")
            : typeof t.output === "string" ? t.output : JSON.stringify(t.output).slice(0, 500)
          : null;
        return {
          id: t.id,
          title: t.type,
          agent: t.agentId.charAt(0).toUpperCase() + t.agentId.slice(1),
          emoji: AGENT_EMOJIS[t.agentId] || "🤖",
          status: t.status === "complete" ? "completed" : t.status,
          completedAt: t.completedAt ? new Date(t.completedAt).toLocaleString() : null,
          priority: "medium",
          output: outputText,
        };
      })
    : DEMO_TASKS;

  // Reports
  const displayReports = liveReports.length > 0
    ? liveReports.map(r => {
        const c = typeof r.content === "string" ? r.content : r.content;
        const summary = typeof c === "object" && c !== null ? (c.summary || "") : String(c).slice(0, 200);
        const output = typeof c === "object" && c !== null ? (c.output || "") : String(c);
        const nextActions = typeof c === "object" && c !== null && Array.isArray(c.next_actions) ? c.next_actions : [];
        const sections = [
          { title: "Report", content: String(output).slice(0, 2000) },
          ...(nextActions.length > 0 ? [{ title: "Next Actions", content: nextActions.join("\n") }] : []),
        ];
        return {
          id: r.id,
          title: r.type.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
          author: r.agentId.charAt(0).toUpperCase() + r.agentId.slice(1),
          emoji: AGENT_EMOJIS[r.agentId] || "📊",
          date: new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
          summary: String(summary),
          sections,
        };
      })
    : DEMO_REPORTS;

  // Stats
  const completedTasks = displayTasks.filter(t => t.status === "completed" || t.status === "complete").length;
  const inProgressTasks = displayTasks.filter(t => t.status === "in_progress" || t.status === "running").length;
  const activeAgentCount = displayAgents.length;
  const reportCount = displayReports.length;

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "⚡" },
    { id: "agents", label: "Your Team", icon: "👥" },
    { id: "tasks", label: "Tasks", icon: "📋" },
    { id: "reports", label: "Reports", icon: "📊" },
    { id: "message", label: "Message Nikita", icon: "💬" },
  ];

  return (
    <>
      <Nav />
      {activeReport && (
        <ReportModal report={activeReport} onClose={() => setActiveReport(null)} />
      )}
      <main className="portal-page">
        <div className="portal-container">

          {/* Welcome banner */}
          <div style={{
            padding: "14px 20px", marginBottom: 16,
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.2)",
            borderRadius: 10,
            display: "flex", alignItems: "center", gap: 10,
            fontSize: "0.82rem", color: "#94a3b8",
          }}>
            <span style={{ fontSize: "1rem" }}>&#9889;</span>
            <span><strong style={{ color: "#e2e8f0" }}>Welcome back.</strong> Your team is working.</span>
          </div>

          {/* Header */}
          <div className="portal-header">
            <div className="portal-header-left">
              <div className="portal-header-label">Client Portal</div>
              <h1 className="portal-header-name">{clientName}</h1>
              <div className="portal-header-meta">
                <span className="portal-plan-badge">{clientTier.charAt(0).toUpperCase() + clientTier.slice(1)} · {clientPrice}</span>
                <span className="portal-header-since">Since {clientSince}</span>
              </div>
            </div>
            <div className="portal-header-right">
              <Link href="/integrations" className="portal-header-btn secondary">
                🔗 Integrations
              </Link>
              {isLive ? (
                <button
                  className="portal-header-btn secondary"
                  onClick={() => {
                    try { localStorage.removeItem("oa_client_id"); } catch { /* noop */ }
                    window.location.href = "/login";
                  }}
                >
                  Switch Account
                </button>
              ) : (
                <Link href="/login" className="portal-header-btn primary">
                  Login →
                </Link>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="portal-stats-bar">
            {isLive && (
              <div style={{ position: "absolute", top: "0.5rem", right: "1rem", fontSize: "0.7rem", color: "#10B981", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", display: "inline-block" }} />
                LIVE
              </div>
            )}
            <div className="portal-stat-item">
              <div className="portal-stat-num" style={{ color: "#10B981" }}>{loading ? "…" : activeAgentCount}</div>
              <div className="portal-stat-label">Agents Assigned</div>
            </div>
            <div className="portal-stat-divider" />
            <div className="portal-stat-item">
              <div className="portal-stat-num" style={{ color: "#7C3AED" }}>{loading ? "…" : completedTasks}</div>
              <div className="portal-stat-label">Tasks Completed</div>
            </div>
            <div className="portal-stat-divider" />
            <div className="portal-stat-item">
              <div className="portal-stat-num" style={{ color: "#F59E0B" }}>{inProgressTasks}</div>
              <div className="portal-stat-label">In Progress</div>
            </div>
            <div className="portal-stat-divider" />
            <div className="portal-stat-item">
              <div className="portal-stat-num" style={{ color: "#EC4899" }}>{reportCount}</div>
              <div className="portal-stat-label">Reports Ready</div>
            </div>
            <div className="portal-stat-divider" />
            <div className="portal-stat-item">
              <div className="portal-stat-num" style={{ color: "#3B82F6" }}>
                {agencyStatus?.finances?.profit != null
                  ? agencyStatus.finances.profit === 0 ? "$0" : `$${(agencyStatus.finances.profit / 1000).toFixed(0)}k`
                  : "$158k"}
              </div>
              <div className="portal-stat-label">Net Profit</div>
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
                {/* Latest Report */}
                <div className="portal-section">
                  <div className="portal-section-title">
                    Latest Briefing
                    {isLive && <span style={{ marginLeft: "0.5rem", fontSize: "0.7rem", color: "#10B981", fontWeight: 600 }}>LIVE</span>}
                  </div>
                  {displayReports.length > 0 ? (
                    <div className="portal-latest-report" onClick={() => setActiveReport(displayReports[0])}>
                      <div className="portal-latest-report-header">
                        <span>{displayReports[0].emoji}</span>
                        <div>
                          <div className="portal-latest-report-title">{displayReports[0].title}</div>
                          <div className="portal-latest-report-date">{displayReports[0].date}</div>
                        </div>
                      </div>
                      <div className="portal-latest-report-summary">{displayReports[0].summary}</div>
                      <div className="portal-latest-report-read">Read full briefing →</div>
                    </div>
                  ) : (
                    <div className="portal-latest-report" style={{ cursor: "default" }}>
                      <div className="portal-latest-report-summary">No reports yet — your team is getting started.</div>
                    </div>
                  )}
                </div>

                {/* Active Tasks */}
                <div className="portal-section">
                  <div className="portal-section-title">Active Tasks</div>
                  <div className="portal-task-list">
                    {displayTasks.filter((t) => t.status !== "completed" && t.status !== "complete").length > 0
                      ? displayTasks.filter((t) => t.status !== "completed" && t.status !== "complete").map((task) => (
                          <TaskRow key={task.id} task={task} />
                        ))
                      : <div style={{ padding: "1rem", color: "#666", fontSize: "0.85rem" }}>No active tasks right now.</div>
                    }
                  </div>
                </div>

                {/* Team Snapshot */}
                <div className="portal-section">
                  <div className="portal-section-title">
                    Team Snapshot
                    {isLive && <span style={{ marginLeft: "0.5rem", fontSize: "0.7rem", color: "#10B981", fontWeight: 600 }}>LIVE</span>}
                  </div>
                  <div className="portal-agents-grid">
                    {displayAgents.slice(0, 3).map((agent) => (
                      <AgentCard key={agent.id} agent={agent} />
                    ))}
                  </div>
                  <button className="portal-view-all" onClick={() => setTab("agents")}>
                    View all {displayAgents.length} agents →
                  </button>
                </div>
              </div>
            )}

            {/* Agents */}
            {tab === "agents" && (
              <div className="portal-section">
                <div className="portal-section-title">
                  Your AI Team — {displayAgents.length} agents
                  {isLive && <span style={{ marginLeft: "0.5rem", fontSize: "0.7rem", color: "#10B981", fontWeight: 600 }}>LIVE</span>}
                </div>
                <div className="portal-agents-list">
                  {displayAgents.map((agent) => (
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
                  <div className="portal-section-meta">{completedTasks} completed · {inProgressTasks} in progress</div>
                </div>
                <div className="portal-task-list">
                  {displayTasks.length > 0
                    ? displayTasks.map((task) => <TaskRow key={task.id} task={task} />)
                    : <div style={{ padding: "1rem", color: "#666" }}>No tasks yet. Your agents will start working shortly.</div>
                  }
                </div>
              </div>
            )}

            {/* Reports */}
            {tab === "reports" && (
              <div className="portal-section">
                <div className="portal-section-title">Reports from your team</div>
                <div className="portal-reports-grid">
                  {displayReports.length > 0
                    ? displayReports.map((report) => (
                        <ReportCard key={report.id} report={report} onClick={() => setActiveReport(report)} />
                      ))
                    : <div style={{ padding: "1rem", color: "#666" }}>No reports yet. Check back after your first scheduled run.</div>
                  }
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
                <MessagePanel clientId={clientId} />
              </div>
            )}

          </div>

          {/* Status Banner */}
          {isLive ? (
            <div className="portal-demo-banner" style={{ borderColor: "#10B98122", background: "#10B98108" }}>
              <span style={{ color: "#10B981" }}>Connected to live agency data. </span>
              <Link href="/integrations" className="portal-demo-link">Connect your tools →</Link>
            </div>
          ) : (
            <div className="portal-demo-banner">
              <span>Preview mode — showing demo data. </span>
              <Link href="/login" className="portal-demo-link">Login to see your data →</Link>
              {" or "}
              <Link href="/pricing" className="portal-demo-link">Sign up →</Link>
            </div>
          )}

        </div>
      </main>
    </>
  );
}
