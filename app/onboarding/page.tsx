'use client'

import { useState, useRef } from 'react'
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

// ── Data ──────────────────────────────────────────────────────────────────────

const EVENT_TYPES = [
  { icon: '💍', label: 'Wedding',       sub: 'Local or destination' },
  { icon: '🎂', label: 'Birthday',      sub: 'Any age, any scale' },
  { icon: '🏢', label: 'Corporate',     sub: 'Conferences, galas' },
  { icon: '🎉', label: 'Social Party',  sub: 'Friends & family' },
  { icon: '👶', label: 'Baby Shower',   sub: 'Gender reveals too' },
  { icon: '🎓', label: 'Graduation',    sub: 'All levels' },
  { icon: '🎪', label: 'Kids Party',    sub: 'Play places & more' },
  { icon: '✨', label: 'Something Else',sub: "We've got you" },
]

const KEYWORDS = [
  'Candlelit','Outdoor','Rooftop','Garden','Ballroom','Tropical',
  'Fairy Lights','Floral Wall','Black Tie','Casual Chic','Sunset',
  'Dance Floor','Waterfront','Minimalist','Maximalist','Cultural',
]

const COLOR_SWATCHES = [
  { color: '#F5E6D3', name: 'Champagne' },
  { color: '#1A1A2E', name: 'Midnight' },
  { color: '#D4AF37', name: 'Gold' },
  { color: '#C0392B', name: 'Deep Red' },
  { color: '#F8C8D4', name: 'Blush' },
  { color: '#2ECC71', name: 'Sage' },
  { color: '#5DADE2', name: 'Sky Blue' },
  { color: '#784212', name: 'Terracotta' },
  { color: '#DDB8F5', name: 'Lavender' },
  { color: '#F0F0F0', name: 'White',     hasBorder: true },
]

const BUDGET_PRESETS = [
  { label: '$2.5K', value: 2500 },
  { label: '$5K',   value: 5000 },
  { label: '$15K',  value: 15000 },
  { label: '$50K',  value: 50000 },
  { label: '$250K+',value: 250000 },
]

const TIERS = [
  { icon: '🌱', name: 'Affordable',    range: 'Budget-friendly picks' },
  { icon: '✨', name: 'Mid-Range',     range: 'Best value vendors' },
  { icon: '💎', name: 'Luxury',        range: 'Premium experience' },
  { icon: '👑', name: 'Ultra High-End',range: 'No limits' },
]

// ── Shared sub-components ─────────────────────────────────────────────────────

function ProgressBar({ done }: { done: number }) {
  return (
    <div className="flex gap-[5px] mb-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
            i < done ? 'bg-[#4A0E6E]' : 'bg-[#DDB8F5]'
          }`}
        />
      ))}
    </div>
  )
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-9 h-9 rounded-[10px] bg-white border-none cursor-pointer flex items-center justify-center text-lg text-[#1A1A2E] mb-4 hover:-translate-x-0.5 transition-transform duration-150"
      style={{ boxShadow: '0 2px 8px rgba(74,14,110,0.1)' }}
    >←</button>
  )
}

function NavDots({ active }: { active: number }) {
  return (
    <div className="flex justify-center gap-1.5 py-2.5 flex-shrink-0">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === active ? 'w-5 bg-[#4A0E6E]' : 'w-1.5 bg-[#DDB8F5]'
          }`}
        />
      ))}
    </div>
  )
}

function NextBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-[#4A0E6E] text-white text-base font-bold border-none rounded-2xl py-[18px] cursor-pointer tracking-[-0.3px] flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(74,14,110,0.35)] transition-all duration-150"
      style={{ fontFamily: 'var(--font-syne)' }}
    >{label}</button>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[12px] font-bold tracking-[1.5px] uppercase text-[#7C6B8A] mb-2.5"
      style={{ fontFamily: 'var(--font-syne)' }}
    >{children}</div>
  )
}

