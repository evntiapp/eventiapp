'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Syne, Space_Grotesk } from 'next/font/google'
import { getSupabaseClient } from '@/lib/supabase'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne-apply',
})
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-apply',
})

const TOTAL_STEPS = 4

const CATEGORIES = [
  'Venue',
  'Photography',
  'Catering',
  'DJ / Music',
  'Florals',
  'Cakes & Desserts',
  'Beauty & Hair',
  'Videography',
  'Decor',
  'Lighting',
  'Photo Booth',
  'Other',
]

interface FormData {
  businessName: string
  firstName: string
  lastName: string
  businessEmail: string
  phone: string
  city: string
  category: string
  description: string
  pricingFrom: string
  pricingTo: string
  yearsInBusiness: string
  portfolioUrl: string
  referralSource: string
  hasInsurance: string
  additionalNotes: string
}

const EMPTY_FORM: FormData = {
  businessName: '',
  firstName: '',
  lastName: '',
  businessEmail: '',
  phone: '',
  city: '',
  category: '',
  description: '',
  pricingFrom: '',
  pricingTo: '',
  yearsInBusiness: '',
  portfolioUrl: '',
  referralSource: '',
  hasInsurance: '',
  additionalNotes: '',
}

export default function VendorApplyPage() {
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)

  function update(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const progressPct = (step / TOTAL_STEPS) * 100

  async function handleSubmit() {
    setLoading(true)
    setSubmitError('')
    try {
      const supabase = getSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { error: insertError } = await supabase.from('vendor_profiles').insert({
        user_id: user?.id ?? null,
        business_name: form.businessName,
        contact_name: `${form.firstName} ${form.lastName}`.trim(),
        business_email: form.businessEmail,
        phone: form.phone,
        location: form.city,
        category: form.category,
        description: form.description,
        pricing_from: form.pricingFrom ? parseInt(form.pricingFrom, 10) : null,
        pricing_to: form.pricingTo ? parseInt(form.pricingTo, 10) : null,
        years_in_business: form.yearsInBusiness,
        portfolio_url: form.portfolioUrl || null,
        referral_source: form.referralSource,
        has_insurance: form.hasInsurance,
        additional_notes: form.additionalNotes || null,
        is_verified: false,
        application_status: 'pending',
      })

      if (insertError) throw insertError
      setSubmitted(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setSubmitError(message)
    } finally {
      setLoading(false)
    }
  }

  const inputCls =
    'w-full bg-white border border-[#DDB8F5] rounded-xl px-4 py-3 text-sm text-[#1A1A2E] outline-none focus:border-[#4A0E6E] focus:ring-2 focus:ring-[#4A0E6E]/10 placeholder-[#C0ACD4] transition-all appearance-none'
  const labelCls =
    'block text-[11px] font-semibold uppercase tracking-widest text-[#7C6B8A] mb-1.5'

  return (
    <div
      className={`${syne.variable} ${spaceGrotesk.variable} min-h-screen flex flex-col lg:flex-row`}
      style={{ fontFamily: 'var(--font-space-apply), system-ui, sans-serif' }}
    >
      {/* ── LEFT PANEL ── */}
      <div className="relative lg:w-[45%] lg:fixed lg:inset-y-0 lg:left-0 h-56 sm:h-72 lg:h-auto overflow-hidden flex-shrink-0">
        <Image
          src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=80"
          alt="Elegant event reception setup"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(26,26,46,0.75) 0%, rgba(74,14,110,0.45) 45%, rgba(26,26,46,0.92) 100%)',
          }}
        />

        {/* Panel content */}
        <div className="relative z-10 h-full flex flex-col p-8 lg:p-12">
          {/* Logo */}
          <div
            className="text-white text-2xl font-extrabold tracking-tight"
            style={{ fontFamily: 'var(--font-syne-apply)' }}
          >
            evnti.
          </div>

          {/* Center content — desktop only */}
          <div className="hidden lg:flex flex-col justify-center flex-1 max-w-sm">
            <p
              className="text-[#DDB8F5] text-[11px] font-semibold uppercase tracking-[4px] mb-5"
              style={{ fontFamily: 'var(--font-space-apply)' }}
            >
              Join the Marketplace
            </p>
            <h1
              className="text-5xl xl:text-6xl font-bold text-white leading-[1.08] mb-5"
              style={{ fontFamily: 'var(--font-syne-apply)' }}
            >
              Grow your
              <br />
              business.
            </h1>
            <p
              className="text-white/70 text-base leading-relaxed mb-10"
              style={{ fontFamily: 'var(--font-space-apply)' }}
            >
              Connect with clients planning real events in Houston. Apply in under 5 minutes.
            </p>

            {/* Trust stat pills */}
            <div className="flex flex-wrap gap-2.5">
              {['500+ clients', 'No monthly fees', 'Free to apply'].map(stat => (
                <span
                  key={stat}
                  className="text-white text-xs font-medium px-4 py-2 rounded-full"
                  style={{
                    background: 'rgba(221,184,245,0.18)',
                    border: '1px solid rgba(221,184,245,0.35)',
                    fontFamily: 'var(--font-space-apply)',
                  }}
                >
                  {stat}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 lg:ml-[45%] min-h-screen bg-[#F8F4FC]">
        <div className="max-w-lg mx-auto px-6 py-10 lg:py-16">
          {submitted ? (
            /* ── SUCCESS STATE ── */
            <div className="flex flex-col items-center text-center py-16">
              <div
                className="w-20 h-20 rounded-full bg-[#4A0E6E] flex items-center justify-center mb-8"
                style={{ boxShadow: '0 0 0 16px rgba(74,14,110,0.08)' }}
              >
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
                  <path
                    d="M8 18L15 25L28 11"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h2
                className="text-3xl font-bold text-[#1A1A2E] mb-3"
                style={{ fontFamily: 'var(--font-syne-apply)' }}
              >
                Application received.
              </h2>
              <p
                className="text-[#7C6B8A] text-base leading-relaxed mb-10 max-w-sm"
                style={{ fontFamily: 'var(--font-space-apply)' }}
              >
                Nabilah and the evnti team will review your profile within 3–5 business days.
              </p>
              <Link
                href="/"
                className="text-[#4A0E6E] text-sm font-semibold underline underline-offset-4 hover:text-[#6B1F9A] transition-colors"
                style={{ fontFamily: 'var(--font-space-apply)' }}
              >
                Back to home
              </Link>
            </div>
          ) : (
            <>
              {/* Step dots + progress bar */}
              <div className="mb-8">
                <div className="flex justify-center gap-2.5 mb-3">
                  {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                    <div
                      key={i}
                      className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                      style={{
                        background: i + 1 <= step ? '#4A0E6E' : '#DDB8F5',
                        transform: i + 1 === step ? 'scale(1.25)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
                <div className="h-[3px] bg-[#DDB8F5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4A0E6E] rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p
                  className="text-[11px] text-[#7C6B8A] mt-2"
                  style={{ fontFamily: 'var(--font-space-apply)' }}
                >
                  Step {step} of {TOTAL_STEPS}
                </p>
              </div>

              {/* ── STEP 1: Business basics ── */}
              {step === 1 && (
                <div>
                  <h2
                    className="text-2xl font-bold text-[#1A1A2E] mb-1"
                    style={{ fontFamily: 'var(--font-syne-apply)' }}
                  >
                    Business basics
                  </h2>
                  <p className="text-[#7C6B8A] text-sm mb-8">Tell us about your business.</p>

                  <div className="space-y-5">
                    <div>
                      <label className={labelCls}>Business name</label>
                      <input
                        className={inputCls}
                        placeholder="e.g. Bloom & Co Florals"
                        value={form.businessName}
                        onChange={e => update('businessName', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Contact name</label>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          className={inputCls}
                          placeholder="First name"
                          value={form.firstName}
                          onChange={e => update('firstName', e.target.value)}
                        />
                        <input
                          className={inputCls}
                          placeholder="Last name"
                          value={form.lastName}
                          onChange={e => update('lastName', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Business email</label>
                      <input
                        className={inputCls}
                        type="email"
                        placeholder="you@yourbusiness.com"
                        value={form.businessEmail}
                        onChange={e => update('businessEmail', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Phone</label>
                      <input
                        className={inputCls}
                        type="tel"
                        placeholder="+1 (713) 000-0000"
                        value={form.phone}
                        onChange={e => update('phone', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>City</label>
                      <input
                        className={inputCls}
                        placeholder="Houston, TX"
                        value={form.city}
                        onChange={e => update('city', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 2: Category ── */}
              {step === 2 && (
                <div>
                  <h2
                    className="text-2xl font-bold text-[#1A1A2E] mb-1"
                    style={{ fontFamily: 'var(--font-syne-apply)' }}
                  >
                    What do you offer?
                  </h2>
                  <p className="text-[#7C6B8A] text-sm mb-8">
                    Choose the category that best describes your services.
                  </p>

                  <div className="grid grid-cols-3 gap-2.5">
                    {CATEGORIES.map(cat => {
                      const active = form.category === cat
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => update('category', cat)}
                          className="px-3 py-3.5 rounded-xl text-xs font-semibold transition-all duration-200 border text-center leading-snug"
                          style={{
                            background: active ? '#4A0E6E' : 'white',
                            color: active ? 'white' : '#7C6B8A',
                            borderColor: active ? '#4A0E6E' : '#DDB8F5',
                            fontFamily: 'var(--font-space-apply)',
                            boxShadow: active
                              ? '0 4px 12px rgba(74,14,110,0.25)'
                              : '0 1px 4px rgba(74,14,110,0.06)',
                          }}
                        >
                          {cat}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ── STEP 3: Services & pricing ── */}
              {step === 3 && (
                <div>
                  <h2
                    className="text-2xl font-bold text-[#1A1A2E] mb-1"
                    style={{ fontFamily: 'var(--font-syne-apply)' }}
                  >
                    Services &amp; pricing
                  </h2>
                  <p className="text-[#7C6B8A] text-sm mb-8">
                    Help clients understand what you offer and what to expect.
                  </p>

                  <div className="space-y-5">
                    <div>
                      <label className={labelCls}>Service description</label>
                      <textarea
                        className={`${inputCls} resize-none`}
                        rows={4}
                        placeholder="Describe your services, style, and what makes you stand out..."
                        value={form.description}
                        onChange={e => update('description', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Starting price</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C6B8A] text-sm select-none">
                            $
                          </span>
                          <input
                            className={`${inputCls} pl-7`}
                            type="number"
                            min="0"
                            placeholder="From"
                            value={form.pricingFrom}
                            onChange={e => update('pricingFrom', e.target.value)}
                          />
                        </div>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C6B8A] text-sm select-none">
                            $
                          </span>
                          <input
                            className={`${inputCls} pl-7`}
                            type="number"
                            min="0"
                            placeholder="To"
                            value={form.pricingTo}
                            onChange={e => update('pricingTo', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Years in business</label>
                      <select
                        className={inputCls}
                        value={form.yearsInBusiness}
                        onChange={e => update('yearsInBusiness', e.target.value)}
                      >
                        <option value="">Select years</option>
                        <option value="less_than_1">Less than 1 year</option>
                        <option value="1_2">1–2 years</option>
                        <option value="3_5">3–5 years</option>
                        <option value="6_10">6–10 years</option>
                        <option value="10_plus">10+ years</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>
                        Portfolio URL{' '}
                        <span className="normal-case font-normal tracking-normal">(optional)</span>
                      </label>
                      <input
                        className={inputCls}
                        type="url"
                        placeholder="https://yourwebsite.com"
                        value={form.portfolioUrl}
                        onChange={e => update('portfolioUrl', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 4: Final details ── */}
              {step === 4 && (
                <div>
                  <h2
                    className="text-2xl font-bold text-[#1A1A2E] mb-1"
                    style={{ fontFamily: 'var(--font-syne-apply)' }}
                  >
                    Final details
                  </h2>
                  <p className="text-[#7C6B8A] text-sm mb-8">
                    A few last questions before we review your application.
                  </p>

                  <div className="space-y-5">
                    <div>
                      <label className={labelCls}>How did you hear about us?</label>
                      <select
                        className={inputCls}
                        value={form.referralSource}
                        onChange={e => update('referralSource', e.target.value)}
                      >
                        <option value="">Select an option</option>
                        <option value="instagram">Instagram</option>
                        <option value="tiktok">TikTok</option>
                        <option value="google">Google Search</option>
                        <option value="friend">Friend or colleague</option>
                        <option value="event">Event or conference</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>Do you have business insurance?</label>
                      <select
                        className={inputCls}
                        value={form.hasInsurance}
                        onChange={e => update('hasInsurance', e.target.value)}
                      >
                        <option value="">Select an option</option>
                        <option value="yes">Yes, I have general liability insurance</option>
                        <option value="no">No, not currently</option>
                        <option value="in_progress">In the process of getting it</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>
                        Anything else?{' '}
                        <span className="normal-case font-normal tracking-normal">(optional)</span>
                      </label>
                      <textarea
                        className={`${inputCls} resize-none`}
                        rows={4}
                        placeholder="Share anything you'd like us to know about your business..."
                        value={form.additionalNotes}
                        onChange={e => update('additionalNotes', e.target.value)}
                      />
                    </div>
                  </div>

                  {submitError && (
                    <div className="mt-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm leading-relaxed">
                      {submitError}
                    </div>
                  )}

                  <p
                    className="text-xs text-[#7C6B8A] mt-7 text-center leading-relaxed"
                    style={{ fontFamily: 'var(--font-space-apply)' }}
                  >
                    By submitting you agree to our{' '}
                    <Link
                      href="/vendor-terms"
                      className="underline underline-offset-2 text-[#4A0E6E] hover:text-[#6B1F9A] transition-colors"
                    >
                      Vendor Terms
                    </Link>
                  </p>
                </div>
              )}

              {/* ── Navigation ── */}
              <div
                className={`mt-10 flex items-center gap-4 ${step === 1 ? 'justify-end' : 'justify-between'}`}
              >
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(s => s - 1)}
                    className="px-6 py-3 rounded-xl text-sm font-semibold text-[#4A0E6E] border border-[#DDB8F5] bg-transparent hover:bg-[#F3E8FF] transition-colors"
                    style={{ fontFamily: 'var(--font-space-apply)' }}
                  >
                    Back
                  </button>
                )}

                {step < TOTAL_STEPS ? (
                  <button
                    type="button"
                    onClick={() => setStep(s => s + 1)}
                    className="px-8 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: '#4A0E6E', fontFamily: 'var(--font-space-apply)' }}
                  >
                    Continue &rarr;
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-4 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 hover:opacity-90"
                    style={{
                      background: 'linear-gradient(135deg, #4A0E6E 0%, #6B1F9A 100%)',
                      fontFamily: 'var(--font-syne-apply)',
                    }}
                  >
                    {loading ? 'Submitting...' : 'Submit application'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
