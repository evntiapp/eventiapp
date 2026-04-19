'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Syne, Space_Grotesk } from 'next/font/google'
import { getSupabaseClient } from '@/lib/supabase'

const syne = Syne({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-syne' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-space' })

const ADMIN_EMAILS = [
  'easyeventsapps@gmail.com',
  'nabilah@evntiapp.com',
  'kemifarinde.eventi@gmail.com',
  'odusanwokemi@gmail.com',
  'farindekemi04@gmail.com',
]

type ApplicationStatus = 'pending' | 'approved' | 'declined'
type FilterTab = 'all' | ApplicationStatus

interface VendorProfile {
  id: string
  user_id: string | null
  business_name: string
  contact_name: string | null
  business_email: string | null
  phone: string | null
  location: string | null
  category: string | null
  description: string | null
  pricing_from: number | null
  pricing_to: number | null
  years_in_business: string | null
  portfolio_url: string | null
  referral_source: string | null
  has_insurance: string | null
  additional_notes: string | null
  is_verified: boolean
  application_status: ApplicationStatus
  created_at: string
}

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',      label: 'All' },
  { key: 'pending',  label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'declined', label: 'Declined' },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function pricingLabel(from: number | null, to: number | null) {
  if (!from && !to) return null
  if (from && to) return `$${from.toLocaleString()} – $${to.toLocaleString()}`
  if (from) return `From $${from.toLocaleString()}`
  if (to) return `Up to $${to.toLocaleString()}`
  return null
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading]       = useState(true)
  const [vendors, setVendors]       = useState<VendorProfile[]>([])
  const [activeTab, setActiveTab]   = useState<FilterTab>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [greeting, setGreeting]     = useState('')

  useEffect(() => {
    async function init() {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/signin')
        return
      }

      if (!ADMIN_EMAILS.includes(user.email ?? '')) {
        router.push('/')
        return
      }

      // Fetch name for greeting
      const { data: profile } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user.id)
        .single()
      const fullName = profile?.full_name ?? null
      const firstName = fullName
        ? fullName.trim().split(' ')[0]
        : (user.email ?? '').split('@')[0]
      setGreeting(firstName.charAt(0).toUpperCase() + firstName.slice(1))

      await fetchVendors()
      setLoading(false)
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchVendors() {
    const supabase = getSupabaseClient()
    const { data } = await supabase
      .from('vendor_profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setVendors((data as VendorProfile[]) ?? [])
  }

  async function updateStatus(id: string, status: ApplicationStatus) {
    setActionLoading(id + status)
    const supabase = getSupabaseClient()
    await supabase
      .from('vendor_profiles')
      .update({
        application_status: status,
        is_verified: status === 'approved',
      })
      .eq('id', id)
    await fetchVendors()
    setActionLoading(null)
  }

  const filtered = activeTab === 'all'
    ? vendors
    : vendors.filter(v => v.application_status === activeTab)

  const stats = {
    total:    vendors.length,
    pending:  vendors.filter(v => v.application_status === 'pending').length,
    approved: vendors.filter(v => v.application_status === 'approved').length,
    declined: vendors.filter(v => v.application_status === 'declined').length,
  }

  if (loading) {
    return (
      <div
        className={`${syne.variable} ${spaceGrotesk.variable}`}
        style={{ minHeight: '100vh', background: '#F8F4FC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <span style={{ fontFamily: 'var(--font-space)', fontSize: '0.9rem', color: '#9CA3AF' }}>Loading…</span>
      </div>
    )
  }

  return (
    <div
      className={`${syne.variable} ${spaceGrotesk.variable}`}
      style={{ minHeight: '100vh', background: '#F8F4FC', fontFamily: 'var(--font-space), sans-serif' }}
    >
      {/* ── HERO BANNER ──────────────────────────────────────────────────────── */}
      <div
        className="relative flex flex-col justify-end px-8 md:px-14"
        style={{ height: 220, overflow: 'hidden' }}
      >
        {/* Background image */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: "url('/images/feature.jpg')",
          backgroundSize: 'cover', backgroundPosition: 'center',
        }} />
        {/* Dark overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,10,46,0.78)' }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, paddingBottom: '2.5rem' }}>
          <p style={{
            fontFamily: 'var(--font-space)', fontSize: '0.68rem',
            fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase',
            color: '#DDB8F5', opacity: 0.7, marginBottom: '0.5rem',
          }}>
            Admin
          </p>
          {greeting && (
            <h2 style={{
              fontFamily: 'var(--font-syne)', fontWeight: 700,
              fontSize: 32, color: 'white',
              letterSpacing: '-0.02em', margin: '0 0 0.35rem',
            }}>
              Welcome, {greeting}.
            </h2>
          )}
          <h1 style={{
            fontFamily: 'var(--font-syne)', fontWeight: 800,
            fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
            letterSpacing: '-0.03em', color: 'white',
            marginBottom: '0.4rem',
          }}>
            Admin Dashboard
          </h1>
          <p style={{ fontFamily: 'var(--font-space)', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', fontWeight: 300 }}>
            Manage vendor applications and platform activity.
          </p>
        </div>
      </div>

      <div className="px-8 md:px-14 py-10" style={{ maxWidth: 1160 + 112, margin: '0 auto' }}>

        {/* ── STATS ROW ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total applications', value: stats.total,    accent: '#4A0E6E' },
            { label: 'Pending review',     value: stats.pending,  accent: '#B45309' },
            { label: 'Approved vendors',   value: stats.approved, accent: '#15803D' },
            { label: 'Declined',           value: stats.declined, accent: '#6B7280' },
          ].map(card => (
            <div
              key={card.label}
              className="rounded-2xl p-5"
              style={{ background: 'white', border: '1px solid rgba(74,14,110,0.07)', boxShadow: '0 1px 4px rgba(74,14,110,0.04)' }}
            >
              <div style={{ fontSize: 36, fontFamily: 'var(--font-syne)', fontWeight: 700, color: '#1A1A2E', lineHeight: 1 }}>
                {card.value}
              </div>
              <div style={{ fontSize: 13, color: '#7C6B8A', marginTop: '0.4rem', fontWeight: 400 }}>
                {card.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── FILTER TABS ────────────────────────────────────────────────────── */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '0.45rem 1.1rem',
                borderRadius: '100px',
                border: activeTab === tab.key ? 'none' : '1.5px solid #DDB8F5',
                background: activeTab === tab.key ? '#4A0E6E' : 'white',
                color: activeTab === tab.key ? 'white' : '#4A0E6E',
                fontFamily: 'var(--font-syne)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── APPLICATION CARDS ──────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div
            className="rounded-2xl flex items-center justify-center"
            style={{ height: 180, border: '1.5px dashed rgba(74,14,110,0.15)', background: 'white' }}
          >
            <span style={{ fontFamily: 'var(--font-space)', fontSize: '0.9rem', color: '#9CA3AF' }}>
              No {activeTab === 'all' ? '' : activeTab} applications.
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {filtered.map(v => {
              const isApproved = v.application_status === 'approved'
              const isDeclined = v.application_status === 'declined'
              const isPending  = v.application_status === 'pending'
              const pricing    = pricingLabel(v.pricing_from, v.pricing_to)
              const busyApprove = actionLoading === v.id + 'approved'
              const busyDecline = actionLoading === v.id + 'declined'

              return (
                <div
                  key={v.id}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: 'white', border: '1px solid rgba(74,14,110,0.07)', boxShadow: '0 1px 4px rgba(74,14,110,0.04)' }}
                >
                  {/* Card header */}
                  <div
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-7 pt-6 pb-4"
                    style={{ borderBottom: '1px solid rgba(74,14,110,0.06)' }}
                  >
                    <div className="flex flex-col gap-1">
                      <h2 style={{
                        fontFamily: 'var(--font-syne)', fontWeight: 700,
                        fontSize: '1.2rem', letterSpacing: '-0.02em',
                        color: '#1A1A2E', margin: 0,
                      }}>
                        {v.business_name}
                      </h2>
                      <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>
                        Applied {formatDate(v.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Category pill */}
                      {v.category && (
                        <span style={{
                          background: 'rgba(221,184,245,0.18)',
                          border: '1px solid rgba(221,184,245,0.4)',
                          color: '#6B1F9A',
                          borderRadius: '100px',
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          fontFamily: 'var(--font-syne)',
                        }}>
                          {v.category}
                        </span>
                      )}

                      {/* Status badge */}
                      {isApproved && (
                        <span style={{
                          background: 'rgba(21,128,61,0.1)',
                          border: '1px solid rgba(21,128,61,0.25)',
                          color: '#15803D',
                          borderRadius: '100px',
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          fontFamily: 'var(--font-syne)',
                        }}>
                          Approved
                        </span>
                      )}
                      {isDeclined && (
                        <span style={{
                          background: 'rgba(107,114,128,0.1)',
                          border: '1px solid rgba(107,114,128,0.2)',
                          color: '#6B7280',
                          borderRadius: '100px',
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          fontFamily: 'var(--font-syne)',
                        }}>
                          Declined
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="px-7 py-5">
                    {/* Contact row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                      <div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: '0.2rem' }}>
                          Contact
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#1A1A2E', fontWeight: 500 }}>{v.contact_name ?? '—'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: '0.2rem' }}>
                          Email
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#1A1A2E' }}>{v.business_email ?? '—'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: '0.2rem' }}>
                          Phone
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#1A1A2E' }}>{v.phone ?? '—'}</div>
                      </div>
                    </div>

                    {/* Details row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                      <div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: '0.2rem' }}>
                          Location
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#1A1A2E' }}>{v.location ?? '—'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: '0.2rem' }}>
                          Pricing
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#1A1A2E' }}>{pricing ?? '—'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: '0.2rem' }}>
                          Years in business
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#1A1A2E' }}>{v.years_in_business ?? '—'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: '0.2rem' }}>
                          Insurance
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#1A1A2E' }}>{v.has_insurance ?? '—'}</div>
                      </div>
                    </div>

                    {/* Description */}
                    {v.description && (
                      <div className="mb-5">
                        <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: '0.35rem' }}>
                          Description
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.65, margin: 0 }}>{v.description}</p>
                      </div>
                    )}

                    {/* Portfolio + referral row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                      {v.portfolio_url && (
                        <div>
                          <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: '0.2rem' }}>
                            Portfolio
                          </div>
                          <a
                            href={v.portfolio_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '0.875rem', color: '#6B1F9A', textDecoration: 'underline', wordBreak: 'break-all' }}
                          >
                            {v.portfolio_url}
                          </a>
                        </div>
                      )}
                      {v.referral_source && (
                        <div>
                          <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: '0.2rem' }}>
                            Referral source
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#1A1A2E' }}>{v.referral_source}</div>
                        </div>
                      )}
                    </div>

                    {/* Additional notes */}
                    {v.additional_notes && (
                      <div
                        className="rounded-xl p-4 mb-5"
                        style={{ background: 'rgba(221,184,245,0.08)', border: '1px solid rgba(221,184,245,0.2)' }}
                      >
                        <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: '0.35rem' }}>
                          Additional notes
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.65, margin: 0 }}>{v.additional_notes}</p>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div
                      className="flex flex-col sm:flex-row gap-3 pt-4"
                      style={{ borderTop: '1px solid rgba(74,14,110,0.06)' }}
                    >
                      {isPending && (
                        <>
                          <button
                            onClick={() => updateStatus(v.id, 'approved')}
                            disabled={busyApprove || busyDecline}
                            style={{
                              flex: 1,
                              height: 44,
                              borderRadius: 10,
                              border: 'none',
                              background: busyApprove ? '#15803D99' : '#15803D',
                              color: 'white',
                              fontFamily: 'var(--font-syne)',
                              fontSize: '0.875rem',
                              fontWeight: 700,
                              cursor: busyApprove || busyDecline ? 'not-allowed' : 'pointer',
                              opacity: busyDecline ? 0.5 : 1,
                              transition: 'all 0.15s',
                            }}
                          >
                            {busyApprove ? 'Approving…' : 'Approve'}
                          </button>
                          <button
                            onClick={() => updateStatus(v.id, 'declined')}
                            disabled={busyApprove || busyDecline}
                            style={{
                              flex: 1,
                              height: 44,
                              borderRadius: 10,
                              border: '1.5px solid #EF4444',
                              background: 'transparent',
                              color: '#EF4444',
                              fontFamily: 'var(--font-syne)',
                              fontSize: '0.875rem',
                              fontWeight: 700,
                              cursor: busyApprove || busyDecline ? 'not-allowed' : 'pointer',
                              opacity: busyApprove ? 0.5 : 1,
                              transition: 'all 0.15s',
                            }}
                          >
                            {busyDecline ? 'Declining…' : 'Decline'}
                          </button>
                        </>
                      )}

                      {isDeclined && (
                        <button
                          onClick={() => updateStatus(v.id, 'approved')}
                          disabled={busyApprove}
                          style={{
                            height: 44,
                            borderRadius: 10,
                            border: '1.5px solid #15803D',
                            background: 'transparent',
                            color: '#15803D',
                            fontFamily: 'var(--font-syne)',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            padding: '0 1.5rem',
                            cursor: busyApprove ? 'not-allowed' : 'pointer',
                            transition: 'all 0.15s',
                          }}
                        >
                          {busyApprove ? 'Approving…' : 'Re-approve'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
