'use client'
import { useState } from 'react'
import { Syne, Epilogue } from 'next/font/google'

const syne = Syne({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-syne' })
const epilogue = Epilogue({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-epilogue' })

type Tab = 'breakdown' | 'transactions' | 'forecast'
type StatusType = 'on' | 'over' | 'under'

// ── Data types ─────────────────────────────────────────────────────────────────
interface CategoryRow {
  icon: string
  iconBg: string
  name: string
  spent: string
  budget: string
  barPct: number
  barColor: string
  status: StatusType
  statusLabel: string
  urgentBorder?: boolean
  amtColor?: string
}

interface Transaction {
  id: string
  icon: string
  iconBg: string
  name: string
  detail: string
  amount: string
  isCredit?: boolean
}

interface UpcomingPayment {
  icon: string
  iconBg: string
  name: string
  due: string
  amount: string
  amtColor: string
}

// ── Static data ────────────────────────────────────────────────────────────────
const BAR_SEGMENTS = [
  { width: '32%', color: '#6B1F9A', label: 'Venue' },
  { width: '21%', color: '#5DADE2', label: 'Photo' },
  { width: '10%', color: '#E67E22', label: 'Florals' },
  { width: '9%',  color: '#0D9B6A', label: 'DJ' },
  { width: '7%',  color: '#D4AC0D', label: 'Beauty' },
  { width: '6%',  color: '#E74C3C', label: 'Bar' },
  { width: '15%', color: 'rgba(255,255,255,0.06)', label: '' },
]

const STATUS_STYLES: Record<StatusType, { bg: string; color: string }> = {
  on:    { bg: '#E6F7F2', color: '#0D9B6A' },
  over:  { bg: '#FDEDEC', color: '#C0392B' },
  under: { bg: '#F3E8FF', color: '#4A0E6E' },
}

const CATEGORIES: CategoryRow[] = [
  {
    icon: '🏛️', iconBg: 'rgba(107,31,154,0.1)',
    name: 'Venue', spent: '$1,375', budget: 'of $5,500',
    barPct: 25, barColor: '#6B1F9A',
    status: 'under', statusLabel: 'Deposit paid · Balance Jul 10',
  },
  {
    icon: '📸', iconBg: 'rgba(93,173,226,0.1)',
    name: 'Photography', spent: '$3,100', budget: 'of $3,100',
    barPct: 100, barColor: '#5DADE2',
    status: 'on', statusLabel: '✓ Fully paid',
  },
  {
    icon: '🌸', iconBg: 'rgba(230,126,34,0.1)',
    name: 'Florals & Décor', spent: '$570', budget: 'of $2,200',
    barPct: 26, barColor: '#E67E22',
    status: 'under', statusLabel: 'Deposit paid · Balance Aug 1',
  },
  {
    icon: '🎵', iconBg: 'rgba(13,155,106,0.1)',
    name: 'DJ / Music', spent: '$362', budget: 'of $1,450',
    barPct: 25, barColor: '#0D9B6A',
    status: 'under', statusLabel: 'Deposit paid',
  },
  {
    icon: '🍽️', iconBg: '#FDEDEC',
    name: 'Catering', spent: '$0', budget: 'of $4,800',
    barPct: 0, barColor: '#C0392B',
    status: 'over', statusLabel: '⚠ Not booked — urgent',
    urgentBorder: true, amtColor: '#C0392B',
  },
  {
    icon: '💄', iconBg: '#FEF9E7',
    name: 'Hair & Makeup', spent: '$0', budget: 'of $1,250',
    barPct: 0, barColor: '#D4AC0D',
    status: 'under', statusLabel: 'Not yet booked',
  },
]

const TRANSACTIONS: Transaction[] = [
  { id: 't1', icon: '🌸', iconBg: '#F3E8FF', name: 'Bloom & Co — Deposit',        detail: 'Jun 25 · Signature Package · Stripe',  amount: '-$570' },
  { id: 't2', icon: '🎵', iconBg: '#F3E8FF', name: 'DJ Smooth — Deposit',          detail: 'Jun 24 · Standard Package · Stripe',   amount: '-$362' },
  { id: 't3', icon: '📸', iconBg: '#F3E8FF', name: 'Lens & Light Studio — Full',   detail: 'Jun 24 · Premium Package · Stripe',    amount: '-$3,100' },
  { id: 't4', icon: '🏛️', iconBg: '#F3E8FF', name: 'The Astorian — Deposit',       detail: 'Jun 23 · Venue Booking · Stripe',      amount: '-$1,375' },
  { id: 't5', icon: '💚', iconBg: '#E6F7F2', name: 'Refund — Venue Change Fee',    detail: 'Jun 23 · Waived by venue · Stripe',    amount: '+$150', isCredit: true },
]

const UPCOMING_PAYMENTS: UpcomingPayment[] = [
  { icon: '🏛️', iconBg: '#FDEDEC', name: 'Venue Balance — The Astorian', due: 'Due Jul 10', amount: '$2,750', amtColor: '#C0392B' },
  { icon: '🌸', iconBg: '#FEF3E2', name: 'Florist Balance — Bloom & Co',  due: 'Due Aug 1',  amount: '$1,650', amtColor: '#E67E22' },
  { icon: '🎵', iconBg: '#F3E8FF', name: 'DJ Balance — DJ Smooth',        due: 'Due Aug 7',  amount: '$1,088', amtColor: '#4A0E6E' },
]

// ── Page ───────────────────────────────────────────────────────────────────────
export default function BudgetPage() {
  const [activeTab, setActiveTab] = useState<Tab>('breakdown')

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
        <div className="w-[120px] h-8 bg-[#1A1A2E] rounded-b-[20px] mx-auto flex-shrink-0" />

        {/* ── HEADER ── */}
        <div className="bg-[#1A1A2E] px-5 pt-3.5 pb-5 flex-shrink-0 relative overflow-hidden">
          <div
            className="absolute w-[220px] h-[220px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(107,31,154,0.3) 0%, transparent 70%)', top: '-80px', right: '-50px' }}
          />

          {/* Top bar */}
          <div className="flex items-center justify-between mb-4 relative z-[1]">
            <span className="text-[20px] font-extrabold text-white tracking-[-0.4px]" style={{ fontFamily: 'var(--font-syne)' }}>
              Budget Tracker
            </span>
            <div className="flex gap-2">
              {['📊', '+ Add'].map(btn => (
                <button
                  key={btn}
                  className="h-[34px] px-3 rounded-[10px] flex items-center justify-center text-[15px] text-white"
                  style={{ background: 'rgba(255,255,255,0.08)', border: 'none', fontFamily: 'var(--font-syne)', fontSize: btn === '+ Add' ? '12px' : undefined, fontWeight: btn === '+ Add' ? 700 : undefined }}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>

          {/* Budget hero */}
          <div className="relative z-[1] text-center mb-4">
            <div
              className="text-[11px] font-bold uppercase tracking-[1px] mb-1"
              style={{ fontFamily: 'var(--font-syne)', color: 'rgba(255,255,255,0.4)' }}
            >
              Total Spent
            </div>
            <div
              className="text-[42px] font-extrabold text-white leading-none tracking-[-2px]"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              $6,750
            </div>
            <div className="text-[14px] mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
              of $15,000 budget
            </div>
            <div
              className="inline-flex items-center gap-1.5 rounded-[20px] px-3 py-1 mt-2"
              style={{ background: 'rgba(13,155,106,0.2)', border: '1px solid rgba(13,155,106,0.3)' }}
            >
              <span className="text-sm">💚</span>
              <span className="text-[13px] font-bold" style={{ fontFamily: 'var(--font-syne)', color: '#4ECDC4' }}>
                $8,250 remaining
              </span>
            </div>
          </div>

          {/* Segmented bar */}
          <div className="relative z-[1]">
            <div className="h-2.5 rounded-[5px] overflow-hidden flex mb-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
              {BAR_SEGMENTS.map((seg, i) => (
                <div key={i} style={{ width: seg.width, background: seg.color, height: '100%' }} />
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {BAR_SEGMENTS.filter(s => s.label).map(seg => (
                <div
                  key={seg.label}
                  className="flex items-center gap-[3px] text-[9px] font-bold"
                  style={{ fontFamily: 'var(--font-syne)', color: 'rgba(255,255,255,0.4)' }}
                >
                  <div className="w-2 h-2 rounded-[2px]" style={{ background: seg.color }} />
                  {seg.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex bg-white border-b border-[#F3E8FF] flex-shrink-0">
          {([
            { id: 'breakdown',    label: '📊 Breakdown' },
            { id: 'transactions', label: '🧾 Transactions' },
            { id: 'forecast',     label: '🔮 Forecast' },
          ] as { id: Tab; label: string }[]).map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="flex-1 py-[11px] px-1.5 text-[11px] font-bold text-center"
              style={{
                fontFamily: 'var(--font-syne)',
                color: activeTab === t.id ? '#4A0E6E' : '#7C6B8A',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === t.id ? '2px solid #4A0E6E' : '2px solid transparent',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB BODIES ── */}
        <div
          key={activeTab}
          className="flex-1 overflow-y-auto scrollbar-hide px-5 py-3.5"
          style={{ animation: 'fadeUp 0.3s ease both' }}
        >

          {/* ══ BREAKDOWN TAB ══ */}
          {activeTab === 'breakdown' && (
            <>
              {/* AI tip */}
              <div className="bg-[#1A1A2E] rounded-[14px] p-3.5 flex gap-2.5 mb-3.5">
                <span className="text-[18px] flex-shrink-0">✦</span>
                <p className="text-[12px] leading-[1.6]" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  You're <span className="font-bold" style={{ color: '#DDB8F5' }}>45% through your budget</span> with 4 vendors still unbooked. Based on your plan, you'll need ~$7,200 more. You're on track.
                </p>
              </div>

              {/* Category rows */}
              {CATEGORIES.map(cat => {
                const statusStyle = STATUS_STYLES[cat.status]
                return (
                  <div
                    key={cat.name}
                    className="bg-white rounded-[14px] p-3.5 mb-2.5 cursor-pointer"
                    style={{
                      boxShadow: '0 2px 8px rgba(74,14,110,0.06)',
                      border: cat.urgentBorder ? '2px solid #C0392B' : '2px solid transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div
                        className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[18px] flex-shrink-0"
                        style={{ background: cat.iconBg }}
                      >
                        {cat.icon}
                      </div>
                      <div
                        className="flex-1 text-[13px] font-bold text-[#1A1A2E]"
                        style={{ fontFamily: 'var(--font-syne)' }}
                      >
                        {cat.name}
                      </div>
                      <div className="text-right">
                        <div
                          className="text-[14px] font-extrabold"
                          style={{ fontFamily: 'var(--font-syne)', color: cat.amtColor ?? '#1A1A2E' }}
                        >
                          {cat.spent}
                        </div>
                        <div className="text-[10px] text-[#7C6B8A] mt-[1px]">{cat.budget}</div>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-[3px] overflow-hidden mb-1.5" style={{ background: '#F3E8FF' }}>
                      <div
                        className="h-full rounded-[3px]"
                        style={{ width: `${cat.barPct}%`, background: cat.barColor }}
                      />
                    </div>
                    <span
                      className="text-[10px] font-bold px-[7px] py-[2px] rounded-[5px] inline-block"
                      style={{ fontFamily: 'var(--font-syne)', background: statusStyle.bg, color: statusStyle.color }}
                    >
                      {cat.statusLabel}
                    </span>
                  </div>
                )
              })}
              <div className="h-3" />
            </>
          )}

          {/* ══ TRANSACTIONS TAB ══ */}
          {activeTab === 'transactions' && (
            <>
              <div
                className="text-[11px] font-bold uppercase tracking-[1px] text-[#7C6B8A] mb-2.5"
                style={{ fontFamily: 'var(--font-syne)' }}
              >
                June 2025
              </div>
              {TRANSACTIONS.map(tx => (
                <div
                  key={tx.id}
                  className="bg-white rounded-xl px-3.5 py-3 mb-2 flex items-center gap-3"
                  style={{ boxShadow: '0 2px 6px rgba(74,14,110,0.05)' }}
                >
                  <div
                    className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-[18px] flex-shrink-0"
                    style={{ background: tx.iconBg }}
                  >
                    {tx.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-syne)' }}>
                      {tx.name}
                    </div>
                    <div className="text-[11px] text-[#7C6B8A] mt-[2px]">{tx.detail}</div>
                  </div>
                  <div
                    className="text-[14px] font-extrabold"
                    style={{ fontFamily: 'var(--font-syne)', color: tx.isCredit ? '#0D9B6A' : '#C0392B' }}
                  >
                    {tx.amount}
                  </div>
                </div>
              ))}
              <div className="h-3" />
            </>
          )}

          {/* ══ FORECAST TAB ══ */}
          {activeTab === 'forecast' && (
            <>
              {/* AI tip */}
              <div className="bg-[#1A1A2E] rounded-[14px] p-3.5 flex gap-2.5 mb-3.5">
                <span className="text-[18px] flex-shrink-0">✦</span>
                <p className="text-[12px] leading-[1.6]" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  AI forecast based on your current bookings and remaining vendors.{' '}
                  <span className="font-bold" style={{ color: '#DDB8F5' }}>You have $8,250 left</span> for 4 unbooked categories. You're on track to finish under budget.
                </p>
              </div>

              {/* Upcoming payments */}
              <div
                className="text-[13px] font-bold text-[#1A1A2E] mb-2.5"
                style={{ fontFamily: 'var(--font-syne)' }}
              >
                Upcoming Payments
              </div>
              <div className="flex flex-col gap-2 mb-4">
                {UPCOMING_PAYMENTS.map(p => (
                  <div
                    key={p.name}
                    className="bg-white rounded-xl px-3.5 py-3 flex items-center gap-3"
                    style={{ boxShadow: '0 2px 6px rgba(74,14,110,0.05)' }}
                  >
                    <div
                      className="w-10 h-10 rounded-[10px] flex items-center justify-center text-[18px] flex-shrink-0"
                      style={{ background: p.iconBg }}
                    >
                      {p.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-syne)' }}>
                        {p.name}
                      </div>
                      <div className="text-[11px] text-[#7C6B8A] mt-[2px]">{p.due}</div>
                    </div>
                    <div
                      className="text-[14px] font-extrabold"
                      style={{ fontFamily: 'var(--font-syne)', color: p.amtColor }}
                    >
                      {p.amount}
                    </div>
                  </div>
                ))}
              </div>

              {/* On budget banner */}
              <div className="rounded-[14px] p-3.5 flex gap-2.5" style={{ background: '#E6F7F2' }}>
                <span className="text-[20px] flex-shrink-0">💚</span>
                <div>
                  <div
                    className="text-[13px] font-bold mb-1"
                    style={{ fontFamily: 'var(--font-syne)', color: '#0D9B6A' }}
                  >
                    You're On Budget
                  </div>
                  <div className="text-[12px] leading-[1.6]" style={{ color: '#0D9B6A', opacity: 0.8 }}>
                    After all projected payments, you'll have ~$1,200 reserve remaining. AI recommends keeping at least $800 for day-of surprises.
                  </div>
                </div>
              </div>
              <div className="h-3" />
            </>
          )}
        </div>

        {/* ── BOTTOM NAV ── */}
        <div className="flex bg-white border-t border-[#F3E8FF] pt-2.5 pb-4 flex-shrink-0">
          {[
            { icon: '🏠', label: 'Home',     active: false },
            { icon: '🔍', label: 'Vendors',  active: false },
            { icon: '📋', label: 'My Event', active: true  },
            { icon: '💬', label: 'Messages', active: false },
            { icon: '👤', label: 'Profile',  active: false },
          ].map(n => (
            <div key={n.label} className="flex-1 flex flex-col items-center gap-[3px] cursor-pointer py-1.5">
              <span className="text-[20px]">{n.icon}</span>
              <span
                className="text-[10px] font-bold"
                style={{ fontFamily: 'var(--font-syne)', color: n.active ? '#4A0E6E' : '#7C6B8A' }}
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
