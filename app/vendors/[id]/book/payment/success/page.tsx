'use client'

import { useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Syne, Space_Grotesk } from 'next/font/google'
import { getSupabaseClient } from '@/lib/supabase'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne-ps',
})
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-ps',
})

// ── Inner component — uses useSearchParams, must be inside Suspense ───────────

function SuccessContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('bookingId') ?? ''
  const paymentIntent = searchParams.get('payment_intent') ?? ''
  const ref = paymentIntent.slice(-8)

  const updated = useRef(false)

  useEffect(() => {
    if (!bookingId || updated.current) return
    updated.current = true

    const supabase = getSupabaseClient()
    supabase
      .from('bookings')
      .update({ status: 'paid' })
      .eq('id', bookingId)
  }, [bookingId])

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
      {/* Checkmark circle */}
      <div
        className="w-24 h-24 rounded-full bg-[#4A0E6E] flex items-center justify-center mb-8 flex-shrink-0"
        style={{ boxShadow: '0 0 0 18px rgba(74,14,110,0.08)' }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <path
            d="M9 20L17 28L31 12"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Heading */}
      <h1
        className="text-3xl font-bold text-[#1A1A2E] mb-3 leading-tight"
        style={{ fontFamily: 'var(--font-syne-ps)' }}
      >
        Payment confirmed.
      </h1>

      {/* Subtext */}
      <p
        className="text-sm text-[#7C6B8A] leading-relaxed mb-6 max-w-xs"
        style={{ fontFamily: 'var(--font-space-ps)' }}
      >
        Your booking is confirmed. The vendor will be in touch with you shortly.
      </p>

      {/* Booking reference pill */}
      {ref && (
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8"
          style={{ background: '#F0EBF6' }}
        >
          <span
            className="text-[11px] text-[#7C6B8A]"
            style={{ fontFamily: 'var(--font-space-ps)' }}
          >
            Ref:
          </span>
          <span
            className="text-[11px] font-semibold text-[#4A0E6E] tracking-wide uppercase"
            style={{ fontFamily: 'var(--font-space-ps)' }}
          >
            ...{ref}
          </span>
        </div>
      )}

      {/* Buttons */}
      <div className="w-full max-w-xs flex flex-col gap-3">
        <Link
          href="/dashboard"
          className="w-full py-3.5 rounded-xl text-sm font-bold text-white text-center transition-all hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, #4A0E6E 0%, #6B1F9A 100%)',
            fontFamily: 'var(--font-syne-ps)',
          }}
        >
          Go to my dashboard
        </Link>
        <Link
          href="/vendors"
          className="w-full py-3.5 rounded-xl text-sm font-semibold text-[#4A0E6E] text-center border border-[#DDB8F5] bg-transparent transition-colors hover:bg-[#F3E8FF]"
          style={{ fontFamily: 'var(--font-space-ps)' }}
        >
          Browse more vendors
        </Link>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PaymentSuccessPage() {
  return (
    <div
      className={`${syne.variable} ${spaceGrotesk.variable} min-h-screen bg-[#F8F4FC] flex flex-col`}
      style={{ fontFamily: 'var(--font-space-ps), system-ui, sans-serif' }}
    >
      {/* Nav */}
      <nav className="px-6 h-16 flex items-center border-b border-[#EDE5F7] bg-[#F8F4FC] flex-shrink-0">
        <div className="max-w-sm mx-auto w-full">
          <Link
            href="/"
            className="text-xl font-extrabold tracking-tight text-[#4A0E6E] hover:opacity-80 transition-opacity"
            style={{ fontFamily: 'var(--font-syne-ps)' }}
          >
            evnti.
          </Link>
        </div>
      </nav>

      {/* Centered content */}
      <div className="flex-1 flex flex-col w-full max-w-[480px] mx-auto">
        <Suspense>
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  )
}
