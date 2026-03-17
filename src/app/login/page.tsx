'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'email' | 'success'>('email')
  const router = useRouter()

  // If already logged in, redirect
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('oa_client_id') : null
    if (stored) router.replace('/portal')
  }, [router])

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || loading) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'No account found. Check your email or sign up at our pricing page.')
        return
      }

      localStorage.setItem('oa_client_id', data.clientId)
      localStorage.setItem('oa_business_name', data.businessName)
      localStorage.setItem('oa_tier', data.tier)

      setStep('success')
      setTimeout(() => router.push('/portal'), 1200)
    } catch {
      setError('Connection failed — make sure you have an active account or try again shortly.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: '#0a0a0a',
      minHeight: '100vh',
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      color: '#e5e5e5',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Nav */}
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
      </nav>

      {/* Centered content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {step === 'email' ? (
            <>
              <div style={{ marginBottom: 32, textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>👤</div>
                <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>
                  Access Your Portal
                </h1>
                <p style={{ color: '#555', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                  Enter the email address you used to sign up. We will take you straight to your dashboard.
                </p>
              </div>

              <form onSubmit={handleLookup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#666', marginBottom: 8 }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@yourbusiness.com"
                    autoFocus
                    required
                    style={{
                      width: '100%',
                      background: '#111',
                      border: '1px solid #222',
                      borderRadius: 10,
                      color: '#e5e5e5',
                      fontSize: 15,
                      padding: '13px 16px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {error && (
                  <div style={{
                    background: '#ef444411',
                    border: '1px solid #ef444433',
                    borderRadius: 8,
                    padding: '10px 14px',
                    fontSize: 13,
                    color: '#ef4444',
                    lineHeight: 1.5,
                  }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  style={{
                    background: loading ? '#4c1d95' : '#7c3aed',
                    border: 'none',
                    borderRadius: 10,
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: 600,
                    padding: '13px 24px',
                    cursor: (loading || !email.trim()) ? 'not-allowed' : 'pointer',
                    opacity: (loading || !email.trim()) ? 0.7 : 1,
                    transition: 'all 0.15s',
                  }}
                >
                  {loading ? 'Looking up...' : 'Enter Portal →'}
                </button>
              </form>

              <div style={{ marginTop: 28, textAlign: 'center', borderTop: '1px solid #1a1a1a', paddingTop: 24 }}>
                <p style={{ color: '#444', fontSize: 13, margin: '0 0 12px' }}>
                  Don&apos;t have an account yet?
                </p>
                <a
                  href="/pricing"
                  style={{
                    color: '#7c3aed',
                    textDecoration: 'none',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  View plans &amp; pricing →
                </a>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>You&apos;re in.</h2>
              <p style={{ color: '#555', fontSize: 14 }}>Taking you to your portal...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
