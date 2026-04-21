'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Syne, Space_Grotesk, Cormorant_Garamond } from 'next/font/google'
import { getSupabaseClient } from '@/lib/supabase'
import {
  Gem, Cake, Building2, Users, Heart, GraduationCap, Star, Sparkles,
  Leaf, Crown,
  ArrowLeft, ArrowRight,
  Plane, MapPin,
  Upload,
  Tag, CalendarDays, Wallet,
  ImageIcon, DollarSign, CheckCircle2, Circle,
  type LucideIcon,
} from 'lucide-react'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300'],
  style: ['italic'],
  variable: '--font-cormorant',
})

// ── Data ──────────────────────────────────────────────────────────────────────

const EVENT_TYPES: { Icon: LucideIcon; label: string; sub: string }[] = [
  { Icon: Gem,           label: 'Wedding',        sub: 'Local or destination' },
  { Icon: Cake,          label: 'Birthday',       sub: 'Any age, any scale' },
  { Icon: Building2,     label: 'Corporate',      sub: 'Conferences, galas' },
  { Icon: Users,         label: 'Social Party',   sub: 'Friends & family' },
  { Icon: Heart,         label: 'Baby Shower',    sub: 'Gender reveals too' },
  { Icon: GraduationCap, label: 'Graduation',     sub: 'All levels' },
  { Icon: Star,          label: 'Kids Party',     sub: 'Play places & more' },
  { Icon: Sparkles,      label: 'Something Else', sub: "We've got you" },
]

const KEYWORDS = [
  'Candlelit', 'Outdoor', 'Rooftop', 'Garden', 'Ballroom', 'Tropical',
  'Fairy Lights', 'Floral Wall', 'Black Tie', 'Casual Chic', 'Sunset',
  'Dance Floor', 'Waterfront', 'Minimalist', 'Maximalist', 'Cultural',
]

const COLOR_SWATCHES: { color: string; name: string; hasBorder?: true }[] = [
  { color: '#F5E6D3', name: 'Champagne' },
  { color: '#1A1A2E', name: 'Midnight' },
  { color: '#D4AF37', name: 'Gold' },
  { color: '#C0392B', name: 'Deep Red' },
  { color: '#F8C8D4', name: 'Blush' },
  { color: '#2ECC71', name: 'Sage' },
  { color: '#5DADE2', name: 'Sky Blue' },
  { color: '#784212', name: 'Terracotta' },
  { color: '#DDB8F5', name: 'Lavender' },
  { color: '#F0F0F0', name: 'White', hasBorder: true },
]

const BUDGET_PRESETS = [
  { label: '$2.5K',  value: 2500 },
  { label: '$5K',    value: 5000 },
  { label: '$15K',   value: 15000 },
  { label: '$50K',   value: 50000 },
  { label: '$250K+', value: 250000 },
]

const TIERS: { Icon: LucideIcon; name: string; range: string }[] = [
  { Icon: Leaf,     name: 'Affordable',     range: 'Budget-friendly picks' },
  { Icon: Sparkles, name: 'Mid-Range',      range: 'Best value vendors' },
  { Icon: Gem,      name: 'Luxury',         range: 'Premium experience' },
  { Icon: Crown,    name: 'Ultra High-End', range: 'No limits' },
]

// ── Shared sub-components ─────────────────────────────────────────────────────

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-9 h-9 rounded-xl border cursor-pointer flex items-center justify-center mb-6 transition-all duration-150 hover:-translate-x-0.5"
      style={{ background: 'transparent', borderColor: 'rgba(74,14,110,0.12)', color: 'var(--charcoal)' }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--plum)'
        ;(e.currentTarget as HTMLElement).style.color = 'var(--plum)'
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(74,14,110,0.12)'
        ;(e.currentTarget as HTMLElement).style.color = 'var(--charcoal)'
      }}
    >
      <ArrowLeft size={16} strokeWidth={2} />
    </button>
  )
}

function NavDots({ active }: { active: number }) {
  return (
    <div className="flex justify-center gap-2 py-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-1.5 rounded-full transition-all duration-300"
          style={{
            width: i === active ? '20px' : '6px',
            background: i === active ? 'var(--plum)' : 'rgba(74,14,110,0.15)',
          }}
        />
      ))}
    </div>
  )
}

function NextBtn({
  label,
  onClick,
  disabled,
  showArrow = true,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  showArrow?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full text-white text-[16px] font-bold border-none rounded-[14px] px-6 cursor-pointer flex items-center justify-center gap-2.5 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ fontFamily: 'var(--font-syne)', background: 'var(--plum)', letterSpacing: '-0.01em', height: 56 }}
      onMouseEnter={e => {
        if (!disabled) {
          ;(e.currentTarget as HTMLElement).style.background = 'var(--plum-mid)'
          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
        }
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLElement).style.background = 'var(--plum)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
      }}
    >
      {label}
      {showArrow && <ArrowRight size={16} strokeWidth={2.5} />}
    </button>
  )
}

function StepLabel({ step }: { step: string }) {
  return (
    <div
      className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-2"
      style={{ fontFamily: 'var(--font-space)', color: 'var(--muted)' }}
    >{step}</div>
  )
}

