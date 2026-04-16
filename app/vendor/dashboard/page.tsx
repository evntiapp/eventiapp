'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Syne, Space_Grotesk } from 'next/font/google'
import { getSupabaseClient } from '@/lib/supabase'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne-vd',
})
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-vd',
})

// ── Types ─────────────────────────────────────────────────────────────────────

interface VendorProfile {
  id: string
  business_name: string
  category: string
  location: string
  pricing_from: number | null
  pricing_to: number | null
  is_verified: boolean
  application_status: string
}

interface Booking {
  id: string
  client_name: string
  client_email: string
  event_type: string | null
  event_date: string | null
  guest_count: number | null
  event_location: string | null
  budget_for_vendor: number | null
  client_message: string | null
  status: string
  quoted_price: number | null
  created_at: string
}

type BookingFilter = 'all' | 'pending' | 'confirmed' | 'declined'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(from: number | null, to: number | null): string {
  if (!from && !to) return 'Price on request'
  if (from && to) return `$${from.toLocaleString()} – $${to.toLocaleString()}`
  if (from) return `From $${from.toLocaleString()}`
  return `Up to $${to!.toLocaleString()}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function thisMonthRevenue(bookings: Booking[]): number {
  const now = new Date()
  return bookings
    .filter(b => {
      if (b.status !== 'confirmed' || !b.quoted_price) return false
      const d = new Date(b.created_at)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    .reduce((sum, b) => sum + (b.quoted_price ?? 0), 0)
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8F4FC] animate-pulse">
      <div className="h-16 bg-white border-b border-[#EDE5F7]" />
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-5 w-40 bg-[#DDB8F5] rounded" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 bg-white rounded-2xl" />
            ))}
          </div>
          <div className="h-96 bg-white rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className="bg-white rounded-2xl px-5 py-5"
      style={{ boxShadow: '0 2px 10px rgba(74,14,110,0.07)' }}
    >
      <p
        className="text-[11px] font-semibold uppercase tracking-widest text-[#7C6B8A] mb-2"
        style={{ fontFamily: 'var(--font-space-vd)' }}
      >
        {label}
      </p>
      <p
        className="text-2xl font-bold"
        style={{ fontFamily: 'var(--font-syne-vd)', color: accent ? '#4A0E6E' : '#1A1A2E' }}
      >
        {value}
      </p>
    </div>
  )
}

// ── Booking card ──────────────────────────────────────────────────────────────

function BookingCard({
  booking,
  onConfirm,
  onDecline,
  updating,
}: {
  booking: Booking
  onConfirm: (id: string) => void
  onDecline: (id: string) => void
  updating: string | null
}) {
  const isUpdating = updating === booking.id
  const isPending = booking.status === 'pending'
  const isConfirmed = booking.status === 'confirmed'
  const isDeclined = booking.status === 'declined'

  return (
    <div
      className="bg-white rounded-2xl p-5"
      style={{ boxShadow: '0 2px 10px rgba(74,14,110,0.07)' }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p
            className="text-base font-bold text-[#1A1A2E]"
            style={{ fontFamily: 'var(--font-syne-vd)' }}
          >
            {booking.client_name}
          </p>
          <p className="text-xs text-[#7C6B8A] mt-0.5" style={{ fontFamily: 'var(--font-space-vd)' }}>
            Received {formatDate(booking.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {booking.event_type && (
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
              style={{ background: '#F3E8FF', color: '#4A0E6E', fontFamily: 'var(--font-space-vd)' }}
            >
              {booking.event_type}
            </span>
          )}
          {isConfirmed && (
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-bold"
              style={{ background: '#E6F7F2', color: '#0D9B6A', fontFamily: 'var(--font-syne-vd)' }}
            >
              Confirmed
            </span>
          )}
          {isDeclined && (
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-bold"
              style={{ background: '#F3F3F3', color: '#7C6B8A', fontFamily: 'var(--font-syne-vd)' }}
            >
              Declined
            </span>
          )}
        </div>
      </div>

      {/* Details row */}
      <div className="flex flex-wrap gap-x-5 gap-y-1 mb-3">
        {booking.event_date && (
          <span className="text-xs text-[#7C6B8A]" style={{ fontFamily: 'var(--font-space-vd)' }}>
            {formatEventDate(booking.event_date)}
          </span>
        )}
        {booking.guest_count != null && (
          <span className="text-xs text-[#7C6B8A]" style={{ fontFamily: 'var(--font-space-vd)' }}>
            {booking.guest_count} guests
          </span>
        )}
        {booking.event_location && (
          <span className="text-xs text-[#7C6B8A]" style={{ fontFamily: 'var(--font-space-vd)' }}>
            {booking.event_location}
          </span>
        )}
        {booking.budget_for_vendor != null && (
          <span
            className="text-xs font-semibold text-[#4A0E6E]"
            style={{ fontFamily: 'var(--font-space-vd)' }}
          >
            Budget: ${booking.budget_for_vendor.toLocaleString()}
          </span>
        )}
      </div>

      {/* Message preview */}
      {booking.client_message && (
        <p
          className="text-sm text-[#1A1A2E]/70 leading-relaxed mb-4"
          style={{
            fontFamily: 'var(--font-space-vd)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {booking.client_message}
        </p>
      )}

      {/* Actions */}
      {isPending && (
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => onConfirm(booking.id)}
            disabled={isUpdating}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 hover:opacity-90"
            style={{ background: '#0D9B6A', fontFamily: 'var(--font-syne-vd)' }}
          >
            {isUpdating ? 'Updating...' : 'Confirm'}
          </button>
          <button
            type="button"
            onClick={() => onDecline(booking.id)}
            disabled={isUpdating}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-red-300 text-red-500 bg-transparent transition-all disabled:opacity-50 hover:bg-red-50"
            style={{ fontFamily: 'var(--font-space-vd)' }}
          >
            {isUpdating ? 'Updating...' : 'Decline'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function VendorDashboardPage() {
  const router = useRouter()

  const [authLoading, setAuthLoading] = useState(true)
  const [vendor, setVendor] = useState<VendorProfile | null>(null)
  const [vendorMissing, setVendorMissing] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [filter, setFilter] = useState<BookingFilter>('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)

  // ── Auth + data fetch ──
  const loadData = useCallback(async () => {
    const supabase = getSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.replace('/auth/signin')
      return
    }
    setAuthLoading(false)

    // Vendor profile
    const { data: vendorData } = await supabase
      .from('vendor_profiles')
      .select('id, business_name, category, location, pricing_from, pricing_to, is_verified, application_status')
      .eq('user_id', user.id)
      .single()

    if (!vendorData) {
      setVendorMissing(true)
      setDataLoading(false)
      return
    }

    setVendor(vendorData as VendorProfile)

    // Bookings
    const { data: bookingData } = await supabase
      .from('bookings')
      .select('*')
      .eq('vendor_id', vendorData.id)
      .order('created_at', { ascending: false })

    setBookings((bookingData ?? []) as Booking[])
    setDataLoading(false)
  }, [router])

  useEffect(() => {
    loadData()
  }, [loadData])

  // ── Status updates ──
  async function updateStatus(bookingId: string, status: 'confirmed' | 'declined') {
    setUpdating(bookingId)
    const supabase = getSupabaseClient()
    await supabase.from('bookings').update({ status }).eq('id', bookingId)
    await loadData()
    setUpdating(null)
  }

  // ── Sign out ──
  async function handleSignOut() {
    setSigningOut(true)
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  // ── Loading states ──
  if (authLoading || dataLoading) return <DashboardSkeleton />

  // ── Under review ──
  if (vendorMissing) {
    return (
      <div
        className={`${syne.variable} ${spaceGrotesk.variable} min-h-screen bg-[#F8F4FC] flex flex-col`}
        style={{ fontFamily: 'var(--font-space-vd), system-ui, sans-serif' }}
      >
        <nav className="sticky top-0 z-30 bg-[#F8F4FC] border-b border-[#EDE5F7] px-6 h-16 flex items-center">
          <Link
            href="/"
            className="text-xl font-extrabold tracking-tight text-[#4A0E6E]"
            style={{ fontFamily: 'var(--font-syne-vd)' }}
          >
            evnti.
          </Link>
        </nav>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: '#F3E8FF' }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <circle cx="14" cy="14" r="10" stroke="#4A0E6E" strokeWidth="1.5" />
              <path d="M14 9v5.5" stroke="#4A0E6E" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="14" cy="18" r="1" fill="#4A0E6E" />
            </svg>
          </div>
          <h2
            className="text-2xl font-bold text-[#1A1A2E] mb-3"
            style={{ fontFamily: 'var(--font-syne-vd)' }}
          >
            Your application is under review.
          </h2>
          <p
            className="text-sm text-[#7C6B8A] leading-relaxed mb-8 max-w-sm"
            style={{ fontFamily: 'var(--font-space-vd)' }}
          >
            Nabilah and the team will approve your profile within 3–5 business days.
          </p>
          <Link
            href="/"
            className="text-sm font-semibold text-[#4A0E6E] underline underline-offset-4 hover:opacity-80 transition-opacity"
            style={{ fontFamily: 'var(--font-space-vd)' }}
          >
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  if (!vendor) return null

  // ── Derived stats ──
  const totalBookings = bookings.length
  const pendingCount  = bookings.filter(b => b.status === 'pending').length
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length
  const monthRevenue  = thisMonthRevenue(bookings)

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter)

  const FILTER_TABS: { key: BookingFilter; label: string }[] = [
    { key: 'all',       label: 'All' },
    { key: 'pending',   label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'declined',  label: 'Declined' },
  ]

  return (
    <div
      className={`${syne.variable} ${spaceGrotesk.variable} min-h-screen bg-[#F8F4FC]`}
      style={{ fontFamily: 'var(--font-space-vd), system-ui, sans-serif' }}
    >
      {/* ── NAV ── */}
      <nav
        className="sticky top-0 z-30 bg-white border-b border-[#EDE5F7]"
        style={{ boxShadow: '0 1px 0 #EDE5F7' }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-xl font-extrabold tracking-tight text-[#4A0E6E] hover:opacity-80 transition-opacity flex-shrink-0"
            style={{ fontFamily: 'var(--font-syne-vd)' }}
          >
            evnti.
          </Link>

          <span
            className="text-sm font-semibold text-[#1A1A2E] hidden sm:block"
            style={{ fontFamily: 'var(--font-syne-vd)' }}
          >
            Vendor Dashboard
          </span>

          <div className="flex items-center gap-3 flex-shrink-0">
            <span
              className="text-sm text-[#7C6B8A] hidden md:block"
              style={{ fontFamily: 'var(--font-space-vd)' }}
            >
              {vendor.business_name}
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="px-4 py-2 rounded-full text-xs font-semibold border border-[#DDB8F5] text-[#7C6B8A] bg-transparent hover:border-[#4A0E6E] hover:text-[#4A0E6E] transition-colors disabled:opacity-50"
              style={{ fontFamily: 'var(--font-space-vd)' }}
            >
              {signingOut ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total bookings" value={String(totalBookings)} />
          <StatCard label="Pending" value={String(pendingCount)} />
          <StatCard label="Confirmed" value={String(confirmedCount)} />
          <StatCard
            label="This month's revenue"
            value={`$${monthRevenue.toLocaleString()}`}
            accent
          />
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── LEFT: Booking requests ── */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h2
                className="text-lg font-bold text-[#1A1A2E]"
                style={{ fontFamily: 'var(--font-syne-vd)' }}
              >
                Booking Requests
              </h2>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 mb-5 bg-white rounded-xl p-1 w-fit"
              style={{ boxShadow: '0 1px 4px rgba(74,14,110,0.08)' }}
            >
              {FILTER_TABS.map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilter(tab.key)}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                  style={{
                    background: filter === tab.key ? '#4A0E6E' : 'transparent',
                    color: filter === tab.key ? 'white' : '#7C6B8A',
                    fontFamily: 'var(--font-space-vd)',
                  }}
                >
                  {tab.label}
                  {tab.key === 'pending' && pendingCount > 0 && (
                    <span
                      className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold"
                      style={{
                        background: filter === tab.key ? 'rgba(255,255,255,0.25)' : '#4A0E6E',
                        color: 'white',
                      }}
                    >
                      {pendingCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Booking list */}
            {filteredBookings.length === 0 ? (
              <div
                className="flex flex-col items-center text-center py-16 bg-white rounded-2xl"
                style={{ boxShadow: '0 2px 10px rgba(74,14,110,0.07)' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: '#F3E8FF' }}
                >
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                    <rect x="3" y="5" width="16" height="13" rx="2" stroke="#4A0E6E" strokeWidth="1.3" />
                    <path d="M3 9h16" stroke="#4A0E6E" strokeWidth="1.3" />
                    <path d="M7 3v4M15 3v4" stroke="#4A0E6E" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </div>
                <p
                  className="text-sm font-semibold text-[#1A1A2E] mb-1"
                  style={{ fontFamily: 'var(--font-syne-vd)' }}
                >
                  No booking requests yet.
                </p>
                <p
                  className="text-xs text-[#7C6B8A]"
                  style={{ fontFamily: 'var(--font-space-vd)' }}
                >
                  Share your profile link to start getting bookings.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map(booking => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onConfirm={id => updateStatus(id, 'confirmed')}
                    onDecline={id => updateStatus(id, 'declined')}
                    updating={updating}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Profile card ── */}
          <div className="lg:sticky lg:top-24">
            <div
              className="bg-white rounded-2xl p-6"
              style={{ boxShadow: '0 4px 24px rgba(74,14,110,0.1)' }}
            >
              {/* Photo placeholder */}
              <div
                className="w-full h-32 rounded-xl mb-4 flex items-center justify-center"
                style={{ background: '#EDE5F7' }}
              >
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
                  <circle cx="18" cy="14" r="6" stroke="#C0ACD4" strokeWidth="1.5" />
                  <path d="M6 30c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="#C0ACD4" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>

              {/* Vendor info */}
              <h3
                className="text-base font-bold text-[#1A1A2E] mb-1"
                style={{ fontFamily: 'var(--font-syne-vd)' }}
              >
                {vendor.business_name}
              </h3>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span
                  className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
                  style={{ background: '#F3E8FF', color: '#4A0E6E', fontFamily: 'var(--font-space-vd)' }}
                >
                  {vendor.category}
                </span>
                {vendor.is_verified ? (
                  <span
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
                    style={{ background: '#E6F7F2', color: '#0D9B6A', fontFamily: 'var(--font-syne-vd)' }}
                  >
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
                      <path d="M1 4l2 2 4-4" stroke="#0D9B6A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Verified
                  </span>
                ) : (
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                    style={{ background: '#FEF3E2', color: '#E67E22', fontFamily: 'var(--font-syne-vd)' }}
                  >
                    Pending verification
                  </span>
                )}
              </div>

              {vendor.location && (
                <p className="text-xs text-[#7C6B8A] mb-3" style={{ fontFamily: 'var(--font-space-vd)' }}>
                  {vendor.location}
                </p>
              )}

              <p
                className="text-sm font-bold text-[#4A0E6E] mb-4"
                style={{ fontFamily: 'var(--font-syne-vd)' }}
              >
                {formatPrice(vendor.pricing_from, vendor.pricing_to)}
              </p>

              <div className="h-px bg-[#EDE5F7] mb-4" />

              {/* Profile views */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-[#7C6B8A]" style={{ fontFamily: 'var(--font-space-vd)' }}>
                  Profile views
                </span>
                <span
                  className="text-sm font-bold text-[#1A1A2E]"
                  style={{ fontFamily: 'var(--font-syne-vd)' }}
                >
                  0
                </span>
              </div>

              <div className="space-y-2.5">
                <Link
                  href="/vendor/profile/edit"
                  className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold border border-[#DDB8F5] text-[#4A0E6E] hover:bg-[#F3E8FF] transition-colors"
                  style={{ fontFamily: 'var(--font-space-vd)' }}
                >
                  Edit profile
                </Link>
                <Link
                  href={`/vendors/${vendor.id}`}
                  className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold border border-[#DDB8F5] text-[#4A0E6E] hover:bg-[#F3E8FF] transition-colors"
                  style={{ fontFamily: 'var(--font-space-vd)' }}
                >
                  View public profile
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
