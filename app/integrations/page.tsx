"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Nav from "@/app/components/Nav";

function GitHubIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 98 96" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ color: "#fff" }}>
      <path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" />
    </svg>
  );
}

function GitLabIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 380 380" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M380 220.013L340.08 96.08l-39.92 123.933H79.84L39.92 96.08 0 220.013l190 138.907L380 220.013z" fill="#FC6D26"/>
      <path d="M190 358.92L340.08 220.013H39.92L190 358.92z" fill="#E24329"/>
      <path d="M39.92 220.013L0 220.013 39.92 96.08l40 123.933z" fill="#FCA326"/>
      <path d="M340.08 220.013L380 220.013 340.08 96.08l-40 123.933z" fill="#FCA326"/>
      <path d="M190 358.92l150.08-138.907H39.92L190 358.92z" fill="#FC6D26"/>
    </svg>
  );
}

function BitbucketIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.07 4.857A1.143 1.143 0 0 0 .93 6.143l4.343 20.286A1.143 1.143 0 0 0 6.4 27.429h19.429a1.143 1.143 0 0 0 1.143-.972l4.343-20.314a1.143 1.143 0 0 0-1.143-1.286H2.07zm17.501 15.429H12.4l-1.714-8h10.629l-1.743 8z" fill="#2684FF"/>
    </svg>
  );
}

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
  icon: React.ReactNode;
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
        <div className="int-provider-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 10, background: color, flexShrink: 0 }}>{icon}</div>
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

    // Try to load live integration status from backend
    const clientId = typeof window !== "undefined" ? localStorage.getItem("oa_client_id") : null;
    if (clientId) {
      fetch(`/api/integrations/status?clientId=${clientId}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data && (data.github !== undefined || data.gitlab !== undefined || data.bitbucket !== undefined)) {
            setSaved({
              github: !!data.github,
              gitlab: !!data.gitlab,
              bitbucket: !!data.bitbucket,
              savedAt: data.updatedAt || data.createdAt,
            });
          }
        })
        .catch(() => { /* keep local fallback */ });
    }
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

  const [activityLog, setActivityLog] = useState<{ time: string; agent: string; action: string; repo: string; icon: string }[]>([]);

  useEffect(() => {
    const clientId = typeof window !== "undefined" ? localStorage.getItem("oa_client_id") : null;
    if (clientId) {
      fetch(`/api/integrations/activity?clientId=${clientId}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (Array.isArray(data)) setActivityLog(data);
        })
        .catch(() => { /* no activity available */ });
    }
  }, []);

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
                icon={<GitHubIcon />}
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
                icon={<GitLabIcon />}
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
                icon={<BitbucketIcon />}
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
                      <div className="int-repo-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, background: repo.provider === "github" ? "#238636" : repo.provider === "gitlab" ? "#FC6D26" : "#2684FF" }}>
                        {repo.provider === "github" ? <GitHubIcon /> : repo.provider === "gitlab" ? <GitLabIcon /> : <BitbucketIcon />}
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
              {activityLog.length === 0 ? (
                <div className="int-repos-empty">
                  <div className="int-repos-empty-icon">📡</div>
                  <div className="int-repos-empty-title">No activity yet</div>
                  <div className="int-repos-empty-desc">
                    Once your dev agents start working, their commits, PRs, and reviews will appear here.
                  </div>
                </div>
              ) : (
                <div className="int-activity-list">
                  {activityLog.map((entry, i) => (
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
              )}
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
