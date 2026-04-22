'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, Suspense } from 'react'
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
  total_budget: number | null
  created_at: string | null
}

interface Booking {
  id: string
  deposit_amount: number | null
  status: string
  created_at: string
  vendor_profiles: { business_name: string; category: string } | null
}

interface ManualExpense {
  id: string
  description: string
  amount: number
  category: string
  date: string
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Budget category config ─────────────────────────────────────────────────────

interface BudgetCat {
  name: string
  pct: number
  color: string
}

const BUDGET_CATS: BudgetCat[] = [
  { name: 'Venue',           pct: 30, color: '#6B1F9A' },
  { name: 'Food & Catering', pct: 25, color: '#5DADE2' },
  { name: 'Photography',     pct: 10, color: '#E67E22' },
  { name: 'Music/DJ',        pct:  8, color: '#0D9B6A' },
  { name: 'Decor & Florals', pct: 10, color: '#E74C3C' },
  { name: 'Cake',            pct:  5, color: '#F39C12' },
  { name: 'Beauty & Hair',   pct:  5, color: '#D4AC0D' },
  { name: 'Other',           pct:  7, color: '#7C6B8A' },
]

const EXPENSE_CATS = BUDGET_CATS.map(c => c.name)

// Map vendor_profiles.category → budget category name
function mapVendorCat(vendorCat: string): string {
  const c = vendorCat.toLowerCase()
  if (c.includes('venue'))                         return 'Venue'
  if (c.includes('cater') || c.includes('food'))   return 'Food & Catering'
  if (c.includes('photo'))                         return 'Photography'
  if (c.includes('dj') || c.includes('music') || c.includes('entertain') || c === 'mc') return 'Music/DJ'
  if (c.includes('decor') || c.includes('floral')) return 'Decor & Florals'
  if (c.includes('cake'))                          return 'Cake'
  if (c.includes('beauty') || c.includes('hair') || c.includes('makeup')) return 'Beauty & Hair'
  return 'Other'
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="min-h-screen bg-[#F8F4FC] animate-pulse">
      <div className="h-16 bg-[#1A1A2E]" />
      <div className="h-52 bg-[#2a1a3e]" />
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-5">
        {[180, 320, 260, 200].map(h => (
          <div key={h} className="rounded-2xl bg-white" style={{ height: h, boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }} />
        ))}
      </div>
    </div>
  )
}

// ── Ring SVG ───────────────────────────────────────────────────────────────────

