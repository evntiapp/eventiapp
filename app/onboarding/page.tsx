'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Syne, Space_Grotesk } from 'next/font/google'
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

const COLOR_SWATCHES = [
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

// ── Sub-components ────────────────────────────────────────────────────────────

function ProgressBar({ done }: { done: number }) {
  return (
    <div className="flex gap-1.5 mb-7">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-0.5 flex-1 rounded-full transition-colors duration-300"
          style={{ background: i < done ? 'var(--plum)' : 'var(--lavender)' }}
        />
      ))}
    </div>
  )
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-9 h-9 rounded-xl border cursor-pointer flex items-center justify-center mb-6 transition-all duration-150 hover:-translate-x-0.5"
      style={{
        background: 'transparent',
        borderColor: 'rgba(74,14,110,0.12)',
        color: 'var(--charcoal)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--plum)'
        ;(e.currentTarget as HTMLElement).style.color = 'var(--plum)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(74,14,110,0.12)'
        ;(e.currentTarget as HTMLElement).style.color = 'var(--charcoal)'
      }}
    >
      <ArrowLeft size={16} strokeWidth={2} />
    </button>
  )
}

function NavDots({ active }: { active: number }) {
  return (
    <div className="flex justify-center gap-2 py-3 flex-shrink-0">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-1.5 rounded-full transition-all duration-300"
          style={{
            width: i === active ? '20px' : '6px',
            background: i === active ? 'var(--plum)' : 'var(--lavender)',
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
      className="w-full text-white text-[15px] font-bold border-none rounded-[14px] py-[18px] px-6 cursor-pointer flex items-center justify-center gap-2.5 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        fontFamily: 'var(--font-syne)',
        background: 'var(--plum)',
        letterSpacing: '-0.01em',
      }}
      onMouseEnter={e => {
        if (!disabled) {
          (e.currentTarget as HTMLElement).style.background = 'var(--plum-mid)'
          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
        }
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = 'var(--plum)'
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
      className="text-[28px] font-bold tracking-[-0.5px] leading-[1.15]"
      style={{ fontFamily: 'var(--font-syne)', color: 'var(--charcoal)' }}
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
      className={`w-full bg-white border rounded-xl px-4 py-[14px] text-[14px] outline-none transition-colors duration-200 placeholder:text-[#C0ACD4] ${props.className ?? ''}`}
      style={{
        fontFamily: 'var(--font-space)',
        color: 'var(--charcoal)',
        borderColor: 'rgba(74,14,110,0.12)',
        ...props.style,
      }}
      onFocus={e => {
        e.currentTarget.style.borderColor = 'var(--plum)'
        props.onFocus?.(e)
      }}
      onBlur={e => {
        e.currentTarget.style.borderColor = 'rgba(74,14,110,0.12)'
        props.onBlur?.(e)
      }}
    />
  )
}

// ── Step layout shell ─────────────────────────────────────────────────────────

function StepShell({
  header,
  body,
  footer,
}: {
  header: React.ReactNode
  body: React.ReactNode
  footer: React.ReactNode
}) {
  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: 'var(--off-white)' }}
    >
      <div className="flex-1 flex flex-col min-h-0 w-full max-w-[560px] mx-auto">
        <div className="flex-shrink-0 px-8 pt-10 pb-3">{header}</div>
        <div className="flex-1 overflow-y-auto px-8 pt-1 scrollbar-hide">{body}</div>
        <div className="flex-shrink-0 px-8 pb-10 pt-3">{footer}</div>
      </div>
    </div>
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

      await supabase.from('events').insert({
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
      })

      await new Promise(r => setTimeout(r, 2800))
      router.push('/ai-plan')
    } catch {
      await new Promise(r => setTimeout(r, 2800))
      router.push('/ai-plan')
    }
  }

  return (
    <div
      className={`${syne.variable} ${spaceGrotesk.variable}`}
      style={{ fontFamily: 'var(--font-space), sans-serif' }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── SCREEN 0: SPLASH ─────────────────────────────────────────────── */}
      {screen === 0 && (
        <div
          className="min-h-screen flex flex-col items-center justify-center px-8 py-20 relative overflow-hidden"
          style={{ background: 'var(--plum)' }}
        >
          {/* Subtle radial glows */}
          <div
            aria-hidden
            className="absolute pointer-events-none rounded-full"
            style={{
              width: 700, height: 700,
              background: 'radial-gradient(circle, rgba(221,184,245,0.08) 0%, transparent 65%)',
              top: -200, right: -200,
            }}
          />
          <div
            aria-hidden
            className="absolute pointer-events-none rounded-full"
            style={{
              width: 500, height: 500,
              background: 'radial-gradient(circle, rgba(221,184,245,0.06) 0%, transparent 65%)',
              bottom: -150, left: -150,
            }}
          />

          <div className="w-full max-w-[480px] flex flex-col items-center text-center relative z-[1]">
            {/* Wordmark */}
            <div
              className="text-[72px] font-extrabold tracking-[-0.04em] leading-none"
              style={{
                fontFamily: 'var(--font-syne)',
                color: 'white',
                animation: 'fadeUp 0.5s ease both',
              }}
            >
              evnti<span style={{ color: 'var(--lavender)' }}>.</span>
            </div>

            {/* Tagline */}
            <div
              className="text-[11px] font-light tracking-[0.22em] uppercase mt-5 mb-10"
              style={{
                fontFamily: 'var(--font-space)',
                color: 'rgba(221,184,245,0.55)',
                animation: 'fadeUp 0.5s 0.1s ease both',
              }}
            >
              Planning made effortless.
            </div>

            {/* Description */}
            <p
              className="text-[16px] font-light leading-[1.85] mb-12"
              style={{
                fontFamily: 'var(--font-space)',
                color: 'rgba(255,255,255,0.5)',
                maxWidth: 420,
                animation: 'fadeUp 0.5s 0.2s ease both',
              }}
            >
              Your AI-powered event planner. From kids&apos; play parties to Lake Como
              weddings — we handle every single detail.
            </p>

            {/* CTA */}
            <button
              className="bg-white border-none rounded-[14px] py-5 text-[15px] font-bold cursor-pointer flex items-center justify-center gap-2.5 transition-all duration-150"
              style={{
                fontFamily: 'var(--font-syne)',
                color: 'var(--plum)',
                width: '100%',
                maxWidth: 360,
                animation: 'fadeUp 0.5s 0.3s ease both',
              }}
              onClick={() => setScreen(1)}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.18)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
              }}
            >
              Start Planning
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>

            {/* Login hint */}
            <div
              className="mt-6 text-[13px] font-light"
              style={{
                fontFamily: 'var(--font-space)',
                color: 'rgba(255,255,255,0.3)',
                animation: 'fadeUp 0.5s 0.4s ease both',
              }}
            >
              Already have an account?{' '}
              <Link
                href="/auth/signin"
                className="underline underline-offset-[3px] transition-colors duration-150"
                style={{ color: 'rgba(255,255,255,0.65)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'white' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)' }}
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── SCREEN 1: EVENT TYPE ─────────────────────────────────────────── */}
      {screen === 1 && (
        <StepShell
          header={
            <>
              <ProgressBar done={1} />
              <BackBtn onClick={() => setScreen(0)} />
              <StepLabel step="Step 1 of 6" />
              <StepQuestion>What are we celebrating?</StepQuestion>
            </>
          }
          body={
            <div className="grid grid-cols-2 gap-3 pt-4 pb-4">
              {EVENT_TYPES.map(({ Icon, label, sub }) => {
                const selected = eventType === label
                return (
                  <div
                    key={label}
                    className="bg-white border rounded-xl p-4 cursor-pointer transition-all duration-200"
                    style={{
                      borderColor: selected ? 'var(--plum)' : 'rgba(74,14,110,0.1)',
                      background: selected ? 'var(--lavender-light)' : 'white',
                      boxShadow: selected
                        ? '0 0 0 1px var(--plum), 0 4px 16px rgba(74,14,110,0.1)'
                        : '0 1px 4px rgba(74,14,110,0.05)',
                    }}
                    onClick={() => setEventType(label)}
                    onMouseEnter={e => {
                      if (!selected) {
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--plum)'
                        ;(e.currentTarget as HTMLElement).style.boxShadow =
                          '0 4px 16px rgba(74,14,110,0.1)'
                      }
                    }}
                    onMouseLeave={e => {
                      if (!selected) {
                        (e.currentTarget as HTMLElement).style.borderColor =
                          'rgba(74,14,110,0.1)'
                        ;(e.currentTarget as HTMLElement).style.boxShadow =
                          '0 1px 4px rgba(74,14,110,0.05)'
                      }
                    }}
                  >
                    <Icon
                      size={18}
                      strokeWidth={1.75}
                      style={{ color: 'var(--plum)', marginBottom: 10 }}
                    />
                    <div
                      className="text-[13px] font-semibold leading-tight mb-0.5"
                      style={{ fontFamily: 'var(--font-syne)', color: 'var(--charcoal)' }}
                    >{label}</div>
                    <div
                      className="text-[11px] font-light"
                      style={{ fontFamily: 'var(--font-space)', color: 'var(--muted)' }}
                    >{sub}</div>
                  </div>
                )
              })}
            </div>
          }
          footer={
            <>
              <NavDots active={0} />
              <NextBtn label="Continue" onClick={() => setScreen(2)} />
            </>
          }
        />
      )}

      {/* ── SCREEN 2: DESCRIBE YOUR EVENT ────────────────────────────────── */}
      {screen === 2 && (
        <StepShell
          header={
            <>
              <ProgressBar done={2} />
              <BackBtn onClick={() => setScreen(1)} />
              <StepLabel step="Step 2 of 6" />
              <StepQuestion>Paint us a picture of your event.</StepQuestion>
              <StepHint>
                Describe it like you&apos;re telling a friend your dream. The more detail,
                the better we curate.
              </StepHint>
            </>
          }
          body={
            <div className="pt-4 pb-6">
              {/* Dream description */}
              <textarea
                rows={4}
                className="w-full bg-white border rounded-xl p-4 text-[14px] resize-none outline-none leading-[1.7] min-h-[110px] mb-5 transition-colors duration-200 placeholder:text-[#C0ACD4] placeholder:italic placeholder:font-light"
                style={{
                  fontFamily: 'var(--font-space)',
                  color: 'var(--charcoal)',
                  borderColor: 'rgba(74,14,110,0.12)',
                  fontWeight: 300,
                }}
                placeholder="e.g. 'An intimate outdoor dinner at sunset for 50 people. Think fairy lights, long tables, lush florals, Afrobeats transitioning to R&B, and a full open bar…'"
                value={dreamText}
                onChange={e => setDreamText(e.target.value)}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--plum)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(74,14,110,0.12)' }}
              />

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
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Upload
                  size={22}
                  strokeWidth={1.5}
                  style={{ color: 'var(--plum)', margin: '0 auto 8px' }}
                />
                <div
                  className="text-[13px] font-semibold mb-1"
                  style={{ fontFamily: 'var(--font-syne)', color: 'var(--plum)' }}
                >Upload from camera roll</div>
                <div
                  className="text-[11px] font-light"
                  style={{ fontFamily: 'var(--font-space)', color: 'var(--muted)' }}
                >Pinterest screenshots, inspo pics, anything</div>
              </div>

              {/* Image preview grid */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {previewImages.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="aspect-square rounded-xl object-cover w-full"
                    style={{ animation: 'popIn 0.3s ease both' }}
                  />
                ))}
                {Array.from({ length: Math.max(0, 3 - previewImages.length) }).map((_, i) => (
                  <div
                    key={`ph-${i}`}
                    className="aspect-square rounded-xl flex items-center justify-center cursor-pointer border border-dashed transition-all duration-200"
                    style={{
                      borderColor: 'rgba(74,14,110,0.12)',
                      background: 'var(--lavender-light)',
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--plum)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(74,14,110,0.12)'
                    }}
                  >
                    <Upload size={16} strokeWidth={1.5} style={{ color: 'var(--muted)' }} />
                  </div>
                ))}
              </div>

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
                          (e.currentTarget as HTMLElement).style.borderColor = 'var(--plum)'
                          ;(e.currentTarget as HTMLElement).style.color = 'var(--plum)'
                        }
                      }}
                      onMouseLeave={e => {
                        if (!active) {
                          (e.currentTarget as HTMLElement).style.borderColor =
                            'rgba(74,14,110,0.18)'
                          ;(e.currentTarget as HTMLElement).style.color = 'var(--charcoal)'
                        }
                      }}
                    >{kw}</div>
                  )
                })}
              </div>

              {/* Color palette */}
              <SectionLabel>Event Color Palette</SectionLabel>
              <div className="flex gap-3 flex-wrap">
                {COLOR_SWATCHES.map(({ color, name, hasBorder }) => {
                  const active = selectedColors.includes(name)
                  return (
                    <button
                      key={name}
                      title={name}
                      className="w-9 h-9 rounded-full cursor-pointer transition-all duration-200 flex-shrink-0"
                      style={{
                        background: color,
                        border: active
                          ? '2.5px solid var(--charcoal)'
                          : hasBorder
                          ? '1.5px solid rgba(0,0,0,0.1)'
                          : '2px solid transparent',
                        transform: active ? 'scale(1.15)' : 'scale(1)',
                        outline: active ? '2px solid var(--lavender-light)' : 'none',
                        outlineOffset: '1px',
                      }}
                      onClick={() => toggleColor(name)}
                    />
                  )
                })}
              </div>
            </div>
          }
          footer={
            <>
              <NavDots active={1} />
              <NextBtn label="Continue" onClick={() => setScreen(3)} />
            </>
          }
        />
      )}

      {/* ── SCREEN 3: DATE & LOGISTICS ───────────────────────────────────── */}
      {screen === 3 && (
        <StepShell
          header={
            <>
              <ProgressBar done={3} />
              <BackBtn onClick={() => setScreen(2)} />
              <StepLabel step="Step 3 of 6" />
              <StepQuestion>When &amp; where is it?</StepQuestion>
            </>
          }
          body={
            <div className="pt-4 pb-6 space-y-5">
              {/* Event date */}
              <div>
                <label
                  className="text-[11px] font-medium tracking-[0.08em] uppercase mb-2 block"
                  style={{ fontFamily: 'var(--font-space)', color: 'var(--muted)' }}
                >Event Date</label>
                <InputField
                  type="date"
                  value={eventDate}
                  onChange={e => setEventDate(e.target.value)}
                />
              </div>

              {/* Destination or local */}
              <div>
                <label
                  className="text-[11px] font-medium tracking-[0.08em] uppercase mb-2 block"
                  style={{ fontFamily: 'var(--font-space)', color: 'var(--muted)' }}
                >Event type</label>
                <div className="flex gap-3">
                  {(
                    [
                      { label: 'Destination', Icon: Plane,  val: true  },
                      { label: 'Local',        Icon: MapPin, val: false },
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
                          boxShadow: sel
                            ? '0 0 0 1px var(--plum)'
                            : '0 1px 4px rgba(74,14,110,0.05)',
                        }}
                        onClick={() => setIsDestination(val)}
                        onMouseEnter={e => {
                          if (!sel) (e.currentTarget as HTMLElement).style.borderColor = 'var(--plum)'
                        }}
                        onMouseLeave={e => {
                          if (!sel)
                            (e.currentTarget as HTMLElement).style.borderColor =
                              'rgba(74,14,110,0.1)'
                        }}
                      >
                        <Icon
                          size={16}
                          strokeWidth={1.75}
                          style={{ color: sel ? 'var(--plum)' : 'var(--muted)', flexShrink: 0 }}
                        />
                        <div
                          className="text-[13px] font-semibold"
                          style={{
                            fontFamily: 'var(--font-syne)',
                            color: sel ? 'var(--plum)' : 'var(--charcoal)',
                          }}
                        >{label}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Location */}
              <div>
                <label
                  className="text-[11px] font-medium tracking-[0.08em] uppercase mb-2 block"
                  style={{ fontFamily: 'var(--font-space)', color: 'var(--muted)' }}
                >City, State or Country</label>
                <InputField
                  type="text"
                  placeholder="e.g. Houston TX  ·  Lake Como, Italy"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
              </div>

              {/* Guest count + duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="text-[11px] font-medium tracking-[0.08em] uppercase mb-2 block"
                    style={{ fontFamily: 'var(--font-space)', color: 'var(--muted)' }}
                  >Guest Count</label>
                  <InputField
                    type="number"
                    placeholder="e.g. 150"
                    value={guestCount}
                    onChange={e => setGuestCount(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    className="text-[11px] font-medium tracking-[0.08em] uppercase mb-2 block"
                    style={{ fontFamily: 'var(--font-space)', color: 'var(--muted)' }}
                  >Duration</label>
                  <select
                    className="w-full bg-white border rounded-xl px-4 py-[14px] text-[14px] outline-none transition-colors duration-200 appearance-none"
                    style={{
                      fontFamily: 'var(--font-space)',
                      color: duration ? 'var(--charcoal)' : '#C0ACD4',
                      borderColor: 'rgba(74,14,110,0.12)',
                      fontWeight: 300,
                    }}
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
                <label
                  className="text-[11px] font-medium tracking-[0.08em] uppercase mb-2 block"
                  style={{ fontFamily: 'var(--font-space)', color: 'var(--muted)' }}
                >Special Requirements</label>
                <InputField
                  type="text"
                  placeholder="e.g. Halal food, wheelchair access, kids zone…"
                  value={requirements}
                  onChange={e => setRequirements(e.target.value)}
                />
              </div>
            </div>
          }
          footer={
            <>
              <NavDots active={2} />
              <NextBtn label="Continue" onClick={() => setScreen(4)} />
            </>
          }
        />
      )}

      {/* ── SCREEN 4: BUDGET ─────────────────────────────────────────────── */}
      {screen === 4 && (
        <StepShell
          header={
            <>
              <ProgressBar done={4} />
              <BackBtn onClick={() => setScreen(3)} />
              <StepLabel step="Step 4 of 6" />
              <StepQuestion>What&apos;s your budget?</StepQuestion>
              <StepHint>We&apos;ll match you with vendors at every price point.</StepHint>
            </>
          }
          body={
            <div className="pt-4 pb-6">
              {/* Budget display */}
              <div
                className="rounded-2xl p-7 text-center mb-5 relative overflow-hidden"
                style={{ background: 'var(--plum)' }}
              >
                <div
                  aria-hidden
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: 300, height: 300,
                    background: 'rgba(221,184,245,0.06)',
                    top: -80, right: -60,
                  }}
                />
                <div
                  className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/40 mb-3"
                  style={{ fontFamily: 'var(--font-space)' }}
                >Total Budget</div>
                <div
                  className="text-[48px] font-extrabold text-white tracking-[-2px] leading-none"
                  style={{ fontFamily: 'var(--font-syne)' }}
                >${budget.toLocaleString()}</div>
              </div>

              {/* Range slider */}
              <input
                type="range"
                min={500}
                max={500000}
                step={500}
                value={budget}
                onChange={e => setBudget(Number(e.target.value))}
                className="budget-range"
              />

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
                          (e.currentTarget as HTMLElement).style.borderColor = 'var(--plum)'
                          ;(e.currentTarget as HTMLElement).style.color = 'var(--plum)'
                        }
                      }}
                      onMouseLeave={e => {
                        if (!active) {
                          (e.currentTarget as HTMLElement).style.borderColor =
                            'rgba(74,14,110,0.12)'
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
                        boxShadow: active
                          ? '0 0 0 1px var(--plum)'
                          : '0 1px 4px rgba(74,14,110,0.05)',
                      }}
                      onClick={() => setSelectedTier(name)}
                      onMouseEnter={e => {
                        if (!active) {
                          (e.currentTarget as HTMLElement).style.borderColor = 'var(--plum)'
                        }
                      }}
                      onMouseLeave={e => {
                        if (!active) {
                          (e.currentTarget as HTMLElement).style.borderColor =
                            'rgba(74,14,110,0.1)'
                        }
                      }}
                    >
                      <Icon
                        size={18}
                        strokeWidth={1.75}
                        style={{ color: 'var(--plum)', marginBottom: 10 }}
                      />
                      <div
                        className="text-[13px] font-semibold leading-tight mb-0.5"
                        style={{ fontFamily: 'var(--font-syne)', color: 'var(--charcoal)' }}
                      >{name}</div>
                      <div
                        className="text-[11px] font-light"
                        style={{ fontFamily: 'var(--font-space)', color: 'var(--muted)' }}
                      >{range}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          }
          footer={
            <>
              <NavDots active={3} />
              <NextBtn label="Continue" onClick={() => setScreen(5)} />
            </>
          }
        />
      )}

      {/* ── SCREEN 5: AI REVIEW / CONFIRM ────────────────────────────────── */}
      {screen === 5 && (
        <StepShell
          header={
            <>
              <ProgressBar done={5} />
              <BackBtn onClick={() => setScreen(4)} />
              <StepLabel step="Step 5 of 6" />
              <StepQuestion>Here&apos;s what we&apos;ve got. Look good?</StepQuestion>
            </>
          }
          body={
            <div className="pt-4 pb-6">
              {/* AI note */}
              <div
                className="border-l-2 rounded-r-xl px-4 py-4 text-[13px] font-light leading-[1.7] mb-5 italic"
                style={{
                  background: 'var(--lavender-light)',
                  borderColor: 'var(--plum)',
                  color: 'var(--charcoal)',
                  fontFamily: 'var(--font-space)',
                }}
              >
                Based on your inputs, I&apos;m curating{' '}
                {dreamText
                  ? 'an event tailored to your exact vision'
                  : 'an intimate candlelit outdoor dinner with curated vendors, a bespoke playlist, and full-service bar'}{' '}
                — all within your budget.
              </div>

              {/* Confirm card */}
              <div
                className="bg-white border rounded-2xl p-5 mb-5"
                style={{
                  borderColor: 'rgba(74,14,110,0.08)',
                  boxShadow: '0 2px 16px rgba(74,14,110,0.06)',
                }}
              >
                {[
                  { Icon: Tag,          key: 'Event Type',    val: eventType || '—' },
                  { Icon: MapPin,       key: 'Location',      val: location  || '—' },
                  { Icon: CalendarDays, key: 'Date & Guests', val: `${eventDate || '—'} · ${guestCount || '—'} guests` },
                  { Icon: Wallet,       key: 'Budget · Tier', val: `$${budget.toLocaleString()} · ${selectedTier || '—'}` },
                ].map(({ Icon, key, val }) => (
                  <div key={key} className="flex items-start gap-3.5 mb-4 last:mb-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--lavender-light)' }}
                    >
                      <Icon size={14} strokeWidth={2} style={{ color: 'var(--plum)' }} />
                    </div>
                    <div>
                      <div
                        className="text-[10px] font-medium tracking-[0.1em] uppercase"
                        style={{ fontFamily: 'var(--font-space)', color: 'var(--muted)' }}
                      >{key}</div>
                      <div
                        className="text-[14px] font-semibold mt-0.5"
                        style={{ fontFamily: 'var(--font-syne)', color: 'var(--charcoal)' }}
                      >{val}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Color palette preview */}
              {selectedColors.length > 0 && (
                <>
                  <SectionLabel>Color Palette</SectionLabel>
                  <div className="flex gap-2.5 flex-wrap mb-5">
                    {selectedColors.map(name => {
                      const swatch = COLOR_SWATCHES.find(s => s.name === name)
                      if (!swatch) return null
                      return (
                        <div
                          key={name}
                          className="flex items-center gap-2 border rounded-full px-3 py-1.5"
                          style={{
                            borderColor: 'rgba(74,14,110,0.12)',
                            background: 'white',
                          }}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                            style={{
                              background: swatch.color,
                              border: swatch.hasBorder ? '1px solid rgba(0,0,0,0.1)' : 'none',
                            }}
                          />
                          <span
                            className="text-[11px] font-medium"
                            style={{ fontFamily: 'var(--font-space)', color: 'var(--charcoal)' }}
                          >{name}</span>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {/* Selected keywords */}
              <SectionLabel>Your Vision</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {(selectedKeywords.size > 0
                  ? Array.from(selectedKeywords)
                  : ['Candlelit', 'Outdoor', 'Fairy Lights', 'Dance Floor']
                ).map(kw => (
                  <div
                    key={kw}
                    className="border rounded-full px-3.5 py-1.5 text-[12px] font-medium text-white"
                    style={{
                      fontFamily: 'var(--font-space)',
                      background: 'var(--plum)',
                      borderColor: 'var(--plum)',
                    }}
                  >{kw}</div>
                ))}
              </div>
            </div>
          }
          footer={
            <>
              <NavDots active={4} />
              <NextBtn
                label={generating ? 'Saving…' : 'Generate My Event Plan'}
                onClick={handleGenerate}
                disabled={generating}
              />
            </>
          }
        />
      )}

      {/* ── SCREEN 6: AI GENERATING ──────────────────────────────────────── */}
      {screen === 6 && (
        <div
          className="min-h-screen flex flex-col items-center justify-center px-8 py-20 text-center relative overflow-hidden"
          style={{ background: 'var(--plum)' }}
        >
          {/* Glow */}
          <div
            aria-hidden
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 600, height: 600,
              background: 'radial-gradient(circle, rgba(221,184,245,0.07) 0%, transparent 65%)',
              top: -200, right: -100,
            }}
          />

          <div className="w-full max-w-[480px] relative z-[1]">
            {/* CSS spinner */}
            <div
              className="mx-auto mb-8 rounded-full"
              style={{
                width: 64, height: 64,
                border: '2px solid rgba(221,184,245,0.15)',
                borderTopColor: 'var(--lavender)',
                animation: 'spin 0.85s linear infinite',
              }}
            />

            <div
              className="text-[30px] font-extrabold text-white tracking-[-0.5px] mb-3"
              style={{ fontFamily: 'var(--font-syne)' }}
            >Building your event…</div>

            <p
              className="text-[14px] font-light text-white/50 leading-[1.7] mb-10"
              style={{ fontFamily: 'var(--font-space)' }}
            >
              Our AI is analyzing your vision and curating the perfect vendors,
              timeline, and budget breakdown.
            </p>

            {/* Step items */}
            <div className="text-left flex flex-col gap-3">
              {[
                { Icon: ImageIcon,    text: 'Analyzing your mood board',                          done: true,  delay: 0   },
                { Icon: MapPin,       text: `Finding vendors in ${location || 'your area'}`,      done: true,  delay: 0.4 },
                { Icon: DollarSign,   text: `Matching to your $${budget.toLocaleString()} budget`, done: true,  delay: 0.8 },
                { Icon: Sparkles,     text: 'Curating vendor shortlist',                           done: false, delay: 1.2 },
                { Icon: CalendarDays, text: 'Building your event timeline',                        done: false, delay: 1.6 },
              ].map(({ Icon, text, done, delay }, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-5 py-4 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(221,184,245,0.08)',
                    animation: `fadeUp 0.45s ${delay}s ease both`,
                  }}
                >
                  <Icon
                    size={16}
                    strokeWidth={1.75}
                    style={{ color: done ? 'var(--lavender)' : 'rgba(255,255,255,0.3)', flexShrink: 0 }}
                  />
                  <span
                    className="text-[13px] font-light flex-1"
                    style={{
                      fontFamily: 'var(--font-space)',
                      color: done ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)',
                    }}
                  >{text}</span>
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
