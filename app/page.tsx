"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getStatus, getAgents, sendNikitaMessage } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Agent {
  id: string;
  name: string;
  role: string;
  status: string;
  floor: string;
}

interface StatusData {
  status: string;
  agents: number;
  pipeline: number;
  revenue: string;
  uptime: string;
  bootTime?: string;
}

// ─── Agent Config ────────────────────────────────────────────────────────────

const FLOOR_ORDER = ["CEO", "Creative", "Sales", "Dev", "C-Suite"] as const;

const FLOOR_COLORS: Record<string, { from: string; to: string; glow: string }> = {
  CEO: { from: "#8B5CF6", to: "#6D28D9", glow: "rgba(139, 92, 246, 0.25)" },
  Creative: { from: "#F43F5E", to: "#E11D48", glow: "rgba(244, 63, 94, 0.25)" },
  Sales: { from: "#F59E0B", to: "#D97706", glow: "rgba(245, 158, 11, 0.25)" },
  Dev: { from: "#3B82F6", to: "#2563EB", glow: "rgba(59, 130, 246, 0.25)" },
  "C-Suite": { from: "#06B6D4", to: "#0891B2", glow: "rgba(6, 182, 212, 0.25)" },
};

const DEFAULT_AGENTS: Agent[] = [
  { id: "nikita", name: "Nikita", role: "CEO & Strategist", status: "standing-by", floor: "CEO" },
  { id: "mira", name: "Mira", role: "Creative Director", status: "standing-by", floor: "Creative" },
  { id: "ravi", name: "Ravi", role: "Sales Lead", status: "standing-by", floor: "Sales" },
  { id: "zane", name: "Zane", role: "Developer", status: "standing-by", floor: "Dev" },
  { id: "oracle", name: "Oracle", role: "C-Suite Advisor", status: "standing-by", floor: "C-Suite" },
];

// ─── Components ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const isOnline = status === "operational" || status === "online";
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div
        className={`w-2 h-2 rounded-full ${isOnline ? "animate-pulse-glow" : ""}`}
        style={{ background: isOnline ? "#10B981" : "#EF4444" }}
      />
      <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>
        {isOnline ? "Systems Online" : "Connecting..."}
      </span>
    </div>
  );
}

function AgentAvatar({ agent }: { agent: Agent }) {
  const colors = FLOOR_COLORS[agent.floor] || FLOOR_COLORS.Dev;
  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
      style={{
        background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
        boxShadow: `0 4px 12px ${colors.glow}`,
      }}
    >
      {agent.name[0]}
    </div>
  );
}

