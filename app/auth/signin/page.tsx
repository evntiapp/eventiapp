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
              Welcome back. Your next event awaits.
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
            Welcome back
          </h1>
          <p style={{
            fontFamily: 'var(--font-space)', fontWeight: 400,
            fontSize: '0.9375rem', color: '#6B7280',
            marginBottom: '2.25rem', marginTop: 0,
          }}>
            Sign in to your Evnti account to continue.
          </p>

          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{
                fontFamily: 'var(--font-space)', fontWeight: 500,
                fontSize: 13, color: '#374151',
              }}>
                Email address
              </label>
              <input
                type="email" required autoComplete="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(null) }}
                placeholder="you@example.com"
                disabled={loading}
                style={{
                  height: 52, borderRadius: 10,
                  border: '1.5px solid #DDB8F5',
                  padding: '0 1rem',
                  fontFamily: 'var(--font-space)', fontSize: '0.9375rem',
                  color: '#1A1A2E', outline: 'none',
                  background: '#fff',
                  opacity: loading ? 0.5 : 1,
                  transition: 'border-color 0.2s',
                  width: '100%', boxSizing: 'border-box',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#6B1F9A')}
                onBlur={e => (e.currentTarget.style.borderColor = '#DDB8F5')}
              />
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{
                fontFamily: 'var(--font-space)', fontWeight: 500,
                fontSize: 13, color: '#374151',
              }}>
                Password
              </label>
              <input
                type="password" required autoComplete="current-password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(null) }}
                placeholder="••••••••"
                disabled={loading}
                style={{
                  height: 52, borderRadius: 10,
                  border: '1.5px solid #DDB8F5',
                  padding: '0 1rem',
                  fontFamily: 'var(--font-space)', fontSize: '0.9375rem',
                  color: '#1A1A2E', outline: 'none',
                  background: '#fff',
                  opacity: loading ? 0.5 : 1,
                  transition: 'border-color 0.2s',
                  width: '100%', boxSizing: 'border-box',
                }}
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

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              style={{
                height: 52, borderRadius: 10,
                background: 'var(--plum)',
                color: 'white', border: 'none',
                fontFamily: 'var(--font-syne)', fontSize: '0.9375rem', fontWeight: 700,
                letterSpacing: '-0.01em',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.65 : 1,
                transition: 'opacity 0.2s, transform 0.15s',
                width: '100%',
              }}
              onMouseOver={e => { if (!loading) { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
              onMouseOut={e => { if (!loading) { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' } }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p style={{
            textAlign: 'center', marginTop: '1.75rem',
            fontFamily: 'var(--font-space)', fontSize: '0.875rem',
            color: '#9CA3AF',
          }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" style={{
              color: 'var(--plum)', textDecoration: 'none', fontWeight: 600,
            }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
