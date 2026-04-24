'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Syne, Space_Grotesk } from 'next/font/google'
import { useLogoHref } from '@/app/hooks/useLogoHref'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne-pay',
})
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-pay',
})

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// ── Stripe appearance ─────────────────────────────────────────────────────────

const STRIPE_APPEARANCE = {
  theme: 'stripe' as const,
  variables: {
    colorPrimary: '#4A0E6E',
    colorBackground: '#ffffff',
    colorText: '#1A1A2E',
    colorDanger: '#dc2626',
    fontFamily: 'Space Grotesk, system-ui, sans-serif',
    borderRadius: '12px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': {
      border: '1px solid #DDB8F5',
      boxShadow: 'none',
      padding: '12px 16px',
      fontSize: '14px',
    },
    '.Input:focus': {
      border: '1px solid #4A0E6E',
      boxShadow: '0 0 0 3px rgba(74,14,110,0.08)',
    },
    '.Label': {
      fontSize: '11px',
      fontWeight: '600',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: '#7C6B8A',
    },
  },
}

// ── Payment form (inner — has access to Stripe hooks) ─────────────────────────

function CheckoutForm({
  amount,
  vendorId,
}: {
  amount: string
  vendorId: string
}) {
  const stripe = useStripe()
  const elements = useElements()

  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')
  const [succeeded, setSucceeded] = useState(false)

  const displayAmount = parseFloat(amount || '0').toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setPaying(true)
    setPayError('')

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/vendors/${vendorId}/book/payment/success`,
      },
    })

    // confirmPayment only returns here on error — success redirects
    if (error) {
      setPayError(error.message ?? 'Payment failed. Please try again.')
      setPaying(false)
    } else {
      setSucceeded(true)
      setPaying(false)
    }
  }

  if (succeeded) {
    return (
      <div className="flex flex-col items-center text-center py-10">
        <div
          className="w-16 h-16 rounded-full bg-[#4A0E6E] flex items-center justify-center mb-6"
          style={{ boxShadow: '0 0 0 14px rgba(74,14,110,0.08)' }}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <path d="M6 14l6 6 10-10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2
          className="text-2xl font-bold text-[#1A1A2E] mb-2"
          style={{ fontFamily: 'var(--font-syne-pay)' }}
        >
          Payment confirmed.
        </h2>
        <p className="text-sm text-[#7C6B8A]" style={{ fontFamily: 'var(--font-space-pay)' }}>
          Your deposit was received. The vendor will be in touch shortly.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{ layout: 'tabs' }}
      />

      {payError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm leading-relaxed">
          {payError}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || paying}
        className="w-full py-4 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 hover:opacity-90 active:scale-[0.99]"
        style={{
          background: 'linear-gradient(135deg, #4A0E6E 0%, #6B1F9A 100%)',
          fontFamily: 'var(--font-syne-pay)',
        }}
      >
        {paying ? 'Processing...' : `Pay ${displayAmount}`}
      </button>

      {/* Trust line */}
      <div className="flex items-center justify-center gap-2 text-[#7C6B8A]">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
          <rect x="1" y="5" width="11" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M4 5V3.5a2.5 2.5 0 0 1 5 0V5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <span
          className="text-[11px]"
          style={{ fontFamily: 'var(--font-space-pay)' }}
        >
          Secured by Stripe. Your card details are never stored.
        </span>
      </div>
    </form>
  )
}

// ── Root client component ─────────────────────────────────────────────────────

interface Props {
  vendorId: string
  bookingId: string
  amount: string
  vendorName: string
}

export default function PaymentClient({ vendorId, bookingId, amount, vendorName }: Props) {
  const logoHref = useLogoHref()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [initError, setInitError] = useState('')

  const displayAmount = parseFloat(amount || '0').toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

  useEffect(() => {
    if (!bookingId || !amount) return

    async function createIntent() {
      try {
        const res = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId,
            amount: Number(amount),
            description: `Deposit for ${vendorName}`,
          }),
        })
        const data = await res.json()
        if (!res.ok || data.error) throw new Error(data.error ?? 'Could not initialise payment.')
        setClientSecret(data.clientSecret)
      } catch (err: unknown) {
        setInitError(err instanceof Error ? err.message : 'Something went wrong.')
      }
    }

    createIntent()
  }, [bookingId, amount, vendorName])

  // ── Loading skeleton ──
  if (!clientSecret && !initError) {
    return (
      <div
        className={`${syne.variable} ${spaceGrotesk.variable} min-h-screen bg-[#F8F4FC] animate-pulse`}
        style={{ fontFamily: 'var(--font-space-pay), system-ui, sans-serif' }}
      >
        <div className="h-16 bg-white border-b border-[#EDE5F7]" />
        <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-5">
            <div className="h-2.5 w-28 bg-[#DDB8F5] rounded" />
            <div className="h-8 w-1/2 bg-[#E8DFF5] rounded" />
            <div className="h-4 w-3/4 bg-[#EDE5F7] rounded" />
            <div className="h-48 bg-[#EDE5F7] rounded-xl" />
            <div className="h-12 bg-[#E8DFF5] rounded-xl" />
          </div>
          <div className="h-64 bg-white rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={`${syne.variable} ${spaceGrotesk.variable} min-h-screen bg-[#F8F4FC]`}
      style={{ fontFamily: 'var(--font-space-pay), system-ui, sans-serif' }}
    >
      {/* Nav */}
      <nav
        className="sticky top-0 z-30 bg-[#F8F4FC]/95 border-b border-[#EDE5F7]"
        style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-6">
          <Link
            href={logoHref}
            className="text-xl font-extrabold tracking-tight text-[#4A0E6E] hover:opacity-80 transition-opacity"
            style={{ fontFamily: 'var(--font-syne-pay)' }}
          >
            evnti.
          </Link>
          <Link
            href={`/vendors/${vendorId}/book`}
            className="flex items-center gap-1.5 text-sm text-[#7C6B8A] hover:text-[#4A0E6E] transition-colors"
            style={{ fontFamily: 'var(--font-space-pay)' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

          {/* ── LEFT: Payment form ── */}
          <div className="lg:col-span-2">
            <p
              className="text-[11px] font-semibold uppercase tracking-[4px] text-[#DDB8F5] mb-3"
              style={{ fontFamily: 'var(--font-space-pay)' }}
            >
              Secure Payment
            </p>
            <h1
              className="text-3xl font-bold text-[#1A1A2E] mb-2 leading-tight"
              style={{ fontFamily: 'var(--font-syne-pay)' }}
            >
              Pay deposit
            </h1>
            <p
              className="text-sm text-[#7C6B8A] leading-relaxed mb-8"
              style={{ fontFamily: 'var(--font-space-pay)' }}
            >
              Your card will be charged{' '}
              <span className="font-semibold text-[#1A1A2E]">{displayAmount}</span>.
              The remaining balance is paid directly to the vendor.
            </p>

            {initError ? (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm leading-relaxed">
                {initError}
              </div>
            ) : clientSecret ? (
              <Elements
                stripe={stripePromise}
                options={{ clientSecret, appearance: STRIPE_APPEARANCE }}
              >
                <CheckoutForm amount={amount} vendorId={vendorId} />
              </Elements>
            ) : null}
          </div>

          {/* ── RIGHT: Summary card ── */}
          <div className="lg:sticky lg:top-24">
            <div
              className="bg-white rounded-2xl p-6"
              style={{ boxShadow: '0 4px 24px rgba(74,14,110,0.1)' }}
            >
              <p
                className="text-[11px] font-semibold uppercase tracking-widest text-[#7C6B8A] mb-4"
                style={{ fontFamily: 'var(--font-space-pay)' }}
              >
                Booking summary
              </p>

              <h3
                className="text-base font-bold text-[#1A1A2E] mb-1"
                style={{ fontFamily: 'var(--font-syne-pay)' }}
              >
                {vendorName}
              </h3>

              <div className="h-px bg-[#EDE5F7] my-5" />

              {/* Deposit line */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-sm text-[#7C6B8A]"
                  style={{ fontFamily: 'var(--font-space-pay)' }}
                >
                  Deposit due today
                </span>
                <span
                  className="text-sm font-bold text-[#1A1A2E]"
                  style={{ fontFamily: 'var(--font-syne-pay)' }}
                >
                  {displayAmount}
                </span>
              </div>

              <div className="flex items-center justify-between mb-5">
                <span
                  className="text-sm text-[#7C6B8A]"
                  style={{ fontFamily: 'var(--font-space-pay)' }}
                >
                  Remaining balance
                </span>
                <span
                  className="text-sm text-[#7C6B8A]"
                  style={{ fontFamily: 'var(--font-space-pay)' }}
                >
                  Paid to vendor
                </span>
              </div>

              <div className="h-px bg-[#EDE5F7] mb-5" />

              {/* Booking ID */}
              <div className="flex items-start gap-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-0.5 flex-shrink-0" aria-hidden="true">
                  <rect x="1.5" y="2" width="11" height="10" rx="1.5" stroke="#DDB8F5" strokeWidth="1.3" />
                  <path d="M4 5.5h6M4 7.5h4" stroke="#DDB8F5" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <p
                  className="text-[11px] text-[#7C6B8A] break-all"
                  style={{ fontFamily: 'var(--font-space-pay)' }}
                >
                  Booking ref: <span className="text-[#4A0E6E] font-medium">{bookingId || '—'}</span>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
