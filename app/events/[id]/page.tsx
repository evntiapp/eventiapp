'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Syne, Space_Grotesk } from 'next/font/google'
import { getSupabaseClient } from '@/lib/supabase'
import { useLogoHref } from '@/app/hooks/useLogoHref'
import { Home, Store, Sparkles, Calendar, Grid } from 'lucide-react'

const syne = Syne({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-syne' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-space' })

// ── Types ─────────────────────────────────────────────────────────────────────

interface EventRow {
  id: string
  event_type: string | null
  event_date: string | null
  location: string | null
  guest_count: number | null
  total_budget: number | null
  tier: string | null
  status: string | null
  keywords: string[] | null
  colors: string[] | null
  description: string | null
  duration: string | null
  special_requirements: string | null
}

interface Booking {
  id: string
  vendor_profiles: { category: string } | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function formatCurrency(n: number): string {
  return `$${n.toLocaleString('en-US')}`
}

function monthsUntil(iso: string): number {
  const now = new Date()
  const target = new Date(iso)
  return (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth())
}

// ── Vendor checklist config ───────────────────────────────────────────────────

const ALL_VENDOR_CATEGORIES = [
  'Venue',
  'Decor',
  'Food & Catering',
  'Cake',
  'Drinks & Bar Service',
  'Entertainment',
  'MC',
  'Photography',
  'Videography',
  'Servers',
  'Beauty & Hair',
  'Makeup',
  'DJ',
  'Tech & Lighting',
]

function getVendorList(_eventType: string | null): string[] {
  return ALL_VENDOR_CATEGORIES
}

// ── Task list config ──────────────────────────────────────────────────────────

interface Task { text: string; due: string }

function getTasks(eventDate: string | null): Task[] {
  if (!eventDate) {
    return [
      { text: 'Book your venue first',      due: 'As soon as possible' },
      { text: 'Set your guest list',         due: 'This week' },
      { text: 'Research catering options',   due: 'This month' },
      { text: 'Create your mood board',      due: 'This month' },
    ]
  }
  const months = monthsUntil(eventDate)
  if (months > 6) {
    return [
      { text: 'Book your venue first',      due: 'Within 2 weeks' },
      { text: 'Set your guest list',         due: 'Within 1 month' },
      { text: 'Research catering options',   due: 'Within 2 months' },
      { text: 'Create your mood board',      due: 'Within 2 months' },
    ]
  }
  if (months > 3) {
    return [
      { text: 'Confirm all major vendors',   due: 'This week' },
      { text: 'Send save the dates',          due: 'Within 2 weeks' },
      { text: 'Plan your menu',               due: 'Within 1 month' },
      { text: 'Book entertainment',           due: 'Within 1 month' },
    ]
  }
  return [
    { text: 'Confirm all bookings',          due: 'This week' },
    { text: 'Create day-of timeline',        due: 'Within 2 weeks' },
    { text: 'Arrange transportation',        due: 'Within 2 weeks' },
    { text: 'Prepare payments',              due: 'Before event' },
  ]
}

// ── Color map for onboarding swatches ────────────────────────────────────────

const COLOR_HEX: Record<string, string> = {
  Champagne:  '#F5E6D3',
  Midnight:   '#1A1A2E',
  Gold:       '#D4AF37',
  'Deep Red': '#C0392B',
  Blush:      '#F8C8D4',
  Sage:       '#2ECC71',
  'Sky Blue': '#5DADE2',
  Terracotta: '#784212',
  Lavender:   '#DDB8F5',
  White:      '#F0F0F0',
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="min-h-screen bg-[#F8F4FC] animate-pulse">
      <div className="h-16 bg-[#1A1A2E]" />
      <div className="h-52 bg-[#2a1a3e]" />
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {[160, 200, 180].map(h => (
            <div key={h} className="rounded-2xl bg-white" style={{ height: h, boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }} />
          ))}
        </div>
        <div className="space-y-4">
          {[140, 160, 120].map(h => (
            <div key={h} className="rounded-2xl bg-white" style={{ height: h, boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EventSummaryPage() {
  const logoHref = useLogoHref()
  const params  = useParams()
  const router  = useRouter()
  const id      = params?.id as string

  const [event, setEvent]       = useState<EventRow | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)

  // checklist + task check state
  const [checkedVendors, setCheckedVendors] = useState<Set<string>>(new Set())
  const [checkedTasks,   setCheckedTasks]   = useState<Set<number>>(new Set())

  const load = useCallback(async () => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/auth/signin'); return }

    const [{ data: ev }, { data: bk }] = await Promise.all([
      supabase.from('events').select('*').eq('id', id).single(),
      supabase.from('bookings')
        .select('id, vendor_profiles(category)')
        .eq('client_email', user.email),
    ])

    if (!ev) { setNotFound(true); setLoading(false); return }

    setEvent(ev as EventRow)
    setBookings((bk ?? []) as Booking[])
    setLoading(false)
  }, [id, router])

  useEffect(() => { load() }, [load])

  if (loading)  return <Skeleton />
  if (notFound) return (
    <div
      className={`${syne.variable} ${spaceGrotesk.variable} min-h-screen flex flex-col items-center justify-center gap-4`}
      style={{ background: '#F8F4FC', fontFamily: 'var(--font-space), sans-serif' }}
    >
      <p style={{ fontFamily: 'var(--font-syne)', fontSize: 24, fontWeight: 700, color: '#1A1A2E' }}>Event not found</p>
      <Link href="/dashboard" style={{ color: '#4A0E6E', fontWeight: 600, textDecoration: 'none' }}>
        Back to Dashboard
      </Link>
    </div>
  )

  const ev = event!
  const vendors    = getVendorList(ev.event_type)
  const tasks      = getTasks(ev.event_date)
  const bookedCats = new Set(bookings.map(b => b.vendor_profiles?.category ?? ''))

  function toggleVendor(v: string) {
    setCheckedVendors(prev => { const n = new Set(prev); n.has(v) ? n.delete(v) : n.add(v); return n })
  }
  function toggleTask(i: number) {
    setCheckedTasks(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const tierColors: Record<string, string> = {
    Affordable: '#D1FAE5',
    'Mid-Range': '#DBEAFE',
    Luxury:     '#F3E8FF',
    'Ultra High-End': '#FEF3C7',
  }

  const card: React.CSSProperties = {
    background: 'white',
    borderRadius: 20,
    padding: '1.5rem',
    boxShadow: '0 1px 4px rgba(74,14,110,0.07)',
    marginBottom: '1.25rem',
  }

  return (
    <div
      className={`${syne.variable} ${spaceGrotesk.variable} min-h-screen`}
      style={{ background: '#F8F4FC', fontFamily: 'var(--font-space), sans-serif' }}
    >

      {/* ── TOP NAV ── */}
      <nav style={{ background: '#1A1A2E', position: 'sticky', top: 0, zIndex: 40 }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link
            href={logoHref}
            style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '1.35rem', letterSpacing: '-0.03em', color: 'white', textDecoration: 'none' }}
          >
            evnti<span style={{ color: '#DDB8F5' }}>.</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              style={{ fontFamily: 'var(--font-space)', fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255,255,255,0.65)', textDecoration: 'none' }}
            >
              My Dashboard
            </Link>
            <Link
              href={`/timeline?eventId=${id}`}
              style={{
                background: 'rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.8)',
                borderRadius: 100, padding: '0.45rem 1rem',
                fontFamily: 'var(--font-space)', fontSize: '0.8rem', fontWeight: 500,
                textDecoration: 'none', flexShrink: 0,
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              Timeline
            </Link>
            <Link
              href={`/budget?eventId=${id}`}
              style={{
                background: 'rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.8)',
                borderRadius: 100, padding: '0.45rem 1rem',
                fontFamily: 'var(--font-space)', fontSize: '0.8rem', fontWeight: 500,
                textDecoration: 'none', flexShrink: 0,
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              Budget
            </Link>
            <Link
              href="/ai-plan"
              style={{
                background: '#4A0E6E', color: 'white',
                borderRadius: 100, padding: '0.45rem 1.1rem',
                fontFamily: 'var(--font-space)', fontSize: '0.8rem', fontWeight: 600,
                textDecoration: 'none', flexShrink: 0,
              }}
            >
              Ask Eve
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO BANNER ── */}
      <div className="relative overflow-hidden" style={{ minHeight: 220 }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: "url('/images/feature.jpg')",
          backgroundSize: 'cover', backgroundPosition: 'center',
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,26,46,0.82)' }} />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 pb-16">
          <p style={{
            fontFamily: 'var(--font-space)', fontSize: '0.65rem', fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase', color: '#DDB8F5',
            marginBottom: '0.75rem',
          }}>
            Your Event Plan
          </p>
          <h1 style={{
            fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 'clamp(1.6rem, 3vw, 2.25rem)',
            letterSpacing: '-0.025em', color: 'white', lineHeight: 1.2,
            marginBottom: '0.625rem',
          }}>
            {ev.event_type ?? 'Event'}
            {ev.location ? ` — ${ev.location}` : ''}
          </h1>
          <p style={{ fontFamily: 'var(--font-space)', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1rem' }}>
            {ev.event_date ? formatDate(ev.event_date) : ''}
            {ev.guest_count ? ` · ${ev.guest_count} guests` : ''}
            {ev.total_budget ? ` · ${formatCurrency(ev.total_budget)}` : ''}
          </p>
          {ev.tier && (
            <span style={{
              display: 'inline-block',
              background: tierColors[ev.tier] ?? 'rgba(221,184,245,0.2)',
              color: '#4A0E6E',
              borderRadius: 100, padding: '0.3rem 0.9rem',
              fontFamily: 'var(--font-space)', fontSize: '0.75rem', fontWeight: 600,
            }}>
              {ev.tier}
            </span>
          )}
        </div>
      </div>

      {/* ── MOOD BOARD ROW ── */}
      {((ev.keywords && ev.keywords.length > 0) || (ev.colors && ev.colors.length > 0)) && (
        <div style={{ background: 'white', borderBottom: '1px solid rgba(74,14,110,0.07)' }}>
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center gap-3">
            {ev.keywords?.map(kw => (
              <span
                key={kw}
                style={{
                  background: 'rgba(221,184,245,0.18)', color: '#4A0E6E',
                  borderRadius: 100, padding: '0.25rem 0.75rem',
                  fontFamily: 'var(--font-space)', fontSize: '0.75rem', fontWeight: 500,
                  border: '1px solid rgba(221,184,245,0.4)',
                }}
              >
                {kw}
              </span>
            ))}
            {ev.colors?.map(name => {
              const hex = COLOR_HEX[name]
              if (!hex) return null
              return (
                <span
                  key={name}
                  title={name}
                  style={{
                    display: 'inline-block',
                    width: 22, height: 22, borderRadius: '50%',
                    background: hex,
                    border: name === 'White' ? '1.5px solid rgba(0,0,0,0.1)' : '2px solid rgba(0,0,0,0.08)',
                    flexShrink: 0,
                  }}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2">

            {/* Section 1 — Vendor Checklist */}
            <div style={card}>
              <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '1.05rem', color: '#1A1A2E', marginBottom: '1.125rem' }}>
                Your Vendor Checklist
              </h2>
              <div className="flex flex-col" style={{ gap: 2 }}>
                {vendors.map(vendor => {
                  const checked   = checkedVendors.has(vendor)
                  const isBooked  = bookedCats.has(vendor)
                  const slug      = encodeURIComponent(vendor.toLowerCase().replace(/\s+/g, '-'))
                  return (
                    <div
                      key={vendor}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors"
                      style={{ background: checked ? 'rgba(74,14,110,0.04)' : 'transparent' }}
                    >
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={() => toggleVendor(vendor)}
                        style={{
                          width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                          border: checked ? 'none' : '1.5px solid #DDB8F5',
                          background: checked ? '#4A0E6E' : 'white',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'background 0.15s',
                        }}
                        aria-label={`Mark ${vendor} as checked`}
                      >
                        {checked && (
                          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                            <path d="M1 4l3 3.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>

                      {/* Name */}
                      <span
                        style={{
                          fontFamily: 'var(--font-space)', fontSize: '0.9rem', fontWeight: 500,
                          color: checked ? '#7C6B8A' : '#1A1A2E',
                          textDecoration: checked ? 'line-through' : 'none',
                          flex: 1,
                        }}
                      >
                        {vendor}
                      </span>

                      {/* Status badge */}
                      <span
                        style={{
                          fontFamily: 'var(--font-space)', fontSize: '0.7rem', fontWeight: 600,
                          color: isBooked ? '#065F46' : '#9CA3AF',
                          background: isBooked ? '#D1FAE5' : '#F3F4F6',
                          borderRadius: 100, padding: '0.2rem 0.6rem', flexShrink: 0,
                        }}
                      >
                        {isBooked ? 'Booked' : 'Not booked'}
                      </span>

                      {/* Find vendors link */}
                      <Link
                        href={`/vendors?category=${slug}`}
                        style={{
                          fontFamily: 'var(--font-space)', fontSize: '0.75rem', fontWeight: 600,
                          color: '#4A0E6E', textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap',
                        }}
                      >
                        Find vendors →
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Section 2 — Tasks */}
            <div style={card}>
              <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '1.05rem', color: '#1A1A2E', marginBottom: '1.125rem' }}>
                Your Tasks
              </h2>
              <div className="flex flex-col gap-3">
                {tasks.map((task, i) => {
                  const done = checkedTasks.has(i)
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-xl p-4"
                      style={{
                        border: '1px solid',
                        borderColor: done ? 'rgba(74,14,110,0.08)' : 'rgba(74,14,110,0.1)',
                        background: done ? 'rgba(74,14,110,0.03)' : 'white',
                        transition: 'background 0.15s',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => toggleTask(i)}
                        style={{
                          width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
                          border: done ? 'none' : '1.5px solid #DDB8F5',
                          background: done ? '#4A0E6E' : 'white',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'background 0.15s',
                        }}
                        aria-label={`Mark task as ${done ? 'incomplete' : 'complete'}`}
                      >
                        {done && (
                          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                            <path d="M1 4l3 3.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                      <div style={{ flex: 1 }}>
                        <p style={{
                          fontFamily: 'var(--font-space)', fontSize: '0.875rem', fontWeight: 500,
                          color: done ? '#9CA3AF' : '#1A1A2E',
                          textDecoration: done ? 'line-through' : 'none',
                          marginBottom: '0.2rem',
                        }}>
                          {task.text}
                        </p>
                        <p style={{ fontFamily: 'var(--font-space)', fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 400 }}>
                          Due: {task.due}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="lg:sticky lg:top-24 flex flex-col gap-5">

            {/* Card 1 — Event Summary */}
            <div style={{ ...card, marginBottom: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '0.95rem', color: '#1A1A2E' }}>
                  Event Summary
                </h3>
                <a
                  href="#"
                  style={{ fontFamily: 'var(--font-space)', fontSize: '0.75rem', fontWeight: 600, color: '#4A0E6E', textDecoration: 'none' }}
                >
                  Edit event
                </a>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Type',     value: ev.event_type },
                  { label: 'Date',     value: ev.event_date ? formatDate(ev.event_date) : null },
                  { label: 'Location', value: ev.location },
                  { label: 'Guests',   value: ev.guest_count ? `${ev.guest_count} guests` : null },
                  { label: 'Budget',   value: ev.total_budget ? formatCurrency(ev.total_budget) : null },
                  { label: 'Tier',     value: ev.tier },
                ].filter(r => r.value).map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-baseline gap-3">
                    <span style={{ fontFamily: 'var(--font-space)', fontSize: '0.72rem', fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0 }}>
                      {label}
                    </span>
                    <span style={{ fontFamily: 'var(--font-syne)', fontSize: '0.875rem', fontWeight: 600, color: '#1A1A2E', textAlign: 'right' }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2 — Ask Eve */}
            <div style={{ ...card, marginBottom: 0, background: 'linear-gradient(135deg, #2d0a4e 0%, #4A0E6E 100%)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(221,184,245,0.2)',
                  border: '1px solid rgba(221,184,245,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-syne)', fontSize: '1rem', fontWeight: 800, color: '#DDB8F5',
                }}>
                  E
                </div>
                <h3 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '0.95rem', color: 'white' }}>
                  Need more help?
                </h3>
              </div>
              <p style={{ fontFamily: 'var(--font-space)', fontSize: '0.825rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, marginBottom: '1rem' }}>
                Get personalized vendor recommendations and planning advice from Eve.
              </p>
              <Link
                href="/ai-plan"
                style={{
                  display: 'block', width: '100%', textAlign: 'center',
                  background: '#DDB8F5', color: '#4A0E6E',
                  borderRadius: 12, padding: '0.7rem',
                  fontFamily: 'var(--font-syne)', fontSize: '0.875rem', fontWeight: 700,
                  textDecoration: 'none', transition: 'opacity 0.15s',
                  boxSizing: 'border-box',
                }}
              >
                Ask Eve now
              </Link>
            </div>

            {/* Card 3 — Quick links */}
            <div style={{ ...card, marginBottom: 0 }}>
              <h3 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '0.9rem', color: '#1A1A2E', marginBottom: '0.875rem' }}>
                Quick links
              </h3>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Browse vendors',  href: '/vendors' },
                  { label: 'My bookings',     href: '/dashboard#bookings-section' },
                  { label: 'My schedule',     href: `/schedule?eventId=${id}` },
                  { label: 'Timeline',        href: `/timeline?eventId=${id}` },
                  { label: 'Budget tracker',  href: `/budget?eventId=${id}` },
                ].map(({ label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors"
                    style={{
                      fontFamily: 'var(--font-space)', fontSize: '0.85rem', fontWeight: 500,
                      color: '#4A0E6E', textDecoration: 'none',
                      background: 'rgba(74,14,110,0.05)',
                      border: '1px solid rgba(74,14,110,0.09)',
                    }}
                  >
                    {label}
                    <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>→</span>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#EDE5F7]">
        <div className="flex items-stretch h-16">
          {([
            { icon: <Home     size={20} />, label: 'Home',     href: '/dashboard' },
            { icon: <Store    size={20} />, label: 'Vendors',  href: '/vendors' },
            { icon: <Sparkles size={20} />, label: 'Eve',      href: '/ai-plan' },
            { icon: <Calendar size={20} />, label: 'Timeline', href: `/timeline?eventId=${id}` },
            { icon: <Grid     size={20} />, label: 'Schedule', href: `/schedule?eventId=${id}` },
          ] as { icon: React.ReactNode; label: string; href: string }[]).map(item => (
            <Link
              key={item.label}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-0"
            >
              <span style={{ color: '#7C6B8A' }}>{item.icon}</span>
              <span
                className="text-[10px] font-semibold mt-0.5"
                style={{ fontFamily: 'var(--font-space)', color: '#7C6B8A' }}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom nav spacer on mobile */}
      <div className="md:hidden h-16" />
    </div>
  )
}
