'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Syne, Space_Grotesk } from 'next/font/google'
import { getSupabaseClient } from '@/lib/supabase'
import { useLogoHref } from '@/app/hooks/useLogoHref'
import type { User } from '@supabase/supabase-js'
import { ArrowLeft } from 'lucide-react'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne-vp',
})
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-vp',
})

// ── Types ─────────────────────────────────────────────────────────────────────

interface VendorProfile {
  id: string
  business_name: string
  contact_name: string
  phone: string
  location: string
  category: string
  description: string | null
  pricing_from: number | null
  pricing_to: number | null
  years_in_business: string | null
  portfolio_url: string | null
  is_verified: boolean
  application_status: string
  rating_average?: number | null
  review_count?: number | null
  photos?: string[] | null
  services_offered?: string[] | null
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_IMAGES: Record<string, string> = {
  Venue: '/images/venues.jpg',
  Photography: '/images/photographers.jpg',
  Catering: '/images/catering.jpg',
  'DJ / Music': '/images/music.jpg',
  Florals: '/images/florists.jpg',
  'Cakes & Desserts': '/images/cakes.jpg',
  'Beauty & Hair': '/images/beauty.jpg',
}

const YEARS_LABELS: Record<string, string> = {
  less_than_1: 'Less than 1 year',
  '1_2': '1–2 years',
  '3_5': '3–5 years',
  '6_10': '6–10 years',
  '10_plus': '10+ years',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function heroImage(category: string): string {
  return CATEGORY_IMAGES[category] ?? '/images/feature.jpg'
}

function formatPrice(from: number | null, to: number | null): string {
  if (!from && !to) return 'Price on request'
  if (from && to) return `$${from.toLocaleString()} – $${to.toLocaleString()}`
  if (from) return `From $${from.toLocaleString()}`
  return `Up to $${to!.toLocaleString()}`
}

// ── Star rating ───────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-[2px]" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.round(rating)
        return (
          <svg key={i} width="12" height="12" viewBox="0 0 10 10" aria-hidden="true">
            <path
              d="M5 1l1.12 2.27 2.5.36-1.81 1.76.43 2.49L5 6.77l-2.24 1.11.43-2.49L1.38 3.63l2.5-.36z"
              fill={filled ? '#D4AC0D' : 'none'}
              stroke={filled ? '#D4AC0D' : '#C0ACD4'}
              strokeWidth="0.6"
            />
          </svg>
        )
      })}
    </span>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8F4FC] animate-pulse">
      <div className="h-16 bg-white border-b border-[#EDE5F7]" />
      <div className="h-[380px] bg-[#E8DFF5]" />
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-5 w-1/4 bg-[#DDB8F5] rounded" />
          <div className="space-y-2">
            <div className="h-3 bg-[#EDE5F7] rounded" />
            <div className="h-3 bg-[#EDE5F7] rounded w-5/6" />
            <div className="h-3 bg-[#EDE5F7] rounded w-4/6" />
          </div>
          <div className="h-px bg-[#DDB8F5]" />
          <div className="h-5 w-1/4 bg-[#DDB8F5] rounded" />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 bg-[#E8DFF5] rounded-2xl" />
            ))}
          </div>
        </div>
        <div className="h-80 bg-white rounded-2xl" />
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function VendorProfilePage() {
  const logoHref = useLogoHref()
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [vendor, setVendor] = useState<VendorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if (!id) return

    const supabase = getSupabaseClient()

    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
      const user = data.user
      setIsLoggedIn(!!user)
    })

    async function fetchVendor() {
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        setNotFound(true)
      } else {
        setVendor(data as VendorProfile)
      }
      setLoading(false)
    }

    fetchVendor()
  }, [id])

  function handleMessageVendor() {
    if (!isLoggedIn) {
      router.push(`/auth/signin?redirect=/vendors/${id}`)
      return
    }
    router.push(`/messages?vendor_id=${id}`)
  }

  if (loading) return <ProfileSkeleton />

  // ── 404 ──
  if (notFound || !vendor) {
    return (
      <div
        className={`${syne.variable} ${spaceGrotesk.variable} min-h-screen bg-[#F8F4FC] flex flex-col`}
        style={{ fontFamily: 'var(--font-space-vp), system-ui, sans-serif' }}
      >
        <nav className="sticky top-0 z-30 bg-[#F8F4FC] border-b border-[#EDE5F7] px-6 h-16 flex items-center gap-6">
          <Link
            href={logoHref}
            className="text-xl font-extrabold tracking-tight text-[#4A0E6E]"
            style={{ fontFamily: 'var(--font-syne-vp)' }}
          >
            evnti.
          </Link>
          <Link href="/vendors" className="text-sm text-[#7C6B8A] hover:text-[#4A0E6E] transition-colors">
            Back to vendors
          </Link>
        </nav>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
          <h1
            className="text-2xl font-bold text-[#1A1A2E] mb-3"
            style={{ fontFamily: 'var(--font-syne-vp)' }}
          >
            Vendor not found.
          </h1>
          <p className="text-sm text-[#7C6B8A] mb-8">
            This profile may have been removed or the link is incorrect.
          </p>
          <Link
            href="/vendors"
            className="px-6 py-2.5 rounded-full text-sm font-semibold text-white"
            style={{ background: '#4A0E6E', fontFamily: 'var(--font-space-vp)' }}
          >
            Browse all vendors
          </Link>
        </div>
      </div>
    )
  }

  const imgSrc = heroImage(vendor.category)
  const priceLabel = formatPrice(vendor.pricing_from, vendor.pricing_to)
  const yearsLabel = vendor.years_in_business
    ? YEARS_LABELS[vendor.years_in_business] ?? vendor.years_in_business
    : null

  return (
    <div
      className={`${syne.variable} ${spaceGrotesk.variable} min-h-screen bg-[#F8F4FC]`}
      style={{ fontFamily: 'var(--font-space-vp), system-ui, sans-serif' }}
    >
      {/* ── TOP NAV ── */}
      <nav className="sticky top-0 z-30 bg-[#F8F4FC]/95 border-b border-[#EDE5F7]"
        style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-6">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#F3E8FF] transition-colors flex-shrink-0"
          >
            <ArrowLeft size={18} color="#DDB8F5" />
          </button>
          <Link
            href={logoHref}
            className="text-xl font-extrabold tracking-tight text-[#4A0E6E] hover:opacity-80 transition-opacity"
            style={{ fontFamily: 'var(--font-syne-vp)' }}
          >
            evnti.
          </Link>
          <Link
            href="/vendors"
            className="flex items-center gap-1.5 text-sm text-[#7C6B8A] hover:text-[#4A0E6E] transition-colors"
            style={{ fontFamily: 'var(--font-space-vp)' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to vendors
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="relative h-[380px] w-full overflow-hidden">
        <Image
          src={imgSrc}
          alt={vendor.business_name}
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        {/* Bottom gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(26,26,46,0.92) 0%, rgba(26,26,46,0.4) 50%, rgba(26,26,46,0.1) 100%)',
          }}
        />

        {/* Overlaid content */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 max-w-6xl mx-auto">
          <div className="flex items-end justify-between">
            <div>
              {/* Badges */}
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(221,184,245,0.25)', color: '#DDB8F5', fontFamily: 'var(--font-space-vp)', border: '1px solid rgba(221,184,245,0.4)' }}
                >
                  {vendor.category}
                </span>
                {vendor.is_verified && (
                  <span
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: '#0D9B6A', fontFamily: 'var(--font-syne-vp)' }}
                  >
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
                      <path d="M1.5 4.5l2 2L7.5 2" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Verified
                  </span>
                )}
              </div>
              {/* Vendor name */}
              <h1
                className="text-3xl lg:text-4xl font-bold text-white leading-tight"
                style={{ fontFamily: 'var(--font-syne-vp)' }}
              >
                {vendor.business_name}
              </h1>
              {vendor.location && (
                <p className="text-white/60 text-sm mt-1" style={{ fontFamily: 'var(--font-space-vp)' }}>
                  {vendor.location}
                </p>
              )}
            </div>

            {/* Rating badge — desktop */}
            {vendor.rating_average != null && (
              <div
                className="hidden lg:flex flex-col items-center px-5 py-3 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                <Stars rating={vendor.rating_average} />
                <span className="text-white text-sm font-bold mt-1" style={{ fontFamily: 'var(--font-syne-vp)' }}>
                  {vendor.rating_average.toFixed(1)}
                </span>
                {vendor.review_count != null && (
                  <span className="text-white/50 text-xs">{vendor.review_count} reviews</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── PROFILE BODY ── */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2 space-y-10">

            {/* About */}
            <section>
              <h2
                className="text-lg font-bold text-[#1A1A2E] mb-4"
                style={{ fontFamily: 'var(--font-syne-vp)' }}
              >
                About
              </h2>
              {vendor.description ? (
                <p
                  className="text-sm text-[#1A1A2E]/75 leading-relaxed"
                  style={{ fontFamily: 'var(--font-space-vp)' }}
                >
                  {vendor.description}
                </p>
              ) : (
                <p className="text-sm text-[#7C6B8A]" style={{ fontFamily: 'var(--font-space-vp)' }}>
                  No description provided yet.
                </p>
              )}
            </section>

            <div className="h-px bg-[#DDB8F5]" />

            {/* Pricing */}
            <section>
              <h2
                className="text-lg font-bold text-[#1A1A2E] mb-4"
                style={{ fontFamily: 'var(--font-syne-vp)' }}
              >
                Pricing
              </h2>
              <div className="flex flex-wrap gap-4">
                <div
                  className="px-5 py-4 rounded-2xl"
                  style={{ background: 'white', boxShadow: '0 2px 10px rgba(74,14,110,0.08)' }}
                >
                  <p className="text-xs text-[#7C6B8A] mb-1 uppercase tracking-widest font-semibold" style={{ fontFamily: 'var(--font-space-vp)' }}>
                    Starting price
                  </p>
                  <p
                    className="text-xl font-bold text-[#4A0E6E]"
                    style={{ fontFamily: 'var(--font-syne-vp)' }}
                  >
                    {priceLabel}
                  </p>
                </div>

                {yearsLabel && (
                  <div
                    className="px-5 py-4 rounded-2xl"
                    style={{ background: 'white', boxShadow: '0 2px 10px rgba(74,14,110,0.08)' }}
                  >
                    <p className="text-xs text-[#7C6B8A] mb-1 uppercase tracking-widest font-semibold" style={{ fontFamily: 'var(--font-space-vp)' }}>
                      Experience
                    </p>
                    <p
                      className="text-xl font-bold text-[#1A1A2E]"
                      style={{ fontFamily: 'var(--font-syne-vp)' }}
                    >
                      {yearsLabel}
                    </p>
                  </div>
                )}
              </div>
            </section>

            <div className="h-px bg-[#DDB8F5]" />

            {/* Portfolio */}
            <section>
              <h2
                className="text-lg font-bold text-[#1A1A2E] mb-4"
                style={{ fontFamily: 'var(--font-syne-vp)' }}
              >
                Portfolio
              </h2>
              {vendor.portfolio_url ? (
                <a
                  href={vendor.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#4A0E6E] underline underline-offset-4 hover:opacity-80 transition-opacity mb-4"
                  style={{ fontFamily: 'var(--font-space-vp)' }}
                >
                  View external portfolio
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 10L10 2M10 2H5M10 2v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              ) : null}

              {vendor.photos && vendor.photos.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {vendor.photos.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative h-40 rounded-2xl overflow-hidden block"
                      style={{ background: '#EDE5F7' }}
                      aria-label={`Portfolio photo ${i + 1}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`${vendor.business_name} portfolio ${i + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: 'rgba(74,14,110,0.35)' }}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                          <path d="M3 17L17 3M17 3H9M17 3v8" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-40 rounded-2xl flex items-center justify-center"
                      style={{ background: '#EDE5F7', border: '1.5px dashed #DDB8F5' }}
                    >
                      <span
                        className="text-xs text-[#7C6B8A] text-center px-2 leading-relaxed"
                        style={{ fontFamily: 'var(--font-space-vp)' }}
                      >
                        Photos<br />coming soon
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Services offered */}
            {vendor.services_offered && vendor.services_offered.length > 0 && (
              <>
                <div className="h-px bg-[#DDB8F5]" />
                <section>
                  <h2
                    className="text-lg font-bold text-[#1A1A2E] mb-4"
                    style={{ fontFamily: 'var(--font-syne-vp)' }}
                  >
                    Services
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {vendor.services_offered.map(svc => (
                      <span
                        key={svc}
                        className="px-3.5 py-2 rounded-full text-xs font-semibold"
                        style={{ background: '#F3E8FF', color: '#4A0E6E', fontFamily: 'var(--font-space-vp)', border: '1px solid #DDB8F5' }}
                      >
                        {svc}
                      </span>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>

          {/* ── RIGHT COLUMN (sticky card) ── */}
          <div className="lg:sticky lg:top-24">
            <div
              className="bg-white rounded-2xl p-6"
              style={{ boxShadow: '0 4px 24px rgba(74,14,110,0.1)' }}
            >
              <h3
                className="text-base font-bold text-[#1A1A2E] mb-1"
                style={{ fontFamily: 'var(--font-syne-vp)' }}
              >
                Book {vendor.business_name}
              </h3>

              {/* Price */}
              <p
                className="text-2xl font-bold text-[#4A0E6E] mb-2"
                style={{ fontFamily: 'var(--font-syne-vp)' }}
              >
                {priceLabel}
              </p>

              {/* Rating */}
              {vendor.rating_average != null && (
                <div className="flex items-center gap-2 mb-5">
                  <Stars rating={vendor.rating_average} />
                  <span className="text-sm text-[#7C6B8A]" style={{ fontFamily: 'var(--font-space-vp)' }}>
                    {vendor.rating_average.toFixed(1)}
                    {vendor.review_count != null ? ` (${vendor.review_count} reviews)` : ''}
                  </span>
                </div>
              )}

              <div className="space-y-3 mb-4">
                {/* Request booking */}
                <Link
                  href={`/vendors/${vendor.id}/book`}
                  className="block w-full py-3.5 rounded-xl text-sm font-bold text-white text-center transition-all hover:opacity-90"
                  style={{
                    background: 'linear-gradient(135deg, #4A0E6E 0%, #6B1F9A 100%)',
                    fontFamily: 'var(--font-syne-vp)',
                  }}
                >
                  Request booking
                </Link>

                {/* Message vendor */}
                <button
                  type="button"
                  onClick={handleMessageVendor}
                  className="w-full py-3.5 rounded-xl text-sm font-semibold border border-[#4A0E6E] text-[#4A0E6E] transition-colors hover:bg-[#F3E8FF]"
                  style={{ fontFamily: 'var(--font-space-vp)' }}
                >
                  Message vendor
                </button>
              </div>

              <p
                className="text-center text-xs text-[#7C6B8A] mb-5"
                style={{ fontFamily: 'var(--font-space-vp)' }}
              >
                Free to inquire. No commitment.
              </p>

              <div className="h-px bg-[#EDE5F7] mb-5" />

              {/* Details */}
              <ul className="space-y-3">
                {vendor.location && (
                  <li className="flex items-start gap-3">
                    <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M7 1.5C5.07 1.5 3.5 3.07 3.5 5c0 2.625 3.5 7 3.5 7s3.5-4.375 3.5-7c0-1.93-1.57-3.5-3.5-3.5z" stroke="#7C6B8A" strokeWidth="1.2" />
                      <circle cx="7" cy="5" r="1" fill="#7C6B8A" />
                    </svg>
                    <span className="text-sm text-[#1A1A2E]/75" style={{ fontFamily: 'var(--font-space-vp)' }}>
                      {vendor.location}
                    </span>
                  </li>
                )}

                <li className="flex items-start gap-3">
                  <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <rect x="2" y="1.5" width="10" height="11" rx="2" stroke="#7C6B8A" strokeWidth="1.2" />
                    <path d="M4.5 5h5M4.5 7.5h3" stroke="#7C6B8A" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  <span className="text-sm text-[#1A1A2E]/75" style={{ fontFamily: 'var(--font-space-vp)' }}>
                    {vendor.category}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
