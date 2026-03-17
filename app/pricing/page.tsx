import Nav from "@/app/components/Nav";

export const metadata = {
  title: "Pricing — Open Agency",
  description: "AI-powered agency teams starting at $299/month. Starter, Growth, and Agency plans.",
};

// ─── Agent Roster ─────────────────────────────────────────────────────────────

const AGENTS = {
  nikita:   { name: "Nikita",   title: "CEO",               short: "Runs the agency. Briefs your team. Reports to you.", icon: "N" },
  jordan:   { name: "Jordan",   title: "Sales Lead",         short: "Builds pipeline. Qualifies leads. Closes deals.", icon: "J" },
  closer:   { name: "Closer",   title: "Sales Closer",       short: "Negotiates terms. Sends proposals. Gets signatures.", icon: "CL" },
  qualifier:{ name: "Qualifier", title: "Lead Qualifier",     short: "Scores inbound leads. Filters by ICP. Routes to closers.", icon: "Q" },
  followup: { name: "Follow-Up", title: "Outreach Specialist",short: "Multi-step sequences. Re-engages cold leads.", icon: "FU" },
  proposal: { name: "Proposal",  title: "Proposal Writer",   short: "Custom decks. Pricing tables. Competitive positioning.", icon: "P" },
  nova:     { name: "Nova",     title: "Creative Director",  short: "Brand strategy. Campaign concepts. Creative briefs.", icon: "NV" },
  iris:     { name: "Iris",     title: "Designer",           short: "UI/UX mockups. Pitch decks. Visual identity.", icon: "IR" },
  finn:     { name: "Finn",     title: "Video Editor",       short: "Cuts, renders, and publishes video content.", icon: "FN" },
  jade:     { name: "Jade",     title: "Social Media",       short: "Scheduling. Engagement. Trend tracking.", icon: "JD" },
  ash:      { name: "Ash",      title: "Copywriter",         short: "Headlines. Landing pages. Email sequences.", icon: "AS" },
  kai:      { name: "Kai",      title: "Dev Lead",           short: "Sprint planning. Code review. Technical decisions.", icon: "K" },
  architect:{ name: "Architect", title: "System Architect",   short: "Infrastructure design. Scaling blueprints.", icon: "AR" },
  frontend: { name: "Frontend",  title: "Frontend Engineer",  short: "React, Next.js, pixel-perfect UI.", icon: "FE" },
  backend:  { name: "Backend",   title: "Backend Engineer",   short: "APIs, databases, rate limiting, auth.", icon: "BE" },
  fullstack:{ name: "Fullstack", title: "Fullstack Engineer", short: "End-to-end feature delivery.", icon: "FS" },
  qa:       { name: "QA",        title: "QA Engineer",        short: "Test suites. Regression testing. Bug hunts.", icon: "QA" },
  reviewer: { name: "Reviewer",  title: "Code Reviewer",      short: "PR reviews. Code quality. Best practices.", icon: "CR" },
  marcus:   { name: "Marcus",   title: "CFO",                short: "P&L reports. Cash flow. Financial forecasts.", icon: "M" },
  zara:     { name: "Zara",     title: "CTO",                short: "Tech audits. Architecture reviews. Security.", icon: "Z" },
  priya:    { name: "Priya",    title: "CMO",                short: "Growth strategy. Brand campaigns. Analytics.", icon: "PR" },
};

type AgentKey = keyof typeof AGENTS;

const TIER_AGENTS: Record<string, { dept: string; color: string; agents: AgentKey[] }[]> = {
  starter: [
    { dept: "Leadership", color: "#F59E0B", agents: ["nikita"] },
    { dept: "Sales Team", color: "#F43F5E", agents: ["jordan", "closer", "qualifier", "followup", "proposal"] },
  ],
  growth: [
    { dept: "Leadership", color: "#F59E0B", agents: ["nikita"] },
    { dept: "Sales Team", color: "#F43F5E", agents: ["jordan", "closer", "qualifier", "followup", "proposal"] },
    { dept: "Creative Team", color: "#EC4899", agents: ["nova", "iris", "finn", "jade", "ash"] },
    { dept: "Marketing", color: "#F59E0B", agents: ["priya"] },
  ],
  agency: [
    { dept: "Leadership", color: "#F59E0B", agents: ["nikita"] },
    { dept: "Sales Team", color: "#F43F5E", agents: ["jordan", "closer", "qualifier", "followup", "proposal"] },
    { dept: "Creative Team", color: "#EC4899", agents: ["nova", "iris", "finn", "jade", "ash"] },
    { dept: "Dev Team", color: "#10B981", agents: ["kai", "architect", "frontend", "backend", "fullstack", "qa", "reviewer"] },
    { dept: "C-Suite", color: "#7C3AED", agents: ["marcus", "zara", "priya"] },
  ],
};

