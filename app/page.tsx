'use client'
import { useState, useEffect } from 'react'
import { Syne, Space_Grotesk } from 'next/font/google'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase'
import Image from 'next/image'
import {
  Wand2, Cpu, ShieldCheck, Clock,
  Check, Plus, TrendingUp, Star,
  Calendar, Search, Sparkles, Tag,
  Store, LayoutDashboard, Info, FileText,
  ChevronDown, X, Menu,
} from 'lucide-react'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne',
})
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-space',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ── Static data ──────────────────────────────────────────────────────────────

const TRUST = [
  { num: '500+', label: 'Verified\nvendors' },
  { num: '2 min', label: 'To your first\nAI plan' },
  { num: '$0', label: 'Planner\nfees' },
  { num: '4.9★', label: 'Average\nclient rating' },
]

const STEPS = [
  { index: '01', Icon: Wand2, title: 'Describe your event', body: 'Tell Evnti your event type, date, guest count, and budget. Takes about two minutes.' },
  { index: '02', Icon: Cpu, title: 'AI builds your plan', body: 'Personalised timeline, curated vendor shortlist, and smart budget split — all generated instantly.' },
  { index: '03', Icon: ShieldCheck, title: 'Book with confidence', body: 'Review profiles, read real reviews, message vendors, and pay securely — all in one place.' },
  { index: '04', Icon: Clock, title: 'Show up and celebrate', body: 'We handle the coordination. You show up on the day and enjoy every single moment.' },
]

const CATS = [
  { label: 'Venues',           count: '142 listed', img: '/images/venues.jpg' },
  { label: 'Photographers',    count: '89 listed',  img: '/images/photographers.jpg' },
  { label: 'Catering',         count: '67 listed',  img: '/images/catering.jpg' },
  { label: 'Music & DJs',      count: '53 listed',  img: '/images/music.jpg' },
  { label: 'Florists',         count: '44 listed',  img: '/images/florists.jpg' },
  { label: 'Cakes & Desserts', count: '38 listed',  img: '/images/cakes.jpg' },
  { label: 'Beauty & Hair',    count: '61 listed',  img: '/images/beauty.jpg' },
]

const FEAT_LIST = [
  'Instant vendor matches based on your budget and location',
  'Live budget tracker — get alerts before you overspend',
  'Automated timeline that updates as you book',
  'Ask anything, anytime — 24/7 planning support',
]

const BOOKINGS = [
  { name: 'Amara W. — Birthday party', amt: '$650' },
  { name: 'James & Priya — Wedding',   amt: '$2,400' },
  { name: 'TechCorp — Corporate gala', amt: '$1,770' },
]

const TESTIMONIALS = [
  {
    initials: 'AO', name: 'Adaeze Okonkwo', event: 'Wedding reception · Houston, TX',
    quote: 'I planned my entire wedding reception in one weekend. Every vendor Evnti suggested was exactly my vibe and within budget. I couldn\'t believe it.',
  },
  {
    initials: 'MR', name: 'Marcus Rivera', event: '30th birthday · Atlanta, GA',
    quote: 'As someone with no idea where to start, Evnti felt like having a professional planner in my pocket. Saved me thousands and so much stress.',
  },
  {
    initials: 'SC', name: 'Sasha Chen', event: 'Corporate event · Dallas, TX',
    quote: 'The budget tracker is worth it alone. I always knew where every dollar was going, and the AI flagged when I was about to overspend — before it happened.',
  },
]

const FAQS = [
  { q: 'Do I need a professional event planner?', a: "No — that's the point. Evnti's AI does what a planner does, at a fraction of the cost and without the scheduling hassle. You stay in control." },
  { q: 'How are vendors vetted?', a: 'Every vendor goes through a manual review by our team before being listed. We check credentials, reviews, and business legitimacy.' },
  { q: 'Is my payment secure?', a: 'Yes. All payments are processed through Stripe — the same infrastructure used by Amazon and Shopify. We never store your card details.' },
  { q: 'What types of events can I plan?', a: "Any event — birthdays, weddings, corporate gatherings, baby showers, graduation parties, and more. If there's a celebration, Evnti can plan it." },
  { q: 'When does Evnti launch?', a: "We're in early access right now. Join the waitlist and you'll be among the first to get in — with priority onboarding support included." },
  { q: 'Does Eve have a usage limit?', a: 'Each account gets 10 free Eve credits to start. Each conversation uses 1 credit. We offer additional credits as part of our premium plan — coming soon. This helps us keep Eve fast, accurate, and available for everyone.' },
  { q: 'How does evnti make money?', a: 'Evnti charges a small platform fee on each booking made through the app. This means you only pay when you book a vendor — no subscriptions, no hidden fees. Vendors keep the majority of what they earn.' },
]

// ── Types ────────────────────────────────────────────────────────────────────

type FormState = { email: string; submitted: boolean; loading: boolean; error: string | null }
const INIT_FORM: FormState = { email: '', submitted: false, loading: false, error: null }

