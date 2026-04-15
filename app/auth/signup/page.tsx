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

    // Insert into users table
    const { error: dbError } = await supabase.from('users').insert({
      id: data.user.id,
      email: email.trim().toLowerCase(),
      full_name: fullName.trim(),
      role,
      created_at: new Date().toISOString(),
    })

    setLoading(null)

    if (dbError) {
      // User was created in auth but profile insert failed — still redirect
      console.error('Profile insert error:', dbError)
    }

    // If email confirmation is required, show verify page
    if (!data.session) {
      router.push('/auth/verify')
      return
    }

    router.push(role === 'vendor' ? '/vendor' : '/onboarding')
  }

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(221,184,245,0.2)',
    borderRadius: 12, padding: '0.75rem 1rem',
    fontFamily: 'var(--font-space)', fontSize: '0.9rem',
    color: 'white', outline: 'none',
    transition: 'border-color 0.2s',
    width: '100%',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '0.8rem', fontWeight: 500,
    color: 'rgba(255,255,255,0.6)', letterSpacing: '0.02em',
  }

  return (
    <div
      className={`${syne.variable} ${spaceGrotesk.variable} min-h-screen flex items-center justify-center px-4 py-12`}
      style={{ background: 'var(--plum-deep)', fontFamily: 'var(--font-space), sans-serif' }}
    >
      {/* Background orb */}
      <div style={{
        position: 'fixed', bottom: '-20%', left: '-10%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(107,31,154,0.25) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <a href="/" style={{ display: 'block', textAlign: 'center', marginBottom: '2.5rem', textDecoration: 'none' }}>
          <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.03em', color: 'var(--off-white)' }}>
            evnti<span style={{ color: 'var(--lavender)' }}>.</span>
          </span>
        </a>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(221,184,245,0.12)',
          borderRadius: 24, padding: '2.5rem',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-syne)', fontWeight: 700,
            fontSize: '1.75rem', letterSpacing: '-0.025em',
            color: 'var(--off-white)', marginBottom: '0.5rem',
          }}>
            Create your account
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', marginBottom: '2rem' }}>
            Start planning unforgettable events
          </p>

          <div className="flex flex-col gap-4">
            {/* Full name */}
            <div className="flex flex-col gap-1.5">
              <label style={labelStyle}>Full name</label>
              <input
                type="text" autoComplete="name"
                value={fullName}
                onChange={e => { setFullName(e.target.value); setError(null) }}
                placeholder="Jane Smith"
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(221,184,245,0.5)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(221,184,245,0.2)')}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label style={labelStyle}>Email address</label>
              <input
                type="email" autoComplete="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(null) }}
                placeholder="you@example.com"
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(221,184,245,0.5)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(221,184,245,0.2)')}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label style={labelStyle}>Password</label>
              <input
                type="password" autoComplete="new-password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(null) }}
                placeholder="Min. 6 characters"
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(221,184,245,0.5)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(221,184,245,0.2)')}
              />
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label style={labelStyle}>Confirm password</label>
              <input
                type="password" autoComplete="new-password"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setError(null) }}
                placeholder="••••••••"
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(221,184,245,0.5)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(221,184,245,0.2)')}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 10, padding: '0.75rem 1rem',
                fontSize: '0.82rem', color: 'rgba(255,160,160,0.9)',
              }}>
                {error}
              </div>
            )}

            {/* Divider */}
            <div style={{ borderTop: '1px solid rgba(221,184,245,0.1)', paddingTop: '0.5rem' }}>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.875rem', textAlign: 'center' }}>
                I am joining as…
              </p>

              {/* Role buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  disabled={loading !== null}
                  onClick={() => handleSignUp('client')}
                  style={{
                    flex: 1,
                    background: loading === 'client' ? 'var(--lavender)' : 'rgba(221,184,245,0.1)',
                    color: loading === 'client' ? 'var(--plum)' : 'var(--lavender)',
                    border: '1.5px solid rgba(221,184,245,0.3)',
                    borderRadius: 12, padding: '0.85rem 1rem',
                    fontFamily: 'var(--font-syne)', fontSize: '0.85rem', fontWeight: 600,
                    cursor: loading !== null ? 'not-allowed' : 'pointer',
                    opacity: loading !== null && loading !== 'client' ? 0.4 : 1,
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={e => { if (!loading) { e.currentTarget.style.background = 'var(--lavender)'; e.currentTarget.style.color = 'var(--plum)' } }}
                  onMouseOut={e => { if (!loading) { e.currentTarget.style.background = 'rgba(221,184,245,0.1)'; e.currentTarget.style.color = 'var(--lavender)' } }}
                >
                  {loading === 'client' ? 'Creating account…' : "I'm planning an event"}
                </button>

                <button
                  type="button"
                  disabled={loading !== null}
                  onClick={() => handleSignUp('vendor')}
                  style={{
                    flex: 1,
                    background: loading === 'vendor' ? 'var(--plum-mid)' : 'rgba(255,255,255,0.05)',
                    color: 'white',
                    border: '1.5px solid rgba(255,255,255,0.12)',
                    borderRadius: 12, padding: '0.85rem 1rem',
                    fontFamily: 'var(--font-syne)', fontSize: '0.85rem', fontWeight: 600,
                    cursor: loading !== null ? 'not-allowed' : 'pointer',
                    opacity: loading !== null && loading !== 'vendor' ? 0.4 : 1,
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={e => { if (!loading) { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' } }}
                  onMouseOut={e => { if (!loading && loading !== 'vendor') { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' } }}
                >
                  {loading === 'vendor' ? 'Creating account…' : "I'm a vendor"}
                </button>
              </div>
            </div>
          </div>

          {/* Footer link */}
          <p style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)' }}>
            Already have an account?{' '}
            <Link href="/auth/signin" style={{ color: 'var(--lavender)', textDecoration: 'none', fontWeight: 500 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
