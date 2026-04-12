'use client'

import { useState, useEffect } from 'react'
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

type VendorStatus = 'booked' | 'reviewing' | 'needed'
type TodoFlag = 'urgent' | 'soon' | 'done'

interface Vendor  { icon: string; iconBg: string; name: string; category: string; status: VendorStatus }
interface Todo    { text: string; done: boolean; flag: TodoFlag }
interface Milestone { day: string; month: string; text: string; daysLabel: string; color?: string; bold?: boolean }
interface MoodItem  { bg: string; emoji: string; isAdd?: boolean }
interface BudgetCat { dot: string; label: string }

// ── Static data ────────────────────────────────────────────────────────────────

const VENDORS: Vendor[] = [
  { icon: '🌸', iconBg: '#E6F7F2', name: 'Bloom & Co Florals',   category: 'Florals & Décor',  status: 'booked' },
  { icon: '📸', iconBg: '#F3E8FF', name: 'Lens & Light Studio',  category: 'Photography',       status: 'booked' },
  { icon: '🎵', iconBg: '#FEF3E2', name: 'DJ Smooth — reviewing', category: 'DJ / Music',        status: 'reviewing' },
  { icon: '🍽️', iconBg: '#FDEDEC', name: 'Caterer',              category: 'Catering',          status: 'needed' },
]

const INITIAL_TODOS: Todo[] = [
  { text: 'Book venue deposit — The Astorian',         done: true,  flag: 'done' },
  { text: 'Confirm florist — Bloom & Co',              done: true,  flag: 'done' },
  { text: 'Book caterer — final headcount due soon',   done: false, flag: 'urgent' },
  { text: 'Confirm DJ and send setlist preferences',   done: false, flag: 'soon' },
  { text: 'Send save the dates to guest list',         done: false, flag: 'soon' },
]

const MILESTONES: Milestone[] = [
  { day: '30', month: 'Jun', text: 'Final guest list headcount due',   daysLabel: 'In 8 days',  color: '#C0392B' },
  { day: '10', month: 'Jul', text: 'Final venue payment due',          daysLabel: 'In 18 days', color: '#E67E22' },
  { day: '25', month: 'Jul', text: 'Hair & makeup trial appointment',  daysLabel: 'In 33 days' },
  { day: '14', month: 'Aug', text: '💍 Wedding Day!',                  daysLabel: '47 days',    color: '#4A0E6E', bold: true },
]

const MOOD_ITEMS: MoodItem[] = [
  { bg: 'linear-gradient(135deg,#F5E6D3,#DDB8F5)', emoji: '🕯️' },
  { bg: 'linear-gradient(135deg,#E8F5E9,#C8E6C9)', emoji: '🌿' },
  { bg: 'linear-gradient(135deg,#F8BBD0,#F48FB1)', emoji: '🌸' },
  { bg: 'linear-gradient(135deg,#FFF8E1,#FFE082)', emoji: '✨' },
  { bg: 'linear-gradient(135deg,#E3F2FD,#90CAF9)', emoji: '🥂' },
  { bg: 'linear-gradient(135deg,#EDE7F6,#B39DDB)', emoji: '💐' },
  { bg: 'linear-gradient(135deg,#F3E8FF,#DDB8F5)', emoji: '+', isAdd: true },
]

const BUDGET_CATS: BudgetCat[] = [
  { dot: '#4A0E6E', label: 'Florals $2,200' },
  { dot: '#5DADE2', label: 'Photo $3,100' },
  { dot: '#E67E22', label: 'DJ $1,450' },
]

const NAV_ITEMS = [
  { icon: '🏠', label: 'Home' },
  { icon: '🔍', label: 'Vendors' },
  { icon: '📋', label: 'My Event' },
  { icon: '💬', label: 'Messages' },
  { icon: '👤', label: 'Profile' },
]

// ── Status helpers ─────────────────────────────────────────────────────────────

const VENDOR_STATUS: Record<VendorStatus, { bg: string; color: string; label: string }> = {
  booked:    { bg: '#E6F7F2', color: '#0D9B6A', label: '✓ Booked' },
  reviewing: { bg: '#F3E8FF', color: '#4A0E6E', label: 'Reviewing' },
  needed:    { bg: '#FDEDEC', color: '#C0392B', label: '⚠ Needed' },
}

