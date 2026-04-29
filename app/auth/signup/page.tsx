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
  const [fullName, setFullName]       = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [confirm, setConfirm]         = useState('')
  const [loading, setLoading]         = useState<Role | null>(null)
  const [error, setError]             = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [referralSource, setReferralSource] = useState('')

  function isValidPassword(pw: string) {
    return pw.length >= 12 && /[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^a-zA-Z0-9]/.test(pw)
  }

  async function handleSignUp(role: Role) {
    setError(null)

    if (!fullName.trim()) { setError('Please enter your full name.'); return }
    if (!email.trim())    { setError('Please enter your email address.'); return }
    if (!isValidPassword(password)) { setError('Minimum 12 characters with at least one uppercase letter, number, and special character.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }

    setLoading(role)
    const supabase = getSupabaseClient()

    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { full_name: fullName.trim(), referral_source: referralSource || null } },
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
      referral_source: referralSource || null,
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
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'} autoComplete="new-password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(null) }}
                  placeholder="Min. 12 characters"
                  style={{ ...fieldStyle, paddingRight: '2.75rem' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#6B1F9A')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#DDB8F5')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    color: '#9CA3AF', display: 'flex', alignItems: 'center',
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {password.length > 0 && (
                <p style={{
                  fontFamily: 'var(--font-space)', fontSize: '0.8125rem', margin: 0,
                  color: isValidPassword(password) ? '#16a34a' : '#DC2626',
                }}>
                  Minimum 12 characters with at least one uppercase letter, number, and special character.
                </p>
              )}
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

            {/* How did you hear about us */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={labelStyle}>How did you hear about us?</label>
              <select
                value={referralSource}
                onChange={e => setReferralSource(e.target.value)}
                style={{
                  ...fieldStyle,
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  paddingRight: '2.5rem',
                  color: referralSource ? '#1A1A2E' : '#9CA3AF',
                  cursor: 'pointer',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#6B1F9A')}
                onBlur={e => (e.currentTarget.style.borderColor = '#DDB8F5')}
              >
                <option value="" disabled>Select an option</option>
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="Google">Google</option>
                <option value="Friend or family">Friend or family</option>
                <option value="Facebook">Facebook</option>
                <option value="Other">Other</option>
              </select>
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