const TIERS: {
  id: string;
  name: string;
  price: number | null;
  tagline: string;
  highlight: boolean;
  badge: string | null;
  agentCount: number;
  headline: string;
  bullets: string[];
  cta: string;
  ctaHref: string;
  whopHref: string;
}[] = [
  {
    id: "starter",
    name: "Starter",
    price: 299,
    tagline: "Your first hire. A full sales team that never sleeps.",
    highlight: false,
    badge: null,
    agentCount: 6,
    headline: "Sales team only",
    bullets: [
      "Nikita (CEO) runs the show",
      "5-agent sales team",
      "Pipeline management",
      "Lead qualification + closing",
      "Automated outreach sequences",
      "Weekly performance reports",
      "Client portal access",
      "Email support",
    ],
    cta: "Start with Sales",
    ctaHref: "/onboard?plan=starter",
    whopHref: "https://whop.com/open-agency-starter/",
  },
  {
    id: "growth",
    name: "Growth",
    price: 499,
    tagline: "Sales + Marketing + Creative. The growth engine.",
    highlight: true,
    badge: "Most Popular",
    agentCount: 12,
    headline: "Sales + Marketing",
    bullets: [
      "Everything in Starter",
      "Creative team (5 agents)",
      "Priya (CMO) — growth strategy",
      "Brand, content, social, video",
      "Campaign automation",
      "Git integration",
      "Priority support",
      "Daily performance reports",
    ],
    cta: "Scale with Growth",
    ctaHref: "/onboard?plan=growth",
    whopHref: "https://whop.com/open-agency-growth/",
  },
  {
    id: "agency",
    name: "Enterprise",
    price: null,
    tagline: "The full agency. All 21 agents. Every department.",
    highlight: false,
    badge: "Full Power",
    agentCount: 21,
    headline: "Full team (all departments)",
    bullets: [
      "Everything in Growth",
      "Dev team (7 engineers)",
      "Marcus (CFO) — financials",
      "Zara (CTO) — tech leadership",
      "Code pushed to your repos",
      "Advanced workflow automation",
      "SLA guarantee",
      "White-glove onboarding",
    ],
    cta: "Contact Us",
    ctaHref: "mailto:openagency.n@gmail.com",
    whopHref: "mailto:openagency.n@gmail.com",
  },
];

const COMPARISON_ROWS = [
  { feature: "Nikita (CEO)", starter: true, growth: true, agency: true },
  { feature: "Departments", starter: "1 (Sales)", growth: "3 (Sales, Creative, Marketing)", agency: "All 6" },
  { feature: "Total Agents", starter: "6", growth: "12", agency: "All 21" },
  { feature: "Task Queue", starter: true, growth: true, agency: true },
  { feature: "Client Portal", starter: true, growth: true, agency: true },
  { feature: "Workflow Automation", starter: false, growth: true, agency: true },
  { feature: "Git Integration", starter: false, growth: true, agency: true },
  { feature: "Webhook Notifications", starter: false, growth: true, agency: true },
  { feature: "Performance Reports", starter: "Weekly", growth: "Daily", agency: "Real-time" },
  { feature: "Support", starter: "Email", growth: "Priority", agency: "Dedicated" },
  { feature: "Custom API Access", starter: false, growth: false, agency: true },
  { feature: "SLA Guarantee", starter: false, growth: false, agency: true },
  { feature: "White-glove Onboarding", starter: false, growth: false, agency: true },
];

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="8" fill="rgba(16,185,129,0.15)" />
      <path d="M4.5 8L7 10.5L11.5 6" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="8" fill="rgba(100,100,120,0.1)" />
      <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="rgba(100,100,120,0.4)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CellValue({ value }: { value: boolean | string }) {
  if (value === true) return <CheckIcon />;
  if (value === false) return <XIcon />;
  return <span className="compare-text">{value}</span>;
}

