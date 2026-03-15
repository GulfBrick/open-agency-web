const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.oagencyconsulting.com";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

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
  return res.json();
}

export async function getAgents() {
  const res = await fetchAgency("/api/agents");
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
