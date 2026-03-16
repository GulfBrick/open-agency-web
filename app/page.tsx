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
  agents: { id: string; name: string; role: string; status: string }[];
  pipeline: { total: number; hot: number; warm: number; cold: number };
  finances: { revenue: number; expenses: number; profit: number };
  systemHealth: { uptime: number; uptimeFormatted: string; bootCount: number; registeredAgents: number };
}

// ─── Agent Config ────────────────────────────────────────────────────────────

const FLOOR_ORDER = ["CEO", "Creative", "Sales", "Dev", "C-Suite"] as const;

const FLOOR_META: Record<string, {
  number: string;
  icon: string;
  labelColor: string;
  borderGradient: string;
  glowColor: string;
  badgeColor: string;
  windowGlow: string;
}> = {
  CEO: {
    number: "05",
    icon: "\uD83D\uDC51",
    labelColor: "transparent",
    borderGradient: "linear-gradient(180deg, #F59E0B, #7C3AED, rgba(124, 58, 237, 0.2))",
    glowColor: "rgba(245, 158, 11, 0.06)",
    badgeColor: "rgba(245, 158, 11, 0.20)",
    windowGlow: "linear-gradient(135deg, rgba(245, 158, 11, 0.06), rgba(124, 58, 237, 0.06))",
  },
  Creative: {
    number: "04",
    icon: "\uD83C\uDFA8",
    labelColor: "#F43F5E",
    borderGradient: "linear-gradient(180deg, #F43F5E, rgba(244, 63, 94, 0.2))",
    glowColor: "rgba(244, 63, 94, 0.25)",
    badgeColor: "rgba(244, 63, 94, 0.15)",
    windowGlow: "#F43F5E",
  },
  Sales: {
    number: "03",
    icon: "\uD83D\uDCBC",
    labelColor: "#F59E0B",
    borderGradient: "linear-gradient(180deg, #F59E0B, rgba(245, 158, 11, 0.2))",
    glowColor: "rgba(245, 158, 11, 0.25)",
    badgeColor: "rgba(245, 158, 11, 0.15)",
    windowGlow: "#F59E0B",
  },
  Dev: {
    number: "02",
    icon: "\uD83D\uDE80",
    labelColor: "#3B82F6",
    borderGradient: "linear-gradient(180deg, #3B82F6, rgba(59, 130, 246, 0.2))",
    glowColor: "rgba(59, 130, 246, 0.25)",
    badgeColor: "rgba(59, 130, 246, 0.15)",
    windowGlow: "#3B82F6",
  },
  "C-Suite": {
    number: "01",
    icon: "\uD83D\uDC51",
    labelColor: "#7C3AED",
    borderGradient: "linear-gradient(180deg, #7C3AED, rgba(124, 58, 237, 0.2))",
    glowColor: "rgba(124, 58, 237, 0.25)",
    badgeColor: "rgba(124, 58, 237, 0.15)",
    windowGlow: "#7C3AED",
  },
};

const AVATAR_GRADIENT: Record<string, { bg: string; shadow: string }> = {
  CEO:        { bg: "linear-gradient(135deg, #7C3AED, #A78BFA, #F59E0B)", shadow: "0 0 24px rgba(124, 58, 237, 0.4), 0 0 48px rgba(245, 158, 11, 0.15)" },
  "C-Suite":  { bg: "linear-gradient(135deg, #7C3AED, #A78BFA)", shadow: "0 0 12px rgba(124, 58, 237, 0.3)" },
  Dev:        { bg: "linear-gradient(135deg, #3B82F6, #60A5FA)", shadow: "0 0 12px rgba(59, 130, 246, 0.3)" },
  Sales:      { bg: "linear-gradient(135deg, #F59E0B, #FBBF24)", shadow: "0 0 12px rgba(245, 158, 11, 0.3)" },
  Creative:   { bg: "linear-gradient(135deg, #F43F5E, #FB7185)", shadow: "0 0 12px rgba(244, 63, 94, 0.3)" },
};

