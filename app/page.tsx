"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getStatus, getAgents, sendNikitaMessage, getTaskResults, getTaskQueue } from "@/lib/api";

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

function getBubbleText(agentId: string, status: string) {
  if (agentId === "nikita") return "Running the agency...";
  if (isOnline(status)) return "Working...";
  return "Standing by";
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
}

function AgentPopup({ agent, onClose }: AgentPopupProps) {
  const cfg = FLOOR_CONFIG[agent.id];
  const rank = cfg?.rank || "Agent";
  const avatarClass = AVATAR_CLASS[agent.floor] || "default";
  const initials = getInitials(agent.name);
  const online = isOnline(agent.status);
  const statusText = agent.id === "nikita" ? "Running the agency..." : online ? "Working..." : "Standing by";

  return (
    <div className="agent-popup visible" onClick={(e) => e.stopPropagation()}>
      <div className="popup-header">
        <div className={`popup-avatar ${avatarClass}`}>{initials}</div>
        <div>
          <div className="popup-name">{agent.name}</div>
          <div className="popup-role">{agent.role}</div>
        </div>
      </div>
      <div className="popup-stats">
        <div className="popup-stat">
          <div className="popup-stat-value" style={{ color: "var(--text-dim)", fontSize: "13px" }}>{statusText}</div>
          <div className="popup-stat-label">Status</div>
        </div>
      </div>
      <div className="popup-rank">Rank: <span>{rank}</span></div>
      <button className="popup-dismiss" onClick={onClose} title="Close">✕</button>
    </div>
  );
}

// ─── Agent Desk ─────────────────────────────────────────────────────────────

function AgentDesk({ agent }: { agent: Agent }) {
  const isCeo = agent.floor === "ceo";
  const online = isOnline(agent.status);
  const avatarClass = AVATAR_CLASS[agent.floor] || "default";
  const initials = getInitials(agent.name);
  const firstName = agent.name.split(/[\s-]/)[0];
  const bubbleText = getBubbleText(agent.id, agent.status);
  const [popupOpen, setPopupOpen] = useState(false);

  // Close popup when clicking elsewhere
  useEffect(() => {
    if (!popupOpen) return;
    const handler = () => setPopupOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [popupOpen]);

  return (
    <div className={`agent-desk${isCeo ? " ceo-desk" : ""}${online ? " is-online" : ""}`} style={{ position: "relative" }}>
      <div className="bubble">{bubbleText}</div>
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
      {popupOpen && <AgentPopup agent={agent} onClose={() => setPopupOpen(false)} />}
    </div>
  );
}

// ─── Building Floor ─────────────────────────────────────────────────────────

function BuildingFloor({
  floorDef,
  agents,
}: {
  floorDef: (typeof FLOOR_ORDER)[number];
  agents: Agent[];
}) {
  return (
    <div className={`floor ${floorDef.cssClass}`}>
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
            <AgentDesk key={agent.id} agent={agent} />
          ))}
        </div>
      </div>
    </div>
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

