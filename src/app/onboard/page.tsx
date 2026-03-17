'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

const DEPARTMENTS = [
  { id: 'marketing', label: 'Marketing', icon: '📣', desc: 'Priya, Mia, Theo & Luna' },
  { id: 'sales', label: 'Sales', icon: '💼', desc: 'Rex, Lena, Cleo & Sam' },
  { id: 'development', label: 'Development', icon: '💻', desc: 'Kai, Rio, Nova & Byte' },
  { id: 'creative', label: 'Creative', icon: '🎨', desc: 'Zara, Eli & Nora' },
]

const TIERS = [
  {
    id: 'starter',
    label: 'Starter',
    price: '$299/mo',
    desc: 'Nikita + 1 department',
    color: '#6366f1',
    recommended: false,
  },
  {
    id: 'growth',
    label: 'Growth',
    price: '$499/mo',
    desc: 'Nikita + 3 departments',
    color: '#7c3aed',
    recommended: true,
  },
  {
    id: 'enterprise',
    label: 'Enterprise',
    price: '$999/mo',
    desc: 'Full agency — all 27 agents',
    color: '#dc2626',
    recommended: false,
  },
]

type Step = 'business' | 'tier' | 'brief' | 'done'

function OnboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<Step>('business')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [tier, setTier] = useState('growth')
  const [department, setDepartment] = useState('marketing')
  const [brief, setBrief] = useState('')
  const [timezone, setTimezone] = useState(
    typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC'
  )

  const [result, setResult] = useState<{ clientId: string; businessName: string; tier: string } | null>(null)

  // Read tier from query param (e.g. /onboard?tier=enterprise from pricing page)
  useEffect(() => {
    const t = searchParams.get('tier')
    if (t && ['starter', 'growth', 'enterprise'].includes(t)) setTier(t)
  }, [searchParams])

  async function handleSubmit() {
    if (!email.trim() || !businessName.trim() || loading) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          businessName: businessName.trim(),
          tier,
          brief: brief.trim() || undefined,
          timezone,
        }),
      })
      const data = await res.json()

      if (res.status === 409) {
        // Already exists — log them in
        localStorage.setItem('oa_client_id', data.clientId)
        localStorage.setItem('oa_business_name', businessName.trim())
        localStorage.setItem('oa_tier', tier)
        setResult({ clientId: data.clientId, businessName: businessName.trim(), tier })
        setStep('done')
        return
      }

      if (!res.ok) {
        setError(data.error || 'Registration failed — please try again.')
        return
      }

      localStorage.setItem('oa_client_id', data.clientId)
      localStorage.setItem('oa_business_name', data.businessName)
      localStorage.setItem('oa_tier', data.tier)
      localStorage.setItem('oa_new_client', '1')

      // Fire-and-forget kickoff — start the team immediately
      fetch(`/api/clients/${data.clientId}/kickoff`, { method: 'POST' }).catch(() => {})

      setResult(data)
      setStep('done')
    } catch {
      setError('Connection failed — make sure the backend is online and try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#111',
    border: '1px solid #222',
    borderRadius: 10,
    color: '#e5e5e5',
    fontSize: 15,
    padding: '13px 16px',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  }

  const steps: Step[] = ['business', 'tier', 'brief']
  const stepIndex = steps.indexOf(step)

  return (
    <div style={{
      background: '#0a0a0a',
      minHeight: '100vh',
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      color: '#e5e5e5',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <nav style={{ borderBottom: '1px solid #1a1a1a', padding: '0 32px', display: 'flex', alignItems: 'center', gap: 24, height: 60 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image
            src="/logo.png"
            alt="Open Agency"
            width={32}
            height={32}
            style={{ borderRadius: 8, objectFit: 'cover' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>
            Open<span style={{ color: '#7c3aed' }}>Agency</span>
          </span>
        </a>
        <span style={{ color: '#333', fontSize: 20 }}>|</span>
        <span style={{ color: '#666', fontSize: 14 }}>Onboarding</span>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 560 }}>

          {/* Step indicator */}
          {step !== 'done' && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 36, justifyContent: 'center', alignItems: 'center' }}>
              {steps.map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: step === s ? '#7c3aed' : stepIndex > i ? '#7c3aed44' : '#1a1a1a',
                      border: step === s ? '2px solid #7c3aed' : '2px solid #222',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      color: step === s ? '#fff' : '#555',
                    }}
                  >
                    {i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{ width: 32, height: 1, background: stepIndex > i ? '#7c3aed44' : '#222' }} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Step 1: Business Details */}
          {step === 'business' && (
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>Tell us about your business</h1>
              <p style={{ color: '#555', fontSize: 14, margin: '0 0 28px', lineHeight: 1.6 }}>
                Your AI team needs to know who they are working for.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={labelStyle}>Your email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@yourbusiness.com"
                    style={inputStyle}
                    autoFocus
                  />
                </div>
                <div>
                  <label style={labelStyle}>Business name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    placeholder="Acme Corp"
                    style={inputStyle}
                    onKeyDown={e => e.key === 'Enter' && email.trim() && businessName.trim() && setStep('tier')}
                  />
                </div>

                {error && (
                  <div style={{ background: '#ef444411', border: '1px solid #ef444433', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#ef4444' }}>
                    {error}
                  </div>
                )}

                <button
                  onClick={() => email.trim() && businessName.trim() && setStep('tier')}
                  disabled={!email.trim() || !businessName.trim()}
                  style={{
                    background: '#7c3aed', border: 'none', borderRadius: 10, color: '#fff',
                    fontSize: 15, fontWeight: 600, padding: '13px 24px',
                    cursor: (!email.trim() || !businessName.trim()) ? 'not-allowed' : 'pointer',
                    opacity: (!email.trim() || !businessName.trim()) ? 0.6 : 1,
                  }}
                >
                  Next: Choose Your Plan
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Tier selection */}
          {step === 'tier' && (
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>Choose your plan</h1>
              <p style={{ color: '#555', fontSize: 14, margin: '0 0 28px', lineHeight: 1.6 }}>
                Pick the team size that fits your needs.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {TIERS.map(t => (
                  <div
                    key={t.id}
                    onClick={() => setTier(t.id)}
                    style={{
                      background: tier === t.id ? `${t.color}11` : '#111',
                      border: `2px solid ${tier === t.id ? t.color : '#1a1a1a'}`,
                      borderRadius: 12,
                      padding: '18px 22px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{t.label}</span>
                        {t.recommended && (
                          <span style={{ background: t.color, color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>
                            POPULAR
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: '#555', marginTop: 3 }}>{t.desc}</div>
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: tier === t.id ? t.color : '#555' }}>
                      {t.price}
                    </div>
                  </div>
                ))}
              </div>

              {tier === 'starter' && (
                <div style={{ marginBottom: 20 }}>
                  <p style={{ color: '#666', fontSize: 13, margin: '0 0 12px' }}>Which department would you like?</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {DEPARTMENTS.map(d => (
                      <div
                        key={d.id}
                        onClick={() => setDepartment(d.id)}
                        style={{
                          background: department === d.id ? '#7c3aed22' : '#111',
                          border: `1px solid ${department === d.id ? '#7c3aed' : '#222'}`,
                          borderRadius: 10,
                          padding: '12px 14px',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontSize: 20, marginBottom: 4 }}>{d.icon}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{d.label}</div>
                        <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{d.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setStep('business')}
                  style={{ background: 'none', border: '1px solid #222', borderRadius: 10, color: '#666', fontSize: 14, padding: '12px 20px', cursor: 'pointer' }}
                >
                  Back
                </button>
                <button
                  onClick={() => setStep('brief')}
                  style={{ flex: 1, background: '#7c3aed', border: 'none', borderRadius: 10, color: '#fff', fontSize: 15, fontWeight: 600, padding: '13px 24px', cursor: 'pointer' }}
                >
                  Next: Brief Your Team
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Business brief */}
          {step === 'brief' && (
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>Brief your team</h1>
              <p style={{ color: '#555', fontSize: 14, margin: '0 0 28px', lineHeight: 1.6 }}>
                The more context you give, the better your agents will perform. Two sentences or two paragraphs — whatever helps.
              </p>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Business brief (optional but recommended)</label>
                <textarea
                  value={brief}
                  onChange={e => setBrief(e.target.value)}
                  placeholder="e.g. We're a SaaS company targeting SMBs in the UK. We sell a project management tool called Claro. Our main challenge is lead generation and converting free trials to paid. We want to grow from 200 to 500 customers this year."
                  rows={6}
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                    lineHeight: 1.6,
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {error && (
                <div style={{ background: '#ef444411', border: '1px solid #ef444433', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#ef4444', marginBottom: 16 }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setStep('tier')}
                  style={{ background: 'none', border: '1px solid #222', borderRadius: 10, color: '#666', fontSize: 14, padding: '12px 20px', cursor: 'pointer' }}
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    flex: 1,
                    background: loading ? '#4c1d95' : '#7c3aed',
                    border: 'none', borderRadius: 10, color: '#fff',
                    fontSize: 15, fontWeight: 600, padding: '13px 24px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? 'Setting up your team...' : 'Launch My Agency'}
                </button>
              </div>
            </div>
          )}

          {/* Done */}
          {step === 'done' && result && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🚀</div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 0 10px' }}>
                Your team is online.
              </h2>
              <p style={{ color: '#666', fontSize: 14, margin: '0 0 8px' }}>
                {result.businessName} — {result.tier.charAt(0).toUpperCase() + result.tier.slice(1)} plan
              </p>
              <div style={{ background: '#0d0d1a', border: '1px solid #7c3aed33', borderRadius: 10, padding: '14px 20px', margin: '16px 0 28px', textAlign: 'left' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 18 }}>⚡</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#a78bfa', marginBottom: 4 }}>First reports in progress</div>
                    <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>
                      Nikita, Marcus, and Priya are generating your first reports. They will be in your portal shortly.
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => router.push('/portal')}
                style={{
                  background: '#7c3aed', border: 'none', borderRadius: 10, color: '#fff',
                  fontSize: 15, fontWeight: 600, padding: '13px 32px',
                  cursor: 'pointer',
                }}
              >
                Enter Your Portal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function OnboardPage() {
  return (
    <Suspense fallback={
      <div style={{ background: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", color: '#555' }}>
        Loading...
      </div>
    }>
      <OnboardContent />
    </Suspense>
  )
}
