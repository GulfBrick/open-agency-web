"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getStatus, getAgents, sendNikitaMessage, getTaskResults, getTaskQueue, getWorkflows, getSchedules, approveWorkflow, runSchedule, getElevenLabsKey, onboardClient } from "@/lib/api";

// ─── Markdown Renderer ───────────────────────────────────────────────────────
// Lightweight inline markdown → JSX (no external deps)
// Handles: **bold**, *italic*, `code`, [link](url), — bare URLs
function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Pattern: **bold** | *italic* | `code` | [text](url) | bare https?://...
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s]+)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[1] !== undefined) parts.push(<strong key={match.index}>{match[1]}</strong>);
    else if (match[2] !== undefined) parts.push(<em key={match.index}>{match[2]}</em>);
    else if (match[3] !== undefined) parts.push(<code key={match.index} className="md-code">{match[3]}</code>);
    else if (match[4] !== undefined) parts.push(<a key={match.index} href={match[5]} target="_blank" rel="noopener noreferrer" className="md-link">{match[4]}</a>);
    else if (match[6] !== undefined) parts.push(<a key={match.index} href={match[6]} target="_blank" rel="noopener noreferrer" className="md-link">{match[6]}</a>);
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function renderMarkdown(text: string): React.ReactNode {
  if (!text) return null;
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Heading: ## or ###
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const cls = level === 1 ? "md-h1" : level === 2 ? "md-h2" : "md-h3";
      elements.push(<div key={i} className={cls}>{renderInline(headingMatch[2])}</div>);
      i++;
      continue;
    }
    // Bullet: - or * or •
    if (/^[\-\*•]\s+/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^[\-\*•]\s+/.test(lines[i])) {
        items.push(<li key={i}>{renderInline(lines[i].replace(/^[\-\*•]\s+/, ""))}</li>);
        i++;
      }
      elements.push(<ul key={`ul-${i}`} className="md-list">{items}</ul>);
      continue;
    }
    // Numbered list: 1. or 1)
    if (/^\d+[\.\)]\s+/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+[\.\)]\s+/.test(lines[i])) {
        items.push(<li key={i}>{renderInline(lines[i].replace(/^\d+[\.\)]\s+/, ""))}</li>);
        i++;
      }
      elements.push(<ol key={`ol-${i}`} className="md-list">{items}</ol>);
      continue;
    }
    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={i} className="md-hr" />);
      i++;
      continue;
    }
    // Empty line
    if (line.trim() === "") {
      elements.push(<br key={i} />);
      i++;
      continue;
    }
    // Regular paragraph / inline
    elements.push(<p key={i} className="md-p">{renderInline(line)}</p>);
    i++;
  }
  return <>{elements}</>;
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface Agent {
  id: string;
  name: string;
  role: string;
  status: string;
  floor: string;
}

interface StatusData {
  agents: { id: string; name: string; role: string; status: string }[];
  pipeline: { total: number; hot: number; warm: number; cold: number; won?: number };
  finances: { revenue: number; expenses: number; profit: number; cashPosition?: number };
  systemHealth: { uptime: number; uptimeFormatted: string; bootCount: number; registeredAgents: number };
}

interface Task {
  id: string;
  agentId?: string;
  agentName?: string;
  description?: string;
  status?: string;
  createdAt?: string;
  completedAt?: string;
  result?: unknown;
}

interface Workflow {
  workflowId: string;
  name?: string;
  status?: string;
  clientId?: string;
  steps?: { status: string }[];
}

interface Schedule {
  key: string;
  name?: string;
  agentId?: string;
  schedule?: { hour?: number; minute?: number; type?: string; dayOfWeek?: number | null };
}

interface AgentReport {
  agent?: string;
  agentId?: string;
  description?: string;
  status?: string;
  completedAt?: string;
  result?: unknown;
}

// ─── Agent Config ────────────────────────────────────────────────────────────

const FLOOR_CONFIG: Record<string, { floor: string; name: string; role: string; rank: string }> = {
  nikita:             { floor: "ceo", name: "Nikita", role: "CEO", rank: "Owner" },
  "creative-director":{ floor: "creative", name: "Nova", role: "Creative Director", rank: "Director" },
  designer:           { floor: "creative", name: "Iris", role: "Designer", rank: "Senior" },
  "video-editor":     { floor: "creative", name: "Finn", role: "Video", rank: "Specialist" },
  "social-media":     { floor: "creative", name: "Jade", role: "Social", rank: "Specialist" },
  copywriter:         { floor: "creative", name: "Ash", role: "Copy", rank: "Senior" },
  "sales-lead":       { floor: "sales", name: "Jordan", role: "Sales Lead", rank: "Lead" },
  closer:             { floor: "sales", name: "Closer", role: "Closer", rank: "Senior" },
  "lead-qualifier":   { floor: "sales", name: "Qualifier", role: "Lead Qual", rank: "Specialist" },
  "follow-up":        { floor: "sales", name: "Follow-Up", role: "Follow-Up", rank: "Specialist" },
  proposal:           { floor: "sales", name: "Proposal", role: "Proposals", rank: "Specialist" },
  "dev-lead":         { floor: "dev", name: "Kai", role: "Dev Lead", rank: "Lead" },
  architect:          { floor: "dev", name: "Architect", role: "Architect", rank: "Senior" },
  frontend:           { floor: "dev", name: "Frontend", role: "Frontend", rank: "Engineer" },
  backend:            { floor: "dev", name: "Backend", role: "Backend", rank: "Engineer" },
  fullstack:          { floor: "dev", name: "Fullstack", role: "Fullstack", rank: "Engineer" },
  qa:                 { floor: "dev", name: "QA", role: "QA", rank: "Engineer" },
  "code-review":      { floor: "dev", name: "Reviewer", role: "Code Review", rank: "Senior" },
  cfo:                { floor: "csuite", name: "Marcus", role: "CFO", rank: "C-Suite" },
  cto:                { floor: "csuite", name: "Zara", role: "CTO", rank: "C-Suite" },
  cmo:                { floor: "csuite", name: "Priya", role: "CMO", rank: "C-Suite" },
};

const AVATAR_CLASS: Record<string, string> = {
  ceo: "ceo",
  creative: "creative",
  sales: "sales",
  dev: "dev",
  csuite: "csuite",
};

const DEFAULT_AGENTS: Agent[] = [
  { id: "nikita", name: "Nikita", role: "CEO", status: "standing-by", floor: "ceo" },
  { id: "creative-director", name: "Nova", role: "Creative Director", status: "standing-by", floor: "creative" },
  { id: "designer", name: "Iris", role: "Designer", status: "standing-by", floor: "creative" },
  { id: "video-editor", name: "Finn", role: "Video", status: "standing-by", floor: "creative" },
  { id: "social-media", name: "Jade", role: "Social", status: "standing-by", floor: "creative" },
  { id: "copywriter", name: "Ash", role: "Copy", status: "standing-by", floor: "creative" },
  { id: "sales-lead", name: "Jordan", role: "Sales Lead", status: "standing-by", floor: "sales" },
  { id: "closer", name: "Closer", role: "Closer", status: "standing-by", floor: "sales" },
  { id: "lead-qualifier", name: "Qualifier", role: "Lead Qual", status: "standing-by", floor: "sales" },
  { id: "follow-up", name: "Follow-Up", role: "Follow-Up", status: "standing-by", floor: "sales" },
  { id: "proposal", name: "Proposal", role: "Proposals", status: "standing-by", floor: "sales" },
  { id: "dev-lead", name: "Kai", role: "Dev Lead", status: "standing-by", floor: "dev" },
  { id: "architect", name: "Architect", role: "Architect", status: "standing-by", floor: "dev" },
  { id: "frontend", name: "Frontend", role: "Frontend", status: "standing-by", floor: "dev" },
  { id: "backend", name: "Backend", role: "Backend", status: "standing-by", floor: "dev" },
  { id: "fullstack", name: "Fullstack", role: "Fullstack", status: "standing-by", floor: "dev" },
  { id: "qa", name: "QA", role: "QA", status: "standing-by", floor: "dev" },
  { id: "code-review", name: "Reviewer", role: "Code Review", status: "standing-by", floor: "dev" },
  { id: "cfo", name: "Marcus", role: "CFO", status: "standing-by", floor: "csuite" },
  { id: "cto", name: "Zara", role: "CTO", status: "standing-by", floor: "csuite" },
  { id: "cmo", name: "Priya", role: "CMO", status: "standing-by", floor: "csuite" },
];

const FLOOR_ORDER = [
  { key: "ceo", cssClass: "floor-ceo", number: "05", icon: "\uD83D\uDC51", label: "Floor 5", name: "CEO \u00B7 Nikita \uD83D\uDC51" },
  { key: "creative", cssClass: "floor-creative", number: "04", icon: "\uD83C\uDFA8", label: "Floor 4", name: "Creative" },
  { key: "sales", cssClass: "floor-sales", number: "03", icon: "\uD83D\uDCBC", label: "Floor 3", name: "Sales" },
  { key: "dev", cssClass: "floor-dev", number: "02", icon: "\uD83D\uDE80", label: "Floor 2", name: "Dev Team" },
  { key: "csuite", cssClass: "floor-csuite", number: "01", icon: "\uD83D\uDC51", label: "Floor 1", name: "C-Suite" },
];

function isOnline(status: string) {
  return status === "active" || status === "working" || status === "online";
}

const BOOT_MESSAGES = [
  "Booting agency systems...",
  "Waking the team...",
  "Connecting to HQ...",
  "Syncing agent roster...",
  "Intelligence at work.",
];

function useLiveClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    function update() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      setTime(`${h}:${m}:${s}`);
    }
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  return time;
}

function useTypewriter(text: string, speed = 32) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const prevText = useRef("");

  useEffect(() => {
    if (text === prevText.current) return;
    prevText.current = text;
    setDone(false);
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, done };
}