const DEFAULT_AGENTS: Agent[] = [
  { id: "nikita", name: "Nikita", role: "CEO", status: "standing-by", floor: "CEO" },
  { id: "marcus", name: "Marcus", role: "CFO", status: "standing-by", floor: "C-Suite" },
  { id: "zara", name: "Zara", role: "CTO", status: "standing-by", floor: "C-Suite" },
  { id: "priya", name: "Priya", role: "CMO", status: "standing-by", floor: "C-Suite" },
  { id: "kai", name: "Kai", role: "Dev Lead", status: "standing-by", floor: "Dev" },
  { id: "architect", name: "Architect", role: "Architect", status: "standing-by", floor: "Dev" },
  { id: "frontend", name: "Frontend", role: "Frontend Dev", status: "standing-by", floor: "Dev" },
  { id: "backend", name: "Backend", role: "Backend Dev", status: "standing-by", floor: "Dev" },
  { id: "fullstack", name: "Fullstack", role: "Fullstack Dev", status: "standing-by", floor: "Dev" },
  { id: "qa", name: "QA", role: "QA Engineer", status: "standing-by", floor: "Dev" },
  { id: "code-reviewer", name: "Code Reviewer", role: "Code Reviewer", status: "standing-by", floor: "Dev" },
  { id: "jordan", name: "Jordan", role: "Sales Lead", status: "standing-by", floor: "Sales" },
  { id: "closer", name: "Closer", role: "Closer", status: "standing-by", floor: "Sales" },
  { id: "lead-qualifier", name: "Lead Qualifier", role: "Lead Qualifier", status: "standing-by", floor: "Sales" },
  { id: "follow-up", name: "Follow-Up", role: "Follow-Up", status: "standing-by", floor: "Sales" },
  { id: "proposal", name: "Proposal", role: "Proposal Writer", status: "standing-by", floor: "Sales" },
  { id: "nova", name: "Nova", role: "Creative Director", status: "standing-by", floor: "Creative" },
  { id: "iris", name: "Iris", role: "Designer", status: "standing-by", floor: "Creative" },
  { id: "finn", name: "Finn", role: "Video Producer", status: "standing-by", floor: "Creative" },
  { id: "jade", name: "Jade", role: "Social Media", status: "standing-by", floor: "Creative" },
  { id: "ash", name: "Ash", role: "Copywriter", status: "standing-by", floor: "Creative" },
];

const BUBBLE_TEXT: Record<string, string> = {
  nikita: "Running the agency...",
};

// ─── Rooftop Star Particles ──────────────────────────────────────────────────

function RooftopParticles() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Floating particles
    for (let i = 0; i < 30; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      p.style.left = Math.random() * 100 + "%";
      p.style.bottom = Math.random() * 40 + "%";
      p.style.animationDuration = (4 + Math.random() * 6) + "s";
      p.style.animationDelay = (Math.random() * 8) + "s";
      const size = (1.5 + Math.random() * 2.5) + "px";
      p.style.width = size;
      p.style.height = size;
      p.style.opacity = String(0.4 + Math.random() * 0.6);
      container.appendChild(p);
    }

    // Twinkling stars
    for (let i = 0; i < 20; i++) {
      const s = document.createElement("div");
      s.className = "particle twinkle star";
      s.style.left = Math.random() * 100 + "%";
      s.style.top = Math.random() * 70 + "%";
      const size = (2 + Math.random() * 3) + "px";
      s.style.width = size;
      s.style.height = size;
      s.style.animationDuration = (2 + Math.random() * 4) + "s";
      s.style.animationDelay = (Math.random() * 5) + "s";
      container.appendChild(s);
    }

    return () => { container.innerHTML = ""; };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 0,
      }}
    />
  );
}

// ─── Agent Desk (building-style) ─────────────────────────────────────────────

