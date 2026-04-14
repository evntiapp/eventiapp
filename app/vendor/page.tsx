'use client'
import { useState } from 'react'
import { Syne, Epilogue } from 'next/font/google'

const syne = Syne({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-syne' })
const epilogue = Epilogue({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-epilogue' })

// ── Types ──────────────────────────────────────────────────────────────────────
type Screen = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

type DayState = 'available' | 'blocked' | 'today' | 'empty'

interface RequestCard {
  id: string
  name: string
  event: string
  date: string
  guests: string
  price: string
  badge: 'new' | 'pending'
  borderColor: string
  secondaryAction: { label: string; type: 'message' | 'counter' }
}

// ── Static data ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { icon: '🍽️', name: 'Catering',      sub: 'Food & cuisine' },
  { icon: '🎵', name: 'DJ / Music',    sub: 'Live or recorded' },
  { icon: '📸', name: 'Photography',   sub: 'Photo & video' },
  { icon: '🌸', name: 'Florals & Décor', sub: 'Design & styling' },
  { icon: '🍹', name: 'Bar Service',   sub: 'Full bar / mocktail' },
  { icon: '🏛️', name: 'Venue',         sub: 'Space rental' },
  { icon: '💄', name: 'Hair & Makeup', sub: 'Beauty services' },
  { icon: '🪑', name: 'Rentals',       sub: 'Furniture & equipment' },
  { icon: '🎪', name: 'Entertainment', sub: 'Acts & performers' },
  { icon: '🚗', name: 'Transport',     sub: 'Limo, party bus' },
]

// June 2025 calendar — 6 empty prefix, days 1–21 shown
const CAL_INITIAL: DayState[] = [
  'empty','empty','empty','empty','empty','empty',
  'available','available','blocked','available','available','available','available',
  'available','available','available','today','available','blocked','blocked',
  'available','available','available','available','available','available','available',
]

const VERIF_ITEMS = [
  { id: 'id',     title: 'Government-Issued ID',       sub: "Driver's license or passport",   action: 'Upload →' },
  { id: 'selfie', title: 'Selfie with ID',              sub: 'Hold your ID next to your face', action: 'Take Photo →' },
  { id: 'biz',    title: 'Business License',            sub: 'LLC registration or business permit', action: 'Upload →' },
  { id: 'ins',    title: 'Liability Insurance (COI)',   sub: 'Certificate of insurance',       action: 'Upload →' },
  { id: 'ein',    title: 'EIN / Tax ID',                sub: 'IRS SS-4 or confirmation letter', action: 'Upload →' },
]

const REQUESTS: RequestCard[] = [
  {
    id: 'r1', name: 'Aisha Johnson', event: '💍 Wedding · Premium Package',
    date: '📅 Aug 14, 2025', guests: '👥 200 guests', price: '💰 $2,400',
    badge: 'new', borderColor: '#4A0E6E',
    secondaryAction: { label: '💬 Message', type: 'message' },
  },
  {
    id: 'r2', name: 'Marcus Williams', event: '🎂 Birthday · Standard Package',
    date: '📅 Jul 19, 2025', guests: '👥 80 guests', price: '💰 $950',
    badge: 'pending', borderColor: '#E67E22',
    secondaryAction: { label: '↔ Counter', type: 'counter' },
  },
]

const UPCOMING = [
  { day: '22', month: 'Jun', title: 'Taylor & Zach Wedding', detail: 'The Astorian · 180 guests', statusBg: '#E6F7F2', statusColor: '#0D9B6A', statusLabel: 'Confirmed' },
  { day: '28', month: 'Jun', title: "Keisha's 40th Birthday", detail: 'The Dunlavy · 60 guests', statusBg: '#F3E8FF', statusColor: '#4A0E6E', statusLabel: 'Deposit Paid' },
  { day: '5',  month: 'Jul', title: 'TechCorp Summer Gala',  detail: 'Hotel ZaZa · 300 guests',  statusBg: '#FEF3E2', statusColor: '#E67E22', statusLabel: 'Balance Due' },
]

// ── Small reusable components ──────────────────────────────────────────────────
function StepHeader({ step, total, doneCount, label, question, hint, onBack }: {
  step: number; total: number; doneCount: number
  label: string; question: string; hint?: string; onBack: () => void
}) {
  return (
    <div className="px-[22px] pt-3.5 flex-shrink-0">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className="flex-1 h-[3px] rounded-[3px]" style={{ background: i < doneCount ? '#4A0E6E' : '#DDB8F5' }} />
        ))}
      </div>
      <button
        onClick={onBack}
        className="w-[34px] h-[34px] rounded-[10px] bg-white flex items-center justify-center text-base text-[#1A1A2E] mb-3.5"
        style={{ boxShadow: '0 2px 8px rgba(74,14,110,0.1)', border: 'none', cursor: 'pointer' }}
      >←</button>
      <div className="text-[10px] uppercase tracking-[2px] text-[#7C6B8A] mb-1">{label}</div>
      <div className="text-[20px] font-bold text-[#1A1A2E] tracking-[-0.4px] leading-[1.2]" style={{ fontFamily: 'var(--font-syne)' }}>{question}</div>
      {hint && <div className="text-[12px] text-[#7C6B8A] mt-[5px] leading-[1.5]">{hint}</div>}
    </div>
  )
}