function StepQuestion({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-bold tracking-[-0.5px] leading-[1.15] text-2xl md:text-[32px]"
      style={{ fontFamily: 'var(--font-syne)', color: 'var(--charcoal)', fontWeight: 700 }}
    >{children}</div>
  )
}

function StepHint({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[14px] font-light mt-2 leading-[1.6]"
      style={{ fontFamily: 'var(--font-space)', color: 'var(--muted)' }}
    >{children}</div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-3"
      style={{ fontFamily: 'var(--font-space)', color: 'var(--muted)' }}
    >{children}</div>
  )
}

function InputField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-white border rounded-xl px-4 outline-none transition-colors duration-200 placeholder:text-[#C0ACD4] ${props.className ?? ''}`}
      style={{
        fontFamily: 'var(--font-space)', color: 'var(--charcoal)',
        borderColor: 'rgba(74,14,110,0.12)',
        height: 52, fontSize: '0.9375rem',
        ...props.style,
      }}
      onFocus={e => { e.currentTarget.style.borderColor = 'var(--plum)'; props.onFocus?.(e) }}
      onBlur={e => { e.currentTarget.style.borderColor = 'rgba(74,14,110,0.12)'; props.onBlur?.(e) }}
    />
  )
}

// ── Split layout shell ────────────────────────────────────────────────────────

function SplitShell({
  bgImage,
  leftPanel,
  children,
}: {
  bgImage: string
  leftPanel: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col lg:flex-row" style={{ minHeight: '100vh', background: '#fff' }}>
      {/* Left panel — image banner on mobile, sticky full-height on lg */}
      <div
        className="relative overflow-hidden flex-shrink-0 w-full h-[200px] lg:w-[40%] lg:min-w-[340px] lg:h-screen lg:sticky lg:top-0"
        style={{ background: 'var(--plum)' }}
      >
        {/* Background photo */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url('${bgImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        {/* Dark plum overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,26,46,0.7)', zIndex: 1 }} />
        {/* Content — hidden on mobile, shown on lg */}
        <div className="hidden lg:flex" style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '3rem 3.5rem',
        }}>
          {leftPanel}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1" style={{ background: '#fff' }}>
        {/* Mobile logo bar */}
        <div
          className="lg:hidden sticky top-0 z-10 flex items-center px-6 py-4"
          style={{ background: '#fff', borderBottom: '1px solid rgba(74,14,110,0.06)' }}
        >
          <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--plum)', letterSpacing: '-0.03em' }}>
            evnti<span style={{ color: 'var(--lavender)' }}>.</span>
          </span>
        </div>

        {/* Content */}
        <div className="px-6 py-8 pb-16 md:px-10 md:py-12 md:pb-20" style={{ maxWidth: 520, margin: '0 auto' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ── Left panel: quote variant (steps 1–4) ─────────────────────────────────────

function QuotePanel({ step, quote }: { step: number; quote: string }) {
  return (
    <>
      {/* Logo */}
      <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '1.5rem', color: 'white', letterSpacing: '-0.03em' }}>
        evnti<span style={{ color: 'var(--lavender)' }}>.</span>
      </div>

      {/* Quote */}
      <div>
        <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(221,184,245,0.4)', marginBottom: '1.5rem' }}>
          Step {step} of 5
        </div>
        <blockquote style={{
          margin: 0,
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
          fontSize: 'clamp(1.35rem, 1.8vw, 1.9rem)',
          fontWeight: 300,
          color: 'white',
          lineHeight: 1.45,
          letterSpacing: '-0.02em',
        }}>
          &ldquo;{quote}&rdquo;
        </blockquote>
      </div>

      {/* Progress bars */}
      <div className="flex gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{
            height: 2,
            flex: 1,
            borderRadius: 2,
            background: i < step ? 'var(--lavender)' : 'rgba(221,184,245,0.2)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
    </>
  )
}

// ── Left panel: review summary (step 5) ───────────────────────────────────────

function ReviewPanel({
  eventType,
  location,
  eventDate,
  guestCount,
  budget,
  selectedTier,
}: {
  eventType: string | null
  location: string
  eventDate: string
  guestCount: string
  budget: number
  selectedTier: string | null
}) {
  const items = [
    { label: 'Event',    value: eventType || '—' },
    { label: 'Location', value: location   || '—' },
    { label: 'Date',     value: eventDate  || '—' },
    { label: 'Guests',   value: guestCount ? `${guestCount} guests` : '—' },
    { label: 'Budget',   value: `$${budget.toLocaleString()}` },
    { label: 'Tier',     value: selectedTier || '—' },
  ]

  return (
    <>
      {/* Logo */}
      <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '1.5rem', color: 'white', letterSpacing: '-0.03em' }}>
        evnti<span style={{ color: 'var(--lavender)' }}>.</span>
      </div>

      {/* Summary */}
      <div>
        <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(221,184,245,0.4)', marginBottom: '1.75rem' }}>
          Your Event Summary
        </div>
        <div className="flex flex-col gap-5">
          {items.map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(221,184,245,0.38)', marginBottom: '0.2rem' }}>
                {label}
              </div>
              <div style={{ fontFamily: 'var(--font-syne)', fontSize: '1.05rem', fontWeight: 600, color: 'white', lineHeight: 1.2 }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress — all complete */}
      <div className="flex gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ height: 2, flex: 1, borderRadius: 2, background: 'var(--lavender)' }} />
        ))}
      </div>
    </>
  )
}