function AgentDesk({ agent, index }: { agent: Agent; index: number }) {
  const isCeo = agent.floor === "CEO";
  const isOnline = agent.status === "active" || agent.status === "working" || agent.status === "online";
  const grad = AVATAR_GRADIENT[agent.floor] || AVATAR_GRADIENT.Dev;
  const bubbleText = BUBBLE_TEXT[agent.id] || (isOnline ? "Working..." : "Standing by");
  const initials = agent.name.split(/[\s()]+/).filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        minWidth: isCeo ? 100 : 80,
        zIndex: 1,
        animation: `agentBreathe 4s ease-in-out infinite`,
        animationDelay: `${(index % 7) * 0.4}s`,
      }}
    >
      {/* Speech bubble */}
      <div
        style={{
          position: "relative",
          background: "rgba(15, 22, 35, 0.85)",
          backdropFilter: "blur(12px)",
          border: isCeo ? "1px solid rgba(245, 158, 11, 0.12)" : "1px solid rgba(255, 255, 255, 0.06)",
          borderRadius: 10,
          padding: "6px 12px",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--text-dim)",
          maxWidth: isCeo ? 200 : 150,
          textAlign: "center",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          marginBottom: 8,
          animation: `bubbleFade 5s ease-in-out infinite`,
          animationDelay: `${index * 0.8}s`,
        }}
      >
        {bubbleText}
        <div
          style={{
            position: "absolute",
            bottom: -5,
            left: "50%",
            transform: "translateX(-50%)",
            width: 0, height: 0,
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: "5px solid rgba(15, 22, 35, 0.85)",
          }}
        />
      </div>

      {/* Avatar */}
      <div
        style={{
          width: isCeo ? 60 : 44,
          height: isCeo ? 60 : 44,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-sans)",
          fontWeight: 700,
          fontSize: isCeo ? 18 : 14,
          color: "#fff",
          background: grad.bg,
          backgroundSize: isCeo ? "200% 200%" : undefined,
          animation: isCeo ? "ceoAvatarShift 4s ease-in-out infinite" : undefined,
          boxShadow: isOnline
            ? `0 0 0 3px rgba(16, 185, 129, 0.25), 0 0 16px rgba(16, 185, 129, 0.15), ${grad.shadow}`
            : grad.shadow,
          position: "relative",
          transition: "transform 0.3s, box-shadow 0.3s",
          cursor: "pointer",
          opacity: isOnline ? 1 : 0.45,
          filter: isOnline ? undefined : "grayscale(0.4)",
        }}
      >
        {initials}
        {/* Status indicator dot */}
        <div
          style={{
            position: "absolute",
            bottom: 0, right: 0,
            width: isCeo ? 12 : 10,
            height: isCeo ? 12 : 10,
            borderRadius: "50%",
            border: "2px solid var(--bg)",
            background: isOnline ? "var(--green)" : "var(--text-muted)",
            boxShadow: isOnline ? "0 0 6px rgba(16, 185, 129, 0.6)" : "none",
            animation: isOnline ? "pulse-glow 2s ease-in-out infinite" : "none",
          }}
        />
      </div>

      {/* Name */}
      <div
        style={{
          marginTop: 6,
          fontFamily: "var(--font-sans)",
          fontSize: isCeo ? 13 : 11,
          fontWeight: isCeo ? 700 : 600,
          color: "var(--text-primary)",
          textAlign: "center",
          whiteSpace: "nowrap",
          maxWidth: isCeo ? 100 : 72,
          overflow: "hidden",
          textOverflow: "ellipsis",
          ...(isCeo ? {
            background: "linear-gradient(135deg, #F59E0B, #A78BFA)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          } : {}),
        }}
      >
        {agent.name}
      </div>

      {/* Role */}
      <div style={{ fontSize: 9, color: "var(--text-muted)", textAlign: "center", marginTop: 1 }}>
        {agent.role}
      </div>

      {/* Desk platform */}
      <div
        style={{
          width: isCeo ? 76 : 64,
          height: 6,
          marginTop: 4,
          borderRadius: 3,
          background: isCeo
            ? "linear-gradient(90deg, rgba(245, 158, 11, 0.06), rgba(124, 58, 237, 0.06))"
            : "rgba(255, 255, 255, 0.035)",
          border: isCeo
            ? "1px solid rgba(245, 158, 11, 0.08)"
            : "1px solid rgba(255, 255, 255, 0.025)",
        }}
      />
    </div>
  );
}

