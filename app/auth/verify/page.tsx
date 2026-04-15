import { Syne, Space_Grotesk } from 'next/font/google'
import Link from 'next/link'

const syne = Syne({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-syne' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-space' })

export default function VerifyPage() {
  return (
    <div
      className={`${syne.variable} ${spaceGrotesk.variable} min-h-screen flex items-center justify-center px-4`}
      style={{ background: 'var(--plum)', fontFamily: 'var(--font-space), sans-serif' }}
    >
      {/* Background orbs */}
      <div style={{
        position: 'fixed', top: '-15%', right: '-15%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(221,184,245,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '-20%', left: '-10%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(45,8,69,0.6) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: 480 }}>
        {/* Icon */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%', margin: '0 auto 2rem',
          background: 'rgba(221,184,245,0.12)',
          border: '1px solid rgba(221,184,245,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem',
        }}>
          ✉️
        </div>

        {/* Logo */}
        <div style={{
          fontFamily: 'var(--font-syne)', fontWeight: 800,
          fontSize: '1.5rem', letterSpacing: '-0.03em',
          color: 'rgba(255,255,255,0.3)', marginBottom: '2rem',
        }}>
          evnti<span style={{ color: 'var(--lavender)' }}>.</span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-syne)', fontWeight: 700,
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          letterSpacing: '-0.025em', lineHeight: 1.1,
          color: 'var(--off-white)', marginBottom: '1.25rem',
        }}>
          Check your email
        </h1>

        <p style={{
          fontSize: '1rem', fontWeight: 300,
          color: 'var(--lavender)', lineHeight: 1.75,
          marginBottom: '0.75rem',
        }}>
          We sent a verification link to your email
        </p>

        <p style={{
          fontSize: '0.875rem', fontWeight: 300,
          color: 'rgba(221,184,245,0.5)', lineHeight: 1.7,
          marginBottom: '2.5rem',
        }}>
          Click the link in the email to activate your account.
          <br />It may take a minute or two to arrive.
        </p>

        {/* Tip box */}
        <div style={{
          background: 'rgba(221,184,245,0.07)',
          border: '1px solid rgba(221,184,245,0.15)',
          borderRadius: 16, padding: '1.25rem 1.5rem',
          marginBottom: '2.5rem',
          textAlign: 'left',
        }}>
          <p style={{ fontSize: '0.8rem', color: 'rgba(221,184,245,0.6)', lineHeight: 1.65 }}>
            <strong style={{ color: 'var(--lavender)', fontWeight: 600 }}>Tip:</strong>{' '}
            If you don&apos;t see the email, check your spam folder. The sender will be{' '}
            <span style={{ color: 'rgba(221,184,245,0.8)' }}>no-reply@mail.evnti.com</span>
          </p>
        </div>

        <Link
          href="/auth/signin"
          style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.6)',
            borderRadius: '100px', padding: '0.7rem 1.75rem',
            fontFamily: 'var(--font-space)', fontSize: '0.875rem', fontWeight: 500,
            textDecoration: 'none', transition: 'all 0.2s',
          }}
        >
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