function NikitaChat({
  onSend,
  isLoading,
  messages,
  isPolling,
  unreadCount,
  onOpen,
}: {
  onSend: (msg: string) => void;
  isLoading: boolean;
  messages: ChatMessage[];
  isPolling: boolean;
  unreadCount: number;
  onOpen: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const threadRef = useRef<HTMLDivElement>(null);

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
            {messages.map((msg, i) =>
              msg.type === "agent" ? (
                <AgentBubble key={i} msg={msg} />
              ) : (
                <div key={i} className={`chat-msg ${msg.type}`}>
                  <div className="chat-msg-text">{msg.text}</div>
                  <div className="chat-msg-time">{msg.time}</div>
                </div>
              )
            )}
            {isLoading && (
              <div className="chat-msg nikita">
                <div className="chat-msg-text">Thinking...</div>
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

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>(DEFAULT_AGENTS);
  const [status, setStatus] = useState<StatusData | null>(null);
  const [apiOnline, setApiOnline] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatPolling, setChatPolling] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [taskQueue, setTaskQueue] = useState<Task[]>([]);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const seenResultsRef = useRef<Set<string>>(new Set());

  const loadChatHistory = useCallback(async () => {
    if (historyLoaded) return;
    try {
      const { getNikitaHistory } = await import("@/lib/api");
      const data = await getNikitaHistory();
      const arr = Array.isArray(data) ? data : data?.value ?? data?.messages ?? [];
      if (!arr.length) { setHistoryLoaded(true); return; }
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
      const [statusRes, agentsRes, taskRes] = await Promise.allSettled([getStatus(), getAgents(), getTaskQueue()]);

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
    } catch {
      setApiOnline(false);
    }
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
      setChatMessages((prev) => [...prev, { type: "nikita", text: reply, timestamp: Date.now(), time: replyTime }]);

      // Start polling for agent results
      startPolling(sentAt);
    } catch {
      const errorTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setChatMessages((prev) => [
        ...prev,
        { type: "nikita", text: "Connection to Nikita unavailable. The agency will be online shortly.", timestamp: Date.now(), time: errorTime },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Count online agents
  const onlineCount = agents.filter((a) => isOnline(a.status)).length;

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
    ? `${agents.filter((a) => isOnline(a.status)).length} agents active. Pipeline: ${status.pipeline?.total ?? 0} leads. Revenue: £${status.finances?.revenue ?? 0}. Systems running smoothly.`
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
        <div className="hero-ticker">
          <div className="pulse-dot" />
          <span className="ticker-text">
            <span className="ticker-count">{onlineCount || "--"}</span> agents online
          </span>
        </div>
        <div className="hero-scroll">Scroll</div>
      </section>

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
          <span className="uptime">{status?.systemHealth?.uptimeFormatted || "--"}</span>
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
              return <BuildingFloor key={floorDef.key} floorDef={floorDef} agents={floorAgents} />;
            })}

            {/* GROUND FLOOR — STATS */}
            <div className="ground-floor">
              <div className="ground-stat">
                <div className="ground-stat-icon color-violet">&#9679;</div>
                <div className="ground-stat-value color-violet">
                  {status?.systemHealth?.registeredAgents ?? agents.length}
                </div>
                <div className="ground-stat-label">Agents Online</div>
              </div>
              <div className="ground-stat">
                <div className="ground-stat-icon color-green">&#9670;</div>
                <div className="ground-stat-value color-green">{status?.pipeline?.total ?? 0}</div>
                <div className="ground-stat-label">Pipeline</div>
              </div>
              <div className="ground-stat">
                <div className="ground-stat-icon color-purple">&#163;</div>
                <div className="ground-stat-value color-purple">
                  {status?.finances?.revenue != null ? `\u00A3${status.finances.revenue}` : "\u00A30"}
                </div>
                <div className="ground-stat-label">Revenue</div>
              </div>
              <div className="ground-stat">
                <div className="ground-stat-icon color-amber">&#9889;</div>
                <div className="ground-stat-value color-amber">
                  {status?.systemHealth?.bootCount ?? 0}
                </div>
                <div className="ground-stat-label">Boot Count</div>
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
            </div>
            <div className="finance-grid">
              <div className="finance-item">
                <div className="finance-label">Revenue</div>
                <div className="finance-value color-green">
                  &pound;{status?.finances?.revenue ?? 0}
                </div>
              </div>
              <div className="finance-item">
                <div className="finance-label">Expenses</div>
                <div className="finance-value color-rose">
                  &pound;{status?.finances?.expenses ?? 0}
                </div>
              </div>
              <div className="finance-item">
                <div className="finance-label">Profit</div>
                <div className="finance-value">
                  &pound;{status?.finances?.profit ?? 0}
                </div>
              </div>
              <div className="finance-item">
                <div className="finance-label">Cash Position</div>
                <div className="finance-value color-violet">
                  &pound;{(status?.finances as Record<string, number>)?.cashPosition ?? 0}
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

          {/* Workflows */}
          <div className="dash-card card-workflows">
            <div className="dash-card-title">
              <span className="card-icon">&#128736;</span> Workflows
              <span className="card-badge">
                {taskQueue.filter(t => t.description?.toLowerCase().includes("workflow")).length || "0"}
              </span>
            </div>
            <div className="sprint-list">
              {[
                { label: "Lead → Close pipeline", status: "running", dot: "green" },
                { label: "Content calendar auto-post", status: "paused", dot: "amber" },
                { label: "Dev PR → Deploy cycle", status: "running", dot: "green" },
                { label: "Weekly CFO report", status: "scheduled", dot: "violet" },
              ].map((wf, i) => (
                <div key={i} className="sprint-item">
                  <span className={`sprint-dot color-${wf.dot}`}>●</span>
                  <span className="sprint-label">{wf.label}</span>
                  <span className={`sprint-status color-${wf.dot}`}>{wf.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ROW 3: Clients | Scheduled Tasks | Activity Log */}

          {/* Clients */}
          <div className="dash-card card-clients">
            <div className="dash-card-title">
              <span className="card-icon">&#128100;</span> Clients
              <span className="card-badge">1 active</span>
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

          {/* Scheduled Tasks */}
          <div className="dash-card card-schedules">
            <div className="dash-card-title">
              <span className="card-icon">&#128337;</span> Scheduled Tasks
              <span className="card-badge">{apiOnline ? "auto" : "--"}</span>
            </div>
            <div className="schedule-list">
              {[
                { label: "Nikita heartbeat", interval: "5 min", dot: "green" },
                { label: "UI builder heartbeat", interval: "10 min", dot: "violet" },
                { label: "Status sync", interval: "10 sec", dot: "blue" },
                { label: "Task result poll", interval: "3 sec", dot: "amber" },
              ].map((item, i) => (
                <div key={i} className="schedule-item">
                  <span className={`schedule-dot color-${item.dot}`}>●</span>
                  <span className="schedule-label">{item.label}</span>
                  <span className="schedule-interval">{item.interval}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Log */}
          <div className="dash-card card-activity">
            <div className="dash-card-title">
              <span className="card-icon">&#128196;</span> Activity Log
              <span className="card-badge">{chatMessages.filter(m => m.type === "agent" || m.type === "nikita").length || "--"}</span>
            </div>
            <div className="activity-ticker">
              {chatMessages.length === 0 ? (
                <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
                  {apiOnline ? "Agents standing by" : "Loading..."}
                </div>
              ) : (
                [...chatMessages]
                  .filter(m => m.type === "nikita" || m.type === "agent")
                  .slice(-6)
                  .reverse()
                  .map((msg, i) => (
                    <div key={i} className="activity-item">
                      <span className={`activity-dot ${msg.type === "agent" ? "color-blue" : "color-violet"}`}>●</span>
                      <span className="activity-agent">{msg.type === "agent" ? (msg.agentName || "Agent") : "Nikita"}</span>
                      <span className="activity-text">{msg.text.length > 48 ? msg.text.slice(0, 48) + "…" : msg.text}</span>
                      <span className="activity-time">{msg.time}</span>
                    </div>
                  ))
              )}
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
      />
    </>
  );
}
