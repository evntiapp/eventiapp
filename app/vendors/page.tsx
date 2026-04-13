'use client'

import { useState } from 'react'
import { Syne, Epilogue } from 'next/font/google'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne',
})

const epilogue = Epilogue({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-epilogue',
})

// ── Types ──────────────────────────────────────────────────────────────────────

interface GridVendor {
  icon: string; imgBg: string; category: string; name: string
  stars: string; rating: number; price: string
  verified: string; match?: number
}

interface ListVendor {
  icon: string; imgBg: string; name: string; category: string
  match: number; tags: string[]; stars: string
  rating: number; reviews: number; price: string
}

interface FilterSection {
  id: string; label: string; chips: string[]; defaults: string[]
}

// ── Static data ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  '✦ All', '🌸 Florals', '📸 Photo', '🍽️ Catering',
  '🎵 DJ', '🏛️ Venues', '💄 Beauty', '🍹 Bar', '🪑 Rentals',
]

const GRID_VENDORS: GridVendor[] = [
  { icon: '🌸', imgBg: 'linear-gradient(135deg,#E6F7F2,#A8DCC8)', category: 'Florals',     name: 'Bloom & Co',      stars: '★★★★★', rating: 4.9, price: '$2,200', verified: '✓ Pro',   match: 98 },
  { icon: '📸', imgBg: 'linear-gradient(135deg,#F3E8FF,#DDB8F5)', category: 'Photography', name: 'Lens & Light',    stars: '★★★★★', rating: 5.0, price: '$3,100', verified: '✓ Elite', match: 95 },
  { icon: '🎵', imgBg: 'linear-gradient(135deg,#FEF3E2,#FDDCB5)', category: 'DJ / Music',  name: 'DJ Smooth HTX',   stars: '★★★★★', rating: 4.8, price: '$1,450', verified: '✓ Pro',   match: 92 },
  { icon: '🍽️', imgBg: 'linear-gradient(135deg,#FDEDEC,#FAB8B2)', category: 'Catering',   name: 'Saffron & Co',    stars: '★★★★☆', rating: 4.7, price: '$4,800', verified: '✓ Pro',   match: 91 },
  { icon: '🏛️', imgBg: 'linear-gradient(135deg,#E3F2FD,#90CAF9)', category: 'Venue',      name: 'The Astorian',    stars: '★★★★★', rating: 4.9, price: '$5,500', verified: '✓ Elite' },
  { icon: '💄', imgBg: 'linear-gradient(135deg,#FCE4EC,#F48FB1)', category: 'Beauty',      name: 'Glam Squad HTX',  stars: '★★★★★', rating: 5.0, price: '$850',   verified: '✓ Pro' },
]

const LIST_VENDORS: ListVendor[] = [
  { icon: '🌸', imgBg: 'linear-gradient(135deg,#E6F7F2,#A8DCC8)', name: 'Bloom & Co Florals',   category: 'Florals & Décor · Houston, TX', match: 98, tags: ['Botanical', 'Romantic', 'Luxury'],       stars: '★★★★★', rating: 4.9, reviews: 87,  price: '$2,200' },
  { icon: '📸', imgBg: 'linear-gradient(135deg,#F3E8FF,#DDB8F5)', name: 'Lens & Light Studio',  category: 'Photography · Houston, TX',      match: 95, tags: ['Candlelit', 'Editorial', 'Film'],       stars: '★★★★★', rating: 5.0, reviews: 120, price: '$3,100' },
  { icon: '🎵', imgBg: 'linear-gradient(135deg,#FEF3E2,#FDDCB5)', name: 'DJ Smooth Houston',    category: 'DJ / Music · Houston, TX',       match: 92, tags: ['Afrobeats', 'R&B', 'Wedding'],         stars: '★★★★★', rating: 4.8, reviews: 64,  price: '$1,450' },
  { icon: '🍽️', imgBg: 'linear-gradient(135deg,#FDEDEC,#FAB8B2)', name: 'Saffron & Co Catering',category: 'Catering · Houston, TX',         match: 91, tags: ['Halal', 'West African', 'Fusion'],     stars: '★★★★☆', rating: 4.7, reviews: 43,  price: '$4,800' },
]

