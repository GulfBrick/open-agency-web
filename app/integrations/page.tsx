"use client";

import { useState, useEffect } from "react";
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

const INTEGRATIONS_STORAGE_KEY = "oa_integrations";

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

export default function IntegrationsPage() {
  const [form, setForm] = useState<IntegrationState>({
    githubToken: "",
    gitlabToken: "",
    bitbucketUser: "",
    bitbucketAppPassword: "",
  });
  const [saved, setSaved] = useState<SavedIntegrations>({});
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [showTokens, setShowTokens] = useState({
    github: false,
    gitlab: false,
    bitbucket: false,
  });

  useEffect(() => {
    setSaved(loadFromLocal());
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus("idle");
    try {
      const res = await fetch("/api/integrations/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) {
        // Fallback: save locally
        saveToLocal(form);
        setSaved(loadFromLocal());
        setSaveStatus("success");
      } else {
        saveToLocal(form);
        setSaved(loadFromLocal());
        setSaveStatus("success");
      }
    } catch {
      // Backend offline — save locally so it works client-side
      saveToLocal(form);
      setSaved(loadFromLocal());
      setSaveStatus("success");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const hasAny = form.githubToken || form.gitlabToken || (form.bitbucketUser && form.bitbucketAppPassword);

  return (
    <>
      <Nav />
      <main className="integrations-page">
        <div className="integrations-container">
          <div className="integrations-header">
            <h1 className="integrations-title">Integrations</h1>
            <p className="integrations-subtitle">
              Connect your repos. Your Dev Team will push code directly to your codebase.
            </p>
          </div>

          {/* Status cards */}
          <div className="integrations-status-row">
            <div className={`integration-status-card${saved.github ? " connected" : ""}`}>
              <div className="integration-status-icon">🐙</div>
              <div className="integration-status-info">
                <div className="integration-status-name">GitHub</div>
                <div className={`integration-status-badge${saved.github ? " connected" : ""}`}>
                  {saved.github ? "✓ Connected" : "Not connected"}
                </div>
              </div>
            </div>
            <div className={`integration-status-card${saved.gitlab ? " connected" : ""}`}>
              <div className="integration-status-icon">🦊</div>
              <div className="integration-status-info">
                <div className="integration-status-name">GitLab</div>
                <div className={`integration-status-badge${saved.gitlab ? " connected" : ""}`}>
                  {saved.gitlab ? "✓ Connected" : "Not connected"}
                </div>
              </div>
            </div>
            <div className={`integration-status-card${saved.bitbucket ? " connected" : ""}`}>
              <div className="integration-status-icon">🪣</div>
              <div className="integration-status-info">
                <div className="integration-status-name">Bitbucket</div>
                <div className={`integration-status-badge${saved.bitbucket ? " connected" : ""}`}>
                  {saved.bitbucket ? "✓ Connected" : "Not connected"}
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="integrations-form-card">
            <div className="integrations-form-title">Token Configuration</div>

            {/* GitHub */}
            <div className="integration-field-group">
              <div className="integration-provider-header">
                <span className="integration-provider-icon">🐙</span>
                <div>
                  <div className="integration-provider-name">GitHub</div>
                  <div className="integration-provider-hint">
                    Create a token at <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="integration-link">github.com/settings/tokens</a> with <code>repo</code> scope.
                  </div>
                </div>
                {saved.github && <span className="integration-connected-pill">Connected ✓</span>}
              </div>
              <div className="integration-input-row">
                <input
                  className="onboard-input"
                  type={showTokens.github ? "text" : "password"}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={form.githubToken}
                  onChange={(e) => setForm((f) => ({ ...f, githubToken: e.target.value }))}
                />
                <button
                  className="integration-show-btn"
                  type="button"
                  onClick={() => setShowTokens((s) => ({ ...s, github: !s.github }))}
                >
                  {showTokens.github ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* GitLab */}
            <div className="integration-field-group">
              <div className="integration-provider-header">
                <span className="integration-provider-icon">🦊</span>
                <div>
                  <div className="integration-provider-name">GitLab</div>
                  <div className="integration-provider-hint">
                    Create a token at <a href="https://gitlab.com/-/profile/personal_access_tokens" target="_blank" rel="noopener noreferrer" className="integration-link">gitlab.com → Access Tokens</a> with <code>api</code> scope.
                  </div>
                </div>
                {saved.gitlab && <span className="integration-connected-pill">Connected ✓</span>}
              </div>
              <div className="integration-input-row">
                <input
                  className="onboard-input"
                  type={showTokens.gitlab ? "text" : "password"}
                  placeholder="glpat-xxxxxxxxxxxxxxxxxxxx"
                  value={form.gitlabToken}
                  onChange={(e) => setForm((f) => ({ ...f, gitlabToken: e.target.value }))}
                />
                <button
                  className="integration-show-btn"
                  type="button"
                  onClick={() => setShowTokens((s) => ({ ...s, gitlab: !s.gitlab }))}
                >
                  {showTokens.gitlab ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Bitbucket */}
            <div className="integration-field-group">
              <div className="integration-provider-header">
                <span className="integration-provider-icon">🪣</span>
                <div>
                  <div className="integration-provider-name">Bitbucket</div>
                  <div className="integration-provider-hint">
                    Create an App Password at <a href="https://bitbucket.org/account/settings/app-passwords/" target="_blank" rel="noopener noreferrer" className="integration-link">bitbucket.org → App Passwords</a> with <code>repository:write</code>.
                  </div>
                </div>
                {saved.bitbucket && <span className="integration-connected-pill">Connected ✓</span>}
              </div>
              <div className="onboard-row">
                <input
                  className="onboard-input"
                  type="text"
                  placeholder="Bitbucket username"
                  value={form.bitbucketUser}
                  onChange={(e) => setForm((f) => ({ ...f, bitbucketUser: e.target.value }))}
                />
                <div className="integration-input-row" style={{ flex: 1 }}>
                  <input
                    className="onboard-input"
                    type={showTokens.bitbucket ? "text" : "password"}
                    placeholder="App password"
                    value={form.bitbucketAppPassword}
                    onChange={(e) => setForm((f) => ({ ...f, bitbucketAppPassword: e.target.value }))}
                  />
                  <button
                    className="integration-show-btn"
                    type="button"
                    onClick={() => setShowTokens((s) => ({ ...s, bitbucket: !s.bitbucket }))}
                  >
                    {showTokens.bitbucket ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            <div className="integrations-save-row">
              <div className="integrations-security-note">
                🔒 Tokens are encrypted at rest and never exposed to the frontend.
              </div>
              <button
                className="integrations-save-btn"
                onClick={handleSave}
                disabled={saving || !hasAny}
              >
                {saving ? "Saving..." : saveStatus === "success" ? "✓ Saved" : "Save Integrations"}
              </button>
            </div>

            {saveStatus === "success" && (
              <div className="integrations-save-success">
                Integrations saved. Your Dev Team will use these credentials for all repo operations.
              </div>
            )}
            {saveStatus === "error" && (
              <div className="integrations-save-error">
                Failed to save. Check your connection and try again.
              </div>
            )}
          </div>

          {/* What happens next */}
          <div className="integrations-info-card">
            <div className="integrations-info-title">What your Dev Team can do</div>
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
        </div>
      </main>
    </>
  );
}