function getInitials(name: string) {
  return name
    .split(/[\s()]+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const AGENT_IDLE_PHRASES: Record<string, string[]> = {
  nikita: ["Running the agency...", "Watching the numbers...", "Briefing the team..."],
  cfo: ["Reviewing P&L...", "Cash flow looks good.", "Q2 forecast running..."],
  cto: ["Architecture review...", "Infra scaling up...", "Monitoring systems..."],
  cmo: ["Campaign live...", "Brand strategy session", "Content calendar updated"],
  "dev-lead": ["Sprint planning...", "PR review queue...", "Velocity tracking..."],
  frontend: ["UI polish in progress", "Component library++", "Pixel perfect."],
  backend: ["API endpoints live", "DB query optimised", "Rate limits tuned..."],
  fullstack: ["Feature shipped.", "Full stack rolling...", "Deployment pipeline..."],
  qa: ["Tests passing ✓", "Coverage at 94%", "Bug hunt in progress"],
  "code-review": ["PR reviewed.", "Code quality: high", "Feedback dispatched..."],
  architect: ["System design session", "Scaling blueprint...", "Infra as code..."],
  "sales-lead": ["Pipeline updated.", "3 hot leads today.", "Follow-up queued..."],
  closer: ["Deal in negotiation", "Closing call booked.", "Proposal submitted..."],
  "lead-qualifier": ["Qualifying inbound...", "ICP match: 82%", "Lead scored..."],
  "follow-up": ["Sequence running...", "Outreach step 3/5", "Re-engaged lead..."],
  proposal: ["Deck being drafted", "Pricing customised", "Proposal sent ✓"],
  "creative-director": ["Brand voice locked.", "Campaign concept...", "Creative brief out"],
  designer: ["Mockup in Figma...", "Design system++", "Visual polish..."],
  "video-editor": ["Render in progress", "B-roll selected.", "Cut approved ✓"],
  "social-media": ["Post scheduled.", "Engagement up 12%", "Trending topic hit"],
  copywriter: ["Copy in review...", "Hook finalised.", "CTA optimised..."],
};

const bubblePhraseIdx: Record<string, number> = {};

function getBubbleText(agentId: string, status: string) {
  const phrases = AGENT_IDLE_PHRASES[agentId];
  if (phrases) {
    const idx = (bubblePhraseIdx[agentId] || 0) % phrases.length;
    return phrases[idx];
  }
  if (isOnline(status)) return "Working...";
  return "Standing by";
}

// ─── Animated Counter ────────────────────────────────────────────────────────

function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  isCurrency = false,
  duration = 1200,
  className,
}: {
  value: number | null | undefined;
  prefix?: string;
  suffix?: string;
  isCurrency?: boolean;
  duration?: number;
  className?: string;
}) {
  const [displayed, setDisplayed] = useState(0);
  const animatedRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (value == null || isNaN(value)) return;
    if (animatedRef.current === value) return;
    animatedRef.current = value;
    const target = value;
    const startTime = performance.now();

    function update(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      setDisplayed(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(update);
      } else {
        setDisplayed(target);
      }
    }

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(update);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value, duration]);

  if (value == null) return <span className={className}>—</span>;

  const formatted = isCurrency
    ? `$${displayed.toLocaleString()}`
    : `${prefix}${displayed.toLocaleString()}${suffix}`;

  return <span className={className}>{formatted}</span>;
}

// ─── Rooftop Star Particles ──────────────────────────────────────────────────

function RooftopParticles() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    for (let i = 0; i < 30; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      p.style.left = Math.random() * 100 + "%";
      p.style.bottom = Math.random() * 40 + "%";
      p.style.animationDuration = 4 + Math.random() * 6 + "s";
      p.style.animationDelay = Math.random() * 8 + "s";
      const size = 1.5 + Math.random() * 2.5 + "px";
      p.style.width = size;
      p.style.height = size;
      p.style.opacity = String(0.4 + Math.random() * 0.6);
      container.appendChild(p);
    }

    for (let i = 0; i < 20; i++) {
      const s = document.createElement("div");
      s.className = "particle twinkle star";
      s.style.left = Math.random() * 100 + "%";
      s.style.top = Math.random() * 70 + "%";
      const size = 2 + Math.random() * 3 + "px";
      s.style.width = size;
      s.style.height = size;
      s.style.animationDuration = 2 + Math.random() * 4 + "s";
      s.style.animationDelay = Math.random() * 5 + "s";
      container.appendChild(s);
    }

    return () => {
      container.innerHTML = "";
    };
  }, []);

  return <div ref={containerRef} className="rooftop-particles" />;
}

// ─── Agent Popup ────────────────────────────────────────────────────────────

interface AgentPopupProps {
  agent: Agent;
  onClose: () => void;
  tasksDone?: number;
  successRate?: number;
}

function AgentPopup({ agent, onClose, tasksDone, successRate }: AgentPopupProps) {
  const cfg = FLOOR_CONFIG[agent.id];
  const rank = cfg?.rank || "Agent";
  const avatarClass = AVATAR_CLASS[agent.floor] || "default";
  const initials = getInitials(agent.name);
  const online = isOnline(agent.status);
  const statusText = agent.id === "nikita" ? "Running the agency..." : online ? "Working..." : "Standing by";

  const hasStats = typeof tasksDone === "number" && tasksDone > 0;

  return (
    <div className="agent-popup visible" onClick={(e) => e.stopPropagation()}>
      <div className="popup-header">
        <div className={`popup-avatar ${avatarClass}`}>{initials}</div>
        <div>
          <div className="popup-name">{agent.name}</div>
          <div className="popup-role">{agent.role}</div>
        </div>
      </div>
      {hasStats ? (
        <div className="popup-stats">
          <div className="popup-stat">
            <div className="popup-stat-value color-green">{tasksDone}</div>
            <div className="popup-stat-label">Tasks Done</div>
          </div>
          <div className="popup-stat">
            <div className="popup-stat-value color-violet">{successRate ?? 100}%</div>
            <div className="popup-stat-label">Success</div>
          </div>
        </div>
      ) : (
        <div className="popup-stats">
          <div className="popup-stat">
            <div className="popup-stat-value" style={{ color: "var(--text-dim)", fontSize: "13px" }}>{statusText}</div>
            <div className="popup-stat-label">Status</div>
          </div>
        </div>
      )}
      <div className="popup-rank">Rank: <span>{rank}</span></div>
      <button className="popup-dismiss" onClick={onClose} title="Close">✕</button>
    </div>
  );
}

// ─── Agent Desk ─────────────────────────────────────────────────────────────

