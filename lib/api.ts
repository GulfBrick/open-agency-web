const API_URL = "https://api.oagencyconsulting.com";
const API_KEY = "oa_live_b051d6501b9db536e386e19539659a93b9bbf98a5401523b50ca49fd859d86cb";

export async function fetchAgency(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_URL}${endpoint}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
    ...(options.headers as Record<string, string>),
  };

  return fetch(url, { ...options, headers });
}

export async function getStatus() {
  const res = await fetchAgency("/api/status");
  if (!res.ok) throw new Error(`Status API error: ${res.status}`);
  return res.json();
}

export async function getAgents() {
  const res = await fetchAgency("/api/agents");
  if (!res.ok) throw new Error(`Agents API error: ${res.status}`);
  return res.json();
}

export async function getNikitaHistory() {
  // Route through Next.js proxy to keep API key server-side
  const res = await fetch("/api/chat/history");
  if (!res.ok) return [];
  return res.json();
}

export async function sendNikitaMessage(message: string) {
  // Route through Next.js proxy to keep API key server-side and avoid CORS
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`Chat API error: ${res.status}`);
  return res.json();
}

export async function getHealth() {
  const res = await fetchAgency("/api/health");
  return res.json();
}

export async function getTaskResults() {
  const res = await fetchAgency("/api/tasks/results");
  if (!res.ok) throw new Error(`Task results API error: ${res.status}`);
  return res.json();
}

export async function getTaskQueue() {
  const res = await fetchAgency("/api/tasks");
  if (!res.ok) throw new Error(`Task queue API error: ${res.status}`);
  return res.json();
}

export async function getWorkflows() {
  const res = await fetchAgency("/api/workflows");
  if (!res.ok) throw new Error(`Workflows API error: ${res.status}`);
  return res.json();
}

export async function getSchedules() {
  const res = await fetchAgency("/api/schedules");
  if (!res.ok) throw new Error(`Schedules API error: ${res.status}`);
  return res.json();
}

export async function approveWorkflow(workflowId: string) {
  const res = await fetchAgency(`/api/workflows/${encodeURIComponent(workflowId)}/approve`, {
    method: "POST",
  });
  return res.json();
}

export async function runSchedule(key: string) {
  const res = await fetchAgency(`/api/schedules/${encodeURIComponent(key)}/run`, {
    method: "POST",
  });
  return res.json();
}

export async function onboardClient(data: {
  name: string;
  industry?: string;
  contactName?: string;
  contactEmail?: string;
  notes?: string;
}) {
  const res = await fetch('/api/clients/onboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getElevenLabsKey(): Promise<string | null> {
  try {
    const res = await fetchAgency("/api/config/elevenlabs");
    if (!res.ok) return null;
    const cfg = await res.json();
    return cfg.apiKey || null;
  } catch {
    return null;
  }
}
