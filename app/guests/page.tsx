'use client'
export const dynamic = 'force-dynamic'

// -- Run in Supabase SQL editor before using this page --
// CREATE TABLE public.guests (
//   id uuid default gen_random_uuid() primary key,
//   event_id uuid references public.events(id) on delete cascade,
//   client_id uuid references auth.users(id),
//   first_name text not null,
//   last_name text,
//   email text,
//   phone text,
//   rsvp_status text default 'invited',
//   dietary_requirements text,
//   plus_ones integer default 0,
//   notes text,
//   created_at timestamp with time zone default now()
// );

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Syne, Space_Grotesk } from 'next/font/google'
import { getSupabaseClient } from '@/lib/supabase'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne-gl',
})
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-gl',
})

// ── Types ──────────────────────────────────────────────────────────────────────

interface EventData {
  id: string
  event_type: string | null
  event_date: string | null
  location: string | null
  guest_count: number | null
}

interface Guest {
  id: string
  event_id: string
  client_id: string
  first_name: string
  last_name: string | null
  email: string | null
  phone: string | null
  rsvp_status: string
  dietary_requirements: string | null
  plus_ones: number
  notes: string | null
  created_at: string
}

type RsvpStatus = 'invited' | 'confirmed' | 'declined' | 'maybe'
type FilterTab  = 'all' | 'confirmed' | 'pending' | 'declined'

// ── Constants ──────────────────────────────────────────────────────────────────

const RSVP_OPTIONS: { value: RsvpStatus; label: string }[] = [
  { value: 'invited',   label: 'Invited' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'declined',  label: 'Declined' },
  { value: 'maybe',     label: 'Maybe' },
]

const RSVP_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  confirmed: { bg: '#E6F7F2', color: '#0D9B6A', label: 'Confirmed' },
  invited:   { bg: '#FEF3E2', color: '#E67E22', label: 'Invited' },
  declined:  { bg: '#FDEDEC', color: '#C0392B', label: 'Declined' },
  maybe:     { bg: '#F3F4F6', color: '#7C6B8A', label: 'Maybe' },
}

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'pending',   label: 'Pending' },
  { key: 'declined',  label: 'Declined' },
]

const AVATAR_COLORS = [
  'linear-gradient(135deg,#4A0E6E,#6B1F9A)',
  'linear-gradient(135deg,#0D9B6A,#0A8A5C)',
  'linear-gradient(135deg,#E67E22,#F39C12)',
  'linear-gradient(135deg,#2980B9,#1A6FA8)',
  'linear-gradient(135deg,#C0392B,#A93226)',
  'linear-gradient(135deg,#8E44AD,#6B1F9A)',
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function getInitials(first: string, last: string | null): string {
  return (first[0] + (last?.[0] ?? '')).toUpperCase()
}

function avatarColor(id: string): string {
  let hash = 0
  for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8F4FC] animate-pulse">
      <div className="bg-[#1A1A2E] px-6 pt-0 pb-20">
        <div className="h-16" />
        <div className="max-w-6xl mx-auto space-y-4 pt-8">
          <div className="h-8 w-40 bg-white/10 rounded" />
          <div className="flex gap-3">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-16 w-28 bg-white/10 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-14 bg-white rounded-2xl" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }} />
            <div className="h-64 bg-white rounded-2xl" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }} />
          </div>
          <div className="h-56 bg-white rounded-2xl" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }} />
        </div>
      </div>
    </div>
  )
}

// ── RSVP badge ─────────────────────────────────────────────────────────────────

