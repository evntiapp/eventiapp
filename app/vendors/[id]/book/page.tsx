'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Syne, Space_Grotesk } from 'next/font/google'
import { getSupabaseClient } from '@/lib/supabase'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne-bk',
})
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-bk',
})

// ── Types ─────────────────────────────────────────────────────────────────────

interface VendorProfile {
  id: string
  business_name: string
  category: string
  pricing_from: number | null
  pricing_to: number | null
  business_email: string | null
}

interface BookingForm {
  clientName: string
  clientEmail: string
  eventType: string
  eventDate: string
  guestCount: string
  eventLocation: string
  budgetForVendor: string
  clientMessage: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(from: number | null, to: number | null): string {
  if (!from && !to) return 'Price on request'
  if (from && to) return `$${from.toLocaleString()} – $${to.toLocaleString()}`
  if (from) return `From $${from.toLocaleString()}`
  return `Up to $${to!.toLocaleString()}`
}

const EMPTY_FORM: BookingForm = {
  clientName: '',
  clientEmail: '',
  eventType: '',
  eventDate: '',
  guestCount: '',
  eventLocation: '',
  budgetForVendor: '',
  clientMessage: '',
}

const EVENT_TYPES = [
  'Birthday',
  'Wedding',
  'Corporate',
  'Baby Shower',
  'Graduation',
  'Anniversary',
  'Other',
]

const STEPS = [
  'Vendor reviews your request',
  'They respond within 24 hours',
  'Confirm and pay deposit',
]

// ── Shared field styles ───────────────────────────────────────────────────────

const inputCls =
  'w-full bg-white border border-[#DDB8F5] rounded-xl px-4 py-3 text-sm text-[#1A1A2E] outline-none focus:border-[#4A0E6E] focus:ring-2 focus:ring-[#4A0E6E]/10 placeholder-[#C0ACD4] transition-all appearance-none'
const labelCls =
  'block text-[11px] font-semibold uppercase tracking-widest text-[#7C6B8A] mb-1.5'

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BookingPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()

