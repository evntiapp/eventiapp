'use client'
import { useState } from 'react'
import { Syne, Epilogue } from 'next/font/google'

const syne = Syne({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-syne' })
const epilogue = Epilogue({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-epilogue' })

type Tab = 'schedule' | 'todo' | 'reminders'

// ── Data types ────────────────────────────────────────────────────────────────
interface DateChip { day: string; num: number; hasEvent: boolean }

interface EventTag { label: string; bg: string; color: string }
interface ScheduleEvent {
  title: string
  detail: string
  tags: EventTag[]
  borderColor: string
}
interface TimeRow { time: string; event?: ScheduleEvent }

interface Appointment {
  day: string; month: string
  title: string; detail: string; vendor: string; time: string
}

interface TodoItem {
  id: string; title: string
  meta1: string; meta2: string
  priorityColor: string; assign: string
}
interface TodoGroup {
  id: string; name: string; dotColor: string; count: string
  items: TodoItem[]
  preChecked?: boolean
}

interface Reminder {
  id: string; icon: string; iconBg: string
  title: string; detail: string
  time: string; urgent?: boolean
  borderColor: string
}

// ── Static data ───────────────────────────────────────────────────────────────
const DATE_CHIPS: DateChip[] = [
  { day: 'Mon', num: 23, hasEvent: false },
  { day: 'Tue', num: 24, hasEvent: true },
  { day: 'Wed', num: 25, hasEvent: true },
  { day: 'Thu', num: 26, hasEvent: true },
  { day: 'Fri', num: 27, hasEvent: false },
  { day: 'Sat', num: 28, hasEvent: true },
  { day: 'Sun', num: 29, hasEvent: false },
]

const TIME_ROWS: TimeRow[] = [
  {
    time: '9 AM',
    event: {
      title: 'Call Saffron & Co — Catering Consultation',
      detail: 'Discuss menu, confirm halal options, get quote',
      tags: [
        { label: '🍽️ Vendor Call', bg: '#E6F7F2', color: '#0D9B6A' },
        { label: '1 hour', bg: '#F3E8FF', color: '#4A0E6E' },
      ],
      borderColor: '#0D9B6A',
    },
  },
  { time: '10 AM' },
  {
    time: '11 AM',
    event: {
      title: '⚠️ Confirm DJ Smooth — Overdue',
      detail: 'Send playlist preferences & confirm Aug 14 date',
      tags: [
        { label: 'Urgent', bg: '#FDEDEC', color: '#C0392B' },
        { label: '🎵 Music', bg: '#F3E8FF', color: '#4A0E6E' },
      ],
      borderColor: '#C0392B',
    },
  },
  { time: '12 PM' },
  {
    time: '2 PM',
    event: {
      title: 'Review florist contract — Bloom & Co',
      detail: 'E-sign final agreement, confirm setup time',
      tags: [
        { label: '📄 Contract', bg: '#FEF9E7', color: '#D4AC0D' },
        { label: '30 min', bg: '#F3E8FF', color: '#4A0E6E' },
      ],
      borderColor: '#D4AC0D',
    },
  },
  { time: '4 PM' },
]

const APPOINTMENTS: Appointment[] = [
  { day: '5', month: 'Jul', title: 'Hair & Makeup Trial', detail: 'Bridal suite · Full glam trial run', vendor: '💄 Glam Squad HTX', time: '10:00 AM' },
  { day: '12', month: 'Jul', title: 'Catering Tasting', detail: 'Menu tasting — 4 courses + bar options', vendor: '🍽️ Saffron & Co', time: '12:00 PM' },
  { day: '7', month: 'Aug', title: 'Venue Final Walkthrough', detail: 'Layout, seating plan, vendor access review', vendor: '🏛️ The Astorian', time: '2:00 PM' },
]

const TODO_GROUPS: TodoGroup[] = [
  {
    id: 'urgent',
    name: 'Urgent',
    dotColor: '#C0392B',
    count: '3 tasks',
    items: [
      { id: 'u1', title: 'Book caterer — headcount needed ASAP', meta1: '📅 Overdue', meta2: '🍽️ Vendors', priorityColor: '#C0392B', assign: 'Aisha' },
      { id: 'u2', title: 'Confirm DJ Smooth — send playlist preferences', meta1: '📅 Was Jun 28', meta2: '🎵 Music', priorityColor: '#C0392B', assign: 'Aisha' },
      { id: 'u3', title: 'Finalize guest list — RSVP deadline Jun 30', meta1: '📅 Jun 30', meta2: '👥 200 guests', priorityColor: '#C0392B', assign: 'Both' },
    ],
  },
  {
    id: 'week',
    name: 'This Week',
    dotColor: '#E67E22',
    count: '5 tasks',
    items: [
      { id: 'w1', title: 'Review & e-sign florist contract', meta1: '📅 Jun 27', meta2: '📄 Contract', priorityColor: '#E67E22', assign: 'Aisha' },
      { id: 'w2', title: 'Book bar service vendor', meta1: '📅 Jun 28', meta2: '🍹 Bar', priorityColor: '#E67E22', assign: 'Marcus' },
    ],
  },
  {
    id: 'done',
    name: 'Completed',
    dotColor: '#0D9B6A',
    count: '18 tasks',
    preChecked: true,
    items: [
      { id: 'd1', title: 'Book venue — The Astorian', meta1: '✓ Jun 23', meta2: '💰 $5,500', priorityColor: '#0D9B6A', assign: 'Aisha' },
      { id: 'd2', title: 'Book florist — Bloom & Co Florals', meta1: '✓ Jun 25', meta2: '🌸 Florals', priorityColor: '#0D9B6A', assign: 'Aisha' },
    ],
  },
]

const REMINDERS: Reminder[] = [
  { id: 'r1', icon: '⚠️', iconBg: '#FDEDEC', title: 'Caterer not booked — 47 days out', detail: 'Most couples book 60 days before. Act now.', time: 'Now', urgent: true, borderColor: '#4A0E6E' },
  { id: 'r2', icon: '💰', iconBg: '#FEF9E7', title: 'Venue balance due — $2,750', detail: 'Payment due July 10 — 15 days away', time: 'Jul 5', borderColor: '#D4AC0D' },
  { id: 'r3', icon: '📸', iconBg: '#E6F7F2', title: 'Send shot list to photographer', detail: 'Lens & Light Studio recommends 3 weeks before', time: 'Jul 24', borderColor: '#0D9B6A' },
  { id: 'r4', icon: '💌', iconBg: '#FEF3E2', title: 'Send formal invitations', detail: 'Recommended 6 weeks before the event', time: 'Jul 3', borderColor: '#E67E22' },
  { id: 'r5', icon: '🌦️', iconBg: '#F3E8FF', title: 'Weather check — outdoor ceremony', detail: 'Check forecast 7 days before · Have backup plan', time: 'Aug 7', borderColor: '#4A0E6E' },
  { id: 'r6', icon: '✅', iconBg: '#E6F7F2', title: 'Confirm all vendors — final details', detail: 'Call all 6 vendors to reconfirm arrival times', time: 'Aug 10', borderColor: '#0D9B6A' },
  { id: 'r7', icon: '💍', iconBg: '#F3E8FF', title: 'Wedding Day morning checklist', detail: 'Auto-sent at 7AM on your wedding day', time: 'Aug 14', borderColor: '#4A0E6E' },
]

// Pre-checked todo IDs (completed group)
const INITIAL_DONE = new Set(['d1', 'd2'])
// All reminders on by default
const INITIAL_TOGGLES = Object.fromEntries(REMINDERS.map(r => [r.id, true]))

// ── Toggle switch component ───────────────────────────────────────────────────
function ToggleSwitch({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <div
      className="relative w-9 h-5 rounded-[10px] cursor-pointer flex-shrink-0 overflow-hidden"
      style={{ background: on ? '#4A0E6E' : '#DDB8F5', transition: 'background 0.2s' }}
      onClick={onClick}
    >
      <div
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white"
        style={{ left: '2px', transform: on ? 'translateX(16px)' : 'translateX(0)', transition: 'transform 0.2s' }}
      />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SchedulePage() {
  const [activeTab, setActiveTab] = useState<Tab>('schedule')
  const [selectedDate, setSelectedDate] = useState(2) // Wed 25 active by default
  const [doneTodos, setDoneTodos] = useState<Set<string>>(INITIAL_DONE)
  const [reminderToggles, setReminderToggles] = useState<Record<string, boolean>>(INITIAL_TOGGLES)

  function toggleTodo(id: string) {
    setDoneTodos(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleReminder(id: string) {
    setReminderToggles(prev => ({ ...prev, [id]: !prev[id] }))
  }

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
        <div className="w-[120px] h-8 bg-[#1A1A2E] rounded-b-[20px] mx-auto flex-shrink-0 z-20" />

        {/* ── HEADER ── */}
        <div className="bg-[#1A1A2E] px-5 pt-3.5 pb-4 flex-shrink-0 relative overflow-hidden">
          {/* Radial orb */}
          <div
            className="absolute w-[200px] h-[200px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(107,31,154,0.3) 0%, transparent 70%)',
              top: '-70px', right: '-40px',
            }}
          />

          {/* Top bar */}
          <div className="flex items-center justify-between mb-4 relative z-[1]">
            <span
              className="text-[20px] font-extrabold text-white tracking-[-0.4px]"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              Schedule & Tasks
            </span>
            <div className="flex gap-2">
              <button
                className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-base text-white"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              >
                🔔
              </button>
              <button
                className="w-[34px] h-[34px] rounded-[10px] bg-[#6B1F9A] flex items-center justify-center text-white text-[20px] font-light"
              >
                +
              </button>
            </div>
          </div>

          {/* Date strip */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5 relative z-[1]">
            {DATE_CHIPS.map((chip, i) => {
              const isActive = selectedDate === i
              return (
                <div
                  key={i}
                  onClick={() => setSelectedDate(i)}
                  className="flex flex-col items-center px-2.5 py-2 rounded-xl cursor-pointer flex-shrink-0 min-w-[46px]"
                  style={{
                    background: isActive ? '#6B1F9A' : 'rgba(255,255,255,0.06)',
                    border: `1.5px solid ${isActive ? '#6B1F9A' : 'transparent'}`,
                    transition: 'all 0.2s',
                  }}
                >
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.5px]"
                    style={{
                      fontFamily: 'var(--font-syne)',
                      color: isActive ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {chip.day}
                  </span>
                  <span
                    className="text-[17px] font-extrabold leading-[1.2]"
                    style={{
                      fontFamily: 'var(--font-syne)',
                      color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                    }}
                  >
                    {chip.num}
                  </span>
                  {/* Event dot (replaces ::after pseudo-element) */}
                  {chip.hasEvent && (
                    <div
                      className="w-1 h-1 rounded-full mt-[3px]"
                      style={{ background: isActive ? 'white' : '#DDB8F5' }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex bg-white border-b border-[#F3E8FF] flex-shrink-0">
          {([
            { id: 'schedule', label: '📅 Schedule' },
            { id: 'todo', label: '✅ To-Do' },
            { id: 'reminders', label: '🔔 Reminders' },
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
          {/* ══ SCHEDULE TAB ══ */}
          {activeTab === 'schedule' && (
            <div className="px-5 py-4">
              {/* Today banner */}
              <div
                className="rounded-[14px] px-4 py-3.5 flex items-center gap-3 mb-3.5"
                style={{
                  background: 'linear-gradient(135deg, #4A0E6E, #6B1F9A)',
                  animation: 'fadeUp 0.4s ease both',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-[20px] flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                >
                  📅
                </div>
                <div>
                  <div
                    className="text-[10px] font-bold uppercase tracking-[1px] mb-0.5"
                    style={{ fontFamily: 'var(--font-syne)', color: 'rgba(255,255,255,0.5)' }}
                  >
                    Today · Wednesday Jun 25
                  </div>
                  <div
                    className="text-[14px] font-extrabold text-white"
                    style={{ fontFamily: 'var(--font-syne)' }}
                  >
                    3 tasks · 1 appointment
                  </div>
                  <div className="text-[11px] mt-[1px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    47 days until your wedding
                  </div>
                </div>
              </div>

              {/* Time blocks */}
              <div className="flex flex-col gap-0">
                {TIME_ROWS.map((row, i) => (
                  <div key={i} className="flex gap-3 items-start mb-1.5">
                    {/* Time label */}
                    <div
                      className="w-[52px] flex-shrink-0 pt-3 text-right text-[11px] font-bold text-[#7C6B8A]"
                      style={{ fontFamily: 'var(--font-syne)' }}
                    >
                      {row.time}
                    </div>
                    {/* Content */}
                    <div className="flex-1">
                      {row.event ? (
                        <div
                          className="bg-white rounded-xl px-3.5 py-3 mb-0.5 cursor-pointer"
                          style={{
                            borderLeft: `4px solid ${row.event.borderColor}`,
                            boxShadow: '0 2px 8px rgba(74,14,110,0.06)',
                            transition: 'all 0.2s',
                          }}
                        >
                          <div
                            className="text-[13px] font-bold text-[#1A1A2E] mb-[3px]"
                            style={{ fontFamily: 'var(--font-syne)' }}
                          >
                            {row.event.title}
                          </div>
                          <div className="text-[11px] text-[#7C6B8A]">{row.event.detail}</div>
                          <div className="flex gap-1.5 mt-1.5 flex-wrap">
                            {row.event.tags.map((tag, ti) => (
                              <div
                                key={ti}
                                className="text-[10px] font-bold px-[7px] py-[2px] rounded-[5px]"
                                style={{
                                  fontFamily: 'var(--font-syne)',
                                  background: tag.bg,
                                  color: tag.color,
                                }}
                              >
                                {tag.label}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        /* Empty slot */
                        <div
                          className="h-8 ml-[1px]"
                          style={{ borderLeft: '2px dashed #F3E8FF' }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Upcoming appointments */}
              <div className="mt-4">
                <div
                  className="flex items-center justify-between mb-2.5 text-[13px] font-bold text-[#1A1A2E]"
                  style={{ fontFamily: 'var(--font-syne)' }}
                >
                  Upcoming Appointments
                  <span className="text-[11px] font-semibold text-[#4A0E6E] cursor-pointer">
                    View All
                  </span>
                </div>
                {APPOINTMENTS.map((appt, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-[14px] p-3.5 mb-2.5 flex gap-3 cursor-pointer"
                    style={{
                      boxShadow: '0 2px 8px rgba(74,14,110,0.06)',
                      border: '2px solid transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    {/* Date box */}
                    <div className="w-[42px] h-[42px] rounded-[10px] bg-[#F3E8FF] flex flex-col items-center justify-center flex-shrink-0">
                      <span
                        className="text-[16px] font-extrabold text-[#4A0E6E] leading-none"
                        style={{ fontFamily: 'var(--font-syne)' }}
                      >
                        {appt.day}
                      </span>
                      <span className="text-[9px] text-[#7C6B8A] font-semibold uppercase">
                        {appt.month}
                      </span>
                    </div>
                    {/* Info */}
                    <div className="flex-1">
                      <div
                        className="text-[13px] font-bold text-[#1A1A2E]"
                        style={{ fontFamily: 'var(--font-syne)' }}
                      >
                        {appt.title}
                      </div>
                      <div className="text-[11px] text-[#7C6B8A] mt-0.5">{appt.detail}</div>
                      <div
                        className="inline-flex items-center gap-1 bg-[#F3E8FF] rounded-[5px] px-[7px] py-[2px] text-[10px] font-bold text-[#4A0E6E] mt-[5px]"
                        style={{ fontFamily: 'var(--font-syne)' }}
                      >
                        {appt.vendor}
                      </div>
                    </div>
                    {/* Time */}
                    <div
                      className="text-[12px] font-bold text-[#7C6B8A] whitespace-nowrap pt-0.5"
                      style={{ fontFamily: 'var(--font-syne)' }}
                    >
                      {appt.time}
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-3.5" />
            </div>
          )}

          {/* ══ TO-DO TAB ══ */}
          {activeTab === 'todo' && (
            <div className="px-5 py-3.5">
              {/* AI suggestion */}
              <div
                className="bg-[#1A1A2E] rounded-[14px] p-3.5 flex gap-2.5 mb-3.5"
                style={{ animation: 'fadeUp 0.4s ease both' }}
              >
                <span className="text-[18px] flex-shrink-0 mt-[1px]">✦</span>
                <div>
                  <div
                    className="text-[12px] font-bold text-white mb-1"
                    style={{ fontFamily: 'var(--font-syne)' }}
                  >
                    AI Suggestion — 47 days out
                  </div>
                  <p className="text-[12px] leading-[1.5]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    Based on your timeline, you should book a caterer this week. 3 vendors match your budget and are available Aug 14.
                  </p>
                  <div
                    className="text-[11px] font-bold text-[#DDB8F5] mt-1.5 cursor-pointer"
                    style={{ fontFamily: 'var(--font-syne)' }}
                  >
                    Browse Caterers →
                  </div>
                </div>
              </div>

              {/* Priority filter pills (static display) */}
              <div className="flex gap-[7px] mb-3.5 overflow-x-auto scrollbar-hide">
                {[
                  { label: 'All (29)', bg: '#4A0E6E', color: 'white' },
                  { label: '🔴 Urgent (3)', bg: '#FDEDEC', color: '#C0392B' },
                  { label: '🟠 Soon (5)', bg: '#FEF3E2', color: '#E67E22' },
                  { label: '🔵 Upcoming (3)', bg: '#F3E8FF', color: '#4A0E6E' },
                  { label: '✓ Done (18)', bg: '#E6F7F2', color: '#0D9B6A' },
                ].map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-[5px] px-3 py-[6px] rounded-[20px] text-[11px] font-bold whitespace-nowrap flex-shrink-0 cursor-pointer"
                    style={{ fontFamily: 'var(--font-syne)', background: p.bg, color: p.color }}
                  >
                    {p.label}
                  </div>
                ))}
              </div>

              {/* Todo groups */}
              {TODO_GROUPS.map(group => (
                <div key={group.id} className="mb-4">
                  {/* Group header */}
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: group.dotColor }}
                    />
                    <span
                      className="text-[11px] font-bold uppercase tracking-[1px] text-[#7C6B8A]"
                      style={{ fontFamily: 'var(--font-syne)' }}
                    >
                      {group.name}
                    </span>
                    <div className="flex-1 h-px bg-[#F3E8FF]" />
                    <span className="text-[10px] text-[#7C6B8A]">{group.count}</span>
                  </div>

                  {/* Items */}
                  {group.items.map(item => {
                    const isDone = doneTodos.has(item.id)
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleTodo(item.id)}
                        className="bg-white rounded-xl px-3.5 py-3 mb-2 flex items-start gap-2.5 cursor-pointer"
                        style={{
                          boxShadow: '0 2px 6px rgba(74,14,110,0.05)',
                          border: '2px solid transparent',
                          opacity: isDone ? 0.55 : 1,
                          transition: 'all 0.2s',
                        }}
                      >
                        {/* Checkbox */}
                        <div
                          className="w-[22px] h-[22px] rounded-[6px] flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 mt-[1px]"
                          style={{
                            border: `2px solid ${isDone ? '#0D9B6A' : '#DDB8F5'}`,
                            background: isDone ? '#0D9B6A' : 'transparent',
                            transition: 'all 0.2s',
                          }}
                        >
                          {isDone ? '✓' : ''}
                        </div>

                        {/* Body */}
                        <div className="flex-1">
                          <div
                            className="text-[13px] font-bold leading-[1.3] mb-[3px]"
                            style={{
                              fontFamily: 'var(--font-syne)',
                              color: isDone ? '#7C6B8A' : '#1A1A2E',
                              textDecoration: isDone ? 'line-through' : 'none',
                            }}
                          >
                            {item.title}
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {[item.meta1, item.meta2].map((m, mi) => (
                              <span
                                key={mi}
                                className="text-[11px] text-[#7C6B8A] flex items-center gap-[3px]"
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Right: priority dot + assignee */}
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: item.priorityColor }}
                          />
                          <div
                            className="text-[10px] text-[#7C6B8A] font-semibold rounded-[5px] px-1.5 py-[2px]"
                            style={{ fontFamily: 'var(--font-syne)', background: '#F8F4FC' }}
                          >
                            {item.assign}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}

              {/* Add task button */}
              <button
                className="w-full rounded-xl py-3 flex items-center justify-center gap-2 text-[13px] font-bold text-[#4A0E6E] cursor-pointer"
                style={{
                  fontFamily: 'var(--font-syne)',
                  background: 'transparent',
                  border: '2px dashed #DDB8F5',
                  transition: 'all 0.2s',
                }}
              >
                + Add New Task
              </button>

              <div className="h-3.5" />
            </div>
          )}

          {/* ══ REMINDERS TAB ══ */}
          {activeTab === 'reminders' && (
            <div className="px-5 py-3.5">
              {/* Section heading */}
              <div className="mb-3.5">
                <div
                  className="text-[13px] font-bold text-[#1A1A2E]"
                  style={{ fontFamily: 'var(--font-syne)' }}
                >
                  Smart Reminders
                </div>
                <div className="text-[12px] text-[#7C6B8A] mt-[-2px]">
                  AI-generated reminders based on your event timeline.
                </div>
              </div>

              {/* Reminder cards */}
              {REMINDERS.map(r => {
                const on = reminderToggles[r.id]
                return (
                  <div
                    key={r.id}
                    className="bg-white rounded-[14px] p-3.5 mb-2.5 flex gap-3 items-center cursor-pointer"
                    style={{
                      boxShadow: '0 2px 8px rgba(74,14,110,0.06)',
                      borderLeft: `4px solid ${r.borderColor}`,
                      transition: 'all 0.2s',
                    }}
                  >
                    {/* Icon */}
                    <div
                      className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-[18px] flex-shrink-0"
                      style={{ background: r.iconBg }}
                    >
                      {r.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div
                        className="text-[13px] font-bold text-[#1A1A2E]"
                        style={{ fontFamily: 'var(--font-syne)' }}
                      >
                        {r.title}
                      </div>
                      <div className="text-[11px] text-[#7C6B8A] mt-0.5">{r.detail}</div>
                    </div>

                    {/* Time + toggle */}
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span
                        className="text-[11px] font-bold whitespace-nowrap"
                        style={{
                          fontFamily: 'var(--font-syne)',
                          color: r.urgent ? '#C0392B' : '#7C6B8A',
                        }}
                      >
                        {r.time}
                      </span>
                      <ToggleSwitch on={on} onClick={() => toggleReminder(r.id)} />
                    </div>
                  </div>
                )
              })}

              <div className="h-3.5" />
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