// ── Component ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [hero, setHero]           = useState<FormState>(INIT_FORM)
  const [heroFocused, setHF]      = useState(false)
  const [cta, setCta]             = useState<FormState>(INIT_FORM)
  const [ctaFocused, setCF]       = useState(false)
  const [openFaq, setOpenFaq]               = useState<number | null>(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown]     = useState<'clients' | 'vendors' | null>(null)
  const [isLoggedIn, setIsLoggedIn]         = useState(false)
  const [isVendor, setIsVendor]             = useState(false)

  useEffect(() => {
    const sb = getSupabaseClient()
    sb.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      setIsLoggedIn(true)
      const { data: vp } = await sb
        .from('vendor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('application_status', 'approved')
        .single()
      setIsVendor(!!vp)
    })
  }, [])

  async function submitWaitlist(
    email: string,
    set: React.Dispatch<React.SetStateAction<FormState>>
  ) {
    set(s => ({ ...s, loading: true, error: null }))
    const { error: dbErr } = await supabase
      .from('waitlist')
      .insert({ email: email.trim().toLowerCase() })
    set(s => ({ ...s, loading: false }))
    if (dbErr) {
      set(s => ({
        ...s,
        error: dbErr.code === '23505'
          ? "You're already on the list. We'll be in touch soon."
          : 'Something went wrong. Please try again.',
      }))
      return
    }
    set(s => ({ ...s, submitted: true }))
  }

  const logoHref = isLoggedIn ? (isVendor ? '/vendor/dashboard' : '/dashboard') : '/'

  return (
    <div
      className={`${syne.variable} ${spaceGrotesk.variable}`}
      style={{ fontFamily: 'var(--font-space), sans-serif', background: 'var(--off-white)', color: 'var(--charcoal)', overflowX: 'hidden' }}
    >

      {/* ── 1. NAV ─────────────────────────────────────────────────────────── */}
      <nav
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          height: 64, background: 'white',
          borderBottom: '1px solid rgba(74,14,110,0.08)',
        }}
      >
        <div
          className="flex items-center justify-between h-full px-5 md:px-10"
          style={{ maxWidth: 1200, margin: '0 auto' }}
        >
          {/* Logo */}
          <a
            href={logoHref}
            style={{
              fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '1.45rem',
              letterSpacing: '-0.03em', color: '#4A0E6E', textDecoration: 'none', flexShrink: 0,
            }}
          >
            evnti<span style={{ color: '#DDB8F5' }}>.</span>
          </a>

          {/* ── Desktop center ── */}
          <div className="hidden md:flex items-center gap-1">

            {/* For Clients */}
            <div
              className="relative"
              onMouseEnter={() => setOpenDropdown('clients')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13.5px] font-medium transition-colors hover:bg-[#F8F4FC]"
                style={{
                  fontFamily: 'var(--font-space)', border: 'none', background: 'none', cursor: 'pointer',
                  color: openDropdown === 'clients' ? '#4A0E6E' : '#1A1A2E',
                }}
              >
                For Clients
                <ChevronDown
                  size={14}
                  style={{ color: '#7C6B8A', transition: 'transform 0.18s', transform: openDropdown === 'clients' ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>

              {/* Clients dropdown panel — always rendered, toggled via opacity */}
              <div
                style={{
                  position: 'absolute', top: 'calc(100% + 6px)', left: 0,
                  minWidth: 272, background: 'white', borderRadius: 12,
                  boxShadow: '0 8px 32px rgba(74,14,110,0.12)',
                  border: '1px solid rgba(74,14,110,0.07)',
                  opacity: openDropdown === 'clients' ? 1 : 0,
                  transform: openDropdown === 'clients' ? 'translateY(0)' : 'translateY(-6px)',
                  pointerEvents: openDropdown === 'clients' ? 'auto' : 'none',
                  transition: 'opacity 0.16s ease, transform 0.16s ease',
                  zIndex: 60, overflow: 'hidden',
                }}
              >
                <p
                  className="px-4 pt-3 pb-2 text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: '#7C6B8A', fontFamily: 'var(--font-space)', borderBottom: '1px solid #F3E8FF' }}
                >
                  For Clients
                </p>
                {([
                  { icon: <Calendar size={14} />, label: 'Plan an event',   desc: 'Start planning in 5 minutes',        href: '/onboarding' },
                  { icon: <Search   size={14} />, label: 'Browse vendors',  desc: 'Find verified Houston vendors',       href: '/vendors' },
                  { icon: <Sparkles size={14} />, label: 'Ask Eve',         desc: 'AI-powered planning assistant',       href: '/ai-plan' },
                  { icon: <Tag      size={14} />, label: 'Pricing',         desc: 'Free to use, pay only when you book', action: () => { setOpenDropdown(null); document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }) } },
                ] as { icon: React.ReactNode; label: string; desc: string; href?: string; action?: () => void }[]).map(item => {
                  const row = (
                    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F8F4FC] transition-colors cursor-pointer">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#F3E8FF', color: '#4A0E6E' }}>{item.icon}</div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#1A1A2E] leading-tight m-0" style={{ fontFamily: 'var(--font-syne)' }}>{item.label}</p>
                        <p className="text-[11px] text-[#7C6B8A] leading-snug m-0" style={{ fontFamily: 'var(--font-space)' }}>{item.desc}</p>
                      </div>
                    </div>
                  )
                  return item.href
                    ? <a key={item.label} href={item.href} style={{ textDecoration: 'none', display: 'block' }}>{row}</a>
                    : <button key={item.label} onClick={item.action} style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>{row}</button>
                })}
                <div style={{ height: 6 }} />
              </div>
            </div>

            {/* For Vendors */}
            <div
              className="relative"
              onMouseEnter={() => setOpenDropdown('vendors')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13.5px] font-medium transition-colors hover:bg-[#F8F4FC]"
                style={{
                  fontFamily: 'var(--font-space)', border: 'none', background: 'none', cursor: 'pointer',
                  color: openDropdown === 'vendors' ? '#4A0E6E' : '#1A1A2E',
                }}
              >
                For Vendors
                <ChevronDown
                  size={14}
                  style={{ color: '#7C6B8A', transition: 'transform 0.18s', transform: openDropdown === 'vendors' ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>

              <div
                style={{
                  position: 'absolute', top: 'calc(100% + 6px)', left: 0,
                  minWidth: 272, background: 'white', borderRadius: 12,
                  boxShadow: '0 8px 32px rgba(74,14,110,0.12)',
                  border: '1px solid rgba(74,14,110,0.07)',
                  opacity: openDropdown === 'vendors' ? 1 : 0,
                  transform: openDropdown === 'vendors' ? 'translateY(0)' : 'translateY(-6px)',
                  pointerEvents: openDropdown === 'vendors' ? 'auto' : 'none',
                  transition: 'opacity 0.16s ease, transform 0.16s ease',
                  zIndex: 60, overflow: 'hidden',
                }}
              >
                <p
                  className="px-4 pt-3 pb-2 text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: '#7C6B8A', fontFamily: 'var(--font-space)', borderBottom: '1px solid #F3E8FF' }}
                >
                  For Vendors
                </p>
                {([
                  { icon: <Store           size={14} />, label: 'Apply as a vendor', desc: 'Join the marketplace for free',       href: '/vendor/apply' },
                  { icon: <LayoutDashboard size={14} />, label: 'Vendor dashboard',  desc: 'Manage bookings and profile',          href: '/vendor/dashboard' },
                  { icon: <Info            size={14} />, label: 'How it works',      desc: 'See how evnti works for vendors',      action: () => { setOpenDropdown(null); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }) } },
                  { icon: <FileText        size={14} />, label: 'Vendor terms',      desc: 'Read our vendor agreement',            href: '/vendor-terms' },
                ] as { icon: React.ReactNode; label: string; desc: string; href?: string; action?: () => void }[]).map(item => {
                  const row = (
                    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F8F4FC] transition-colors cursor-pointer">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#F3E8FF', color: '#4A0E6E' }}>{item.icon}</div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#1A1A2E] leading-tight m-0" style={{ fontFamily: 'var(--font-syne)' }}>{item.label}</p>
                        <p className="text-[11px] text-[#7C6B8A] leading-snug m-0" style={{ fontFamily: 'var(--font-space)' }}>{item.desc}</p>
                      </div>
                    </div>
                  )
                  return item.href
                    ? <a key={item.label} href={item.href} style={{ textDecoration: 'none', display: 'block' }}>{row}</a>
                    : <button key={item.label} onClick={item.action} style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>{row}</button>
                })}
                <div style={{ height: 6 }} />
              </div>
            </div>

            {/* How it works */}
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-3.5 py-2 rounded-lg text-[13.5px] font-medium transition-colors hover:bg-[#F8F4FC]"
              style={{ fontFamily: 'var(--font-space)', border: 'none', background: 'none', cursor: 'pointer', color: '#1A1A2E' }}
            >
              How it works
            </button>
          </div>

          {/* ── Desktop right ── */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {isLoggedIn ? (
              <a
                href={isVendor ? '/vendor/dashboard' : '/dashboard'}
                style={{
                  background: '#4A0E6E', color: 'white',
                  borderRadius: 100, padding: '0.5rem 1.2rem',
                  fontFamily: 'var(--font-space)', fontSize: '0.85rem', fontWeight: 600,
                  textDecoration: 'none', transition: 'background 0.2s', whiteSpace: 'nowrap',
                }}
                onMouseOver={e => (e.currentTarget.style.background = '#6B1F9A')}
                onMouseOut={e => (e.currentTarget.style.background = '#4A0E6E')}
              >
                My Dashboard
              </a>
            ) : (
              <>
                <a
                  href="/auth/signin"
                  style={{
                    fontSize: '0.85rem', fontWeight: 500, color: '#1A1A2E',
                    textDecoration: 'none', fontFamily: 'var(--font-space)',
                    border: '1.5px solid rgba(74,14,110,0.18)', borderRadius: 100,
                    padding: '0.48rem 1.1rem', transition: 'border-color 0.2s, color 0.2s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#4A0E6E'; e.currentTarget.style.color = '#4A0E6E' }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(74,14,110,0.18)'; e.currentTarget.style.color = '#1A1A2E' }}
                >
                  Sign in
                </a>
                <a
                  href="/onboarding"
                  style={{
                    background: '#4A0E6E', color: 'white',
                    borderRadius: 100, padding: '0.5rem 1.2rem',
                    fontFamily: 'var(--font-space)', fontSize: '0.85rem', fontWeight: 600,
                    textDecoration: 'none', transition: 'background 0.2s', whiteSpace: 'nowrap',
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = '#6B1F9A')}
                  onMouseOut={e => (e.currentTarget.style.background = '#4A0E6E')}
                >
                  Get started free
                </a>
              </>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className="md:hidden flex items-center justify-center"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#4A0E6E' }}
            onClick={() => setMobileMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile full-screen overlay ── */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'white', overflowY: 'auto',
            display: 'flex', flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 flex-shrink-0"
            style={{ height: 64, borderBottom: '1px solid rgba(74,14,110,0.08)' }}
          >
            <a
              href={logoHref}
              style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '1.45rem', letterSpacing: '-0.03em', color: '#4A0E6E', textDecoration: 'none' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              evnti<span style={{ color: '#DDB8F5' }}>.</span>
            </a>
            <button
              onClick={() => setMobileMenuOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#4A0E6E' }}
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 px-5 py-6 flex flex-col gap-7">

            {/* For Clients section */}
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-widest mb-2"
                style={{ color: '#4A0E6E', fontFamily: 'var(--font-space)' }}
              >
                For Clients
              </p>
              {([
                { icon: <Calendar size={15} />, label: 'Plan an event',   desc: 'Start planning in 5 minutes',        href: '/onboarding' },
                { icon: <Search   size={15} />, label: 'Browse vendors',  desc: 'Find verified Houston vendors',       href: '/vendors' },
                { icon: <Sparkles size={15} />, label: 'Ask Eve',         desc: 'AI-powered planning assistant',       href: '/ai-plan' },
                { icon: <Tag      size={15} />, label: 'Pricing',         desc: 'Free to use, pay only when you book', action: () => { setMobileMenuOpen(false); setTimeout(() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }), 80) } },
              ] as { icon: React.ReactNode; label: string; desc: string; href?: string; action?: () => void }[]).map(item => {
                const row = (
                  <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#F8F4FC] transition-colors">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#F3E8FF', color: '#4A0E6E' }}>{item.icon}</div>
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A2E] leading-tight m-0" style={{ fontFamily: 'var(--font-syne)' }}>{item.label}</p>
                      <p className="text-xs text-[#7C6B8A] m-0" style={{ fontFamily: 'var(--font-space)' }}>{item.desc}</p>
                    </div>
                  </div>
                )
                return item.href
                  ? <a key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none', display: 'block' }}>{row}</a>
                  : <button key={item.label} onClick={item.action} style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>{row}</button>
              })}
            </div>

            {/* For Vendors section */}
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-widest mb-2"
                style={{ color: '#4A0E6E', fontFamily: 'var(--font-space)' }}
              >
                For Vendors
              </p>
              {([
                { icon: <Store           size={15} />, label: 'Apply as a vendor', desc: 'Join the marketplace for free',     href: '/vendor/apply' },
                { icon: <LayoutDashboard size={15} />, label: 'Vendor dashboard',  desc: 'Manage bookings and profile',        href: '/vendor/dashboard' },
                { icon: <Info            size={15} />, label: 'How it works',      desc: 'See how evnti works for vendors',    action: () => { setMobileMenuOpen(false); setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }), 80) } },
                { icon: <FileText        size={15} />, label: 'Vendor terms',      desc: 'Read our vendor agreement',          href: '/vendor-terms' },
              ] as { icon: React.ReactNode; label: string; desc: string; href?: string; action?: () => void }[]).map(item => {
                const row = (
                  <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#F8F4FC] transition-colors">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#F3E8FF', color: '#4A0E6E' }}>{item.icon}</div>
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A2E] leading-tight m-0" style={{ fontFamily: 'var(--font-syne)' }}>{item.label}</p>
                      <p className="text-xs text-[#7C6B8A] m-0" style={{ fontFamily: 'var(--font-space)' }}>{item.desc}</p>
                    </div>
                  </div>
                )
                return item.href
                  ? <a key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none', display: 'block' }}>{row}</a>
                  : <button key={item.label} onClick={item.action} style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>{row}</button>
              })}
            </div>

            {/* Bottom CTAs */}
            <div className="flex flex-col gap-2.5 mt-auto pt-4" style={{ borderTop: '1px solid rgba(74,14,110,0.08)' }}>
              {isLoggedIn ? (
                <a
                  href={isVendor ? '/vendor/dashboard' : '/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-3.5 rounded-xl font-bold text-white text-sm"
                  style={{ background: '#4A0E6E', fontFamily: 'var(--font-syne)', textDecoration: 'none' }}
                >
                  My Dashboard
                </a>
              ) : (
                <>
                  <a
                    href="/auth/signin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center py-3.5 rounded-xl text-sm font-semibold"
                    style={{
                      fontFamily: 'var(--font-space)', textDecoration: 'none', color: '#4A0E6E',
                      border: '1.5px solid rgba(74,14,110,0.25)',
                    }}
                  >
                    Sign in
                  </a>
                  <a
                    href="/onboarding"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center py-3.5 rounded-xl font-bold text-white text-sm"
                    style={{ background: '#4A0E6E', fontFamily: 'var(--font-syne)', textDecoration: 'none' }}
                  >
                    Get started free
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 2. HERO ────────────────────────────────────────────────────────── */}
      <section
        id="waitlist"
        className="relative grid grid-cols-1 md:grid-cols-2 min-h-screen"
        style={{ background: 'var(--plum-deep)' }}
      >
        {/* Mobile background image — hidden on md+ (right col takes over) */}
        <div className="absolute inset-0 md:hidden" style={{ zIndex: 0 }}>
          <Image src="/images/Hero.jpg" alt="" fill sizes="50vw" priority className="object-cover" />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,10,46,0.72)' }} />
        </div>

        {/* Left */}
        <div
          className="flex flex-col justify-center px-8 md:px-14 py-32 md:py-40"
          style={{ position: 'relative', zIndex: 2 }}
        >
          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2 w-fit mb-8"
            style={{
              background: 'rgba(221,184,245,0.12)',
              border: '1px solid rgba(221,184,245,0.25)',
              borderRadius: '100px', padding: '0.35rem 1rem',
              fontSize: '0.7rem', fontWeight: 600,
              color: 'var(--lavender)', letterSpacing: '0.12em', textTransform: 'uppercase',
            }}
          >
            <span style={{ width: 6, height: 6, background: 'var(--lavender)', borderRadius: '50%', display: 'inline-block', animation: 'blink 2s infinite' }} />
            Now accepting early access
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: 'var(--font-syne)', fontWeight: 800,
              fontSize: 'clamp(3rem, 5.5vw, 5rem)',
              lineHeight: 0.95, letterSpacing: '-0.04em',
              color: 'var(--off-white)', marginBottom: '1.75rem',
            }}
          >
            Plan your event.
            <span style={{ display: 'block', color: 'var(--lavender)', fontWeight: 300, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
              Effortlessly.
            </span>
          </h1>

          {/* Subtext */}
          <p style={{ fontSize: '1rem', fontWeight: 300, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, maxWidth: 400, marginBottom: '2.5rem' }}>
            Tell us your vision. Our AI matches you with top vendors, builds your timeline, and tracks every dollar — so you just show up and celebrate.
          </p>

          {/* Hero form */}
          <div style={{ maxWidth: 420 }}>
            {hero.submitted ? (
              <div
                className="flex flex-col items-center gap-3 text-center"
                style={{
                  background: 'rgba(221,184,245,0.08)', border: '1px solid rgba(221,184,245,0.2)',
                  borderRadius: 16, padding: '1.5rem',
                  animation: 'fadeUp 0.4s ease both',
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(221,184,245,0.15)', border: '1px solid rgba(221,184,245,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={16} color="var(--lavender)" strokeWidth={2.5} />
                </div>
                <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '1rem', color: 'var(--off-white)' }}>
                  You&apos;re on the list.
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                  We&apos;ll reach out when early access opens.
                </div>
              </div>
            ) : (
              <form
                onSubmit={e => { e.preventDefault(); submitWaitlist(hero.email, setHero) }}
              >
                <div
                  className="flex"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: `1px solid ${hero.error ? 'rgba(239,68,68,0.5)' : heroFocused ? 'rgba(221,184,245,0.4)' : 'rgba(221,184,245,0.2)'}`,
                    borderRadius: 14, padding: '6px 6px 6px 1.25rem',
                    marginBottom: '0.75rem', transition: 'border-color 0.2s',
                  }}
                >
                  <input
                    type="email" required
                    value={hero.email}
                    onChange={e => setHero(s => ({ ...s, email: e.target.value, error: null }))}
                    onFocus={() => setHF(true)}
                    onBlur={() => setHF(false)}
                    placeholder="Enter your email address"
                    disabled={hero.loading}
                    style={{
                      background: 'none', border: 'none', outline: 'none',
                      fontFamily: 'var(--font-space)', fontSize: '0.9rem',
                      color: 'white', flex: 1, minWidth: 0,
                      opacity: hero.loading ? 0.5 : 1,
                    }}
                  />
                  <button
                    type="submit"
                    disabled={hero.loading}
                    style={{
                      background: 'var(--lavender)', color: 'var(--plum)',
                      border: 'none', borderRadius: 10,
                      padding: '0.75rem 1.25rem',
                      fontFamily: 'var(--font-syne)', fontSize: '0.85rem', fontWeight: 700,
                      cursor: hero.loading ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap', opacity: hero.loading ? 0.6 : 1,
                      transition: 'opacity 0.2s', flexShrink: 0,
                    }}
                    onMouseOver={e => { if (!hero.loading) e.currentTarget.style.opacity = '0.88' }}
                    onMouseOut={e => { if (!hero.loading) e.currentTarget.style.opacity = '1' }}
                  >
                    {hero.loading ? 'Joining…' : 'Request access'}
                  </button>
                </div>
                {hero.error
                  ? <p style={{ fontSize: '0.75rem', color: 'rgba(239,100,100,0.9)', marginBottom: 4 }}>{hero.error}</p>
                  : <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)' }}>No spam. No credit card. Unsubscribe anytime.</p>
                }
              </form>
            )}
            <div className="flex items-center gap-3 mt-4">
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
            </div>
            <a
              href="/onboarding"
              style={{
                display: 'block', marginTop: '0.75rem', textAlign: 'center',
                fontFamily: 'var(--font-space)', fontSize: '0.875rem', fontWeight: 500,
                color: 'var(--lavender)', textDecoration: 'none', transition: 'opacity 0.2s',
              }}
              onMouseOver={e => (e.currentTarget.style.opacity = '0.75')}
              onMouseOut={e => (e.currentTarget.style.opacity = '1')}
            >
              Start Planning →
            </a>
          </div>
        </div>

        {/* Right — placeholder image + diagonal cut */}
        <div className="relative hidden md:block" style={{ minHeight: 500 }}>
          {/* Diagonal overlay on left edge */}
          <div style={{
            position: 'absolute', top: 0, left: -80, bottom: 0, width: 160,
            background: 'var(--plum-deep)',
            clipPath: 'polygon(0 0, 100% 0, 40% 100%, 0 100%)',
            zIndex: 2,
          }} />
          {/* Hero image */}
          <Image src="/images/Hero.jpg" alt="Elegant event setup" fill sizes="50vw" loading="eager" className="object-cover brightness-75 saturate-90" />
          {/* Gradient overlay */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to right, var(--plum-deep) 0%, transparent 40%)' }} />

          {/* Floating budget card */}
          <div style={{
            position: 'absolute', bottom: '3rem', right: '2.5rem', zIndex: 3,
            background: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(221,184,245,0.18)',
            borderRadius: 18, padding: '1.25rem 1.5rem',
            minWidth: 220,
          }}>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Budget tracked
            </div>
            <div style={{ fontFamily: 'var(--font-syne)', fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>
              $6,240
            </div>
            <div className="flex items-center gap-1" style={{ fontSize: '0.75rem', color: 'var(--lavender)', marginTop: '0.25rem' }}>
              of $8,000 — on track <Check size={11} strokeWidth={2.5} />
            </div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginTop: '0.75rem' }}>
              <div style={{ height: '100%', width: '78%', background: 'var(--lavender)', borderRadius: 2 }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. TRUST BAR ───────────────────────────────────────────────────── */}
      <div
        className="flex flex-wrap items-center justify-center gap-8 md:gap-14 px-8 py-5"
        style={{ background: 'var(--lavender-light)', borderBottom: '1px solid rgba(74,14,110,0.08)' }}
      >
        {TRUST.map((t, i) => (
          <div key={t.num} className="flex items-center gap-6">
            <div className="flex items-center gap-[0.625rem]">
              <span style={{ fontFamily: 'var(--font-syne)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--plum)' }}>
                {t.num}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.3, whiteSpace: 'pre-line' }}>
                {t.label}
              </span>
            </div>
            {i < TRUST.length - 1 && (
              <div className="hidden md:block" style={{ width: 1, height: 28, background: 'rgba(74,14,110,0.12)' }} />
            )}
          </div>
        ))}
      </div>

      {/* ── 4. HOW IT WORKS ────────────────────────────────────────────────── */}
      <section id="how-it-works" className="px-8 md:px-14 py-24" style={{ background: 'var(--off-white)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--plum-mid)', marginBottom: '0.875rem' }}>
            How it works
          </div>
          <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 'clamp(2rem, 3.5vw, 3rem)', lineHeight: 1.05, letterSpacing: '-0.025em', color: 'var(--charcoal)' }}>
            Four steps from idea<br />to{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--plum-mid)', fontFamily: 'Georgia, serif', fontWeight: 300 }}>unforgettable.</em>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 mt-16 items-center">
            {/* Steps */}
            <div className="flex flex-col">
              {STEPS.map((s, i) => (
                <div
                  key={s.index}
                  className="flex gap-6 py-7"
                  style={{
                    borderBottom: i < STEPS.length - 1 ? '1px solid rgba(74,14,110,0.07)' : 'none',
                    paddingTop: i === 0 ? 0 : undefined,
                    paddingBottom: i === STEPS.length - 1 ? 0 : undefined,
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-syne)', fontSize: '0.72rem', fontWeight: 700, color: 'rgba(74,14,110,0.25)', letterSpacing: '0.05em', minWidth: 28, paddingTop: 2 }}>
                    {s.index}
                  </span>
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--lavender-light)' }}
                  >
                    <s.Icon size={20} color="var(--plum)" strokeWidth={1.75} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-syne)', fontSize: '1rem', fontWeight: 600, color: 'var(--charcoal)', marginBottom: '0.35rem' }}>{s.title}</div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 300, color: 'var(--muted)', lineHeight: 1.65 }}>{s.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Chat mockup */}
            <div
              className="relative overflow-hidden rounded-3xl p-10"
              style={{ background: 'var(--plum)' }}
            >
              <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(221,184,245,0.06)', top: -80, right: -80 }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Chat header */}
                <div className="flex items-center gap-3 pb-4 mb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 34, height: 34, background: 'var(--lavender)', fontFamily: 'var(--font-syne)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--plum)' }}>
                    AI
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-syne)', fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>Evnti AI Planner</div>
                    <div className="flex items-center gap-1" style={{ fontSize: '0.65rem', color: '#4ade80' }}>
                      <span style={{ width: 5, height: 5, background: '#4ade80', borderRadius: '50%', display: 'inline-block' }} />
                      Online now
                    </div>
                  </div>
                </div>
                {/* Messages */}
                <div style={{ borderRadius: 14, padding: '0.875rem 1rem', fontSize: '0.82rem', lineHeight: 1.6, marginBottom: '0.625rem', maxWidth: '88%', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)', borderBottomLeftRadius: 4 }}>
                  Hi! Tell me about your event — what are you celebrating?
                </div>
                <div style={{ borderRadius: 14, padding: '0.875rem 1rem', fontSize: '0.82rem', lineHeight: 1.6, marginBottom: '0.625rem', marginLeft: 'auto', maxWidth: '88%', background: 'var(--lavender)', color: 'var(--plum)', fontWeight: 500, borderBottomRightRadius: 4 }}>
                  30th birthday, 80 guests, Houston, $8,000 budget
                </div>
                <div style={{ borderRadius: 14, padding: '0.875rem 1rem', fontSize: '0.82rem', lineHeight: 1.6, marginBottom: '0.625rem', maxWidth: '88%', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)', borderBottomLeftRadius: 4 }}>
                  Got it! Here&apos;s your plan: $3,200 venue · $2,500 catering · $800 photography · $600 DJ. I found 12 venues available on your dates. Want to see them?
                </div>
                {/* Suggestion chips */}
                <div className="flex flex-wrap gap-2 mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  {['Show venues', 'Adjust budget', 'Add florist', 'Full timeline'].map(chip => (
                    <span key={chip} style={{ background: 'rgba(221,184,245,0.1)', border: '1px solid rgba(221,184,245,0.2)', borderRadius: '100px', padding: '0.3rem 0.75rem', fontSize: '0.72rem', color: 'var(--lavender)', cursor: 'pointer' }}>
                      {chip}
                    </span>
                  ))}
                </div>
                {/* CTA */}
                <a
                  href="/ai-plan"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    marginTop: '1rem',
                    background: 'var(--lavender)', color: 'var(--plum)',
                    borderRadius: '100px', padding: '0.55rem 1.25rem',
                    fontFamily: 'var(--font-space)', fontSize: '0.8rem', fontWeight: 600,
                    textDecoration: 'none', transition: 'opacity 0.2s',
                  }}
                  onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseOut={e => (e.currentTarget.style.opacity = '1')}
                >
                  Talk to Eve →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. VENDOR CATEGORIES ───────────────────────────────────────────── */}
      <section className="px-8 md:px-14 py-24" style={{ background: 'var(--lavender-light)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--plum-mid)', marginBottom: '0.875rem' }}>
                Find your team
              </div>
              <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 'clamp(2rem, 3.5vw, 3rem)', lineHeight: 1.05, letterSpacing: '-0.025em', color: 'var(--charcoal)' }}>
                Every vendor you need,<br />
                <em style={{ fontStyle: 'italic', color: 'var(--plum-mid)', fontFamily: 'Georgia, serif', fontWeight: 300 }}>all in one place.</em>
              </h2>
            </div>
            <a
              href="/vendors"
              style={{
                background: 'transparent', border: '1.5px solid var(--plum)',
                color: 'var(--plum)', borderRadius: '100px',
                padding: '0.625rem 1.5rem',
                fontFamily: 'var(--font-space)', fontSize: '0.85rem', fontWeight: 500,
                textDecoration: 'none', whiteSpace: 'nowrap', transition: 'background 0.2s, color 0.2s',
                flexShrink: 0,
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'var(--plum)'; e.currentTarget.style.color = 'white' }}
              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--plum)' }}
            >
              Browse all vendors
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATS.map(cat => (
              <div
                key={cat.label}
                className="relative overflow-hidden rounded-[18px] cursor-pointer group"
                style={{ aspectRatio: '4/3' }}
              >
                {/* Category image */}
                <Image src={cat.img} alt={cat.label} fill sizes="25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                {/* Dark overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,10,46,0.85) 0%, transparent 55%)' }} />
                <span style={{ position: 'absolute', bottom: '1rem', left: '1rem', fontFamily: 'var(--font-syne)', fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>
                  {cat.label}
                </span>
                <span style={{
                  position: 'absolute', top: '0.75rem', right: '0.75rem',
                  background: 'rgba(221,184,245,0.2)', border: '1px solid rgba(221,184,245,0.3)',
                  borderRadius: '100px', padding: '0.2rem 0.6rem',
                  fontSize: '0.65rem', color: 'var(--lavender)',
                }}>
                  {cat.count}
                </span>
              </div>
            ))}

            {/* +20 more card */}
            <div
              className="flex flex-col items-center justify-center gap-1 rounded-[18px] cursor-pointer"
              style={{ aspectRatio: '4/3', background: 'var(--plum)' }}
            >
              <span style={{ fontFamily: 'var(--font-syne)', fontSize: '2rem', fontWeight: 800, color: 'var(--lavender)' }}>+20</span>
              <span style={{ fontSize: '0.75rem', color: 'rgba(221,184,245,0.55)' }}>more categories</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. FEATURE SPLIT ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ minHeight: 580 }}>
        {/* Left — feature image */}
        <div className="relative" style={{ minHeight: 320 }}>
          <Image src="/images/feature.jpg" alt="AI-powered event planning in action" fill sizes="50vw" className="object-cover" />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 55%, var(--plum-deep) 100%)' }} />
        </div>

        {/* Right — dark plum with diagonal left edge */}
        <div
          className="flex flex-col justify-center relative px-10 md:px-16 py-20"
          style={{ background: 'var(--plum-deep)', overflow: 'visible' }}
        >
          {/* Diagonal cut */}
          <div className="hidden lg:block" style={{
            position: 'absolute', top: 0, left: -80, bottom: 0, width: 160,
            background: 'var(--plum-deep)',
            clipPath: 'polygon(55% 0, 100% 0, 100% 100%, 0 100%)',
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--lavender)', opacity: 0.6, marginBottom: '0.875rem' }}>
              AI planning assistant
            </div>
            <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 'clamp(1.75rem, 3vw, 2.75rem)', lineHeight: 1.05, letterSpacing: '-0.025em', color: 'white', marginBottom: '1.25rem' }}>
              Your{' '}
              <em style={{ fontStyle: 'italic', color: 'var(--lavender)', fontFamily: 'Georgia, serif', fontWeight: 300 }}>smartest</em>
              <br />planning partner
            </h2>
            <p style={{ fontSize: '0.95rem', fontWeight: 300, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: '2rem' }}>
              Evnti&apos;s AI doesn&apos;t make generic suggestions. It learns your vision, your budget, and your style to build a plan that&apos;s entirely yours.
            </p>
            <ul className="flex flex-col gap-3">
              {FEAT_LIST.map(item => (
                <li key={item} className="flex items-start gap-3" style={{ fontSize: '0.875rem', fontWeight: 300, color: 'rgba(255,255,255,0.7)' }}>
                  <Check size={14} color="var(--lavender)" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 3 }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── 7. VENDOR PORTAL ───────────────────────────────────────────────── */}
      <section className="px-8 md:px-14 py-24" style={{ background: 'var(--off-white)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Left text */}
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--plum-mid)', marginBottom: '0.875rem' }}>
                For vendors
              </div>
              <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 'clamp(2rem, 3.5vw, 3rem)', lineHeight: 1.05, letterSpacing: '-0.025em', color: 'var(--charcoal)', marginBottom: '1.25rem' }}>
                Grow your business<br />
                with{' '}
                <em style={{ fontStyle: 'italic', color: 'var(--plum-mid)', fontFamily: 'Georgia, serif', fontWeight: 300 }}>less hustle.</em>
              </h2>
              <p style={{ fontSize: '0.95rem', fontWeight: 300, color: 'var(--muted)', lineHeight: 1.8, marginBottom: '2rem', maxWidth: 380 }}>
                List your services, get matched with clients who fit your niche and budget, and manage all your bookings from one clean dashboard.
              </p>
              <a
                href="/vendor/apply"
                style={{
                  display: 'inline-block', background: 'var(--plum)', color: 'white',
                  borderRadius: '100px', padding: '0.8rem 2rem',
                  fontFamily: 'var(--font-space)', fontSize: '0.9rem', fontWeight: 500,
                  textDecoration: 'none', transition: 'background 0.2s',
                }}
                onMouseOver={e => (e.currentTarget.style.background = 'var(--plum-mid)')}
                onMouseOut={e => (e.currentTarget.style.background = 'var(--plum)')}
              >
                Apply as a vendor
              </a>
            </div>

            {/* Right — dashboard card */}
            <div
              className="relative overflow-hidden rounded-3xl p-8"
              style={{ background: 'var(--plum)' }}
            >
              <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(221,184,245,0.07)' }} />
              {/* Header */}
              <div className="flex items-center justify-between pb-4 mb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontFamily: 'var(--font-syne)', fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>Vendor dashboard</span>
                <span style={{ background: 'rgba(221,184,245,0.15)', borderRadius: '100px', padding: '0.2rem 0.6rem', fontSize: '0.65rem', color: 'var(--lavender)' }}>Live</span>
              </div>
              {/* Revenue metric */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.25rem' }}>This month&apos;s revenue</div>
                <div style={{ fontFamily: 'var(--font-syne)', fontSize: '1.75rem', fontWeight: 700, color: 'white' }}>
                  $<span style={{ color: 'var(--lavender)' }}>4,820</span>
                </div>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginTop: '0.5rem' }}>
                  <div style={{ height: '100%', width: '72%', background: 'var(--lavender)', borderRadius: 2 }} />
                </div>
              </div>
              {/* Profile views */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.25rem' }}>Profile views this week</div>
                <div className="flex items-baseline gap-2" style={{ fontFamily: 'var(--font-syne)', fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>
                  247
                  <span className="flex items-center gap-1" style={{ fontSize: '0.8rem', color: '#4ade80', fontWeight: 400 }}>
                    <TrendingUp size={12} /> 18%
                  </span>
                </div>
              </div>
              {/* Recent bookings */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.25rem' }}>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.875rem' }}>
                  Recent bookings
                </div>
                {BOOKINGS.map(b => (
                  <div key={b.name} className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)' }}>{b.name}</span>
                    <span style={{ fontFamily: 'var(--font-syne)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--lavender)' }}>{b.amt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. TESTIMONIALS ────────────────────────────────────────────────── */}
      <section className="px-8 md:px-14 py-24" style={{ background: 'var(--charcoal)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--lavender)', opacity: 0.5, marginBottom: '0.875rem' }}>
            What people are saying
          </div>
          <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 'clamp(2rem, 3.5vw, 3rem)', lineHeight: 1.05, letterSpacing: '-0.025em', color: 'white' }}>
            Real events.<br />
            <em style={{ fontStyle: 'italic', color: 'var(--lavender)', fontFamily: 'Georgia, serif', fontWeight: 300 }}>Real results.</em>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12">
            {TESTIMONIALS.map(t => (
              <div
                key={t.initials}
                className="flex flex-col rounded-[20px] p-7"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(221,184,245,0.08)' }}
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} color="var(--lavender)" fill="var(--lavender)" strokeWidth={0} />
                  ))}
                </div>
                <p style={{ fontSize: '0.875rem', fontWeight: 300, fontStyle: 'italic', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, flex: 1, marginBottom: '1.5rem' }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center rounded-full flex-shrink-0"
                    style={{ width: 36, height: 36, background: 'rgba(221,184,245,0.15)', fontFamily: 'var(--font-syne)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--lavender)' }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-syne)', fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>{t.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>{t.event}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. FAQ ─────────────────────────────────────────────────────────── */}
      <section id="faq" className="px-8 md:px-14 py-24" style={{ background: 'var(--lavender-light)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-16 lg:gap-20 items-start">
            {/* Left */}
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--plum-mid)', marginBottom: '0.875rem' }}>
                Got questions?
              </div>
              <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 'clamp(2rem, 3.5vw, 3rem)', lineHeight: 1.05, letterSpacing: '-0.025em', color: 'var(--charcoal)' }}>
                We&apos;ve got<br />
                <em style={{ fontStyle: 'italic', color: 'var(--plum-mid)', fontFamily: 'Georgia, serif', fontWeight: 300 }}>answers.</em>
              </h2>
            </div>

            {/* Accordion */}
            <div className="mt-8 lg:mt-0 flex flex-col">
              {FAQS.map((faq, i) => (
                <div key={i} style={{ borderBottom: '1px solid rgba(74,14,110,0.1)' }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex justify-between items-center w-full text-left py-5 gap-4"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 500, color: openFaq === i ? 'var(--plum)' : 'var(--charcoal)', fontFamily: 'var(--font-space)', transition: 'color 0.2s' }}
                  >
                    {faq.q}
                    <span style={{ color: 'var(--plum-mid)', flexShrink: 0, transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'none', display: 'inline-flex' }}>
                      <Plus size={20} strokeWidth={1.75} />
                    </span>
                  </button>
                  {openFaq === i && (
                    <div style={{ fontSize: '0.875rem', fontWeight: 300, color: 'var(--muted)', lineHeight: 1.7, paddingBottom: '1.25rem' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 10. CTA STRIP ──────────────────────────────────────────────────── */}
      <div
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 px-8 md:px-14 py-20 flex-wrap"
        style={{ background: 'var(--plum)' }}
      >
        <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 'clamp(1.75rem, 3vw, 2.75rem)', lineHeight: 1.1, letterSpacing: '-0.02em', color: 'white', maxWidth: 500 }}>
          Your event deserves to be{' '}
          <span style={{ color: 'var(--lavender)' }}>unforgettable.</span>
        </h2>

        {cta.submitted ? (
          <div className="flex items-center gap-3" style={{ background: 'rgba(221,184,245,0.1)', border: '1px solid rgba(221,184,245,0.2)', borderRadius: 14, padding: '1rem 1.5rem' }}>
            <Check size={16} color="var(--lavender)" strokeWidth={2.5} />
            <span style={{ fontSize: '0.9rem', color: 'var(--lavender)', fontWeight: 500 }}>You&apos;re on the list — talk soon.</span>
          </div>
        ) : (
          <form
            onSubmit={e => { e.preventDefault(); submitWaitlist(cta.email, setCta) }}
            className="flex flex-col gap-3"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email" required
                value={cta.email}
                onChange={e => setCta(s => ({ ...s, email: e.target.value, error: null }))}
                onFocus={() => setCF(true)}
                onBlur={() => setCF(false)}
                placeholder="Enter your email"
                disabled={cta.loading}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: `1px solid ${ctaFocused ? 'rgba(221,184,245,0.4)' : 'rgba(255,255,255,0.15)'}`,
                  borderRadius: '100px', padding: '0.8rem 1.5rem',
                  fontFamily: 'var(--font-space)', fontSize: '0.9rem', color: 'white',
                  width: 280, outline: 'none', opacity: cta.loading ? 0.5 : 1,
                  transition: 'border-color 0.2s',
                }}
              />
              <button
                type="submit"
                disabled={cta.loading}
                style={{
                  background: 'white', color: 'var(--plum)',
                  border: 'none', borderRadius: '100px', padding: '0.8rem 1.75rem',
                  fontFamily: 'var(--font-syne)', fontSize: '0.875rem', fontWeight: 700,
                  cursor: cta.loading ? 'not-allowed' : 'pointer',
                  opacity: cta.loading ? 0.6 : 1, whiteSpace: 'nowrap',
                  transition: 'opacity 0.2s',
                }}
                onMouseOver={e => { if (!cta.loading) e.currentTarget.style.opacity = '0.88' }}
                onMouseOut={e => { if (!cta.loading) e.currentTarget.style.opacity = '1' }}
              >
                {cta.loading ? 'Joining…' : 'Get early access'}
              </button>
            </div>
            {cta.error && (
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,180,180,0.9)', paddingLeft: '1rem' }}>{cta.error}</p>
            )}
          </form>
        )}
      </div>

      {/* ── 11. FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="px-8 md:px-14 pt-14 pb-8" style={{ background: 'var(--charcoal)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-10" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.75rem' }}>
            {/* Brand col */}
            <div className="col-span-2 md:col-span-1">
              <div style={{ fontFamily: 'var(--font-syne)', fontSize: '1.4rem', fontWeight: 800, color: 'white', marginBottom: '0.625rem' }}>
                evnti<span style={{ color: 'var(--lavender)' }}>.</span>
              </div>
              <p style={{ fontSize: '0.8rem', fontWeight: 300, color: 'rgba(255,255,255,0.3)', lineHeight: 1.65, maxWidth: 220 }}>
                AI-powered event planning for everyone. No planner required.
              </p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: '1.25rem', marginBottom: '0.5rem', fontFamily: 'var(--font-space)' }}>
                Follow us
              </p>
              <div style={{ display: 'flex', gap: 16 }}>
                <a
                  href="https://www.instagram.com/_eventiapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2"
                  style={{ opacity: 1, transition: 'opacity 0.2s' }}
                  onMouseOver={e => (e.currentTarget.style.opacity = '0.7')}
                  onMouseOut={e => (e.currentTarget.style.opacity = '1')}
                  aria-label="Instagram"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="https://www.tiktok.com/@_eventi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2"
                  style={{ opacity: 1, transition: 'opacity 0.2s' }}
                  onMouseOver={e => (e.currentTarget.style.opacity = '0.7')}
                  onMouseOut={e => (e.currentTarget.style.opacity = '1')}
                  aria-label="TikTok"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
                  </svg>
                </a>
              </div>
            </div>
            {/* Product */}
            <div>
              <h4 style={{ fontFamily: 'var(--font-syne)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '0.875rem' }}>
                Product
              </h4>
              {([
                { label: 'How it works',      href: '#how-it-works' },
                { label: 'Vendor marketplace', href: '/vendors' },
                { label: 'AI planner',         href: '/ai-plan' },
                { label: 'Budget tools',       href: '/dashboard' },
              ] as { label: string; href: string }[]).map(({ label, href }) => (
                <a key={label} href={href} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 300, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', marginBottom: '0.5rem', transition: 'color 0.2s' }}
                  onMouseOver={e => (e.currentTarget.style.color = 'var(--lavender)')}
                  onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                >{label}</a>
              ))}
            </div>
            {/* Vendors */}
            <div>
              <h4 style={{ fontFamily: 'var(--font-syne)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '0.875rem' }}>
                Vendors
              </h4>
              {[{ label: 'Apply as vendor', href: '/vendor/apply' }, { label: 'Vendor dashboard', href: '/vendor/dashboard' }, { label: 'Success stories', href: '/vendors' }].map(({ label, href }) => (
                <a key={label} href={href} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 300, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', marginBottom: '0.5rem', transition: 'color 0.2s' }}
                  onMouseOver={e => (e.currentTarget.style.color = 'var(--lavender)')}
                  onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                >{label}</a>
              ))}
            </div>
            {/* Company */}
            <div>
              <h4 style={{ fontFamily: 'var(--font-syne)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '0.875rem' }}>
                Company
              </h4>
              <a href="mailto:easyeventsapps@gmail.com" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 300, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', marginBottom: '0.5rem', transition: 'color 0.2s' }}
                onMouseOver={e => (e.currentTarget.style.color = 'var(--lavender)')}
                onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
              >Contact</a>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.2)' }}>© 2026 Evnti. All rights reserved.</span>
            <div className="flex gap-6">
              {([
                { label: 'Privacy', href: '/privacy' },
                { label: 'Terms',   href: '/terms' },
                { label: 'Cookies', href: '/privacy#cookies' },
              ] as { label: string; href: string }[]).map(({ label, href }) => (
                <a key={label} href={href} style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.2)', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseOver={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                  onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
                >{label}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ── Global styles ───────────────────────────────────────────────────── */}
      <style>{`
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(255,255,255,0.3); }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
