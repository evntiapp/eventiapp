'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Syne, Space_Grotesk } from 'next/font/google'
import { getSupabaseClient } from '@/lib/supabase'

const syne = Syne({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-syne' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-space' })

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = getSupabaseClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setLoading(false)
      setError('Invalid email or password. Please try again.')
      return
    }

    // Fetch role from users table
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single()

    setLoading(false)

    if (userData?.role === 'vendor') {
      router.push('/vendor')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div
      className={`${syne.variable} ${spaceGrotesk.variable} min-h-screen flex items-center justify-center px-4`}
      style={{ background: 'var(--plum-deep)', fontFamily: 'var(--font-space), sans-serif' }}
    >
      {/* Background orb */}
      <div style={{
        position: 'fixed', top: '-20%', right: '-10%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(107,31,154,0.3) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
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
            Welcome back
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', marginBottom: '2rem' }}>
            Sign in to your Evnti account
          </p>

          <form onSubmit={handleSignIn} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.02em' }}>
                Email address
              </label>
              <input
                type="email" required autoComplete="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(null) }}
                placeholder="you@example.com"
                disabled={loading}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(221,184,245,0.2)',
                  borderRadius: 12, padding: '0.75rem 1rem',
                  fontFamily: 'var(--font-space)', fontSize: '0.9rem',
                  color: 'white', outline: 'none',
                  opacity: loading ? 0.5 : 1,
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(221,184,245,0.5)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(221,184,245,0.2)')}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.02em' }}>
                Password
              </label>
              <input
                type="password" required autoComplete="current-password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(null) }}
                placeholder="••••••••"
                disabled={loading}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(221,184,245,0.2)',
                  borderRadius: 12, padding: '0.75rem 1rem',
                  fontFamily: 'var(--font-space)', fontSize: '0.9rem',
                  color: 'white', outline: 'none',
                  opacity: loading ? 0.5 : 1,
                  transition: 'border-color 0.2s',
                }}
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

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              style={{
                background: 'var(--lavender)', color: 'var(--plum)',
                border: 'none', borderRadius: 12,
                padding: '0.85rem 1.5rem',
                fontFamily: 'var(--font-syne)', fontSize: '0.95rem', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'opacity 0.2s',
                marginTop: '0.25rem',
              }}
              onMouseOver={e => { if (!loading) e.currentTarget.style.opacity = '0.88' }}
              onMouseOut={e => { if (!loading) e.currentTarget.style.opacity = '1' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Footer link */}
          <p style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" style={{ color: 'var(--lavender)', textDecoration: 'none', fontWeight: 500 }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