// ── Page component ────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()

  const [screen, setScreen]                     = useState(0)
  const [eventType, setEventType]               = useState<string | null>(null)
  const [dreamText, setDreamText]               = useState('')
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set())
  const [selectedColors, setSelectedColors]     = useState<string[]>([])
  const [eventDate, setEventDate]               = useState('')
  const [isDestination, setIsDestination]       = useState<boolean | null>(null)
  const [location, setLocation]                 = useState('')
  const [guestCount, setGuestCount]             = useState('')
  const [duration, setDuration]                 = useState('')
  const [requirements, setRequirements]         = useState('')
  const [budget, setBudget]                     = useState(5000)
  const [selectedTier, setSelectedTier]         = useState<string | null>(null)
  const [previewImages, setPreviewImages]       = useState<string[]>([])
  const [generating, setGenerating]             = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function toggleKeyword(kw: string) {
    setSelectedKeywords(prev => {
      const next = new Set(prev)
      next.has(kw) ? next.delete(kw) : next.add(kw)
      return next
    })
  }

  function toggleColor(name: string) {
    setSelectedColors(prev =>
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    )
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 6)
    setPreviewImages(files.map(f => URL.createObjectURL(f)))
  }

  async function handleGenerate() {
    setGenerating(true)
    setScreen(6)

    try {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      const { data: inserted } = await supabase.from('events').insert({
        client_id:            user?.id ?? null,
        event_type:           eventType,
        description:          dreamText,
        keywords:             Array.from(selectedKeywords),
        colors:               selectedColors,
        event_date:           eventDate || null,
        location:             location || null,
        guest_count:          guestCount ? parseInt(guestCount, 10) : null,
        duration:             duration || null,
        special_requirements: requirements || null,
        total_budget:         budget,
        tier:                 selectedTier,
        status:               'planning',
        created_at:           new Date().toISOString(),
      }).select('id').single()

      await new Promise(r => setTimeout(r, 2800))
      router.push(inserted?.id ? `/events/${inserted.id}` : '/dashboard')
    } catch {
      await new Promise(r => setTimeout(r, 2800))
      router.push('/dashboard')
    }
  }

  return (
    <div
      className={`${syne.variable} ${spaceGrotesk.variable} ${cormorant.variable} overflow-x-hidden`}
      style={{ fontFamily: 'var(--font-space), sans-serif' }}
    >
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn   { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      {/* ── SCREEN 0: SPLASH ─────────────────────────────────────────────── */}
      {screen === 0 && (
        <div className="flex flex-col md:flex-row overflow-x-hidden" style={{ minHeight: '100vh', width: '100%' }}>

          {/* ── LEFT PANEL (60%) ── */}
          <div className="relative overflow-hidden flex-shrink-0 w-full h-[200px] md:w-[60%] md:h-auto md:min-h-screen">
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: "url('/images/Hero.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }} />
            {/* Dark overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(26,26,46,0.7)',
              zIndex: 1,
            }} />

            {/* Logo — top left */}
            <a href="/" style={{
              position: 'absolute', top: 20, left: 24,
              zIndex: 2, textDecoration: 'none',
            }}>
              <span style={{
                fontFamily: 'var(--font-syne)', fontWeight: 800,
                fontSize: 24, letterSpacing: '-0.03em', color: 'white',
              }}>
                evnti<span style={{ color: 'var(--lavender)' }}>.</span>
              </span>
            </a>

            {/* Bottom-left content — hidden on mobile */}
            <div className="hidden md:block" style={{
              position: 'absolute', bottom: 60, left: 60,
              zIndex: 2, maxWidth: 480,
              animation: 'fadeUp 0.6s 0.1s ease both',
            }}>
              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                marginBottom: '1.75rem',
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--lavender)', flexShrink: 0,
                }} />
                <span style={{
                  fontFamily: 'var(--font-space)', fontWeight: 500,
                  fontSize: 12, letterSpacing: '0.15em',
                  textTransform: 'uppercase' as const, color: 'var(--lavender)',
                }}>
                  Now accepting early access
                </span>
              </div>

              {/* Headline */}
              <div style={{
                fontFamily: 'var(--font-syne)', fontWeight: 800,
                fontSize: 64, lineHeight: 1.0,
                letterSpacing: '-2px', color: 'white',
              }}>
                Plan your event.
              </div>
              <div style={{
                fontFamily: 'var(--font-cormorant)', fontWeight: 300,
                fontStyle: 'italic',
                fontSize: 64, lineHeight: 1.1,
                letterSpacing: '-1px',
                color: 'var(--lavender)',
                marginBottom: '1.25rem',
              }}>
                Effortlessly.
              </div>
              <p style={{
                fontFamily: 'var(--font-space)', fontWeight: 300,
                fontSize: 18, lineHeight: 1.7,
                color: 'rgba(255,255,255,0.7)',
                maxWidth: 400, margin: 0,
              }}>
                Your AI-powered event planner. From kids&apos; play parties to
                Lake Como weddings — we handle every single detail.
              </p>
            </div>
          </div>

          {/* ── RIGHT PANEL (40%) ── */}
          <div className="w-full md:w-[40%] flex-shrink-0 flex items-center justify-center px-6 py-10 md:px-12 md:py-[60px]" style={{
            background: '#ffffff',
            boxSizing: 'border-box',
          }}>
            <div style={{
              width: '100%',
              maxWidth: 380,
              animation: 'fadeUp 0.55s 0.2s ease both',
            }}>
              {/* Heading */}
              <h1 style={{
                fontFamily: 'var(--font-syne)', fontWeight: 700,
                fontSize: 36, letterSpacing: '-0.025em',
                color: '#1A1A2E', marginBottom: '0.625rem', marginTop: 0,
              }}>
                Get started
              </h1>
              <p style={{
                fontFamily: 'var(--font-space)', fontWeight: 400,
                fontSize: 16, color: '#6B7280',
                marginBottom: '2.5rem', marginTop: 0, lineHeight: 1.65,
              }}>
                Plan your next event in minutes with AI-powered vendor matching.
              </p>

              {/* Start Planning button */}
              <button
                onClick={() => setScreen(1)}
                style={{
                  width: '100%', height: 56,
                  background: '#4A0E6E', color: 'white',
                  border: 'none', borderRadius: 12,
                  fontFamily: 'var(--font-syne)', fontSize: 18, fontWeight: 700,
                  letterSpacing: '-0.01em',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  transition: 'transform 0.15s, opacity 0.15s',
                  marginBottom: '1.25rem',
                  boxSizing: 'border-box',
                }}
                onMouseEnter={e => {
                  ;(e.currentTarget as HTMLElement).style.opacity = '0.88'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLElement).style.opacity = '1'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                }}
              >
                Start Planning
                <ArrowRight size={17} strokeWidth={2.5} />
              </button>

              {/* Divider */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                marginBottom: '1.25rem',
              }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(74,14,110,0.1)' }} />
                <span style={{
                  fontFamily: 'var(--font-space)', fontSize: 13,
                  color: '#9CA3AF', fontWeight: 400,
                }}>or</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(74,14,110,0.1)' }} />
              </div>

              {/* Sign in link button */}
              <Link
                href="/auth/signin"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '100%', height: 56,
                  background: 'white', color: '#4A0E6E',
                  border: '1.5px solid #4A0E6E', borderRadius: 12,
                  fontFamily: 'var(--font-syne)', fontSize: 16, fontWeight: 600,
                  letterSpacing: '-0.01em',
                  textDecoration: 'none',
                  transition: 'background 0.15s',
                  marginBottom: '2rem',
                  boxSizing: 'border-box',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(74,14,110,0.04)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white' }}
              >
                Sign in to existing account
              </Link>

              {/* Terms */}
              <p style={{
                fontFamily: 'var(--font-space)', fontSize: 11,
                color: '#9CA3AF', textAlign: 'center',
                lineHeight: 1.6, margin: 0,
              }}>
                By continuing you agree to our{' '}
                <a href="/terms" style={{ color: '#6B7280', textDecoration: 'underline' }}>Terms</a>
                {' '}and{' '}
                <a href="/privacy" style={{ color: '#6B7280', textDecoration: 'underline' }}>Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── SCREEN 1: EVENT TYPE ─────────────────────────────────────────── */}
      {screen === 1 && (
        <SplitShell
          bgImage="/images/Hero.jpg"
          leftPanel={
            <QuotePanel
              step={1}
              quote="Every celebration deserves to be unforgettable."
            />
          }
        >
          <BackBtn onClick={() => setScreen(0)} />
          <StepLabel step="Step 1 of 5" />
          <StepQuestion>What are we celebrating?</StepQuestion>

          <div className="grid grid-cols-2 gap-3 mt-7 mb-7">
            {EVENT_TYPES.map(({ Icon, label, sub }) => {
              const selected = eventType === label
              return (
                <div
                  key={label}
                  className="bg-white border rounded-xl cursor-pointer transition-all duration-200 flex flex-col justify-center"
                  style={{
                    minHeight: 80, padding: '1.125rem 1.25rem',
                    borderColor: selected ? 'var(--plum)' : 'rgba(74,14,110,0.1)',
                    background: selected ? 'var(--lavender-light)' : 'white',
                    boxShadow: selected
                      ? '0 0 0 1px var(--plum), 0 4px 16px rgba(74,14,110,0.1)'
                      : '0 1px 4px rgba(74,14,110,0.05)',
                  }}
                  onClick={() => setEventType(label)}
                  onMouseEnter={e => {
                    if (!selected) {
                      ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--plum)'
                      ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(74,14,110,0.1)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!selected) {
                      ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(74,14,110,0.1)'
                      ;(e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(74,14,110,0.05)'
                    }
                  }}
                >
                  <Icon size={20} strokeWidth={1.75} style={{ color: 'var(--plum)', marginBottom: 10 }} />
                  <div className="text-[14px] font-semibold leading-tight mb-1" style={{ fontFamily: 'var(--font-syne)', color: 'var(--charcoal)' }}>{label}</div>
                  <div className="text-[12px] font-light" style={{ fontFamily: 'var(--font-space)', color: 'var(--muted)' }}>{sub}</div>
                </div>
              )
            })}
          </div>

          <NavDots active={0} />
          <NextBtn label="Continue" onClick={() => setScreen(2)} />
        </SplitShell>
      )}

      {/* ── SCREEN 2: DESCRIBE YOUR EVENT ────────────────────────────────── */}
      {screen === 2 && (
        <SplitShell
          bgImage="/images/feature.jpg"
          leftPanel={
            <QuotePanel
              step={2}
              quote="The more detail you share, the better we curate."
            />
          }
        >
          <BackBtn onClick={() => setScreen(1)} />
          <StepLabel step="Step 2 of 5" />
          <StepQuestion>Paint us a picture of your event.</StepQuestion>
          <StepHint>
            Describe it like you&apos;re telling a friend your dream. The more detail,
            the better we curate.
          </StepHint>

          <div className="mt-6 mb-6">
            {/* Dream description */}
            <textarea
              rows={4}
              className="w-full bg-white border rounded-xl p-5 resize-none outline-none leading-[1.7] min-h-[130px] mb-5 transition-colors duration-200 placeholder:text-[#C0ACD4] placeholder:italic placeholder:font-light"
              style={{ fontFamily: 'var(--font-space)', color: 'var(--charcoal)', borderColor: 'rgba(74,14,110,0.12)', fontWeight: 300, fontSize: '0.9375rem' }}
              placeholder="e.g. 'An intimate outdoor dinner at sunset for 50 people. Think fairy lights, long tables, lush florals, Afrobeats transitioning to R&B, and a full open bar…'"
              value={dreamText}
              onChange={e => setDreamText(e.target.value)}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--plum)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(74,14,110,0.12)' }}
            />

            {/* Keywords */}
            <SectionLabel>Quick Keywords</SectionLabel>
            <div className="flex flex-wrap gap-2 mb-6">
              {KEYWORDS.map(kw => {
                const active = selectedKeywords.has(kw)
                return (
                  <div
                    key={kw}
                    className="border rounded-full px-3.5 py-1.5 text-[12px] cursor-pointer transition-all duration-200"
                    style={{
                      fontFamily: 'var(--font-space)',
                      fontWeight: active ? 500 : 400,
                      background: active ? 'var(--plum)' : 'transparent',
                      borderColor: active ? 'var(--plum)' : 'rgba(74,14,110,0.18)',
                      color: active ? 'white' : 'var(--charcoal)',
                    }}
                    onClick={() => toggleKeyword(kw)}
                    onMouseEnter={e => {
                      if (!active) {
                        ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--plum)'
                        ;(e.currentTarget as HTMLElement).style.color = 'var(--plum)'
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(74,14,110,0.18)'
                        ;(e.currentTarget as HTMLElement).style.color = 'var(--charcoal)'
                      }
                    }}
                  >{kw}</div>
                )
              })}
            </div>

            {/* Color palette */}
            <SectionLabel>Event Color Palette</SectionLabel>
            <div className="flex gap-3 flex-wrap mb-4">
              {COLOR_SWATCHES.map(({ color, name, hasBorder }) => {
                const active = selectedColors.includes(name)
                return (
                  <button
                    key={name}
                    title={name}
                    className="w-9 h-9 rounded-full cursor-pointer transition-all duration-200 flex-shrink-0"
                    style={{
                      background: color,
                      border: active ? '2.5px solid var(--charcoal)' : hasBorder ? '1.5px solid rgba(0,0,0,0.1)' : '2px solid transparent',
                      transform: active ? 'scale(1.15)' : 'scale(1)',
                      outline: active ? '2px solid var(--lavender-light)' : 'none',
                      outlineOffset: '1px',
                    }}
                    onClick={() => toggleColor(name)}
                  />
                )
              })}
            </div>

            {/* Upload zone */}
            <SectionLabel>Inspiration Images</SectionLabel>
            <div
              className="border border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 bg-white mb-4"
              style={{ borderColor: 'rgba(74,14,110,0.15)' }}
              onClick={() => fileInputRef.current?.click()}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'var(--plum)'
                el.style.background = 'var(--lavender-light)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'rgba(74,14,110,0.15)'
                el.style.background = 'white'
              }}
            >
              <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
              <Upload size={22} strokeWidth={1.5} style={{ color: 'var(--plum)', margin: '0 auto 8px' }} />
              <div className="text-[13px] font-semibold mb-1" style={{ fontFamily: 'var(--font-syne)', color: 'var(--plum)' }}>Upload from camera roll</div>
              <div className="text-[11px] font-light" style={{ fontFamily: 'var(--font-space)', color: 'var(--muted)' }}>Pinterest screenshots, inspo pics, anything</div>
            </div>

            {previewImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-2">
                {previewImages.map((src, i) => (
                  <img key={i} src={src} alt="" className="aspect-square rounded-xl object-cover w-full" style={{ animation: 'popIn 0.3s ease both' }} />
                ))}
              </div>
            )}
          </div>

          <NavDots active={1} />
          <NextBtn label="Continue" onClick={() => setScreen(3)} />
        </SplitShell>
      )}

      {/* ── SCREEN 3: DATE & LOCATION ────────────────────────────────────── */}
      {screen === 3 && (
        <SplitShell
          bgImage="/images/venues.jpg"
          leftPanel={
            <QuotePanel
              step={3}
              quote="We find vendors available on your exact date."
            />
          }
        >
          <BackBtn onClick={() => setScreen(2)} />
          <StepLabel step="Step 3 of 5" />
          <StepQuestion>When &amp; where is it?</StepQuestion>

          <div className="mt-6 mb-6 space-y-5">
            {/* Event date */}
            <div>
              <label className="text-[11px] font-medium tracking-[0.08em] uppercase mb-2 block" style={{ fontFamily: 'var(--font-space)', color: 'var(--muted)' }}>Event Date</label>
              <InputField type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} />
            </div>

            {/* Destination or local */}
            <div>
              <label className="text-[11px] font-medium tracking-[0.08em] uppercase mb-2 block" style={{ fontFamily: 'var(--font-space)', color: 'var(--muted)' }}>Event Type</label>
              <div className="flex gap-3">
                {(
                  [
                    { label: 'Destination', Icon: Plane,  val: true  },
                    { label: 'Local',       Icon: MapPin, val: false },
                  ] as const
                ).map(({ label, Icon, val }) => {
                  const sel = isDestination === val
                  return (
                    <div
                      key={label}
                      className="flex-1 bg-white border rounded-xl p-4 cursor-pointer transition-all duration-200 flex items-center gap-3"
                      style={{
                        borderColor: sel ? 'var(--plum)' : 'rgba(74,14,110,0.1)',
                        background: sel ? 'var(--lavender-light)' : 'white',
                        boxShadow: sel ? '0 0 0 1px var(--plum)' : '0 1px 4px rgba(74,14,110,0.05)',
                      }}
                      onClick={() => setIsDestination(val)}
                      onMouseEnter={e => { if (!sel) (e.currentTarget as HTMLElement).style.borderColor = 'var(--plum)' }}
                      onMouseLeave={e => { if (!sel) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(74,14,110,0.1)' }}
                    >
                      <Icon size={16} strokeWidth={1.75} style={{ color: sel ? 'var(--plum)' : 'var(--muted)', flexShrink: 0 }} />
                      <div className="text-[13px] font-semibold" style={{ fontFamily: 'var(--font-syne)', color: sel ? 'var(--plum)' : 'var(--charcoal)' }}>{label}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="text-[11px] font-medium tracking-[0.08em] uppercase mb-2 block" style={{ fontFamily: 'var(--font-space)', color: 'var(--muted)' }}>City, State or Country</label>
              <InputField type="text" placeholder="e.g. Houston TX  ·  Lake Como, Italy" value={location} onChange={e => setLocation(e.target.value)} />
            </div>

            {/* Guest count + duration */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium tracking-[0.08em] uppercase mb-2 block" style={{ fontFamily: 'var(--font-space)', color: 'var(--muted)' }}>Guest Count</label>
                <InputField type="number" placeholder="e.g. 150" value={guestCount} onChange={e => setGuestCount(e.target.value)} />
              </div>
              <div>
                <label className="text-[11px] font-medium tracking-[0.08em] uppercase mb-2 block" style={{ fontFamily: 'var(--font-space)', color: 'var(--muted)' }}>Duration</label>
                <select
                  className="w-full bg-white border rounded-xl px-4 outline-none transition-colors duration-200 appearance-none"
                  style={{ fontFamily: 'var(--font-space)', color: duration ? 'var(--charcoal)' : '#C0ACD4', borderColor: 'rgba(74,14,110,0.12)', fontWeight: 300, height: 52, fontSize: '0.9375rem' }}
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--plum)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(74,14,110,0.12)' }}
                >
                  <option value="" disabled>Select</option>
                  <option>2–3 hrs</option>
                  <option>4–5 hrs</option>
                  <option>Full day</option>
                  <option>Multi-day</option>
                  <option>Weekend</option>
                </select>
              </div>
            </div>

            {/* Special requirements */}
            <div>
              <label className="text-[11px] font-medium tracking-[0.08em] uppercase mb-2 block" style={{ fontFamily: 'var(--font-space)', color: 'var(--muted)' }}>Special Requirements</label>
              <InputField type="text" placeholder="e.g. Halal food, wheelchair access, kids zone…" value={requirements} onChange={e => setRequirements(e.target.value)} />
            </div>
          </div>

          <NavDots active={2} />
          <NextBtn label="Continue" onClick={() => setScreen(4)} />
        </SplitShell>
      )}

      {/* ── SCREEN 4: BUDGET ─────────────────────────────────────────────── */}
      {screen === 4 && (
        <SplitShell
          bgImage="/images/catering.jpg"
          leftPanel={
            <QuotePanel
              step={4}
              quote="We work with every budget. No judgment."
            />
          }
        >
          <BackBtn onClick={() => setScreen(3)} />
          <StepLabel step="Step 4 of 5" />
          <StepQuestion>What&apos;s your budget?</StepQuestion>
          <StepHint>We&apos;ll match you with vendors at every price point.</StepHint>

          <div className="mt-6 mb-6">
            {/* Budget display */}
            <div className="rounded-2xl p-7 text-center mb-5 relative overflow-hidden" style={{ background: 'var(--plum)' }}>
              <div aria-hidden className="absolute rounded-full pointer-events-none" style={{ width: 300, height: 300, background: 'rgba(221,184,245,0.06)', top: -80, right: -60 }} />
              <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/40 mb-3" style={{ fontFamily: 'var(--font-space)' }}>Total Budget</div>
              <div className="text-[48px] font-extrabold text-white tracking-[-2px] leading-none" style={{ fontFamily: 'var(--font-syne)' }}>${budget.toLocaleString()}</div>
            </div>

            {/* Range slider */}
            <input
              type="range"
              min={500}
              max={500000}
              value={budget}
              onChange={e => setBudget(Number(e.target.value))}
              className="budget-range"
            />

            {/* Typeable budget input */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[13px] font-medium" style={{ fontFamily: 'var(--font-space)', color: 'var(--muted)' }}>$</span>
              <input
                type="number"
                min={500}
                max={500000}
                value={budget}
                onChange={e => {
                  const val = Number(e.target.value)
                  if (!isNaN(val)) setBudget(Math.min(500000, Math.max(500, val)))
                }}
                className="flex-1 bg-white border rounded-xl px-4 outline-none transition-colors duration-200"
                style={{
                  fontFamily: 'var(--font-space)', color: 'var(--charcoal)',
                  borderColor: 'rgba(74,14,110,0.12)', height: 44, fontSize: '0.9375rem',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--plum)' }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'rgba(74,14,110,0.12)'
                  const val = Number(e.target.value)
                  if (isNaN(val) || val < 500) setBudget(500)
                  else if (val > 500000) setBudget(500000)
                }}
              />
            </div>

            {/* Budget presets */}
            <div className="flex gap-2 mb-6">
              {BUDGET_PRESETS.map(({ label, value }) => {
                const active = budget === value
                return (
                  <div
                    key={label}
                    className="flex-1 border rounded-lg py-2.5 px-1 text-[11px] font-medium text-center cursor-pointer transition-all duration-200"
                    style={{
                      fontFamily: 'var(--font-space)',
                      borderColor: active ? 'var(--plum)' : 'rgba(74,14,110,0.12)',
                      color: active ? 'var(--plum)' : 'var(--muted)',
                      background: active ? 'var(--lavender-light)' : 'transparent',
                    }}
                    onClick={() => setBudget(value)}
                    onMouseEnter={e => {
                      if (!active) {
                        ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--plum)'
                        ;(e.currentTarget as HTMLElement).style.color = 'var(--plum)'
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(74,14,110,0.12)'
                        ;(e.currentTarget as HTMLElement).style.color = 'var(--muted)'
                      }
                    }}
                  >{label}</div>
                )
              })}
            </div>

            {/* Tier */}
            <SectionLabel>Event Tier</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              {TIERS.map(({ Icon, name, range }) => {
                const active = selectedTier === name
                return (
                  <div
                    key={name}
                    className="bg-white border rounded-xl p-4 cursor-pointer transition-all duration-200"
                    style={{
                      borderColor: active ? 'var(--plum)' : 'rgba(74,14,110,0.1)',
                      background: active ? 'var(--lavender-light)' : 'white',
                      boxShadow: active ? '0 0 0 1px var(--plum)' : '0 1px 4px rgba(74,14,110,0.05)',
                    }}
                    onClick={() => setSelectedTier(name)}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.borderColor = 'var(--plum)' }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(74,14,110,0.1)' }}
                  >
                    <Icon size={18} strokeWidth={1.75} style={{ color: 'var(--plum)', marginBottom: 10 }} />
                    <div className="text-[13px] font-semibold leading-tight mb-0.5" style={{ fontFamily: 'var(--font-syne)', color: 'var(--charcoal)' }}>{name}</div>
                    <div className="text-[11px] font-light" style={{ fontFamily: 'var(--font-space)', color: 'var(--muted)' }}>{range}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <NavDots active={3} />
          <NextBtn label="Continue" onClick={() => setScreen(5)} />
        </SplitShell>
      )}

      {/* ── SCREEN 5: REVIEW ─────────────────────────────────────────────── */}
      {screen === 5 && (
        <SplitShell
          bgImage="/images/beauty.jpg"
          leftPanel={
            <ReviewPanel
              eventType={eventType}
              location={location}
              eventDate={eventDate}
              guestCount={guestCount}
              budget={budget}
              selectedTier={selectedTier}
            />
          }
        >
          <BackBtn onClick={() => setScreen(4)} />
          <StepLabel step="Step 5 of 5" />
          <StepQuestion>Here&apos;s what we&apos;ve got. Look good?</StepQuestion>

          <div className="mt-6 mb-6">
            {/* AI note */}
            <div
              className="border-l-2 rounded-r-xl px-5 py-5 text-[14px] font-light leading-[1.75] mb-6 italic"
              style={{ background: 'var(--lavender-light)', borderColor: 'var(--plum)', color: 'var(--charcoal)', fontFamily: 'var(--font-space)' }}
            >
              Based on your inputs, I&apos;m curating{' '}
              {dreamText
                ? 'an event tailored to your exact vision'
                : 'an intimate candlelit outdoor dinner with curated vendors, a bespoke playlist, and full-service bar'}{' '}
              — all within your budget.
            </div>

            {/* Confirm card */}
            <div
              className="bg-white border rounded-2xl p-5 mb-6"
              style={{ borderColor: 'rgba(74,14,110,0.08)', boxShadow: '0 2px 16px rgba(74,14,110,0.06)' }}
            >
              {[
                { Icon: Tag,          key: 'Event Type',    val: eventType || '—' },
                { Icon: MapPin,       key: 'Location',      val: location   || '—' },
                { Icon: CalendarDays, key: 'Date',          val: eventDate  || '—' },
                { Icon: Users,        key: 'Guests',        val: guestCount ? `${guestCount} guests` : '—' },
                { Icon: Wallet,       key: 'Budget · Tier', val: `$${budget.toLocaleString()} · ${selectedTier || '—'}` },
              ].map(({ Icon, key, val }) => (
                <div key={key} className="flex items-start gap-3.5 mb-4 last:mb-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--lavender-light)' }}>
                    <Icon size={14} strokeWidth={2} style={{ color: 'var(--plum)' }} />
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold tracking-[0.1em] uppercase" style={{ fontFamily: 'var(--font-space)', color: 'var(--muted)' }}>{key}</div>
                    <div className="text-[14px] font-bold mt-0.5" style={{ fontFamily: 'var(--font-syne)', color: 'var(--charcoal)', fontWeight: 700 }}>{val}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected keywords preview */}
            {selectedKeywords.size > 0 && (
              <div className="mb-6">
                <SectionLabel>Your Vision</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {Array.from(selectedKeywords).map(kw => (
                    <div
                      key={kw}
                      className="border rounded-full px-3.5 py-1.5 text-[12px] font-medium text-white"
                      style={{ fontFamily: 'var(--font-space)', background: 'var(--plum)', borderColor: 'var(--plum)' }}
                    >{kw}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Color palette preview */}
            {selectedColors.length > 0 && (
              <div className="mb-2">
                <SectionLabel>Color Palette</SectionLabel>
                <div className="flex gap-2.5 flex-wrap">
                  {selectedColors.map(name => {
                    const swatch = COLOR_SWATCHES.find(s => s.name === name)
                    if (!swatch) return null
                    return (
                      <div
                        key={name}
                        className="flex items-center gap-2 border rounded-full px-3 py-1.5"
                        style={{ borderColor: 'rgba(74,14,110,0.12)', background: 'white' }}
                      >
                        <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: swatch.color, border: swatch.hasBorder ? '1px solid rgba(0,0,0,0.1)' : 'none' }} />
                        <span className="text-[11px] font-medium" style={{ fontFamily: 'var(--font-space)', color: 'var(--charcoal)' }}>{name}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <NavDots active={4} />
          <NextBtn
            label={generating ? 'Saving…' : 'Generate My Event Plan'}
            onClick={handleGenerate}
            disabled={generating}
          />
        </SplitShell>
      )}

      {/* ── SCREEN 6: AI GENERATING ──────────────────────────────────────── */}
      {screen === 6 && (
        <div
          className="min-h-screen flex flex-col items-center justify-center px-8 py-20 text-center relative overflow-hidden"
          style={{ background: 'var(--plum)' }}
        >
          <div aria-hidden className="absolute rounded-full pointer-events-none" style={{ width: 600, height: 600, background: 'radial-gradient(circle, rgba(221,184,245,0.07) 0%, transparent 65%)', top: -200, right: -100 }} />

          <div className="w-full max-w-[480px] relative z-[1]">
            <div
              className="mx-auto mb-8 rounded-full"
              style={{ width: 64, height: 64, border: '2px solid rgba(221,184,245,0.15)', borderTopColor: 'var(--lavender)', animation: 'spin 0.85s linear infinite' }}
            />

            <div className="text-[30px] font-extrabold text-white tracking-[-0.5px] mb-3" style={{ fontFamily: 'var(--font-syne)' }}>Building your event…</div>

            <p className="text-[14px] font-light text-white/50 leading-[1.7] mb-10" style={{ fontFamily: 'var(--font-space)' }}>
              Our AI is analyzing your vision and curating the perfect vendors,
              timeline, and budget breakdown.
            </p>

            <div className="text-left flex flex-col gap-3">
              {[
                { Icon: ImageIcon,    text: 'Analyzing your mood board',                           done: true,  delay: 0   },
                { Icon: MapPin,       text: `Finding vendors in ${location || 'your area'}`,       done: true,  delay: 0.4 },
                { Icon: DollarSign,   text: `Matching to your $${budget.toLocaleString()} budget`, done: true,  delay: 0.8 },
                { Icon: Sparkles,     text: 'Curating vendor shortlist',                            done: false, delay: 1.2 },
                { Icon: CalendarDays, text: 'Building your event timeline',                         done: false, delay: 1.6 },
              ].map(({ Icon, text, done, delay }, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-5 py-4 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(221,184,245,0.08)', animation: `fadeUp 0.45s ${delay}s ease both` }}
                >
                  <Icon size={16} strokeWidth={1.75} style={{ color: done ? 'var(--lavender)' : 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                  <span className="text-[13px] font-light flex-1" style={{ fontFamily: 'var(--font-space)', color: done ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)' }}>{text}</span>
                  {done
                    ? <CheckCircle2 size={16} strokeWidth={2} style={{ color: 'var(--lavender)', flexShrink: 0 }} />
                    : <Circle size={16} strokeWidth={1.5} style={{ color: 'rgba(221,184,245,0.2)', flexShrink: 0 }} />
                  }
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
