import Link from 'next/link'
import { Syne, Space_Grotesk } from 'next/font/google'

const syne = Syne({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-syne' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-space' })

const SECTIONS = [
  {
    heading: 'Acceptance of Terms',
    body: 'By accessing or using evntiapp.com, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use the platform.',
  },
  {
    heading: 'Use of Platform',
    body: 'Evnti is a marketplace that connects clients with vetted event vendors in Houston, Texas and beyond. Clients use evnti to browse vendor profiles, request bookings, communicate with vendors, and manage event planning. You agree to use the platform only for lawful purposes and in a manner consistent with these terms.',
  },
  {
    heading: 'Bookings and Payments',
    body: 'Booking requests are subject to vendor availability and confirmation. A deposit is required to secure a confirmed booking. Deposits are non-refundable unless otherwise agreed in writing with the vendor. The remaining balance is paid directly to the vendor according to terms agreed between you and the vendor. Evnti processes deposits securely through Stripe.',
  },
  {
    heading: 'AI Assistant',
    body: 'Eve, our AI planning assistant, provides general event planning suggestions based on information you provide. Eve\'s recommendations are for informational purposes only and do not constitute professional planning, legal, or financial advice. Always confirm details directly with vendors before making decisions.',
  },
  {
    heading: 'Vendor Relationships',
    body: 'Vendors listed on evnti are independent businesses. Evnti vets vendor applications but is not responsible for vendor performance, quality, cancellations, or disputes. Any issues arising from a booked service are between you and the vendor. Evnti may assist in mediation but assumes no liability for vendor actions.',
  },
  {
    heading: 'Prohibited Use',
    body: 'You may not use evnti to post false information, harass or defraud vendors or other users, scrape or extract platform data, attempt to circumvent payment systems, or violate any applicable law or regulation. Violations may result in immediate account termination.',
  },
  {
    heading: 'Termination',
    body: 'We reserve the right to suspend or terminate your account at any time for violation of these terms, fraudulent activity, or conduct that we determine is harmful to other users or the platform. You may close your account at any time by contacting us.',
  },
  {
    heading: 'Contact',
    body: 'For questions about these Terms of Service, contact us at hello@evntiapp.com or Evnti App LLC, Houston, Texas.',
  },
]

export default function TermsPage() {
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
            Terms of Service
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
              <h2 style={{
                fontFamily: 'var(--font-syne)',
                fontWeight: 700,
                fontSize: '1.1rem',
                letterSpacing: '-0.015em',
                color: '#4A0E6E',
                marginBottom: '0.625rem',
              }}>
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
              href="/privacy"
              style={{ fontFamily: 'var(--font-space)', fontSize: '0.8rem', color: '#9CA3AF', textDecoration: 'none' }}
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
