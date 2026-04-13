'use client'
import { useState, useEffect } from 'react'
import { Syne, Epilogue } from 'next/font/google'

const syne = Syne({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-syne' })
const epilogue = Epilogue({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-epilogue' })

type Tab = 'timeline' | 'checklist' | 'dayof'
type FilterPill = 'all' | 'urgent' | 'vendors' | 'payments' | 'personal'

// ── Data types ────────────────────────────────────────────────────────────────
interface TlItem {
  id: string
  title: string
  status: 'done' | 'active' | 'overdue' | 'upcoming' | 'event'
  dotLabel: string
  badge: string
  badgeType: 'done' | 'today' | 'urgent' | 'soon' | 'upcoming' | 'event'
  meta1: string
  meta2: string
}

interface TlPhase {
  id: string
  name: string
  dotColor: string
  nameColor?: string
  dotSize?: string
  items: TlItem[]
}

interface ClItem {
  id: string
  text: string
  due: string
  flag: 'done' | 'urgent' | 'soon' | 'upcoming'
  cat: 'vendors' | 'payments' | 'personal'
}

interface ClCat {
  id: 'vendors' | 'payments' | 'personal'
  icon: string
  name: string
  items: ClItem[]
}

interface RosItem {
  time: string
  title: string
  detail: string
  vendor?: string
  dotColor: string
  last?: boolean
}

// ── Timeline data ─────────────────────────────────────────────────────────────
const TIMELINE_PHASES: TlPhase[] = [
  {
    id: 'planning',
    name: 'Planning Phase',
    dotColor: '#0D9B6A',
    items: [
      {
        id: 't1',
        title: 'Complete event intake & AI plan',
        status: 'done',
        dotLabel: '✓',
        badge: 'Done',
        badgeType: 'done',
        meta1: '📅 Jun 22',
        meta2: '✦ AI Generated',
      },
      {
        id: 't2',
        title: 'Book venue — The Astorian',
        status: 'done',
        dotLabel: '✓',
        badge: 'Done',
        badgeType: 'done',
        meta1: '📅 Jun 23',
        meta2: '💰 $5,500',
      },
      {
        id: 't3',
        title: 'Book florist — Bloom & Co',
        status: 'done',
        dotLabel: '✓',
        badge: 'Done',
        badgeType: 'done',
        meta1: '📅 Jun 25',
        meta2: '💰 $2,200',
      },
    ],
  },
  {
    id: 'now',
    name: 'Right Now',
    dotColor: '#4A0E6E',
    items: [
      {
        id: 't4',
        title: 'Book caterer — headcount needed',
        status: 'active',
        dotLabel: '→',
        badge: 'Today',
        badgeType: 'today',
        meta1: '⚠️ Overdue 2 days',
        meta2: '📍 Houston',
      },
      {
        id: 't5',
        title: 'Confirm DJ & share playlist',
        status: 'overdue',
        dotLabel: '!',
        badge: 'Overdue',
        badgeType: 'urgent',
        meta1: '📅 Was Jun 28',
        meta2: '🎵 DJ Smooth HTX',
      },
    ],
  },
  {
    id: 'upcoming',
    name: 'Coming Up',
    dotColor: '#E67E22',
    items: [
      {
        id: 't6',
        title: 'Final guest list & RSVPs due',
        status: 'upcoming',
        dotLabel: '3',
        badge: 'Jun 30',
        badgeType: 'soon',
        meta1: '👥 200 expected',
        meta2: '📧 Invites sent',
      },
      {
        id: 't7',
        title: 'Hair & makeup trial appointment',
        status: 'upcoming',
        dotLabel: '4',
        badge: 'Jul 5',
        badgeType: 'upcoming',
        meta1: '💄 Glam Squad HTX',
        meta2: '⏱️ 10:00 AM',
      },
      {
        id: 't8',
        title: 'Final venue payment due',
        status: 'upcoming',
        dotLabel: '5',
        badge: 'Jul 10',
        badgeType: 'upcoming',
        meta1: '💰 $2,750 balance',
        meta2: '🏛️ The Astorian',
      },
    ],
  },
  {
    id: 'final',
    name: 'Final Stretch',
    dotColor: '#DDB8F5',
    items: [
      {
        id: 't9',
        title: 'Venue walkthrough & final details',
        status: 'upcoming',
        dotLabel: '6',
        badge: 'Aug 7',
        badgeType: 'upcoming',
        meta1: '📍 The Astorian',
        meta2: '🕐 2:00 PM',
      },
      {
        id: 't10',
        title: 'Vendor final payments',
        status: 'upcoming',
        dotLabel: '7',
        badge: 'Aug 10',
        badgeType: 'upcoming',
        meta1: '💰 $4,260 total',
        meta2: '👥 4 vendors',
      },
    ],
  },
  {
    id: 'bigday',
    name: 'The Big Day',
    dotColor: '#D4AC0D',
    nameColor: '#4A0E6E',
    dotSize: '12px',
    items: [
      {
        id: 't11',
        title: 'Wedding Day! 🎉',
        status: 'event',
        dotLabel: '💍',
        badge: 'Aug 14',
        badgeType: 'event',
        meta1: '47 days away',
        meta2: 'The Astorian',
      },
    ],
  },
]

// ── Checklist data ────────────────────────────────────────────────────────────
const CHECKLIST_CATS: ClCat[] = [
  {
    id: 'vendors',
    icon: '🛒',
    name: 'Vendors',
    items: [
      { id: 'c1', text: 'Book florist — Bloom & Co', due: 'Completed Jun 25', flag: 'done', cat: 'vendors' },
      { id: 'c2', text: 'Book caterer — confirm headcount first', due: 'Due today', flag: 'urgent', cat: 'vendors' },
      { id: 'c3', text: 'Confirm DJ and send song list', due: 'Was due Jun 28', flag: 'urgent', cat: 'vendors' },
    ],
  },
  {
    id: 'payments',
    icon: '💰',
    name: 'Payments',
    items: [
      { id: 'c4', text: 'Venue deposit — $1,375', due: 'Paid Jun 23', flag: 'done', cat: 'payments' },
      { id: 'c5', text: 'Venue balance — $2,750 due', due: 'Due Jul 10', flag: 'soon', cat: 'payments' },
      { id: 'c6', text: 'Florist balance — $1,650 due', due: 'Due Aug 1', flag: 'upcoming', cat: 'payments' },
    ],
  },
  {
    id: 'personal',
    icon: '👤',
    name: 'Personal',
    items: [
      { id: 'c7', text: 'Send save the dates', due: 'Completed Jun 20', flag: 'done', cat: 'personal' },
      { id: 'c8', text: 'Confirm final guest list headcount', due: 'Due Jun 30', flag: 'soon', cat: 'personal' },
      { id: 'c9', text: 'Hair & makeup trial appointment', due: 'Jul 5 · 10:00 AM', flag: 'upcoming', cat: 'personal' },
      { id: 'c10', text: 'Write personal vows', due: 'Due Jul 20', flag: 'upcoming', cat: 'personal' },
    ],
  },
]

const INITIAL_DONE = new Set(['c1', 'c4', 'c7'])

// ── Run-of-show data ──────────────────────────────────────────────────────────
const RUN_OF_SHOW: RosItem[] = [
  { time: '8:00 AM', title: 'Vendor Setup Begins', detail: 'Florals, lighting, furniture rentals begin setup', vendor: '🌸 Bloom & Co · 🎪 Rentals Co', dotColor: '#4A0E6E' },
  { time: '10:00 AM', title: 'Bridal Party Hair & Makeup', detail: '6 people · Full glam · Bridal suite', vendor: '💄 Glam Squad HTX', dotColor: '#6B1F9A' },
  { time: '12:00 PM', title: 'Photography — Getting Ready', detail: 'Candid getting-ready shots, bridal portraits', vendor: '📸 Lens & Light Studio', dotColor: '#E67E22' },
  { time: '3:00 PM', title: 'Ceremony Begins', detail: 'Guests seated · Live string quartet · Processional', vendor: '🎻 String Quartet', dotColor: '#D4AC0D' },
  { time: '4:00 PM', title: 'Cocktail Hour', detail: 'Open bar, passed appetizers, lounge area', vendor: '🍹 Bar Service · 🍽️ Saffron & Co', dotColor: '#0D9B6A' },
  { time: '5:30 PM', title: 'Reception Dinner', detail: 'Guests seated · 3-course dinner service · Toasts', vendor: '🍽️ Saffron & Co', dotColor: '#4A0E6E' },
  { time: '7:30 PM', title: 'First Dance & Party', detail: 'DJ takes over · Afrobeats to R&B · Dance floor opens', vendor: '🎵 DJ Smooth HTX', dotColor: '#6B1F9A' },
  { time: '11:00 PM', title: 'Event Ends · Vendor Breakdown', detail: 'All vendors begin breakdown · Couple departs', dotColor: '#1A1A2E', last: true },
]

// ── Badge style map ───────────────────────────────────────────────────────────
const BADGE_STYLES: Record<string, { bg: string; color: string }> = {
  done:     { bg: '#E6F7F2', color: '#0D9B6A' },
  today:    { bg: '#4A0E6E', color: 'white' },
  urgent:   { bg: '#FDEDEC', color: '#C0392B' },
  soon:     { bg: '#FEF3E2', color: '#E67E22' },
  upcoming: { bg: '#F3E8FF', color: '#4A0E6E' },
  event:    { bg: '#4A0E6E', color: 'white' },
}

const FLAG_STYLES: Record<string, { bg: string; color: string }> = {
  done:     { bg: '#E6F7F2', color: '#0D9B6A' },
  urgent:   { bg: '#FDEDEC', color: '#C0392B' },
  soon:     { bg: '#FEF3E2', color: '#E67E22' },
  upcoming: { bg: '#F3E8FF', color: '#4A0E6E' },
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TimelinePage() {
  const [activeTab, setActiveTab] = useState<Tab>('timeline')
  const [filterPill, setFilterPill] = useState<FilterPill>('all')
  const [doneItems, setDoneItems] = useState<Set<string>>(INITIAL_DONE)
  const [ringIn, setRingIn] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setRingIn(true))
    return () => cancelAnimationFrame(id)
  }, [])

  function toggleItem(id: string) {
    setDoneItems(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // ── Filter checklist items by pill ──
  function isVisible(item: ClItem): boolean {
    if (filterPill === 'all') return true
    if (filterPill === 'urgent') return item.flag === 'urgent'
    if (filterPill === 'vendors') return item.cat === 'vendors'
    if (filterPill === 'payments') return item.cat === 'payments'
    if (filterPill === 'personal') return item.cat === 'personal'
    return true
  }

  // ── Flatten all items to know which is last for the connector ──
  const allTlItems = TIMELINE_PHASES.flatMap(p => p.items)

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

        {/* ── HEADER ── */}
        <div className="bg-[#1A1A2E] px-5 pt-3.5 flex-shrink-0 relative overflow-hidden">
          {/* Radial orb */}
          <div
            className="absolute w-[220px] h-[220px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(107,31,154,0.3) 0%, transparent 70%)',
              top: '-80px',
              right: '-50px',
            }}
          />

          {/* Top bar */}
          <div className="flex items-center justify-between mb-3.5 relative z-[1]">
            <button
              className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-white text-base"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              ←
            </button>
            <span
              className="text-[18px] font-extrabold text-white tracking-[-0.4px]"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              My Event
            </span>
            <button
              className="w-[34px] h-[34px] rounded-[10px] bg-[#6B1F9A] flex items-center justify-center text-white text-[20px] font-light"
            >
              +
            </button>
          </div>

          {/* Progress ring + stats */}
          <div className="flex items-center gap-4 pb-4 relative z-[1]">
            <div className="relative flex-shrink-0">
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                style={{ transform: 'rotate(-90deg)' }}
              >
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="5"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  fill="none"
                  stroke="#DDB8F5"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray="163"
                  style={{
                    strokeDashoffset: ringIn ? '62' : '163',
                    transition: 'stroke-dashoffset 1s ease',
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-[16px] font-extrabold text-white leading-none"
                  style={{ fontFamily: 'var(--font-syne)' }}
                >
                  62%
                </span>
                <span className="text-[9px] mt-[1px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  done
                </span>
              </div>
            </div>
            <div className="flex-1">
              <div
                className="text-[15px] font-bold text-white mb-[3px]"
                style={{ fontFamily: 'var(--font-syne)' }}
              >
                Aisha & Marcus Wedding
              </div>
              <div className="flex gap-3">
                {[
                  { val: '18', label: 'tasks done' },
                  { val: '11', label: 'remaining' },
                  { val: '3', label: 'urgent' },
                ].map(s => (
                  <span key={s.label} className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    <span className="text-white font-bold">{s.val}</span> {s.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Countdown chips */}
          <div className="flex gap-2 pb-4 relative z-[1]">
            {[
              { num: '47', label: 'Days Left', urgent: true },
              { num: '4', label: 'Vendors Booked', urgent: false },
              { num: '3', label: 'Still Needed', urgent: false },
              { num: '$6.7K', label: 'Spent', urgent: false },
            ].map(chip => (
              <div
                key={chip.label}
                className="flex-1 rounded-xl p-2.5 text-center"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div
                  className="text-[20px] font-extrabold leading-none"
                  style={{
                    fontFamily: 'var(--font-syne)',
                    color: chip.urgent ? '#FF6B6B' : 'white',
                  }}
                >
                  {chip.num}
                </div>
                <div
                  className="text-[9px] mt-0.5 tracking-[0.5px]"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  {chip.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex bg-white border-b border-[#F3E8FF] flex-shrink-0">
          {([
            { id: 'timeline', label: '📅 Timeline' },
            { id: 'checklist', label: '✅ Checklist' },
            { id: 'dayof', label: '🎯 Day-Of' },
          ] as { id: Tab; label: string }[]).map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="flex-1 py-[11px] px-1.5 text-[11px] font-bold text-center"
              style={{
                fontFamily: 'var(--font-syne)',
                color: activeTab === t.id ? '#4A0E6E' : '#7C6B8A',
                borderBottom: activeTab === t.id ? '2px solid #4A0E6E' : '2px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB BODIES ── */}
        <div
          key={activeTab}
          className="flex-1 overflow-y-auto scrollbar-hide"
          style={{ animation: 'fadeUp 0.3s ease both' }}
        >
          {/* ══ TIMELINE TAB ══ */}
          {activeTab === 'timeline' && (
            <div className="px-5 py-4">
              {TIMELINE_PHASES.map(phase => (
                <div key={phase.id}>
                  {/* Phase header */}
                  <div
                    className="flex items-center gap-2.5 mb-3"
                    style={{ marginTop: phase.id === 'planning' ? 0 : '16px' }}
                  >
                    <div
                      className="rounded-full flex-shrink-0"
                      style={{
                        width: phase.dotSize ?? '10px',
                        height: phase.dotSize ?? '10px',
                        background: phase.dotColor,
                      }}
                    />
                    <span
                      className="text-[11px] font-bold uppercase tracking-[1.5px]"
                      style={{
                        fontFamily: 'var(--font-syne)',
                        color: phase.nameColor ?? '#7C6B8A',
                        fontSize: phase.nameColor ? '12px' : undefined,
                      }}
                    >
                      {phase.name}
                    </span>
                    <div className="flex-1 h-px bg-[#F3E8FF]" />
                  </div>

                  {/* Phase items */}
                  {phase.items.map((item, itemIdx) => {
                    const isLastOverall = item.id === allTlItems[allTlItems.length - 1].id
                    const showLine = !isLastOverall

                    // Dot styles
                    let dotBg = ''
                    let dotColor = 'white'
                    let dotBorder = ''
                    let dotFontSize = '12px'
                    if (item.status === 'done') { dotBg = '#0D9B6A' }
                    else if (item.status === 'active') { dotBg = '#4A0E6E' }
                    else if (item.status === 'overdue') {
                      dotBg = '#FDEDEC'; dotColor = '#C0392B'
                      dotBorder = '2px solid #C0392B'
                    }
                    else if (item.status === 'upcoming') {
                      dotBg = 'white'; dotColor = '#7C6B8A'
                      dotBorder = '2px solid #DDB8F5'
                    }
                    else if (item.status === 'event') {
                      dotBg = 'linear-gradient(135deg,#4A0E6E,#D4AC0D)'
                      dotFontSize = '14px'
                    }

                    // Card styles
                    let cardBg = 'white'
                    let cardBorder = 'transparent'
                    let cardOpacity = '1'
                    let titleColor = '#1A1A2E'
                    let titleDecoration = 'none'
                    if (item.status === 'done') { cardOpacity = '0.65'; titleColor = '#7C6B8A'; titleDecoration = 'line-through' }
                    else if (item.status === 'active') { cardBorder = '#4A0E6E'; cardBg = '#F3E8FF' }
                    else if (item.status === 'overdue') { cardBorder = '#C0392B'; cardBg = '#FDEDEC' }
                    else if (item.status === 'event') { cardBorder = '#4A0E6E'; cardBg = '#F3E8FF'; titleColor = '#4A0E6E' }

                    const bs = BADGE_STYLES[item.badgeType]

                    return (
                      <div key={item.id} className="flex gap-3.5 mb-2.5" style={{ marginBottom: itemIdx === phase.items.length - 1 && !isLastOverall ? '10px' : '10px' }}>
                        {/* Left: dot + line */}
                        <div className="flex flex-col items-center flex-shrink-0 w-7">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center font-bold flex-shrink-0 relative z-[1]"
                            style={{
                              background: dotBg,
                              color: dotColor,
                              border: dotBorder || 'none',
                              fontSize: dotFontSize,
                              fontFamily: 'var(--font-syne)',
                              animation: item.status === 'active' ? 'tlPulse 2s ease infinite' : 'none',
                            }}
                          >
                            {item.dotLabel}
                          </div>
                          {showLine && (
                            <div
                              className="w-0.5 flex-1 mt-1"
                              style={{
                                background: item.status === 'done' ? '#0D9B6A' : '#F3E8FF',
                                opacity: item.status === 'done' ? 0.4 : 1,
                                minHeight: '20px',
                              }}
                            />
                          )}
                        </div>

                        {/* Card */}
                        <div
                          className="flex-1 rounded-[14px] px-3.5 py-3 mb-0.5 cursor-pointer"
                          style={{
                            background: cardBg,
                            border: `2px solid ${cardBorder}`,
                            boxShadow: '0 2px 6px rgba(74,14,110,0.05)',
                            opacity: cardOpacity,
                            transition: 'all 0.2s',
                          }}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span
                              className="text-[13px] font-bold leading-[1.3]"
                              style={{
                                fontFamily: 'var(--font-syne)',
                                color: titleColor,
                                textDecoration: titleDecoration,
                                fontSize: item.status === 'event' ? '15px' : '13px',
                              }}
                            >
                              {item.title}
                            </span>
                            <div
                              className="text-[9px] font-bold px-[7px] py-[3px] rounded-[5px] whitespace-nowrap flex-shrink-0"
                              style={{
                                fontFamily: 'var(--font-syne)',
                                background: bs.bg,
                                color: bs.color,
                              }}
                            >
                              {item.badge}
                            </div>
                          </div>
                          <div className="flex gap-2.5">
                            {[item.meta1, item.meta2].map((m, i) => (
                              <span
                                key={i}
                                className="text-[11px] flex items-center gap-[3px]"
                                style={{
                                  color: item.status === 'event' ? '#4A0E6E' : '#7C6B8A',
                                }}
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
              <div className="h-4" />
            </div>
          )}

          {/* ══ CHECKLIST TAB ══ */}
          {activeTab === 'checklist' && (
            <div className="px-5 py-3.5">
              {/* Summary chips */}
              <div className="flex gap-2 mb-3.5">
                {[
                  { num: '18', label: 'Done', bg: '#E6F7F2', color: '#0D9B6A' },
                  { num: '3', label: 'Urgent', bg: '#FDEDEC', color: '#C0392B' },
                  { num: '5', label: 'This Week', bg: '#FEF3E2', color: '#E67E22' },
                  { num: '3', label: 'Upcoming', bg: '#F3E8FF', color: '#4A0E6E' },
                ].map(s => (
                  <div key={s.label} className="flex-1 rounded-xl p-2.5 text-center" style={{ background: s.bg }}>
                    <div
                      className="text-[18px] font-extrabold leading-none"
                      style={{ fontFamily: 'var(--font-syne)', color: s.color }}
                    >
                      {s.num}
                    </div>
                    <div className="text-[10px] mt-0.5 font-semibold" style={{ color: s.color }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Filter pills */}
              <div className="flex gap-[7px] mb-3.5 overflow-x-auto scrollbar-hide">
                {([
                  { id: 'all', label: 'All' },
                  { id: 'urgent', label: '🔴 Urgent' },
                  { id: 'vendors', label: '🛒 Vendors' },
                  { id: 'payments', label: '💰 Payments' },
                  { id: 'personal', label: '👤 Personal' },
                ] as { id: FilterPill; label: string }[]).map(p => (
                  <button
                    key={p.id}
                    onClick={() => setFilterPill(p.id)}
                    className="rounded-[20px] px-3 py-[5px] text-[11px] font-bold whitespace-nowrap flex-shrink-0"
                    style={{
                      fontFamily: 'var(--font-syne)',
                      background: filterPill === p.id ? '#4A0E6E' : 'white',
                      border: `2px solid ${filterPill === p.id ? '#4A0E6E' : '#DDB8F5'}`,
                      color: filterPill === p.id ? 'white' : '#7C6B8A',
                      transition: 'all 0.15s',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Categories */}
              {CHECKLIST_CATS.map(cat => {
                const visible = cat.items.filter(isVisible)
                if (visible.length === 0) return null
                const remaining = visible.filter(i => !doneItems.has(i.id)).length

                return (
                  <div key={cat.id} className="mb-3.5">
                    <div className="flex items-center justify-between mb-2 cursor-pointer">
                      <div
                        className="flex items-center gap-2 text-[12px] font-bold text-[#1A1A2E]"
                        style={{ fontFamily: 'var(--font-syne)' }}
                      >
                        {cat.icon} {cat.name}
                        <span className="text-[11px] text-[#7C6B8A] bg-[#F3E8FF] rounded-[10px] px-2 py-[2px]">
                          {remaining} remaining
                        </span>
                      </div>
                      <span className="text-[12px] text-[#7C6B8A]">▾</span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {visible.map(item => {
                        const done = doneItems.has(item.id)
                        const effectiveFlag = done ? 'done' : item.flag
                        const fs = FLAG_STYLES[effectiveFlag]

                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleItem(item.id)}
                            className="bg-white rounded-xl px-3.5 py-3 flex items-center gap-3 cursor-pointer"
                            style={{
                              boxShadow: '0 2px 6px rgba(74,14,110,0.05)',
                              opacity: done ? 0.6 : 1,
                              transition: 'all 0.2s',
                            }}
                          >
                            {/* Checkbox */}
                            <div
                              className="w-[22px] h-[22px] rounded-[6px] flex items-center justify-center flex-shrink-0 text-[12px] font-bold text-white"
                              style={{
                                border: `2px solid ${done ? '#0D9B6A' : '#DDB8F5'}`,
                                background: done ? '#0D9B6A' : 'transparent',
                                transition: 'all 0.2s',
                              }}
                            >
                              {done ? '✓' : ''}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                              <div
                                className="text-[13px] text-[#1A1A2E] leading-[1.4]"
                                style={{
                                  textDecoration: done ? 'line-through' : 'none',
                                  color: done ? '#7C6B8A' : '#1A1A2E',
                                  transition: 'all 0.2s',
                                }}
                              >
                                {item.text}
                              </div>
                              <div className="text-[11px] text-[#7C6B8A] mt-0.5">{item.due}</div>
                            </div>

                            {/* Flag */}
                            <div
                              className="text-[10px] font-bold px-[7px] py-[3px] rounded-[5px] whitespace-nowrap flex-shrink-0"
                              style={{
                                fontFamily: 'var(--font-syne)',
                                background: fs.bg,
                                color: fs.color,
                              }}
                            >
                              {done ? 'Done' : effectiveFlag === 'urgent' ? 'Urgent' : effectiveFlag === 'soon' ? item.flag === 'soon' ? item.due.replace('Due ', '') : item.due : 'Upcoming'}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
              <div className="h-3" />
            </div>
          )}

          {/* ══ DAY-OF TAB ══ */}
          {activeTab === 'dayof' && (
            <div className="px-5 py-3.5">
              {/* Banner */}
              <div
                className="rounded-2xl p-4 mb-3.5 text-center"
                style={{ background: 'linear-gradient(135deg, #4A0E6E, #6B1F9A)' }}
              >
                <div
                  className="text-[16px] font-extrabold text-white mb-1"
                  style={{ fontFamily: 'var(--font-syne)' }}
                >
                  💍 Wedding Day Run of Show
                </div>
                <div className="text-[12px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  August 14, 2025 · The Astorian, Houston TX
                </div>
              </div>

              {/* Run of show */}
              <div className="flex flex-col">
                {RUN_OF_SHOW.map((item, i) => (
                  <div key={i} className="flex gap-3 items-stretch">
                    {/* Time column */}
                    <div className="w-14 flex-shrink-0 flex flex-col items-end pt-3">
                      <span
                        className="text-[11px] font-bold text-right text-[#7C6B8A]"
                        style={{ fontFamily: 'var(--font-syne)' }}
                      >
                        {item.time}
                      </span>
                    </div>

                    {/* Center: dot + connector */}
                    <div className="flex flex-col items-center w-5 flex-shrink-0 pt-3">
                      <div
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0 z-[1]"
                        style={{ background: item.dotColor }}
                      />
                      {!item.last && (
                        <div
                          className="w-0.5 flex-1 mt-1"
                          style={{ background: '#F3E8FF' }}
                        />
                      )}
                    </div>

                    {/* Card */}
                    <div
                      className="flex-1 bg-white rounded-xl p-3 mb-2"
                      style={{
                        boxShadow: '0 2px 6px rgba(74,14,110,0.05)',
                        borderLeft: `3px solid ${item.dotColor}`,
                      }}
                    >
                      <div
                        className="text-[13px] font-bold text-[#1A1A2E] mb-[3px]"
                        style={{ fontFamily: 'var(--font-syne)' }}
                      >
                        {item.title}
                      </div>
                      <div className="text-[11px] text-[#7C6B8A] leading-[1.4]">{item.detail}</div>
                      {item.vendor && (
                        <div
                          className="inline-flex items-center gap-1 bg-[#F3E8FF] rounded-[5px] px-[7px] py-[2px] text-[10px] font-bold text-[#4A0E6E] mt-[5px]"
                          style={{ fontFamily: 'var(--font-syne)' }}
                        >
                          {item.vendor}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-4" />
            </div>
          )}
        </div>

        {/* ── BOTTOM NAV ── */}
        <div className="flex bg-white border-t border-[#F3E8FF] pt-2.5 pb-4 flex-shrink-0">
          {[
            { icon: '🏠', label: 'Home', active: false },
            { icon: '🔍', label: 'Vendors', active: false },
            { icon: '📋', label: 'My Event', active: true },
            { icon: '💬', label: 'Messages', active: false },
            { icon: '👤', label: 'Profile', active: false },
          ].map(n => (
            <div key={n.label} className="flex-1 flex flex-col items-center gap-[3px] cursor-pointer py-1.5">
              <span className="text-[20px]">{n.icon}</span>
              <span
                className="text-[10px] font-bold"
                style={{
                  fontFamily: 'var(--font-syne)',
                  color: n.active ? '#4A0E6E' : '#7C6B8A',
                }}
              >
                {n.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
