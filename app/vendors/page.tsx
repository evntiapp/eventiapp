'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Syne, Space_Grotesk } from 'next/font/google'
import { MapPin } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase'
import { useLogoHref } from '@/app/hooks/useLogoHref'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne-vl',
})
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-vl',
})

// ── Types ─────────────────────────────────────────────────────────────────────

interface VendorProfile {
  id: string
  business_name: string
  location: string
  category: string
  description: string | null
  pricing_from: number | null
  pricing_to: number | null
  is_verified: boolean
  application_status: string
  rating_average?: number | null
  review_count?: number | null
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_PILLS = [
  'All',
  'Venues',
  'Photography',
  'Catering',
  'DJ / Music',
  'Florals',
  'Cakes & Desserts',
  'Beauty & Hair',
  'Videography',
  'Decor',
  'Photo Booth',
]

// Maps pill label → value stored in vendor_profiles.category
const PILL_TO_CATEGORY: Record<string, string> = {
  Venues: 'Venue',
  Photography: 'Photography',
  Catering: 'Catering',
  'DJ / Music': 'DJ / Music',
  Florals: 'Florals',
  'Cakes & Desserts': 'Cakes & Desserts',
  'Beauty & Hair': 'Beauty & Hair',
  Videography: 'Videography',
  Decor: 'Decor',
  'Photo Booth': 'Photo Booth',
}

const CATEGORY_IMAGES: Record<string, string> = {
  Venue: '/images/venues.jpg',
  Photography: '/images/photographers.jpg',
  Catering: '/images/catering.jpg',
  'DJ / Music': '/images/music.jpg',
  Florals: '/images/florists.jpg',
  'Cakes & Desserts': '/images/cakes.jpg',
  'Beauty & Hair': '/images/beauty.jpg',
}

const BUDGET_OPTIONS = [
  { label: 'Budget', min: null, max: null },
  { label: 'Under $500', min: null, max: 500 },
  { label: '$500 – $1,500', min: 500, max: 1500 },
  { label: '$1,500 – $5,000', min: 1500, max: 5000 },
  { label: '$5,000+', min: 5000, max: null },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function categoryImage(category: string): string {
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
          <svg key={i} width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
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

// ── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(74,14,110,0.06)' }}>
      <div className="h-48 bg-[#E8DFF5] animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-1/3 bg-[#DDB8F5] rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-[#E8DFF5] rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-[#EEE8F8] rounded animate-pulse" />
        <div className="h-8 bg-[#F3E8FF] rounded-xl animate-pulse mt-2" />
      </div>
    </div>
  )
}

// ── Vendor card ───────────────────────────────────────────────────────────────

function VendorCard({ vendor }: { vendor: VendorProfile }) {
  const [imgError, setImgError] = useState(false)
  const imgSrc = imgError ? '/images/feature.jpg' : categoryImage(vendor.category)

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5"
      style={{ boxShadow: '0 2px 12px rgba(74,14,110,0.08)' }}
    >
      {/* Image */}
      <div className="relative h-48 flex-shrink-0 overflow-hidden">
        <Image
          src={imgSrc}
          alt={vendor.business_name}
          fill
          className="object-cover"
          onError={() => setImgError(true)}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Verified badge */}
        <div
          className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold text-white"
          style={{ background: '#0D9B6A', fontFamily: 'var(--font-syne-vl)' }}
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
            <path d="M1.5 4l1.8 1.8L6.5 2" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Verified
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category pill */}
        <span
          className="self-start px-2.5 py-1 rounded-full text-[10px] font-semibold mb-2"
          style={{ background: '#F3E8FF', color: '#4A0E6E', fontFamily: 'var(--font-space-vl)' }}
        >
          {vendor.category}
        </span>

        {/* Name */}
        <h3
          className="text-base font-bold text-[#1A1A2E] mb-1 leading-snug"
          style={{ fontFamily: 'var(--font-syne-vl)' }}
        >
          {vendor.business_name}
        </h3>

        {/* Location */}
        <p className="text-xs text-[#7C6B8A] mb-2" style={{ fontFamily: 'var(--font-space-vl)' }}>
          {vendor.location || 'Houston, TX'}
        </p>

        {/* Rating */}
        {vendor.rating_average != null && (
          <div className="flex items-center gap-1.5 mb-2">
            <Stars rating={vendor.rating_average} />
            <span className="text-xs text-[#7C6B8A]" style={{ fontFamily: 'var(--font-space-vl)' }}>
              {vendor.rating_average.toFixed(1)}
              {vendor.review_count ? ` (${vendor.review_count})` : ''}
            </span>
          </div>
        )}

        {/* Pricing */}
        <p
          className="text-sm font-bold text-[#4A0E6E] mb-3"
          style={{ fontFamily: 'var(--font-syne-vl)' }}
        >
          {formatPrice(vendor.pricing_from, vendor.pricing_to)}
        </p>

        {/* Description */}
        {vendor.description && (
          <p
            className="text-xs text-[#7C6B8A] leading-relaxed mb-4 flex-1"
            style={{
              fontFamily: 'var(--font-space-vl)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {vendor.description}
          </p>
        )}

        {/* CTA */}
        <Link
          href={`/vendors/${vendor.id}`}
          className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold border transition-colors duration-150 mt-auto"
          style={{
            borderColor: '#4A0E6E',
            color: '#4A0E6E',
            fontFamily: 'var(--font-space-vl)',
          }}
          onMouseOver={e => {
            ;(e.currentTarget as HTMLAnchorElement).style.background = '#4A0E6E'
            ;(e.currentTarget as HTMLAnchorElement).style.color = 'white'
          }}
          onMouseOut={e => {
            ;(e.currentTarget as HTMLAnchorElement).style.background = 'transparent'
            ;(e.currentTarget as HTMLAnchorElement).style.color = '#4A0E6E'
          }}
        >
          View profile
        </Link>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function VendorsPage() {
  const logoHref = useLogoHref()
  const [vendors, setVendors] = useState<VendorProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeBudget, setActiveBudget] = useState('Budget')
  const [zipCode, setZipCode] = useState('')

  // Fetch approved & verified vendors on mount
  useEffect(() => {
    async function fetchVendors() {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('application_status', 'approved')
        .eq('is_verified', true)
        .order('business_name', { ascending: true })

      if (error) {
        setFetchError(error.message)
      } else {
        setVendors(data ?? [])
      }
      setLoading(false)
    }
    fetchVendors()
  }, [])

  // Client-side filtering
  const filtered = useMemo(() => {
    const budget = BUDGET_OPTIONS.find(b => b.label === activeBudget)
    const categoryValue = PILL_TO_CATEGORY[activeCategory]
    const q = search.trim().toLowerCase()
    const zip = zipCode.trim()

    return vendors.filter(v => {
      // Category filter
      if (activeCategory !== 'All' && v.category !== categoryValue) return false

      // Budget filter
      if (budget && (budget.min !== null || budget.max !== null)) {
        const pricingFrom = v.pricing_from ?? 0
        if (budget.max !== null && pricingFrom > budget.max) return false
        if (budget.min !== null && pricingFrom < budget.min) return false
      }

      // Search filter
      if (q) {
        const haystack = [v.business_name, v.category, v.location, v.description]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }

      // Zip code filter
      if (zip && !(v.location ?? '').includes(zip)) return false

      return true
    })
  }, [vendors, activeCategory, activeBudget, search, zipCode])

  return (
    <div
      className={`${syne.variable} ${spaceGrotesk.variable} min-h-screen bg-[#F8F4FC]`}
      style={{ fontFamily: 'var(--font-space-vl), system-ui, sans-serif' }}
    >
      {/* ── TOP NAV ── */}
      <nav
        className="sticky top-0 z-30 bg-[#F8F4FC] border-b border-[#EDE5F7]"
        style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link
            href={logoHref}
            className="text-xl font-extrabold tracking-tight text-[#4A0E6E] hover:opacity-80 transition-opacity flex-shrink-0"
            style={{ fontFamily: 'var(--font-syne-vl)' }}
          >
            evnti.
          </Link>

          <span
            className="text-sm font-semibold text-[#1A1A2E] hidden sm:block"
            style={{ fontFamily: 'var(--font-syne-vl)' }}
          >
            Find vendors
          </span>

          <Link
            href="/onboarding"
            className="flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: '#4A0E6E', fontFamily: 'var(--font-space-vl)' }}
          >
            Plan my event
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className="bg-[#1A1A2E] px-6 py-16 lg:py-20"
        style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #2D0845 100%)' }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h1
            className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: 'var(--font-syne-vl)' }}
          >
            Find your dream team.
          </h1>
          <p
            className="text-white/60 text-base mb-8 leading-relaxed"
            style={{ fontFamily: 'var(--font-space-vl)' }}
          >
            Browse verified vendors near you. Filter by category, budget, and availability.
          </p>

          {/* Search bar */}
          <div className="relative max-w-xl mx-auto">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="7" cy="7" r="4.5" stroke="#7C6B8A" strokeWidth="1.5" />
              <path d="M10.5 10.5L13 13" stroke="#7C6B8A" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search vendors, categories, locations..."
              className="w-full pl-11 pr-10 py-4 rounded-2xl bg-white text-sm text-[#1A1A2E] placeholder-[#C0ACD4] outline-none focus:ring-2 focus:ring-[#4A0E6E]/30 transition-all"
              style={{ fontFamily: 'var(--font-space-vl)' }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7C6B8A] hover:text-[#1A1A2E] transition-colors"
                aria-label="Clear search"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── FILTER BAR ── */}
      <div
        className="sticky z-20 bg-[#F8F4FC] border-b border-[#EDE5F7]"
        style={{ top: '64px' }}
      >
        <div className="max-w-6xl mx-auto px-6 py-3 space-y-3">
          {/* Row 1: category pills + budget */}
          <div className="flex items-center gap-4">
            {/* Category pills — horizontally scrollable */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1 pb-0.5">
              {CATEGORY_PILLS.map(pill => {
                const active = activeCategory === pill
                return (
                  <button
                    key={pill}
                    type="button"
                    onClick={() => setActiveCategory(pill)}
                    className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150"
                    style={{
                      background: active ? '#4A0E6E' : 'white',
                      color: active ? 'white' : '#1A1A2E',
                      borderColor: active ? '#4A0E6E' : '#DDB8F5',
                      fontFamily: 'var(--font-space-vl)',
                    }}
                  >
                    {pill}
                  </button>
                )
              })}
            </div>

            {/* Budget dropdown */}
            <select
              value={activeBudget}
              onChange={e => setActiveBudget(e.target.value)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border border-[#DDB8F5] bg-white text-[#1A1A2E] outline-none focus:border-[#4A0E6E] appearance-none cursor-pointer"
              style={{ fontFamily: 'var(--font-space-vl)' }}
            >
              {BUDGET_OPTIONS.map(b => (
                <option key={b.label} value={b.label}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          {/* Row 2: zip code search */}
          <div className="relative max-w-xs">
            <MapPin
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#7C6B8A]"
              aria-hidden="true"
            />
            <input
              type="text"
              value={zipCode}
              onChange={e => setZipCode(e.target.value)}
              placeholder="Search by zip code"
              className="w-full pl-8 pr-3 py-1.5 rounded-full text-xs border border-[#DDB8F5] bg-white text-[#1A1A2E] placeholder-[#C0ACD4] outline-none focus:border-[#4A0E6E] transition-colors"
              style={{ fontFamily: 'var(--font-space-vl)' }}
            />
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Result count */}
        {!loading && !fetchError && vendors.length > 0 && (
          <p
            className="text-sm text-[#7C6B8A] mb-6"
            style={{ fontFamily: 'var(--font-space-vl)' }}
          >
            {filtered.length} vendor{filtered.length !== 1 ? 's' : ''} found
          </p>
        )}

        {/* Fetch error */}
        {fetchError && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-6">
            {fetchError}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Vendor grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(vendor => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        )}

        {/* Empty state — no approved vendors at all */}
        {!loading && !fetchError && vendors.length === 0 && (
          <div className="flex flex-col items-center text-center py-24">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: '#F3E8FF' }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <rect x="4" y="8" width="20" height="14" rx="2" stroke="#4A0E6E" strokeWidth="1.5" />
                <path d="M4 12h20" stroke="#4A0E6E" strokeWidth="1.5" />
                <path d="M9 6l5-2 5 2" stroke="#4A0E6E" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h2
              className="text-2xl font-bold text-[#1A1A2E] mb-2"
              style={{ fontFamily: 'var(--font-syne-vl)' }}
            >
              Vendors coming soon.
            </h2>
            <p
              className="text-[#7C6B8A] text-sm leading-relaxed mb-6 max-w-xs"
              style={{ fontFamily: 'var(--font-space-vl)' }}
            >
              We are onboarding our first vendors in Houston. Check back soon.
            </p>
            <Link
              href="/vendor/apply"
              className="text-sm font-semibold text-[#4A0E6E] underline underline-offset-4 hover:opacity-80 transition-opacity"
              style={{ fontFamily: 'var(--font-space-vl)' }}
            >
              Are you a vendor? Apply here
            </Link>
          </div>
        )}

        {/* Empty state — filters return nothing but vendors exist */}
        {!loading && !fetchError && vendors.length > 0 && filtered.length === 0 && (
          <div className="flex flex-col items-center text-center py-24">
            <h2
              className="text-xl font-bold text-[#1A1A2E] mb-2"
              style={{ fontFamily: 'var(--font-syne-vl)' }}
            >
              No vendors match your filters.
            </h2>
            <p
              className="text-[#7C6B8A] text-sm mb-6"
              style={{ fontFamily: 'var(--font-space-vl)' }}
            >
              Try adjusting your category, budget, zip code, or search term.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setActiveCategory('All')
                setActiveBudget('Budget')
                setZipCode('')
              }}
              className="px-5 py-2.5 rounded-full text-sm font-semibold border border-[#4A0E6E] text-[#4A0E6E] hover:bg-[#F3E8FF] transition-colors"
              style={{ fontFamily: 'var(--font-space-vl)' }}
            >
              Clear filters
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
