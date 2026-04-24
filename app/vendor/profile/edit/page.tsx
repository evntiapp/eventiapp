'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Syne, Space_Grotesk } from 'next/font/google'
import { getSupabaseClient } from '@/lib/supabase'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne-ve',
})
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-ve',
})

// ── Types ─────────────────────────────────────────────────────────────────────

interface VendorProfile {
  id: string
  business_name: string
  category: string
  location: string
  description: string | null
  pricing_from: number | null
  pricing_to: number | null
  years_in_business: string | null
  portfolio_url: string | null
  phone: string | null
  is_verified: boolean
  application_status: string
  photos: string[] | null
  services_offered: string[] | null
}

interface FormState {
  business_name: string
  description: string
  category: string
  location: string
  pricing_from: string
  pricing_to: string
  years_in_business: string
  portfolio_url: string
  phone: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const VENDOR_CATEGORIES = [
  'Venue', 'Decor', 'Food & Catering', 'Cake', 'Drinks & Bar Service',
  'Entertainment', 'MC', 'Photography', 'Videography', 'Servers',
  'Beauty & Hair', 'Makeup', 'DJ', 'Tech & Lighting',
]

const YEARS_OPTIONS = [
  { value: '', label: 'Select…' },
  { value: 'less_than_1', label: 'Less than 1 year' },
  { value: '1_2', label: '1–2 years' },
  { value: '3_5', label: '3–5 years' },
  { value: '6_10', label: '6–10 years' },
  { value: '10_plus', label: '10+ years' },
]

const CATEGORY_SERVICES: Record<string, string[]> = {
  Venue: ['Indoor Venue', 'Outdoor Venue', 'Garden / Grounds', 'Rooftop Access', 'Waterfront', 'Private Dining Room', 'Parking Available', 'Wheelchair Accessible', 'In-house Catering', 'BYOB Allowed', 'On-site Accommodation', 'AV Equipment Included'],
  Decor: ['Floral Arrangements', 'Table Centrepieces', 'Arch & Backdrop', 'Lighting Design', 'Balloon Decor', 'Draping & Fabric', 'Chair Covers', 'Welcome Sign', 'Photo Booth Setup', 'Full Venue Styling', 'Custom Pieces', 'Delivery & Setup'],
  'Food & Catering': ['Full-service Catering', 'Buffet Setup', 'Cocktail Reception', 'Food Stations', 'Vegan / Vegetarian Options', 'Halal Certified', 'Alcohol Service', 'Custom Menu Design', 'Staff Included', 'Equipment Rental'],
  Cake: ['Custom Wedding Cakes', 'Tiered Cakes', 'Cupcake Towers', 'Dessert Tables', 'Macarons', 'Fondant Cakes', 'Naked / Semi-naked Cakes', 'Gluten-free Options', 'Vegan Options', 'Cake Delivery', 'Tasting Session'],
  'Drinks & Bar Service': ['Open Bar', 'Cash Bar', 'Cocktail Menu', 'Non-alcoholic Options', 'Bartending Staff', 'Mobile Bar Setup', 'Wine & Champagne', 'Custom Cocktails', 'Mocktails', 'Equipment Hire'],
  Entertainment: ['Live Band', 'Solo Performer', 'String Quartet', 'Jazz Ensemble', 'Acoustic Set', 'Corporate Events', 'Outdoor Events', 'Kids Entertainment', 'Photo Booth', 'Magic Show', 'Dance Performance'],
  MC: ['Wedding MC', 'Corporate Events', 'Comedy Style', 'Bilingual', 'Ceremony Officiating', 'Script Writing', 'Guest Engagement', 'Awards Nights', 'Conference Hosting'],
  Photography: ['Wedding Photography', 'Engagement Shoots', 'Bridal Portraits', 'Event Photography', 'Corporate Photography', 'Drone Aerial Shots', 'Same-day Edits', 'Albums & Prints', 'Photo Booth'],
  Videography: ['Full-day Coverage', 'Highlight Reel', 'Same-day Edit', 'Drone Footage', 'Cinematic Style', 'Documentary Style', 'Live Streaming', 'Raw Footage Included', 'Subtitle / Captions'],
  Servers: ['Table Service', 'Cocktail Waitstaff', 'Buffet Attendants', 'Bar Service', 'Setup & Breakdown', 'Uniformed Staff', 'Large Events', 'Outdoor Events'],
  'Beauty & Hair': ['Bridal Hair', 'Bridal Makeup', 'Trial Session', 'Bridesmaid Packages', 'On-location Service', 'Airbrush Makeup', 'Hair Extensions', 'Natural Look', 'Glam Look', 'Morning-of Services'],
  Makeup: ['Bridal Makeup', 'Editorial Looks', 'Airbrush Finish', 'Natural / Soft Glam', 'Full Glam', 'Bridesmaid Packages', 'Trial Session', 'On-location Service', 'Skincare Prep'],
  DJ: ['Wedding DJ', 'Corporate Events', 'Live Mix', 'MC Services', 'Sound System', 'Lighting Rig', 'Karaoke Setup', 'Outdoor Events', 'Custom Playlist', 'Photo Booth'],
  'Tech & Lighting': ['Stage Lighting', 'Uplighting', 'Laser Show', 'LED Screens', 'Projectors', 'Sound System', 'AV Setup', 'Live Streaming', 'Photo Booth', 'On-site Technician'],
}

function getServicesForCategory(category: string): string[] {
  return CATEGORY_SERVICES[category] ?? [
    'Custom Quote Available', 'Package Deals', 'Weekend Availability',
    'Weekday Availability', 'Last-minute Bookings', 'Travel Available',
  ]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(from: string, to: string): string {
  const f = parseFloat(from)
  const t = parseFloat(to)
  if (!from && !to) return 'Price on request'
  if (from && to && !isNaN(f) && !isNaN(t)) return `$${f.toLocaleString()} – $${t.toLocaleString()}`
  if (from && !isNaN(f)) return `From $${f.toLocaleString()}`
  if (to && !isNaN(t)) return `Up to $${t.toLocaleString()}`
  return 'Price on request'
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function EditSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8F4FC] animate-pulse">
      <div className="h-16 bg-white border-b border-[#EDE5F7]" />
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-8 w-48 bg-[#DDB8F5] rounded" />
          <div className="h-48 bg-white rounded-2xl" />
          <div className="h-64 bg-white rounded-2xl" />
        </div>
        <div className="space-y-4">
          <div className="h-64 bg-white rounded-2xl" />
          <div className="h-32 bg-white rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function VendorProfileEditPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<VendorProfile | null>(null)
  const [form, setForm] = useState<FormState>({
    business_name: '',
    description: '',
    category: '',
    location: '',
    pricing_from: '',
    pricing_to: '',
    years_in_business: '',
    portfolio_url: '',
    phone: '',
  })
  const [photos, setPhotos] = useState<string[]>([])
  const [services, setServices] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // ── Load profile ──
  const loadProfile = useCallback(async () => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.replace('/auth/signin')
      return
    }

    const { data, error } = await supabase
      .from('vendor_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error || !data) {
      router.replace('/vendor/apply')
      return
    }

    const vp = data as VendorProfile
    setProfile(vp)
    setForm({
      business_name: vp.business_name ?? '',
      description: vp.description ?? '',
      category: vp.category ?? '',
      location: vp.location ?? '',
      pricing_from: vp.pricing_from != null ? String(vp.pricing_from) : '',
      pricing_to: vp.pricing_to != null ? String(vp.pricing_to) : '',
      years_in_business: vp.years_in_business ?? '',
      portfolio_url: vp.portfolio_url ?? '',
      phone: vp.phone ?? '',
    })
    setPhotos(vp.photos ?? [])
    setServices(vp.services_offered ?? [])
    setLoading(false)
  }, [router])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  // ── Photo upload ──
  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploadError(null)

