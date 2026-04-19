'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Syne, Space_Grotesk } from 'next/font/google'
import { getSupabaseClient } from '@/lib/supabase'

const syne = Syne({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-syne' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-space' })

type Role = 'client' | 'vendor'

export default function SignUpPage() {
  const router = useRouter()
  const [fullName, setFullName]   = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [loading, setLoading]     = useState<Role | null>(null)
  const [error, setError]         = useState<string | null>(null)

  async function handleSignUp(role: Role) {
    setError(null)

    if (!fullName.trim()) { setError('Please enter your full name.'); return }
    if (!email.trim())    { setError('Please enter your email address.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }

    setLoading(role)
    const supabase = getSupabaseClient()

    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { full_name: fullName.trim() } },
    })

    if (authError) {
      setLoading(null)
      setError(authError.message)
      return
    }

    if (!data.user) {
      setLoading(null)
      setError('Something went wrong. Please try again.')
      return
    }

    const { error: dbError } = await supabase.from('users').insert({
      id: data.user.id,
      email: email.trim().toLowerCase(),
      full_name: fullName.trim(),
      role,
      created_at: new Date().toISOString(),
    })

    setLoading(null)

    if (dbError) {
      console.error('Profile insert error:', dbError)
    }

    if (!data.session) {
      router.push('/auth/verify')
      return
    }

    router.push(role === 'vendor' ? '/vendor' : '/onboarding')
  }

  const fieldStyle: React.CSSProperties = {
    height: 52, borderRadius: 10,
    border: '1.5px solid #DDB8F5',
    padding: '0 1rem',
    fontFamily: 'var(--font-space)', fontSize: '0.9375rem',
    color: '#1A1A2E', outline: 'none',
    background: '#fff',
    transition: 'border-color 0.2s',
    width: '100%', boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-space)', fontWeight: 500,
    fontSize: 13, color: '#374151',
  }

  return (
    <div
      className={`${syne.variable} ${spaceGrotesk.variable}`}
      style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-space), sans-serif' }}
    >
      {/* ── LEFT PANEL (55%) ── */}
      <div
        className="hidden lg:block flex-shrink-0"
        style={{ width: '55%', position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', inset: 0, backgroundImage: "url('/images/Hero.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
        {/* Dark overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,26,46,0.5)' }} />

        {/* Content */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '3rem 3.5rem',
        }}>
          {/* Logo top-left */}
          <a href="/" style={{ textDecoration: 'none' }}>
            <span style={{
              fontFamily: 'var(--font-syne)', fontWeight: 800,
              fontSize: '1.75rem', letterSpacing: '-0.03em',
              color: 'white',
            }}>
              evnti<span style={{ color: 'var(--lavender)' }}>.</span>
            </span>
          </a>

          {/* Quote bottom-left */}
          <div>
            <p style={{
              fontFamily: 'var(--font-syne)', fontWeight: 700,
              fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)',
              color: 'white', lineHeight: 1.25,
              letterSpacing: '-0.025em',
              maxWidth: 440, margin: 0,
            }}>
              Plan your first event in minutes.
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (45%) ── */}
      <div
        style={{
          flex: 1,
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        {/* Mobile logo bar */}
        <div
          className="lg:hidden"
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10,
            padding: '1.25rem 1.5rem',
            background: '#fff',
            borderBottom: '1px solid rgba(74,14,110,0.06)',
          }}
        >
          <span style={{
            fontFamily: 'var(--font-syne)', fontWeight: 800,
            fontSize: '1.25rem', color: 'var(--plum)', letterSpacing: '-0.03em',
          }}>
            evnti<span style={{ color: 'var(--lavender)' }}>.</span>
          </span>
        </div>

        <div style={{ width: '100%', maxWidth: 460, padding: '60px' }}>
          <h1 style={{
            fontFamily: 'var(--font-syne)', fontWeight: 700,
            fontSize: 32, letterSpacing: '-0.025em',
            color: '#1A1A2E', marginBottom: '0.5rem', marginTop: 0,
          }}>
            Create your account
          </h1>
          <p style={{
            fontFamily: 'var(--font-space)', fontWeight: 400,
            fontSize: '0.9375rem', color: '#6B7280',
            marginBottom: '2.25rem', marginTop: 0,
          }}>
            Start planning unforgettable events today.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            {/* Full name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={labelStyle}>Full name</label>
              <input
                type="text" autoComplete="name"
                value={fullName}
                onChange={e => { setFullName(e.target.value); setError(null) }}
                placeholder="Jane Smith"
                style={fieldStyle}
                onFocus={e => (e.currentTarget.style.borderColor = '#6B1F9A')}
                onBlur={e => (e.currentTarget.style.borderColor = '#DDB8F5')}
              />
            </div>

            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={labelStyle}>Email address</label>
              <input
                type="email" autoComplete="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(null) }}
                placeholder="you@example.com"
                style={fieldStyle}
                onFocus={e => (e.currentTarget.style.borderColor = '#6B1F9A')}
                onBlur={e => (e.currentTarget.style.borderColor = '#DDB8F5')}
              />
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={labelStyle}>Password</label>
              <input
                type="password" autoComplete="new-password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(null) }}
                placeholder="Min. 6 characters"
                style={fieldStyle}
                onFocus={e => (e.currentTarget.style.borderColor = '#6B1F9A')}
                onBlur={e => (e.currentTarget.style.borderColor = '#DDB8F5')}
              />
            </div>

            {/* Confirm password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={labelStyle}>Confirm password</label>
              <input
                type="password" autoComplete="new-password"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setError(null) }}
                placeholder="••••••••"
                style={fieldStyle}
                onFocus={e => (e.currentTarget.style.borderColor = '#6B1F9A')}
                onBlur={e => (e.currentTarget.style.borderColor = '#DDB8F5')}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 10, padding: '0.75rem 1rem',
                fontFamily: 'var(--font-space)',
                fontSize: '0.875rem', color: '#DC2626',
              }}>
                {error}
              </div>
            )}

            {/* Divider + role buttons */}
            <div style={{ paddingTop: '0.25rem' }}>
              <p style={{
                fontFamily: 'var(--font-space)', fontSize: '0.8125rem',
                color: '#9CA3AF', textAlign: 'center',
                marginBottom: '0.875rem', marginTop: 0,
              }}>
                I am joining as…
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Client button — primary */}
                <button
                  type="button"
                  disabled={loading !== null}
                  onClick={() => handleSignUp('client')}
                  style={{
                    height: 52, borderRadius: 10,
                    background: loading === 'client' ? '#4A0E6E' : 'var(--plum)',
                    color: 'white', border: 'none',
                    fontFamily: 'var(--font-syne)', fontSize: '0.9375rem', fontWeight: 700,
                    letterSpacing: '-0.01em',
                    cursor: loading !== null ? 'not-allowed' : 'pointer',
                    opacity: loading !== null && loading !== 'client' ? 0.4 : 1,
                    transition: 'all 0.2s',
                    width: '100%',
                  }}
                  onMouseOver={e => { if (!loading) { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
                  onMouseOut={e => { if (!loading) { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' } }}
                >
                  {loading === 'client' ? 'Creating account…' : "I'm planning an event"}
                </button>

                {/* Vendor button — secondary */}
                <button
                  type="button"
                  disabled={loading !== null}
                  onClick={() => handleSignUp('vendor')}
                  style={{
                    height: 52, borderRadius: 10,
                    background: 'transparent',
                    color: 'var(--plum)',
                    border: '1.5px solid #DDB8F5',
                    fontFamily: 'var(--font-syne)', fontSize: '0.9375rem', fontWeight: 700,
                    letterSpacing: '-0.01em',
                    cursor: loading !== null ? 'not-allowed' : 'pointer',
                    opacity: loading !== null && loading !== 'vendor' ? 0.4 : 1,
                    transition: 'all 0.2s',
                    width: '100%',
                  }}
                  onMouseOver={e => { if (!loading) { e.currentTarget.style.background = 'rgba(221,184,245,0.08)'; e.currentTarget.style.borderColor = '#6B1F9A' } }}
                  onMouseOut={e => { if (!loading) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#DDB8F5' } }}
                >
                  {loading === 'vendor' ? 'Creating account…' : "I'm a vendor"}
                </button>
              </div>
            </div>
          </div>

          <p style={{
            textAlign: 'center', marginTop: '1.75rem',
            fontFamily: 'var(--font-space)', fontSize: '0.875rem',
            color: '#9CA3AF',
          }}>
            Already have an account?{' '}
            <Link href="/auth/signin" style={{
              color: 'var(--plum)', textDecoration: 'none', fontWeight: 600,
            }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
