import Link from "next/link";
import Nav from "@/app/components/Nav";

export const metadata = {
  title: "Pricing — Open Agency",
  description: "AI-powered agency teams starting at $299/month. Starter, Growth, and Enterprise plans.",
};

const TIERS = [
  {
    name: "Starter",
    price: 299,
    tagline: "One department. Full power.",
    highlight: false,
    badge: null,
    features: [
      "Nikita (CEO) — always included",
      "1 department of your choice",
      "Sales Team OR Dev Team OR Creative OR Marketing",
      "Up to 5 agents",
      "Task queue & live reporting",
      "Client portal access",
      "Email support",
      "Monthly performance report",
    ],
    departments: ["Sales Team", "Dev Team", "Creative Team", "Marketing (CMO)"],
    cta: "Start with Starter",
    ctaHref: "/onboard?plan=starter",
  },
  {
    name: "Growth",
    price: 499,
    tagline: "Three departments. Real momentum.",
    highlight: true,
    badge: "Most Popular",
    features: [
      "Nikita (CEO) — always included",
      "3 departments of your choice",
      "Up to 14 agents",
      "Task queue & live reporting",
      "Client portal access",
      "Workflow automation",
      "Priority support",
      "Weekly performance reports",
      "Git integration (GitHub, GitLab, Bitbucket)",
      "Webhook notifications",
    ],
    departments: ["Sales Team", "Dev Team", "Creative Team", "Finance (CFO)", "Marketing (CMO)", "Tech (CTO)"],
    cta: "Scale with Growth",
    ctaHref: "/onboard?plan=growth",
  },
  {
    name: "Enterprise",
    price: 999,
    tagline: "The full agency. All 21 agents.",
    highlight: false,
    badge: "Full Power",
    features: [
      "Nikita (CEO) — always included",
      "All 6 departments",
      "All 21 agents",
      "Unlimited task queue",
      "Full client portal",
      "Advanced workflow automation",
      "Dedicated account manager",
      "Daily performance reports",
      "All integrations included",
      "Custom webhook & API access",
      "White-glove onboarding",
      "SLA guarantee",
    ],
    departments: ["Sales", "Dev", "Creative", "Finance", "Marketing", "Tech"],
    cta: "Go Enterprise",
    ctaHref: "/onboard?plan=enterprise",
  },
];

const COMPARISON_ROWS = [
  { feature: "Nikita (CEO)", starter: true, growth: true, enterprise: true },
  { feature: "Departments", starter: "1", growth: "3", enterprise: "All 6" },
  { feature: "Agents", starter: "Up to 5", growth: "Up to 14", enterprise: "All 21" },
  { feature: "Task Queue", starter: true, growth: true, enterprise: true },
  { feature: "Client Portal", starter: true, growth: true, enterprise: true },
  { feature: "Workflow Automation", starter: false, growth: true, enterprise: true },
  { feature: "Git Integration", starter: false, growth: true, enterprise: true },
  { feature: "Webhook Notifications", starter: false, growth: true, enterprise: true },
  { feature: "Performance Reports", starter: "Monthly", growth: "Weekly", enterprise: "Daily" },
  { feature: "Support", starter: "Email", growth: "Priority", enterprise: "Dedicated" },
  { feature: "SLA Guarantee", starter: false, growth: false, enterprise: true },
  { feature: "White-glove Onboarding", starter: false, growth: false, enterprise: true },
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

export default function PricingPage() {
  return (
    <>
      <Nav />
      <main className="pricing-page">
        {/* Hero */}
        <section className="pricing-hero">
          <div className="pricing-eyebrow">Pricing</div>
          <h1 className="pricing-headline">
            Your AI team.<br />Starting at <span className="pricing-accent">$299/month</span>.
          </h1>
          <p className="pricing-sub">
            An entire agency — Sales, Dev, Creative, Finance, Marketing, Tech. No salaries. No benefits. No drama.
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
                <div className="pricing-price">
                  <span className="pricing-dollar">$</span>
                  <span className="pricing-amount">{tier.price}</span>
                  <span className="pricing-period">/month</span>
                </div>
                <div className="pricing-tagline">{tier.tagline}</div>
              </div>

              <div className="pricing-departments">
                {tier.departments.map((d) => (
                  <span key={d} className="pricing-dept-tag">{d}</span>
                ))}
              </div>

              <ul className="pricing-features">
                {tier.features.map((f) => (
                  <li key={f} className="pricing-feature-item">
                    <CheckIcon />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link href={tier.ctaHref} className={`pricing-cta-btn${tier.highlight ? " pricing-cta-btn--primary" : ""}`}>
                {tier.cta} →
              </Link>
            </div>
          ))}
        </section>

        {/* Feature Comparison Table */}
        <section className="pricing-compare">
          <h2 className="pricing-compare-title">Compare plans</h2>
          <div className="pricing-compare-table">
            <div className="compare-header">
              <div className="compare-feature-col">Feature</div>
              <div className="compare-tier-col">Starter<br /><span className="compare-price">$299/mo</span></div>
              <div className="compare-tier-col highlight">Growth<br /><span className="compare-price">$499/mo</span></div>
              <div className="compare-tier-col">Enterprise<br /><span className="compare-price">$999/mo</span></div>
            </div>
            {COMPARISON_ROWS.map((row) => (
              <div key={row.feature} className="compare-row">
                <div className="compare-feature-col">{row.feature}</div>
                <div className="compare-tier-col"><CellValue value={row.starter} /></div>
                <div className="compare-tier-col highlight"><CellValue value={row.growth} /></div>
                <div className="compare-tier-col"><CellValue value={row.enterprise} /></div>
              </div>
            ))}
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
              <div className="pricing-faq-a">A department is a team of specialised agents — e.g. the Dev Team has Kai (lead), Frontend, Backend, QA, and a Code Reviewer.</div>
            </div>
            <div className="pricing-faq-item">
              <div className="pricing-faq-q">Is there a free trial?</div>
              <div className="pricing-faq-a">Yes — 7 days free on any plan. No credit card required to start.</div>
            </div>
            <div className="pricing-faq-item">
              <div className="pricing-faq-q">What&apos;s included in onboarding?</div>
              <div className="pricing-faq-a">Nikita briefs your team with your business context, goals, and tools. Enterprise clients get white-glove setup with a dedicated account manager.</div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="pricing-bottom-cta">
          <div className="pricing-bottom-cta-inner">
            <h2 className="pricing-bottom-cta-title">Ready to hire your team?</h2>
            <p className="pricing-bottom-cta-sub">Get started in under 5 minutes. Your AI team is standing by.</p>
            <Link href="/onboard" className="pricing-bottom-btn">
              Start Free Trial →
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
