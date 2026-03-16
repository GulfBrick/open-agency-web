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
  const res = await fetchAgency("/api/nikita/history");
  return res.json();
}

export async function sendNikitaMessage(message: string) {
  const res = await fetchAgency("/api/nikita/message", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
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