function RsvpBadge({ status }: { status: string }) {
  const s = RSVP_STYLES[status] ?? RSVP_STYLES.invited
  return (
    <span
      className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap flex-shrink-0"
      style={{ background: s.bg, color: s.color, fontFamily: 'var(--font-syne-gl)' }}
    >
      {s.label}
    </span>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function GuestsPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const eventId      = searchParams.get('eventId')

  const [loading,    setLoading]    = useState(true)
  const [event,      setEvent]      = useState<EventData | null>(null)
  const [guests,     setGuests]     = useState<Guest[]>([])
  const [userId,     setUserId]     = useState('')

  // form
  const [formOpen,   setFormOpen]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    rsvp_status: 'invited' as RsvpStatus,
    dietary_requirements: '', plus_ones: 0, notes: '',
  })

  // list
  const [filter,     setFilter]     = useState<FilterTab>('all')
  const [search,     setSearch]     = useState('')
  const [editingId,  setEditingId]  = useState<string | null>(null)
  const [deleting,   setDeleting]   = useState<string | null>(null)

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/auth/signin'); return }

    setUserId(user.id)

    let q = supabase
      .from('events')
      .select('id, event_type, event_date, location, guest_count')
      .eq('client_id', user.id)

    if (eventId) {
      q = q.eq('id', eventId)
    } else {
      q = q.order('created_at', { ascending: false }).limit(1)
    }

    const { data: evData } = await q
    const ev = evData?.[0] ?? null
    setEvent(ev)

    if (ev) {
      const { data: guestData } = await supabase
        .from('guests')
        .select('*')
        .eq('event_id', ev.id)
        .order('created_at', { ascending: false })
      setGuests((guestData ?? []) as Guest[])
    }

    setLoading(false)
  }, [router, eventId])

  useEffect(() => { loadData() }, [loadData])

  // ── Add guest ──────────────────────────────────────────────────────────────

  async function handleAddGuest(e: React.FormEvent) {
    e.preventDefault()
    if (!event || !form.first_name.trim()) return
    setSubmitting(true)
    const supabase = getSupabaseClient()
    await supabase.from('guests').insert({
      event_id:             event.id,
      client_id:            userId,
      first_name:           form.first_name.trim(),
      last_name:            form.last_name.trim()            || null,
      email:                form.email.trim()                || null,
      phone:                form.phone.trim()                || null,
      rsvp_status:          form.rsvp_status,
      dietary_requirements: form.dietary_requirements.trim() || null,
      plus_ones:            form.plus_ones,
      notes:                form.notes.trim()                || null,
    })
    setForm({
      first_name: '', last_name: '', email: '', phone: '',
      rsvp_status: 'invited', dietary_requirements: '', plus_ones: 0, notes: '',
    })
    setFormOpen(false)
    setSubmitting(false)
    await loadData()
  }

  // ── Update RSVP ────────────────────────────────────────────────────────────

  async function updateStatus(id: string, status: string) {
    setEditingId(id)
    const supabase = getSupabaseClient()
    await supabase.from('guests').update({ rsvp_status: status }).eq('id', id)
    setGuests(prev => prev.map(g => g.id === id ? { ...g, rsvp_status: status } : g))
    setEditingId(null)
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  async function deleteGuest(id: string) {
    setDeleting(id)
    const supabase = getSupabaseClient()
    await supabase.from('guests').delete().eq('id', id)
    setGuests(prev => prev.filter(g => g.id !== id))
    setDeleting(null)
  }

  if (loading) return <PageSkeleton />

  // ── Derived stats ──────────────────────────────────────────────────────────

  const totalGuests    = guests.length
  const confirmed      = guests.filter(g => g.rsvp_status === 'confirmed')
  const pending        = guests.filter(g => g.rsvp_status === 'invited' || g.rsvp_status === 'maybe')
  const declined       = guests.filter(g => g.rsvp_status === 'declined')
  const confirmedCount = confirmed.length
  const pendingCount   = pending.length
  const headcount      = confirmed.reduce((sum, g) => sum + 1 + g.plus_ones, 0)

  const dietaryCounts: Record<string, number> = {}
  guests.forEach(g => {
    const d = g.dietary_requirements?.trim()
    if (d) dietaryCounts[d] = (dietaryCounts[d] ?? 0) + 1
  })

  const filteredGuests = guests.filter(g => {
    const matchesTab =
      filter === 'all' ||
      (filter === 'confirmed' && g.rsvp_status === 'confirmed') ||
      (filter === 'pending'   && (g.rsvp_status === 'invited' || g.rsvp_status === 'maybe')) ||
      (filter === 'declined'  && g.rsvp_status === 'declined')
    const q = search.toLowerCase()
    const matchesSearch = !q || `${g.first_name} ${g.last_name ?? ''}`.toLowerCase().includes(q)
    return matchesTab && matchesSearch
  })

  const eventLabel = event?.event_type ?? 'Your Event'

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className={`${syne.variable} ${spaceGrotesk.variable} min-h-screen bg-[#F8F4FC]`}
      style={{ fontFamily: 'var(--font-space-gl), system-ui, sans-serif' }}
    >

      {/* ── HERO BANNER ── */}
      <div className="relative">
        <img
          src="/images/feature.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'rgba(26,10,46,0.88)' }} />

        <div className="relative z-10">

          {/* Nav */}
          <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="text-xl font-extrabold tracking-tight text-white hover:opacity-80 transition-opacity flex-shrink-0"
              style={{ fontFamily: 'var(--font-syne-gl)', letterSpacing: '-0.03em' }}
            >
              evnti<span style={{ color: '#DDB8F5' }}>.</span>
            </Link>

            <span
              className="hidden sm:block text-sm font-semibold text-white/60 truncate max-w-[200px] text-center"
              style={{ fontFamily: 'var(--font-syne-gl)' }}
            >
              {eventLabel}
            </span>

            <Link
              href="/dashboard"
              className="text-xs font-semibold px-4 py-2 rounded-full border border-white/20 text-white/70 hover:border-white/50 hover:text-white transition-colors flex-shrink-0"
              style={{ fontFamily: 'var(--font-space-gl)' }}
            >
              My Dashboard
            </Link>
          </nav>

          {/* Heading + stat pills */}
          <div className="max-w-6xl mx-auto px-6 pt-8 pb-20">
            <h1
              className="text-3xl font-bold text-white mb-6 leading-tight"
              style={{ fontFamily: 'var(--font-syne-gl)', letterSpacing: '-0.025em' }}
            >
              Guest List
            </h1>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Total guests', value: totalGuests,    color: 'white' },
                { label: 'Confirmed',    value: confirmedCount, color: '#4ECDC4' },
                { label: 'Pending',      value: pendingCount,   color: '#FFD93D' },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="px-5 py-3 rounded-2xl text-center"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    minWidth: 96,
                  }}
                >
                  <p
                    className="text-2xl font-bold leading-none"
                    style={{ fontFamily: 'var(--font-syne-gl)', color }}
                  >
                    {value}
                  </p>
                  <p
                    className="text-[10px] mt-1 uppercase tracking-widest"
                    style={{ color: 'rgba(255,255,255,0.38)' }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 -mt-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── LEFT col ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* ─ Add Guest Form ─ */}
            <div
              className="bg-white rounded-2xl"
              style={{ boxShadow: '0 4px 24px rgba(74,14,110,0.09)' }}
            >
              <button
                type="button"
                onClick={() => setFormOpen(o => !o)}
                className="w-full flex items-center justify-between px-6 py-4 rounded-2xl hover:bg-[#F8F4FC] transition-colors"
              >
                <span
                  className="text-base font-bold text-[#1A1A2E]"
                  style={{ fontFamily: 'var(--font-syne-gl)' }}
                >
                  Add Guest
                </span>
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xl font-bold leading-none"
                  style={{
                    background: '#4A0E6E',
                    transform: formOpen ? 'rotate(45deg)' : 'none',
                    transition: 'transform 0.2s',
                    fontFamily: 'var(--font-syne-gl)',
                  }}
                >
                  +
                </span>
              </button>

              {formOpen && (
                <form onSubmit={handleAddGuest} className="px-6 pb-6 border-t border-[#EDE5F7]">
                  <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <div>
                      <label
                        className="block text-[11px] font-semibold uppercase tracking-widest text-[#7C6B8A] mb-1.5"
                        style={{ fontFamily: 'var(--font-space-gl)' }}
                      >
                        First name *
                      </label>
                      <input
                        required
                        type="text"
                        value={form.first_name}
                        onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                        placeholder="e.g. Amara"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#DDB8F5] text-sm text-[#1A1A2E] outline-none focus:border-[#4A0E6E] transition-colors bg-white"
                        style={{ fontFamily: 'var(--font-space-gl)' }}
                      />
                    </div>

                    <div>
                      <label
                        className="block text-[11px] font-semibold uppercase tracking-widest text-[#7C6B8A] mb-1.5"
                        style={{ fontFamily: 'var(--font-space-gl)' }}
                      >
                        Last name
                      </label>
                      <input
                        type="text"
                        value={form.last_name}
                        onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                        placeholder="e.g. Johnson"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#DDB8F5] text-sm text-[#1A1A2E] outline-none focus:border-[#4A0E6E] transition-colors bg-white"
                        style={{ fontFamily: 'var(--font-space-gl)' }}
                      />
                    </div>

                    <div>
                      <label
                        className="block text-[11px] font-semibold uppercase tracking-widest text-[#7C6B8A] mb-1.5"
                        style={{ fontFamily: 'var(--font-space-gl)' }}
                      >
                        Email (optional)
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="email@example.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#DDB8F5] text-sm text-[#1A1A2E] outline-none focus:border-[#4A0E6E] transition-colors bg-white"
                        style={{ fontFamily: 'var(--font-space-gl)' }}
                      />
                    </div>

                    <div>
                      <label
                        className="block text-[11px] font-semibold uppercase tracking-widest text-[#7C6B8A] mb-1.5"
                        style={{ fontFamily: 'var(--font-space-gl)' }}
                      >
                        Phone (optional)
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="+1 555 000 0000"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#DDB8F5] text-sm text-[#1A1A2E] outline-none focus:border-[#4A0E6E] transition-colors bg-white"
                        style={{ fontFamily: 'var(--font-space-gl)' }}
                      />
                    </div>

                    <div>
                      <label
                        className="block text-[11px] font-semibold uppercase tracking-widest text-[#7C6B8A] mb-1.5"
                        style={{ fontFamily: 'var(--font-space-gl)' }}
                      >
                        RSVP status
                      </label>
                      <select
                        value={form.rsvp_status}
                        onChange={e => setForm(f => ({ ...f, rsvp_status: e.target.value as RsvpStatus }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#DDB8F5] text-sm text-[#1A1A2E] outline-none focus:border-[#4A0E6E] transition-colors bg-white"
                        style={{ fontFamily: 'var(--font-space-gl)' }}
                      >
                        {RSVP_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        className="block text-[11px] font-semibold uppercase tracking-widest text-[#7C6B8A] mb-1.5"
                        style={{ fontFamily: 'var(--font-space-gl)' }}
                      >
                        Plus ones
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={form.plus_ones}
                        onChange={e => setForm(f => ({ ...f, plus_ones: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#DDB8F5] text-sm text-[#1A1A2E] outline-none focus:border-[#4A0E6E] transition-colors bg-white"
                        style={{ fontFamily: 'var(--font-space-gl)' }}
                      />
                    </div>

                    <div>
                      <label
                        className="block text-[11px] font-semibold uppercase tracking-widest text-[#7C6B8A] mb-1.5"
                        style={{ fontFamily: 'var(--font-space-gl)' }}
                      >
                        Dietary requirements (optional)
                      </label>
                      <input
                        type="text"
                        value={form.dietary_requirements}
                        onChange={e => setForm(f => ({ ...f, dietary_requirements: e.target.value }))}
                        placeholder="e.g. Vegan, Halal, Gluten free"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#DDB8F5] text-sm text-[#1A1A2E] outline-none focus:border-[#4A0E6E] transition-colors bg-white"
                        style={{ fontFamily: 'var(--font-space-gl)' }}
                      />
                    </div>

                    <div>
                      <label
                        className="block text-[11px] font-semibold uppercase tracking-widest text-[#7C6B8A] mb-1.5"
                        style={{ fontFamily: 'var(--font-space-gl)' }}
                      >
                        Notes (optional)
                      </label>
                      <input
                        type="text"
                        value={form.notes}
                        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                        placeholder="Any notes about this guest"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#DDB8F5] text-sm text-[#1A1A2E] outline-none focus:border-[#4A0E6E] transition-colors bg-white"
                        style={{ fontFamily: 'var(--font-space-gl)' }}
                      />
                    </div>

                  </div>

                  <div className="flex gap-3 mt-5">
                    <button
                      type="submit"
                      disabled={submitting || !form.first_name.trim()}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-50 hover:opacity-90"
                      style={{ background: '#4A0E6E', fontFamily: 'var(--font-syne-gl)' }}
                    >
                      {submitting ? 'Adding...' : 'Add guest'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormOpen(false)}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-[#DDB8F5] text-[#7C6B8A] hover:bg-[#F3E8FF] transition-colors"
                      style={{ fontFamily: 'var(--font-space-gl)' }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* ─ Guest List ─ */}
            <div
              className="bg-white rounded-2xl"
              style={{ boxShadow: '0 4px 24px rgba(74,14,110,0.09)' }}
            >
              <div className="px-6 pt-5 pb-4 border-b border-[#EDE5F7]">
                <h2
                  className="text-lg font-bold text-[#1A1A2E] mb-4"
                  style={{ fontFamily: 'var(--font-syne-gl)' }}
                >
                  Guest List
                </h2>

                {/* Filter tabs */}
                <div
                  className="flex gap-1 bg-[#F8F4FC] rounded-xl p-1 w-fit mb-4"
                  style={{ boxShadow: '0 1px 4px rgba(74,14,110,0.07)' }}
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
                        fontFamily: 'var(--font-space-gl)',
                      }}
                    >
                      {tab.label}
                      {tab.key === 'pending' && pendingCount > 0 && (
                        <span
                          className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold"
                          style={{
                            background: filter === 'pending' ? 'rgba(255,255,255,0.25)' : '#4A0E6E',
                            color: 'white',
                          }}
                        >
                          {pendingCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-[#DDB8F5] focus-within:border-[#4A0E6E] transition-colors bg-white">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <circle cx="6" cy="6" r="4.5" stroke="#7C6B8A" strokeWidth="1.4" />
                    <path d="M9.5 9.5l2.5 2.5" stroke="#7C6B8A" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search guests..."
                    className="flex-1 bg-transparent text-sm text-[#1A1A2E] outline-none"
                    style={{ fontFamily: 'var(--font-space-gl)' }}
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="text-xs text-[#7C6B8A] hover:text-[#4A0E6E] transition-colors"
                      style={{ fontFamily: 'var(--font-space-gl)' }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Empty state */}
              {filteredGuests.length === 0 ? (
                <div className="px-6 py-16 flex flex-col items-center text-center">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: '#F3E8FF' }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#4A0E6E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="9" cy="7" r="4" stroke="#4A0E6E" strokeWidth="1.5" />
                      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#4A0E6E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p
                    className="text-base font-bold text-[#1A1A2E] mb-2"
                    style={{ fontFamily: 'var(--font-syne-gl)' }}
                  >
                    {guests.length === 0 ? 'No guests added yet.' : 'No guests match your filter.'}
                  </p>
                  <p
                    className="text-sm text-[#7C6B8A] mb-5"
                    style={{ fontFamily: 'var(--font-space-gl)' }}
                  >
                    {guests.length === 0
                      ? 'Start building your guest list.'
                      : 'Try a different filter or search term.'}
                  </p>
                  {guests.length === 0 && (
                    <button
                      type="button"
                      onClick={() => setFormOpen(true)}
                      className="px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity"
                      style={{ background: '#4A0E6E', fontFamily: 'var(--font-syne-gl)' }}
                    >
                      Add your first guest
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-[#F3E8FF]">
                  {filteredGuests.map(guest => (
                    <div key={guest.id} className="px-6 py-4 flex items-center gap-3 sm:gap-4">
                      {/* Avatar */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-[13px] font-bold text-white"
                        style={{ background: avatarColor(guest.id), fontFamily: 'var(--font-syne-gl)' }}
                      >
                        {getInitials(guest.first_name, guest.last_name)}
                      </div>

                      {/* Name + meta */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-bold text-[#1A1A2E] truncate"
                          style={{ fontFamily: 'var(--font-syne-gl)' }}
                        >
                          {guest.first_name}{guest.last_name ? ` ${guest.last_name}` : ''}
                        </p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                          {guest.dietary_requirements && (
                            <span
                              className="text-[11px] text-[#7C6B8A]"
                              style={{ fontFamily: 'var(--font-space-gl)' }}
                            >
                              {guest.dietary_requirements}
                            </span>
                          )}
                          {guest.plus_ones > 0 && (
                            <span
                              className="text-[11px] text-[#7C6B8A]"
                              style={{ fontFamily: 'var(--font-space-gl)' }}
                            >
                              +{guest.plus_ones}
                            </span>
                          )}
                          {guest.notes && (
                            <span
                              className="text-[11px] text-[#7C6B8A] truncate max-w-[140px]"
                              style={{ fontFamily: 'var(--font-space-gl)' }}
                            >
                              {guest.notes}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* RSVP badge */}
                      <RsvpBadge status={guest.rsvp_status} />

                      {/* Edit status */}
                      <select
                        value={guest.rsvp_status}
                        disabled={editingId === guest.id}
                        onChange={e => updateStatus(guest.id, e.target.value)}
                        className="hidden sm:block text-[11px] border border-[#DDB8F5] rounded-lg px-2 py-1.5 text-[#4A0E6E] outline-none bg-white disabled:opacity-50 cursor-pointer hover:border-[#4A0E6E] transition-colors"
                        style={{ fontFamily: 'var(--font-space-gl)' }}
                        aria-label="Update RSVP status"
                      >
                        {RSVP_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => deleteGuest(guest.id)}
                        disabled={deleting === guest.id}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#FDEDEC] transition-colors disabled:opacity-40 flex-shrink-0"
                        aria-label="Delete guest"
                      >
                        {deleting === guest.id ? (
                          <span className="text-[10px] text-[#7C6B8A]">...</span>
                        ) : (
                          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                            <path d="M1 1l9 9M10 1l-9 9" stroke="#C0392B" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* ── RIGHT col ── */}
          <div className="space-y-5 lg:sticky lg:top-6">

            {/* Summary stats */}
            <div
              className="bg-white rounded-2xl p-6"
              style={{ boxShadow: '0 4px 24px rgba(74,14,110,0.09)' }}
            >
              <h3
                className="text-sm font-bold text-[#1A1A2E] mb-4"
                style={{ fontFamily: 'var(--font-syne-gl)' }}
              >
                Summary
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Total invited',       value: totalGuests,     color: '#1A1A2E' },
                  { label: 'Confirmed attending', value: confirmedCount,  color: '#0D9B6A' },
                  { label: 'Total headcount',     value: headcount,       color: '#0D9B6A' },
                  { label: 'Declined',            value: declined.length, color: '#C0392B' },
                  { label: 'Awaiting response',   value: pendingCount,    color: '#E67E22' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span
                      className="text-xs text-[#7C6B8A]"
                      style={{ fontFamily: 'var(--font-space-gl)' }}
                    >
                      {label}
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{ fontFamily: 'var(--font-syne-gl)', color }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {totalGuests > 0 && (
                <div className="mt-5">
                  <div className="h-2 rounded-full overflow-hidden flex" style={{ background: '#F3E8FF' }}>
                    <div
                      style={{
                        width: `${(confirmedCount / totalGuests) * 100}%`,
                        background: '#0D9B6A',
                        transition: 'width 0.4s ease',
                      }}
                    />
                    <div
                      style={{
                        width: `${(pendingCount / totalGuests) * 100}%`,
                        background: '#FFD93D',
                        transition: 'width 0.4s ease',
                      }}
                    />
                    <div
                      style={{
                        width: `${(declined.length / totalGuests) * 100}%`,
                        background: '#C0392B',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                  <div className="flex gap-4 mt-2">
                    {[
                      { color: '#0D9B6A', label: 'Yes' },
                      { color: '#FFD93D', label: 'Pending' },
                      { color: '#C0392B', label: 'No' },
                    ].map(({ color, label }) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: color }} />
                        <span
                          className="text-[10px] text-[#7C6B8A]"
                          style={{ fontFamily: 'var(--font-space-gl)' }}
                        >
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dietary summary — only shown when data exists */}
            {Object.keys(dietaryCounts).length > 0 && (
              <div
                className="bg-white rounded-2xl p-6"
                style={{ boxShadow: '0 4px 24px rgba(74,14,110,0.09)' }}
              >
                <h3
                  className="text-sm font-bold text-[#1A1A2E] mb-4"
                  style={{ fontFamily: 'var(--font-syne-gl)' }}
                >
                  Dietary Requirements
                </h3>
                <div className="space-y-2.5">
                  {Object.entries(dietaryCounts).map(([diet, count]) => (
                    <div key={diet} className="flex items-center justify-between gap-3">
                      <span
                        className="text-xs text-[#7C6B8A] capitalize truncate"
                        style={{ fontFamily: 'var(--font-space-gl)' }}
                      >
                        {diet}
                      </span>
                      <span
                        className="text-xs font-bold px-2.5 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          background: '#F3E8FF',
                          color: '#4A0E6E',
                          fontFamily: 'var(--font-syne-gl)',
                        }}
                      >
                        {count} {count === 1 ? 'guest' : 'guests'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty-state CTA in sidebar */}
            {totalGuests === 0 && (
              <button
                type="button"
                onClick={() => setFormOpen(true)}
                className="w-full py-3 rounded-2xl text-sm font-bold text-[#4A0E6E] border-2 border-dashed border-[#DDB8F5] hover:border-[#4A0E6E] hover:bg-[#F3E8FF] transition-colors"
                style={{ fontFamily: 'var(--font-syne-gl)' }}
              >
                + Add your first guest
              </button>
            )}

          </div>

        </div>
      </div>

    </div>
  )
}
