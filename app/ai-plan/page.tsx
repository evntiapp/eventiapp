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

interface VendorRec {
  icon: string
  imgBg: string
  category: string
  name: string
  why: string
  highlight: string
  whySuffix: string
  match: number
  price: string
  isTopPick?: boolean
}

interface BudgetLine {
  color: string
  cat: string
  pct: number
  amt: string
  muted?: boolean
}

type TimelineStatus = 'done' | 'now' | 'upcoming' | 'wedding'
interface TimelineItem {
  status: TimelineStatus
  label: string
  title: string
  date: string
}

// ── Static data ────────────────────────────────────────────────────────────────

const GEN_STEPS = [
  { icon: '🖼️', text: 'Analyzing your mood board & aesthetic',     delay: '0.3s' },
  { icon: '🎨', text: 'Extracting your color palette & vibe',       delay: '0.9s' },
  { icon: '📍', text: 'Finding top vendors in Houston, TX',          delay: '1.5s' },
  { icon: '💰', text: 'Matching vendors to your $15,000 budget',     delay: '2.1s' },
  { icon: '✨', text: 'Rendering your event visualization',           delay: '2.7s' },
]

const VENDORS: VendorRec[] = [
  {
    icon: '🌸', imgBg: 'linear-gradient(135deg,#E6F7F2,#C8E6C9)',
    category: 'Florals & Décor', name: 'Bloom & Co Florals',
    why: 'Specializes in ', highlight: 'botanical garden', whySuffix: ' aesthetics — exact match to your mood board',
    match: 98, price: '$2,200', isTopPick: true,
  },
  {
    icon: '📸', imgBg: 'linear-gradient(135deg,#F3E8FF,#E0C4F8)',
    category: 'Photography', name: 'Lens & Light Studio',
    why: 'Known for ', highlight: 'candlelit reception', whySuffix: ' shots — 4.9★ from 120 weddings',
    match: 95, price: '$3,100',
  },
  {
    icon: '🎵', imgBg: 'linear-gradient(135deg,#FEF3E2,#FDDCB5)',
    category: 'DJ / Music', name: 'DJ Smooth Houston',
    why: 'Afrobeats → R&B transitions, ', highlight: 'exactly your playlist vibe', whySuffix: '',
    match: 92, price: '$1,450',
  },
  {
    icon: '🍽️', imgBg: 'linear-gradient(135deg,#FDEDEC,#FAB8B2)',
    category: 'Catering', name: 'Saffron & Co Catering',
    why: 'West African fusion menu, ', highlight: 'halal-certified', whySuffix: ', 200-guest capacity',
    match: 91, price: '$4,800',
  },
]

const COLOR_PALETTE = [
  { color: '#1A1A2E', name: 'Midnight' },
  { color: '#D4AF37', name: 'Gold' },
  { color: '#F8C8D4', name: 'Blush' },
  { color: '#2ECC71', name: 'Sage' },
  { color: '#FAFAFA', name: 'Ivory', border: true },
]

const STYLE_TAGS = ['Romantic', 'Candlelit', 'Afro-Luxe', 'Botanical', 'Fairy Lights']

const BUDGET_LINES: BudgetLine[] = [
  { color: '#6B1F9A', cat: 'Florals & Décor', pct: 60, amt: '$2,200' },
  { color: '#5DADE2', cat: 'Photography',     pct: 75, amt: '$3,100' },
  { color: '#E67E22', cat: 'Catering',        pct: 85, amt: '$4,800' },
  { color: '#D4AC0D', cat: 'DJ / Music',      pct: 35, amt: '$1,450' },
  { color: '#0D9B6A', cat: 'Hair & Makeup',   pct: 30, amt: '$1,250' },
  { color: '#E74C3C', cat: 'Bar Service',     pct: 25, amt: '$1,000' },
  { color: '#7C6B8A', cat: 'Reserve',         pct: 20, amt: '$1,200', muted: true },
]

