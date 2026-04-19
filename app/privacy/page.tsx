import Link from 'next/link'
import { Syne, Space_Grotesk } from 'next/font/google'

const syne = Syne({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-syne' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-space' })

const SECTIONS = [
  {
    id: undefined,
    heading: 'Introduction',
    body: 'Evnti App LLC (\u201cevnti\u201d, \u201cwe\u201d, \u201cus\u201d) operates evntiapp.com. This policy explains how we collect, use, and protect your personal information when you use our platform.',
  },
  {
    id: undefined,
    heading: 'Information We Collect',
    body: 'We collect information you provide directly: name, email, phone number, event details, and payment information. We also collect usage data including pages visited, features used, and device information.',
  },
  {
    id: undefined,
    heading: 'How We Use Your Information',
    body: 'We use your information to facilitate bookings between clients and vendors, process payments securely through Stripe, send transactional emails through Resend, provide AI-powered planning recommendations through Eve, and improve our platform.',
  },
  {
    id: undefined,
    heading: 'Payment Information',
    body: 'All payment processing is handled by Stripe. Evnti never stores raw card data. Stripe\u2019s privacy policy applies to all payment transactions.',
  },
  {
    id: undefined,
    heading: 'Sharing Your Information',
    body: 'We share your information only as necessary: with vendors you book, with payment processors (Stripe), with email providers (Resend), and as required by law. We never sell your personal data.',
  },
  {
    id: undefined,
    heading: 'Data Security',
    body: 'We use industry-standard security measures including encrypted connections (HTTPS), row-level security on our database, and secure authentication. However, no system is completely secure.',
  },
  {
    id: undefined,
    heading: 'Your Rights',
    body: 'You may request access to, correction of, or deletion of your personal data at any time by contacting us at hello@evntiapp.com.',
  },
  {
    id: 'cookies',
    heading: 'Cookies',
    body: 'We use essential cookies for authentication and session management. We do not use tracking or advertising cookies.',
  },
  {
    id: undefined,
    heading: 'Contact Us',
    body: 'For privacy questions, contact us at hello@evntiapp.com or Evnti App LLC, Houston, Texas.',
  },
]

export default function PrivacyPage() {
  return (
    <div
      className={`${syne.variable} ${spaceGrotesk.variable} min-h-screen bg-white`}
      style={{ fontFamily: 'var(--font-space), sans-serif' }}
    >
      {/* ── NAV ── */}
      <nav
        className="sticky top-0 z-30 flex items-center justify-between px-6 md:px-14 h-16"
        style={{
          background: 'rgba(255,255,255,0.94)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(74,14,110,0.07)',
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-syne)',
            fontWeight: 800,
            fontSize: '1.4rem',
            letterSpacing: '-0.03em',
            color: '#4A0E6E',
            textDecoration: 'none',
          }}
        >
          evnti<span style={{ color: '#DDB8F5' }}>.</span>
        </Link>

        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-space)',
            fontSize: '0.875rem',
            color: '#7C6B8A',
            textDecoration: 'none',
          }}
        >
          Back to home
        </Link>
      </nav>

      {/* ── HERO BANNER ── */}
      <div
        className="relative flex flex-col justify-end px-6 md:px-14"
        style={{ height: 220, overflow: 'hidden' }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: "url('/images/Hero.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,26,46,0.85)' }} />

        <div style={{ position: 'relative', zIndex: 1, paddingBottom: '2.5rem' }}>
          <p style={{
            fontFamily: 'var(--font-space)',
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#DDB8F5',
            marginBottom: '0.6rem',
          }}>
            Legal
          </p>
          <h1 style={{
            fontFamily: 'var(--font-syne)',
            fontWeight: 700,
            fontSize: 36,
            letterSpacing: '-0.025em',
            color: 'white',
            marginBottom: '0.5rem',
          }}>
            Privacy Policy
          </h1>
          <p style={{ fontFamily: 'var(--font-space)', fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)' }}>
            Last updated: April 19, 2026
          </p>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="px-6 py-16">
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {SECTIONS.map((section, i) => (
            <div
              key={section.heading}
              style={{ marginBottom: i < SECTIONS.length - 1 ? '2.5rem' : 0 }}
            >
              <h2
                id={section.id}
                style={{
                  fontFamily: 'var(--font-syne)',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  letterSpacing: '-0.015em',
                  color: '#4A0E6E',
                  marginBottom: '0.625rem',
                }}
              >
                {section.heading}
              </h2>
              <p style={{
                fontFamily: 'var(--font-space)',
                fontSize: '0.9375rem',
                fontWeight: 400,
                color: '#374151',
                lineHeight: 1.75,
                margin: 0,
              }}>
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div
        className="px-6 py-8"
        style={{ borderTop: '1px solid rgba(74,14,110,0.08)' }}
      >
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ maxWidth: 720, margin: '0 auto' }}
        >
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-syne)',
              fontWeight: 800,
              fontSize: '1.1rem',
              letterSpacing: '-0.03em',
              color: '#4A0E6E',
              textDecoration: 'none',
            }}
          >
            evnti<span style={{ color: '#DDB8F5' }}>.</span>
          </Link>

          <div className="flex gap-6">
            <Link
              href="/"
              style={{ fontFamily: 'var(--font-space)', fontSize: '0.8rem', color: '#9CA3AF', textDecoration: 'none' }}
            >
              Home
            </Link>
            <Link
              href="/vendor-terms"
              style={{ fontFamily: 'var(--font-space)', fontSize: '0.8rem', color: '#9CA3AF', textDecoration: 'none' }}
            >
              Vendor Terms
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
