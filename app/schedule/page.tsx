'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Syne, Space_Grotesk } from 'next/font/google'
import { getSupabaseClient } from '@/lib/supabase'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne-sc',
})
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-sc',
})

// ── Types ─────────────────────────────────────────────────────────────────────

interface EventData {
  id: string
  event_type: string | null
  event_date: string | null
  location: string | null
  guest_count: number | null
}

interface BookingVendor {
  id: string
  business_name: string
  category: string
  phone: string | null
}

interface ScheduleSlot {
  id: string
  time: string
  activity: string
  vendorId: string
}

interface TodoTask {
  id: string
  text: string
  group: 'week_before' | 'day_before' | 'day_of'
}

// ── Constants ─────────────────────────────────────────────────────────────────

const BASE_SLOTS: Omit<ScheduleSlot, 'id'>[] = [
  { time: '08:00 AM', activity: 'Vendor setup begins',       vendorId: '' },
  { time: '10:00 AM', activity: 'Final venue walkthrough',   vendorId: '' },
  { time: '12:00 PM', activity: 'Client / host arrives',     vendorId: '' },
  { time: '02:00 PM', activity: 'Event begins',              vendorId: '' },
  { time: '06:00 PM', activity: 'Event ends',                vendorId: '' },
  { time: '07:00 PM', activity: 'Vendor pack down',          vendorId: '' },
]

const WEDDING_EXTRA_SLOTS: Omit<ScheduleSlot, 'id'>[] = [
  { time: '09:00 AM', activity: 'Hair & makeup begins',                     vendorId: '' },
  { time: '11:00 AM', activity: 'Photography — getting ready shots',        vendorId: '' },
  { time: '01:00 PM', activity: 'Ceremony begins',                          vendorId: '' },
  { time: '03:00 PM', activity: 'Cocktail hour',                            vendorId: '' },
  { time: '04:00 PM', activity: 'Reception begins',                         vendorId: '' },
  { time: '09:00 PM', activity: 'Last dance',                               vendorId: '' },
]

const TODO_TASKS: TodoTask[] = [
  { id: 'wb1', text: 'Confirm all vendor arrival times',    group: 'week_before' },
  { id: 'wb2', text: 'Share schedule with all vendors',     group: 'week_before' },
  { id: 'wb3', text: 'Prepare vendor payment envelopes',    group: 'week_before' },
  { id: 'wb4', text: 'Create seating plan',                 group: 'week_before' },
  { id: 'wb5', text: 'Prepare emergency kit',               group: 'week_before' },
  { id: 'db1', text: 'Charge all devices',                  group: 'day_before' },
  { id: 'db2', text: 'Confirm headcount with caterer',      group: 'day_before' },
  { id: 'db3', text: 'Lay out outfit and accessories',      group: 'day_before' },
  { id: 'db4', text: 'Brief MC / host on running order',    group: 'day_before' },
  { id: 'do1', text: 'Eat breakfast before getting ready',  group: 'day_of' },
  { id: 'do2', text: 'Have vendor contact list ready',      group: 'day_of' },
  { id: 'do3', text: 'Designate a point person for vendors',group: 'day_of' },
  { id: 'do4', text: 'Take a moment to enjoy it',           group: 'day_of' },
]

const EMERGENCY_ITEMS = [
  'Safety pin kit',
  'Stain remover pen',
  'Pain relievers',
  'Phone charger',
  'Cash for tips',
  'Snacks',
]

const TODO_GROUP_META: Record<TodoTask['group'], { label: string; color: string; badge: string; badgeText: string }> = {
  week_before: { label: 'Week before',  color: '#0D9B6A', badge: '#E6F7F2', badgeText: '#0D9B6A' },
  day_before:  { label: 'Day before',   color: '#E67E22', badge: '#FEF3E2', badgeText: '#E67E22' },
  day_of:      { label: 'Day of',       color: '#4A0E6E', badge: '#F3E8FF', badgeText: '#4A0E6E' },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseTimeMinutes(t: string): number {
  const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!m) return 0
  let h = parseInt(m[1])
  const min = parseInt(m[2])
  const period = m[3].toUpperCase()
  if (period === 'PM' && h !== 12) h += 12
  if (period === 'AM' && h === 12) h = 0
  return h * 60 + min
}

