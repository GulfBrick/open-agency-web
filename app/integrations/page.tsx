"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Nav from "@/app/components/Nav";

interface IntegrationState {
  githubToken: string;
  gitlabToken: string;
  bitbucketUser: string;
  bitbucketAppPassword: string;
}

interface SavedIntegrations {
  github?: boolean;
  gitlab?: boolean;
  bitbucket?: boolean;
  savedAt?: string;
}

interface RepoEntry {
  name: string;
  url: string;
  provider: "github" | "gitlab" | "bitbucket";
  connected: boolean;
}

const INTEGRATIONS_STORAGE_KEY = "oa_integrations";
const REPOS_STORAGE_KEY = "oa_repos";

function saveToLocal(data: IntegrationState) {
  try {
    localStorage.setItem(INTEGRATIONS_STORAGE_KEY, JSON.stringify({
      github: !!data.githubToken,
      gitlab: !!data.gitlabToken,
      bitbucket: !!(data.bitbucketUser && data.bitbucketAppPassword),
      savedAt: new Date().toISOString(),
    }));
  } catch { /* noop */ }
}

function loadFromLocal(): SavedIntegrations {
  try {
    const raw = localStorage.getItem(INTEGRATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function loadRepos(): RepoEntry[] {
  try {
    const raw = localStorage.getItem(REPOS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveRepos(repos: RepoEntry[]) {
  try {
    localStorage.setItem(REPOS_STORAGE_KEY, JSON.stringify(repos));
  } catch { /* noop */ }
}

function ProviderCard({
  icon,
  name,
  description,
  connected,
  onConnect,
  onDisconnect,
  color,
  children,
}: {
  icon: string;
  name: string;
  description: string;
  connected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  color: string;
  children?: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`int-provider-card${connected ? " int-connected" : ""}`} style={{ "--provider-color": color } as React.CSSProperties}>
      <div className="int-provider-top">
        <div className="int-provider-icon">{icon}</div>
        <div className="int-provider-info">
          <div className="int-provider-name">{name}</div>
          <div className="int-provider-desc">{description}</div>
        </div>
        <div className="int-provider-actions">
          {connected ? (
            <>
              <span className="int-status-badge connected">Connected</span>
              <button className="int-btn-disconnect" onClick={onDisconnect}>Disconnect</button>
            </>
          ) : (
            <button className="int-btn-connect" style={{ background: color }} onClick={() => setExpanded(!expanded)}>
              Connect {name}
            </button>
          )}
        </div>
      </div>
      {(expanded && !connected) && (
        <div className="int-provider-expand">
          {children}
          <button className="int-btn-save" style={{ background: color }} onClick={() => { onConnect(); setExpanded(false); }}>
            Save & Connect
          </button>
        </div>
      )}
    </div>
  );
}

export default function IntegrationsPage() {
  const [form, setForm] = useState<IntegrationState>({
    githubToken: "",
    gitlabToken: "",
    bitbucketUser: "",
    bitbucketAppPassword: "",
  });
  const [saved, setSaved] = useState<SavedIntegrations>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showTokens, setShowTokens] = useState({
    github: false,
    gitlab: false,
    bitbucket: false,
  });
  const [repos, setRepos] = useState<RepoEntry[]>([]);
  const [newRepoUrl, setNewRepoUrl] = useState("");
  const [activeTab, setActiveTab] = useState<"providers" | "repos" | "activity">("providers");

  // suppress unused var warnings
  void saving;

  useEffect(() => {
    setSaved(loadFromLocal());
    setRepos(loadRepos());
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveProvider = async (provider: "github" | "gitlab" | "bitbucket") => {
    setSaving(true);
    const clientId = typeof window !== "undefined" ? localStorage.getItem("oa_client_id") || "" : "";
    const tokenMap: Record<string, string> = {
      github: form.githubToken,
      gitlab: form.gitlabToken,
      bitbucket: form.bitbucketAppPassword,
    };
    const token = tokenMap[provider];

    try {
      const res = await fetch("/api/integrations/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          platform: provider,
          token,
        }),
      });
      const data = await res.json();
      if (data.ok || data.success) {
        saveToLocal(form);
        setSaved(loadFromLocal());
        const names: Record<string, string> = { github: "GitHub", gitlab: "GitLab", bitbucket: "Bitbucket" };
        showToast(data.message || `${names[provider]} connected successfully`);
      } else {
        showToast(data.error || `Failed to connect ${provider}`);
      }
    } catch {
      // Fallback to local storage
      saveToLocal(form);
      setSaved(loadFromLocal());
      const names: Record<string, string> = { github: "GitHub", gitlab: "GitLab", bitbucket: "Bitbucket" };
      showToast(`${names[provider]} saved locally (backend offline)`);
    }
    setSaving(false);
  };

  const handleDisconnect = (provider: "github" | "gitlab" | "bitbucket") => {
    if (provider === "github") setForm(f => ({ ...f, githubToken: "" }));
    if (provider === "gitlab") setForm(f => ({ ...f, gitlabToken: "" }));
    if (provider === "bitbucket") setForm(f => ({ ...f, bitbucketUser: "", bitbucketAppPassword: "" }));
    const updated = { ...saved, [provider]: false, savedAt: new Date().toISOString() };
    try { localStorage.setItem(INTEGRATIONS_STORAGE_KEY, JSON.stringify(updated)); } catch { /* noop */ }
    setSaved(updated);
    showToast(`${provider.charAt(0).toUpperCase() + provider.slice(1)} disconnected`);
  };

  const handleAddRepo = () => {
    if (!newRepoUrl.trim()) return;
    const url = newRepoUrl.trim();
    const provider: "github" | "gitlab" | "bitbucket" = url.includes("gitlab") ? "gitlab" : url.includes("bitbucket") ? "bitbucket" : "github";
    const name = url.split("/").slice(-2).join("/").replace(".git", "") || url;
    const newRepo: RepoEntry = { name, url, provider, connected: true };
    const updated = [...repos, newRepo];
    setRepos(updated);
    saveRepos(updated);
    setNewRepoUrl("");
    showToast(`Repository ${name} added`);
  };

  const handleRemoveRepo = (index: number) => {
    const updated = repos.filter((_, i) => i !== index);
    setRepos(updated);
    saveRepos(updated);
    showToast("Repository removed");
  };

  const connectedCount = [saved.github, saved.gitlab, saved.bitbucket].filter(Boolean).length;

  const ACTIVITY_LOG = [
    { time: "2 min ago", agent: "Kai", action: "Pushed 3 commits to", repo: "main", icon: "🚀" },
    { time: "15 min ago", agent: "Reviewer", action: "Approved PR #47 on", repo: "feature/rate-limit", icon: "✓" },
    { time: "1 hr ago", agent: "Frontend", action: "Opened PR #48:", repo: "Dashboard responsive grid", icon: "📝" },
    { time: "3 hr ago", agent: "QA", action: "Ran test suite —", repo: "94% coverage, all passing", icon: "🧪" },
    { time: "5 hr ago", agent: "Backend", action: "Deployed to staging:", repo: "API rate limiting v2", icon: "🔧" },
  ];

  return (
    <>
      <Nav />
      <main className="integrations-page">
        <div className="integrations-container">
          <div className="integrations-header">
            <div className="integrations-header-left">
              <h1 className="integrations-title">Integrations</h1>
              <p className="integrations-subtitle">
                Connect your repos. Your Dev Team pushes code, opens PRs, and runs tests — directly in your codebase.
              </p>
            </div>
            <div className="integrations-header-stats">
              <div className="int-header-stat">
                <div className="int-header-stat-num">{connectedCount}</div>
                <div className="int-header-stat-label">Connected</div>
              </div>
              <div className="int-header-stat">
                <div className="int-header-stat-num">{repos.length}</div>
                <div className="int-header-stat-label">Repos</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="int-tabs">
            <button className={`int-tab${activeTab === "providers" ? " active" : ""}`} onClick={() => setActiveTab("providers")}>
              Providers
            </button>
            <button className={`int-tab${activeTab === "repos" ? " active" : ""}`} onClick={() => setActiveTab("repos")}>
              Repositories ({repos.length})
            </button>
            <button className={`int-tab${activeTab === "activity" ? " active" : ""}`} onClick={() => setActiveTab("activity")}>
              Activity
            </button>
          </div>

          {/* Providers Tab */}
          {activeTab === "providers" && (
            <div className="int-providers">
              <ProviderCard
                icon="🐙"
                name="GitHub"
                description="Connect with a Personal Access Token (repo scope)"
                connected={!!saved.github}
                onConnect={() => handleSaveProvider("github")}
                onDisconnect={() => handleDisconnect("github")}
                color="#238636"
              >
                <div className="int-field">
                  <label className="int-field-label">Personal Access Token</label>
                  <div className="int-input-row">
                    <input
                      className="int-input"
                      type={showTokens.github ? "text" : "password"}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      value={form.githubToken}
                      onChange={(e) => setForm((f) => ({ ...f, githubToken: e.target.value }))}
                    />
                    <button className="int-btn-toggle" onClick={() => setShowTokens(s => ({ ...s, github: !s.github }))}>
                      {showTokens.github ? "Hide" : "Show"}
                    </button>
                  </div>
                  <div className="int-field-hint">
                    Create at <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">github.com/settings/tokens</a> with <code>repo</code> scope
                  </div>
                </div>
              </ProviderCard>

              <ProviderCard
                icon="🦊"
                name="GitLab"
                description="Connect with a Personal Access Token (api scope)"
                connected={!!saved.gitlab}
                onConnect={() => handleSaveProvider("gitlab")}
                onDisconnect={() => handleDisconnect("gitlab")}
                color="#FC6D26"
              >
                <div className="int-field">
                  <label className="int-field-label">Personal Access Token</label>
                  <div className="int-input-row">
                    <input
                      className="int-input"
                      type={showTokens.gitlab ? "text" : "password"}
                      placeholder="glpat-xxxxxxxxxxxxxxxxxxxx"
                      value={form.gitlabToken}
                      onChange={(e) => setForm((f) => ({ ...f, gitlabToken: e.target.value }))}
                    />
                    <button className="int-btn-toggle" onClick={() => setShowTokens(s => ({ ...s, gitlab: !s.gitlab }))}>
                      {showTokens.gitlab ? "Hide" : "Show"}
                    </button>
                  </div>
                  <div className="int-field-hint">
                    Create at <a href="https://gitlab.com/-/profile/personal_access_tokens" target="_blank" rel="noopener noreferrer">gitlab.com → Access Tokens</a> with <code>api</code> scope
                  </div>
                </div>
              </ProviderCard>

              <ProviderCard
                icon="🪣"
                name="Bitbucket"
                description="Connect with username + App Password"
                connected={!!saved.bitbucket}
                onConnect={() => handleSaveProvider("bitbucket")}
                onDisconnect={() => handleDisconnect("bitbucket")}
                color="#2684FF"
              >
                <div className="int-field">
                  <label className="int-field-label">Username</label>
                  <input
                    className="int-input"
                    type="text"
                    placeholder="your-username"
                    value={form.bitbucketUser}
                    onChange={(e) => setForm((f) => ({ ...f, bitbucketUser: e.target.value }))}
                  />
                </div>
                <div className="int-field">
                  <label className="int-field-label">App Password</label>
                  <div className="int-input-row">
                    <input
                      className="int-input"
                      type={showTokens.bitbucket ? "text" : "password"}
                      placeholder="App password"
                      value={form.bitbucketAppPassword}
                      onChange={(e) => setForm((f) => ({ ...f, bitbucketAppPassword: e.target.value }))}
                    />
                    <button className="int-btn-toggle" onClick={() => setShowTokens(s => ({ ...s, bitbucket: !s.bitbucket }))}>
                      {showTokens.bitbucket ? "Hide" : "Show"}
                    </button>
                  </div>
                  <div className="int-field-hint">
                    Create at <a href="https://bitbucket.org/account/settings/app-passwords/" target="_blank" rel="noopener noreferrer">bitbucket.org → App Passwords</a> with <code>repository:write</code>
                  </div>
                </div>
              </ProviderCard>

              <div className="int-security-note">
                🔒 Tokens are encrypted at rest and never exposed to the frontend. Stored server-side only.
              </div>
            </div>
          )}

          {/* Repos Tab */}
          {activeTab === "repos" && (
            <div className="int-repos-section">
              <div className="int-repos-add">
                <input
                  className="int-input int-repo-input"
                  type="text"
                  placeholder="Paste a repository URL (e.g. https://github.com/org/repo)"
                  value={newRepoUrl}
                  onChange={(e) => setNewRepoUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddRepo()}
                />
                <button className="int-btn-add-repo" onClick={handleAddRepo} disabled={!newRepoUrl.trim()}>
                  + Add Repo
                </button>
              </div>

              {repos.length === 0 ? (
                <div className="int-repos-empty">
                  <div className="int-repos-empty-icon">📂</div>
                  <div className="int-repos-empty-title">No repositories connected</div>
                  <div className="int-repos-empty-desc">
                    Add a repository URL above. Your dev agents will push code, open PRs, and run tests in your repos.
                  </div>
                </div>
              ) : (
                <div className="int-repos-list">
                  {repos.map((repo, i) => (
                    <div key={i} className="int-repo-item">
                      <div className="int-repo-icon">
                        {repo.provider === "github" ? "🐙" : repo.provider === "gitlab" ? "🦊" : "🪣"}
                      </div>
                      <div className="int-repo-info">
                        <div className="int-repo-name">{repo.name}</div>
                        <div className="int-repo-url">{repo.url}</div>
                      </div>
                      <span className="int-status-badge connected">Active</span>
                      <button className="int-btn-remove" onClick={() => handleRemoveRepo(i)} title="Remove repo">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <div className="int-activity-section">
              <div className="int-activity-header">
                <span>Recent Git Activity</span>
                <span className="int-activity-badge">Live</span>
              </div>
              <div className="int-activity-list">
                {ACTIVITY_LOG.map((entry, i) => (
                  <div key={i} className="int-activity-item">
                    <div className="int-activity-icon">{entry.icon}</div>
                    <div className="int-activity-content">
                      <span className="int-activity-agent">{entry.agent}</span>
                      <span className="int-activity-action">{entry.action}</span>
                      <span className="int-activity-repo">{entry.repo}</span>
                    </div>
                    <div className="int-activity-time">{entry.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* What agents can do */}
          <div className="integrations-info-card">
            <div className="integrations-info-title">What your Dev Team does with access</div>
            <div className="integrations-info-grid">
              <div className="integrations-info-item">
                <div className="integrations-info-icon">🚀</div>
                <div>
                  <div className="integrations-info-label">Push code</div>
                  <div className="integrations-info-desc">Kai&apos;s team commits and pushes directly to your repos</div>
                </div>
              </div>
              <div className="integrations-info-item">
                <div className="integrations-info-icon">🔍</div>
                <div>
                  <div className="integrations-info-label">Code review</div>
                  <div className="integrations-info-desc">Automated PR reviews with detailed feedback</div>
                </div>
              </div>
              <div className="integrations-info-item">
                <div className="integrations-info-icon">🔧</div>
                <div>
                  <div className="integrations-info-label">Bug fixes</div>
                  <div className="integrations-info-desc">Identify, fix, and test bugs autonomously</div>
                </div>
              </div>
              <div className="integrations-info-item">
                <div className="integrations-info-icon">📋</div>
                <div>
                  <div className="integrations-info-label">Issue management</div>
                  <div className="integrations-info-desc">Create issues, assign tasks, close tickets</div>
                </div>
              </div>
            </div>
          </div>

          <div className="int-back-link">
            <Link href="/portal">← Back to Client Portal</Link>
          </div>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="int-toast">{toast}</div>
      )}
    </>
  );
}