const FLAG_STYLE: Record<TodoFlag, { bg: string; color: string; label: string }> = {
  urgent: { bg: '#FDEDEC', color: '#C0392B', label: 'Urgent' },
  soon:   { bg: '#FEF3E2', color: '#E67E22', label: 'This Week' },
  done:   { bg: '#E6F7F2', color: '#0D9B6A', label: 'Done' },
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SecLabel({ children, action }: { children: React.ReactNode; action?: string }) {
  return (
    <div className="flex items-center justify-between mb-2" style={{ fontFamily: 'var(--font-syne)' }}>
      <span className="text-[13px] font-bold text-[#1A1A2E] tracking-[-0.2px]">{children}</span>
      {action && <span className="text-[11px] font-semibold text-[#4A0E6E] cursor-pointer">{action}</span>}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [activeNav, setActiveNav] = useState('Home')
  const [todos, setTodos]         = useState<Todo[]>(INITIAL_TODOS)
  const [barsIn, setBarsIn]       = useState(false)

  // Trigger progress-bar fill on mount (CSS transition needs a tick to start)
  useEffect(() => {
    const id = requestAnimationFrame(() => setBarsIn(true))
    return () => cancelAnimationFrame(id)
  }, [])

  function toggleTodo(i: number) {
    setTodos(prev => prev.map((t, idx) => {
      if (idx !== i) return t
      const done = !t.done
      return { ...t, done, flag: done ? 'done' : 'soon' }
    }))
  }

  return (
    <div
      className={`${syne.variable} ${epilogue.variable} min-h-screen bg-[#1A1A2E] flex items-center justify-center p-6`}
      style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}
    >
      {/* Phone frame */}
      <div
        className="w-[375px] h-[812px] bg-[#F8F4FC] rounded-[48px] overflow-hidden flex flex-col flex-shrink-0"
        style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 10px #2D2D45, 0 0 0 12px #3D3D55' }}
      >
        {/* Notch */}
        <div className="w-[120px] h-8 bg-[#1A1A2E] rounded-b-[20px] mx-auto flex-shrink-0" />

        {/* ── HEADER ── */}
        <div className="bg-[#1A1A2E] px-[22px] pt-[14px] pb-[18px] flex-shrink-0 relative overflow-hidden">
          {/* Decorative glow */}
          <div
            aria-hidden
            className="absolute w-[200px] h-[200px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(107,31,154,0.35) 0%, transparent 70%)', top: '-60px', right: '-40px' }}
          />

          {/* Header top row */}
          <div className="flex items-start justify-between mb-[18px] relative z-[1]">
            <div>
              <div className="text-[12px] text-white/45 mb-[3px]">Good evening 🌙</div>
              <div className="text-[22px] font-extrabold text-white tracking-[-0.5px] leading-[1.1]" style={{ fontFamily: 'var(--font-syne)' }}>
                Aisha Johnson
              </div>
              <div
                className="inline-flex items-center gap-[5px] bg-white/[0.15] border border-[#DDB8F5]/25 rounded-[20px] px-[10px] py-1 text-[11px] text-[#DDB8F5] font-semibold mt-[5px]"
                style={{ fontFamily: 'var(--font-syne)' }}
              >
                💍 Wedding · Houston, TX
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <button className="w-9 h-9 rounded-[10px] bg-white/[0.08] border-none cursor-pointer flex items-center justify-center text-base relative">
                🔔
                <span className="absolute top-[5px] right-[5px] w-[7px] h-[7px] rounded-full bg-[#FF6B6B] border-2 border-[#1A1A2E]" />
              </button>
              <button className="w-9 h-9 rounded-[10px] bg-white/[0.08] border-none cursor-pointer flex items-center justify-center text-base">
                👤
              </button>
            </div>
          </div>

          {/* Event card */}
          <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl px-4 py-[14px] relative z-[1]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[15px] font-bold text-white" style={{ fontFamily: 'var(--font-syne)' }}>
                  Aisha &amp; Marcus Wedding
                </div>
                <div className="text-[11px] text-white/45 mt-0.5">📅 August 14, 2025 · The Astorian</div>
              </div>
              <div className="bg-[#6B1F9A] rounded-[10px] px-3 py-1.5 text-center flex-shrink-0">
                <div className="text-[20px] font-extrabold text-white leading-none" style={{ fontFamily: 'var(--font-syne)' }}>47</div>
                <div className="text-[9px] text-white/50 tracking-[1px] uppercase mt-0.5">Days Left</div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] text-white/50">Event Planning Progress</span>
                <span className="text-[13px] font-extrabold text-[#DDB8F5]" style={{ fontFamily: 'var(--font-syne)' }}>62%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded overflow-hidden">
                <div
                  className="h-full rounded transition-all duration-[1200ms] delay-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{ width: barsIn ? '62%' : '0%', background: 'linear-gradient(90deg, #6B1F9A, #DDB8F5)' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-y-auto scrollbar-hide py-4 px-5 flex flex-col gap-[14px]">

          {/* Pick up where you left off */}
          <div>
            <SecLabel>Pick Up Where You Left Off</SecLabel>
            <div
              className="flex items-center gap-[14px] rounded-2xl p-4 cursor-pointer hover:-translate-y-0.5 transition-transform duration-150"
              style={{
                background: 'linear-gradient(135deg, #4A0E6E, #6B1F9A)',
                animation: 'fadeUp 0.5s 0.1s ease both',
              }}
            >
              <div className="w-11 h-11 rounded-xl bg-white/[0.15] flex items-center justify-center text-[22px] flex-shrink-0">🎵</div>
              <div className="flex-1">
                <div className="text-[11px] text-white/55 tracking-[0.5px] mb-[3px]">Last Action</div>
                <div className="text-[14px] font-bold text-white" style={{ fontFamily: 'var(--font-syne)' }}>Browsing DJs</div>
                <div className="text-[11px] text-white/50 mt-0.5">You viewed 3 DJs — 2 still to review</div>
              </div>
              <div className="text-[20px] text-white/40 flex-shrink-0">→</div>
            </div>
          </div>

          {/* AI Nudge */}
          <div
            className="bg-[#FEF9E7] border-[1.5px] border-[#D4AC0D]/30 rounded-2xl px-[14px] py-[13px] flex gap-2.5 items-start"
            style={{ animation: 'fadeUp 0.5s 0.15s ease both' }}
          >
            <div className="text-[18px] flex-shrink-0 mt-[1px]">✦</div>
            <div>
              <div className="text-[12px] font-bold text-[#1A1A2E] mb-[3px]" style={{ fontFamily: 'var(--font-syne)' }}>
                AI Reminder — 47 days out
              </div>
              <div className="text-[12px] text-[#7C6B8A] leading-[1.5]">
                You haven&apos;t confirmed your caterer yet. Most couples finalize catering 60 days before — you&apos;re cutting it close.
              </div>
              <div className="text-[11px] font-bold text-[#D4AC0D] mt-1.5 cursor-pointer" style={{ fontFamily: 'var(--font-syne)' }}>
                Browse Caterers Now →
              </div>
            </div>
          </div>

          {/* Vendors */}
          <div style={{ animation: 'fadeUp 0.5s 0.2s ease both' }}>
            <SecLabel action="View All">Your Vendors</SecLabel>
            <div className="flex flex-col gap-2">
              {VENDORS.map((v) => {
                const s = VENDOR_STATUS[v.status]
                return (
                  <div
                    key={v.name}
                    className="bg-white rounded-xl px-[14px] py-3 flex items-center gap-3 cursor-pointer hover:translate-x-[3px] transition-transform duration-150"
                    style={{ boxShadow: '0 2px 6px rgba(74,14,110,0.05)' }}
                  >
                    <div className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-[18px] flex-shrink-0" style={{ background: v.iconBg }}>
                      {v.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-syne)' }}>{v.name}</div>
                      <div className="text-[11px] text-[#7C6B8A] mt-[1px]">{v.category}</div>
                    </div>
                    <div
                      className="text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap"
                      style={{ background: s.bg, color: s.color, fontFamily: 'var(--font-syne)' }}
                    >{s.label}</div>
                  </div>
                )
              })}
              <button
                className="bg-white border-2 border-dashed border-[#DDB8F5] rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer text-[12px] font-bold text-[#4A0E6E] hover:border-[#4A0E6E] hover:bg-[#F3E8FF] transition-all duration-200"
                style={{ fontFamily: 'var(--font-syne)' }}
              >
                + Add Another Vendor
              </button>
            </div>
          </div>

          {/* Budget Tracker */}
          <div style={{ animation: 'fadeUp 0.5s 0.25s ease both' }}>
            <SecLabel action="Details">Budget Tracker</SecLabel>
            <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 2px 8px rgba(74,14,110,0.06)' }}>
              <div className="flex justify-between items-end mb-2.5">
                <div>
                  <div className="text-[24px] font-extrabold text-[#1A1A2E] tracking-[-0.5px]" style={{ fontFamily: 'var(--font-syne)' }}>
                    $6,750{' '}
                    <span className="text-[14px] font-normal text-[#7C6B8A]">spent</span>
                  </div>
                  <div className="text-[12px] text-[#7C6B8A]">of $15,000 total</div>
                </div>
                <div className="text-[13px] font-bold text-[#0D9B6A]" style={{ fontFamily: 'var(--font-syne)' }}>$8,250 left</div>
              </div>
              <div className="h-2 bg-[#F3E8FF] rounded overflow-hidden mb-2.5">
                <div
                  className="h-full rounded transition-all duration-[1000ms] delay-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{ width: barsIn ? '45%' : '0%', background: 'linear-gradient(90deg, #4A0E6E, #6B1F9A)' }}
                />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {BUDGET_CATS.map(({ dot, label }) => (
                  <div key={label} className="flex items-center gap-1 text-[11px] text-[#7C6B8A] bg-[#F8F4FC] rounded px-2 py-1">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dot }} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* To-Do List */}
          <div style={{ animation: 'fadeUp 0.5s 0.3s ease both' }}>
            <SecLabel action="See All">Your To-Do List</SecLabel>
            <div className="flex flex-col gap-2">
              {todos.map((todo, i) => {
                const f = FLAG_STYLE[todo.flag]
                return (
                  <div
                    key={i}
                    className={`bg-white rounded-xl px-[14px] py-3 flex items-center gap-3 cursor-pointer transition-all duration-200 ${todo.done ? 'opacity-50' : ''}`}
                    style={{ boxShadow: '0 2px 6px rgba(74,14,110,0.05)' }}
                    onClick={() => toggleTodo(i)}
                  >
                    <div
                      className="w-[22px] h-[22px] rounded-md border-2 flex items-center justify-center text-[12px] flex-shrink-0 transition-all duration-200"
                      style={{
                        borderColor: todo.done ? '#0D9B6A' : '#DDB8F5',
                        background: todo.done ? '#0D9B6A' : 'transparent',
                        color: 'white',
                      }}
                    >{todo.done ? '✓' : ''}</div>
                    <div
                      className={`flex-1 text-[13px] text-[#1A1A2E] leading-[1.4] ${todo.done ? 'line-through text-[#7C6B8A]' : ''}`}
                    >{todo.text}</div>
                    <div
                      className="text-[10px] font-bold px-[7px] py-[3px] rounded-[5px] whitespace-nowrap"
                      style={{ background: f.bg, color: f.color, fontFamily: 'var(--font-syne)' }}
                    >{f.label}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Mood Board */}
          <div style={{ animation: 'fadeUp 0.5s 0.35s ease both' }}>
            <SecLabel action="Edit">Your Mood Board</SecLabel>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {MOOD_ITEMS.map((m, i) => (
                <div
                  key={i}
                  className={`w-[72px] h-[72px] rounded-2xl flex-shrink-0 flex items-center justify-center text-[28px] cursor-pointer hover:scale-105 transition-transform duration-150 ${
                    m.isAdd ? 'border-2 border-dashed border-[#DDB8F5] text-[20px]' : ''
                  }`}
                  style={{ background: m.bg }}
                >{m.emoji}</div>
              ))}
            </div>
          </div>

          {/* Upcoming Milestones */}
          <div style={{ animation: 'fadeUp 0.5s 0.4s ease both' }}>
            <SecLabel>Upcoming Milestones</SecLabel>
            <div className="flex flex-col gap-2">
              {MILESTONES.map((m, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl px-[14px] py-3 flex items-center gap-3"
                  style={{ boxShadow: '0 2px 6px rgba(74,14,110,0.05)' }}
                >
                  <div className="w-10 h-10 rounded-[10px] bg-[#F3E8FF] flex flex-col items-center justify-center flex-shrink-0">
                    <div className="text-[15px] font-extrabold text-[#4A0E6E] leading-none" style={{ fontFamily: 'var(--font-syne)' }}>{m.day}</div>
                    <div className="text-[9px] text-[#7C6B8A] font-semibold uppercase tracking-[0.5px]">{m.month}</div>
                  </div>
                  <div
                    className={`flex-1 text-[13px] font-medium ${m.bold ? 'font-bold' : ''}`}
                    style={{ color: m.bold ? '#4A0E6E' : '#1A1A2E' }}
                  >{m.text}</div>
                  <div
                    className="text-[11px] font-bold whitespace-nowrap"
                    style={{ color: m.color ?? '#7C6B8A', fontFamily: 'var(--font-syne)' }}
                  >{m.daysLabel}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-2" />
        </div>

        {/* ── BOTTOM NAV ── */}
        <div className="flex bg-white border-t border-[#F3E8FF] pt-2.5 pb-4 flex-shrink-0">
          {NAV_ITEMS.map(({ icon, label }) => {
            const isActive = activeNav === label
            return (
              <button
                key={label}
                className="flex-1 flex flex-col items-center gap-[3px] py-1.5 cursor-pointer border-none bg-transparent transition-all duration-150"
                onClick={() => setActiveNav(label)}
              >
                <span className="text-[20px]">{icon}</span>
                <span
                  className="text-[10px] font-bold"
                  style={{ color: isActive ? '#4A0E6E' : '#7C6B8A', fontFamily: 'var(--font-syne)' }}
                >{label}</span>
              </button>
            )
          })}
        </div>

      </div>
    </div>
  )
}