// ─── Building Floor ──────────────────────────────────────────────────────────

function BuildingFloor({ floorName, agents, startIndex }: { floorName: string; agents: Agent[]; startIndex: number }) {
  const meta = FLOOR_META[floorName] || FLOOR_META.Dev;
  const isCeo = floorName === "CEO";

  return (
    <div
      style={{
        borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
        position: "relative",
        transition: "background 0.3s",
        background: isCeo ? "linear-gradient(135deg, rgba(245, 158, 11, 0.03), rgba(124, 58, 237, 0.03))" : undefined,
      }}
    >
      {/* Floor separator gradient line */}
      <div
        style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: 3,
          background: "linear-gradient(90deg, transparent 0%, rgba(124, 58, 237, 0.06) 10%, rgba(255, 255, 255, 0.07) 30%, rgba(255, 255, 255, 0.09) 50%, rgba(255, 255, 255, 0.07) 70%, rgba(124, 58, 237, 0.06) 90%, transparent 100%)",
        }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "140px 1fr",
          minHeight: isCeo ? 170 : 150,
        }}
      >
        {/* Floor label (left column) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            padding: "20px 16px 20px 20px",
            borderRight: "1px solid rgba(255, 255, 255, 0.03)",
            position: "relative",
          }}
        >
          {/* Coloured left border strip */}
          <div
            style={{
              position: "absolute",
              top: 0, left: 0,
              width: 4, height: "100%",
              background: meta.borderGradient,
            }}
          />

          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 32,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: -1,
              marginBottom: 4,
              color: meta.badgeColor,
            }}
          >
            {meta.number}
          </div>
          <div style={{ fontSize: 22, marginBottom: 4, filter: "saturate(1.2)" }}>
            {meta.icon}
          </div>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 10,
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: 2,
              marginBottom: 4,
            }}
          >
            Floor {meta.number}
          </div>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: -0.3,
              ...(isCeo ? {
                background: "linear-gradient(135deg, #F59E0B, #A78BFA)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              } : {
                color: meta.labelColor,
              }),
            }}
          >
            {isCeo ? `CEO \u00B7 Nikita \uD83D\uDC51` : floorName}
          </div>
        </div>

        {/* Agent desks (right column) */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 24,
            padding: "20px 24px",
            position: "relative",
          }}
        >
          {/* Window glow */}
          <div
            style={{
              position: "absolute",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: "80%", height: "70%",
              borderRadius: 8,
              pointerEvents: "none",
              opacity: 0.04,
              zIndex: 0,
              background: meta.windowGlow,
              animation: "pulse-glow 6s ease-in-out infinite",
            }}
          />

          {agents.map((agent, i) => (
            <AgentDesk key={agent.id} agent={agent} index={startIndex + i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Ground Floor Stats ──────────────────────────────────────────────────────

function GroundStats({ stats }: { stats: { icon: string; value: string | number; label: string; color: string }[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 1,
        background: "rgba(255, 255, 255, 0.02)",
        borderTop: "2px solid rgba(124, 58, 237, 0.08)",
      }}
    >
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          style={{
            padding: "24px 20px",
            background: "rgba(15, 22, 35, 0.7)",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative circle glow */}
          <div
            style={{
              position: "absolute",
              top: -30, right: -30,
              width: 80, height: 80,
              borderRadius: "50%",
              opacity: 0.05,
              pointerEvents: "none",
              background: stat.color,
            }}
          />
          <div style={{ fontSize: 18, marginBottom: 8, color: stat.color }}>{stat.icon}</div>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: -1,
              lineHeight: 1,
              color: stat.color,
            }}
          >
            {stat.value}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              fontWeight: 500,
              marginTop: 4,
              letterSpacing: 0.3,
            }}
          >
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Chat Bar ────────────────────────────────────────────────────────────────

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
      style={{
        position: "fixed",
        bottom: 0, left: 0, right: 0,
        zIndex: 50,
        background: "linear-gradient(to top, var(--bg) 60%, transparent)",
        paddingTop: "2rem",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px 16px" }}>
        {lastReply && (
          <div
            className="animate-slide-up"
            style={{
              marginBottom: 12,
              padding: 16,
              borderRadius: 16,
              fontSize: 13,
              lineHeight: 1.6,
              background: "var(--bg-card)",
              border: "1px solid var(--card-border)",
              color: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div
                style={{
                  width: 24, height: 24,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#fff",
                  background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
                }}
              >
                N
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#7C3AED" }}>Nikita</span>
            </div>
            {lastReply}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ position: "relative" }}>
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message Nikita..."
            disabled={isLoading}
            style={{
              width: "100%",
              height: 56,
              paddingLeft: 20,
              paddingRight: 56,
              borderRadius: 16,
              fontSize: 14,
              fontWeight: 500,
              color: "#fff",
              outline: "none",
              background: "rgba(15, 22, 35, 0.8)",
              border: "1px solid rgba(124, 58, 237, 0.12)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              fontFamily: "var(--font-sans)",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(124, 58, 237, 0.35)";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.3), 0 0 16px rgba(124, 58, 237, 0.06)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(124, 58, 237, 0.12)";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.3)";
            }}
          />
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            style={{
              position: "absolute",
              right: 8, top: "50%",
              transform: "translateY(-50%)",
              width: 40, height: 40,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: message.trim() ? "pointer" : "default",
              background: message.trim() ? "linear-gradient(135deg, #7C3AED, #6D28D9)" : "rgba(255,255,255,0.05)",
              transition: "all 0.2s",
              opacity: !message.trim() || isLoading ? 0.4 : 1,
            }}
          >
            {isLoading ? (
              <div
                style={{
                  width: 16, height: 16,
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
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
      } else {
        setApiOnline(false);
      }

      if (agentsRes.status === "fulfilled" && Array.isArray(agentsRes.value)) {
        const mapped: Agent[] = agentsRes.value.map((a: Record<string, unknown>) => ({
          id: typeof a.id === 'string' ? a.id : String(a.id || a.name || ""),
          name: typeof a.name === 'string' ? a.name : "Unknown",
          role: typeof a.role === 'string' ? a.role : "",
          status: typeof a.status === 'string' ? a.status : "standing-by",
          floor: typeof a.floor === 'string' ? a.floor : (typeof a.department === 'string' ? a.department : "Dev"),
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

  // Group agents by floor in order
  const floorGroups: { floor: string; agents: Agent[] }[] = [];
  for (const floor of FLOOR_ORDER) {
    const floorAgents = agents.filter((a) => a.floor === floor);
    if (floorAgents.length > 0) {
      floorGroups.push({ floor, agents: floorAgents });
    }
  }
  const knownFloors = new Set<string>(FLOOR_ORDER);
  const extraAgents = agents.filter((a) => !knownFloors.has(a.floor));
  if (extraAgents.length > 0) {
    floorGroups.push({ floor: "Other", agents: extraAgents });
  }

  const groundStats = [
    { icon: "\u25CF", value: status?.systemHealth?.registeredAgents ?? agents.length, label: "Agents Online", color: "#7C3AED" },
    { icon: "\u25C6", value: status?.pipeline?.total ?? 0, label: "Pipeline", color: "#10B981" },
    { icon: "\u00A3", value: status?.finances?.revenue != null ? `\u00A3${status.finances.revenue}` : "\u00A30", label: "Revenue", color: "#A78BFA" },
    { icon: "\u26A1", value: status?.systemHealth?.bootCount ?? 0, label: "Boot Count", color: "#F59E0B" },
  ];

  let runningIndex = 0;

  return (
    <>
      {/* Top gradient rainbow bar */}
      <div className="top-gradient-bar" />

      {/* Scanline overlay */}
      <div className="scanline-overlay" />

      {/* Animated dot grid background */}
      <div className="bg-grid" />

      {/* Main content wrapper */}
      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
        {/* ── Sticky Header ── */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 40px",
            borderBottom: "1px solid rgba(124, 58, 237, 0.08)",
            background: "rgba(10, 11, 20, 0.8)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 38, height: 38,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 800,
                color: "#fff",
                background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
              }}
            >
              OA
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 17, fontWeight: 700, letterSpacing: -0.5, color: "var(--text-primary)" }}>
                Open Agency
              </div>
              <div style={{ fontSize: 10, fontWeight: 500, color: "var(--violet-dim)", letterSpacing: 1.5, textTransform: "uppercase" }}>
                Intelligence at work
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 16px",
                borderRadius: 24,
                fontSize: 12,
                fontWeight: 600,
                background: apiOnline ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
                color: apiOnline ? "var(--green)" : "#EF4444",
                border: `1px solid ${apiOnline ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)"}`,
              }}
            >
              <div
                style={{
                  width: 8, height: 8,
                  borderRadius: "50%",
                  background: apiOnline ? "var(--green)" : "#EF4444",
                  boxShadow: apiOnline ? "0 0 8px rgba(16, 185, 129, 0.6)" : "none",
                  animation: apiOnline ? "pulse-glow 2s ease-in-out infinite" : "none",
                }}
              />
              <span>{apiOnline ? "Systems Online" : "Connecting..."}</span>
            </div>
          </div>
        </header>

        {/* ── Building ── */}
        <main style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 40px", position: "relative", zIndex: 1 }}>
          <div
            style={{
              position: "relative",
              borderRadius: "4px 4px 0 0",
              overflow: "hidden",
              background: "rgba(15, 22, 35, 0.4)",
              border: "1px solid rgba(124, 58, 237, 0.12)",
              animation: "buildingBreathe 8s ease-in-out infinite",
            }}
          >
            {/* Building panel texture overlay */}
            <div
              style={{
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 0,
                pointerEvents: "none",
                backgroundImage: "linear-gradient(0deg, rgba(124, 58, 237, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124, 58, 237, 0.02) 1px, transparent 1px)",
                backgroundSize: "100% 28px, 60px 100%",
                opacity: 0.6,
              }}
            />

            {/* Building outer frame accent */}
            <div
              style={{
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 0,
                pointerEvents: "none",
                border: "2px solid rgba(124, 58, 237, 0.08)",
                borderRadius: "4px 4px 0 0",
              }}
            />

            {/* Corner accents */}
            {[
              { top: -1, left: -1, borderTop: "3px solid rgba(124, 58, 237, 0.35)", borderLeft: "3px solid rgba(124, 58, 237, 0.35)", borderRadius: "4px 0 0 0" },
              { top: -1, right: -1, borderTop: "3px solid rgba(124, 58, 237, 0.35)", borderRight: "3px solid rgba(124, 58, 237, 0.35)", borderRadius: "0 4px 0 0" },
              { bottom: -1, left: -1, borderBottom: "3px solid rgba(124, 58, 237, 0.35)", borderLeft: "3px solid rgba(124, 58, 237, 0.35)" },
              { bottom: -1, right: -1, borderBottom: "3px solid rgba(124, 58, 237, 0.35)", borderRight: "3px solid rgba(124, 58, 237, 0.35)" },
            ].map((style, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: 20, height: 20,
                  zIndex: 2,
                  pointerEvents: "none",
                  ...style,
                } as React.CSSProperties}
              />
            ))}

            {/* ── Rooftop ── */}
            <div
              style={{
                background: "linear-gradient(180deg, rgba(124, 58, 237, 0.18) 0%, rgba(15, 22, 35, 0.8) 100%)",
                padding: "56px 36px 40px",
                textAlign: "center",
                borderBottom: "2px solid rgba(124, 58, 237, 0.15)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <RooftopParticles />

              {/* Antenna accent */}
              <div
                style={{
                  position: "absolute",
                  top: 0, left: "50%",
                  transform: "translateX(-50%)",
                  width: 2, height: 16,
                  background: "linear-gradient(180deg, var(--violet), transparent)",
                }}
              />

              {/* Glow orb */}
              <div
                style={{
                  position: "absolute",
                  top: "-40%", left: "30%",
                  width: 300, height: 300,
                  background: "radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />

              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 56,
                  fontWeight: 800,
                  letterSpacing: -3,
                  lineHeight: 1,
                  position: "relative",
                  zIndex: 1,
                  marginBottom: 4,
                }}
              >
                <span className="gradient-text" style={{ filter: "drop-shadow(0 0 20px rgba(124, 58, 237, 0.3))" }}>
                  OA
                </span>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 26,
                  fontWeight: 700,
                  letterSpacing: -1,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <span className="gradient-text">Open Agency</span>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--violet)",
                  marginTop: 8,
                  letterSpacing: 1,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                Intelligence at work.
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 20,
                  padding: "6px 18px",
                  borderRadius: 100,
                  background: apiOnline ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
                  border: `1px solid ${apiOnline ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)"}`,
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  fontWeight: 500,
                  color: apiOnline ? "var(--green)" : "#EF4444",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    width: 7, height: 7,
                    borderRadius: "50%",
                    background: apiOnline ? "var(--green)" : "#EF4444",
                    boxShadow: apiOnline ? "0 0 8px rgba(16, 185, 129, 0.5)" : "none",
                    animation: apiOnline ? "pulse-glow 2s ease-in-out infinite" : "none",
                  }}
                />
                <span>{apiOnline ? "All Systems Operational" : "Connecting..."}</span>
              </div>
            </div>

            {/* ── Building Floors ── */}
            {floorGroups.map((group) => {
              const section = (
                <BuildingFloor
                  key={group.floor}
                  floorName={group.floor}
                  agents={group.agents}
                  startIndex={runningIndex}
                />
              );
              runningIndex += group.agents.length;
              return section;
            })}

            {/* ── Ground Floor Stats ── */}
            <GroundStats stats={groundStats} />
          </div>

          {/* ── Building Foundation ── */}
          <div
            style={{
              background: "linear-gradient(180deg, rgba(15, 22, 35, 0.6) 0%, rgba(10, 11, 20, 0.95) 100%)",
              borderTop: "3px solid rgba(124, 58, 237, 0.12)",
              padding: "6px 0 0",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0, left: "10%", right: "10%",
                height: 1,
                background: "linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.15), transparent)",
              }}
            />
            <div
              style={{
                height: 8,
                background: "repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.02) 0px, rgba(255, 255, 255, 0.02) 20px, rgba(255, 255, 255, 0.01) 20px, rgba(255, 255, 255, 0.01) 40px)",
              }}
            />
            <div
              style={{
                textAlign: "center",
                padding: "16px 20px",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--text-muted)",
                background: "rgba(10, 11, 20, 0.8)",
              }}
            >
              <span style={{ color: "var(--violet-dim)" }}>Open Agency</span> &copy; 2026 &middot; Intelligence at work.
            </div>
          </div>

          {/* spacer for chat bar */}
          <div style={{ height: 120 }} />
        </main>

        {/* ── Chat Bar ── */}
        <ChatBar onSend={handleSendMessage} isLoading={chatLoading} lastReply={chatReply} />
      </div>
    </>
  );
}