const TIMELINE: TimelineItem[] = [
  { status: 'done',     label: '✓',  title: 'Event intake complete',          date: 'Today · June 22' },
  { status: 'now',      label: '→',  title: 'Book top vendor picks',          date: "This week — you're here now" },
  { status: 'upcoming', label: '3',  title: 'Confirm guest list & RSVPs',     date: 'By June 30' },
  { status: 'upcoming', label: '4',  title: 'Final payments & confirmations', date: 'By July 14' },
  { status: 'wedding',  label: '💍', title: 'Wedding Day',                    date: 'August 14, 2025' },
]

// Candle glow positions for the render scene
const CANDLE_GLOWS = [
  { w: 60, h: 60, left: 60,  bottom: 30, delay: '' },
  { w: 50, h: 50, left: 150, bottom: 28, delay: '0.5s' },
  { w: 55, h: 55, left: 265, bottom: 30, delay: '1s' },
]

// ── Shared sub-component ───────────────────────────────────────────────────────

function SecLabel({ children, action }: { children: React.ReactNode; action?: string }) {
  return (
    <div className="flex items-center justify-between mb-2" style={{ fontFamily: 'var(--font-syne)' }}>
      <span className="text-[13px] font-bold text-[#1A1A2E] tracking-[-0.2px]">{children}</span>
      {action && <span className="text-[11px] font-semibold text-[#4A0E6E] cursor-pointer">{action}</span>}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AIPlanPage() {
  const [screen, setScreen] = useState<'gen' | 'reveal'>('gen')

  return (
    <div
      className={`${syne.variable} ${epilogue.variable} min-h-screen bg-[#1A1A2E] flex items-center justify-center p-6`}
      style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}
    >
      {/* Phone frame */}
      <div
        className="w-[375px] h-[812px] bg-[#F8F4FC] rounded-[48px] overflow-hidden flex flex-col flex-shrink-0 relative"
        style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 10px #2D2D45, 0 0 0 12px #3D3D55' }}
      >
        {/* Notch */}
        <div className="w-[120px] h-8 bg-[#1A1A2E] rounded-b-[20px] mx-auto flex-shrink-0 relative z-[20]" />

        {/* ══ SCREEN 1: GENERATING ══ */}
        {screen === 'gen' && (
          <div
            className="bg-[#1A1A2E] flex-1 flex flex-col items-center justify-center px-8 py-10 relative overflow-hidden"
            style={{ animation: 'fadeIn 0.4s ease both' }}
          >
            {/* Decorative glows */}
            <div
              aria-hidden
              className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(107,31,154,0.25) 0%, transparent 65%)', top: '-150px', right: '-150px' }}
            />
            <div
              aria-hidden
              className="absolute w-[300px] h-[300px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(221,184,245,0.08) 0%, transparent 65%)', bottom: '40px', left: '-80px' }}
            />

            {/* Spinning conic-gradient orb */}
            <div
              className="w-[110px] h-[110px] rounded-full flex items-center justify-center mb-7 relative z-[1]"
              style={{ background: 'conic-gradient(#6B1F9A, #DDB8F5, #6B1F9A)', animation: 'spinOrb 3s linear infinite' }}
            >
              <div className="w-[90px] h-[90px] rounded-full bg-[#1A1A2E] flex items-center justify-center text-[38px]">✦</div>
            </div>

            <div
              className="text-[24px] font-extrabold text-white tracking-[-0.5px] text-center mb-2 relative z-[1]"
              style={{ fontFamily: 'var(--font-syne)' }}
            >Creating your perfect event…</div>
            <div className="text-[13px] text-white/50 text-center leading-[1.6] mb-10 relative z-[1]">
              Our AI is analyzing your vision and building a plan curated just for you.
            </div>

            {/* Staggered steps */}
            <div className="w-full relative z-[1]">
              {GEN_STEPS.map(({ icon, text, delay }, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-[14px] py-[11px] bg-white/[0.06] rounded-xl mb-2"
                  style={{ opacity: 0, animation: `fadeUp 0.4s ${delay} ease forwards` }}
                >
                  <span className="text-base">{icon}</span>
                  <span className="flex-1 text-[12px] text-white/75 font-medium">{text}</span>
                  <div
                    className="w-5 h-5 rounded-full bg-[#0D9B6A] flex items-center justify-center text-[10px] text-white"
                    style={{ animation: `popIn 0.3s ${delay} ease both` }}
                  >✓</div>
                </div>
              ))}
            </div>

            {/* CTA — fades in at 3.4 s */}
            <button
              className="mt-8 w-full bg-white text-[#4A0E6E] text-[15px] font-bold border-none rounded-2xl py-4 cursor-pointer relative z-[1] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-all duration-150"
              style={{ fontFamily: 'var(--font-syne)', opacity: 0, animation: 'fadeUp 0.5s 3.4s ease forwards' }}
              onClick={() => setScreen('reveal')}
            >✦ See Your Event Plan</button>
          </div>
        )}

        {/* ══ SCREEN 2: AI REVEAL ══ */}
        {screen === 'reveal' && (
          <div
            className="flex-1 flex flex-col overflow-hidden"
            style={{ animation: 'fadeIn 0.4s ease both' }}
          >
            {/* Dark header */}
            <div className="bg-[#1A1A2E] px-[22px] pt-[14px] pb-5 flex-shrink-0 relative overflow-hidden">
              {/* Glow */}
              <div
                aria-hidden
                className="absolute w-[250px] h-[250px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(107,31,154,0.3) 0%, transparent 70%)', top: '-80px', right: '-60px' }}
              />

              {/* Top row: back · badge · spacer */}
              <div className="flex items-center justify-between mb-[14px] relative z-[1]">
                <button
                  onClick={() => setScreen('gen')}
                  className="w-8 h-8 rounded-[9px] bg-white/[0.08] border-none cursor-pointer flex items-center justify-center text-[15px] text-white"
                >←</button>
                <div
                  className="flex items-center gap-1.5 bg-white/[0.15] border border-[#DDB8F5]/25 rounded-[20px] px-3 py-[5px] text-[11px] text-[#DDB8F5] font-bold tracking-[0.5px]"
                  style={{ fontFamily: 'var(--font-syne)' }}
                >✦ AI Curated Plan</div>
                <div className="w-8" />
              </div>

              {/* Title with gradient span */}
              <div
                className="text-[22px] font-extrabold text-white tracking-[-0.5px] leading-[1.15] mb-1 relative z-[1]"
                style={{ fontFamily: 'var(--font-syne)', animation: 'fadeUp 0.5s 0.1s ease both' }}
              >
                Your dream event<br />
                <span style={{
                  background: 'linear-gradient(90deg, #DDB8F5, white)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>is ready, Aisha.</span>
              </div>
              <div
                className="text-[12px] text-white/50 relative z-[1]"
                style={{ animation: 'fadeUp 0.5s 0.2s ease both' }}
              >
                Based on your vision, budget &amp; style — here&apos;s exactly how we&apos;d bring it to life.
              </div>

              {/* AI-rendered event scene */}
              <div
                className="relative z-[1] mt-[14px] rounded-2xl overflow-hidden h-[140px]"
                style={{ animation: 'fadeUp 0.5s 0.3s ease both' }}
              >
                <div
                  className="w-full h-full relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #2D0A42 0%, #4A1168 25%, #1a3a2a 50%, #2D0A42 75%, #3D1558 100%)' }}
                >
                  {/* Fairy lights strip */}
                  <div
                    className="absolute top-0 left-0 right-0 h-10 opacity-70"
                    style={{ background: 'repeating-linear-gradient(90deg, transparent 0px, transparent 18px, rgba(255,220,100,0.6) 18px, rgba(255,220,100,0.6) 20px)' }}
                  />

                  {/* Candle glows */}
                  {CANDLE_GLOWS.map((g, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        width: g.w, height: g.h,
                        left: g.left, bottom: g.bottom,
                        background: 'radial-gradient(circle, rgba(255,200,50,0.3) 0%, transparent 70%)',
                        animation: `glowPulse 2s ease-in-out infinite${g.delay ? ' ' + g.delay : ''}`,
                      }}
                    />
                  ))}

                  {/* Tables with candles/florals */}
                  <div className="absolute inset-0 flex items-end justify-center pb-2.5">
                    <div className="flex gap-4 items-end mb-2">
                      {[{ emoji: '🕯️', w: 55 }, { emoji: '🌸', w: 70 }, { emoji: '🕯️', w: 55 }].map(({ emoji, w }, i) => (
                        <div key={i} className="flex flex-col items-center gap-0.5">
                          <div className="text-[11px]" style={{ color: 'rgba(255,220,100,0.85)' }}>{emoji}</div>
                          <div className="h-[3px] rounded-sm" style={{ width: w, background: 'rgba(255,255,255,0.7)' }} />
                          <div className="w-0.5 h-[14px]" style={{ background: 'rgba(255,255,255,0.3)' }} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Florals */}
                  <div
                    className="absolute left-2 bottom-2 text-[28px] opacity-85"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(221,184,245,0.5))' }}
                  >🌿</div>
                  <div
                    className="absolute right-2 bottom-2 text-[28px] opacity-85"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(221,184,245,0.5))' }}
                  >💐</div>

                  {/* Gradient overlay */}
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(74,14,110,0.6) 100%)' }}
                  />

                  {/* Event label */}
                  <div className="absolute bottom-2.5 left-3">
                    <div
                      className="text-[13px] font-extrabold text-white tracking-[-0.2px]"
                      style={{ fontFamily: 'var(--font-syne)' }}
                    >Aisha &amp; Marcus Wedding</div>
                    <div className="text-[11px] text-white/60">August 14, 2025 · The Astorian, Houston</div>
                  </div>

                  {/* AI badge */}
                  <div
                    className="absolute top-2.5 right-2.5 bg-black/50 border border-white/15 rounded-lg px-2 py-1 text-[10px] text-white/80 font-bold"
                    style={{ backdropFilter: 'blur(8px)', fontFamily: 'var(--font-syne)' }}
                  >✦ AI Rendered</div>
                </div>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto scrollbar-hide py-4 px-5 flex flex-col gap-[14px]">

              {/* AI Summary */}
              <div
                className="bg-[#1A1A2E] rounded-2xl p-4"
                style={{ animation: 'fadeUp 0.5s 0.1s ease both' }}
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#6B1F9A] flex items-center justify-center text-[14px]">✦</div>
                  <div
                    className="text-[12px] font-bold text-white/50 tracking-[1px] uppercase"
                    style={{ fontFamily: 'var(--font-syne)' }}
                  >AI Event Brief</div>
                </div>
                <p className="text-[13px] text-white/80 leading-[1.7]">
                  Based on your mood board and description, I&apos;ve curated an{' '}
                  <strong className="text-[#DDB8F5] font-semibold">intimate candlelit garden wedding</strong>{' '}
                  with a{' '}
                  <strong className="text-[#DDB8F5] font-semibold">romantic Afro-luxe aesthetic</strong>{' '}
                  — lush botanicals, warm fairy lighting, and a seamless flow from ceremony to reception.
                  Your $15,000 budget is allocated across{' '}
                  <strong className="text-[#DDB8F5] font-semibold">8 vendor categories</strong>{' '}
                  with $1,200 held in reserve.
                </p>
                <div className="flex gap-1.5 flex-wrap mt-2.5">
                  {STYLE_TAGS.map(tag => (
                    <div
                      key={tag}
                      className="bg-white/[0.12] border border-[#DDB8F5]/20 rounded-[20px] px-[10px] py-1 text-[11px] text-[#DDB8F5] font-semibold"
                      style={{ fontFamily: 'var(--font-syne)' }}
                    >{tag}</div>
                  ))}
                </div>
              </div>

              {/* Color Palette */}
              <div style={{ animation: 'fadeUp 0.5s 0.15s ease both' }}>
                <SecLabel>Your Event Palette</SecLabel>
                <div
                  className="flex items-center gap-2 bg-white rounded-2xl px-4 py-[14px]"
                  style={{ boxShadow: '0 2px 8px rgba(74,14,110,0.06)' }}
                >
                  {COLOR_PALETTE.map(({ color, name, border }) => (
                    <div
                      key={name}
                      title={name}
                      className="w-8 h-8 rounded-lg flex-shrink-0 cursor-pointer hover:scale-[1.15] transition-transform duration-150"
                      style={{ background: color, ...(border ? { border: '1px solid #eee' } : {}) }}
                    />
                  ))}
                  <div className="ml-1">
                    <div
                      className="text-[12px] font-bold text-[#1A1A2E]"
                      style={{ fontFamily: 'var(--font-syne)' }}
                    >Midnight Garden</div>
                    <div className="text-[11px] text-[#7C6B8A] mt-[1px]">Deep navy · Gold · Blush · Sage</div>
                  </div>
                </div>
              </div>

              {/* Top Vendor Matches */}
              <div style={{ animation: 'fadeUp 0.5s 0.2s ease both' }}>
                <SecLabel action="See All 24">Top Vendor Matches</SecLabel>
                <div className="flex flex-col gap-2.5">
                  {VENDORS.map((v) => (
                    <div
                      key={v.name}
                      className="bg-white rounded-2xl p-[14px] flex gap-3 cursor-pointer border-2 border-transparent hover:border-[#DDB8F5] hover:-translate-y-px transition-all duration-200 relative"
                      style={{ boxShadow: '0 2px 8px rgba(74,14,110,0.06)' }}
                    >
                      {v.isTopPick && (
                        <div
                          className="absolute top-[-1px] right-3 bg-[#4A0E6E] text-white text-[9px] font-bold px-2 py-[3px] rounded-b-lg tracking-[0.5px]"
                          style={{ fontFamily: 'var(--font-syne)' }}
                        >✦ #1 AI Pick</div>
                      )}
                      <div
                        className="w-[54px] h-[54px] rounded-xl flex items-center justify-center text-[26px] flex-shrink-0"
                        style={{ background: v.imgBg }}
                      >{v.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-[10px] font-bold tracking-[1px] uppercase text-[#7C6B8A] mb-0.5"
                          style={{ fontFamily: 'var(--font-syne)' }}
                        >{v.category}</div>
                        <div
                          className="text-[14px] font-bold text-[#1A1A2E] truncate"
                          style={{ fontFamily: 'var(--font-syne)' }}
                        >{v.name}</div>
                        <div className="text-[11px] text-[#7C6B8A] mt-[3px] leading-[1.4]">
                          {v.why}
                          <em className="not-italic font-semibold text-[#4A0E6E]">{v.highlight}</em>
                          {v.whySuffix}
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between flex-shrink-0">
                        <div>
                          <div
                            className="text-[13px] font-extrabold text-[#0D9B6A]"
                            style={{ fontFamily: 'var(--font-syne)' }}
                          >{v.match}%</div>
                          <div className="text-[9px] text-[#7C6B8A] text-right">match</div>
                        </div>
                        <div
                          className="text-[12px] font-bold text-[#1A1A2E]"
                          style={{ fontFamily: 'var(--font-syne)' }}
                        >{v.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget Breakdown */}
              <div style={{ animation: 'fadeUp 0.5s 0.25s ease both' }}>
                <SecLabel>Budget Breakdown</SecLabel>
                <div
                  className="bg-white rounded-2xl p-4"
                  style={{ boxShadow: '0 2px 8px rgba(74,14,110,0.06)' }}
                >
                  <div className="flex justify-between items-center mb-[14px] pb-3 border-b border-[#F3E8FF]">
                    <div className="text-[12px] text-[#7C6B8A]">Total Budget</div>
                    <div
                      className="text-[22px] font-extrabold text-[#1A1A2E] tracking-[-0.5px]"
                      style={{ fontFamily: 'var(--font-syne)' }}
                    >$15,000</div>
                  </div>
                  {BUDGET_LINES.map(({ color, cat, pct, amt, muted }) => (
                    <div key={cat} className="flex items-center gap-2.5 mb-2.5 last:mb-0">
                      <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: color }} />
                      <div className={`flex-1 text-[12px] ${muted ? 'text-[#7C6B8A]' : 'text-[#1A1A2E]'}`}>{cat}</div>
                      <div className="w-20 h-[5px] bg-[#F3E8FF] rounded-sm overflow-hidden">
                        <div className="h-full rounded-sm" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <div
                        className={`text-[12px] font-bold min-w-[44px] text-right ${muted ? 'text-[#7C6B8A]' : 'text-[#1A1A2E]'}`}
                        style={{ fontFamily: 'var(--font-syne)' }}
                      >{amt}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Planning Timeline */}
              <div style={{ animation: 'fadeUp 0.5s 0.3s ease both' }}>
                <SecLabel action="Full View">Planning Timeline</SecLabel>
                <div
                  className="bg-white rounded-2xl p-4"
                  style={{ boxShadow: '0 2px 8px rgba(74,14,110,0.06)' }}
                >
                  {TIMELINE.map((item, i) => {
                    const isDone    = item.status === 'done'
                    const isNow     = item.status === 'now'
                    const isWedding = item.status === 'wedding'
                    const isUpcoming = item.status === 'upcoming'

                    const dotBg    = isDone || isNow || isWedding ? '#4A0E6E' : '#F3E8FF'
                    const dotColor = isDone || isNow || isWedding ? 'white'    : '#7C6B8A'
                    const dotBgFinal = isDone ? '#0D9B6A' : dotBg

                    return (
                      <div key={i} className="flex gap-3 mb-3 last:mb-0 items-start relative">
                        {/* Connector line to next item */}
                        {i < TIMELINE.length - 1 && (
                          <div
                            className="absolute w-0.5 bg-[#F3E8FF]"
                            style={{ left: '11px', top: '24px', height: 'calc(100% + 2px)' }}
                          />
                        )}
                        {/* Status dot */}
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 relative z-[1]"
                          style={{
                            background: dotBgFinal,
                            color: dotColor,
                            fontSize: isWedding ? 10 : 11,
                            ...(isNow ? { animation: 'pulseDot 2s ease infinite' } : {}),
                          }}
                        >{item.label}</div>
                        <div className="flex-1 pt-[2px]">
                          <div
                            className="font-bold"
                            style={{
                              fontFamily: 'var(--font-syne)',
                              fontSize: isWedding ? 14 : 13,
                              color: isNow || isWedding ? '#4A0E6E' : '#1A1A2E',
                            }}
                          >{item.title}</div>
                          <div className="text-[11px] text-[#7C6B8A] mt-[1px]">{item.date}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="h-2" />
            </div>

            {/* CTA Footer */}
            <div className="px-5 pt-[14px] pb-7 flex-shrink-0 bg-[#F8F4FC] border-t border-[#F3E8FF]">
              <button
                className="w-full text-white text-[16px] font-bold border-none rounded-2xl py-[17px] cursor-pointer flex items-center justify-center gap-2 tracking-[-0.3px] hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(74,14,110,0.4)] transition-all duration-150"
                style={{ background: 'linear-gradient(135deg, #4A0E6E, #6B1F9A)', fontFamily: 'var(--font-syne)' }}
              >✦ Start Booking My Vendors</button>
              <button
                className="w-full bg-transparent text-[#7C6B8A] text-[13px] font-semibold border-none py-2.5 mt-1.5 cursor-pointer hover:text-[#4A0E6E] transition-colors duration-150"
                style={{ fontFamily: 'var(--font-syne)' }}
              >Make adjustments to my plan</button>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