function InputField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-white border-2 border-[#DDB8F5] rounded-2xl px-4 py-[14px] text-[14px] text-[#1A1A2E] outline-none transition-colors duration-200 focus:border-[#4A0E6E] placeholder:text-[#C0ACD4] ${props.className ?? ''}`}
      style={{ fontFamily: 'var(--font-epilogue)', boxShadow: '0 2px 8px rgba(74,14,110,0.04)', ...props.style }}
    />
  )
}

// ── Page component ────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const [screen, setScreen]               = useState(0)
  const [eventType, setEventType]         = useState<string | null>(null)
  const [dreamText, setDreamText]         = useState('')
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set())
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [eventDate, setEventDate]         = useState('')
  const [isDestination, setIsDestination] = useState<boolean | null>(null)
  const [location, setLocation]           = useState('')
  const [guestCount, setGuestCount]       = useState('')
  const [duration, setDuration]           = useState('')
  const [requirements, setRequirements]   = useState('')
  const [budget, setBudget]               = useState(5000)
  const [selectedTier, setSelectedTier]   = useState<string | null>(null)
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  function toggleKeyword(kw: string) {
    setSelectedKeywords(prev => {
      const next = new Set(prev)
      next.has(kw) ? next.delete(kw) : next.add(kw)
      return next
    })
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 6)
    setPreviewImages(files.map(f => URL.createObjectURL(f)))
  }

  const stepHeader = (done: number, step: string, question: string, hint?: string) => (
    <div className="px-6 pt-4 flex-shrink-0">
      <ProgressBar done={done} />
      <BackBtn onClick={() => setScreen(done - 1)} />
      <div className="text-[11px] tracking-[2px] uppercase text-[#7C6B8A] mb-1">{step}</div>
      <div
        className="text-[22px] font-bold text-[#1A1A2E] tracking-[-0.5px] leading-tight"
        style={{ fontFamily: 'var(--font-syne)' }}
      >{question}</div>
      {hint && <div className="text-[13px] text-[#7C6B8A] mt-1.5 leading-[1.5]">{hint}</div>}
    </div>
  )

  return (
    <div
      className={`${syne.variable} ${epilogue.variable} min-h-screen bg-[#E8DCF5] flex items-center justify-center p-6`}
      style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}
    >
      {/* Phone frame */}
      <div
        className="w-[375px] min-h-[812px] bg-[#F8F4FC] rounded-[48px] overflow-hidden relative flex flex-col"
        style={{ boxShadow: '0 40px 80px rgba(74,14,110,0.25), 0 0 0 10px #1A1A2E, 0 0 0 12px #2D2D2D' }}
      >
        {/* Notch */}
        <div className="w-[120px] h-8 bg-[#1A1A2E] rounded-b-[20px] mx-auto relative z-10 flex-shrink-0" />

        {/* Screen container */}
        <div className="flex-1 flex flex-col overflow-hidden relative">

          {/* ── SCREEN 0: SPLASH ── */}
          {screen === 0 && (
            <div className="bg-[#4A0E6E] flex-1 flex flex-col items-center justify-center px-8 py-10 relative overflow-hidden animate-slide-in">
              {/* Decorative radial glow */}
              <div
                aria-hidden
                className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(221,184,245,0.12) 0%, transparent 70%)',
                  top: '-100px', right: '-150px',
                }}
              />
              <div
                className="w-20 h-20 bg-white/[0.12] rounded-3xl flex items-center justify-center text-[38px] mb-7 relative z-[1]"
                style={{ animation: 'popIn 0.6s 0.2s cubic-bezier(0.16,1,0.3,1) both' }}
              >✦</div>
              <div
                className="text-[38px] font-extrabold text-white tracking-[-1.5px] text-center leading-none relative z-[1]"
                style={{ fontFamily: 'var(--font-syne)', animation: 'fadeUp 0.6s 0.35s ease both' }}
              >Easy Events</div>
              <div
                className="text-[13px] text-white/50 tracking-[2.5px] uppercase mt-2.5 relative z-[1]"
                style={{ animation: 'fadeUp 0.6s 0.45s ease both' }}
              >Plan less. Celebrate more.</div>
              <div
                className="text-[15px] text-white/70 text-center leading-[1.7] mt-6 relative z-[1]"
                style={{ animation: 'fadeUp 0.6s 0.55s ease both' }}
              >
                Your AI-powered event planner. From kids&apos; play parties to Lake Como weddings — we handle every single detail.
              </div>
              <button
                className="mt-11 w-full bg-white text-[#4A0E6E] text-base font-bold border-none rounded-2xl py-[18px] cursor-pointer relative z-[1] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-all duration-150"
                style={{ fontFamily: 'var(--font-syne)', animation: 'fadeUp 0.6s 0.65s ease both' }}
                onClick={() => setScreen(1)}
              >Start Planning ✦</button>
              <div
                className="mt-3.5 text-[13px] text-white/40 relative z-[1]"
                style={{ animation: 'fadeUp 0.6s 0.75s ease both' }}
              >
                Already have an account?{' '}
                <span className="text-white/80 font-medium cursor-pointer underline underline-offset-[3px]">Log in</span>
              </div>
            </div>
          )}

          {/* ── SCREEN 1: EVENT TYPE ── */}
          {screen === 1 && (
            <div className="flex-1 flex flex-col animate-slide-in">
              {stepHeader(1, 'Step 1 of 6', 'What are we celebrating?')}
              <div className="flex-1 px-6 pt-[18px] overflow-y-auto">
                <div className="grid grid-cols-2 gap-2.5">
                  {EVENT_TYPES.map(({ icon, label, sub }) => (
                    <div
                      key={label}
                      className={`bg-white border-2 rounded-2xl p-3 cursor-pointer transition-all duration-200 hover:-translate-y-px ${
                        eventType === label
                          ? 'border-[#4A0E6E] bg-[#F3E8FF]'
                          : 'border-transparent hover:border-[#DDB8F5]'
                      }`}
                      style={{ boxShadow: '0 2px 8px rgba(74,14,110,0.06)' }}
                      onClick={() => setEventType(label)}
                    >
                      <span className="text-2xl mb-1.5 block">{icon}</span>
                      <div
                        className="text-[13px] font-bold text-[#1A1A2E]"
                        style={{ fontFamily: 'var(--font-syne)' }}
                      >{label}</div>
                      <div className="text-[11px] text-[#7C6B8A] mt-0.5">{sub}</div>
                    </div>
                  ))}
                </div>
              </div>
              <NavDots active={0} />
              <div className="px-6 pb-7 flex-shrink-0">
                <NextBtn label="Continue →" onClick={() => setScreen(2)} />
              </div>
            </div>
          )}

          {/* ── SCREEN 2: DESCRIBE YOUR EVENT ── */}
          {screen === 2 && (
            <div className="flex-1 flex flex-col animate-slide-in">
              {stepHeader(2, 'Step 2 of 6', 'Paint us a picture of your event.', "Describe it like you're telling a friend your dream. The more detail, the better we curate.")}
              <div className="flex-1 px-6 pt-[18px] overflow-y-auto">
                {/* Dream description */}
                <textarea
                  rows={4}
                  className="w-full bg-white border-2 border-[#DDB8F5] rounded-2xl p-4 text-[14px] text-[#1A1A2E] resize-none outline-none leading-[1.7] min-h-[100px] mb-4 transition-colors duration-200 focus:border-[#4A0E6E] placeholder:text-[#C0ACD4] placeholder:italic"
                  style={{ fontFamily: 'var(--font-epilogue)' }}
                  placeholder="e.g. 'An intimate outdoor dinner at sunset for 50 people. Think fairy lights, long tables, lush florals, Afrobeats transitioning to R&B, and a full open bar…'"
                  value={dreamText}
                  onChange={e => setDreamText(e.target.value)}
                />

                {/* Mood board upload */}
                <SectionLabel>Add Inspiration Images</SectionLabel>
                <div
                  className="border-2 border-dashed border-[#DDB8F5] rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 bg-white mb-4 hover:border-[#4A0E6E] hover:bg-[#F3E8FF]"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                  <div className="text-[28px] mb-2">🖼️</div>
                  <div className="text-[13px] font-bold text-[#4A0E6E]" style={{ fontFamily: 'var(--font-syne)' }}>
                    Upload from camera roll
                  </div>
                  <div className="text-[11px] text-[#7C6B8A] mt-1">Pinterest screenshots, inspo pics, anything</div>
                </div>

                {/* Image preview grid */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {previewImages.map((src, i) => (
                    <img
                      key={i} src={src} alt=""
                      className="aspect-square rounded-[10px] object-cover w-full"
                      style={{ animation: 'popIn 0.3s ease both' }}
                    />
                  ))}
                  {Array.from({ length: Math.max(0, 3 - previewImages.length) }).map((_, i) => (
                    <div
                      key={`ph-${i}`}
                      className="aspect-square rounded-[10px] flex items-center justify-center text-xl text-[#4A0E6E] cursor-pointer border-2 border-dashed border-[#DDB8F5] hover:bg-[#DDB8F5] transition-colors duration-200"
                      style={{ background: 'linear-gradient(135deg, #E8D5F5, #DDB8F5)' }}
                      onClick={() => fileInputRef.current?.click()}
                    >+</div>
                  ))}
                </div>

                {/* Keywords */}
                <SectionLabel>Quick Keywords</SectionLabel>
                <div className="flex flex-wrap gap-2 mb-4">
                  {KEYWORDS.map(kw => (
                    <div
                      key={kw}
                      className={`border-2 rounded-[20px] px-[14px] py-[7px] text-[12px] font-semibold cursor-pointer transition-all duration-200 ${
                        selectedKeywords.has(kw)
                          ? 'bg-[#4A0E6E] border-[#4A0E6E] text-white'
                          : 'bg-white border-[#DDB8F5] text-[#1A1A2E] hover:border-[#6B1F9A]'
                      }`}
                      style={{ fontFamily: 'var(--font-syne)' }}
                      onClick={() => toggleKeyword(kw)}
                    >{kw}</div>
                  ))}
                </div>

                {/* Color palette */}
                <SectionLabel>Event Color Palette</SectionLabel>
                <div className="flex gap-2.5 flex-wrap mb-4">
                  {COLOR_SWATCHES.map(({ color, name, hasBorder }) => (
                    <button
                      key={name}
                      title={name}
                      className={`w-9 h-9 rounded-full cursor-pointer transition-all duration-200 flex-shrink-0 border-[3px] ${
                        selectedColor === name
                          ? 'border-[#1A1A2E] scale-[1.15]'
                          : hasBorder ? 'border-[#ddd]' : 'border-transparent'
                      }`}
                      style={{ background: color }}
                      onClick={() => setSelectedColor(name === selectedColor ? null : name)}
                    />
                  ))}
                </div>
                <div className="h-4" />
              </div>
              <NavDots active={1} />
              <div className="px-6 pb-7 flex-shrink-0">
                <NextBtn label="Continue →" onClick={() => setScreen(3)} />
              </div>
            </div>
          )}

          {/* ── SCREEN 3: DATE & LOGISTICS ── */}
          {screen === 3 && (
            <div className="flex-1 flex flex-col animate-slide-in">
              {stepHeader(3, 'Step 3 of 6', 'When & where is it?')}
              <div className="flex-1 px-6 pt-[18px] overflow-y-auto">
                {/* Event date */}
                <div className="mb-3">
                  <label className="text-[12px] font-medium text-[#7C6B8A] tracking-[0.5px] mb-1.5 block">Event Date</label>
                  <InputField type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} />
                </div>

                {/* Destination or local */}
                <div className="mb-3">
                  <label className="text-[12px] font-medium text-[#7C6B8A] tracking-[0.5px] mb-1.5 block">
                    Is this a destination event?
                  </label>
                  <div className="flex gap-2.5">
                    {([{ label: 'Destination', icon: '✈️', val: true }, { label: 'Local', icon: '📍', val: false }] as const).map(
                      ({ label, icon, val }) => (
                        <div
                          key={label}
                          className={`flex-1 bg-white border-2 rounded-2xl p-3 cursor-pointer transition-all duration-200 hover:-translate-y-px ${
                            isDestination === val
                              ? 'border-[#4A0E6E] bg-[#F3E8FF]'
                              : 'border-transparent hover:border-[#DDB8F5]'
                          }`}
                          style={{ boxShadow: '0 2px 8px rgba(74,14,110,0.06)' }}
                          onClick={() => setIsDestination(val)}
                        >
                          <span className="text-[18px] mb-0.5 block">{icon}</span>
                          <div className="text-[12px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-syne)' }}>{label}</div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="mb-3">
                  <label className="text-[12px] font-medium text-[#7C6B8A] tracking-[0.5px] mb-1.5 block">City, State or Country</label>
                  <InputField
                    type="text"
                    placeholder="e.g. Houston TX  |  Lake Como, Italy"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                  />
                </div>

                {/* Guest count + duration */}
                <div className="grid grid-cols-2 gap-2.5 mb-3">
                  <div>
                    <label className="text-[12px] font-medium text-[#7C6B8A] tracking-[0.5px] mb-1.5 block">Guest Count</label>
                    <InputField
                      type="number"
                      placeholder="e.g. 150"
                      value={guestCount}
                      onChange={e => setGuestCount(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-medium text-[#7C6B8A] tracking-[0.5px] mb-1.5 block">Duration</label>
                    <select
                      className="w-full bg-white border-2 border-[#DDB8F5] rounded-2xl px-4 py-[14px] text-[14px] text-[#1A1A2E] outline-none transition-colors duration-200 focus:border-[#4A0E6E] appearance-none"
                      style={{ fontFamily: 'var(--font-epilogue)', boxShadow: '0 2px 8px rgba(74,14,110,0.04)' }}
                      value={duration}
                      onChange={e => setDuration(e.target.value)}
                    >
                      <option value="" disabled>Select</option>
                      <option>2–3 hrs</option>
                      <option>4–5 hrs</option>
                      <option>Full day</option>
                      <option>Multi-day</option>
                      <option>Weekend</option>
                    </select>
                  </div>
                </div>

                {/* Special requirements */}
                <div className="mb-3">
                  <label className="text-[12px] font-medium text-[#7C6B8A] tracking-[0.5px] mb-1.5 block">Any special requirements?</label>
                  <InputField
                    type="text"
                    placeholder="e.g. Halal food, wheelchair access, kids zone…"
                    value={requirements}
                    onChange={e => setRequirements(e.target.value)}
                  />
                </div>
              </div>
              <NavDots active={2} />
              <div className="px-6 pb-7 flex-shrink-0">
                <NextBtn label="Continue →" onClick={() => setScreen(4)} />
              </div>
            </div>
          )}

          {/* ── SCREEN 4: BUDGET ── */}
          {screen === 4 && (
            <div className="flex-1 flex flex-col animate-slide-in">
              {stepHeader(4, 'Step 4 of 6', "What's your budget?", "We'll match you with vendors at every price point.")}
              <div className="flex-1 px-6 pt-[18px] overflow-y-auto">
                {/* Budget display */}
                <div className="bg-[#4A0E6E] rounded-2xl p-5 text-center mb-4">
                  <div
                    className="text-[36px] font-extrabold text-white tracking-[-1px]"
                    style={{ fontFamily: 'var(--font-syne)' }}
                  >${budget.toLocaleString()}</div>
                  <div className="text-[11px] text-white/50 tracking-[1.5px] uppercase mt-1">Total Budget</div>
                </div>

                {/* Range slider */}
                <input
                  type="range"
                  min={500} max={500000} step={500}
                  value={budget}
                  onChange={e => setBudget(Number(e.target.value))}
                  className="budget-range"
                />

                {/* Budget presets */}
                <div className="flex gap-2 mb-4">
                  {BUDGET_PRESETS.map(({ label, value }) => (
                    <div
                      key={label}
                      className={`flex-1 bg-white border-2 rounded-[10px] py-2 px-1 text-[11px] font-bold text-center cursor-pointer transition-all duration-200 ${
                        budget === value
                          ? 'border-[#4A0E6E] text-[#4A0E6E] bg-[#F3E8FF]'
                          : 'border-[#DDB8F5] text-[#7C6B8A] hover:border-[#4A0E6E] hover:text-[#4A0E6E] hover:bg-[#F3E8FF]'
                      }`}
                      style={{ fontFamily: 'var(--font-syne)' }}
                      onClick={() => setBudget(value)}
                    >{label}</div>
                  ))}
                </div>

                {/* Event tier */}
                <SectionLabel>Event Tier</SectionLabel>
                <div className="grid grid-cols-2 gap-2.5">
                  {TIERS.map(({ icon, name, range }) => (
                    <div
                      key={name}
                      className={`bg-white border-2 rounded-2xl p-3 cursor-pointer transition-all duration-200 ${
                        selectedTier === name
                          ? 'border-[#4A0E6E] bg-[#F3E8FF]'
                          : 'border-[#DDB8F5] hover:border-[#6B1F9A]'
                      }`}
                      onClick={() => setSelectedTier(name)}
                    >
                      <div className="text-[22px] mb-1.5">{icon}</div>
                      <div className="text-[13px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-syne)' }}>{name}</div>
                      <div className="text-[11px] text-[#7C6B8A] mt-0.5">{range}</div>
                    </div>
                  ))}
                </div>
              </div>
              <NavDots active={3} />
              <div className="px-6 pb-7 flex-shrink-0">
                <NextBtn label="Continue →" onClick={() => setScreen(5)} />
              </div>
            </div>
          )}

          {/* ── SCREEN 5: AI REVIEW / CONFIRM ── */}
          {screen === 5 && (
            <div className="flex-1 flex flex-col animate-slide-in">
              {stepHeader(5, 'Step 5 of 6', "Here's what we've got. Look good?")}
              <div className="flex-1 px-6 pt-[18px] overflow-y-auto">
                {/* AI note */}
                <div className="bg-[#F3E8FF] border-l-[3px] border-[#4A0E6E] rounded-r-xl px-[14px] py-3 text-[13px] text-[#1A1A2E] leading-[1.6] mb-3 italic">
                  ✦ Based on your description, I&apos;m curating an intimate candlelit outdoor dinner with luxury vendors, Afrobeats playlist, and full-service bar — all within your budget.
                </div>

                {/* Confirm card */}
                <div className="bg-white rounded-2xl p-[18px] mb-3" style={{ boxShadow: '0 2px 8px rgba(74,14,110,0.06)' }}>
                  {[
                    { icon: '🎉', key: 'Event Type',    val: eventType || 'Birthday Party' },
                    { icon: '📍', key: 'Location',      val: location || 'Houston, TX' },
                    { icon: '📅', key: 'Date & Guests', val: `${eventDate || 'June 14, 2025'} · ${guestCount || '80'} guests` },
                    { icon: '💰', key: 'Budget · Tier', val: `$${budget.toLocaleString()} · ${selectedTier || 'Luxury'}` },
                  ].map(({ icon, key, val }) => (
                    <div key={key} className="flex items-start gap-3 mb-2.5 last:mb-0">
                      <div className="w-8 h-8 rounded-lg bg-[#F3E8FF] flex items-center justify-center text-[15px] flex-shrink-0">{icon}</div>
                      <div>
                        <div className="text-[11px] text-[#7C6B8A] tracking-[0.5px]">{key}</div>
                        <div className="text-[13px] font-bold text-[#1A1A2E] mt-0.5" style={{ fontFamily: 'var(--font-syne)' }}>{val}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mood board preview */}
                <SectionLabel>Your Mood Board</SectionLabel>
                <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
                  {['🌿','🕯️','🌸','🥂','✨'].map((emoji, i) => (
                    <div
                      key={i}
                      className="w-[70px] h-[70px] rounded-xl flex-shrink-0 flex items-center justify-center text-2xl"
                      style={{ background: 'linear-gradient(135deg, #E8D5F5, #C4A0E8)' }}
                    >{emoji}</div>
                  ))}
                </div>

                {/* Selected keywords */}
                <SectionLabel>Selected Keywords</SectionLabel>
                <div className="flex flex-wrap gap-2 pb-4">
                  {(selectedKeywords.size > 0
                    ? Array.from(selectedKeywords)
                    : ['Candlelit', 'Outdoor', 'Fairy Lights', 'Dance Floor']
                  ).map(kw => (
                    <div
                      key={kw}
                      className="bg-[#4A0E6E] border-2 border-[#4A0E6E] text-white rounded-[20px] px-[14px] py-[7px] text-[12px] font-semibold"
                      style={{ fontFamily: 'var(--font-syne)' }}
                    >{kw}</div>
                  ))}
                </div>
              </div>
              <NavDots active={4} />
              <div className="px-6 pb-7 flex-shrink-0">
                <NextBtn label="Generate My Event Plan ✦" onClick={() => setScreen(6)} />
              </div>
            </div>
          )}

          {/* ── SCREEN 6: AI GENERATING ── */}
          {screen === 6 && (
            <div className="bg-[#4A0E6E] flex-1 flex flex-col items-center justify-center px-8 py-10 text-center animate-slide-in">
              <div
                className="w-[100px] h-[100px] rounded-full bg-white/[0.12] flex items-center justify-center text-[44px] mb-7"
                style={{ animation: 'pulseOrb 2s ease-in-out infinite' }}
              >✦</div>
              <div
                className="text-[26px] font-extrabold text-white tracking-[-0.5px] mb-2.5"
                style={{ fontFamily: 'var(--font-syne)' }}
              >Building your event…</div>
              <div className="text-[14px] text-white/60 leading-[1.6] mb-9">
                Our AI is analyzing your vision and curating the perfect vendors, timeline and budget breakdown.
              </div>
              <div className="w-full text-left">
                {[
                  { icon: '🖼️', text: 'Analyzing your mood board',                          done: true,  delay: 0 },
                  { icon: '📍', text: `Finding vendors in ${location || 'Houston, TX'}`,    done: true,  delay: 0.5 },
                  { icon: '💰', text: `Matching to your $${budget.toLocaleString()} budget`,done: true,  delay: 1 },
                  { icon: '✨', text: 'Curating luxury vendor shortlist',                    done: false, delay: 1.5 },
                  { icon: '📋', text: 'Building your event timeline',                        done: false, delay: 2 },
                ].map(({ icon, text, done, delay }, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3.5 px-4 py-3 bg-white/[0.08] rounded-xl mb-2.5"
                    style={{ animation: `fadeUp 0.5s ${delay}s ease both` }}
                  >
                    <span>{icon}</span>
                    <span className="text-[13px] text-white/85 font-medium">{text}</span>
                    <div className="ml-auto w-5 h-5 rounded-full bg-white/[0.15] flex items-center justify-center text-[10px] text-white">
                      {done ? '✓' : '⋯'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