    const remaining = 10 - photos.length
    if (remaining <= 0) {
      setUploadError('Maximum 10 photos allowed.')
      return
    }

    const toUpload = files.slice(0, remaining)
    const oversized = toUpload.filter(f => f.size > 5 * 1024 * 1024)
    if (oversized.length) {
      setUploadError(`${oversized.length} file(s) exceed 5 MB and were skipped.`)
    }
    const valid = toUpload.filter(f => f.size <= 5 * 1024 * 1024)
    if (!valid.length) return

    setUploading(true)
    const supabase = getSupabaseClient()
    const newPhotos: string[] = []

    for (const file of valid) {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${profile!.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error } = await supabase.storage.from('vendor-photos').upload(path, file)
      if (!error && data) {
        const { data: urlData } = supabase.storage.from('vendor-photos').getPublicUrl(data.path)
        newPhotos.push(urlData.publicUrl)
      }
    }

    setPhotos(prev => [...prev, ...newPhotos])
    setUploading(false)
    e.target.value = ''
  }

  // ── Photo delete ──
  async function handlePhotoDelete(url: string) {
    const supabase = getSupabaseClient()
    const pathMatch = url.match(/vendor-photos\/(.+)$/)
    if (pathMatch?.[1]) {
      await supabase.storage.from('vendor-photos').remove([pathMatch[1]])
    }
    setPhotos(prev => prev.filter(p => p !== url))
  }

  // ── Services toggle ──
  function toggleService(svc: string) {
    setServices(prev =>
      prev.includes(svc) ? prev.filter(s => s !== svc) : [...prev, svc]
    )
  }

  // ── Save ──
  async function handleSave() {
    if (!profile) return
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('vendor_profiles')
      .update({
        business_name: form.business_name,
        description: form.description || null,
        category: form.category,
        location: form.location,
        pricing_from: form.pricing_from ? Number(form.pricing_from) : null,
        pricing_to: form.pricing_to ? Number(form.pricing_to) : null,
        years_in_business: form.years_in_business || null,
        portfolio_url: form.portfolio_url || null,
        phone: form.phone || null,
        photos,
        services_offered: services,
      })
      .eq('id', profile.id)

    if (error) {
      setSaveError(error.message)
    } else {
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 4000)
    }
    setSaving(false)
  }

  if (loading) return <EditSkeleton />
  if (!profile) return null

  const availableServices = getServicesForCategory(form.category)

  return (
    <div
      className={`${syne.variable} ${spaceGrotesk.variable} min-h-screen bg-[#F8F4FC]`}
      style={{ fontFamily: 'var(--font-space-ve), system-ui, sans-serif' }}
    >
      {/* ── NAV ── */}
      <nav
        className="sticky top-0 z-30 bg-[#F8F4FC]/95 border-b border-[#EDE5F7]"
        style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link
              href="/vendor/dashboard"
              className="text-xl font-extrabold tracking-tight text-[#4A0E6E] hover:opacity-80 transition-opacity"
              style={{ fontFamily: 'var(--font-syne-ve)' }}
            >
              evnti.
            </Link>
            <Link
              href="/vendor/dashboard"
              className="flex items-center gap-1.5 text-sm text-[#7C6B8A] hover:text-[#4A0E6E] transition-colors"
              style={{ fontFamily: 'var(--font-space-ve)' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Vendor Dashboard
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span
                className="text-sm font-semibold text-[#1A1A2E] leading-tight"
                style={{ fontFamily: 'var(--font-syne-ve)' }}
              >
                {profile.business_name}
              </span>
              <span
                style={{ fontSize: 10, color: '#DDB8F5', fontFamily: 'var(--font-space-ve)', lineHeight: 1.4 }}
              >
                Vendor Account
              </span>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-full text-sm font-bold text-white transition-all disabled:opacity-50 hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #4A0E6E 0%, #6B1F9A 100%)', fontFamily: 'var(--font-syne-ve)' }}
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </nav>

      {/* ── PAGE HEADER ── */}
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-6">
        <h1
          className="text-2xl font-bold text-[#1A1A2E] mb-1"
          style={{ fontFamily: 'var(--font-syne-ve)' }}
        >
          Edit Profile
        </h1>
        <p className="text-sm text-[#7C6B8A]">
          Keep your profile up to date to attract more clients.
        </p>
      </div>

      {/* ── SAVE FEEDBACK ── */}
      {(saveSuccess || saveError) && (
        <div className="max-w-6xl mx-auto px-6 mb-4">
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
            style={{
              background: saveSuccess ? '#E6F7F2' : '#FEE2E2',
              color: saveSuccess ? '#0D9B6A' : '#DC2626',
              fontFamily: 'var(--font-space-ve)',
            }}
          >
            {saveSuccess ? (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 7l3.5 3.5L12 3.5" stroke="#0D9B6A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Profile saved successfully.
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <circle cx="7" cy="7" r="5.5" stroke="#DC2626" strokeWidth="1.2" />
                  <path d="M7 4v3.5" stroke="#DC2626" strokeWidth="1.2" strokeLinecap="round" />
                  <circle cx="7" cy="10" r="0.75" fill="#DC2626" />
                </svg>
                {saveError}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── MAIN GRID ── */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* ── PORTFOLIO PHOTOS ── */}
            <section
              className="bg-white rounded-2xl p-6"
              style={{ boxShadow: '0 2px 12px rgba(74,14,110,0.07)' }}
            >
              <div className="flex items-center justify-between mb-1">
                <h2
                  className="text-base font-bold text-[#1A1A2E]"
                  style={{ fontFamily: 'var(--font-syne-ve)' }}
                >
                  Portfolio Photos
                </h2>
                <span className="text-xs text-[#7C6B8A]" style={{ fontFamily: 'var(--font-space-ve)' }}>
                  {photos.length} / 10
                </span>
              </div>
              <p className="text-xs text-[#7C6B8A] mb-4" style={{ fontFamily: 'var(--font-space-ve)' }}>
                Upload up to 10 photos. Max 5 MB each. JPG, PNG, or WebP.
              </p>

              {/* Photo grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {photos.map((url, i) => (
                  <div key={i} className="relative group h-36 rounded-xl overflow-hidden"
                    style={{ background: '#EDE5F7' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Portfolio photo ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handlePhotoDelete(url)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(26,26,46,0.7)' }}
                      aria-label="Remove photo"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                        <path d="M2 2l6 6M8 2l-6 6" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                ))}

                {/* Upload slot */}
                {photos.length < 10 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="h-36 rounded-xl flex flex-col items-center justify-center transition-colors disabled:opacity-60 hover:bg-[#EDE5F7]"
                    style={{ border: '2px dashed #DDB8F5', background: '#F8F4FC' }}
                  >
                    {uploading ? (
                      <div
                        className="w-5 h-5 rounded-full border-2 border-[#4A0E6E] border-t-transparent animate-spin"
                      />
                    ) : (
                      <>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mb-2">
                          <path d="M12 5v14M5 12h14" stroke="#4A0E6E" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <span className="text-xs font-semibold text-[#4A0E6E]" style={{ fontFamily: 'var(--font-space-ve)' }}>
                          Add photo
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {uploadError && (
                <p className="text-xs text-red-500 mt-1" style={{ fontFamily: 'var(--font-space-ve)' }}>
                  {uploadError}
                </p>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </section>

            {/* ── PROFILE DETAILS ── */}
            <section
              className="bg-white rounded-2xl p-6"
              style={{ boxShadow: '0 2px 12px rgba(74,14,110,0.07)' }}
            >
              <h2
                className="text-base font-bold text-[#1A1A2E] mb-5"
                style={{ fontFamily: 'var(--font-syne-ve)' }}
              >
                Profile Details
              </h2>

              <div className="space-y-5">
                {/* Business name */}
                <div>
                  <label
                    className="block text-xs font-semibold text-[#1A1A2E] mb-1.5 uppercase tracking-wide"
                    style={{ fontFamily: 'var(--font-space-ve)' }}
                  >
                    Business name
                  </label>
                  <input
                    type="text"
                    value={form.business_name}
                    onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm text-[#1A1A2E] outline-none transition-shadow"
                    style={{
                      border: '1.5px solid #DDB8F5',
                      background: '#FDFAFF',
                      fontFamily: 'var(--font-space-ve)',
                    }}
                    placeholder="e.g. Bloom & Co Photography"
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    className="block text-xs font-semibold text-[#1A1A2E] mb-1.5 uppercase tracking-wide"
                    style={{ fontFamily: 'var(--font-space-ve)' }}
                  >
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl text-sm text-[#1A1A2E] outline-none resize-none transition-shadow"
                    style={{
                      border: '1.5px solid #DDB8F5',
                      background: '#FDFAFF',
                      fontFamily: 'var(--font-space-ve)',
                    }}
                    placeholder="Tell clients what makes your business unique…"
                  />
                  <p className="text-[11px] text-[#7C6B8A] mt-1" style={{ fontFamily: 'var(--font-space-ve)' }}>
                    {form.description.length} characters
                  </p>
                </div>

                {/* Category + Location row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-xs font-semibold text-[#1A1A2E] mb-1.5 uppercase tracking-wide"
                      style={{ fontFamily: 'var(--font-space-ve)' }}
                    >
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={e => {
                        const cat = e.target.value
                        setForm(f => ({ ...f, category: cat }))
                        setServices([])
                      }}
                      className="w-full px-4 py-3 rounded-xl text-sm text-[#1A1A2E] outline-none appearance-none"
                      style={{
                        border: '1.5px solid #DDB8F5',
                        background: '#FDFAFF',
                        fontFamily: 'var(--font-space-ve)',
                      }}
                    >
                      <option value="">Select category…</option>
                      {VENDOR_CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-xs font-semibold text-[#1A1A2E] mb-1.5 uppercase tracking-wide"
                      style={{ fontFamily: 'var(--font-space-ve)' }}
                    >
                      Location
                    </label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl text-sm text-[#1A1A2E] outline-none"
                      style={{
                        border: '1.5px solid #DDB8F5',
                        background: '#FDFAFF',
                        fontFamily: 'var(--font-space-ve)',
                      }}
                      placeholder="e.g. Lagos, Nigeria"
                    />
                  </div>
                </div>

                {/* Pricing row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-xs font-semibold text-[#1A1A2E] mb-1.5 uppercase tracking-wide"
                      style={{ fontFamily: 'var(--font-space-ve)' }}
                    >
                      Starting price ($)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.pricing_from}
                      onChange={e => setForm(f => ({ ...f, pricing_from: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl text-sm text-[#1A1A2E] outline-none"
                      style={{
                        border: '1.5px solid #DDB8F5',
                        background: '#FDFAFF',
                        fontFamily: 'var(--font-space-ve)',
                      }}
                      placeholder="500"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-xs font-semibold text-[#1A1A2E] mb-1.5 uppercase tracking-wide"
                      style={{ fontFamily: 'var(--font-space-ve)' }}
                    >
                      Up to price ($)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.pricing_to}
                      onChange={e => setForm(f => ({ ...f, pricing_to: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl text-sm text-[#1A1A2E] outline-none"
                      style={{
                        border: '1.5px solid #DDB8F5',
                        background: '#FDFAFF',
                        fontFamily: 'var(--font-space-ve)',
                      }}
                      placeholder="3000"
                    />
                  </div>
                </div>

                {/* Years in business */}
                <div>
                  <label
                    className="block text-xs font-semibold text-[#1A1A2E] mb-1.5 uppercase tracking-wide"
                    style={{ fontFamily: 'var(--font-space-ve)' }}
                  >
                    Years in business
                  </label>
                  <select
                    value={form.years_in_business}
                    onChange={e => setForm(f => ({ ...f, years_in_business: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm text-[#1A1A2E] outline-none appearance-none"
                    style={{
                      border: '1.5px solid #DDB8F5',
                      background: '#FDFAFF',
                      fontFamily: 'var(--font-space-ve)',
                    }}
                  >
                    {YEARS_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* Phone + Portfolio URL row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-xs font-semibold text-[#1A1A2E] mb-1.5 uppercase tracking-wide"
                      style={{ fontFamily: 'var(--font-space-ve)' }}
                    >
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl text-sm text-[#1A1A2E] outline-none"
                      style={{
                        border: '1.5px solid #DDB8F5',
                        background: '#FDFAFF',
                        fontFamily: 'var(--font-space-ve)',
                      }}
                      placeholder="+1 555 000 0000"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-xs font-semibold text-[#1A1A2E] mb-1.5 uppercase tracking-wide"
                      style={{ fontFamily: 'var(--font-space-ve)' }}
                    >
                      Portfolio URL
                    </label>
                    <input
                      type="url"
                      value={form.portfolio_url}
                      onChange={e => setForm(f => ({ ...f, portfolio_url: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl text-sm text-[#1A1A2E] outline-none"
                      style={{
                        border: '1.5px solid #DDB8F5',
                        background: '#FDFAFF',
                        fontFamily: 'var(--font-space-ve)',
                      }}
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ── SERVICES OFFERED ── */}
            <section
              className="bg-white rounded-2xl p-6"
              style={{ boxShadow: '0 2px 12px rgba(74,14,110,0.07)' }}
            >
              <h2
                className="text-base font-bold text-[#1A1A2E] mb-1"
                style={{ fontFamily: 'var(--font-syne-ve)' }}
              >
                Services Offered
              </h2>
              <p className="text-xs text-[#7C6B8A] mb-5" style={{ fontFamily: 'var(--font-space-ve)' }}>
                Select all services that apply. This helps clients find you for the right occasions.
              </p>

              {!form.category ? (
                <p className="text-sm text-[#7C6B8A] italic" style={{ fontFamily: 'var(--font-space-ve)' }}>
                  Select a category above to see available services.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availableServices.map(svc => {
                    const selected = services.includes(svc)
                    return (
                      <button
                        key={svc}
                        type="button"
                        onClick={() => toggleService(svc)}
                        className="px-3.5 py-2 rounded-full text-xs font-semibold transition-all"
                        style={{
                          background: selected ? '#4A0E6E' : '#F3E8FF',
                          color: selected ? 'white' : '#4A0E6E',
                          fontFamily: 'var(--font-space-ve)',
                          border: selected ? '1.5px solid #4A0E6E' : '1.5px solid #DDB8F5',
                        }}
                      >
                        {selected && (
                          <svg
                            width="10" height="10" viewBox="0 0 10 10" fill="none"
                            className="inline mr-1.5 -mt-0.5" aria-hidden="true"
                          >
                            <path d="M1.5 5l2.5 2.5L8.5 2.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        {svc}
                      </button>
                    )
                  })}
                </div>
              )}

              {services.length > 0 && (
                <p className="text-xs text-[#7C6B8A] mt-4" style={{ fontFamily: 'var(--font-space-ve)' }}>
                  {services.length} service{services.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </section>

            {/* ── SAVE (bottom) ── */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 rounded-full text-sm font-bold text-white transition-all disabled:opacity-50 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #4A0E6E 0%, #6B1F9A 100%)', fontFamily: 'var(--font-syne-ve)' }}
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-5 lg:sticky lg:top-24">

            {/* Preview card */}
            <div
              className="bg-white rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 4px 24px rgba(74,14,110,0.1)' }}
            >
              {/* Preview photo */}
              <div className="h-40 overflow-hidden relative" style={{ background: '#EDE5F7' }}>
                {photos.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photos[0]}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                      <rect x="4" y="6" width="24" height="20" rx="3" stroke="#DDB8F5" strokeWidth="1.5" />
                      <circle cx="11" cy="13" r="2.5" stroke="#DDB8F5" strokeWidth="1.5" />
                      <path d="M4 22l7-6 5 5 4-4 8 7" stroke="#DDB8F5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  {form.category && (
                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
                      style={{ background: '#F3E8FF', color: '#4A0E6E', fontFamily: 'var(--font-space-ve)' }}
                    >
                      {form.category}
                    </span>
                  )}
                  {profile.is_verified && (
                    <span
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
                      style={{ background: '#E6F7F2', color: '#0D9B6A', fontFamily: 'var(--font-syne-ve)' }}
                    >
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
                        <path d="M1 4l2 2 4-4" stroke="#0D9B6A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>

                <h3
                  className="text-base font-bold text-[#1A1A2E] mb-0.5"
                  style={{ fontFamily: 'var(--font-syne-ve)' }}
                >
                  {form.business_name || 'Your business name'}
                </h3>

                {form.location && (
                  <p className="text-xs text-[#7C6B8A] mb-2" style={{ fontFamily: 'var(--font-space-ve)' }}>
                    {form.location}
                  </p>
                )}

                <p
                  className="text-sm font-bold text-[#4A0E6E] mb-3"
                  style={{ fontFamily: 'var(--font-syne-ve)' }}
                >
                  {formatPrice(form.pricing_from, form.pricing_to)}
                </p>

                {form.description && (
                  <p
                    className="text-xs text-[#1A1A2E]/65 leading-relaxed mb-3"
                    style={{
                      fontFamily: 'var(--font-space-ve)',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {form.description}
                  </p>
                )}

                {services.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {services.slice(0, 4).map(s => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-full text-[10px]"
                        style={{ background: '#EDE5F7', color: '#4A0E6E', fontFamily: 'var(--font-space-ve)' }}
                      >
                        {s}
                      </span>
                    ))}
                    {services.length > 4 && (
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px]"
                        style={{ background: '#EDE5F7', color: '#7C6B8A', fontFamily: 'var(--font-space-ve)' }}
                      >
                        +{services.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Tips card */}
            <div
              className="bg-white rounded-2xl p-5"
              style={{ boxShadow: '0 2px 12px rgba(74,14,110,0.07)' }}
            >
              <h3
                className="text-sm font-bold text-[#1A1A2E] mb-4"
                style={{ fontFamily: 'var(--font-syne-ve)' }}
              >
                Profile tips
              </h3>
              <ul className="space-y-3">
                {[
                  { icon: '📸', tip: 'Add at least 3 photos — profiles with photos get 3× more inquiries.' },
                  { icon: '✏️', tip: 'Write a description that explains your style and what clients can expect.' },
                  { icon: '✓', tip: 'Select your services so clients can easily match with you.' },
                  { icon: '$', tip: 'Setting a price range helps clients shortlist you faster.' },
                ].map(({ icon, tip }, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                      style={{ background: '#F3E8FF', color: '#4A0E6E', fontFamily: 'var(--font-syne-ve)' }}
                    >
                      {icon}
                    </span>
                    <p className="text-xs text-[#1A1A2E]/70 leading-relaxed" style={{ fontFamily: 'var(--font-space-ve)' }}>
                      {tip}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* View public profile link */}
            <Link
              href={`/vendors/${profile.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold border transition-colors hover:bg-[#F3E8FF]"
              style={{ borderColor: '#DDB8F5', color: '#4A0E6E', fontFamily: 'var(--font-space-ve)' }}
            >
              View public profile
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 10L10 2M10 2H5M10 2v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
