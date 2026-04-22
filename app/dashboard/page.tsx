'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Syne, Space_Grotesk } from 'next/font/google'
import { getSupabaseClient } from '@/lib/supabase'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne-cd',
})
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-cd',
})

// ── Types ─────────────────────────────────────────────────────────────────────

interface ClientEvent {
  id: string
  event_type: string | null
  event_date: string | null
  location: string | null
  guest_count: number | null
  total_budget: number | null
  status: string | null
  created_at: string
}

interface Booking {
  id: string
  vendor_id: string
  event_type: string | null
  event_date: string | null
  deposit_amount: number | null
  status: string
  created_at: string
  vendor_profiles: {
    business_name: string
    category: string
  } | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatCurrency(n: number): string {
  return `$${n.toLocaleString('en-US')}`
}

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  pending:   { bg: '#FEF3C7', color: '#92400E', label: 'Pending' },
  confirmed: { bg: '#DBEAFE', color: '#1E40AF', label: 'Confirmed' },
  paid:      { bg: '#D1FAE5', color: '#065F46', label: 'Paid' },
  declined:  { bg: '#F3F4F6', color: '#6B7280', label: 'Declined' },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.pending
  return (
    <span
      className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0"
      style={{ background: s.bg, color: s.color, fontFamily: 'var(--font-syne-cd)' }}
    >
      {s.label}
    </span>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className="bg-white rounded-2xl px-5 py-5"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderRadius: 16 }}
    >
      <p
        className="text-[11px] font-semibold uppercase tracking-widest text-[#7C6B8A] mb-2"
        style={{ fontFamily: 'var(--font-space-cd)' }}
      >
        {label}
      </p>
      <p
        className="text-2xl font-bold"
        style={{ fontFamily: 'var(--font-syne-cd)', color: accent ? '#4A0E6E' : '#1A1A2E' }}
      >
        {value}
      </p>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      {/* Nav */}
      <div className="h-16 bg-[#1A1A2E]" />
      {/* Hero banner */}
      <div className="bg-[#1A1A2E] px-6 pt-10 pb-20">
        <div className="max-w-6xl mx-auto space-y-3">
          <div className="h-7 w-56 bg-white/10 rounded" />
          <div className="h-4 w-80 bg-white/10 rounded" />
        </div>
      </div>
      {/* Stat cards overlapping */}
      <div className="max-w-6xl mx-auto px-6 -mt-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-2xl" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }} />
          ))}
        </div>
      </div>
      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-5 w-36 bg-gray-200 rounded" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-white rounded-2xl" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }} />
            ))}
          </div>
          <div className="space-y-4">
            <div className="h-5 w-28 bg-gray-200 rounded" />
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-28 bg-white rounded-2xl" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ClientDashboardPage() {
  const router = useRouter()

  const [userEmail, setUserEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [authLoading, setAuthLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [events, setEvents] = useState<ClientEvent[]>([])
  const [signingOut, setSigningOut] = useState(false)
  const [fabOpen, setFabOpen]       = useState(false)
  const [activeNav, setActiveNav]   = useState<string>('My Events')

  const loadData = useCallback(async () => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.replace('/auth/signin')
      return
    }

    setUserEmail(user.email ?? '')
    setAuthLoading(false)

    const [{ data: bookingData }, { data: eventData }, { data: userData }] = await Promise.all([
      supabase
        .from('bookings')
        .select('id, vendor_id, event_type, event_date, deposit_amount, status, created_at, vendor_profiles(business_name, category)')
        .eq('client_email', user.email)
        .order('created_at', { ascending: false }),
      supabase
        .from('events')
        .select('id, event_type, event_date, location, guest_count, total_budget, status, created_at')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('users')
        .select('full_name')
        .eq('id', user.id)
        .single(),
    ])

    setFullName((userData as { full_name: string } | null)?.full_name ?? '')
    setBookings((bookingData ?? []) as Booking[])
    setEvents((eventData ?? []) as ClientEvent[])
    setDataLoading(false)
  }, [router])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleSignOut() {
    setSigningOut(true)
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (authLoading || dataLoading) return <DashboardSkeleton />

  // ── Derived stats ──
  const activeBookings = bookings.filter(b => b.status !== 'declined').length
  const totalSpent = bookings
    .filter(b => b.status === 'paid')
    .reduce((sum, b) => sum + (b.deposit_amount ?? 0), 0)

  const firstName = fullName.trim().split(' ')[0] || userEmail.split('@')[0]
  const greeting = firstName.charAt(0).toUpperCase() + firstName.slice(1)

  function getTimeGreeting(): string {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div
      className={`${syne.variable} ${spaceGrotesk.variable} min-h-screen bg-white`}
      style={{ fontFamily: 'var(--font-space-cd), system-ui, sans-serif' }}
    >
      {/* ── NAV (sits inside the dark banner) ── */}
      <nav className="bg-[#1A1A2E]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-xl font-extrabold tracking-tight text-white hover:opacity-80 transition-opacity flex-shrink-0"
            style={{ fontFamily: 'var(--font-syne-cd)' }}
          >
            evnti.
          </Link>

          <span
            className="text-sm font-semibold text-white/70 hidden sm:block"
            style={{ fontFamily: 'var(--font-syne-cd)' }}
          >
            My Dashboard
          </span>

          <div className="flex items-center gap-3 flex-shrink-0">
            <span
              className="text-xs text-white/50 hidden md:block max-w-[200px] truncate"
              style={{ fontFamily: 'var(--font-space-cd)' }}
            >
              {userEmail}
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="px-4 py-2 rounded-full text-xs font-semibold border border-white/20 text-white/70 bg-transparent hover:border-white/50 hover:text-white transition-colors disabled:opacity-50"
              style={{ fontFamily: 'var(--font-space-cd)' }}
            >
              {signingOut ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO BANNER ── */}
      <div className="bg-[#1A1A2E] px-6 pt-10 pb-20">
        <div className="max-w-6xl mx-auto">
          <h1
            className="text-[28px] font-bold text-white leading-tight mb-1"
            style={{ fontFamily: 'var(--font-syne-cd)' }}
          >
            {getTimeGreeting()}, {greeting}.
          </h1>
          <p
            className="text-sm font-medium mb-2"
            style={{ color: '#DDB8F5', fontFamily: 'var(--font-space-cd)', fontSize: 14 }}
          >
            Client Dashboard
          </p>
          <p
            className="text-sm text-white/60"
            style={{ fontFamily: 'var(--font-space-cd)' }}
          >
            Here&apos;s what&apos;s happening with your events.
          </p>

          {/* ── SECTION NAV ── */}
          <div className="mt-7 -mx-6 px-6 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="flex gap-2 pb-1" style={{ minWidth: 'max-content' }}>
              {([
                { label: 'My Events',      action: () => { setActiveNav('My Events'); setTimeout(() => document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' }), 10) } },
                { label: 'My Bookings',    action: () => { setActiveNav('My Bookings'); setTimeout(() => document.getElementById('bookings-section')?.scrollIntoView({ behavior: 'smooth' }), 10) } },
                { label: 'Find Vendors',   href: '/vendors' },
                { label: 'Plan New Event', href: '/onboarding' },
                { label: 'Ask Eve',        href: '/ai-plan' },
                { label: 'My Schedule',    href: '/schedule' },
              ] as { label: string; href?: string; action?: () => void }[]).map(item => {
                const active = activeNav === item.label
                const pillStyle: React.CSSProperties = {
                  display: 'inline-flex', alignItems: 'center',
                  height: 34, padding: '0 14px', borderRadius: 100,
                  fontFamily: 'var(--font-space-cd)', fontSize: 13, fontWeight: 500,
                  background: active ? '#4A0E6E' : 'white',
                  color: active ? 'white' : '#4A0E6E',
                  border: active ? '1.5px solid #4A0E6E' : '1.5px solid #4A0E6E',
                  cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none',
                  transition: 'background 0.15s, color 0.15s',
                  flexShrink: 0,
                }
                return item.href ? (
                  <Link key={item.label} href={item.href} style={pillStyle} onClick={() => setActiveNav(item.label)}>
                    {item.label}
                  </Link>
                ) : (
                  <button key={item.label} type="button" style={pillStyle} onClick={item.action}>
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── BELOW HERO: explicit white background ── */}
      <div className="bg-white">

        {/* ── STAT CARDS overlapping the banner ── */}
        <div className="max-w-6xl mx-auto px-6 -mt-10 mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Events planned"  value={String(events.length)} />
            <StatCard label="Active bookings" value={String(activeBookings)} />
            <StatCard label="Total spent"     value={formatCurrency(totalSpent)} accent />
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 pb-12">

          {/* ── MY EVENTS (full-width) ── */}
          <div id="events-section" className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <h2
                className="text-lg font-bold text-[#1A1A2E]"
                style={{ fontFamily: 'var(--font-syne-cd)' }}
              >
                My Events
              </h2>
              <Link
                href="/onboarding"
                className="text-xs font-semibold text-[#4A0E6E] hover:opacity-70 transition-opacity"
                style={{ fontFamily: 'var(--font-space-cd)' }}
              >
                + Plan new event
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map(event => (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl p-5 flex flex-col"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
                >
                  {/* Header */}
                  <div className="mb-3">
                    <p
                      className="text-base font-bold text-[#1A1A2E] leading-snug mb-2"
                      style={{ fontFamily: 'var(--font-syne-cd)' }}
                    >
                      {event.event_type ?? 'Event'}
                    </p>
                    <div className="space-y-0.5">
                      {event.event_date && (
                        <p className="text-xs text-[#7C6B8A]" style={{ fontFamily: 'var(--font-space-cd)' }}>
                          {formatDate(event.event_date)}
                        </p>
                      )}
                      {event.location && (
                        <p className="text-xs text-[#7C6B8A]" style={{ fontFamily: 'var(--font-space-cd)' }}>
                          {event.location}
                        </p>
                      )}
                      {event.guest_count != null && (
                        <p className="text-xs text-[#7C6B8A]" style={{ fontFamily: 'var(--font-space-cd)' }}>
                          {event.guest_count} guests
                        </p>
                      )}
                      {event.total_budget != null && (
                        <p className="text-xs font-semibold text-[#4A0E6E] pt-0.5" style={{ fontFamily: 'var(--font-space-cd)' }}>
                          {formatCurrency(event.total_budget)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-auto pt-3 flex flex-wrap gap-2" style={{ borderTop: '1px solid rgba(74,14,110,0.08)' }}>
                    <Link
                      href={`/events/${event.id}`}
                      className="px-3 py-1.5 rounded-full text-[11px] font-bold text-white flex-shrink-0"
                      style={{ background: '#4A0E6E', fontFamily: 'var(--font-syne-cd)', textDecoration: 'none' }}
                    >
                      View plan
                    </Link>
                    <Link
                      href={`/timeline?eventId=${event.id}`}
                      className="px-3 py-1.5 rounded-full text-[11px] font-semibold flex-shrink-0"
                      style={{
                        background: 'rgba(74,14,110,0.07)', color: '#4A0E6E',
                        fontFamily: 'var(--font-space-cd)', textDecoration: 'none',
                        border: '1px solid rgba(74,14,110,0.15)',
                      }}
                    >
                      Timeline
                    </Link>
                    <Link
                      href={`/budget?eventId=${event.id}`}
                      className="px-3 py-1.5 rounded-full text-[11px] font-semibold flex-shrink-0"
                      style={{
                        background: 'rgba(74,14,110,0.07)', color: '#4A0E6E',
                        fontFamily: 'var(--font-space-cd)', textDecoration: 'none',
                        border: '1px solid rgba(74,14,110,0.15)',
                      }}
                    >
                      Budget
                    </Link>
                  </div>
                </div>
              ))}

              {/* Plan new event card */}
              <Link
                href="/onboarding"
                className="bg-white rounded-2xl p-5 flex flex-col items-center justify-center gap-2 min-h-[160px] hover:opacity-80 transition-opacity"
                style={{
                  border: '2px dashed rgba(74,14,110,0.3)',
                  boxShadow: 'none',
                  textDecoration: 'none',
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(74,14,110,0.08)', color: '#4A0E6E', fontSize: 22, fontWeight: 300, lineHeight: 1 }}
                >
                  +
                </div>
                <p
                  className="text-sm font-bold text-[#4A0E6E]"
                  style={{ fontFamily: 'var(--font-syne-cd)' }}
                >
                  Plan new event
                </p>
              </Link>
            </div>

            {events.length === 0 && (
              <div
                className="bg-white rounded-2xl overflow-hidden"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
              >
                <div className="relative h-[200px]">
                  <img src="/images/venues.jpg" alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: 'rgba(26,26,46,0.4)' }}>
                    <p className="text-base font-bold text-white" style={{ fontFamily: 'var(--font-syne-cd)' }}>No events yet.</p>
                  </div>
                </div>
                <div className="px-5 py-5 text-center">
                  <p className="text-xs text-[#7C6B8A] mb-4" style={{ fontFamily: 'var(--font-space-cd)' }}>Start planning your first event.</p>
                  <Link href="/onboarding" className="px-5 py-2.5 rounded-full text-xs font-bold text-white" style={{ background: '#4A0E6E', fontFamily: 'var(--font-syne-cd)' }}>
                    Plan an event
                  </Link>
                </div>
              </div>
            )}
          </div>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── Bookings ── */}
          <div id="bookings-section" className="lg:col-span-2">
            <h2
              className="text-lg font-bold text-[#1A1A2E] mb-5"
              style={{ fontFamily: 'var(--font-syne-cd)' }}
            >
              My Bookings
            </h2>

            {bookings.length === 0 ? (
              <div
                className="bg-white rounded-2xl overflow-hidden"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
              >
                {/* Image with overlay and text */}
                <div className="relative h-[200px]">
                  <img
                    src="/images/photographers.jpg"
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center"
                    style={{ background: 'rgba(26,26,46,0.4)', borderRadius: 12 }}
                  >
                    <p
                      className="text-base font-bold text-white"
                      style={{ fontFamily: 'var(--font-syne-cd)' }}
                    >
                      No bookings yet.
                    </p>
                  </div>
                </div>
                {/* Text and CTA below image */}
                <div className="px-5 py-5 text-center">
                  <p
                    className="text-xs text-[#7C6B8A] mb-4"
                    style={{ fontFamily: 'var(--font-space-cd)' }}
                  >
                    Browse vendors and send your first booking request.
                  </p>
                  <Link
                    href="/vendors"
                    className="px-5 py-2.5 rounded-full text-xs font-bold text-white hover:opacity-90 transition-opacity"
                    style={{ background: '#4A0E6E', fontFamily: 'var(--font-syne-cd)' }}
                  >
                    Find vendors
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map(booking => {
                  const vendor = booking.vendor_profiles
                  const depositDisplay = booking.deposit_amount
                    ? formatCurrency(booking.deposit_amount)
                    : null

                  return (
                    <div
                      key={booking.id}
                      className="bg-white rounded-2xl p-5"
                      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderRadius: 16 }}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0">
                          <p
                            className="text-base font-bold text-[#1A1A2E] leading-tight"
                            style={{ fontFamily: 'var(--font-syne-cd)' }}
                          >
                            {vendor?.business_name ?? 'Vendor'}
                          </p>
                          {vendor?.category && (
                            <span
                              className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
                              style={{ background: '#F3E8FF', color: '#4A0E6E', fontFamily: 'var(--font-space-cd)' }}
                            >
                              {vendor.category}
                            </span>
                          )}
                        </div>
                        <StatusBadge status={booking.status} />
                      </div>

                      {/* Details */}
                      <div className="flex flex-wrap gap-x-5 gap-y-1 mb-4">
                        {booking.event_type && (
                          <span className="text-xs text-[#7C6B8A]" style={{ fontFamily: 'var(--font-space-cd)' }}>
                            {booking.event_type}
                          </span>
                        )}
                        {booking.event_date && (
                          <span className="text-xs text-[#7C6B8A]" style={{ fontFamily: 'var(--font-space-cd)' }}>
                            {formatDate(booking.event_date)}
                          </span>
                        )}
                        {depositDisplay && (
                          <span
                            className="text-xs font-semibold text-[#4A0E6E]"
                            style={{ fontFamily: 'var(--font-space-cd)' }}
                          >
                            Deposit: {depositDisplay}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      {booking.status === 'confirmed' && vendor && (
                        <Link
                          href={`/vendors/${booking.vendor_id}/book/payment?bookingId=${booking.id}&amount=${booking.deposit_amount ?? 0}&vendorName=${encodeURIComponent(vendor.business_name)}`}
                          className="inline-block px-4 py-2 rounded-xl text-xs font-bold text-white hover:opacity-90 transition-opacity"
                          style={{
                            background: 'linear-gradient(135deg, #4A0E6E 0%, #6B1F9A 100%)',
                            fontFamily: 'var(--font-syne-cd)',
                          }}
                        >
                          Pay deposit
                        </Link>
                      )}
                      {booking.status === 'paid' && (
                        <Link
                          href={`/vendors/${booking.vendor_id}`}
                          className="text-xs font-semibold text-[#4A0E6E] underline underline-offset-2 hover:opacity-70 transition-opacity"
                          style={{ fontFamily: 'var(--font-space-cd)' }}
                        >
                          View vendor
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
        </div>
      </div>

      {/* ── FAB ── */}
      <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 50 }}>
        {fabOpen && (
          <div className="flex flex-col items-end gap-2 mb-3" style={{ animation: 'fabUp 0.15s ease both' }}>
            {([
              { label: 'Plan new event', href: '/onboarding' },
              { label: 'Find vendors',   href: '/vendors' },
              { label: 'Ask Eve',        href: '/ai-plan' },
            ] as { label: string; href: string }[]).map(item => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setFabOpen(false)}
                className="px-4 py-2.5 rounded-full text-xs font-semibold text-white whitespace-nowrap"
                style={{ background: '#4A0E6E', fontFamily: 'var(--font-space-cd)', textDecoration: 'none', boxShadow: '0 4px 16px rgba(74,14,110,0.35)' }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => setFabOpen(o => !o)}
          className="w-14 h-14 rounded-full flex items-center justify-center border-none cursor-pointer text-white shadow-xl"
          style={{
            background: '#4A0E6E',
            boxShadow: '0 4px 20px rgba(74,14,110,0.45)',
            transition: 'transform 0.2s',
            transform: fabOpen ? 'rotate(45deg)' : 'rotate(0deg)',
            fontSize: 28, lineHeight: 1,
          }}
          aria-label="Quick actions"
        >
          +
        </button>
      </div>

      <style>{`
        @keyframes fabUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