  const [vendor, setVendor] = useState<VendorProfile | null>(null)
  const [vendorLoading, setVendorLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [form, setForm] = useState<BookingForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Fetch vendor
  useEffect(() => {
    if (!id) return
    async function fetchVendor() {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('id, business_name, category, pricing_from, pricing_to, business_email')
        .eq('id', id)
        .single()

      if (error || !data) {
        setNotFound(true)
      } else {
        setVendor(data as VendorProfile)
      }
      setVendorLoading(false)
    }
    fetchVendor()
  }, [id])

  function update(field: keyof BookingForm, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')

    try {
      const supabase = getSupabaseClient()
      const budgetInt = form.budgetForVendor ? parseInt(form.budgetForVendor, 10) : null
      const { data: inserted, error } = await supabase
        .from('bookings')
        .insert({
          vendor_id: id,
          client_name: form.clientName,
          client_email: form.clientEmail,
          event_type: form.eventType,
          event_date: form.eventDate || null,
          guest_count: form.guestCount ? parseInt(form.guestCount, 10) : null,
          event_location: form.eventLocation,
          budget_for_vendor: budgetInt,
          client_message: form.clientMessage,
        })
        .select('id')
        .single()

      if (error) throw error

      // Email notification to vendor
      if (vendor!.business_email) {
        fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'booking_request',
            to: vendor!.business_email,
            data: {
              vendorName: vendor!.business_name,
              clientName: form.clientName,
              eventType: form.eventType,
              eventDate: form.eventDate,
              guestCount: form.guestCount,
              budget: form.budgetForVendor,
              clientMessage: form.clientMessage,
            },
          }),
        }).catch(() => {})
      }

      const depositAmount = budgetInt ? Math.round(budgetInt * 0.2) : 0
      router.push(
        `/vendors/${id}/book/payment?bookingId=${inserted!.id}&amount=${depositAmount}&vendorName=${encodeURIComponent(vendor!.business_name)}`
      )
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setSubmitError(message)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Loading ──
  if (vendorLoading) {
    return (
      <div className={`${syne.variable} ${spaceGrotesk.variable} min-h-screen bg-[#F8F4FC] animate-pulse`}>
        <div className="h-16 bg-white border-b border-[#EDE5F7]" />
        <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-5">
            <div className="h-3 w-28 bg-[#DDB8F5] rounded" />
            <div className="h-8 w-2/3 bg-[#E8DFF5] rounded" />
            <div className="h-3 w-1/2 bg-[#EDE5F7] rounded" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-[#EDE5F7] rounded-xl" />
            ))}
            <div className="h-32 bg-[#EDE5F7] rounded-xl" />
            <div className="h-12 bg-[#E8DFF5] rounded-xl" />
          </div>
          <div className="h-80 bg-white rounded-2xl" />
        </div>
      </div>
    )
  }

  // ── 404 ──
  if (notFound || !vendor) {
    return (
      <div
        className={`${syne.variable} ${spaceGrotesk.variable} min-h-screen bg-[#F8F4FC] flex flex-col`}
        style={{ fontFamily: 'var(--font-space-bk), system-ui, sans-serif' }}
      >
        <nav className="sticky top-0 z-30 bg-[#F8F4FC] border-b border-[#EDE5F7] px-6 h-16 flex items-center gap-6">
          <Link
            href="/"
            className="text-xl font-extrabold tracking-tight text-[#4A0E6E]"
            style={{ fontFamily: 'var(--font-syne-bk)' }}
          >
            evnti.
          </Link>
        </nav>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
          <h1
            className="text-2xl font-bold text-[#1A1A2E] mb-3"
            style={{ fontFamily: 'var(--font-syne-bk)' }}
          >
            Vendor not found.
          </h1>
          <Link
            href="/vendors"
            className="text-sm font-semibold text-[#4A0E6E] underline underline-offset-4"
            style={{ fontFamily: 'var(--font-space-bk)' }}
          >
            Browse all vendors
          </Link>
        </div>
      </div>
    )
  }

  // ── Main form ──
  return (
    <div
      className={`${syne.variable} ${spaceGrotesk.variable} min-h-screen bg-[#F8F4FC]`}
      style={{ fontFamily: 'var(--font-space-bk), system-ui, sans-serif' }}
    >
      {/* Nav */}
      <nav
        className="sticky top-0 z-30 bg-[#F8F4FC]/95 border-b border-[#EDE5F7]"
        style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-6">
          <Link
            href="/"
            className="text-xl font-extrabold tracking-tight text-[#4A0E6E] hover:opacity-80 transition-opacity"
            style={{ fontFamily: 'var(--font-syne-bk)' }}
          >
            evnti.
          </Link>
          <Link
            href={`/vendors/${id}`}
            className="flex items-center gap-1.5 text-sm text-[#7C6B8A] hover:text-[#4A0E6E] transition-colors"
            style={{ fontFamily: 'var(--font-space-bk)' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to {vendor.business_name}
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

          {/* ── LEFT: Form ── */}
          <div className="lg:col-span-2">
            {/* Header */}
            <p
              className="text-[11px] font-semibold uppercase tracking-[4px] text-[#DDB8F5] mb-3"
              style={{ fontFamily: 'var(--font-space-bk)' }}
            >
              Request Booking
            </p>
            <h1
              className="text-3xl font-bold text-[#1A1A2E] mb-2 leading-tight"
              style={{ fontFamily: 'var(--font-syne-bk)' }}
            >
              Book {vendor.business_name}
            </h1>
            <p
              className="text-sm text-[#7C6B8A] leading-relaxed mb-8"
              style={{ fontFamily: 'var(--font-space-bk)' }}
            >
              Fill out your event details and {vendor.business_name} will respond within 24 hours.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Your name</label>
                  <input
                    className={inputCls}
                    type="text"
                    placeholder="Jane Smith"
                    value={form.clientName}
                    onChange={e => update('clientName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Your email</label>
                  <input
                    className={inputCls}
                    type="email"
                    placeholder="jane@email.com"
                    value={form.clientEmail}
                    onChange={e => update('clientEmail', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Event type */}
              <div>
                <label className={labelCls}>Event type</label>
                <select
                  className={inputCls}
                  value={form.eventType}
                  onChange={e => update('eventType', e.target.value)}
                  required
                >
                  <option value="">Select event type</option>
                  {EVENT_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Event date + Guest count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Event date</label>
                  <input
                    className={inputCls}
                    type="date"
                    value={form.eventDate}
                    onChange={e => update('eventDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Guest count</label>
                  <input
                    className={inputCls}
                    type="number"
                    min="1"
                    placeholder="e.g. 80"
                    value={form.guestCount}
                    onChange={e => update('guestCount', e.target.value)}
                  />
                </div>
              </div>

              {/* Event location */}
              <div>
                <label className={labelCls}>Event location / venue</label>
                <input
                  className={inputCls}
                  type="text"
                  placeholder="e.g. The Astorian, Houston TX"
                  value={form.eventLocation}
                  onChange={e => update('eventLocation', e.target.value)}
                />
              </div>

              {/* Budget */}
              <div>
                <label className={labelCls}>Budget for this vendor</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7C6B8A] text-sm select-none">
                    $
                  </span>
                  <input
                    className={`${inputCls} pl-8`}
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.budgetForVendor}
                    onChange={e => update('budgetForVendor', e.target.value)}
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className={labelCls}>Message to vendor</label>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={5}
                  placeholder="Tell them about your vision, any special requests..."
                  value={form.clientMessage}
                  onChange={e => update('clientMessage', e.target.value)}
                />
              </div>

              {/* Error */}
              {submitError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm leading-relaxed">
                  {submitError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, #4A0E6E 0%, #6B1F9A 100%)',
                  fontFamily: 'var(--font-syne-bk)',
                }}
              >
                {submitting ? 'Sending...' : 'Send booking request'}
              </button>
            </form>
          </div>

          {/* ── RIGHT: Summary card ── */}
          <div className="lg:sticky lg:top-24">
            <div
              className="bg-white rounded-2xl p-6"
              style={{ boxShadow: '0 4px 24px rgba(74,14,110,0.1)' }}
            >
              {/* Vendor name + category */}
              <h3
                className="text-base font-bold text-[#1A1A2E] mb-2"
                style={{ fontFamily: 'var(--font-syne-bk)' }}
              >
                {vendor.business_name}
              </h3>
              <span
                className="inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold mb-4"
                style={{ background: '#F3E8FF', color: '#4A0E6E', fontFamily: 'var(--font-space-bk)' }}
              >
                {vendor.category}
              </span>

              {/* Pricing */}
              <p
                className="text-xl font-bold text-[#4A0E6E] mb-4"
                style={{ fontFamily: 'var(--font-syne-bk)' }}
              >
                {formatPrice(vendor.pricing_from, vendor.pricing_to)}
              </p>

              <div className="h-px bg-[#EDE5F7] mb-5" />

              {/* What happens next */}
              <p
                className="text-[11px] font-semibold uppercase tracking-widest text-[#7C6B8A] mb-4"
                style={{ fontFamily: 'var(--font-space-bk)' }}
              >
                What happens next
              </p>
              <ol className="space-y-3 mb-5">
                {STEPS.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5"
                      style={{ background: '#4A0E6E', fontFamily: 'var(--font-syne-bk)' }}
                    >
                      {i + 1}
                    </span>
                    <span
                      className="text-sm text-[#1A1A2E]/75 leading-snug"
                      style={{ fontFamily: 'var(--font-space-bk)' }}
                    >
                      {step}
                    </span>
                  </li>
                ))}
              </ol>

              <p
                className="text-xs text-[#7C6B8A] text-center"
                style={{ fontFamily: 'var(--font-space-bk)' }}
              >
                No payment required yet.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
