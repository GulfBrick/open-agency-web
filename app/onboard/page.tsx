"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Nav from "@/app/components/Nav";

const DEPARTMENTS = [
  { id: "sales", label: "Sales Team", icon: "📈", agents: ["Jordan (Lead)", "Closer", "Lead Qualifier", "Follow-Up", "Proposal"], desc: "Prospect, qualify, close" },
  { id: "dev", label: "Dev Team", icon: "🚀", agents: ["Kai (Lead)", "Architect", "Frontend", "Backend", "QA", "Reviewer"], desc: "Build, ship, scale" },
  { id: "creative", label: "Creative Team", icon: "🎨", agents: ["Nova (Director)", "Iris (Design)", "Finn (Video)", "Jade (Social)", "Ash (Copy)"], desc: "Brand, content, visual" },
  { id: "finance", label: "Finance (CFO)", icon: "💰", agents: ["Marcus (CFO)"], desc: "P&L, forecasts, cash" },
  { id: "marketing", label: "Marketing (CMO)", icon: "📣", agents: ["Priya (CMO)"], desc: "Campaigns, brand, growth" },
  { id: "tech", label: "Tech (CTO)", icon: "🏗️", agents: ["Zara (CTO)"], desc: "Architecture, infra, security" },
];

const PLAN_DEPT_LIMITS: Record<string, number> = { starter: 1, growth: 3, enterprise: 6 };

const INDUSTRIES = [
  "Prop Trading / Finance",
  "SaaS / Software",
  "E-commerce / Retail",
  "Agency / Consulting",
  "Healthcare",
  "Real Estate",
  "Legal",
  "Marketing / Media",
  "Manufacturing",
  "Other",
];

const COMPANY_SIZES = [
  "Solo / Freelancer",
  "2–10 employees",
  "11–50 employees",
  "51–200 employees",
  "201–1000 employees",
  "1000+ employees",
];

const STEPS = ["Business Info", "Your Team", "Connect Tools", "Brief Nikita"];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="onboard-steps">
      {STEPS.map((label, i) => (
        <div key={i} className={`onboard-step${i === current ? " active" : i < current ? " done" : ""}`}>
          <div className="onboard-step-num">
            {i < current ? "✓" : i + 1}
          </div>
          <div className="onboard-step-label">{label}</div>
          {i < total - 1 && <div className="onboard-step-line" />}
        </div>
      ))}
    </div>
  );
}