function AgentDesk({ agent, liveBubble, tasksDone, successRate }: { agent: Agent; liveBubble?: string; tasksDone?: number; successRate?: number }) {
  const isCeo = agent.floor === "ceo";
  const online = isOnline(agent.status);
  const avatarClass = AVATAR_CLASS[agent.floor] || "default";
  const initials = getInitials(agent.name);
  const firstName = agent.name.split(/[\s-]/)[0];
  const [phraseIdx, setPhraseIdx] = useState(0);
  const phrases = AGENT_IDLE_PHRASES[agent.id];
  const idleText = phrases
    ? phrases[phraseIdx % phrases.length]
    : isOnline(agent.status) ? "Working..." : "Standing by";
  // Prefer live task result text over idle phrase
  const bubbleText = liveBubble || idleText;
  const [popupOpen, setPopupOpen] = useState(false);

  // Cycle through phrases every 8 seconds (staggered by agent index, cleanup safe)
  useEffect(() => {
    if (!phrases || phrases.length < 2) return;
    const delay = Math.random() * 6000;
    let interval: ReturnType<typeof setInterval> | null = null;
    const t = setTimeout(() => {
      interval = setInterval(() => setPhraseIdx((i) => i + 1), 8000);
    }, delay);
    return () => {
      clearTimeout(t);
      if (interval) clearInterval(interval);
    };
  }, [phrases]);

  // Close popup when clicking elsewhere
  useEffect(() => {
    if (!popupOpen) return;
    const handler = () => setPopupOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [popupOpen]);

  return (
    <div className={`agent-desk${isCeo ? " ceo-desk" : ""}${online ? " is-online" : ""}`} style={{ position: "relative" }}>
      <div className={`bubble${liveBubble ? " live" : ""}`}>{bubbleText}</div>
      <div className="desk-surface">
        <div className="desk-monitor">&#128187;</div>
        <div
          className={`desk-avatar ${avatarClass}${isCeo ? " ceo" : ""} ${online ? "online" : "offline"}`}
          onClick={(e) => { e.stopPropagation(); setPopupOpen((v) => !v); }}
          title={`${agent.name} — click for info`}
        >
          {initials}
          <div className={`status-indicator ${online ? "online" : "offline"}`} />
        </div>
      </div>
      <div className="desk-name">{firstName}</div>
      <div className="desk-role">{agent.role}</div>
      <div className="desk-platform" />
      {popupOpen && <AgentPopup agent={agent} onClose={() => setPopupOpen(false)} tasksDone={tasksDone} successRate={successRate} />}
    </div>
  );
}

// ─── Building Floor ─────────────────────────────────────────────────────────

function BuildingFloor({
  floorDef,
  agents,
  liveBubbles,
  agentTaskStats,
}: {
  floorDef: (typeof FLOOR_ORDER)[number];
  agents: Agent[];
  liveBubbles?: Record<string, string>;
  agentTaskStats?: Record<string, { done: number; successRate: number }>;
}) {
  const anyOnline = agents.some((a) => isOnline(a.status));
  return (
    <div className={`floor ${floorDef.cssClass}${anyOnline ? " has-online" : ""}`}>
      <div className="floor-inner">
        <div className="floor-label">
          <div className="floor-number-badge">{floorDef.number}</div>
          <div className="floor-icon">{floorDef.icon}</div>
          <div className="floor-number">{floorDef.label}</div>
          <div className="floor-name">{floorDef.name}</div>
        </div>
        <div className="floor-desks">
          <div className="window-glow" />
          {agents.map((agent) => (
            <AgentDesk
              key={agent.id}
              agent={agent}
              liveBubble={liveBubbles?.[agent.id]}
              tasksDone={agentTaskStats?.[agent.id]?.done}
              successRate={agentTaskStats?.[agent.id]?.successRate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Toast System ────────────────────────────────────────────────────────────

interface ToastItem { id: number; msg: string; type: "success" | "error" | "" }

// Module-level callback — set by Dashboard, called by action components
let _globalShowToast: ((msg: string, type?: "success" | "error" | "") => void) | null = null;
function globalShowToast(msg: string, type: "success" | "error" | "" = "") {
  if (_globalShowToast) _globalShowToast(msg, type);
}

function ToastContainer({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 9990, display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", pointerEvents: "none" }}>
      {toasts.map((t) => (
        <div key={t.id} className={`oa-toast oa-toast-${t.type || "info"} oa-toast-show`}>
          {t.type === "success" && <span className="toast-icon">✓</span>}
          {t.type === "error" && <span className="toast-icon">✕</span>}
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── Schedule Run Item ──────────────────────────────────────────────────────

function ScheduleRunItem({ name, timeStr, scheduleKey }: { name: string; timeStr: string; scheduleKey: string }) {
  const [running, setRunning] = useState(false);
  const [ran, setRan] = useState(false);

  const handleRun = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (running) return;
    setRunning(true);
    try {
      await runSchedule(scheduleKey);
      setRan(true);
      globalShowToast(`${name} triggered`, "success");
      setTimeout(() => setRan(false), 3000);
    } catch {
      globalShowToast(`Failed to run ${name}`, "error");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="schedule-item">
      <div className="schedule-info">
        <div className="schedule-name">
          <span className="schedule-dot color-violet">●</span>
          {name}
        </div>
        <div className="schedule-time">{timeStr}</div>
      </div>
      <button
        className="btn-run"
        onClick={handleRun}
        disabled={running}
        title={`Run ${name} now`}
      >
        {running ? "..." : ran ? "✓" : "Run"}
      </button>
    </div>
  );
}

// ─── Workflow Approve Button ────────────────────────────────────────────────

function WorkflowApproveButton({ workflowId, onApproved }: { workflowId: string; onApproved?: () => void }) {
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);

  const handleApprove = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (approving || approved) return;
    setApproving(true);
    try {
      await approveWorkflow(workflowId);
      setApproved(true);
      globalShowToast("Workflow approved", "success");
      onApproved?.();
    } catch {
      globalShowToast("Approval failed", "error");
    } finally {
      setApproving(false);
    }
  };

  return (
    <button
      className="btn-approve"
      onClick={handleApprove}
      disabled={approving || approved}
      title={`Approve workflow ${workflowId}`}
    >
      {approving ? "…" : approved ? "✓ Approved" : "Approve"}
    </button>
  );
}

// ─── Nikita Chat Sidebar ────────────────────────────────────────────────────

interface ChatMessage {
  type: "user" | "nikita" | "agent";
  text: string;
  timestamp: number;
  time: string;
  agentId?: string;
  agentName?: string;
  agentRole?: string;
  department?: string;
  dispatched?: boolean;
}

const DEPT_COLORS: Record<string, string> = {
  cfo: "#7C3AED",
  csuite: "#7C3AED",
  cto: "#3B82F6",
  cmo: "#F59E0B",
  dev: "#10B981",
  sales: "#F43F5E",
  creative: "#EC4899",
};

function deptFromAgent(agentId: string): string {
  const cfg = FLOOR_CONFIG[agentId];
  if (cfg) return cfg.floor;
  const lower = agentId.toLowerCase();
  if (lower.includes("cfo") || lower.includes("marcus")) return "cfo";
  if (lower.includes("cto") || lower.includes("zara")) return "cto";
  if (lower.includes("cmo") || lower.includes("priya")) return "cmo";
  if (lower.includes("dev") || lower.includes("kai") || lower.includes("frontend") || lower.includes("backend") || lower.includes("qa")) return "dev";
  if (lower.includes("sales") || lower.includes("jordan") || lower.includes("closer") || lower.includes("proposal")) return "sales";
  if (lower.includes("creative") || lower.includes("nova") || lower.includes("iris") || lower.includes("finn") || lower.includes("jade") || lower.includes("ash")) return "creative";
  return "dev";
}

function AgentBubble({ msg }: { msg: ChatMessage }) {
  const dept = msg.department || "dev";
  const color = DEPT_COLORS[dept] || DEPT_COLORS.dev;
  const initials = getInitials(msg.agentName || "AG");

  return (
    <div className="chat-msg agent-msg" style={{ borderColor: `${color}33` }}>
      <div className="agent-bubble-row">
        <div className="agent-bubble-avatar" style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}>
          {initials}
        </div>
        <div className="agent-bubble-content">
          <div className="agent-bubble-header">
            <span className="agent-bubble-name" style={{ color }}>{msg.agentName}</span>
            <span className="agent-bubble-role">{msg.agentRole}</span>
          </div>
          <div className="agent-bubble-text">{msg.text}</div>
          <div className="chat-msg-time">{msg.time}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Agent Reports Panel ─────────────────────────────────────────────────────

function AgentReportsPanel({ reports }: { reports: AgentReport[] }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="agent-reports-panel">
      <div className="agent-reports-header" onClick={() => setExpanded((v) => !v)}>
        <span>Agent Reports</span>
        <span className="agent-reports-badge">{reports.length}</span>
      </div>
      {expanded && (
        <div className="agent-reports-list">
          {reports.length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: 11, padding: "8px" }}>No reports yet</div>
          ) : (
            reports.map((r, i) => {
              const shortDesc = (r.description || "").split(".")[0].substring(0, 60);
              const st = (r.status || "").toLowerCase();
              const statusClass = st === "completed" ? "completed" : st === "failed" ? "failed" : "pending";
              const statusLabel = st === "completed" ? "Done" : st === "failed" ? "Failed" : "Pending";
              const timeStr = r.completedAt
                ? new Date(r.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "--:--";
              const resultText = r.result
                ? typeof r.result === "string"
                  ? r.result.substring(0, 80)
                  : JSON.stringify(r.result).substring(0, 80)
                : "";
              const agentName = r.agent || r.agentId || "Agent";
              return (
                <div key={i} className="agent-report-item">
                  <div className="report-agent">{agentName}</div>
                  {shortDesc && <div className="report-desc">{shortDesc}</div>}
                  {resultText && (
                    <div className="report-desc" style={{ color: "var(--text)", marginTop: 2, fontStyle: "italic" }}>
                      {resultText}
                    </div>
                  )}
                  <div className="report-meta">
                    <span className={`report-status ${statusClass}`}>{statusLabel}</span>
                    <span>{timeStr}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ─── New Client Modal ────────────────────────────────────────────────────────

interface NewClientModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function NewClientModal({ onClose, onSuccess }: NewClientModalProps) {
  const [form, setForm] = useState({ name: "", industry: "", contactName: "", contactEmail: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Client name is required."); return; }
    setError("");
    setSubmitting(true);
    try {
      const res = await onboardClient(form);
      if (res.error) { setError(res.error); setSubmitting(false); return; }
      setDone(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1800);
    } catch {
      setError("Failed to connect to agency backend.");
      setSubmitting(false);
    }
  };

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className="modal-panel" role="dialog" aria-modal="true" aria-label="Onboard New Client">
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-icon">&#128100;</span> New Client
          </div>
          <button className="modal-close" onClick={onClose} title="Close">&#10005;</button>
        </div>
        {done ? (
          <div className="modal-success">
            <div className="modal-success-icon">&#10003;</div>
            <div className="modal-success-text">Client onboarded. Nikita is briefing the team.</div>
          </div>
        ) : (
          <form className="modal-form" onSubmit={handleSubmit}>
            <div className="modal-field">
              <label className="modal-label">Client Name <span className="modal-required">*</span></label>
              <input
                className="modal-input"
                type="text"
                placeholder="e.g. Clearline Markets"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                disabled={submitting}
                autoFocus
              />
            </div>
            <div className="modal-field">
              <label className="modal-label">Industry</label>
              <input
                className="modal-input"
                type="text"
                placeholder="e.g. Prop Trading, SaaS, E-commerce"
                value={form.industry}
                onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
                disabled={submitting}
              />
            </div>
            <div className="modal-row">
              <div className="modal-field">
                <label className="modal-label">Contact Name</label>
                <input
                  className="modal-input"
                  type="text"
                  placeholder="Jane Smith"
                  value={form.contactName}
                  onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))}
                  disabled={submitting}
                />
              </div>
              <div className="modal-field">
                <label className="modal-label">Contact Email</label>
                <input
                  className="modal-input"
                  type="email"
                  placeholder="jane@company.com"
                  value={form.contactEmail}
                  onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))}
                  disabled={submitting}
                />
              </div>
            </div>
            <div className="modal-field">
              <label className="modal-label">Notes</label>
              <textarea
                className="modal-input modal-textarea"
                placeholder="Brief context, goals, or special requirements..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                disabled={submitting}
                rows={3}
              />
            </div>
            {error && <div className="modal-error">{error}</div>}
            <div className="modal-actions">
              <button type="button" className="modal-btn-secondary" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="modal-btn-primary" disabled={submitting}>
                {submitting ? (
                  <><span className="modal-spinner" /> Onboarding...</>
                ) : (
                  "Onboard Client →"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function NikitaChat({
  onSend,
  isLoading,
  messages,
  isPolling,
  unreadCount,
  onOpen,
  agentReports,
}: {
  onSend: (msg: string) => void;
  isLoading: boolean;
  messages: ChatMessage[];
  isPolling: boolean;
  unreadCount: number;
  onOpen: () => void;
  agentReports: AgentReport[];
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [chipsVisible, setChipsVisible] = useState(true);
  const threadRef = useRef<HTMLDivElement>(null);

  const QUICK_CHIPS = [
    { icon: "📊", label: "Status report" },
    { icon: "🚀", label: "What's in the pipeline?" },
    { icon: "💰", label: "Financials update" },
    { icon: "🔧", label: "Any blockers?" },
    { icon: "🧠", label: "What's Kai working on?" },
  ];

  const handleChip = (label: string) => {
    setChipsVisible(false);
    onSend(label);
  };

  const handleOpen = () => {
    setOpen(true);
    onOpen();
  };

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <>
      <button
        className="nikita-chat-toggle"
        style={{ display: open ? "none" : undefined }}
        onClick={handleOpen}
        title="Chat with Nikita"
      >
        &#128172;
        {unreadCount > 0 && (
          <span className="nikita-chat-unread">{unreadCount}</span>
        )}
      </button>

      <div className={`nikita-chat${open ? " open" : ""}`}>
        <div className="nikita-chat-header">
          <div className="nikita-chat-header-avatar">N</div>
          <div className="nikita-chat-header-info">
            <div className="nikita-chat-header-name">Nikita</div>
            <div className="nikita-chat-header-status">
              <span className="nikita-chat-header-dot" />
              CEO · Open Agency
            </div>
          </div>
          <button className="nikita-chat-close" onClick={() => setOpen(false)} title="Close chat">
            &#10005;
          </button>
        </div>
        <div className="nikita-chat-thread" ref={threadRef}>
          <div className="nikita-chat-thread-inner">
            {messages.length === 0 && !isLoading && (
              <div className="chat-welcome">
                <div className="chat-welcome-avatar">N</div>
                <div className="chat-welcome-text">Nikita is online — ask her anything about the agency.</div>
              </div>
            )}
            {messages.map((msg, i) =>
              msg.type === "agent" ? (
                <AgentBubble key={i} msg={msg} />
              ) : (
                <div key={i} className={`chat-msg ${msg.type}`}>
                  <div className="chat-msg-text">
                    {msg.type === "nikita" ? renderMarkdown(msg.text) : msg.text}
                    {msg.dispatched && (
                      <span className="chat-dispatch-badge">→ agents dispatched</span>
                    )}
                  </div>
                  <div className="chat-msg-time">{msg.time}</div>
                </div>
              )
            )}
            {isLoading && (
              <div className="chat-msg nikita nikita-typing-bubble">
                <div className="agents-working-dots">
                  <span /><span /><span />
                </div>
              </div>
            )}
            {isPolling && (
              <div className="agents-working-indicator">
                <div className="agents-working-dots">
                  <span /><span /><span />
                </div>
                <span className="agents-working-text">Agents working...</span>
              </div>
            )}
          </div>
        </div>
        {/* Agent Reports Panel — matches local dashboard exactly */}
        <AgentReportsPanel reports={agentReports} />

        {/* Quick Prompt Chips — visible until user sends first message */}
        {chipsVisible && messages.length <= 1 && (
          <div className="chat-chips">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip.label}
                className="chat-chip"
                onClick={() => handleChip(chip.label)}
                disabled={isLoading}
              >
                <span className="chat-chip-icon">{chip.icon}</span>
                {chip.label}
              </button>
            ))}
          </div>
        )}

        <div className="nikita-chat-bar">
          <form onSubmit={handleSubmit} className="nikita-chat-bar-inner">
            <input
              type="text"
              className="nikita-chat-input"
              placeholder="Message Nikita..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              autoComplete="off"
            />
            <button
              type="submit"
              className="nikita-chat-send"
              disabled={!input.trim() || isLoading}
              title="Send"
            >
              &#9654;
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

// ─── Onboarding Welcome Panel ────────────────────────────────────────────────

function OnboardingPanel() {
  const [visible, setVisible] = useState(false);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem("oa_onboarding_dismissed");
      if (!dismissed) setVisible(true);
    } catch {
      // localStorage unavailable (SSR guard)
    }
  }, []);

  const dismiss = () => {
    setHiding(true);
    setTimeout(() => {
      setVisible(false);
      try { localStorage.setItem("oa_onboarding_dismissed", "1"); } catch { /* noop */ }
    }, 350);
  };

  if (!visible) return null;

  return (
    <div className={`onboarding-panel${hiding ? " hiding" : ""}`} role="complementary" aria-label="Welcome to Open Agency">
      <button className="onboarding-close" onClick={dismiss} title="Dismiss">&#10005;</button>
      <div className="onboarding-header">
        <span className="onboarding-icon">🏢</span>
        <div>
          <div className="onboarding-title">Welcome to Open Agency</div>
          <div className="onboarding-subtitle">An AI-powered agency — fully autonomous, always on.</div>
        </div>
      </div>
      <div className="onboarding-cards">
        <div className="onboarding-card">
          <div className="onboarding-card-icon">👥</div>
          <div className="onboarding-card-title">The Building</div>
          <div className="onboarding-card-text">This is your agency HQ. Each floor is a department — Sales, Dev, Creative, C-Suite. Agents live at their desks and work 24/7.</div>
        </div>
        <div className="onboarding-card">
          <div className="onboarding-card-icon">💬</div>
          <div className="onboarding-card-title">Talk to Nikita</div>
          <div className="onboarding-card-text">Hit the chat bubble to message Nikita, the CEO. She briefs you, dispatches agents, and handles requests in real time.</div>
        </div>
        <div className="onboarding-card">
          <div className="onboarding-card-icon">📊</div>
          <div className="onboarding-card-title">Live Dashboard</div>
          <div className="onboarding-card-text">Scroll down to see live financials, pipeline, tasks, workflows, and scheduled jobs — all pulling from the agency API.</div>
        </div>
      </div>
      <button className="onboarding-cta" onClick={dismiss}>Got it — let&apos;s go ↓</button>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

// ═══ Demo Data ═══════════════════════════════════════════════════════════════
const DEMO_STATUS: StatusData = {
  agents: DEFAULT_AGENTS.map(a => ({ id: a.id, name: a.name, role: a.role, status: "standing-by" })),
  pipeline: { total: 24, hot: 7, warm: 11, cold: 4, won: 2 },
  finances: { revenue: 48200, expenses: 12400, profit: 35800, cashPosition: 91500 }, // USD
  systemHealth: { uptime: 99.97, uptimeFormatted: "14d 6h 22m", bootCount: 3, registeredAgents: 21 },
};

const DEMO_TASKS: Task[] = [
  { id: "t1", agentId: "cfo", agentName: "Marcus", description: "Q2 financial forecast", status: "completed", createdAt: new Date(Date.now() - 1800000).toISOString(), completedAt: new Date(Date.now() - 900000).toISOString() },
  { id: "t2", agentId: "frontend", agentName: "Frontend", description: "Dashboard UI polish sprint", status: "in_progress", createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "t3", agentId: "sales-lead", agentName: "Jordan", description: "Qualify 3 new inbound leads", status: "completed", createdAt: new Date(Date.now() - 7200000).toISOString(), completedAt: new Date(Date.now() - 5400000).toISOString() },
  { id: "t4", agentId: "copywriter", agentName: "Ash", description: "Write homepage hero copy v3", status: "pending", createdAt: new Date(Date.now() - 1200000).toISOString() },
  { id: "t5", agentId: "backend", agentName: "Backend", description: "API rate limiting implementation", status: "in_progress", createdAt: new Date(Date.now() - 2400000).toISOString() },
  { id: "t6", agentId: "cmo", agentName: "Priya", description: "Monthly brand report", status: "completed", createdAt: new Date(Date.now() - 10800000).toISOString(), completedAt: new Date(Date.now() - 9000000).toISOString() },
  { id: "t7", agentId: "qa", agentName: "QA", description: "Regression test suite pass", status: "pending", createdAt: new Date(Date.now() - 600000).toISOString() },
  { id: "t8", agentId: "designer", agentName: "Iris", description: "Client pitch deck v2 — Clearline", status: "completed", createdAt: new Date(Date.now() - 14400000).toISOString(), completedAt: new Date(Date.now() - 12600000).toISOString() },
];

const DEMO_WORKFLOWS: Workflow[] = [
  { workflowId: "wf-001", name: "Client Onboard — Clearline", status: "DONE", steps: [{ status: "DONE" }, { status: "DONE" }, { status: "DONE" }] },
  { workflowId: "wf-002", name: "Q2 Marketing Campaign", status: "RUNNING", steps: [{ status: "DONE" }, { status: "DONE" }, { status: "RUNNING" }, { status: "PENDING" }] },
  { workflowId: "wf-003", name: "Dev Sprint — Dashboard", status: "RUNNING", steps: [{ status: "DONE" }, { status: "RUNNING" }, { status: "PENDING" }, { status: "PENDING" }] },
];

const DEMO_SCHEDULES: Schedule[] = [
  { key: "nikita-heartbeat", name: "Nikita Heartbeat", agentId: "nikita", schedule: { hour: 9, minute: 0, type: "daily" } },
  { key: "cfo-report", name: "Marcus — Daily P&L", agentId: "cfo", schedule: { hour: 18, minute: 0, type: "daily" } },
  { key: "sales-pipeline", name: "Pipeline Sync", agentId: "sales-lead", schedule: { hour: 8, minute: 30, type: "daily" } },
  { key: "ui-builder", name: "UI Builder Heartbeat", agentId: "designer", schedule: { hour: 0, minute: 10, type: "daily" } },
];

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>(DEFAULT_AGENTS);
  const [status, setStatus] = useState<StatusData | null>(null);
  const [apiOnline, setApiOnline] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [secondsSinceRefresh, setSecondsSinceRefresh] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatPolling, setChatPolling] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [taskQueue, setTaskQueue] = useState<Task[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [agentReports, setAgentReports] = useState<AgentReport[]>([]);
  const [newClientOpen, setNewClientOpen] = useState(false);
  // Live bubbles: agentId → short snippet of latest task result
  const [liveBubbles, setLiveBubbles] = useState<Record<string, string>>({});
  const [agentTaskStats, setAgentTaskStats] = useState<Record<string, { done: number; successRate: number }>>({});
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastIdRef = useRef(0);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const seenResultsRef = useRef<Set<string>>(new Set());

  // Register global toast dispatcher
  useEffect(() => {
    _globalShowToast = (msg: string, type: "success" | "error" | "" = "") => {
      const id = ++toastIdRef.current;
      setToasts((prev) => [...prev, { id, msg, type }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
    };
    return () => { _globalShowToast = null; };
  }, []);

  const loadChatHistory = useCallback(async () => {
    if (historyLoaded) return;
    try {
      const { getNikitaHistory } = await import("@/lib/api");
      const data = await getNikitaHistory();
      const arr = Array.isArray(data) ? data : data?.value ?? data?.messages ?? [];
      if (!arr.length) {
        setHistoryLoaded(true);
        // Seed a welcome from Nikita so the chat doesn't open blank
        const now = new Date();
        setChatMessages([{
          type: "nikita",
          text: "Hey. I'm Nikita — CEO of Open Agency. The team's standing by. Ask me anything about the business.",
          timestamp: now.getTime(),
          time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }]);
        setUnreadCount(1);
        return;
      }
      const mapped: ChatMessage[] = arr.slice(-20).map((m: Record<string, string>) => {
        const ts = m.timestamp ? new Date(m.timestamp).getTime() : Date.now();
        const time = new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        return {
          type: m.role === "user" ? "user" : "nikita",
          text: m.content || m.message || m.text || "",
          timestamp: ts,
          time,
        };
      });
      setChatMessages(mapped);
      setHistoryLoaded(true);
      setUnreadCount(mapped.filter(m => m.type === "nikita").length > 0 ? 1 : 0);
    } catch {
      setHistoryLoaded(true);
    }
  }, [historyLoaded]);

  const fetchData = useCallback(async () => {
    try {
      const [statusRes, agentsRes, taskRes, workflowRes, scheduleRes, reportsRes] = await Promise.allSettled([
        getStatus(),
        getAgents(),
        getTaskQueue(),
        getWorkflows(),
        getSchedules(),
        getTaskResults(),
      ]);

      if (statusRes.status === "fulfilled" && statusRes.value) {
        setStatus(statusRes.value);
        setApiOnline(true);
      } else {
        setApiOnline(false);
      }

      if (agentsRes.status === "fulfilled" && Array.isArray(agentsRes.value)) {
        const mapped: Agent[] = agentsRes.value.map((a: Record<string, unknown>) => {
          const id = typeof a.id === "string" ? a.id : String(a.id || a.name || "");
          const cfg = FLOOR_CONFIG[id];
          return {
            id,
            name: cfg?.name || (typeof a.name === "string" ? a.name : "Unknown"),
            role: cfg?.role || (typeof a.role === "string" ? a.role : ""),
            status: typeof a.status === "string" ? a.status : "standing-by",
            floor: cfg?.floor || (typeof a.floor === "string" ? a.floor : typeof a.department === "string" ? a.department : "dev"),
          };
        });
        if (mapped.length > 0) setAgents(mapped);
      }

      if (taskRes.status === "fulfilled") {
        const raw = taskRes.value;
        const arr: Task[] = Array.isArray(raw) ? raw : Array.isArray(raw?.tasks) ? raw.tasks : [];
        setTaskQueue(arr.slice(-50).reverse()); // most recent first, cap at 50
      }

      if (workflowRes.status === "fulfilled") {
        const raw = workflowRes.value;
        const arr: Workflow[] = Array.isArray(raw) ? raw : [];
        setWorkflows(arr);
      }

      if (scheduleRes.status === "fulfilled") {
        const raw = scheduleRes.value;
        const arr: Schedule[] = Array.isArray(raw) ? raw : [];
        setSchedules(arr);
      }

      if (reportsRes.status === "fulfilled") {
        const raw = reportsRes.value;
        const arr: AgentReport[] = Array.isArray(raw) ? raw.slice(0, 5) : [];
        setAgentReports(arr);

        // Derive live bubbles from most recent completed task per agent
        const bubbleMap: Record<string, string> = {};
        if (Array.isArray(raw)) {
          // Group by agentId, pick most recent completed
          const byAgent: Record<string, AgentReport> = {};
          for (const t of raw) {
            const id = t.agentId || t.agent || "";
            if (!id) continue;
            if ((t.status || "").toLowerCase() !== "completed") continue;
            const ts = t.completedAt ? new Date(t.completedAt).getTime() : 0;
            const existing = byAgent[id];
            if (!existing || (existing.completedAt ? new Date(existing.completedAt).getTime() : 0) < ts) {
              byAgent[id] = t;
            }
          }
          for (const [agentId, t] of Object.entries(byAgent)) {
            const resultText = t.result
              ? typeof t.result === "string" ? t.result : JSON.stringify(t.result)
              : t.description || "";
            // Trim to a punchy single sentence (max 60 chars)
            const snippet = resultText.split(/\.\s/)[0].substring(0, 60).trim();
            if (snippet) bubbleMap[agentId] = snippet + (snippet.length < resultText.length ? "…" : "");
          }
        }
        setLiveBubbles((prev) => ({ ...prev, ...bubbleMap }));

        // Compute per-agent task stats (done count + success rate)
        if (Array.isArray(raw)) {
          const statsMap: Record<string, { done: number; failed: number }> = {};
          for (const t of raw) {
            const id = t.agentId || t.agent || "";
            if (!id) continue;
            const st = (t.status || "").toLowerCase();
            if (st !== "completed" && st !== "failed") continue;
            if (!statsMap[id]) statsMap[id] = { done: 0, failed: 0 };
            if (st === "completed") statsMap[id].done++;
            else statsMap[id].failed++;
          }
          const computedStats: Record<string, { done: number; successRate: number }> = {};
          for (const [id, s] of Object.entries(statsMap)) {
            const total = s.done + s.failed;
            computedStats[id] = {
              done: s.done,
              successRate: total > 0 ? Math.round((s.done / total) * 100) : 100,
            };
          }
          setAgentTaskStats(computedStats);
        }
      }
    } catch {
      setApiOnline(false);
    }
    setLastRefreshed(new Date());
    setSecondsSinceRefresh(0);
  }, []);

  // Seed demo data when API is offline (after first load attempt)
  const demoSeeded = useRef(false);
  useEffect(() => {
    if (!apiOnline && loaded && !demoSeeded.current) {
      demoSeeded.current = true;
      setDemoMode(true);
      setStatus(DEMO_STATUS);
      setTaskQueue(DEMO_TASKS);
      setWorkflows(DEMO_WORKFLOWS);
      setSchedules(DEMO_SCHEDULES);
      setAgentReports([
        { agent: "Marcus", agentId: "cfo", description: "Q2 financial forecast completed", status: "completed", completedAt: new Date(Date.now() - 900000).toISOString(), result: "Revenue on track at $48.2k. Expenses 25.7% of revenue. Cash position healthy." },
        { agent: "Jordan", agentId: "sales-lead", description: "Qualified 3 inbound leads", status: "completed", completedAt: new Date(Date.now() - 5400000).toISOString(), result: "2 hot leads, 1 warm. Total pipeline value ~$18k." },
        { agent: "Iris", agentId: "designer", description: "Clearline pitch deck v2", status: "completed", completedAt: new Date(Date.now() - 12600000).toISOString(), result: "Deck delivered. 12 slides, brand aligned. Client review booked." },
      ]);
    }
    if (apiOnline && demoMode) {
      setDemoMode(false);
      demoSeeded.current = false;
    }
  }, [apiOnline, loaded, demoMode]);

  // Live countdown since last refresh
  useEffect(() => {
    const t = setInterval(() => {
      setSecondsSinceRefresh(s => s + 1);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetchData().then(() => setLoaded(true));
    loadChatHistory();
    const interval = setInterval(fetchData, 10_000);
    return () => clearInterval(interval);
  }, [fetchData, loadChatHistory]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setChatPolling(false);
  }, []);

  const startPolling = useCallback((sentAt: number) => {
    stopPolling();
    let agentCount = 0;
    const deadline = Date.now() + 30_000;
    setChatPolling(true);

    pollingRef.current = setInterval(async () => {
      if (Date.now() > deadline || agentCount >= 3) {
        stopPolling();
        return;
      }
      try {
        const results = await getTaskResults();
        const arr = Array.isArray(results) ? results : [];
        for (const task of arr) {
          const completedAt = task.completedAt ? new Date(task.completedAt).getTime() : 0;
          if (completedAt <= sentAt) continue;
          const taskKey = `${task.agentId || task.agentName}-${completedAt}`;
          if (seenResultsRef.current.has(taskKey)) continue;
          seenResultsRef.current.add(taskKey);
          agentCount++;

          const agentId = task.agentId || "";
          const dept = deptFromAgent(agentId);
          const cfg = FLOOR_CONFIG[agentId];
          const agentName = cfg?.name || task.agentName || agentId || "Agent";
          const agentRole = cfg?.role || task.description || "";
          const text = typeof task.result === "string" ? task.result : JSON.stringify(task.result);
          const time = new Date(completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

          setChatMessages((prev) => [
            ...prev,
            { type: "agent", text, timestamp: completedAt, time, agentId, agentName, agentRole, department: dept },
          ]);

          if (agentCount >= 3) {
            stopPolling();
            return;
          }
        }
      } catch {
        // polling error — silently continue
      }
    }, 3000);
  }, [stopPolling]);

  // Clean up polling on unmount
  useEffect(() => {
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  // Smart local Nikita responses when backend is offline
  const getLocalNikitaResponse = useCallback((message: string): { reply: string; dispatches: { agentId: string; text: string; delay: number }[] } => {
    const lower = message.toLowerCase();
    const dispatches: { agentId: string; text: string; delay: number }[] = [];

    if (lower.includes("status") || lower.includes("report") || lower.includes("how") && lower.includes("going")) {
      dispatches.push(
        { agentId: "cfo", text: "Revenue tracking at $48.2k this month. Expenses at 25.7% of revenue. Cash position healthy at $91.5k.", delay: 2000 },
        { agentId: "sales-lead", text: "Pipeline has 24 leads — 7 hot, 11 warm. 2 deals closed this week worth $8.4k ARR.", delay: 4000 },
      );
      return { reply: "Here's the latest. I've pulled reports from Marcus and Jordan. The agency is running well — revenue is up, pipeline is healthy, and all systems are operational. Let me know if you need me to dig into anything specific.", dispatches };
    }

    if (lower.includes("pipeline") || lower.includes("sales") || lower.includes("leads") || lower.includes("jordan")) {
      dispatches.push(
        { agentId: "sales-lead", text: "Pipeline breakdown: 7 hot leads (est. $42k), 11 warm ($33k), 4 cold ($12k). Follow-up sequences running on all warm leads.", delay: 2500 },
        { agentId: "closer", text: "2 deals in final negotiation — Meridian Capital ($18k/yr) and Apex Quant ($15k/yr). Proposals sent, awaiting signatures.", delay: 4500 },
      );
      return { reply: "Jordan's team is active. Here's the pipeline breakdown — I've asked Jordan and Closer to report in.", dispatches };
    }

    if (lower.includes("financ") || lower.includes("money") || lower.includes("revenue") || lower.includes("profit") || lower.includes("p&l") || lower.includes("marcus")) {
      dispatches.push(
        { agentId: "cfo", text: "Q1 revenue: $247.5k (+18% MoM). Operating costs: $89.2k. Net profit: $158.3k (64% margin). Cash runway: 14 months at current burn.", delay: 2000 },
      );
      return { reply: "Marcus has the numbers. Pulling his latest P&L now.", dispatches };
    }

    if (lower.includes("dev") || lower.includes("code") || lower.includes("build") || lower.includes("ship") || lower.includes("kai") || lower.includes("sprint")) {
      dispatches.push(
        { agentId: "dev-lead", text: "Current sprint: 3 tasks in progress, 2 completed today. API rate limiting shipped. Dashboard UI polish at 80%. QA running regression suite.", delay: 2000 },
        { agentId: "frontend", text: "Dashboard component library updated. Responsive grid refactored. Performance: 94 Lighthouse score.", delay: 4000 },
      );
      return { reply: "I'll get Kai to report on the sprint. The dev team has been productive today.", dispatches };
    }

    if (lower.includes("creative") || lower.includes("design") || lower.includes("brand") || lower.includes("nova") || lower.includes("content")) {
      dispatches.push(
        { agentId: "creative-director", text: "Brand refresh Phase 2 complete. New guidelines distributed. Campaign concept for April approved. Jade has 12 posts scheduled.", delay: 2500 },
        { agentId: "designer", text: "Pitch deck v2 delivered — 12 slides, brand-aligned. Client review booked for Thursday. Design system tokens updated.", delay: 4000 },
      );
      return { reply: "Nova's team is on it. Creative output has been strong this week — let me pull the latest.", dispatches };
    }

    if (lower.includes("blocker") || lower.includes("issue") || lower.includes("problem") || lower.includes("stuck")) {
      dispatches.push(
        { agentId: "cto", text: "One flag: Azure infra costs up 34%. Recommended right-sizing EC2 instances — estimated 20% savings. No critical blockers on development.", delay: 2000 },
      );
      return { reply: "Let me check across departments. Zara flagged one infrastructure item — pulling her report now.", dispatches };
    }

    if (lower.includes("marketing") || lower.includes("campaign") || lower.includes("priya") || lower.includes("growth")) {
      dispatches.push(
        { agentId: "cmo", text: "LinkedIn impressions up 340% from new content strategy. Targeting CFOs and prop trading firms. April campaign brief finalized. Conversion rate: 3.2% (up from 1.8%).", delay: 2500 },
      );
      return { reply: "Priya has been driving strong results. Let me pull the marketing numbers.", dispatches };
    }

    // Default response
    dispatches.push(
      { agentId: "cfo", text: "Standing by. All financial metrics nominal. Revenue on track.", delay: 3000 },
    );
    return { reply: `Got it. I'm on it. I've briefed the relevant teams and they're working on this now. You'll see agent updates appear as they report back. The agency is running smoothly — ${agents.filter(a => isOnline(a.status)).length || 21} agents active across all departments.`, dispatches };
  }, [agents]);

  const handleSendMessage = async (message: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setChatMessages((prev) => [...prev, { type: "user", text: message, timestamp: now.getTime(), time: timeStr }]);
    setChatLoading(true);
    const sentAt = now.getTime();
    try {
      const res = await sendNikitaMessage(message);
      const reply = res.reply || res.message || res.response || JSON.stringify(res);
      const replyTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const isOffline = res.offline === true;

      if (isOffline) {
        // Backend is offline — use smart local response
        const local = getLocalNikitaResponse(message);
        setChatMessages((prev) => [...prev, { type: "nikita", text: local.reply, timestamp: Date.now(), time: replyTime, dispatched: local.dispatches.length > 0 }]);

        // Simulate agent dispatches
        for (const dispatch of local.dispatches) {
          setTimeout(() => {
            const dept = deptFromAgent(dispatch.agentId);
            const cfg = FLOOR_CONFIG[dispatch.agentId];
            const agentName = cfg?.name || dispatch.agentId;
            const agentRole = cfg?.role || "";
            const t = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            setChatMessages((prev) => [...prev, {
              type: "agent", text: dispatch.text, timestamp: Date.now(), time: t,
              agentId: dispatch.agentId, agentName, agentRole, department: dept,
            }]);
          }, dispatch.delay);
        }
      } else {
        setChatMessages((prev) => [...prev, { type: "nikita", text: reply, timestamp: Date.now(), time: replyTime, dispatched: true }]);
        // Start polling for agent results
        startPolling(sentAt);
      }
    } catch {
      // Network error — use smart local response
      const local = getLocalNikitaResponse(message);
      const errorTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setChatMessages((prev) => [...prev, { type: "nikita", text: local.reply, timestamp: Date.now(), time: errorTime, dispatched: local.dispatches.length > 0 }]);

      for (const dispatch of local.dispatches) {
        setTimeout(() => {
          const dept = deptFromAgent(dispatch.agentId);
          const cfg = FLOOR_CONFIG[dispatch.agentId];
          const agentName = cfg?.name || dispatch.agentId;
          const agentRole = cfg?.role || "";
          const t = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          setChatMessages((prev) => [...prev, {
            type: "agent", text: dispatch.text, timestamp: Date.now(), time: t,
            agentId: dispatch.agentId, agentName, agentRole, department: dept,
          }]);
        }, dispatch.delay);
      }
    } finally {
      setChatLoading(false);
    }
  };

  // Count online agents
  const onlineCount = agents.filter((a) => isOnline(a.status)).length;

  // Live clock
  const liveClock = useLiveClock();

  // Boot message cycle for CEO brief while API loads
  const [bootMsgIdx, setBootMsgIdx] = useState(0);
  useEffect(() => {
    if (apiOnline) return;
    const t = setInterval(() => {
      setBootMsgIdx((i) => (i + 1) % BOOT_MESSAGES.length);
    }, 1800);
    return () => clearInterval(t);
  }, [apiOnline]);

  const briefText = status
    ? `${agents.filter((a) => isOnline(a.status)).length} agents active. Pipeline: ${status.pipeline?.total ?? 0} leads. Revenue: $${(status.finances?.revenue ?? 0).toLocaleString()}. Systems running smoothly.`
    : BOOT_MESSAGES[bootMsgIdx];

  const { displayed: briefDisplayed } = useTypewriter(briefText, 28);

  // Pipeline helpers
  const pipeTotal = status?.pipeline?.total || 1;
  const pipeHot = status?.pipeline?.hot ?? 0;
  const pipeWarm = status?.pipeline?.warm ?? 0;
  const pipeCold = status?.pipeline?.cold ?? 0;
  const pipeWon = (status?.pipeline as Record<string, number>)?.won ?? 0;

  return (
    <>
      {/* Loading Overlay */}
      <div className={`loading-overlay${loaded ? " hidden" : ""}`}>
        <div className="load-logo">Open Agency</div>
        <div className="load-spinner" />
        <div className="load-text">Initialising systems...</div>
      </div>

      {/* Top Gradient Bar */}
      <div className="top-gradient-bar" />

      {/* Subtle Overlays */}
      <div className="scanline-overlay" />
      <div className="noise-overlay" />

      {/* Background Grid */}
      <div className="bg-grid" />

      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-wordmark">
          <span>Open Agency</span>
        </h1>
        <p className="hero-subtitle">Intelligence at work.</p>
        <div className="hero-stats-row">
          <div className="hero-stat-pill">
            <div className="pulse-dot" />
            <span>{onlineCount || 21} agents online</span>
          </div>
          <div className="hero-stat-pill">
            <span className="hero-stat-icon">⚡</span>
            <span>{taskQueue.filter(t => (t.status || "").toLowerCase() === "in_progress").length || 3} active tasks</span>
          </div>
          <div className="hero-stat-pill">
            <span className="hero-stat-icon">$</span>
            <span>{status ? `$${(status.finances?.revenue ?? 48200).toLocaleString()}` : "$48,200"} revenue</span>
          </div>
        </div>
        <div className="hero-cta-row">
          <a href="/onboard" className="hero-cta-primary">Start Free Trial →</a>
          <a href="/pricing" className="hero-cta-secondary">View Pricing</a>
        </div>
        <div className="hero-scroll">Scroll to explore HQ ↓</div>
      </section>

      {/* First-Visit Onboarding Panel */}
      <OnboardingPanel />

      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="logo">OA</div>
          <div className="header-brand">
            <div className="header-title">Open Agency</div>
            <div className="header-tagline">Intelligence at work</div>
          </div>
        </div>
        <div className="header-right">
          {liveClock && (
            <span className="header-clock">{liveClock}</span>
          )}
          {lastRefreshed && (
            <span className="header-refresh-time" title={`Last refreshed: ${lastRefreshed.toLocaleTimeString()}`}>
              {secondsSinceRefresh < 5 ? "just now" : secondsSinceRefresh < 60 ? `${secondsSinceRefresh}s ago` : `${Math.floor(secondsSinceRefresh / 60)}m ago`}
            </span>
          )}
          <span className="uptime">{status?.systemHealth?.uptimeFormatted || "--"}</span>
          {demoMode && (
            <span className="demo-badge" title="API offline — showing demo data">Demo</span>
          )}
          <div className={`status-badge${apiOnline ? "" : " offline"}`}>
            <div className="status-dot" />
            <span>{apiOnline ? "Systems Online" : "Connecting..."}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        <div className="building-column">
          <div className="building">
            {/* Corner Accents */}
            <div className="building-corner building-corner--tl" />
            <div className="building-corner building-corner--tr" />
            <div className="building-corner building-corner--bl" />
            <div className="building-corner building-corner--br" />

            {/* ROOFTOP */}
            <div className="rooftop">
              <RooftopParticles />
              <div className="rooftop-monogram">
                <span>OA</span>
              </div>
              <div className="rooftop-logo">
                <span>Open Agency</span>
              </div>
              <div className="rooftop-tagline">Intelligence at work.</div>
              <div className={`rooftop-status${apiOnline ? "" : " offline"}`}>
                <div className="dot" />
                <span>{apiOnline ? "All Systems Operational" : "Connecting..."}</span>
              </div>
            </div>

            {/* FLOORS */}
            {FLOOR_ORDER.map((floorDef) => {
              const floorAgents = agents.filter((a) => a.floor === floorDef.key);
              return <BuildingFloor key={floorDef.key} floorDef={floorDef} agents={floorAgents} liveBubbles={liveBubbles} agentTaskStats={agentTaskStats} />;
            })}

            {/* GROUND FLOOR — STATS (6 live cards with animated counters) */}
            <div className="ground-floor">
              <div className="ground-stat">
                <div className="ground-stat-icon color-violet">&#9679;</div>
                <div className="ground-stat-value color-violet">
                  <AnimatedCounter
                    value={status ? (status.systemHealth?.registeredAgents ?? agents.length) : null}
                  />
                </div>
                <div className="ground-stat-label">Agents</div>
              </div>
              <div className="ground-stat">
                <div className="ground-stat-icon color-green">&#9670;</div>
                <div className="ground-stat-value color-green">
                  <AnimatedCounter value={status ? (status.pipeline?.total ?? 0) : null} />
                </div>
                <div className="ground-stat-label">Pipeline</div>
              </div>
              <div className="ground-stat">
                <div className="ground-stat-icon color-purple">$</div>
                <div className="ground-stat-value color-purple">
                  <AnimatedCounter
                    value={status?.finances?.revenue ?? null}
                    isCurrency
                  />
                </div>
                <div className="ground-stat-label">Revenue</div>
              </div>
              <div className="ground-stat">
                <div className="ground-stat-icon color-blue">&#9889;</div>
                <div className="ground-stat-value color-blue">
                  <AnimatedCounter
                    value={status ? taskQueue.filter(t => (t.status || "").toLowerCase() === "in_progress").length : null}
                  />
                </div>
                <div className="ground-stat-label">Active Tasks</div>
              </div>
              <div className="ground-stat">
                <div className="ground-stat-icon color-green">&#8679;</div>
                <div className="ground-stat-value color-green" style={{ fontSize: "18px", letterSpacing: "-0.5px" }}>
                  {status?.systemHealth?.uptimeFormatted
                    ? status.systemHealth.uptimeFormatted.split(" ")[0]
                    : "—"}
                </div>
                <div className="ground-stat-label">Uptime</div>
              </div>
              <div className="ground-stat">
                <div className="ground-stat-icon color-amber">&#9889;</div>
                <div className="ground-stat-value color-amber">
                  <AnimatedCounter value={status ? (status.systemHealth?.bootCount ?? 0) : null} />
                </div>
                <div className="ground-stat-label">Boots</div>
              </div>
            </div>
          </div>

          {/* Building Foundation & Footer */}
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
          <div className={`ceo-brief-text${!status ? " empty" : ""}`}>
            {briefDisplayed}<span className="typewriter-cursor">|</span>
          </div>
          <div className="ceo-brief-time" />
        </div>

        {/* Dashboard Grid — matches local dashboard layout exactly */}
        <section className="dashboard-grid">

          {/* ROW 1: Financials | Sales Pipeline | Active Sprint */}

          {/* Financials */}
          <div className="dash-card card-financials">
            <div className="dash-card-title">
              <span className="card-icon">&#163;</span> Financials
              {status && <span className="card-badge" style={{ color: "var(--green)", borderColor: "rgba(16,185,129,0.2)", background: "rgba(16,185,129,0.08)" }}>live</span>}
            </div>
            <div className="finance-grid">
              <div className="finance-item">
                <div className="finance-label">Revenue</div>
                <div className="finance-value color-green">
                  {status ? `$${(status.finances?.revenue ?? 0).toLocaleString()}` : "\u2014"}
                </div>
              </div>
              <div className="finance-item">
                <div className="finance-label">Expenses</div>
                <div className="finance-value color-rose">
                  {status ? `$${(status.finances?.expenses ?? 0).toLocaleString()}` : "\u2014"}
                </div>
              </div>
              <div className="finance-item">
                <div className="finance-label">Profit</div>
                <div className="finance-value">
                  {status ? `$${(status.finances?.profit ?? 0).toLocaleString()}` : "\u2014"}
                </div>
              </div>
              <div className="finance-item">
                <div className="finance-label">Cash Position</div>
                <div className="finance-value color-violet">
                  {status ? `$${((status?.finances as Record<string, number>)?.cashPosition ?? 0).toLocaleString()}` : "\u2014"}
                </div>
              </div>
            </div>
          </div>

          {/* Sales Pipeline */}
          <div className="dash-card card-pipeline">
            <div className="dash-card-title">
              <span className="card-icon">&#128188;</span> Sales Pipeline
            </div>
            <div className="pipeline-list">
              <div className="pipeline-row">
                <div className="pipeline-label">Hot</div>
                <div className="pipeline-bar-track">
                  <div className="pipeline-bar-fill rose" style={{ width: `${pipeTotal ? (pipeHot / pipeTotal) * 100 : 0}%` }} />
                </div>
                <div className="pipeline-count color-rose">{pipeHot}</div>
              </div>
              <div className="pipeline-row">
                <div className="pipeline-label">Warm</div>
                <div className="pipeline-bar-track">
                  <div className="pipeline-bar-fill amber" style={{ width: `${pipeTotal ? (pipeWarm / pipeTotal) * 100 : 0}%` }} />
                </div>
                <div className="pipeline-count color-amber">{pipeWarm}</div>
              </div>
              <div className="pipeline-row">
                <div className="pipeline-label">Cold</div>
                <div className="pipeline-bar-track">
                  <div className="pipeline-bar-fill violet" style={{ width: `${pipeTotal ? (pipeCold / pipeTotal) * 100 : 0}%` }} />
                </div>
                <div className="pipeline-count color-violet">{pipeCold}</div>
              </div>
              <div className="pipeline-row">
                <div className="pipeline-label">Won</div>
                <div className="pipeline-bar-track">
                  <div className="pipeline-bar-fill green" style={{ width: `${pipeTotal ? (pipeWon / pipeTotal) * 100 : 0}%` }} />
                </div>
                <div className="pipeline-count color-green">{pipeWon}</div>
              </div>
            </div>
          </div>

          {/* Active Sprint */}
          <div className="dash-card card-sprint">
            <div className="dash-card-title">
              <span className="card-icon">&#128640;</span> Active Sprint
              <span className="card-badge sprint-badge">
                {taskQueue.filter(t => (t.status || "").toLowerCase() === "in_progress").length > 0 ? "live" : "--"}
              </span>
            </div>
            {(() => {
              const sprintDone = taskQueue.filter(t => (t.status || "").toLowerCase() === "completed").length;
              const sprintTotal = taskQueue.length;
              const sprintPct = sprintTotal > 0 ? Math.round((sprintDone / sprintTotal) * 100) : 0;
              return (
                <>
                  <div className="sprint-pct">{sprintPct}% complete</div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${sprintPct}%` }} />
                  </div>
                </>
              );
            })()}
            <div className="sprint-stats">
              <div className="sprint-stat">
                <div className="sprint-stat-value color-amber">
                  {taskQueue.filter(t => (t.status || "").toLowerCase() === "pending").length}
                </div>
                <div className="sprint-stat-label">Queued</div>
              </div>
              <div className="sprint-stat">
                <div className="sprint-stat-value color-blue">
                  {taskQueue.filter(t => (t.status || "").toLowerCase() === "in_progress").length}
                </div>
                <div className="sprint-stat-label">Active</div>
              </div>
              <div className="sprint-stat">
                <div className="sprint-stat-value color-green">
                  {taskQueue.filter(t => (t.status || "").toLowerCase() === "completed").length}
                </div>
                <div className="sprint-stat-label">Done</div>
              </div>
            </div>
            <div className="sprint-list" style={{ marginTop: 14 }}>
              {taskQueue.filter(t => (t.status || "").toLowerCase() === "in_progress").length === 0 ? (
                <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
                  {apiOnline ? "No active sprint" : "Loading..."}
                </div>
              ) : (
                taskQueue
                  .filter(t => (t.status || "").toLowerCase() === "in_progress")
                  .slice(0, 4)
                  .map((task, i) => {
                    const cfg = FLOOR_CONFIG[task.agentId || ""];
                    const name = cfg?.name || task.agentName || task.agentId || "Agent";
                    const desc = task.description || "Task";
                    return (
                      <div key={task.id || i} className="sprint-item">
                        <span className="sprint-dot color-blue">●</span>
                        <span className="sprint-label">{name}: {desc.length > 30 ? desc.slice(0, 30) + "…" : desc}</span>
                        <span className="sprint-status color-blue">active</span>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* ROW 2: Live Task Queue (span 2) | Workflows */}

          {/* Live Task Queue — spans 2 columns */}
          <div className="dash-card card-tasks" style={{ gridColumn: "span 2" }}>
            <div className="dash-card-title">
              <span className="card-icon">&#9889;</span> Live Task Queue
              <span className="card-badge sprint-badge">{taskQueue.length || "0"}</span>
            </div>
            <div className="task-queue-stats">
              {(["pending","in_progress","completed","failed"] as const).map((st) => {
                const count = taskQueue.filter(t => (t.status || "").toLowerCase() === st).length;
                const colorMap: Record<string,string> = { pending: "amber", in_progress: "blue", completed: "green", failed: "rose" };
                const labelMap: Record<string,string> = { pending: "Pending", in_progress: "In Progress", completed: "Completed", failed: "Failed" };
                return (
                  <div key={st} className={`tq-stat color-${colorMap[st]}`}>
                    <div className="tq-stat-value">{count}</div>
                    <div className="tq-stat-label">{labelMap[st]}</div>
                  </div>
                );
              })}
            </div>
            <div className="task-feed-list">
              {taskQueue.length === 0 ? (
                <div className="task-feed-empty">{apiOnline ? "No tasks yet" : "Loading..."}</div>
              ) : (
                taskQueue.slice(0, 8).map((task, i) => {
                  const st = (task.status || "pending").toLowerCase();
                  const dotColor = st === "completed" ? "green" : st === "in_progress" ? "blue" : st === "failed" ? "rose" : "amber";
                  const cfg = FLOOR_CONFIG[task.agentId || ""];
                  const name = cfg?.name || task.agentName || task.agentId || "Agent";
                  const desc = task.description || "Task";
                  const ts = task.createdAt ? new Date(task.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
                  return (
                    <div key={task.id || i} className="task-feed-item">
                      <span className={`task-feed-dot color-${dotColor}`}>●</span>
                      <span className="task-feed-agent">{name}</span>
                      <span className="task-feed-desc">{desc.length > 52 ? desc.slice(0, 52) + "…" : desc}</span>
                      {ts && <span style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 9, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{ts}</span>}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Workflows — live from API */}
          <div className="dash-card card-workflows">
            <div className="dash-card-title">
              <span className="card-icon">&#128736;</span> Workflows
              <span className="card-badge">{workflows.length || "0"}</span>
            </div>
            {workflows.length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
                {apiOnline ? "No active workflows" : "Loading..."}
              </div>
            ) : (
              <div className="sprint-list">
                {workflows.slice(0, 6).map((wf, i) => {
                  const st = (wf.status || "").toUpperCase();
                  const dot = st === "RUNNING" ? "blue" : st === "DONE" ? "green" : st === "FAILED" ? "rose" : st === "WAITING_APPROVAL" ? "amber" : "violet";
                  const stepsTotal = wf.steps?.length || 0;
                  const stepsDone = wf.steps?.filter(s => s.status === "DONE").length || 0;
                  const label = wf.name || wf.workflowId?.substring(0, 16) || "Workflow";
                  const statusLabel = st.replace("_", " ").toLowerCase();
                  const needsApproval = st === "WAITING_APPROVAL";
                  return (
                    <div key={i} className={`sprint-item${needsApproval ? " sprint-item-approval" : ""}`}>
                      <span className={`sprint-dot color-${dot}`}>●</span>
                      <span className="sprint-label">
                        {label}
                        {stepsTotal > 0 && (
                          <span style={{ color: "var(--text-muted)", fontSize: 10, marginLeft: 4 }}>
                            {stepsDone}/{stepsTotal}
                          </span>
                        )}
                      </span>
                      {needsApproval ? (
                        <WorkflowApproveButton workflowId={wf.workflowId} onApproved={fetchData} />
                      ) : (
                        <span className={`sprint-status color-${dot}`}>{statusLabel}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ROW 3: Clients | Scheduled Tasks | Activity Log */}

          {/* Clients */}
          <div className="dash-card card-clients">
            <div className="dash-card-title">
              <span className="card-icon">&#128100;</span> Clients
              <span className="card-badge">1 active</span>
              <button
                className="btn-new-client"
                onClick={() => setNewClientOpen(true)}
                title="Onboard a new client"
              >
                + New Client
              </button>
            </div>
            <div className="client-list">
              <div className="client-item">
                <div className="client-avatar client-clearline">CL</div>
                <div className="client-info">
                  <div className="client-name">Clearline Markets</div>
                  <div className="client-sub">Prop trading · Aquas platform</div>
                </div>
                <div className="client-status-pill">Active</div>
              </div>
            </div>
          </div>

          {/* Scheduled Tasks — live from API */}
          <div className="dash-card card-schedules">
            <div className="dash-card-title">
              <span className="card-icon">&#128337;</span> Scheduled Tasks
              <span className="card-badge">{schedules.length > 0 ? `${schedules.length} tasks` : (apiOnline ? "auto" : "--")}</span>
            </div>
            {schedules.length === 0 ? (
              <div className="schedule-list">
                {[
                  { label: "Nikita heartbeat", time: "Every 5 min", dot: "green" },
                  { label: "UI builder heartbeat", time: "Every 10 min", dot: "violet" },
                  { label: "Status sync", time: "Every 10 sec", dot: "blue" },
                  { label: "Task result poll", time: "Every 3 sec", dot: "amber" },
                ].map((item, i) => (
                  <div key={i} className="schedule-item">
                    <div className="schedule-info">
                      <div className="schedule-name">
                        <span className={`schedule-dot color-${item.dot}`}>●</span>
                        {item.label}
                      </div>
                      <div className="schedule-time">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="schedule-list">
                {schedules.slice(0, 5).map((s, i) => {
                  const sched = s.schedule || {};
                  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                  let timeStr = `${String(sched.hour ?? 0).padStart(2, "0")}:${String(sched.minute ?? 0).padStart(2, "0")}`;
                  if (sched.type === "weekly" && sched.dayOfWeek != null) {
                    timeStr = `${dayNames[sched.dayOfWeek]} ${timeStr}`;
                  } else {
                    timeStr = `Daily ${timeStr}`;
                  }
                  return (
                    <ScheduleRunItem key={i} name={s.name || s.key} timeStr={timeStr} scheduleKey={s.key} />
                  );
                })}
              </div>
            )}
          </div>

          {/* Activity Log — shows recent agent task completions + chat */}
          <div className="dash-card card-activity">
            <div className="dash-card-title">
              <span className="card-icon">&#128196;</span> Activity Log
              <span className="card-badge">{agentReports.length + chatMessages.filter(m => m.type === "agent" || m.type === "nikita").length || "--"}</span>
            </div>
            <div className="activity-ticker">
              {(() => {
                // Build unified activity items: agent reports + chat messages
                type ActivityItem = { dot: string; agent: string; text: string; time: string; key: string };
                const items: ActivityItem[] = [];

                // Add agent task reports (most recent completed tasks)
                for (const r of agentReports.slice(0, 4)) {
                  const cfg = FLOOR_CONFIG[r.agentId || r.agent || ""];
                  const agentName = cfg?.name || r.agent || r.agentId || "Agent";
                  const dept = r.agentId ? deptFromAgent(r.agentId) : "dev";
                  const dotColor = dept === "dev" ? "color-blue" : dept === "sales" ? "color-amber" : dept === "creative" ? "color-rose" : dept === "cfo" || dept === "csuite" ? "color-violet" : "color-green";
                  const text = r.result
                    ? typeof r.result === "string" ? r.result : JSON.stringify(r.result)
                    : r.description || "Task complete";
                  const timeStr = r.completedAt
                    ? new Date(r.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "--:--";
                  items.push({ dot: dotColor, agent: agentName, text, time: timeStr, key: `report-${r.agentId}-${r.completedAt}` });
                }

                // Add recent chat messages
                for (const msg of [...chatMessages].filter(m => m.type === "nikita" || m.type === "agent").slice(-3).reverse()) {
                  items.push({
                    dot: msg.type === "agent" ? "color-blue" : "color-violet",
                    agent: msg.type === "agent" ? (msg.agentName || "Agent") : "Nikita",
                    text: msg.text,
                    time: msg.time,
                    key: `chat-${msg.timestamp}`,
                  });
                }

                if (items.length === 0) {
                  return (
                    <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
                      {apiOnline ? "Agents standing by" : "Loading..."}
                    </div>
                  );
                }

                return items.slice(0, 8).map((item) => (
                  <div key={item.key} className="activity-item">
                    <span className={`activity-dot ${item.dot}`}>●</span>
                    <span className="activity-agent">{item.agent}</span>
                    <span className="activity-text">{item.text.length > 48 ? item.text.slice(0, 48) + "…" : item.text}</span>
                    <span className="activity-time">{item.time}</span>
                  </div>
                ));
              })()}
            </div>
          </div>

        </section>
      </main>

      {/* Footer */}
      <div className="footer">
        <span>Open Agency</span> &copy; 2026 &middot; Intelligence at work.
      </div>

      {/* Nikita Chat Sidebar */}
      <NikitaChat
        onSend={handleSendMessage}
        isLoading={chatLoading}
        messages={chatMessages}
        isPolling={chatPolling}
        unreadCount={unreadCount}
        onOpen={() => setUnreadCount(0)}
        agentReports={agentReports}
      />

      {/* New Client Modal */}
      {newClientOpen && (
        <NewClientModal
          onClose={() => setNewClientOpen(false)}
          onSuccess={() => { fetchData(); globalShowToast("Client onboarded — Nikita is briefing the team", "success"); }}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} />
    </>
  );
}