function FloorRow({ agent, index }: { agent: Agent; index: number }) {
  const colors = FLOOR_COLORS[agent.floor] || FLOOR_COLORS.Dev;
  const isActive = agent.status === "active" || agent.status === "working";

  return (
    <div
      className="animate-slide-up flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 hover:scale-[1.01]"
      style={{
        animationDelay: `${index * 80}ms`,
        background: "var(--bg-card)",
        border: `1px solid ${isActive ? colors.glow : "var(--border-subtle)"}`,
        boxShadow: isActive ? `0 0 20px ${colors.glow}` : "none",
      }}
    >
      <AgentAvatar agent={agent} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{agent.name}</span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>
            {agent.floor}
          </span>
        </div>
        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
          {agent.role}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div
          className={`w-1.5 h-1.5 rounded-full ${isActive ? "animate-pulse-glow" : ""}`}
          style={{ background: isActive ? colors.from : "rgba(255,255,255,0.2)" }}
        />
        <span className="text-[11px] font-medium" style={{ color: isActive ? colors.from : "rgba(255,255,255,0.3)" }}>
          {agent.status === "active" || agent.status === "working" ? "Active" : "Standing by"}
        </span>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  icon,
  index,
}: {
  label: string;
  value: string | number;
  accent: string;
  icon: string;
  index: number;
}) {
  return (
    <div
      className="animate-slide-up flex flex-col gap-2 p-5 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
      style={{
        animationDelay: `${index * 60}ms`,
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
          {label}
        </span>
        <span className="text-base">{icon}</span>
      </div>
      <span className="text-2xl font-bold" style={{ color: accent }}>
        {value}
      </span>
    </div>
  );
}

function ChatBar({
  onSend,
  isLoading,
  lastReply,
}: {
  onSend: (msg: string) => void;
  isLoading: boolean;
  lastReply: string | null;
}) {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
    onSend(message.trim());
    setMessage("");
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "linear-gradient(to top, var(--bg-primary) 60%, transparent)",
        paddingTop: "2rem",
      }}
    >
      <div className="max-w-4xl mx-auto px-4 pb-4">
        {lastReply && (
          <div
            className="animate-slide-up mb-3 p-4 rounded-2xl text-sm leading-relaxed"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white"
                style={{ background: "linear-gradient(135deg, #8B5CF6, #6D28D9)" }}
              >
                N
              </div>
              <span className="text-[11px] font-semibold" style={{ color: "#8B5CF6" }}>
                Nikita
              </span>
            </div>
            {lastReply}
          </div>
        )}
        <form onSubmit={handleSubmit} className="relative">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message Nikita..."
            disabled={isLoading}
            className="w-full h-14 pl-5 pr-14 rounded-2xl text-sm font-medium text-white outline-none transition-all duration-200 placeholder:text-white/25"
            style={{
              background: "var(--bg-input)",
              border: "1px solid var(--border-medium)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.4)";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(139, 92, 246, 0.2)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.3)";
            }}
          />
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-30"
            style={{
              background: message.trim() ? "linear-gradient(135deg, #8B5CF6, #6D28D9)" : "rgba(255,255,255,0.05)",
            }}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>(DEFAULT_AGENTS);
  const [status, setStatus] = useState<StatusData | null>(null);
  const [chatReply, setChatReply] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statusRes, agentsRes] = await Promise.allSettled([
        getStatus(),
        getAgents(),
      ]);

      if (statusRes.status === "fulfilled" && statusRes.value) {
        setStatus(statusRes.value);
        setApiOnline(true);
      }

      if (agentsRes.status === "fulfilled" && Array.isArray(agentsRes.value)) {
        const mapped: Agent[] = agentsRes.value.map((a: Record<string, string>) => ({
          id: a.id || a.name?.toLowerCase() || "",
          name: a.name || "Unknown",
          role: a.role || "",
          status: a.status || "standing-by",
          floor: a.floor || a.department || "Dev",
        }));
        if (mapped.length > 0) setAgents(mapped);
      }
    } catch {
      setApiOnline(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleSendMessage = async (message: string) => {
    setChatLoading(true);
    setChatReply(null);
    try {
      const res = await sendNikitaMessage(message);
      const reply = res.reply || res.message || res.response || JSON.stringify(res);
      setChatReply(reply);

      // Speak via browser TTS as fallback
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(reply);
        utterance.rate = 1;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      setChatReply("Connection to Nikita unavailable. The agency will be online shortly.");
    } finally {
      setChatLoading(false);
    }
  };

  // Sort agents by floor order
  const sortedAgents = [...agents].sort((a, b) => {
    const aIdx = FLOOR_ORDER.indexOf(a.floor as typeof FLOOR_ORDER[number]);
    const bIdx = FLOOR_ORDER.indexOf(b.floor as typeof FLOOR_ORDER[number]);
    return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
  });

  const stats = [
    { label: "Agents", value: status?.agents ?? agents.length, accent: "#8B5CF6", icon: "◆" },
    { label: "Pipeline", value: status?.pipeline ?? 0, accent: "#3B82F6", icon: "◈" },
    { label: "Revenue", value: status?.revenue ?? "$0", accent: "#10B981", icon: "◇" },
    { label: "Boot", value: status?.bootTime ?? status?.uptime ?? "—", accent: "#F59E0B", icon: "◎" },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-6 py-4"
        style={{
          background: "rgba(10, 11, 20, 0.85)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold text-white"
            style={{
              background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
            }}
          >
            OA
          </div>
          <span className="text-sm font-bold text-white tracking-tight hidden sm:block">
            oagencyconsulting.com
          </span>
        </div>

        <h1
          className="absolute left-1/2 -translate-x-1/2 text-xs sm:text-sm font-medium tracking-wide hidden md:block"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          Intelligence at work.
        </h1>

        <StatusBadge status={apiOnline ? "operational" : "offline"} />
      </header>

      {/* ── Content ── */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 pt-8 pb-32">
        {/* Building Title */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
            style={{ background: "rgba(139, 92, 246, 0.08)", border: "1px solid rgba(139, 92, 246, 0.15)" }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse-glow" style={{ background: "#8B5CF6" }} />
            <span className="text-[11px] font-semibold tracking-wider uppercase" style={{ color: "#8B5CF6" }}>
              The Building
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold gradient-text">
            Open Agency HQ
          </h2>
          <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.35)" }}>
            Five autonomous agents. One agency. Zero humans.
          </p>
        </div>

        {/* Agent Floors */}
        <div className="flex flex-col gap-3 mb-10">
          {sortedAgents.map((agent, i) => (
            <FloorRow key={agent.id} agent={agent} index={i} />
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} {...stat} index={i} />
          ))}
        </div>
      </main>

      {/* ── Chat Bar ── */}
      <ChatBar onSend={handleSendMessage} isLoading={chatLoading} lastReply={chatReply} />
    </div>
  );
}