function OnboardContent() {
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get("plan") || "growth";

  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState(initialPlan);
  const [form, setForm] = useState({
    businessName: "",
    industry: "",
    companySize: "",
    website: "",
    contactName: "",
    contactEmail: "",
  });
  const [departments, setDepartments] = useState<string[]>([]);
  const [integrations, setIntegrations] = useState({
    githubToken: "",
    gitlabToken: "",
    bitbucketUser: "",
    bitbucketAppPassword: "",
  });
  const [brief, setBrief] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const maxDepts = PLAN_DEPT_LIMITS[plan] || 3;

  const toggleDept = (id: string) => {
    setDepartments((prev) => {
      if (prev.includes(id)) return prev.filter((d) => d !== id);
      if (prev.length >= maxDepts) return prev;
      return [...prev, id];
    });
  };

  const canNext = () => {
    if (step === 0) return form.businessName.trim() && form.industry && form.contactEmail.trim();
    if (step === 1) return departments.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    if (!form.businessName.trim() || !form.contactEmail.trim()) {
      setError("Please complete required fields.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/clients/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.businessName,
          industry: form.industry,
          companySize: form.companySize,
          website: form.website,
          contactName: form.contactName,
          contactEmail: form.contactEmail,
          departments,
          plan,
          integrations: Object.values(integrations).some(Boolean) ? integrations : undefined,
          brief,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <>
        <Nav />
        <main className="onboard-page">
          <div className="onboard-success">
            <div className="onboard-success-icon">✓</div>
            <h1 className="onboard-success-title">Welcome aboard.</h1>
            <p className="onboard-success-sub">
              Nikita is briefing your team right now. You&apos;ll have agents working within minutes.
            </p>
            <div className="onboard-success-details">
              <div className="onboard-success-detail">
                <span className="onboard-success-detail-label">Business</span>
                <span className="onboard-success-detail-value">{form.businessName}</span>
              </div>
              <div className="onboard-success-detail">
                <span className="onboard-success-detail-label">Plan</span>
                <span className="onboard-success-detail-value capitalize">{plan}</span>
              </div>
              <div className="onboard-success-detail">
                <span className="onboard-success-detail-label">Departments</span>
                <span className="onboard-success-detail-value">{departments.map(d => DEPARTMENTS.find(x => x.id === d)?.label).join(", ")}</span>
              </div>
            </div>
            <Link href="/portal" className="onboard-success-cta">Go to Client Portal →</Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Nav />
      <main className="onboard-page">
        <div className="onboard-container">
          <div className="onboard-header">
            <h1 className="onboard-title">Set up your agency team</h1>
            <p className="onboard-subtitle">Takes 5 minutes. Your AI team starts immediately.</p>
          </div>

          <StepIndicator current={step} total={STEPS.length} />

          <div className="onboard-card">
            {/* Step 0: Business Info */}
            {step === 0 && (
              <div className="onboard-step-content">
                <h2 className="onboard-step-title">About your business</h2>

                {/* Plan selector */}
                <div className="onboard-field">
                  <label className="onboard-label">Choose your plan</label>
                  <div className="onboard-plan-selector">
                    {[
                      { id: "starter", label: "Starter", price: "$299/mo", desc: "1 dept" },
                      { id: "growth", label: "Growth", price: "$499/mo", desc: "3 depts", popular: true },
                      { id: "enterprise", label: "Enterprise", price: "$999/mo", desc: "All 6" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className={`onboard-plan-btn${plan === p.id ? " selected" : ""}`}
                        onClick={() => { setPlan(p.id); setDepartments([]); }}
                      >
                        {p.popular && <span className="onboard-plan-popular">Popular</span>}
                        <div className="onboard-plan-name">{p.label}</div>
                        <div className="onboard-plan-price">{p.price}</div>
                        <div className="onboard-plan-desc">{p.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="onboard-field">
                  <label className="onboard-label">Business name <span className="onboard-required">*</span></label>
                  <input
                    className="onboard-input"
                    type="text"
                    placeholder="e.g. Clearline Markets"
                    value={form.businessName}
                    onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
                  />
                </div>

                <div className="onboard-row">
                  <div className="onboard-field">
                    <label className="onboard-label">Industry <span className="onboard-required">*</span></label>
                    <select
                      className="onboard-input"
                      value={form.industry}
                      onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
                    >
                      <option value="">Select industry...</option>
                      {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                  <div className="onboard-field">
                    <label className="onboard-label">Company size</label>
                    <select
                      className="onboard-input"
                      value={form.companySize}
                      onChange={(e) => setForm((f) => ({ ...f, companySize: e.target.value }))}
                    >
                      <option value="">Select size...</option>
                      {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="onboard-field">
                  <label className="onboard-label">Website</label>
                  <input
                    className="onboard-input"
                    type="url"
                    placeholder="https://yourcompany.com"
                    value={form.website}
                    onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                  />
                </div>

                <div className="onboard-row">
                  <div className="onboard-field">
                    <label className="onboard-label">Your name</label>
                    <input
                      className="onboard-input"
                      type="text"
                      placeholder="Jane Smith"
                      value={form.contactName}
                      onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
                    />
                  </div>
                  <div className="onboard-field">
                    <label className="onboard-label">Email <span className="onboard-required">*</span></label>
                    <input
                      className="onboard-input"
                      type="email"
                      placeholder="jane@company.com"
                      value={form.contactEmail}
                      onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Choose Team */}
            {step === 1 && (
              <div className="onboard-step-content">
                <h2 className="onboard-step-title">Choose your departments</h2>
                <p className="onboard-step-desc">
                  Your <strong className="capitalize">{plan}</strong> plan includes <strong>{maxDepts} department{maxDepts > 1 ? "s" : ""}</strong>.
                  Select {maxDepts === 1 ? "one" : `up to ${maxDepts}`}.
                </p>
                <div className="onboard-dept-grid">
                  {DEPARTMENTS.map((dept) => {
                    const selected = departments.includes(dept.id);
                    const disabled = !selected && departments.length >= maxDepts;
                    return (
                      <button
                        key={dept.id}
                        type="button"
                        className={`onboard-dept-card${selected ? " selected" : ""}${disabled ? " disabled" : ""}`}
                        onClick={() => !disabled && toggleDept(dept.id)}
                      >
                        <div className="onboard-dept-icon">{dept.icon}</div>
                        <div className="onboard-dept-label">{dept.label}</div>
                        <div className="onboard-dept-desc">{dept.desc}</div>
                        <div className="onboard-dept-agents">
                          {dept.agents.slice(0, 3).map((a) => (
                            <span key={a} className="onboard-dept-agent-tag">{a}</span>
                          ))}
                          {dept.agents.length > 3 && (
                            <span className="onboard-dept-agent-tag">+{dept.agents.length - 3} more</span>
                          )}
                        </div>
                        {selected && <div className="onboard-dept-check">✓</div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Connect Tools */}
            {step === 2 && (
              <div className="onboard-step-content">
                <h2 className="onboard-step-title">Connect your tools</h2>
                <p className="onboard-step-desc">Optional. Your Dev Team can push code directly to your repos.</p>

                <div className="onboard-integration-section">
                  <div className="onboard-integration-header">
                    <span className="onboard-integration-icon">🐙</span>
                    <div>
                      <div className="onboard-integration-name">GitHub</div>
                      <div className="onboard-integration-hint">Personal Access Token with <code>repo</code> scope</div>
                    </div>
                  </div>
                  <input
                    className="onboard-input"
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    value={integrations.githubToken}
                    onChange={(e) => setIntegrations((i) => ({ ...i, githubToken: e.target.value }))}
                  />
                </div>

                <div className="onboard-integration-section">
                  <div className="onboard-integration-header">
                    <span className="onboard-integration-icon">🦊</span>
                    <div>
                      <div className="onboard-integration-name">GitLab</div>
                      <div className="onboard-integration-hint">Personal Access Token with <code>api</code> scope</div>
                    </div>
                  </div>
                  <input
                    className="onboard-input"
                    type="password"
                    placeholder="glpat-xxxxxxxxxxxxxxxxxxxx"
                    value={integrations.gitlabToken}
                    onChange={(e) => setIntegrations((i) => ({ ...i, gitlabToken: e.target.value }))}
                  />
                </div>

                <div className="onboard-integration-section">
                  <div className="onboard-integration-header">
                    <span className="onboard-integration-icon">🪣</span>
                    <div>
                      <div className="onboard-integration-name">Bitbucket</div>
                      <div className="onboard-integration-hint">Username + App Password</div>
                    </div>
                  </div>
                  <div className="onboard-row">
                    <input
                      className="onboard-input"
                      type="text"
                      placeholder="Bitbucket username"
                      value={integrations.bitbucketUser}
                      onChange={(e) => setIntegrations((i) => ({ ...i, bitbucketUser: e.target.value }))}
                    />
                    <input
                      className="onboard-input"
                      type="password"
                      placeholder="App password"
                      value={integrations.bitbucketAppPassword}
                      onChange={(e) => setIntegrations((i) => ({ ...i, bitbucketAppPassword: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="onboard-skip-note">
                  All fields optional — you can connect integrations later from <Link href="/integrations" className="onboard-inline-link">Settings → Integrations</Link>.
                </div>
              </div>
            )}

            {/* Step 3: Brief */}
            {step === 3 && (
              <div className="onboard-step-content">
                <h2 className="onboard-step-title">Brief your team</h2>
                <p className="onboard-step-desc">
                  Tell Nikita what you need. She&apos;ll brief every agent with your goals, context, and priorities.
                </p>
                <textarea
                  className="onboard-input onboard-textarea"
                  rows={8}
                  placeholder={`Examples:\n• "We need to grow our MRR from $8k to $20k in 6 months. Focus on outbound sales and content marketing."\n• "Build us a trading dashboard — real-time P&L, position tracker, risk metrics. Mobile-first."\n• "Rebrand the whole company. New logo, website, and LinkedIn presence. Launch by April 1st."`}
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                />
                <div className="onboard-brief-hint">
                  The more detail the better. Nikita will read this and brief your entire team.
                </div>

                {/* Summary */}
                <div className="onboard-summary">
                  <div className="onboard-summary-title">Your team summary</div>
                  <div className="onboard-summary-rows">
                    <div className="onboard-summary-row">
                      <span className="onboard-summary-label">Business</span>
                      <span className="onboard-summary-value">{form.businessName}</span>
                    </div>
                    <div className="onboard-summary-row">
                      <span className="onboard-summary-label">Plan</span>
                      <span className="onboard-summary-value capitalize">{plan} — ${plan === "starter" ? "299" : plan === "growth" ? "499" : "999"}/mo</span>
                    </div>
                    <div className="onboard-summary-row">
                      <span className="onboard-summary-label">Departments</span>
                      <span className="onboard-summary-value">
                        {departments.length === 0
                          ? "None selected"
                          : departments.map((d) => DEPARTMENTS.find((x) => x.id === d)?.label).join(", ")}
                      </span>
                    </div>
                    <div className="onboard-summary-row">
                      <span className="onboard-summary-label">Integrations</span>
                      <span className="onboard-summary-value">
                        {[
                          integrations.githubToken && "GitHub",
                          integrations.gitlabToken && "GitLab",
                          integrations.bitbucketUser && "Bitbucket",
                        ].filter(Boolean).join(", ") || "None"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && <div className="onboard-error">{error}</div>}

            <div className="onboard-nav">
              {step > 0 ? (
                <button className="onboard-btn-back" onClick={() => setStep((s) => s - 1)} disabled={submitting}>
                  ← Back
                </button>
              ) : (
                <Link href="/pricing" className="onboard-btn-back">← View Pricing</Link>
              )}
              {step < STEPS.length - 1 ? (
                <button
                  className="onboard-btn-next"
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canNext()}
                >
                  Next →
                </button>
              ) : (
                <button
                  className="onboard-btn-next onboard-btn-submit"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? "Launching team..." : "Launch my team →"}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default function OnboardPage() {
  return (
    <Suspense fallback={<div className="onboard-loading">Loading...</div>}>
      <OnboardContent />
    </Suspense>
  );
}
