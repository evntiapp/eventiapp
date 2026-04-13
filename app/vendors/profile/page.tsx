'use client'
import { useState } from 'react'
import { Syne, Epilogue } from 'next/font/google'

const syne = Syne({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-syne' })
const epilogue = Epilogue({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-epilogue' })

type Tab = 'about' | 'packages' | 'portfolio' | 'reviews'

interface Package {
  name: string
  badge: string
  badgeType: 'basic' | 'popular' | 'premium'
  price: string
  includes: string[]
}

interface Review {
  name: string
  event: string
  avatarBg: string
  avatar: string
  text: string
  date: string
}

const PACKAGES: Package[] = [
  {
    name: 'Essential',
    badge: 'Starter',
    badgeType: 'basic',
    price: '$1,200',
    includes: [
      'Bridal bouquet & 2 bridesmaid bouquets',
      'Ceremony arch arrangement',
      '4 centerpieces (standard)',
      'Setup & breakdown included',
    ],
  },
  {
    name: 'Signature',
    badge: 'Most Popular',
    badgeType: 'popular',
    price: '$2,200',
    includes: [
      'Full bridal party bouquets (up to 6)',
      'Ceremony arch + aisle florals',
      '8 premium centerpieces',
      'Cocktail hour arrangements',
      'Floral installation / backdrop',
      'Setup, styling & breakdown',
    ],
  },
  {
    name: 'Luxe Experience',
    badge: 'Premium',
    badgeType: 'premium',
    price: '$4,500',
    includes: [
      'Full venue floral transformation',
      'Custom floral installation',
      'Unlimited bouquets & arrangements',
      'Day-of floral coordinator',
      'Custom mood board consultation',
      'Preservation service included',
    ],
  },
]

const PORTFOLIO_ITEMS = [
  { bg: 'linear-gradient(135deg,#E6F7F2,#A8DCC8)', emoji: '🌸' },
  { bg: 'linear-gradient(135deg,#1a3a2a,#2D5A3D)', emoji: '🌿' },
  { bg: 'linear-gradient(135deg,#F3E8FF,#DDB8F5)', emoji: '💐' },
  { bg: 'linear-gradient(135deg,#FCE4EC,#F48FB1)', emoji: '🌷' },
  { bg: 'linear-gradient(135deg,#FEF9E7,#FFE082)', emoji: '🌻' },
  { bg: 'linear-gradient(135deg,#E8F5E9,#C8E6C9)', emoji: '🍃' },
  { bg: 'linear-gradient(135deg,#2D0A42,#4A1168)', emoji: '✨' },
  { bg: 'linear-gradient(135deg,#E6F7F2,#A8DCC8)', emoji: '🌹' },
  { bg: 'linear-gradient(135deg,#F3E8FF,#DDB8F5)', emoji: '🪷' },
  { bg: 'linear-gradient(135deg,#FCE4EC,#F48FB1)', emoji: '💮' },
  { bg: 'linear-gradient(135deg,#1a3a2a,#2D5A3D)', emoji: '🌾' },
  { bg: 'linear-gradient(135deg,#FEF3E2,#FDDCB5)', emoji: '🌼' },
]

const REVIEWS: Review[] = [
  {
    name: 'Jasmine T.',
    event: 'Wedding · March 2025',
    avatarBg: 'linear-gradient(135deg,#F3E8FF,#DDB8F5)',
    avatar: '👰🏾',
    text: 'I cannot describe how breathtaking everything looked. The arch was straight out of my Pinterest board — actually better. Every single guest commented on the florals. Worth every penny and more.',
    date: 'March 15, 2025',
  },
  {
    name: 'Marcus W.',
    event: 'Birthday Gala · Jan 2025',
    avatarBg: 'linear-gradient(135deg,#E6F7F2,#A8DCC8)',
    avatar: '🎂',
    text: "Hired Bloom & Co for my wife's 40th surprise gala. They transformed the entire ballroom. Professional, creative, and incredibly responsive throughout the process.",
    date: 'January 28, 2025',
  },
  {
    name: 'TechCorp Events',
    event: 'Corporate Gala · Dec 2024',
    avatarBg: 'linear-gradient(135deg,#FEF3E2,#FDDCB5)',
    avatar: '💼',
    text: 'Used for our annual company gala — 300 guests. Flawless execution from consultation to setup. Will be booking again for our next event without hesitation.',
    date: 'December 12, 2024',
  },
]

const REVIEW_BARS = [
  { star: 5, pct: '90%', count: 78 },
  { star: 4, pct: '10%', count: 7 },
  { star: 3, pct: '2%', count: 2 },
  { star: 2, pct: '0%', count: 0 },
  { star: 1, pct: '0%', count: 0 },
]

const BADGE_STYLES: Record<string, { bg: string; color: string }> = {
  basic: { bg: '#E6F7F2', color: '#0D9B6A' },
  popular: { bg: '#F3E8FF', color: '#4A0E6E' },
  premium: { bg: '#FEF9E7', color: '#D4AC0D' },
}

export default function VendorProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>('about')
  const [saved, setSaved] = useState(false)
  const [selectedPkg, setSelectedPkg] = useState<number | null>(null)
  const [booked, setBooked] = useState(false)

  const footerPrice = selectedPkg !== null ? PACKAGES[selectedPkg].price : '$2,200'

  return (
    <div
      className={`${syne.variable} ${epilogue.variable} min-h-screen bg-[#1A1A2E] flex items-center justify-center p-6`}
      style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}
    >
      {/* Phone frame */}
      <div
        className="w-[375px] h-[812px] bg-[#F8F4FC] rounded-[48px] overflow-hidden flex flex-col"
        style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 10px #2D2D45, 0 0 0 12px #3D3D55' }}
      >
        {/* Notch */}
        <div className="w-[120px] h-8 bg-[#1A1A2E] rounded-b-[20px] mx-auto flex-shrink-0 relative z-20" />

        {/* ── HERO ── */}
        <div className="h-[200px] relative flex-shrink-0">
          {/* Photo grid */}
          <div
            className="w-full h-full flex items-center justify-center text-[60px] relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1a3a2a 0%, #2D0A42 40%, #4A1168 70%, #1a3a2a 100%)' }}
          >
            {/* Stripe pattern at top (replaces ::before pseudo-element) */}
            <div
              className="absolute top-0 left-0 right-0 h-[30px]"
              style={{
                background:
                  'repeating-linear-gradient(90deg, transparent 0px, transparent 22px, rgba(255,220,100,0.25) 22px, rgba(255,220,100,0.25) 24px)',
              }}
            />

            {/* Photo grid */}
            <div className="absolute inset-0 flex gap-1 p-1">
              {/* Left tall photo */}
              <div
                className="flex-1 rounded-lg flex items-center justify-center text-[32px] overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#1a3a2a,#2D5A3D)' }}
              >
                🌿
              </div>
              {/* Center 2-stack */}
              <div className="flex-1 flex flex-col gap-1">
                <div
                  className="flex-1 rounded-lg flex items-center justify-center text-[32px] overflow-hidden"
                  style={{ background: 'linear-gradient(135deg,#2D0A42,#4A1168)' }}
                >
                  🌸
                </div>
                <div
                  className="flex-1 rounded-lg flex items-center justify-center text-[32px] overflow-hidden"
                  style={{ background: 'linear-gradient(135deg,#3D1558,#6B1F9A)' }}
                >
                  💐
                </div>
              </div>
              {/* Right tall photo */}
              <div
                className="flex-1 rounded-lg flex items-center justify-center text-[32px] overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#1a3a2a,#2D5A3D)' }}
              >
                🌷
              </div>
            </div>

            {/* Overlay gradient */}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(26,26,46,0.95) 100%)' }}
            />
          </div>

          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2.5 z-10">
            <button
              className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-white text-base"
              style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}
            >
              ←
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setSaved(s => !s)}
                className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-base"
                style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}
              >
                {saved ? '❤️' : '🤍'}
              </button>
              <button
                className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-white text-base"
                style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}
              >
                ⋯
              </button>
            </div>
          </div>

          {/* Photo count */}
          <div
            className="absolute right-3.5 z-[5] rounded-lg px-2.5 py-1 text-[11px] text-white"
            style={{ bottom: '60px', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', fontFamily: 'var(--font-syne)', fontWeight: 700 }}
          >
            📷 24 Photos
          </div>
        </div>

        {/* ── PROFILE INFO ── */}
        <div className="bg-[#1A1A2E] px-5 pb-4 flex-shrink-0">
          {/* Top row: avatar + badges */}
          <div className="flex items-end justify-between mb-2.5">
            <div
              className="w-[60px] h-[60px] rounded-2xl flex items-center justify-center text-[30px] flex-shrink-0 relative z-[5]"
              style={{
                background: 'linear-gradient(135deg, #E6F7F2, #A8DCC8)',
                border: '3px solid #1A1A2E',
                marginTop: '-20px',
              }}
            >
              🌸
            </div>
            <div className="flex gap-1.5 items-center pb-1">
              <div
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px]"
                style={{
                  background: 'rgba(212,172,13,0.2)',
                  color: '#FFD93D',
                  border: '1px solid rgba(212,172,13,0.3)',
                  fontFamily: 'var(--font-syne)',
                  fontWeight: 700,
                }}
              >
                🏆 Elite
              </div>
              <div
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px]"
                style={{
                  background: 'rgba(13,155,106,0.2)',
                  color: '#4ECDC4',
                  border: '1px solid rgba(13,155,106,0.2)',
                  fontFamily: 'var(--font-syne)',
                  fontWeight: 700,
                }}
              >
                ✓ Insured
              </div>
            </div>
          </div>

          <div className="text-white text-[20px] font-extrabold tracking-[-0.4px] mb-[3px]" style={{ fontFamily: 'var(--font-syne)' }}>
            Bloom & Co Florals
          </div>
          <div className="text-[12px] mb-2.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Florals & Décor · Houston, TX
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            {[
              { val: '4.9', label: 'Rating', gold: true },
              { val: '87', label: 'Reviews', gold: false },
              { val: '340+', label: 'Events', gold: false },
              { val: '6', label: 'Yrs Active', gold: false },
            ].map((s, i, arr) => (
              <div key={i} className="flex items-center gap-4">
                <div className="text-center">
                  <div
                    className="text-[16px] font-extrabold leading-none"
                    style={{ fontFamily: 'var(--font-syne)', color: s.gold ? '#FFD93D' : 'white' }}
                  >
                    {s.val}
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {s.label}
                  </div>
                </div>
                {i < arr.length - 1 && <div className="w-px self-stretch" style={{ background: 'rgba(255,255,255,0.1)' }} />}
              </div>
            ))}
          </div>

          {/* AI match pill */}
          <div
            className="flex items-center gap-1.5 rounded-[10px] px-3 py-2 mt-2.5"
            style={{ background: 'rgba(107,31,154,0.4)', border: '1px solid rgba(221,184,245,0.2)' }}
          >
            <span className="text-[14px]">✦</span>
            <p className="text-[12px] text-[#DDB8F5] leading-[1.4] flex-1">
              AI matched this vendor to your <strong>botanical garden</strong> mood board and <strong>Midnight Garden</strong> palette.
            </p>
            <span className="text-[18px] font-extrabold text-[#0D9B6A]" style={{ fontFamily: 'var(--font-syne)' }}>
              98%
            </span>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex bg-white border-b border-[#F3E8FF] flex-shrink-0">
          {(['about', 'packages', 'portfolio', 'reviews'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-3 px-2 text-center text-[12px] font-bold capitalize"
              style={{
                fontFamily: 'var(--font-syne)',
                color: activeTab === tab ? '#4A0E6E' : '#7C6B8A',
                borderBottom: activeTab === tab ? '2px solid #4A0E6E' : '2px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* ── TAB CONTENT ── */}
        <div
          key={activeTab}
          className="flex-1 overflow-y-auto p-4 scrollbar-hide"
          style={{ animation: 'fadeUp 0.3s ease both' }}
        >
          {/* ABOUT */}
          {activeTab === 'about' && (
            <div>
              <p className="text-[13px] text-[#1A1A2E] leading-[1.7] mb-4">
                Bloom & Co is Houston&apos;s premier floral design studio specializing in lush, romantic arrangements for weddings and luxury events. We believe every event deserves florals that tell a story — wild, abundant, and deeply personal.
              </p>

              <div className="flex flex-wrap gap-[7px] mb-4">
                {['Botanical', 'Romantic', 'Afro-Luxe', 'Candlelit', 'Garden Party', 'Lush'].map(tag => (
                  <div
                    key={tag}
                    className="bg-[#F3E8FF] rounded-[20px] px-3 py-[5px] text-[11px] font-semibold text-[#4A0E6E]"
                    style={{ fontFamily: 'var(--font-syne)' }}
                  >
                    {tag}
                  </div>
                ))}
              </div>

              {[
                { icon: '📍', label: 'Service Area', val: 'Houston, TX · Up to 100 miles', valColor: '#1A1A2E' },
                { icon: '📅', label: 'Availability on your date', val: '✓ Available — Aug 14, 2025', valColor: '#0D9B6A' },
                { icon: '⏱️', label: 'Advance Notice Required', val: '30 days minimum', valColor: '#1A1A2E' },
                { icon: '🏛️', label: 'Business License', val: 'TX LLC #2847291 · Verified ✓', valColor: '#1A1A2E' },
                { icon: '🛡️', label: 'Insurance', val: '$1M liability · Active ✓', valColor: '#1A1A2E' },
                { icon: '💳', label: 'Cancellation Policy', val: 'Moderate — 50% refund up to 14 days', valColor: '#1A1A2E' },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#F3E8FF] flex items-center justify-center text-[14px] flex-shrink-0">
                    {row.icon}
                  </div>
                  <div>
                    <div className="text-[11px] text-[#7C6B8A]">{row.label}</div>
                    <div className="text-[13px] font-bold" style={{ fontFamily: 'var(--font-syne)', color: row.valColor }}>
                      {row.val}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PACKAGES */}
          {activeTab === 'packages' && (
            <div>
              {PACKAGES.map((pkg, i) => {
                const isSelected = selectedPkg === i
                const badgeStyle = BADGE_STYLES[pkg.badgeType]
                return (
                  <div
                    key={pkg.name}
                    onClick={() => setSelectedPkg(i)}
                    className="bg-white rounded-[14px] p-4 mb-2.5 cursor-pointer"
                    style={{
                      boxShadow: '0 2px 8px rgba(74,14,110,0.06)',
                      border: isSelected ? '2px solid #4A0E6E' : '2px solid transparent',
                      background: isSelected ? '#F3E8FF' : 'white',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[15px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-syne)' }}>
                        {pkg.name}
                      </span>
                      <span
                        className="text-[10px] font-bold px-2 py-[3px] rounded-[6px]"
                        style={{ fontFamily: 'var(--font-syne)', background: badgeStyle.bg, color: badgeStyle.color }}
                      >
                        {pkg.badge}
                      </span>
                    </div>
                    <div className="text-[22px] font-extrabold text-[#4A0E6E] mb-2" style={{ fontFamily: 'var(--font-syne)' }}>
                      {pkg.price} <span className="text-[13px] font-normal text-[#7C6B8A]">/ event</span>
                    </div>
                    <ul>
                      {pkg.includes.map(item => (
                        <li key={item} className="flex gap-2 items-start text-[12px] text-[#1A1A2E] py-1">
                          <span className="font-bold text-[#0D9B6A] flex-shrink-0">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        setSelectedPkg(i)
                      }}
                      className="w-full text-white text-[13px] font-bold rounded-[10px] py-[11px] mt-3"
                      style={{
                        fontFamily: 'var(--font-syne)',
                        background: isSelected ? '#0D9B6A' : '#4A0E6E',
                        transition: 'all 0.15s',
                      }}
                    >
                      {isSelected ? '✓ Selected' : 'Select Package'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* PORTFOLIO */}
          {activeTab === 'portfolio' && (
            <div className="grid grid-cols-3 gap-1.5">
              {PORTFOLIO_ITEMS.map((item, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-[10px] flex items-center justify-center text-[28px] cursor-pointer overflow-hidden"
                  style={{ background: item.bg, transition: 'transform 0.15s' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.transform = 'scale(0.97)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.transform = 'scale(1)')}
                >
                  {item.emoji}
                </div>
              ))}
            </div>
          )}

          {/* REVIEWS */}
          {activeTab === 'reviews' && (
            <div>
              {/* Summary card */}
              <div
                className="bg-white rounded-[14px] p-4 mb-3 flex gap-4 items-center"
                style={{ boxShadow: '0 2px 8px rgba(74,14,110,0.06)' }}
              >
                <div className="flex-shrink-0">
                  <div
                    className="text-[44px] font-extrabold text-[#1A1A2E] leading-none tracking-[-2px]"
                    style={{ fontFamily: 'var(--font-syne)' }}
                  >
                    4.9
                  </div>
                  <div className="flex gap-[3px] mt-1.5">
                    {[0, 1, 2, 3, 4].map(i => (
                      <span key={i} className="text-[16px]" style={{ color: '#D4AC0D' }}>★</span>
                    ))}
                  </div>
                  <div className="text-[11px] text-[#7C6B8A] mt-[3px]">87 reviews</div>
                </div>
                <div className="flex-1">
                  {REVIEW_BARS.map(row => (
                    <div key={row.star} className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] text-[#7C6B8A] w-2 text-right">{row.star}</span>
                      <div className="flex-1 h-[5px] bg-[#F3E8FF] rounded overflow-hidden">
                        <div className="h-full rounded" style={{ width: row.pct, background: '#D4AC0D' }} />
                      </div>
                      <span className="text-[10px] text-[#7C6B8A] w-4">{row.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review cards */}
              {REVIEWS.map(r => (
                <div
                  key={r.name}
                  className="bg-white rounded-[14px] p-3.5 mb-2.5"
                  style={{ boxShadow: '0 2px 8px rgba(74,14,110,0.06)' }}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <div
                      className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[16px] flex-shrink-0"
                      style={{ background: r.avatarBg }}
                    >
                      {r.avatar}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-syne)' }}>
                        {r.name}
                      </div>
                      <div className="text-[11px] text-[#7C6B8A]">{r.event}</div>
                    </div>
                    <div className="ml-auto text-[12px]" style={{ color: '#D4AC0D' }}>★★★★★</div>
                  </div>
                  <p className="text-[12px] text-[#1A1A2E] leading-[1.6]">{r.text}</p>
                  <div
                    className="inline-flex items-center gap-1 rounded-[5px] px-[7px] py-[2px] text-[10px] font-bold text-[#0D9B6A] mt-1.5"
                    style={{ fontFamily: 'var(--font-syne)', background: '#E6F7F2' }}
                  >
                    ✓ Verified Booking
                  </div>
                  <div className="text-[10px] text-[#7C6B8A] mt-1.5">{r.date}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── BOOKING FOOTER ── */}
        <div className="flex gap-2.5 items-center px-5 pt-3 pb-6 bg-white border-t border-[#F3E8FF] flex-shrink-0">
          <div className="flex-1">
            <div className="text-[11px] text-[#7C6B8A]">Starting from</div>
            <div
              className="text-[20px] font-extrabold text-[#1A1A2E] leading-none tracking-[-0.5px]"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              {footerPrice}
            </div>
            <div className="text-[11px] font-semibold text-[#0D9B6A] mt-0.5">✓ Available your date</div>
          </div>
          <button
            className="w-11 h-11 rounded-xl flex items-center justify-center text-[18px]"
            style={{ background: '#F3E8FF', transition: 'all 0.15s' }}
          >
            💬
          </button>
          <button
            onClick={() => setBooked(true)}
            className="text-white text-[14px] font-bold rounded-xl px-[22px] py-3.5 whitespace-nowrap"
            style={{
              fontFamily: 'var(--font-syne)',
              background: booked ? '#0D9B6A' : 'linear-gradient(135deg, #4A0E6E, #6B1F9A)',
              transition: 'all 0.15s',
            }}
          >
            {booked ? '✓ Added to Plan' : 'Book Now'}
          </button>
        </div>
      </div>
    </div>
  )
}
