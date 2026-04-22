'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Syne, Space_Grotesk } from 'next/font/google'
import { getSupabaseClient } from '@/lib/supabase'

const syne = Syne({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-syne' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-space' })

// ── Types ──────────────────────────────────────────────────────────────────────

interface EventRow {
  id: string
  event_type: string | null
  event_date: string | null
  location: string | null
  guest_count: number | null
  total_budget: number | null
  status: string | null
  created_at: string | null
}

interface Booking {
  id: string
  vendor_profiles: { business_name: string; category: string } | null
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function daysUntil(iso: string): number {
  const now = new Date(); now.setHours(0, 0, 0, 0)
  const target = new Date(iso); target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function monthsUntil(iso: string): number {
  const now = new Date()
  const target = new Date(iso)
  return (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth())
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

// ── Vendor checklist config ────────────────────────────────────────────────────

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

// ── Personal reminders config ──────────────────────────────────────────────────

const BASE_REMINDERS = [
  'Confirm your outfit & shoes',
  'Finalize your guest list',
  'Arrange transportation to & from venue',
  'Book your accommodation if needed',
  'Plan rehearsal or pre-event schedule',
  'Sort event favors or gifts',
  'Brief family members on the day timeline',
  'Confirm dietary requirements with caterer',
  'Prepare payments for all vendors',
  'Create a day-of emergency kit',
  'Charge all devices the night before',
]

const WEDDING_REMINDER = 'Prepare personal vows or speeches'

function getReminderList(eventType: string | null): string[] {
  const isWedding = eventType === 'Wedding'
  const vows = isWedding ? [WEDDING_REMINDER] : []
  return [...BASE_REMINDERS.slice(0, 5), ...vows, ...BASE_REMINDERS.slice(5)]
}

// ── Timeline milestones ────────────────────────────────────────────────────────

interface Milestone { label: string; task: string; monthsOut: number }

function getMilestones(eventDate: string): Milestone[] {
  const eventMs = new Date(eventDate).getTime()
  const phases = [
    { mb: 6,   label: '6+ months out', tasks: ['Book venue', 'Set budget', 'Create guest list'] },
    { mb: 5,   label: '5 months out',  tasks: ['Book catering', 'Book photographer', 'Send save-the-dates'] },
    { mb: 4,   label: '4 months out',  tasks: ['Send invitations', 'Book entertainment'] },
    { mb: 3,   label: '3 months out',  tasks: ['Book remaining vendors', 'Plan menu', 'Order cake'] },
    { mb: 2,   label: '2 months out',  tasks: ['Confirm all bookings', 'Create day schedule'] },
    { mb: 1,   label: '1 month out',   tasks: ['Final headcount', 'Confirm payments'] },
    { mb: 0.5, label: '2 weeks out',   tasks: ['Pack essentials', 'Brief vendors on timeline'] },
    { mb: 0,   label: 'Day of',        tasks: ['Enjoy your event!'] },
  ]
  const out: Milestone[] = []
  for (const p of phases) {
    const phaseMs = eventMs - p.mb * 30.44 * 24 * 60 * 60 * 1000
    const label = p.mb === 0 ? formatDate(eventDate) : formatDate(new Date(phaseMs).toISOString())
    for (const task of p.tasks) out.push({ label, task, monthsOut: p.mb })
  }
  return out
}

function getMilestoneStatus(monthsOut: number, eventDate: string): 'past' | 'current' | 'future' {
  const m = monthsUntil(eventDate)
  if (m > monthsOut) return 'future'
  if (Math.round(m) === Math.round(monthsOut)) return 'current'
  return 'past'
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="min-h-screen bg-[#F8F4FC] animate-pulse">
      <div className="h-16 bg-[#1A1A2E]" />
      <div className="h-64 bg-[#2a1a3e]" />
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        {[200, 280, 420].map(h => (
          <div key={h} className="rounded-2xl bg-white" style={{ height: h, boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }} />
        ))}
      </div>
    </div>
  )
}

// ── Checkbox ───────────────────────────────────────────────────────────────────

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={e => { e.stopPropagation(); onChange() }}
      aria-label={label}
      style={{
        width: 20, height: 20, borderRadius: 6, flexShrink: 0,
        border: checked ? 'none' : '1.5px solid #DDB8F5',
        background: checked ? '#4A0E6E' : 'white',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s',
      }}
    >
      {checked && (
        <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
          <path d="M1 4l3 3.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}


// ── Page ──────────────────────────────────────────────────────────────────────
export default function TimelinePage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const eventId      = searchParams.get('eventId')

  const [event,    setEvent]    = useState<EventRow | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading,  setLoading]  = useState(true)
  const [noEvent,  setNoEvent]  = useState(false)

  const [checkedVendors,   setCheckedVendors]   = useState<Set<string>>(new Set())
  const [checkedReminders, setCheckedReminders] = useState<Set<number>>(new Set())
  const [checkedTimeline,  setCheckedTimeline]  = useState<Set<number>>(new Set())

  const load = useCallback(async () => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/auth/signin'); return }

    let eventsQuery = supabase
      .from('events')
      .select('id, event_type, event_date, location, guest_count, total_budget, status, created_at')
      .eq('client_id', user.id)

    if (eventId) {
      eventsQuery = eventsQuery.eq('id', eventId)
    } else {
      eventsQuery = eventsQuery.order('created_at', { ascending: false }).limit(1)
    }

    const [{ data: events }, { data: bk }] = await Promise.all([
      eventsQuery,
      supabase
        .from('bookings')
        .select('id, vendor_profiles(business_name, category)')
        .eq('client_email', user.email),
    ])

    const ev = events?.[0] ?? null
    if (!ev) { setNoEvent(true); setLoading(false); return }

    setEvent(ev as EventRow)
    setBookings((bk ?? []) as Booking[])

    try {
      const stored = JSON.parse(localStorage.getItem(`timeline_${ev.id}`) ?? '{}')
      if (stored.vendors)   setCheckedVendors(new Set(stored.vendors))
      if (stored.reminders) setCheckedReminders(new Set(stored.reminders))
      if (stored.timeline)  setCheckedTimeline(new Set(stored.timeline))
    } catch { /* ignore */ }

    setLoading(false)
  }, [router, eventId])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!event) return
    localStorage.setItem(`timeline_${event.id}`, JSON.stringify({
      vendors:   [...checkedVendors],
      reminders: [...checkedReminders],
      timeline:  [...checkedTimeline],
    }))
  }, [checkedVendors, checkedReminders, checkedTimeline, event])

  if (loading) return <Skeleton />

  if (noEvent) return (
    <div
      className={`${syne.variable} ${spaceGrotesk.variable} min-h-screen flex flex-col items-center justify-center gap-5`}
      style={{ background: '#F8F4FC', fontFamily: 'var(--font-space), sans-serif' }}
    >
      <p style={{ fontFamily: 'var(--font-syne)', fontSize: 22, fontWeight: 700, color: '#1A1A2E' }}>
        No event found. Start planning!
      </p>
      <Link
        href="/onboarding"
        style={{
          background: '#4A0E6E', color: 'white', borderRadius: 100, padding: '0.65rem 1.6rem',
          fontFamily: 'var(--font-syne)', fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none',
        }}
      >
        Create your event
      </Link>
    </div>
  )

  const ev         = event!
  const vendors    = getVendorList(ev.event_type)
  const reminders  = getReminderList(ev.event_type)
  const milestones = ev.event_date ? getMilestones(ev.event_date) : []

  const bookedMap = new Map(
    bookings.filter(b => b.vendor_profiles).map(b => [b.vendor_profiles!.category, b.vendor_profiles!.business_name])
  )

  const days       = ev.event_date ? daysUntil(ev.event_date) : null
  const totalItems = vendors.length + reminders.length + milestones.length
  const doneCount  = checkedVendors.size + checkedReminders.size + checkedTimeline.size
  const progress   = totalItems > 0 ? Math.round((doneCount / totalItems) * 100) : 0

  function toggleVendor(v: string) {
    setCheckedVendors(prev => { const n = new Set(prev); n.has(v) ? n.delete(v) : n.add(v); return n })
  }
  function toggleReminder(i: number) {
    setCheckedReminders(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })
  }
  function toggleTimeline(i: number) {
    setCheckedTimeline(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })
  }

  const card: React.CSSProperties = {
    background: 'white', borderRadius: 20, padding: '1.5rem',
    boxShadow: '0 1px 4px rgba(74,14,110,0.07)', marginBottom: '1.5rem',
  }

  type MGroup = { label: string; monthsOut: number; items: Array<{ task: string; idx: number }> }
  const milestoneGroups: MGroup[] = []
  milestones.forEach((m, idx) => {
    const last = milestoneGroups[milestoneGroups.length - 1]
    if (last && last.label === m.label) { last.items.push({ task: m.task, idx }) }
    else { milestoneGroups.push({ label: m.label, monthsOut: m.monthsOut, items: [{ task: m.task, idx }] }) }
  })

  return (
    <div
      className={`${syne.variable} ${spaceGrotesk.variable} min-h-screen`}
      style={{ background: '#F8F4FC', fontFamily: 'var(--font-space), sans-serif' }}
    >

      {/* ── TOP NAV ── */}
      <nav style={{ background: '#1A1A2E', position: 'sticky', top: 0, zIndex: 40 }}>
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '1.35rem',
              letterSpacing: '-0.03em', color: 'white', textDecoration: 'none', flexShrink: 0,
            }}
          >
            evnti<span style={{ color: '#DDB8F5' }}>.</span>
          </Link>

          <div className="flex-1 flex justify-center px-4 min-w-0">
            {ev.event_type && (
              <span style={{
                fontFamily: 'var(--font-syne)', fontSize: '0.85rem', fontWeight: 700,
                color: 'rgba(255,255,255,0.72)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {ev.event_type}{ev.event_date ? ` — ${formatDate(ev.event_date)}` : ''}
              </span>
            )}
          </div>

          <Link
            href="/dashboard"
            style={{
              fontFamily: 'var(--font-space)', fontSize: '0.85rem', fontWeight: 500,
              color: 'rgba(255,255,255,0.6)', textDecoration: 'none', flexShrink: 0,
            }}
          >
            My Dashboard
          </Link>
        </div>
      </nav>

      {/* ── HERO BANNER ── */}
      <div className="relative overflow-hidden" style={{ minHeight: 260 }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: "url('/images/feature.jpg')",
          backgroundSize: 'cover', backgroundPosition: 'center',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(26,26,46,0.93) 0%, rgba(74,14,110,0.86) 100%)',
        }} />

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
          <p style={{
            fontFamily: 'var(--font-space)', fontSize: '0.65rem', fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase', color: '#DDB8F5',
            marginBottom: '0.5rem',
          }}>
            Planning Hub
          </p>
          <h1 style={{
            fontFamily: 'var(--font-syne)', fontWeight: 800,
            fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
            letterSpacing: '-0.03em', color: 'white', lineHeight: 1.15,
            marginBottom: '1.5rem',
          }}>
            Your Event Timeline
          </h1>

          <div className="flex flex-wrap items-center gap-3 mb-5">
            {days !== null && (
              <div style={{
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.11)',
                borderRadius: 12, padding: '0.5rem 1rem', textAlign: 'center',
              }}>
                <div style={{ fontFamily: 'var(--font-syne)', fontSize: '1.5rem', fontWeight: 800, color: days < 30 ? '#FF6B6B' : 'white', lineHeight: 1 }}>
                  {Math.max(days, 0)}
                </div>
                <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.42)', letterSpacing: '0.08em', marginTop: 2 }}>
                  {days <= 0 ? 'TODAY' : 'DAYS TO GO'}
                </div>
              </div>
            )}
            <div style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.11)',
              borderRadius: 12, padding: '0.5rem 1rem', textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--font-syne)', fontSize: '1.5rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>
                {bookedMap.size}
              </div>
              <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.42)', letterSpacing: '0.08em', marginTop: 2 }}>
                VENDORS BOOKED
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.11)',
              borderRadius: 12, padding: '0.5rem 1rem', textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--font-syne)', fontSize: '1.5rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>
                {progress}%
              </div>
              <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.42)', letterSpacing: '0.08em', marginTop: 2 }}>
                COMPLETE
              </div>
            </div>
          </div>

          <div style={{ maxWidth: 400 }}>
            <div className="flex justify-between mb-1">
              <span style={{ fontFamily: 'var(--font-space)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)' }}>
                Overall progress
              </span>
              <span style={{ fontFamily: 'var(--font-syne)', fontSize: '0.7rem', fontWeight: 700, color: '#DDB8F5' }}>
                {doneCount} / {totalItems} items
              </span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 100, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${progress}%`,
                background: 'linear-gradient(90deg, #DDB8F5, #9B59D0)',
                borderRadius: 100, transition: 'width 0.6s ease',
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Section 1 — Book via Evnti */}
        <div style={card}>
          <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '1.1rem', color: '#1A1A2E', marginBottom: '0.25rem' }}>
            Book via Evnti
          </h2>
          <p style={{ fontFamily: 'var(--font-space)', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '1.25rem' }}>
            Track your vendor bookings for this event.
          </p>

          <div className="flex flex-col" style={{ gap: 4 }}>
            {vendors.map(vendor => {
              const checked    = checkedVendors.has(vendor)
              const bookedName = bookedMap.get(vendor)
              const isBooked   = !!bookedName
              const slug       = encodeURIComponent(vendor.toLowerCase().replace(/[\s/]+/g, '-'))

              return (
                <div
                  key={vendor}
                  className="flex items-center gap-3 rounded-xl px-3 py-3"
                  style={{ background: checked ? 'rgba(74,14,110,0.04)' : 'transparent' }}
                >
                  <Checkbox checked={checked} onChange={() => toggleVendor(vendor)} label={`Mark ${vendor} as done`} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{
                      fontFamily: 'var(--font-syne)', fontSize: '0.9rem', fontWeight: 700,
                      color: checked ? '#9CA3AF' : '#1A1A2E',
                      textDecoration: checked ? 'line-through' : 'none',
                    }}>
                      {vendor}
                    </span>
                    {isBooked && bookedName && (
                      <p style={{ fontFamily: 'var(--font-space)', fontSize: '0.72rem', color: '#6B7280', marginTop: 1 }}>
                        {bookedName}
                      </p>
                    )}
                  </div>

                  <span style={{
                    fontFamily: 'var(--font-space)', fontSize: '0.7rem', fontWeight: 600,
                    color: isBooked ? '#065F46' : '#9CA3AF',
                    background: isBooked ? '#D1FAE5' : '#F3F4F6',
                    borderRadius: 100, padding: '0.2rem 0.65rem', flexShrink: 0,
                  }}>
                    {isBooked ? 'Booked' : 'Not booked'}
                  </span>

                  {!isBooked && (
                    <Link
                      href={`/vendors?category=${slug}`}
                      style={{
                        fontFamily: 'var(--font-space)', fontSize: '0.75rem', fontWeight: 600,
                        color: '#4A0E6E', textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap',
                      }}
                    >
                      Find vendors →
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Section 2 — Personal Reminders */}
        <div style={card}>
          <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '1.1rem', color: '#1A1A2E', marginBottom: '0.25rem' }}>
            Personal Reminders
          </h2>
          <p style={{ fontFamily: 'var(--font-space)', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '1.25rem' }}>
            Don&apos;t forget these important tasks before your event.
          </p>

          <div className="flex flex-col gap-2">
            {reminders.map((reminder, i) => {
              const done = checkedReminders.has(i)
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer"
                  style={{
                    border: '1px solid',
                    borderColor: done ? 'rgba(74,14,110,0.06)' : 'rgba(74,14,110,0.1)',
                    background: done ? 'rgba(74,14,110,0.03)' : 'white',
                    transition: 'background 0.15s',
                  }}
                  onClick={() => toggleReminder(i)}
                >
                  <Checkbox checked={done} onChange={() => toggleReminder(i)} label={reminder} />
                  <span style={{
                    fontFamily: 'var(--font-space)', fontSize: '0.875rem', fontWeight: 500,
                    color: done ? '#9CA3AF' : '#1A1A2E',
                    textDecoration: done ? 'line-through' : 'none',
                    flex: 1,
                  }}>
                    {reminder}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Section 3 — Timeline */}
        <div style={card}>
          <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '1.1rem', color: '#1A1A2E', marginBottom: '0.25rem' }}>
            Timeline
          </h2>
          <p style={{ fontFamily: 'var(--font-space)', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '1.75rem' }}>
            Key milestones leading up to your event.
          </p>

          {!ev.event_date ? (
            <p style={{ fontFamily: 'var(--font-space)', fontSize: '0.875rem', color: '#9CA3AF' }}>
              Add an event date to see your timeline.
            </p>
          ) : (
            <div>
              {milestoneGroups.map((group, gi) => {
                const status = getMilestoneStatus(group.monthsOut, ev.event_date!)
                const isLast = gi === milestoneGroups.length - 1

                const dotBg =
                  status === 'past'    ? '#10B981' :
                  status === 'current' ? '#D4AC0D'  :
                  'white'
                const dotBorder = status === 'future' ? '2px solid #DDB8F5' : 'none'
                const lineBg    = status === 'past' ? 'rgba(16,185,129,0.3)' : 'rgba(221,184,245,0.4)'

                return (
                  <div key={gi} className="flex gap-4" style={{ marginBottom: isLast ? 0 : '1.25rem' }}>
                    <div className="flex flex-col items-center" style={{ width: 28, flexShrink: 0 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: dotBg, border: dotBorder, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
                      }}>
                        {status === 'past' && (
                          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                            <path d="M1 4l3 3.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        {status === 'current' && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                        {status === 'future'  && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#DDB8F5' }} />}
                      </div>
                      {!isLast && (
                        <div style={{ width: 2, flex: 1, minHeight: 24, marginTop: 4, background: lineBg }} />
                      )}
                    </div>

                    <div style={{ flex: 1, paddingBottom: isLast ? 0 : 4 }}>
                      <p style={{
                        fontFamily: 'var(--font-space)', fontSize: '0.7rem', fontWeight: 600,
                        letterSpacing: '0.07em', textTransform: 'uppercase',
                        color: status === 'past' ? '#10B981' : status === 'current' ? '#D4AC0D' : '#9CA3AF',
                        marginBottom: '0.4rem',
                      }}>
                        {group.label}
                      </p>

                      <div className="flex flex-col gap-2">
                        {group.items.map(({ task, idx }) => {
                          const done = checkedTimeline.has(idx)
                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer"
                              style={{
                                border: '1px solid',
                                borderColor: done ? 'rgba(74,14,110,0.06)' : 'rgba(74,14,110,0.09)',
                                background: done ? 'rgba(74,14,110,0.03)' : 'white',
                                transition: 'background 0.15s',
                              }}
                              onClick={() => toggleTimeline(idx)}
                            >
                              <Checkbox checked={done} onChange={() => toggleTimeline(idx)} label={task} />
                              <span style={{
                                fontFamily: 'var(--font-space)', fontSize: '0.875rem', fontWeight: 500,
                                color: done ? '#9CA3AF' : '#1A1A2E',
                                textDecoration: done ? 'line-through' : 'none',
                                flex: 1,
                              }}>
                                {task}
                              </span>
                              {status === 'current' && !done && (
                                <span style={{
                                  fontFamily: 'var(--font-space)', fontSize: '0.65rem', fontWeight: 700,
                                  background: '#FEF9E7', color: '#D4AC0D',
                                  borderRadius: 100, padding: '0.2rem 0.55rem', flexShrink: 0,
                                }}>
                                  Now
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