function ProgressRing({ pct }: { pct: number }) {
  const r = 80
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(pct, 100) / 100)
  return (
    <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(74,14,110,0.1)" strokeWidth="14" />
      <circle
        cx="100" cy="100" r={r} fill="none"
        stroke="url(#ringGrad)" strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#DDB8F5" />
          <stop offset="100%" stopColor="#4A0E6E" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ── Status badge helper ────────────────────────────────────────────────────────

function statusBadge(bookingStatus: string): { label: string; bg: string; color: string } {
  switch (bookingStatus.toLowerCase()) {
    case 'confirmed': return { label: 'Confirmed', bg: '#D1FAE5', color: '#065F46' }
    case 'paid':      return { label: 'Paid',      bg: '#D1FAE5', color: '#065F46' }
    case 'pending':   return { label: 'Pending',   bg: '#FEF9E7', color: '#D4AC0D' }
    case 'cancelled': return { label: 'Cancelled', bg: '#FDEDEC', color: '#C0392B' }
    default:          return { label: bookingStatus, bg: '#F3F4F6', color: '#6B7280' }
  }
}

// ── Page ───────────────────────────────────────────────────────────────────────

function BudgetInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const eventId      = searchParams.get('eventId')

  const [event,    setEvent]    = useState<EventRow | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading,  setLoading]  = useState(true)
  const [noEvent,  setNoEvent]  = useState(false)

  // manual expenses
  const [expenses,    setExpenses]    = useState<ManualExpense[]>([])
  const [showForm,    setShowForm]    = useState(false)
  const [formDesc,    setFormDesc]    = useState('')
  const [formAmount,  setFormAmount]  = useState('')
  const [formCat,     setFormCat]     = useState(EXPENSE_CATS[0])

  const load = useCallback(async () => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/auth/signin'); return }

    let eventsQuery = supabase
      .from('events')
      .select('id, event_type, event_date, total_budget, created_at')
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
        .select('id, deposit_amount, status, created_at, vendor_profiles(business_name, category)')
        .eq('client_email', user.email),
    ])

    const ev = events?.[0] ?? null
    if (!ev) { setNoEvent(true); setLoading(false); return }

    setEvent(ev as EventRow)
    setBookings((bk ?? []) as Booking[])

    try {
      const stored = JSON.parse(localStorage.getItem(`budget_expenses_${ev.id}`) ?? '[]')
      setExpenses(stored)
    } catch { /* ignore */ }

    setLoading(false)
  }, [router, eventId])

  useEffect(() => { load() }, [load])

  // persist expenses
  useEffect(() => {
    if (!event) return
    localStorage.setItem(`budget_expenses_${event.id}`, JSON.stringify(expenses))
  }, [expenses, event])

  function addExpense() {
    const amt = parseFloat(formAmount)
    if (!formDesc.trim() || isNaN(amt) || amt <= 0) return
    setExpenses(prev => [...prev, {
      id: Date.now().toString(),
      description: formDesc.trim(),
      amount: amt,
      category: formCat,
      date: new Date().toISOString(),
    }])
    setFormDesc(''); setFormAmount(''); setFormCat(EXPENSE_CATS[0]); setShowForm(false)
  }

  function removeExpense(id: string) {
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  if (loading)  return <Skeleton />

  if (noEvent) return (
    <div
      className={`${syne.variable} ${spaceGrotesk.variable} min-h-screen flex flex-col items-center justify-center gap-5`}
      style={{ background: '#F8F4FC', fontFamily: 'var(--font-space), sans-serif' }}
    >
      <p style={{ fontFamily: 'var(--font-syne)', fontSize: 22, fontWeight: 700, color: '#1A1A2E' }}>
        Start planning to track your budget
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

  const ev           = event!
  const totalBudget  = ev.total_budget ?? 0

  // spent = paid bookings deposits + manual expenses
  const bookingSpent = bookings
    .filter(b => b.status === 'paid' || b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.deposit_amount ?? 0), 0)
  const manualSpent  = expenses.reduce((sum, e) => sum + e.amount, 0)
  const totalSpent   = bookingSpent + manualSpent
  const remaining    = totalBudget - totalSpent
  const pctSpent     = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

  // build per-category actual spend map (bookings + manual)
  const catSpend: Record<string, number> = {}
  for (const b of bookings) {
    if (!b.vendor_profiles) continue
    const cat = mapVendorCat(b.vendor_profiles.category)
    catSpend[cat] = (catSpend[cat] ?? 0) + (b.deposit_amount ?? 0)
  }
  for (const e of expenses) {
    catSpend[e.category] = (catSpend[e.category] ?? 0) + e.amount
  }

  // per-category booked vendor name
  const catVendor: Record<string, string> = {}
  for (const b of bookings) {
    if (!b.vendor_profiles) continue
    const cat = mapVendorCat(b.vendor_profiles.category)
    if (!catVendor[cat]) catVendor[cat] = b.vendor_profiles.business_name
  }

  const card: React.CSSProperties = {
    background: 'white', borderRadius: 20, padding: '1.5rem',
    boxShadow: '0 1px 4px rgba(74,14,110,0.07)', marginBottom: '1.25rem',
  }

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

          <div className="flex-1 flex justify-center min-w-0 px-4">
            {ev.event_type && (
              <span style={{
                fontFamily: 'var(--font-syne)', fontSize: '0.85rem', fontWeight: 700,
                color: 'rgba(255,255,255,0.72)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {ev.event_type}
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

      {/* ── HERO ── */}
      <div className="relative overflow-hidden" style={{ minHeight: 220 }}>
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
            Financial Overview
          </p>
          <h1 style={{
            fontFamily: 'var(--font-syne)', fontWeight: 800,
            fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
            letterSpacing: '-0.03em', color: 'white', lineHeight: 1.15,
            marginBottom: '1.5rem',
          }}>
            Budget Tracker
          </h1>

          {/* Stat pills */}
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Total Budget', value: formatCurrency(totalBudget), color: 'white' },
              { label: 'Spent',        value: formatCurrency(totalSpent),  color: totalSpent > totalBudget ? '#FF6B6B' : '#FCA5A5' },
              { label: 'Remaining',    value: formatCurrency(Math.max(remaining, 0)), color: remaining >= 0 ? '#6EE7B7' : '#FF6B6B' },
            ].map(s => (
              <div
                key={s.label}
                style={{
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.11)',
                  borderRadius: 12, padding: '0.5rem 1.1rem',
                }}
              >
                <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.42)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
                  {s.label}
                </div>
                <div style={{ fontFamily: 'var(--font-syne)', fontSize: '1.2rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* ── Budget Overview Card ── */}
        <div style={card}>
          <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '1.05rem', color: '#1A1A2E', marginBottom: '1.25rem' }}>
            Budget Overview
          </h2>

          <div className="flex flex-col items-center" style={{ marginBottom: '1.5rem' }}>
            {/* Ring */}
            <div style={{ position: 'relative', width: 200, height: 200 }}>
              <ProgressRing pct={pctSpent} />
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontFamily: 'var(--font-syne)', fontSize: '1.6rem', fontWeight: 800, color: '#1A1A2E', lineHeight: 1 }}>
                  {pctSpent}%
                </span>
                <span style={{ fontFamily: 'var(--font-space)', fontSize: '0.7rem', color: '#9CA3AF', marginTop: 4 }}>
                  of budget spent
                </span>
                <span style={{ fontFamily: 'var(--font-syne)', fontSize: '0.95rem', fontWeight: 700, color: '#4A0E6E', marginTop: 6 }}>
                  {formatCurrency(totalBudget)}
                </span>
              </div>
            </div>

            {/* Spent / Remaining row */}
            <div className="flex gap-6 mt-2">
              <div className="flex flex-col items-center">
                <span style={{ fontFamily: 'var(--font-syne)', fontSize: '1.1rem', fontWeight: 800, color: '#C0392B' }}>
                  {formatCurrency(totalSpent)}
                </span>
                <span style={{ fontFamily: 'var(--font-space)', fontSize: '0.7rem', color: '#9CA3AF', marginTop: 2 }}>Spent</span>
              </div>
              <div style={{ width: 1, background: 'rgba(74,14,110,0.1)', alignSelf: 'stretch' }} />
              <div className="flex flex-col items-center">
                <span style={{ fontFamily: 'var(--font-syne)', fontSize: '1.1rem', fontWeight: 800, color: remaining >= 0 ? '#0D9B6A' : '#C0392B' }}>
                  {formatCurrency(Math.abs(remaining))}
                </span>
                <span style={{ fontFamily: 'var(--font-space)', fontSize: '0.7rem', color: '#9CA3AF', marginTop: 2 }}>
                  {remaining >= 0 ? 'Remaining' : 'Over budget'}
                </span>
              </div>
            </div>
          </div>

          {/* Segmented bar */}
          <div>
            <div style={{ height: 8, background: 'rgba(74,14,110,0.07)', borderRadius: 4, overflow: 'hidden', display: 'flex', marginBottom: 10 }}>
              {BUDGET_CATS.map(cat => {
                const allocated = totalBudget * cat.pct / 100
                const catActual = catSpend[cat.name] ?? 0
                const barPct    = allocated > 0 ? Math.min((catActual / allocated) * cat.pct, cat.pct) : 0
                return (
                  <div
                    key={cat.name}
                    style={{ width: `${barPct}%`, background: cat.color, transition: 'width 0.6s ease' }}
                  />
                )
              })}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {BUDGET_CATS.map(cat => (
                <div key={cat.name} className="flex items-center gap-1">
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: cat.color, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-space)', fontSize: '0.7rem', color: '#7C6B8A' }}>
                    {cat.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Category Breakdown ── */}
        <div style={card}>
          <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '1.05rem', color: '#1A1A2E', marginBottom: '1.25rem' }}>
            Category Breakdown
          </h2>

          <div className="flex flex-col gap-3">
            {BUDGET_CATS.map(cat => {
              const allocated = totalBudget * cat.pct / 100
              const actual    = catSpend[cat.name] ?? 0
              const vendor    = catVendor[cat.name]
              const barPct    = allocated > 0 ? Math.min((actual / allocated) * 100, 100) : 0
              const isOver    = actual > allocated && allocated > 0
              const isOn      = actual > 0 && actual <= allocated
              const isEmpty   = actual === 0

              let statusLabel: string
              let statusBg: string
              let statusColor: string
              if (isOver)       { statusLabel = 'Over budget';   statusBg = '#FDEDEC'; statusColor = '#C0392B' }
              else if (isOn)    { statusLabel = 'Under budget';  statusBg = '#E6F7F2'; statusColor = '#0D9B6A' }
              else              { statusLabel = 'Not spent yet'; statusBg = '#F3E8FF'; statusColor = '#7C6B8A' }

              return (
                <div
                  key={cat.name}
                  className="rounded-2xl p-4"
                  style={{
                    background: 'white',
                    border: `1.5px solid ${isOver ? '#FDEDEC' : 'rgba(74,14,110,0.08)'}`,
                    boxShadow: '0 1px 3px rgba(74,14,110,0.05)',
                  }}
                >
                  {/* Top row */}
                  <div className="flex items-center gap-3 mb-3">
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%', background: cat.color, flexShrink: 0,
                    }} />
                    <span style={{ fontFamily: 'var(--font-syne)', fontSize: '0.9rem', fontWeight: 700, color: '#1A1A2E', flex: 1 }}>
                      {cat.name}
                    </span>
                    <div className="text-right">
                      <div style={{ fontFamily: 'var(--font-syne)', fontSize: '0.95rem', fontWeight: 800, color: isOver ? '#C0392B' : '#1A1A2E' }}>
                        {formatCurrency(actual)}
                      </div>
                      <div style={{ fontFamily: 'var(--font-space)', fontSize: '0.68rem', color: '#9CA3AF' }}>
                        of {formatCurrency(allocated)}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ height: 5, background: 'rgba(74,14,110,0.07)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{
                      height: '100%', width: `${barPct}%`,
                      background: isOver ? '#C0392B' : cat.color,
                      borderRadius: 3, transition: 'width 0.6s ease',
                    }} />
                  </div>

                  {/* Bottom row */}
                  <div className="flex items-center justify-between gap-2">
                    <span style={{
                      fontFamily: 'var(--font-space)', fontSize: '0.7rem', fontWeight: 600,
                      background: statusBg, color: statusColor,
                      borderRadius: 100, padding: '0.18rem 0.6rem',
                    }}>
                      {statusLabel}
                    </span>
                    {vendor && (
                      <span style={{ fontFamily: 'var(--font-space)', fontSize: '0.72rem', color: '#7C6B8A', textAlign: 'right' }}>
                        {vendor}
                      </span>
                    )}
                    {isEmpty && !vendor && (
                      <Link
                        href="/vendors"
                        style={{ fontFamily: 'var(--font-space)', fontSize: '0.72rem', fontWeight: 600, color: '#4A0E6E', textDecoration: 'none' }}
                      >
                        Find vendors →
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Bookings List ── */}
        {bookings.length > 0 && (
          <div style={card}>
            <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '1.05rem', color: '#1A1A2E', marginBottom: '1.25rem' }}>
              Bookings
            </h2>

            <div className="flex flex-col gap-2">
              {bookings.map(b => {
                const vp     = b.vendor_profiles
                const badge  = statusBadge(b.status)
                return (
                  <div
                    key={b.id}
                    className="flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{ border: '1px solid rgba(74,14,110,0.09)', background: 'white' }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: 'var(--font-syne)', fontSize: '0.875rem', fontWeight: 700, color: '#1A1A2E', marginBottom: 2 }}>
                        {vp?.business_name ?? 'Unknown vendor'}
                      </p>
                      <p style={{ fontFamily: 'var(--font-space)', fontSize: '0.72rem', color: '#9CA3AF' }}>
                        {vp?.category ?? ''}{vp?.category ? ' · ' : ''}{formatDate(b.created_at)}
                      </p>
                    </div>

                    <span style={{
                      fontFamily: 'var(--font-space)', fontSize: '0.68rem', fontWeight: 600,
                      background: badge.bg, color: badge.color,
                      borderRadius: 100, padding: '0.18rem 0.6rem', flexShrink: 0,
                    }}>
                      {badge.label}
                    </span>

                    {b.deposit_amount != null && (
                      <span style={{ fontFamily: 'var(--font-syne)', fontSize: '0.9rem', fontWeight: 800, color: '#C0392B', flexShrink: 0 }}>
                        {formatCurrency(b.deposit_amount)}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Manual Expenses ── */}
        <div style={card}>
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: '1.05rem', color: '#1A1A2E' }}>
              Manual Expenses
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(v => !v)}
              style={{
                background: showForm ? 'rgba(74,14,110,0.08)' : '#4A0E6E',
                color: showForm ? '#4A0E6E' : 'white',
                border: showForm ? '1.5px solid rgba(74,14,110,0.2)' : 'none',
                borderRadius: 100, padding: '0.35rem 1rem',
                fontFamily: 'var(--font-syne)', fontSize: '0.8rem', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {showForm ? 'Cancel' : '+ Add expense'}
            </button>
          </div>

          {/* Add expense form */}
          {showForm && (
            <div
              className="rounded-2xl p-4 mb-4 flex flex-col gap-3"
              style={{ background: 'rgba(74,14,110,0.04)', border: '1.5px solid rgba(74,14,110,0.1)' }}
            >
              <div>
                <label style={{ fontFamily: 'var(--font-space)', fontSize: '0.72rem', fontWeight: 600, color: '#7C6B8A', display: 'block', marginBottom: 4 }}>
                  Description
                </label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="e.g. Wedding invitations printing"
                  style={{
                    width: '100%', borderRadius: 10, border: '1.5px solid rgba(74,14,110,0.15)',
                    padding: '0.55rem 0.85rem', fontFamily: 'var(--font-space)', fontSize: '0.875rem',
                    color: '#1A1A2E', background: 'white', outline: 'none',
                  }}
                />
              </div>
              <div className="flex gap-3">
                <div style={{ flex: 1 }}>
                  <label style={{ fontFamily: 'var(--font-space)', fontSize: '0.72rem', fontWeight: 600, color: '#7C6B8A', display: 'block', marginBottom: 4 }}>
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formAmount}
                    onChange={e => setFormAmount(e.target.value)}
                    placeholder="0"
                    style={{
                      width: '100%', borderRadius: 10, border: '1.5px solid rgba(74,14,110,0.15)',
                      padding: '0.55rem 0.85rem', fontFamily: 'var(--font-space)', fontSize: '0.875rem',
                      color: '#1A1A2E', background: 'white', outline: 'none',
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontFamily: 'var(--font-space)', fontSize: '0.72rem', fontWeight: 600, color: '#7C6B8A', display: 'block', marginBottom: 4 }}>
                    Category
                  </label>
                  <select
                    value={formCat}
                    onChange={e => setFormCat(e.target.value)}
                    style={{
                      width: '100%', borderRadius: 10, border: '1.5px solid rgba(74,14,110,0.15)',
                      padding: '0.55rem 0.85rem', fontFamily: 'var(--font-space)', fontSize: '0.875rem',
                      color: '#1A1A2E', background: 'white', outline: 'none', cursor: 'pointer',
                    }}
                  >
                    {EXPENSE_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <button
                type="button"
                onClick={addExpense}
                style={{
                  background: '#4A0E6E', color: 'white', borderRadius: 10,
                  padding: '0.65rem', fontFamily: 'var(--font-syne)', fontSize: '0.875rem', fontWeight: 700,
                  cursor: 'pointer', border: 'none', transition: 'opacity 0.15s',
                }}
              >
                Save expense
              </button>
            </div>
          )}

          {/* Expense list */}
          {expenses.length === 0 ? (
            <p style={{ fontFamily: 'var(--font-space)', fontSize: '0.85rem', color: '#9CA3AF' }}>
              No manual expenses added yet.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {expenses.map(e => (
                <div
                  key={e.id}
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{ border: '1px solid rgba(74,14,110,0.09)', background: 'white' }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--font-syne)', fontSize: '0.875rem', fontWeight: 700, color: '#1A1A2E', marginBottom: 2 }}>
                      {e.description}
                    </p>
                    <p style={{ fontFamily: 'var(--font-space)', fontSize: '0.72rem', color: '#9CA3AF' }}>
                      {e.category} · {formatDate(e.date)}
                    </p>
                  </div>
                  <span style={{ fontFamily: 'var(--font-syne)', fontSize: '0.9rem', fontWeight: 800, color: '#C0392B', flexShrink: 0 }}>
                    {formatCurrency(e.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeExpense(e.id)}
                    aria-label="Remove expense"
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#9CA3AF', fontSize: '1rem', lineHeight: 1, padding: '0 2px',
                      flexShrink: 0,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default function BudgetPage() {
  return <Suspense><BudgetInner /></Suspense>
}
