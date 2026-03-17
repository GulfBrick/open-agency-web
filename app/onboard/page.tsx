"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Nav from "@/app/components/Nav";

function GitHubIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 98 96" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ color: "#e2e8f0" }}>
      <path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" />
    </svg>
  );
}

function GitLabIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 380 380" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.07 4.857A1.143 1.143 0 0 0 .93 6.143l4.343 20.286A1.143 1.143 0 0 0 6.4 27.429h19.429a1.143 1.143 0 0 0 1.143-.972l4.343-20.314a1.143 1.143 0 0 0-1.143-1.286H2.07zm17.501 15.429H12.4l-1.714-8h10.629l-1.743 8z" fill="#2684FF"/>
    </svg>
  );
}

const DEPARTMENTS = [
  { id: "sales", label: "Sales Team", icon: "📈", agents: ["Rex (Director)", "Lena (Lead Gen)", "Cleo (Outreach)", "Sam (CRM)"], desc: "Prospect, qualify, close" },
  { id: "marketing", label: "Marketing", icon: "📣", agents: ["Priya (Director)", "Mia (Social)", "Theo (SEO)", "Luna (Ads)"], desc: "Campaigns, content, growth" },
  { id: "dev", label: "Dev Team", icon: "🚀", agents: ["Kai (Lead)", "Rio (Frontend)", "Nova (Backend)", "Byte (QA)"], desc: "Build, ship, scale" },
  { id: "creative", label: "Creative", icon: "🎨", agents: ["Zara (Director)", "Eli (Copy)", "Nora (Design)"], desc: "Brand, content, visual" },
  { id: "finance", label: "Finance", icon: "💰", agents: ["Marcus (Director)", "Iris (Books)", "Felix (Forecasting)"], desc: "P&L, forecasts, cash flow" },
  { id: "operations", label: "Operations", icon: "⚙️", agents: ["Otto (Ops)", "Vera (Admin)"], desc: "SOPs, automation, coordination" },
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
    goals: "",
    monthlyBudget: "",
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
          goals: form.goals,
          monthlyBudget: form.monthlyBudget,
          departments,
          plan,
          integrations: Object.values(integrations).some(Boolean) ? integrations : undefined,
          brief,
        }),
      });
      const data = await res.json();
      if (data.error && !data.success) {
        setError(data.error);
        setSubmitting(false);
        return;
      }
      // Store clientId for portal and integrations pages
      if (data.clientId) {
        try { localStorage.setItem("oa_client_id", data.clientId); } catch { /* noop */ }
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
                      { id: "starter", label: "Starter", price: "$299/mo", desc: "Nikita + 1 department" },
                      { id: "growth", label: "Growth", price: "$499/mo", desc: "Nikita + 3 departments", popular: true },
                      { id: "enterprise", label: "Enterprise", price: "$999/mo", desc: "All 27 agents — full agency" },
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

                <div className="onboard-field">
                  <label className="onboard-label">Primary goals</label>
                  <input
                    className="onboard-input"
                    type="text"
                    placeholder="e.g. Grow MRR to $50k, build a trading dashboard, rebrand the company"
                    value={form.goals}
                    onChange={(e) => setForm((f) => ({ ...f, goals: e.target.value }))}
                  />
                </div>

                <div className="onboard-field">
                  <label className="onboard-label">Monthly budget range</label>
                  <select
                    className="onboard-input"
                    value={form.monthlyBudget}
                    onChange={(e) => setForm((f) => ({ ...f, monthlyBudget: e.target.value }))}
                  >
                    <option value="">Select budget range...</option>
                    <option value="<$500">Under $500/mo</option>
                    <option value="$500-$1k">$500 – $1,000/mo</option>
                    <option value="$1k-$5k">$1,000 – $5,000/mo</option>
                    <option value="$5k-$10k">$5,000 – $10,000/mo</option>
                    <option value="$10k+">$10,000+/mo</option>
                  </select>
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
                    <span className="onboard-integration-icon"><GitHubIcon /></span>
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
                    <span className="onboard-integration-icon"><GitLabIcon /></span>
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
                    <span className="onboard-integration-icon"><BitbucketIcon /></span>
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