function AgentMiniCard({ agentKey, color }: { agentKey: AgentKey; color: string }) {
  const agent = AGENTS[agentKey];
  return (
    <div className="pricing-agent-mini" style={{ borderColor: `${color}33` }}>
      <div className="pricing-agent-avatar" style={{ background: `${color}22`, color }}>
        {agent.icon}
      </div>
      <div className="pricing-agent-info">
        <div className="pricing-agent-name">{agent.name}</div>
        <div className="pricing-agent-title">{agent.title}</div>
      </div>
      <div className="pricing-agent-desc">{agent.short}</div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <>
      <Nav />
      <main className="pricing-page">
        {/* Hero */}
        <section className="pricing-hero">
          <div className="pricing-eyebrow">Pricing</div>
          <h1 className="pricing-headline">
            An entire agency.<br />
            No salaries. No drama.<br />
            Starting at <span className="pricing-accent">$299/month</span>.
          </h1>
          <p className="pricing-sub">
            21 AI agents across 6 departments — Sales, Dev, Creative, Finance, Marketing, Tech.
            Pick a tier. Your team starts working in minutes.
          </p>
        </section>

        {/* Tiers */}
        <section className="pricing-tiers">
          {TIERS.map((tier) => (
            <div key={tier.name} className={`pricing-card${tier.highlight ? " pricing-card--highlight" : ""}`}>
              {tier.badge && (
                <div className={`pricing-badge${tier.highlight ? " pricing-badge--popular" : " pricing-badge--alt"}`}>
                  {tier.badge}
                </div>
              )}
              <div className="pricing-card-header">
                <div className="pricing-tier-name">{tier.name}</div>
                {tier.price !== null ? (
                  <div className="pricing-price">
                    <span className="pricing-dollar">$</span>
                    <span className="pricing-amount">{tier.price}</span>
                    <span className="pricing-period">/month</span>
                  </div>
                ) : (
                  <div className="pricing-price">
                    <span className="pricing-amount" style={{ fontSize: "2rem" }}>Custom</span>
                  </div>
                )}
                <div className="pricing-tagline">{tier.tagline}</div>
                <div className="pricing-agent-count">{tier.agentCount} agents</div>
              </div>

              <ul className="pricing-features">
                {tier.bullets.map((f) => (
                  <li key={f} className="pricing-feature-item">
                    <CheckIcon />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href={tier.ctaHref}
                target={tier.ctaHref.startsWith("mailto:") ? undefined : "_blank"}
                rel={tier.ctaHref.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                className={`pricing-cta-btn${tier.highlight ? " pricing-cta-btn--primary" : ""}`}
              >
                {tier.cta} →
              </a>
            </div>
          ))}
        </section>

        {/* Meet Your Team */}
        <section className="pricing-agents-section">
          <h2 className="pricing-agents-title">Meet the agents</h2>
          <p className="pricing-agents-sub">Every agent has a name, a specialty, and a track record. Here&apos;s who works on each plan.</p>

          {TIERS.map((tier) => {
            const depts = TIER_AGENTS[tier.id];
            return (
              <div key={tier.id} className="pricing-tier-agents">
                <div className="pricing-tier-agents-header">
                  <span className="pricing-tier-agents-name">{tier.name}</span>
                  <span className="pricing-tier-agents-price">{tier.price !== null ? `$${tier.price}/mo` : "Custom pricing"}</span>
                  <span className="pricing-tier-agents-count">{tier.agentCount} agents</span>
                </div>
                {depts.map((dept) => (
                  <div key={dept.dept} className="pricing-dept-section">
                    <div className="pricing-dept-header" style={{ color: dept.color }}>
                      <div className="pricing-dept-dot" style={{ background: dept.color }} />
                      {dept.dept}
                    </div>
                    <div className="pricing-dept-agents-grid">
                      {dept.agents.map((ak) => (
                        <AgentMiniCard key={ak} agentKey={ak} color={dept.color} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </section>

        {/* Feature Comparison Table */}
        <section className="pricing-compare">
          <h2 className="pricing-compare-title">Compare plans</h2>
          <div className="pricing-compare-table">
            <div className="compare-header">
              <div className="compare-feature-col">Feature</div>
              <div className="compare-tier-col">Starter<br /><span className="compare-price">$299/mo</span></div>
              <div className="compare-tier-col highlight">Growth<br /><span className="compare-price">$499/mo</span></div>
              <div className="compare-tier-col">Enterprise<br /><span className="compare-price">Custom</span></div>
            </div>
            {COMPARISON_ROWS.map((row) => (
              <div key={row.feature} className="compare-row">
                <div className="compare-feature-col">{row.feature}</div>
                <div className="compare-tier-col"><CellValue value={row.starter} /></div>
                <div className="compare-tier-col highlight"><CellValue value={row.growth} /></div>
                <div className="compare-tier-col"><CellValue value={row.agency} /></div>
              </div>
            ))}
          </div>
        </section>

        {/* Social Proof */}
        <section className="pricing-proof">
          <div className="pricing-proof-grid">
            <div className="pricing-proof-stat">
              <div className="pricing-proof-num">21</div>
              <div className="pricing-proof-label">AI agents</div>
            </div>
            <div className="pricing-proof-stat">
              <div className="pricing-proof-num">6</div>
              <div className="pricing-proof-label">Departments</div>
            </div>
            <div className="pricing-proof-stat">
              <div className="pricing-proof-num">24/7</div>
              <div className="pricing-proof-label">Always on</div>
            </div>
            <div className="pricing-proof-stat">
              <div className="pricing-proof-num">5 min</div>
              <div className="pricing-proof-label">Setup time</div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="pricing-faq">
          <h2 className="pricing-faq-title">Common questions</h2>
          <div className="pricing-faq-grid">
            <div className="pricing-faq-item">
              <div className="pricing-faq-q">Can I switch plans?</div>
              <div className="pricing-faq-a">Yes. Upgrade or downgrade at any time. Changes take effect on your next billing cycle.</div>
            </div>
            <div className="pricing-faq-item">
              <div className="pricing-faq-q">What&apos;s a department?</div>
              <div className="pricing-faq-a">A department is a team of specialised agents — e.g. the Dev Team has Kai (lead), Architect, Frontend, Backend, QA, Fullstack, and Code Reviewer.</div>
            </div>
            <div className="pricing-faq-item">
              <div className="pricing-faq-q">Is there a free trial?</div>
              <div className="pricing-faq-a">Yes — 7 days free on any plan. No credit card required to start.</div>
            </div>
            <div className="pricing-faq-item">
              <div className="pricing-faq-q">How do dev agents push code?</div>
              <div className="pricing-faq-a">Connect your GitHub, GitLab, or Bitbucket via the Integrations page. Dev agents commit to branches, open PRs, and run tests automatically.</div>
            </div>
            <div className="pricing-faq-item">
              <div className="pricing-faq-q">What if the backend is offline?</div>
              <div className="pricing-faq-a">Agents gracefully degrade. Tasks are queued and processed when systems come back online. Your data is never lost.</div>
            </div>
            <div className="pricing-faq-item">
              <div className="pricing-faq-q">Who is Nikita?</div>
              <div className="pricing-faq-a">Nikita is your AI CEO. She briefs the team, dispatches tasks, generates reports, and is your single point of contact for everything. She&apos;s always included, on every plan.</div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="pricing-bottom-cta">
          <div className="pricing-bottom-cta-inner">
            <h2 className="pricing-bottom-cta-title">Ready to hire your team?</h2>
            <p className="pricing-bottom-cta-sub">21 agents. 6 departments. Zero HR headaches. Start your 7-day free trial.</p>
            <a href="https://whop.com/open-agency-growth/" target="_blank" rel="noopener noreferrer" className="pricing-bottom-btn">
              Start Free Trial →
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
