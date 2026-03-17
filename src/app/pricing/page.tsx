'use client'

const TIERS = [
  {
    id: 'starter',
    label: 'Starter',
    price: '$299',
    period: '/month',
    color: '#6366f1',
    tagline: 'One smart department, fully managed.',
    features: [
      'Nikita (CEO Agent) — your main point of contact',
      'Choose 1 department: Sales, Marketing, Dev, or Creative',
      '4–5 specialist agents in your chosen department',
      'Weekly reports from your department head',
      'Daily digest from Nikita',
      'Client portal access',
      'Message Nikita any time',
    ],
    cta: 'Get Started',
    ctaHref: 'https://whop.com/open-agency-starter/',
    highlight: false,
    badge: null,
  },
  {
    id: 'growth',
    label: 'Growth',
    price: '$499',
    period: '/month',
    color: '#7c3aed',
    tagline: 'Three departments. Real momentum.',
    features: [
      'Everything in Starter',
      'Nikita + 3 full departments (Marketing, Dev, Finance)',
      '10 specialist agents covering your core business',
      'Marcus (Finance Director) — weekly financial reports',
      'Priya (Marketing Director) — content calendar & campaigns',
      'Kai (Dev Lead) + Rio, Nova, Byte — dev team ready to ship',
      'Zara (Creative Director) — brand audits & creative direction',
      'Agent XP system — agents level up the longer they work with you',
      'Git integration — dev team can push to your repo',
    ],
    cta: 'Get Started',
    ctaHref: 'https://whop.com/open-agency-growth/',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    id: 'enterprise',
    label: 'Enterprise',
    price: 'Custom',
    period: '',
    color: '#dc2626',
    tagline: 'The full agency. All 27 agents. All departments.',
    features: [
      'Everything in Growth',
      'All 27 agents across 7 departments',
      'Legal team: Lex, Cora & Jules — contracts, compliance, NDAs',
      'HR team: Harper, Drew & Sage — hiring, talent, people ops',
      'Operations: Otto & Vera — SOPs, admin, workflow automation',
      'Full sales team: Rex, Lena, Cleo & Sam',
      'Priority response from Nikita',
      'Custom agent briefing and onboarding session',
    ],
    cta: 'Contact Us',
    ctaHref: 'mailto:openagency.n@gmail.com',
    highlight: false,
    badge: null,
  },
]

const FAQ = [
  {
    q: 'How do agents access my business?',
    a: 'During onboarding you give us a brief about your business. Agents read it and start working. For dev work, you can optionally connect your GitHub/GitLab repo so agents can push code.',
  },
  {
    q: 'Can I switch plans?',
    a: 'Yes. Upgrade or downgrade any time. Agents retain their XP and memory of your business across plan changes.',
  },
  {
    q: 'What do the reports look like?',
    a: 'Structured, actionable reports — not walls of text. Each report has a summary, full output, and 3 specific next actions. They land in your portal and your inbox.',
  },
  {
    q: 'Is there a trial?',
    a: "We offer a 7-day money-back guarantee. If your agents haven't produced something useful in 7 days, full refund — no questions.",
  },
  {
    q: 'Do the agents actually do work, or just advise?',
    a: 'Both. Marcus writes reports. Priya produces content calendars. Zara does brand audits. Dev agents (Kai, Rio, Nova) can push code to your repo. They work, not just advise.',
  },
]

export default function PricingPage() {
  return (
    <div style={{
      background: '#0a0a0a',
      minHeight: '100vh',
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      color: '#e5e5e5',
    }}>
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #1a1a1a', padding: '0 32px', display: 'flex', alignItems: 'center', gap: 24, height: 60, position: 'sticky', top: 0, background: '#0a0a0a', zIndex: 100 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Open Agency"
            style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>
            Open<span style={{ color: '#7c3aed' }}>Agency</span>
          </span>
        </a>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 20, alignItems: 'center' }}>
          <a href="/login" style={{ color: '#666', textDecoration: 'none', fontSize: 13 }}>Client Login</a>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '72px 24px 48px' }}>
        <h1 style={{ fontSize: 44, fontWeight: 800, margin: '0 0 16px', color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          Hire a team.<br />Not a subscription.
        </h1>
        <p style={{ fontSize: 18, color: '#555', maxWidth: 500, margin: '0 auto 8px', lineHeight: 1.7 }}>
          Open Agency gives you a real AI team — 27 specialists across 7 departments — that runs parts of your business end-to-end.
        </p>
        <p style={{ fontSize: 14, color: '#444', margin: 0 }}>All prices in USD. Cancel any time.</p>
      </div>

      {/* Pricing cards */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 72px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {TIERS.map(tier => (
          <div
            key={tier.id}
            style={{
              background: tier.highlight ? `${tier.color}08` : '#111',
              border: `2px solid ${tier.highlight ? tier.color : '#1a1a1a'}`,
              borderRadius: 16,
              padding: '32px 28px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            {tier.badge && (
              <div style={{
                position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                background: tier.color, color: '#fff', fontSize: 11, fontWeight: 700,
                padding: '4px 14px', borderRadius: 20,
              }}>
                {tier.badge}
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: tier.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                {tier.label}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: 42, fontWeight: 800, color: '#fff' }}>{tier.price}</span>
                {tier.period && <span style={{ fontSize: 14, color: '#555' }}>{tier.period}</span>}
              </div>
              <p style={{ margin: 0, fontSize: 14, color: '#666', lineHeight: 1.5 }}>{tier.tagline}</p>
            </div>

            <ul style={{ listStyle: 'none', margin: '0 0 28px', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tier.features.map((f, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: '#aaa', lineHeight: 1.5 }}>
                  <span style={{ color: tier.color, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div style={{ marginTop: 'auto' }}>
              <a
                href={tier.ctaHref}
                target={tier.id === 'enterprise' ? undefined : '_blank'}
                rel={tier.id === 'enterprise' ? undefined : 'noopener noreferrer'}
                style={{
                  display: 'block',
                  background: tier.highlight ? tier.color : 'transparent',
                  border: `2px solid ${tier.color}`,
                  borderRadius: 10,
                  color: tier.highlight ? '#fff' : tier.color,
                  fontSize: 14,
                  fontWeight: 700,
                  padding: '13px 24px',
                  textAlign: 'center',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                }}
              >
                {tier.cta} →
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Value props */}
      <div style={{ background: '#080808', borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a', padding: '48px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, textAlign: 'center' }}>
          {[
            { icon: '🤖', title: '27 agents', desc: 'Across 7 departments' },
            { icon: '⚡', title: 'Always on', desc: 'Your team never sleeps' },
            { icon: '📈', title: 'Agent XP', desc: 'They get better over time' },
            { icon: '🔒', title: 'Your data', desc: 'Isolated, encrypted, private' },
          ].map(v => (
            <div key={v.title}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{v.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{v.title}</div>
              <div style={{ fontSize: 13, color: '#555' }}>{v.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '64px 24px 80px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: '0 0 36px', textAlign: 'center' }}>Common questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {FAQ.map((item, i) => (
            <div key={i} style={{ borderBottom: '1px solid #1a1a1a', paddingBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#e5e5e5', marginBottom: 8 }}>{item.q}</div>
              <div style={{ fontSize: 14, color: '#666', lineHeight: 1.7 }}>{item.a}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 14, color: '#444' }}>
            Already a client? <a href="/login" style={{ color: '#7c3aed', textDecoration: 'none' }}>Log in here →</a>
          </p>
        </div>
      </div>
    </div>
  )
}