function getDefaultSlots(eventType: string | null): ScheduleSlot[] {
  const extras = eventType === 'Wedding' ? WEDDING_EXTRA_SLOTS : []
  const combined = [...BASE_SLOTS, ...extras]
  const seen = new Set<string>()
  const unique = combined.filter(s => {
    if (seen.has(s.time)) return false
    seen.add(s.time)
    return true
  })
  unique.sort((a, b) => parseTimeMinutes(a.time) - parseTimeMinutes(b.time))
  return unique.map((s, i) => ({ ...s, id: `default_${i}` }))
}

function daysUntil(dateStr: string): number {
  const event = new Date(dateStr)
  const today = new Date()
  event.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  return Math.round((event.getTime() - today.getTime()) / 86400000)
}

function formatEventDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ScheduleSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8F4FC] animate-pulse">
      <div className="h-16 bg-white border-b border-[#EDE5F7]" />
      <div className="h-[260px] bg-[#1A1A2E]" />
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-2xl" />
          ))}
        </div>
        <div className="space-y-4">
          <div className="h-64 bg-white rounded-2xl" />
          <div className="h-48 bg-white rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

// ── Drag handle icon ──────────────────────────────────────────────────────────

function DragHandle() {
  return (
    <svg width="10" height="14" viewBox="0 0 10 14" fill="none" aria-hidden="true" className="flex-shrink-0 cursor-grab">
      <circle cx="3" cy="2.5"  r="1.2" fill="#C0ACD4" />
      <circle cx="7" cy="2.5"  r="1.2" fill="#C0ACD4" />
      <circle cx="3" cy="7"    r="1.2" fill="#C0ACD4" />
      <circle cx="7" cy="7"    r="1.2" fill="#C0ACD4" />
      <circle cx="3" cy="11.5" r="1.2" fill="#C0ACD4" />
      <circle cx="7" cy="11.5" r="1.2" fill="#C0ACD4" />
    </svg>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SchedulePage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const eventId      = searchParams.get('eventId')

  const [loading,      setLoading]      = useState(true)
  const [event,        setEvent]        = useState<EventData | null>(null)
  const [vendors,      setVendors]      = useState<BookingVendor[]>([])
  const [slots,        setSlots]        = useState<ScheduleSlot[]>([])
  const [doneTaskIds,  setDoneTaskIds]  = useState<Set<string>>(new Set())

  // ── Fetch ──
  const loadData = useCallback(async () => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/auth/signin'); return }

    // Event
    let q = supabase.from('events').select('id, event_type, event_date, location, guest_count').eq('client_id', user.id)
    if (eventId) {
      q = q.eq('id', eventId)
    } else {
      q = q.order('created_at', { ascending: false }).limit(1)
    }
    const { data: evData } = await q
    const ev = evData?.[0] ?? null
    setEvent(ev)

    // Confirmed bookings with vendor details
    if (user.email) {
      const { data: bookingRows } = await supabase
        .from('bookings')
        .select('id, vendor_profiles(id, business_name, category, phone)')
        .eq('client_email', user.email)
        .eq('status', 'confirmed')

      const vl: BookingVendor[] = (bookingRows ?? [])
        .map((b: { id: string; vendor_profiles: unknown }) => {
          const vp = b.vendor_profiles as { id: string; business_name: string; category: string; phone: string | null } | null
          return vp ? { id: vp.id, business_name: vp.business_name, category: vp.category, phone: vp.phone } : null
        })
        .filter(Boolean) as BookingVendor[]
      setVendors(vl)
    }

    // Load from localStorage
    if (ev) {
      const savedSlots = localStorage.getItem(`schedule_slots_${ev.id}`)
      if (savedSlots) {
        try { setSlots(JSON.parse(savedSlots)) } catch { setSlots(getDefaultSlots(ev.event_type)) }
      } else {
        setSlots(getDefaultSlots(ev.event_type))
      }
      const savedTodos = localStorage.getItem(`schedule_todos_${ev.id}`)
      if (savedTodos) {
        try { setDoneTaskIds(new Set(JSON.parse(savedTodos))) } catch { /* ignore */ }
      }
    }

    setLoading(false)
  }, [router, eventId])

  useEffect(() => { loadData() }, [loadData])

  // ── Persist ──
  useEffect(() => {
    if (!event) return
    localStorage.setItem(`schedule_slots_${event.id}`, JSON.stringify(slots))
  }, [slots, event])

  useEffect(() => {
    if (!event) return
    localStorage.setItem(`schedule_todos_${event.id}`, JSON.stringify([...doneTaskIds]))
  }, [doneTaskIds, event])

  // ── Handlers ──
  function addSlot() {
    const newSlot: ScheduleSlot = {
      id: `slot_${Date.now()}`,
      time: '',
      activity: '',
      vendorId: '',
    }
    setSlots(prev => [...prev, newSlot])
  }

  function deleteSlot(id: string) {
    setSlots(prev => prev.filter(s => s.id !== id))
  }

  function updateSlot(id: string, field: keyof ScheduleSlot, value: string) {
    setSlots(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  function toggleTask(id: string) {
    setDoneTaskIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  if (loading) return <ScheduleSkeleton />

  // ── Derived ──
  const days      = event?.event_date ? daysUntil(event.event_date) : null
  const dateLabel = event?.event_date ? formatEventDate(event.event_date) : null
  const eventName = event?.event_type
    ? `${event.event_type}${event.location ? ` · ${event.location}` : ''}`
    : 'Your Event'

  const countdownLabel =
    days === null   ? null
    : days > 1      ? `${days} days to go`
    : days === 1    ? 'Tomorrow'
    : days === 0    ? 'Today'
    : `${Math.abs(days)} days ago`

  const countdownColor =
    days === null   ? '#DDB8F5'
    : days <= 0     ? '#0D9B6A'
    : days <= 7     ? '#E67E22'
    : '#DDB8F5'

  const todoGroups = (['week_before', 'day_before', 'day_of'] as TodoTask['group'][]).map(g => ({
    group: g,
    meta: TODO_GROUP_META[g],
    tasks: TODO_TASKS.filter(t => t.group === g),
  }))

  const doneCount  = TODO_TASKS.filter(t => doneTaskIds.has(t.id)).length

  return (
    <div
      className={`${syne.variable} ${spaceGrotesk.variable} min-h-screen bg-[#F8F4FC]`}
      style={{ fontFamily: 'var(--font-space-sc), system-ui, sans-serif' }}
    >
      {/* ── NAV ── */}
      <nav
        className="sticky top-0 z-30 bg-[#F8F4FC]/95 border-b border-[#EDE5F7]"
        style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-xl font-extrabold tracking-tight text-[#4A0E6E] hover:opacity-80 transition-opacity flex-shrink-0"
            style={{ fontFamily: 'var(--font-syne-sc)' }}
          >
            evnti.
          </Link>

          {/* Center: event name */}
          <span
            className="text-sm font-semibold text-[#1A1A2E] truncate hidden sm:block"
            style={{ fontFamily: 'var(--font-syne-sc)' }}
          >
            {eventName}
          </span>

          <Link
            href="/dashboard"
            className="text-sm font-semibold text-[#4A0E6E] hover:opacity-80 transition-opacity flex-shrink-0"
            style={{ fontFamily: 'var(--font-space-sc)' }}
          >
            My Dashboard
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="relative h-[260px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/feature.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(74,14,110,0.95) 0%, rgba(74,14,110,0.65) 60%, rgba(26,26,46,0.4) 100%)' }}
        />

        <div className="relative z-10 h-full flex flex-col justify-end max-w-6xl mx-auto px-6 pb-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: '#DDB8F5', fontFamily: 'var(--font-space-sc)', letterSpacing: '0.12em' }}
              >
                Day-of Schedule
              </p>
              <h1
                className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-2"
                style={{ fontFamily: 'var(--font-syne-sc)' }}
              >
                {event?.event_type ?? 'Your Event'}
              </h1>
              {(dateLabel || event?.location) && (
                <div className="flex flex-wrap items-center gap-3 text-sm text-white/60" style={{ fontFamily: 'var(--font-space-sc)' }}>
                  {dateLabel && <span>{dateLabel}</span>}
                  {dateLabel && event?.location && <span>·</span>}
                  {event?.location && <span>{event.location}</span>}
                </div>
              )}
            </div>

            {/* Countdown chip */}
            {countdownLabel && (
              <div
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: `1.5px solid ${countdownColor}`,
                  color: countdownColor,
                  fontFamily: 'var(--font-syne-sc)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {countdownLabel}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── EMPTY STATE ── */}
      {!event && (
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <p className="text-lg font-bold text-[#1A1A2E] mb-2" style={{ fontFamily: 'var(--font-syne-sc)' }}>
            No event found.
          </p>
          <p className="text-sm text-[#7C6B8A] mb-8" style={{ fontFamily: 'var(--font-space-sc)' }}>
            Create an event first to build your day-of schedule.
          </p>
          <Link
            href="/onboarding"
            className="px-6 py-3 rounded-full text-sm font-bold text-white"
            style={{ background: '#4A0E6E', fontFamily: 'var(--font-syne-sc)' }}
          >
            Plan an event
          </Link>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      {event && (
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* ── LEFT COLUMN ── */}
            <div className="lg:col-span-2 space-y-10">

              {/* ── SCHEDULE BUILDER ── */}
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2
                      className="text-lg font-bold text-[#1A1A2E]"
                      style={{ fontFamily: 'var(--font-syne-sc)' }}
                    >
                      Schedule Builder
                    </h2>
                    <p className="text-xs text-[#7C6B8A] mt-0.5" style={{ fontFamily: 'var(--font-space-sc)' }}>
                      Edit times and activities. Assign vendors to each slot.
                    </p>
                  </div>
                  <span
                    className="text-xs font-semibold text-[#7C6B8A]"
                    style={{ fontFamily: 'var(--font-space-sc)' }}
                  >
                    {slots.length} slot{slots.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-3">
                  {slots.map(slot => {
                    const assignedVendor = vendors.find(v => v.id === slot.vendorId)
                    return (
                      <div
                        key={slot.id}
                        className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3"
                        style={{
                          boxShadow: '0 2px 10px rgba(74,14,110,0.07)',
                          borderLeft: '4px solid #4A0E6E',
                        }}
                      >
                        <DragHandle />

                        {/* Time */}
                        <input
                          type="text"
                          value={slot.time}
                          onChange={e => updateSlot(slot.id, 'time', e.target.value)}
                          placeholder="09:00 AM"
                          className="w-[90px] text-sm font-bold bg-transparent outline-none flex-shrink-0"
                          style={{ color: '#4A0E6E', fontFamily: 'var(--font-syne-sc)' }}
                        />

                        <div
                          className="w-px h-6 flex-shrink-0"
                          style={{ background: '#EDE5F7' }}
                        />

                        {/* Activity */}
                        <input
                          type="text"
                          value={slot.activity}
                          onChange={e => updateSlot(slot.id, 'activity', e.target.value)}
                          placeholder="Activity description…"
                          className="flex-1 text-sm bg-transparent outline-none min-w-0"
                          style={{ color: '#1A1A2E', fontFamily: 'var(--font-space-sc)' }}
                        />

                        {/* Vendor assign */}
                        {vendors.length > 0 && (
                          <select
                            value={slot.vendorId}
                            onChange={e => updateSlot(slot.id, 'vendorId', e.target.value)}
                            className="text-xs bg-transparent outline-none flex-shrink-0 max-w-[130px] truncate"
                            style={{
                              color: assignedVendor ? '#4A0E6E' : '#7C6B8A',
                              fontFamily: 'var(--font-space-sc)',
                              border: 'none',
                            }}
                          >
                            <option value="">— Unassigned —</option>
                            {vendors.map(v => (
                              <option key={v.id} value={v.id}>
                                {v.business_name}
                              </option>
                            ))}
                          </select>
                        )}

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => deleteSlot(slot.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors hover:bg-red-50"
                          aria-label="Remove slot"
                        >
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                            <path d="M2 2l6 6M8 2l-6 6" stroke="#C0ACD4" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                    )
                  })}
                </div>

                {/* Add slot */}
                <button
                  type="button"
                  onClick={addSlot}
                  className="mt-4 w-full py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition-colors hover:bg-[#F3E8FF]"
                  style={{
                    border: '2px dashed #DDB8F5',
                    color: '#4A0E6E',
                    fontFamily: 'var(--font-syne-sc)',
                    background: 'transparent',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M7 2v10M2 7h10" stroke="#4A0E6E" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Add time slot
                </button>
              </section>

              {/* ── TO-DO LIST ── */}
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2
                      className="text-lg font-bold text-[#1A1A2E]"
                      style={{ fontFamily: 'var(--font-syne-sc)' }}
                    >
                      To-Do List
                    </h2>
                    <p className="text-xs text-[#7C6B8A] mt-0.5" style={{ fontFamily: 'var(--font-space-sc)' }}>
                      Track everything leading up to your event day.
                    </p>
                  </div>
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ background: '#E6F7F2', color: '#0D9B6A', fontFamily: 'var(--font-space-sc)' }}
                  >
                    {doneCount} / {TODO_TASKS.length} done
                  </span>
                </div>

                <div className="space-y-7">
                  {todoGroups.map(({ group, meta, tasks }) => {
                    const groupDone = tasks.filter(t => doneTaskIds.has(t.id)).length
                    return (
                      <div key={group}>
                        {/* Group header */}
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ background: meta.color }}
                          />
                          <span
                            className="text-xs font-bold uppercase tracking-widest"
                            style={{ color: meta.color, fontFamily: 'var(--font-syne-sc)' }}
                          >
                            {meta.label}
                          </span>
                          <div className="flex-1 h-px" style={{ background: '#EDE5F7' }} />
                          <span className="text-xs text-[#7C6B8A]" style={{ fontFamily: 'var(--font-space-sc)' }}>
                            {groupDone} / {tasks.length}
                          </span>
                        </div>

                        {/* Task items */}
                        <div className="space-y-2">
                          {tasks.map(task => {
                            const isDone = doneTaskIds.has(task.id)
                            return (
                              <button
                                key={task.id}
                                type="button"
                                onClick={() => toggleTask(task.id)}
                                className="w-full text-left bg-white rounded-xl px-4 py-3 flex items-center gap-3 transition-all hover:shadow-sm"
                                style={{
                                  boxShadow: '0 1px 6px rgba(74,14,110,0.06)',
                                  border: isDone ? `1.5px solid ${meta.color}22` : '1.5px solid transparent',
                                  opacity: isDone ? 0.65 : 1,
                                }}
                              >
                                {/* Checkbox */}
                                <div
                                  className="w-5 h-5 rounded-[5px] flex items-center justify-center flex-shrink-0 transition-all"
                                  style={{
                                    border: `2px solid ${isDone ? meta.color : '#DDB8F5'}`,
                                    background: isDone ? meta.color : 'transparent',
                                  }}
                                >
                                  {isDone && (
                                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
                                      <path d="M1.5 4.5l2 2L7.5 2" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </div>

                                {/* Text */}
                                <span
                                  className="flex-1 text-sm"
                                  style={{
                                    fontFamily: 'var(--font-space-sc)',
                                    color: isDone ? '#7C6B8A' : '#1A1A2E',
                                    textDecoration: isDone ? 'line-through' : 'none',
                                  }}
                                >
                                  {task.text}
                                </span>

                                {/* Category badge */}
                                <span
                                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                                  style={{
                                    background: meta.badge,
                                    color: meta.badgeText,
                                    fontFamily: 'var(--font-space-sc)',
                                  }}
                                >
                                  {meta.label}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="space-y-5 lg:sticky lg:top-24">

              {/* Vendor contacts */}
              <div
                className="bg-white rounded-2xl p-5"
                style={{ boxShadow: '0 4px 24px rgba(74,14,110,0.08)' }}
              >
                <h3
                  className="text-sm font-bold text-[#1A1A2E] mb-4"
                  style={{ fontFamily: 'var(--font-syne-sc)' }}
                >
                  Vendor Contacts
                </h3>

                {vendors.length === 0 ? (
                  <div className="text-center py-6">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: '#F3E8FF' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                        <path d="M9 2a3 3 0 100 6 3 3 0 000-6z" stroke="#4A0E6E" strokeWidth="1.2" />
                        <path d="M3 16c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="#4A0E6E" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <p className="text-xs text-[#7C6B8A] text-center" style={{ fontFamily: 'var(--font-space-sc)' }}>
                      No confirmed vendors yet. Bookings will appear here once confirmed.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {vendors.map(v => (
                      <div
                        key={v.id}
                        className="flex items-start justify-between gap-3 pb-3"
                        style={{ borderBottom: '1px solid #EDE5F7' }}
                      >
                        <div className="min-w-0">
                          <p
                            className="text-sm font-bold text-[#1A1A2E] truncate"
                            style={{ fontFamily: 'var(--font-syne-sc)' }}
                          >
                            {v.business_name}
                          </p>
                          <span
                            className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1"
                            style={{ background: '#F3E8FF', color: '#4A0E6E', fontFamily: 'var(--font-space-sc)' }}
                          >
                            {v.category}
                          </span>
                          {v.phone && (
                            <p className="text-xs text-[#7C6B8A] mt-1" style={{ fontFamily: 'var(--font-space-sc)' }}>
                              {v.phone}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          className="flex-shrink-0 text-xs font-semibold text-[#4A0E6E] hover:underline transition-all"
                          style={{ fontFamily: 'var(--font-space-sc)' }}
                        >
                          Message
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <Link
                  href="/vendors"
                  className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-[#4A0E6E] hover:underline transition-all"
                  style={{ fontFamily: 'var(--font-space-sc)' }}
                >
                  Browse vendors
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                    <path d="M2 9L9 2M9 2H4.5M9 2v4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>

              {/* Emergency checklist */}
              <div
                className="bg-white rounded-2xl p-5"
                style={{ boxShadow: '0 4px 24px rgba(74,14,110,0.08)' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: '#FEF3E2' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <circle cx="7" cy="7" r="5.5" stroke="#E67E22" strokeWidth="1.2" />
                      <path d="M7 4.5v3" stroke="#E67E22" strokeWidth="1.2" strokeLinecap="round" />
                      <circle cx="7" cy="9.5" r="0.7" fill="#E67E22" />
                    </svg>
                  </div>
                  <h3
                    className="text-sm font-bold text-[#1A1A2E]"
                    style={{ fontFamily: 'var(--font-syne-sc)' }}
                  >
                    Emergency Kit
                  </h3>
                </div>

                <p className="text-xs text-[#7C6B8A] mb-4" style={{ fontFamily: 'var(--font-space-sc)' }}>
                  Pack these items the night before.
                </p>

                <ul className="space-y-2.5">
                  {EMERGENCY_ITEMS.map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: '#DDB8F5' }}
                      />
                      <span
                        className="text-sm text-[#1A1A2E]/75"
                        style={{ fontFamily: 'var(--font-space-sc)' }}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}