const FILTER_SECTIONS: FilterSection[] = [
  { id: 'verification', label: 'Verification', chips: ['All', '☑️ Basic', '✅ Pro', '🏆 Elite'],              defaults: ['All'] },
  { id: 'rating',       label: 'Rating',       chips: ['Any', '4.5+ ★', '4.8+ ★', '5.0 ★'],                  defaults: ['4.5+ ★'] },
  { id: 'availability', label: 'Availability', chips: ['Aug 14, 2025', 'Flexible'],                            defaults: ['Aug 14, 2025'] },
  { id: 'style',        label: 'Style',        chips: ['Romantic', 'Luxury', 'Boho', 'Modern', 'Cultural'],    defaults: ['Romantic', 'Luxury'] },
]

const NAV_ITEMS = [
  { icon: '🏠', label: 'Home' },
  { icon: '🔍', label: 'Vendors' },
  { icon: '📋', label: 'My Event' },
  { icon: '💬', label: 'Messages' },
  { icon: '👤', label: 'Profile' },
]

// ── Page ───────────────────────────────────────────────────────────────────────

export default function VendorsPage() {
  const [activeCat,   setActiveCat]   = useState('✦ All')
  const [view,        setView]        = useState<'grid' | 'list'>('grid')
  const [filterOpen,  setFilterOpen]  = useState(false)
  const [query,       setQuery]       = useState('')
  const [activeNav,   setActiveNav]   = useState('Vendors')
  const [savedVendors, setSavedVendors] = useState<Set<string>>(new Set())

  // Filter state: one Set per section
  const [filters, setFilters] = useState<Record<string, Set<string>>>(() =>
    Object.fromEntries(FILTER_SECTIONS.map(s => [s.id, new Set(s.defaults)]))
  )

  function toggleFilterChip(sectionId: string, chip: string) {
    setFilters(prev => {
      const next = { ...prev }
      const set = new Set(prev[sectionId])
      set.has(chip) ? set.delete(chip) : set.add(chip)
      next[sectionId] = set
      return next
    })
  }

  function toggleSave(name: string) {
    setSavedVendors(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  const activeFilterCount = Object.values(filters).reduce(
    (n, set) => n + (set.size > 0 ? 1 : 0), 0
  )

  return (
    <div
      className={`${syne.variable} ${epilogue.variable} min-h-screen bg-[#1A1A2E] flex items-center justify-center p-6`}
      style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}
    >
      {/* Phone frame — position:relative so the filter sheet can anchor to it */}
      <div
        className="w-[375px] h-[812px] bg-[#F8F4FC] rounded-[48px] overflow-hidden flex flex-col flex-shrink-0 relative"
        style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 10px #2D2D45, 0 0 0 12px #3D3D55' }}
      >
        {/* Notch */}
        <div className="w-[120px] h-8 bg-[#1A1A2E] rounded-b-[20px] mx-auto flex-shrink-0" />

        {/* ── SEARCH HEADER ── */}
        <div className="bg-[#1A1A2E] px-5 pt-[14px] pb-4 flex-shrink-0 relative overflow-hidden">
          {/* Decorative glow */}
          <div
            aria-hidden
            className="absolute w-[200px] h-[200px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(107,31,154,0.3) 0%, transparent 70%)', top: '-80px', right: '-40px' }}
          />

          {/* Title row */}
          <div className="flex items-center justify-between mb-[14px] relative z-[1]">
            <div
              className="text-[20px] font-extrabold text-white tracking-[-0.5px]"
              style={{ fontFamily: 'var(--font-syne)' }}
            >Find Vendors</div>
            <button
              className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-[10px] px-3 py-[7px] text-[12px] font-bold text-white cursor-pointer hover:bg-white/15 transition-colors duration-150"
              style={{ fontFamily: 'var(--font-syne)' }}
              onClick={() => setFilterOpen(true)}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#DDB8F5]" />
              Filters
            </button>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-2.5 bg-white/10 border-[1.5px] border-white/[0.12] rounded-2xl px-4 py-3 mb-[14px] relative z-[1] focus-within:border-[#DDB8F5] transition-colors duration-200">
            <span className="text-base flex-shrink-0">🔍</span>
            <input
              type="text"
              className="flex-1 bg-transparent border-none text-[14px] text-white outline-none placeholder:text-white/35"
              style={{ fontFamily: 'var(--font-epilogue)' }}
              placeholder="Search caterers, DJs, venues…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && (
              <span
                className="text-[14px] text-white/40 cursor-pointer flex-shrink-0"
                onClick={() => setQuery('')}
              >✕</span>
            )}
          </div>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5 relative z-[1]">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`flex items-center gap-[5px] rounded-[20px] px-3 py-1.5 text-[11px] font-bold whitespace-nowrap cursor-pointer border-[1.5px] flex-shrink-0 transition-all duration-200 ${
                  activeCat === cat
                    ? 'bg-[#6B1F9A] border-[#6B1F9A] text-white'
                    : 'bg-white/[0.08] border-white/10 text-white/70 hover:border-[#DDB8F5] hover:text-white'
                }`}
                style={{ fontFamily: 'var(--font-syne)' }}
                onClick={() => setActiveCat(cat)}
              >{cat}</button>
            ))}
          </div>
        </div>

        {/* ── BROWSE BODY ── */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-[18px] py-[14px]">

          {/* AI Picks Banner */}
          <div
            className="flex items-center gap-3 rounded-2xl p-[14px_16px] mb-[14px] cursor-pointer hover:-translate-y-px transition-transform duration-150"
            style={{ background: 'linear-gradient(135deg, #4A0E6E, #6B1F9A)' }}
          >
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-[20px] flex-shrink-0">✦</div>
            <div className="flex-1">
              <div
                className="text-[10px] font-bold text-white/50 tracking-[1px] uppercase mb-0.5"
                style={{ fontFamily: 'var(--font-syne)' }}
              >Curated for your wedding</div>
              <div
                className="text-[14px] font-extrabold text-white"
                style={{ fontFamily: 'var(--font-syne)' }}
              >24 AI-Matched Vendors</div>
              <div className="text-[11px] text-white/50 mt-[1px]">Based on your mood board &amp; $15K budget</div>
            </div>
            <div className="text-[20px] text-white/40">→</div>
          </div>

          {/* Section header + view toggle */}
          <div className="flex items-center justify-between mb-2.5" style={{ fontFamily: 'var(--font-syne)' }}>
            <span className="text-[13px] font-bold text-[#1A1A2E] tracking-[-0.2px]">
              All Vendors <span className="text-[11px] font-medium text-[#7C6B8A]">(142)</span>
            </span>
            <div className="flex gap-1 bg-[#F3E8FF] rounded-lg p-[3px]">
              {(['grid', 'list'] as const).map((v) => (
                <button
                  key={v}
                  className={`px-2 py-1 rounded-md text-[14px] cursor-pointer border-none transition-all duration-150 ${
                    view === v ? 'bg-white shadow-[0_1px_4px_rgba(74,14,110,0.1)]' : 'bg-transparent'
                  }`}
                  onClick={() => setView(v)}
                >{v === 'grid' ? '⊞' : '☰'}</button>
              ))}
            </div>
          </div>

          {/* ── GRID VIEW ── */}
          {view === 'grid' && (
            <div className="grid grid-cols-2 gap-2.5 mb-[14px]">
              {GRID_VENDORS.map((v) => (
                <div
                  key={v.name}
                  className="bg-white rounded-2xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-[#DDB8F5] hover:-translate-y-0.5 transition-all duration-200"
                  style={{ boxShadow: '0 2px 8px rgba(74,14,110,0.06)', animation: 'popIn 0.3s ease both' }}
                >
                  {/* Image area */}
                  <div
                    className="h-[90px] flex items-center justify-center text-[36px] relative"
                    style={{ background: v.imgBg }}
                  >
                    {/* Match badge */}
                    {v.match && (
                      <div
                        className="absolute top-1.5 left-1.5 bg-[#4A0E6E]/85 rounded-md px-1.5 py-[2px] text-[9px] font-bold text-[#DDB8F5]"
                        style={{ fontFamily: 'var(--font-syne)' }}
                      >{v.match}%</div>
                    )}
                    {v.icon}
                    {/* Verified badge */}
                    <div
                      className="absolute top-1.5 right-1.5 bg-[#0D9B6A] rounded-md px-1.5 py-[2px] text-[9px] font-bold text-white"
                      style={{ fontFamily: 'var(--font-syne)' }}
                    >{v.verified}</div>
                  </div>
                  {/* Card body */}
                  <div className="px-2.5 pt-2.5 pb-3">
                    <div
                      className="text-[9px] font-bold tracking-[1px] uppercase text-[#7C6B8A] mb-0.5"
                      style={{ fontFamily: 'var(--font-syne)' }}
                    >{v.category}</div>
                    <div
                      className="text-[12px] font-bold text-[#1A1A2E] mb-1 truncate"
                      style={{ fontFamily: 'var(--font-syne)' }}
                    >{v.name}</div>
                    <div className="flex items-center gap-1 mb-1.5">
                      <span className="text-[10px] text-[#D4AC0D]">{v.stars}</span>
                      <span className="text-[10px] text-[#7C6B8A]">{v.rating}</span>
                    </div>
                    <div
                      className="text-[13px] font-extrabold text-[#4A0E6E]"
                      style={{ fontFamily: 'var(--font-syne)' }}
                    >
                      {v.price} <span className="text-[10px] font-normal text-[#7C6B8A]">from</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── LIST VIEW ── */}
          {view === 'list' && (
            <div className="flex flex-col gap-2.5 mb-[14px]">
              {LIST_VENDORS.map((v) => {
                const saved = savedVendors.has(v.name)
                return (
                  <div
                    key={v.name}
                    className="bg-white rounded-2xl p-[14px] flex gap-3 cursor-pointer border-2 border-transparent hover:border-[#DDB8F5] hover:translate-x-[3px] transition-all duration-200"
                    style={{ boxShadow: '0 2px 8px rgba(74,14,110,0.06)' }}
                  >
                    {/* Image */}
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-[28px] flex-shrink-0 relative"
                      style={{ background: v.imgBg }}
                    >
                      {v.icon}
                      {/* Verified circle */}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#0D9B6A] border-2 border-white flex items-center justify-center text-[9px] text-white">✓</div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1.5 mb-[3px]">
                        <div
                          className="text-[14px] font-bold text-[#1A1A2E]"
                          style={{ fontFamily: 'var(--font-syne)' }}
                        >{v.name}</div>
                        <div
                          className="text-[11px] font-extrabold text-[#0D9B6A] flex-shrink-0"
                          style={{ fontFamily: 'var(--font-syne)' }}
                        >{v.match}% match</div>
                      </div>
                      <div className="text-[11px] text-[#7C6B8A] mb-[5px]">{v.category}</div>
                      <div className="flex gap-[5px] flex-wrap mb-1.5">
                        {v.tags.map(tag => (
                          <div
                            key={tag}
                            className="bg-[#F3E8FF] rounded-[5px] px-[7px] py-[2px] text-[10px] font-semibold text-[#4A0E6E]"
                            style={{ fontFamily: 'var(--font-syne)' }}
                          >{tag}</div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-[#D4AC0D]">{v.stars}</span>
                          <span className="text-[11px] text-[#7C6B8A]">{v.rating} ({v.reviews})</span>
                        </div>
                        <div
                          className="text-[14px] font-extrabold text-[#4A0E6E]"
                          style={{ fontFamily: 'var(--font-syne)' }}
                        >{v.price}</div>
                        <button
                          className={`rounded-lg px-3 py-1.5 text-[11px] font-bold cursor-pointer border-none transition-all duration-150 ${
                            saved
                              ? 'bg-[#E6F7F2] text-[#0D9B6A]'
                              : 'bg-[#4A0E6E] text-white hover:bg-[#6B1F9A]'
                          }`}
                          style={{ fontFamily: 'var(--font-syne)' }}
                          onClick={e => { e.stopPropagation(); toggleSave(v.name) }}
                        >{saved ? '✓ Saved' : '+ Save'}</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </div>

        {/* ── BOTTOM NAV ── */}
        <div className="flex bg-white border-t border-[#F3E8FF] pt-2.5 pb-4 flex-shrink-0">
          {NAV_ITEMS.map(({ icon, label }) => (
            <button
              key={label}
              className="flex-1 flex flex-col items-center gap-[3px] py-1.5 border-none bg-transparent cursor-pointer"
              onClick={() => setActiveNav(label)}
            >
              <span className="text-[20px]">{icon}</span>
              <span
                className="text-[10px] font-bold"
                style={{ color: activeNav === label ? '#4A0E6E' : '#7C6B8A', fontFamily: 'var(--font-syne)' }}
              >{label}</span>
            </button>
          ))}
        </div>

        {/* ── FILTER OVERLAY ── */}
        {filterOpen && (
          <div
            className="absolute inset-0 bg-black/40 z-[99]"
            onClick={() => setFilterOpen(false)}
          />
        )}

        {/* ── FILTER SHEET ── */}
        {filterOpen && (
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] px-[22px] pt-5 pb-9 z-[100]"
            style={{ boxShadow: '0 -20px 60px rgba(74,14,110,0.2)', animation: 'slideUp 0.3s ease both' }}
          >
            {/* Handle */}
            <div className="w-9 h-1 rounded-sm bg-[#DDB8F5] mx-auto mb-4" />

            <div
              className="text-[16px] font-extrabold text-[#1A1A2E] mb-4"
              style={{ fontFamily: 'var(--font-syne)' }}
            >Filter Vendors</div>

            {/* Verification */}
            {FILTER_SECTIONS.map(section => (
              <div key={section.id} className="mb-4">
                <div
                  className="text-[11px] font-bold tracking-[1px] uppercase text-[#7C6B8A] mb-2"
                  style={{ fontFamily: 'var(--font-syne)' }}
                >{section.label}</div>
                <div className="flex gap-[7px] flex-wrap">
                  {section.chips.map(chip => {
                    const active = filters[section.id]?.has(chip)
                    return (
                      <button
                        key={chip}
                        className={`bg-[#F8F4FC] border-2 rounded-[20px] px-3 py-1.5 text-[12px] font-semibold cursor-pointer transition-all duration-150 ${
                          active
                            ? 'bg-[#4A0E6E] border-[#4A0E6E] text-white'
                            : 'border-[#DDB8F5] text-[#1A1A2E] hover:border-[#4A0E6E]'
                        }`}
                        style={{ fontFamily: 'var(--font-syne)' }}
                        onClick={() => toggleFilterChip(section.id, chip)}
                      >{chip}</button>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Price Range */}
            <div className="mb-4">
              <div
                className="text-[11px] font-bold tracking-[1px] uppercase text-[#7C6B8A] mb-2"
                style={{ fontFamily: 'var(--font-syne)' }}
              >Price Range</div>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min $"
                  className="flex-1 bg-[#F8F4FC] border-2 border-[#DDB8F5] rounded-[10px] px-3 py-2.5 text-[13px] text-[#1A1A2E] outline-none focus:border-[#4A0E6E] transition-colors duration-200"
                  style={{ fontFamily: 'var(--font-epilogue)' }}
                />
                <input
                  type="number"
                  placeholder="Max $"
                  className="flex-1 bg-[#F8F4FC] border-2 border-[#DDB8F5] rounded-[10px] px-3 py-2.5 text-[13px] text-[#1A1A2E] outline-none focus:border-[#4A0E6E] transition-colors duration-200"
                  style={{ fontFamily: 'var(--font-epilogue)' }}
                />
              </div>
            </div>

            {/* Apply */}
            <button
              className="w-full bg-[#4A0E6E] text-white text-[15px] font-bold border-none rounded-2xl py-[15px] cursor-pointer mt-2 hover:-translate-y-px transition-all duration-150"
              style={{ fontFamily: 'var(--font-syne)' }}
              onClick={() => setFilterOpen(false)}
            >Apply Filters</button>
          </div>
        )}

      </div>
    </div>
  )
}
