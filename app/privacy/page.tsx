import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{ padding: '1.25rem 2rem', borderBottom: '1px solid rgba(74,14,110,0.08)' }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: '1.4rem', color: '#4A0E6E', textDecoration: 'none', letterSpacing: '-0.03em' }}>
          evnti<span style={{ color: '#DDB8F5' }}>.</span>
        </Link>
      </nav>
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '4rem 2rem' }}>
        <h1 style={{ fontWeight: 700, fontSize: '2rem', color: '#1A1A2E', marginBottom: '1rem' }}>Privacy Policy</h1>
        <p style={{ color: '#7C6B8A', lineHeight: 1.7 }}>
          This page is coming soon. Please check back later.
        </p>
        <Link href="/" style={{ display: 'inline-block', marginTop: '2rem', color: '#4A0E6E', fontWeight: 600, textDecoration: 'none' }}>
          Back to home
        </Link>
      </main>
    </div>
  )
}