function NavDots({ total, active }: { total: number; active: number }) {
  return (
    <div className="flex justify-center gap-1.5 py-2 flex-shrink-0">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1.5 rounded-[4px]"
          style={{ width: i === active ? '20px' : '6px', background: i === active ? '#4A0E6E' : '#DDB8F5', transition: 'all 0.3s' }}
        />
      ))}
    </div>
  )
}

function InputField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="block text-[11px] font-semibold uppercase tracking-[0.5px] text-[#7C6B8A] mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const fieldCls = "w-full bg-white border-2 border-[#DDB8F5] rounded-xl px-[15px] py-[13px] text-[14px] text-[#1A1A2E] outline-none focus:border-[#4A0E6E] placeholder-[#C0ACD4]"

function NextBtn({ label, onClick, green }: { label: string; onClick: () => void; green?: boolean }) {
  return (
    <div className="px-[22px] pb-[26px] flex-shrink-0">
      <button
        onClick={onClick}
        className="w-full text-white font-bold text-[15px] rounded-[14px] py-4 flex items-center justify-center gap-2"
        style={{ fontFamily: 'var(--font-syne)', background: green ? '#0D9B6A' : '#4A0E6E', border: 'none', cursor: 'pointer' }}
      >
        {label}
      </button>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function VendorPage() {
  const [screen, setScreen] = useState<Screen>(0)
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set())
  const [bookingPref, setBookingPref] = useState<'instant' | 'request'>('instant')
  const [calDays, setCalDays] = useState<DayState[]>(CAL_INITIAL)
  const [verifDone, setVerifDone] = useState<Set<string>>(new Set())
  const [bgCheck, setBgCheck] = useState(false)
  const [acceptedReqs, setAcceptedReqs] = useState<Set<string>>(new Set())
  const [declinedReqs, setDeclinedReqs] = useState<Set<string>>(new Set())

  function toggleCat(name: string) {
    setSelectedCats(prev => { const n = new Set(prev); n.has(name) ? n.delete(name) : n.add(name); return n })
  }

  function toggleDay(i: number) {
    setCalDays(prev => {
      const next = [...prev]
      if (next[i] === 'empty') return next
      if (next[i] === 'today') return next
      next[i] = next[i] === 'available' ? 'blocked' : 'available'
      return next
    })
  }

  function toggleVerif(id: string) {
    setVerifDone(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const go = (n: number) => setScreen(n as Screen)

  return (
    <div
      className={`${syne.variable} ${epilogue.variable} min-h-screen bg-[#1A1A2E] flex items-center justify-center gap-8 flex-wrap p-6`}
      style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}
    >

      {/* ══ PHONE 1: VENDOR ONBOARDING ══ */}
      <div className="flex flex-col items-center">
        <div className="mb-3 text-[11px] font-bold uppercase tracking-[2px] text-center" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-syne)' }}>
          Vendor Onboarding
        </div>
        <div
          className="w-[375px] h-[812px] bg-[#F8F4FC] rounded-[48px] overflow-hidden flex flex-col flex-shrink-0"
          style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 10px #2D2D45, 0 0 0 12px #3D3D55' }}
        >
          <div className="w-[120px] h-8 bg-[#1A1A2E] rounded-b-[20px] mx-auto flex-shrink-0 z-10" />
          <div className="flex-1 flex flex-col overflow-hidden" key={screen} style={{ animation: 'slideIn 0.35s cubic-bezier(0.16,1,0.3,1) both' }}>

            {/* ── SCREEN 0: SPLASH ── */}
            {screen === 0 && (
              <div
                className="flex-1 flex flex-col items-center justify-center px-8 py-10 relative overflow-hidden"
                style={{ background: '#1A1A2E' }}
              >
                <div className="absolute w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(74,14,110,0.3) 0%, transparent 70%)', top: '-80px', right: '-100px' }} />
                <div className="absolute w-[250px] h-[250px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(221,184,245,0.08) 0%, transparent 70%)', bottom: '80px', left: '-50px' }} />
                <div className="inline-block rounded-[20px] px-3.5 py-1.5 text-[11px] uppercase tracking-[2px] mb-6 relative z-[1]" style={{ background: 'rgba(221,184,245,0.15)', border: '1px solid rgba(221,184,245,0.3)', color: '#DDB8F5', animation: 'fadeUp 0.5s 0.1s ease both' }}>
                  For Vendors
                </div>
                <div className="text-[36px] font-extrabold text-white tracking-[-1px] relative z-[1]" style={{ fontFamily: 'var(--font-syne)', animation: 'fadeUp 0.5s 0.2s ease both' }}>
                  Easy <span style={{ color: '#DDB8F5' }}>Events</span>
                </div>
                <div className="text-[14px] text-center mt-3 leading-[1.7] relative z-[1]" style={{ color: 'rgba(255,255,255,0.5)', animation: 'fadeUp 0.5s 0.3s ease both' }}>
                  Join thousands of vendors already getting booked through the platform. Set your schedule. You decide what you accept.
                </div>
                <div className="flex gap-4 mt-8 w-full relative z-[1]" style={{ animation: 'fadeUp 0.5s 0.4s ease both' }}>
                  {[{ num: '12K+', label: 'Events Planned' }, { num: '$2.4M', label: 'Paid to Vendors' }, { num: '4.9★', label: 'Avg Rating' }].map(s => (
                    <div key={s.label} className="flex-1 rounded-[14px] py-3.5 px-2.5 text-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div className="text-[20px] font-extrabold" style={{ fontFamily: 'var(--font-syne)', color: '#DDB8F5' }}>{s.num}</div>
                      <div className="text-[10px] mt-[3px] tracking-[0.5px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => go(1)} className="mt-8 w-full text-white font-bold text-[15px] rounded-[16px] py-[17px] relative z-[1]" style={{ fontFamily: 'var(--font-syne)', background: '#4A0E6E', border: 'none', cursor: 'pointer', animation: 'fadeUp 0.5s 0.5s ease both' }}>
                  List Your Business ✦
                </button>
                <div className="mt-3 text-[13px] relative z-[1]" style={{ color: 'rgba(255,255,255,0.35)', animation: 'fadeUp 0.5s 0.6s ease both' }}>
                  Already listed? <span className="underline cursor-pointer" style={{ color: 'rgba(255,255,255,0.7)', textUnderlineOffset: '3px' }}>Sign in</span>
                </div>
              </div>
            )}

            {/* ── SCREEN 1: BUSINESS INFO ── */}
            {screen === 1 && (
              <>
                <StepHeader step={1} total={5} doneCount={1} label="Step 1 of 5 — Business Info" question="Tell us about your business." onBack={() => go(0)} />
                <div className="flex-1 overflow-y-auto scrollbar-hide px-[22px] pt-4">
                  <InputField label="Business Name"><input className={fieldCls} placeholder="e.g. Bloom & Co Florals" /></InputField>
                  <InputField label="Owner / Contact Name"><input className={fieldCls} placeholder="Your full name" /></InputField>
                  <div className="grid grid-cols-2 gap-2.5">
                    <InputField label="Phone"><input className={fieldCls} type="tel" placeholder="+1 (713)..." /></InputField>
                    <InputField label="Email"><input className={fieldCls} type="email" placeholder="you@biz.com" /></InputField>
                  </div>
                  <InputField label="Business Address"><input className={fieldCls} placeholder="Street, City, State" /></InputField>
                  <InputField label="Service Radius">
                    <select className={fieldCls} style={{ appearance: 'none' }}>
                      <option disabled>How far will you travel?</option>
                      <option>My city only</option>
                      <option>Within 50 miles</option>
                      <option>Within 100 miles</option>
                      <option>Statewide</option>
                      <option>Nationwide</option>
                      <option>International</option>
                    </select>
                  </InputField>
                  <InputField label="Bio / Description"><textarea className={fieldCls} rows={3} placeholder="Tell clients what makes you special…" style={{ resize: 'none', lineHeight: '1.6' }} /></InputField>
                  <div className="h-3" />
                </div>
                <NavDots total={5} active={0} />
                <NextBtn label="Continue →" onClick={() => go(2)} />
              </>
            )}

            {/* ── SCREEN 2: CATEGORY ── */}
            {screen === 2 && (
              <>
                <StepHeader step={2} total={5} doneCount={2} label="Step 2 of 5 — Category" question="What do you offer?" hint="Select all that apply." onBack={() => go(1)} />
                <div className="flex-1 overflow-y-auto scrollbar-hide px-[22px] pt-4">
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map(cat => {
                      const sel = selectedCats.has(cat.name)
                      return (
                        <div
                          key={cat.name}
                          onClick={() => toggleCat(cat.name)}
                          className="bg-white rounded-xl p-3 flex items-center gap-2.5 cursor-pointer"
                          style={{ border: `2px solid ${sel ? '#4A0E6E' : 'transparent'}`, background: sel ? '#F3E8FF' : 'white', boxShadow: '0 2px 6px rgba(74,14,110,0.06)', transition: 'all 0.2s' }}
                        >
                          <span className="text-[20px] flex-shrink-0">{cat.icon}</span>
                          <div>
                            <div className="text-[12px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-syne)' }}>{cat.name}</div>
                            <div className="text-[10px] text-[#7C6B8A] mt-[1px]">{cat.sub}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="h-3" />
                </div>
                <NavDots total={5} active={1} />
                <NextBtn label="Continue →" onClick={() => go(3)} />
              </>
            )}

            {/* ── SCREEN 3: PORTFOLIO & PACKAGES ── */}
            {screen === 3 && (
              <>
                <StepHeader step={3} total={5} doneCount={3} label="Step 3 of 5 — Portfolio & Packages" question="Show your work. Set your prices." onBack={() => go(2)} />
                <div className="flex-1 overflow-y-auto scrollbar-hide px-[22px] pt-4">
                  <div className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#7C6B8A] mb-2.5" style={{ fontFamily: 'var(--font-syne)' }}>Portfolio Photos</div>
                  <div className="grid grid-cols-3 gap-2 mb-3.5">
                    {/* Cover slot (filled) */}
                    <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '1' }}>
                      <div className="w-full h-full flex items-center justify-center text-[28px]" style={{ background: 'linear-gradient(135deg,#E8D5F5,#C4A0E8)' }}>🌸</div>
                      <div className="absolute top-1.5 left-1.5 bg-[#4A0E6E] text-white rounded-[6px] px-[7px] py-[3px] text-[9px] font-bold" style={{ fontFamily: 'var(--font-syne)' }}>Cover</div>
                    </div>
                    {/* Empty slots */}
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex flex-col items-center justify-center gap-1 rounded-xl cursor-pointer text-[20px] text-[#7C6B8A] bg-white" style={{ aspectRatio: '1', border: '2px dashed #DDB8F5', transition: 'all 0.2s' }}>
                        📷
                        <span className="text-[10px] font-semibold" style={{ fontFamily: 'var(--font-syne)' }}>Add Photo</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#7C6B8A] mb-2.5" style={{ fontFamily: 'var(--font-syne)' }}>Your Packages</div>

                  {[
                    { name: 'Basic Package',    badgeLabel: 'Starter',  badgeBg: '#E6F7F2', badgeColor: '#0D9B6A', defaultName: 'Basic' },
                    { name: 'Standard Package', badgeLabel: 'Popular',  badgeBg: '#F3E8FF', badgeColor: '#4A0E6E', defaultName: 'Standard' },
                    { name: 'Premium Package',  badgeLabel: 'Premium',  badgeBg: '#FEF9E7', badgeColor: '#D4AC0D', defaultName: 'Premium' },
                  ].map(pkg => (
                    <div key={pkg.name} className="bg-white rounded-[14px] p-3.5 mb-2.5" style={{ border: '2px solid #DDB8F5' }}>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="text-[14px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-syne)' }}>{pkg.name}</div>
                        <span className="text-[10px] font-bold px-2 py-[3px] rounded-[6px]" style={{ fontFamily: 'var(--font-syne)', background: pkg.badgeBg, color: pkg.badgeColor }}>{pkg.badgeLabel}</span>
                      </div>
                      <div className="flex gap-2 mb-2">
                        <input className="flex-1 rounded-[10px] px-3 py-2.5 text-[13px] text-[#1A1A2E] outline-none" style={{ background: '#F8F4FC', border: '1.5px solid #DDB8F5' }} defaultValue={pkg.defaultName} />
                        <input className="rounded-[10px] px-3 py-2.5 text-[13px] text-[#1A1A2E] outline-none" style={{ background: '#F8F4FC', border: '1.5px solid #DDB8F5', maxWidth: '90px' }} placeholder="$ Price" />
                      </div>
                      <input className="w-full rounded-[10px] px-3 py-2.5 text-[13px] text-[#1A1A2E] outline-none" style={{ background: '#F8F4FC', border: '1.5px solid #DDB8F5' }} placeholder="What's included?" />
                    </div>
                  ))}
                  <div className="h-3" />
                </div>
                <NavDots total={5} active={2} />
                <NextBtn label="Continue →" onClick={() => go(4)} />
              </>
            )}

            {/* ── SCREEN 4: AVAILABILITY ── */}
            {screen === 4 && (
              <>
                <StepHeader step={4} total={5} doneCount={4} label="Step 4 of 5 — Availability" question="Set your schedule & booking rules." onBack={() => go(3)} />
                <div className="flex-1 overflow-y-auto scrollbar-hide px-[22px] pt-4">
                  <div className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#7C6B8A] mb-2.5" style={{ fontFamily: 'var(--font-syne)' }}>How would you like to accept bookings?</div>
                  <div className="flex gap-2 mb-3.5">
                    {[
                      { id: 'instant', icon: '⚡', name: 'Instant Book', desc: 'Auto-confirm when client books your open dates' },
                      { id: 'request', icon: '✋', name: 'Request Only', desc: 'Review each request before accepting' },
                    ].map(p => (
                      <div
                        key={p.id}
                        onClick={() => setBookingPref(p.id as 'instant' | 'request')}
                        className="flex-1 rounded-xl p-3 text-center cursor-pointer"
                        style={{ border: `2px solid ${bookingPref === p.id ? '#4A0E6E' : '#DDB8F5'}`, background: bookingPref === p.id ? '#F3E8FF' : 'white', transition: 'all 0.2s' }}
                      >
                        <div className="text-[20px] mb-1">{p.icon}</div>
                        <div className="text-[11px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-syne)' }}>{p.name}</div>
                        <div className="text-[10px] text-[#7C6B8A] mt-[2px] leading-[1.4]">{p.desc}</div>
                      </div>
                    ))}
                  </div>

                  {/* Mini calendar */}
                  <div className="bg-white rounded-[14px] p-3.5 mb-3.5">
                    <div className="flex items-center justify-between mb-3">
                      <button className="text-base text-[#7C6B8A] px-2 py-1 bg-transparent border-none cursor-pointer">‹</button>
                      <span className="text-[14px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-syne)' }}>June 2025</span>
                      <button className="text-base text-[#7C6B8A] px-2 py-1 bg-transparent border-none cursor-pointer">›</button>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                        <div key={d} className="text-[10px] text-center font-semibold text-[#7C6B8A] py-1" style={{ fontFamily: 'var(--font-syne)' }}>{d}</div>
                      ))}
                      {calDays.map((state, i) => {
                        const dayNum = i - 5
                        const dayLabel = dayNum > 0 ? String(dayNum) : ''
                        const bgMap: Record<DayState, string> = {
                          empty: 'transparent', available: '#E6F7F2', blocked: '#FDEDEC', today: '#4A0E6E',
                        }
                        const colorMap: Record<DayState, string> = {
                          empty: 'transparent', available: '#0D9B6A', blocked: '#C0392B', today: 'white',
                        }
                        return (
                          <div
                            key={i}
                            onClick={() => dayLabel && toggleDay(i)}
                            className="flex items-center justify-center rounded-lg text-[12px] font-semibold"
                            style={{
                              aspectRatio: '1',
                              background: bgMap[state],
                              color: colorMap[state],
                              textDecoration: state === 'blocked' ? 'line-through' : 'none',
                              cursor: state === 'empty' ? 'default' : 'pointer',
                              fontFamily: 'var(--font-syne)',
                              transition: 'all 0.15s',
                            }}
                          >
                            {dayLabel}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex gap-2.5 text-[11px] font-semibold text-[#7C6B8A] mb-3.5" style={{ fontFamily: 'var(--font-syne)' }}>
                    {[
                      { bg: '#E6F7F2', border: '#0D9B6A', label: 'Available' },
                      { bg: '#FDEDEC', border: '#C0392B', label: 'Blocked' },
                      { bg: '#4A0E6E', border: '#4A0E6E', label: 'Today' },
                    ].map(l => (
                      <span key={l.label} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-[3px] inline-block" style={{ background: l.bg, border: `1px solid ${l.border}` }} />
                        {l.label}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <InputField label="Max Events / Month"><input className={fieldCls} type="number" placeholder="e.g. 8" /></InputField>
                    <InputField label="Advance Notice">
                      <select className={fieldCls} style={{ appearance: 'none' }}>
                        <option>7 days</option><option>14 days</option><option defaultValue="30">30 days</option><option>60 days</option>
                      </select>
                    </InputField>
                  </div>
                  <div className="h-3" />
                </div>
                <NavDots total={5} active={3} />
                <NextBtn label="Continue →" onClick={() => go(5)} />
              </>
            )}

            {/* ── SCREEN 5: PAYOUT SETUP ── */}
            {screen === 5 && (
              <>
                <StepHeader step={5} total={5} doneCount={5} label="Step 5 of 5 — Get Paid" question="How should we pay you?" hint="Payouts are sent automatically after each confirmed event." onBack={() => go(4)} />
                <div className="flex-1 overflow-y-auto scrollbar-hide px-[22px] pt-4">
                  <InputField label="Payout Method">
                    <select className={fieldCls} style={{ appearance: 'none' }}>
                      <option>Bank Transfer (ACH)</option>
                      <option>Instant Payout (Debit Card)</option>
                      <option>PayPal</option>
                      <option>Zelle</option>
                    </select>
                  </InputField>
                  <InputField label="Account Holder Name"><input className={fieldCls} placeholder="As it appears on account" /></InputField>
                  <InputField label="Routing Number"><input className={fieldCls} placeholder="9-digit routing number" /></InputField>
                  <InputField label="Account Number"><input className={fieldCls} placeholder="Your account number" /></InputField>
                  <div className="rounded-xl p-3.5 mt-1 mb-3.5" style={{ background: '#F3E8FF' }}>
                    <div className="text-[12px] font-bold text-[#4A0E6E] mb-1.5" style={{ fontFamily: 'var(--font-syne)' }}>💳 How payouts work</div>
                    <div className="text-[12px] text-[#7C6B8A] leading-[1.6]">Client pays deposit → funds held securely → you confirm booking → deposit releases to you minus 12% platform fee → remaining balance paid after the event.</div>
                  </div>
                  <InputField label="Cancellation Policy">
                    <select className={fieldCls} style={{ appearance: 'none' }}>
                      <option>Flexible — Full refund up to 7 days before</option>
                      <option>Moderate — 50% refund up to 14 days before</option>
                      <option>Strict — Non-refundable after booking</option>
                    </select>
                  </InputField>
                  <div className="h-3" />
                </div>
                <NavDots total={5} active={4} />
                <NextBtn label="Continue →" onClick={() => go(6)} />
              </>
            )}

            {/* ── SCREEN 6: VERIFICATION ── */}
            {screen === 6 && (
              <>
                <StepHeader step={6} total={6} doneCount={5} label="Step 6 of 6 — Verification" question="Let's verify your business." hint="Verified vendors get 3x more bookings. This protects you and your clients." onBack={() => go(5)} />
                <div className="flex-1 overflow-y-auto scrollbar-hide px-[22px] pt-4">
                  {/* Tier badges */}
                  <div className="flex gap-2 mb-4">
                    {[
                      { icon: '☑️', label: 'Basic', sub: 'ID + phone', bg: '#E6F7F2', border: '#0D9B6A', color: '#0D9B6A' },
                      { icon: '✅', label: 'Pro', sub: 'License + insurance', bg: '#F3E8FF', border: '#4A0E6E', color: '#4A0E6E' },
                      { icon: '🏆', label: 'Elite', sub: 'Background check', bg: '#FEF9E7', border: '#D4AC0D', color: '#D4AC0D' },
                    ].map(t => (
                      <div key={t.label} className="flex-1 rounded-xl p-3 text-center" style={{ background: t.bg, border: `2px solid ${t.border}` }}>
                        <div className="text-[18px] mb-1">{t.icon}</div>
                        <div className="text-[11px] font-bold" style={{ fontFamily: 'var(--font-syne)', color: t.color }}>{t.label}</div>
                        <div className="text-[10px] text-[#7C6B8A] mt-[2px]">{t.sub}</div>
                      </div>
                    ))}
                  </div>

                  <div className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#7C6B8A] mb-2.5" style={{ fontFamily: 'var(--font-syne)' }}>Required Documents</div>

                  {VERIF_ITEMS.map(item => {
                    const done = verifDone.has(item.id)
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleVerif(item.id)}
                        className="rounded-[14px] p-3.5 mb-2.5 flex items-center justify-between cursor-pointer"
                        style={{
                          background: done ? '#E6F7F2' : 'white',
                          border: `2px solid ${done ? '#0D9B6A' : '#DDB8F5'}`,
                          boxShadow: '0 2px 6px rgba(74,14,110,0.05)',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[14px] font-bold flex-shrink-0"
                            style={{
                              border: `2px solid ${done ? '#0D9B6A' : '#DDB8F5'}`,
                              background: done ? '#0D9B6A' : 'transparent',
                              color: done ? 'white' : '#7C6B8A',
                              fontFamily: 'var(--font-syne)',
                              transition: 'all 0.2s',
                            }}
                          >
                            {done ? '✓' : '○'}
                          </div>
                          <div>
                            <div className="text-[13px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-syne)' }}>{item.title}</div>
                            <div className="text-[11px] text-[#7C6B8A] mt-[2px]">{item.sub}</div>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold whitespace-nowrap" style={{ fontFamily: 'var(--font-syne)', color: done ? '#0D9B6A' : '#4A0E6E', transition: 'all 0.2s' }}>
                          {done ? '✓ Done' : item.action}
                        </span>
                      </div>
                    )
                  })}

                  {/* Elite status */}
                  <div className="bg-[#1A1A2E] rounded-[14px] p-3.5 mt-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[13px] font-bold text-white" style={{ fontFamily: 'var(--font-syne)' }}>🏆 Get Elite Status</div>
                      <span className="text-[11px] font-bold px-2 py-[3px] rounded-[6px]" style={{ fontFamily: 'var(--font-syne)', color: '#FFD93D', background: 'rgba(255,217,61,0.15)' }}>Optional</span>
                    </div>
                    <div className="text-[12px] leading-[1.6] mb-3" style={{ color: 'rgba(255,255,255,0.55)' }}>Add a background check to unlock Elite badge, top search placement, and a dedicated account manager.</div>
                    <button
                      onClick={() => setBgCheck(b => !b)}
                      className="w-full rounded-[10px] py-2.5 text-[12px] font-bold"
                      style={{
                        fontFamily: 'var(--font-syne)',
                        background: bgCheck ? '#0D9B6A' : 'rgba(255,255,255,0.08)',
                        color: 'white',
                        border: `1.5px solid ${bgCheck ? '#0D9B6A' : 'rgba(255,255,255,0.15)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {bgCheck ? '✓ Background Check Added' : '+ Add Background Check ($35)'}
                    </button>
                  </div>
                  <div className="h-3.5" />
                </div>
                <NavDots total={6} active={5} />
                <NextBtn label="Submit for Review ✦" onClick={() => go(7)} green />
              </>
            )}

            {/* ── SCREEN 7: SUBMITTED ── */}
            {screen === 7 && (
              <div
                className="flex-1 flex flex-col items-center justify-center px-8 py-10 text-center relative overflow-hidden"
                style={{ background: '#1A1A2E' }}
              >
                <div className="absolute w-[300px] h-[300px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(74,14,110,0.4) 0%, transparent 70%)', top: '-80px', right: '-80px' }} />
                <div className="w-20 h-20 rounded-full bg-[#0D9B6A] flex items-center justify-center text-[36px] mb-6 relative z-[1]" style={{ animation: 'popIn 0.5s ease both' }}>✓</div>
                <div className="text-[26px] font-extrabold text-white tracking-[-0.5px] mb-2.5 relative z-[1]" style={{ fontFamily: 'var(--font-syne)' }}>You're submitted!</div>
                <div className="text-[14px] leading-[1.7] mb-4 relative z-[1]" style={{ color: 'rgba(255,255,255,0.55)' }}>We review all vendor applications within 24–48 hours. You'll get an email when approved.</div>
                <div className="w-full rounded-[14px] p-4 mb-7 text-left relative z-[1]" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="text-[12px] font-bold uppercase tracking-[1px] mb-2.5" style={{ fontFamily: 'var(--font-syne)', color: 'rgba(255,255,255,0.5)' }}>What happens next</div>
                  <div className="flex flex-col gap-2.5">
                    {[
                      'ID & documents verified automatically',
                      'Our team reviews your portfolio & license',
                      'You\'re approved & start receiving bookings',
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-[#4A0E6E] flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0" style={{ fontFamily: 'var(--font-syne)' }}>{i + 1}</div>
                        <div className="text-[12px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{step}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={() => go(0)} className="w-full text-white font-bold text-[15px] rounded-[14px] py-4 relative z-[1]" style={{ fontFamily: 'var(--font-syne)', background: '#4A0E6E', border: 'none', cursor: 'pointer' }}>
                  Preview My Dashboard →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ PHONE 2: VENDOR DASHBOARD ══ */}
      <div className="flex flex-col items-center">
        <div className="mb-3 text-[11px] font-bold uppercase tracking-[2px] text-center" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-syne)' }}>
          Vendor Dashboard
        </div>
        <div
          className="w-[375px] h-[812px] bg-[#F8F4FC] rounded-[48px] overflow-hidden flex flex-col flex-shrink-0"
          style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 10px #2D2D45, 0 0 0 12px #3D3D55' }}
        >
          <div className="w-[120px] h-8 bg-[#1A1A2E] rounded-b-[20px] mx-auto flex-shrink-0 z-10" />

          {/* Dark header */}
          <div className="bg-[#1A1A2E] px-[22px] pt-4 pb-5 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[12px]" style={{ color: 'rgba(255,255,255,0.45)' }}>Good morning 👋</div>
                <div className="text-[18px] font-extrabold text-white tracking-[-0.3px] mt-[2px]" style={{ fontFamily: 'var(--font-syne)' }}>Bloom & Co Florals</div>
              </div>
              <button className="w-9 h-9 rounded-[10px] flex items-center justify-center text-base relative" style={{ background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer' }}>
                🔔
                <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF6B6B]" style={{ border: '2px solid #1A1A2E' }} />
              </button>
            </div>
            <div className="flex gap-2">
              {[
                { num: '3', label: 'New Requests', color: '#4ECDC4' },
                { num: '8', label: 'Upcoming',     color: '#FFD93D' },
                { num: '4.9★', label: 'Your Rating', color: 'white' },
              ].map(s => (
                <div key={s.label} className="flex-1 rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="text-[18px] font-extrabold" style={{ fontFamily: 'var(--font-syne)', color: s.color }}>{s.num}</div>
                  <div className="text-[10px] mt-[2px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard body */}
          <div className="flex-1 overflow-y-auto scrollbar-hide px-[22px] py-4">

            {/* Verification banner */}
            <div className="rounded-[14px] p-3.5 mb-3.5 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #4A0E6E, #6B1F9A)' }}>
              <div>
                <div className="text-[12px] font-bold uppercase tracking-[1px] mb-1" style={{ fontFamily: 'var(--font-syne)', color: 'rgba(255,255,255,0.6)' }}>Verification Status</div>
                <div className="flex items-center gap-2">
                  <span className="text-base">✅</span>
                  <span className="text-[14px] font-extrabold text-white" style={{ fontFamily: 'var(--font-syne)' }}>Pro Verified</span>
                </div>
                <div className="text-[11px] mt-[3px]" style={{ color: 'rgba(255,255,255,0.5)' }}>License · Insurance · ID confirmed</div>
              </div>
              <div className="rounded-[10px] px-2.5 py-1.5 text-center cursor-pointer" style={{ background: 'rgba(255,217,61,0.15)', border: '1px solid rgba(255,217,61,0.3)' }}>
                <div className="text-[18px]">🏆</div>
                <div className="text-[10px] font-bold mt-[2px]" style={{ fontFamily: 'var(--font-syne)', color: '#FFD93D' }}>Get Elite</div>
              </div>
            </div>

            {/* Earnings */}
            <div className="rounded-[14px] p-4 mb-3.5 flex items-center justify-between" style={{ background: '#4A0E6E' }}>
              <div>
                <div className="text-[28px] font-extrabold text-white tracking-[-0.5px]" style={{ fontFamily: 'var(--font-syne)' }}>$4,280</div>
                <div className="text-[11px] mt-[2px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Earnings this month</div>
              </div>
              <div className="text-[12px] font-semibold px-2.5 py-1 rounded-lg" style={{ color: '#4ECDC4', background: 'rgba(78,205,196,0.15)' }}>↑ 24%</div>
            </div>

            {/* Booking requests */}
            <div className="flex items-center justify-between mb-2.5 text-[13px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-syne)' }}>
              Booking Requests
              <span className="text-[11px] font-semibold text-[#4A0E6E] cursor-pointer">See all</span>
            </div>

            {REQUESTS.map(req => {
              const accepted = acceptedReqs.has(req.id)
              const declined = declinedReqs.has(req.id)
              const badgeStyle = req.badge === 'new'
                ? { bg: '#F3E8FF', color: '#4A0E6E' }
                : { bg: '#FEF3E2', color: '#E67E22' }
              const secondaryStyle = req.secondaryAction.type === 'message'
                ? { bg: '#F3E8FF', color: '#4A0E6E' }
                : { bg: '#FEF3E2', color: '#E67E22' }

              if (declined) return null

              return (
                <div
                  key={req.id}
                  className="bg-white rounded-[14px] p-3.5 mb-2.5"
                  style={{ boxShadow: '0 2px 8px rgba(74,14,110,0.06)', borderLeft: `3px solid ${req.borderColor}` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-[14px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-syne)' }}>{req.name}</div>
                      <div className="text-[12px] text-[#7C6B8A] mt-[2px]">{req.event}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-[3px] rounded-[6px]" style={{ fontFamily: 'var(--font-syne)', background: accepted ? '#E6F7F2' : badgeStyle.bg, color: accepted ? '#0D9B6A' : badgeStyle.color }}>
                      {accepted ? 'Confirmed' : req.badge === 'new' ? 'New' : 'Awaiting'}
                    </span>
                  </div>
                  <div className="flex gap-3 mb-3">
                    {[req.date, req.guests, req.price].map(d => (
                      <span key={d} className="text-[11px] text-[#7C6B8A] flex items-center gap-1">{d}</span>
                    ))}
                  </div>
                  {!accepted && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setAcceptedReqs(prev => new Set([...prev, req.id]))}
                        className="flex-1 py-[9px] rounded-[10px] text-[12px] font-bold text-white"
                        style={{ fontFamily: 'var(--font-syne)', background: '#0D9B6A', border: 'none', cursor: 'pointer' }}
                      >✓ Accept</button>
                      <button
                        className="flex-1 py-[9px] rounded-[10px] text-[12px] font-bold"
                        style={{ fontFamily: 'var(--font-syne)', background: secondaryStyle.bg, color: secondaryStyle.color, border: 'none', cursor: 'pointer' }}
                      >{req.secondaryAction.label}</button>
                      <button
                        onClick={() => setDeclinedReqs(prev => new Set([...prev, req.id]))}
                        className="flex-1 py-[9px] rounded-[10px] text-[12px] font-bold"
                        style={{ fontFamily: 'var(--font-syne)', background: '#FDEDEC', color: '#C0392B', border: 'none', cursor: 'pointer' }}
                      >✗</button>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Upcoming events */}
            <div className="flex items-center justify-between mt-1 mb-2.5 text-[13px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-syne)' }}>
              Upcoming Events
              <span className="text-[11px] font-semibold text-[#4A0E6E] cursor-pointer">Calendar</span>
            </div>
            {UPCOMING.map(u => (
              <div key={u.day + u.month} className="bg-white rounded-xl p-3 mb-2 flex items-center gap-3" style={{ boxShadow: '0 2px 6px rgba(74,14,110,0.05)' }}>
                <div className="w-[42px] h-[42px] rounded-[10px] flex flex-col items-center justify-center flex-shrink-0" style={{ background: '#F3E8FF' }}>
                  <span className="text-[16px] font-extrabold text-[#4A0E6E] leading-none" style={{ fontFamily: 'var(--font-syne)' }}>{u.day}</span>
                  <span className="text-[9px] font-semibold uppercase text-[#7C6B8A]">{u.month}</span>
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-syne)' }}>{u.title}</div>
                  <div className="text-[11px] text-[#7C6B8A] mt-[2px]">{u.detail}</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-[6px] whitespace-nowrap" style={{ fontFamily: 'var(--font-syne)', background: u.statusBg, color: u.statusColor }}>{u.statusLabel}</span>
              </div>
            ))}
            <div className="h-3" />
          </div>

          {/* Bottom nav */}
          <div className="flex bg-white border-t border-[#F3E8FF] pt-2.5 pb-4 flex-shrink-0">
            {[
              { icon: '🏠', label: 'Home',     active: true },
              { icon: '📅', label: 'Calendar', active: false },
              { icon: '💬', label: 'Messages', active: false },
              { icon: '💰', label: 'Earnings', active: false },
              { icon: '👤', label: 'Profile',  active: false },
            ].map(n => (
              <div key={n.label} className="flex-1 flex flex-col items-center gap-1 cursor-pointer py-1.5">
                <span className="text-[20px]">{n.icon}</span>
                <span className="text-[10px] font-bold" style={{ fontFamily: 'var(--font-syne)', color: n.active ? '#4A0E6E' : '#7C6B8A' }}>{n.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
