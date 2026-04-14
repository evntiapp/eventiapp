'use client'
import { useState } from 'react'
import { Syne, Epilogue } from 'next/font/google'

const syne = Syne({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-syne' })
const epilogue = Epilogue({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-epilogue' })

type Tab = 'guests' | 'rsvp' | 'dietary'
type RsvpStatus = 'yes' | 'no' | 'pending'

// ── Data types ─────────────────────────────────────────────────────────────────
interface Guest {
  id: string
  initials: string
  avatarBg: string
  name: string
  detail: string
  status: RsvpStatus
}

interface GuestGroup {
  label: string
  dotColor: string
  count: string
  guests: Guest[]
  topMargin?: boolean
}

interface DietaryItem {
  icon: string
  name: string
  count: string
}

// ── Static data ────────────────────────────────────────────────────────────────
const GUEST_GROUPS: GuestGroup[] = [
  {
    label: 'Needs Follow-Up',
    dotColor: '#C0392B',
    count: '38 pending',
    topMargin: false,
    guests: [
      { id: 'g1', initials: 'TJ', avatarBg: 'linear-gradient(135deg,#E67E22,#F39C12)', name: 'Tiffany Jackson', detail: '+1 guest · Invited Jun 20', status: 'pending' },
      { id: 'g2', initials: 'KM', avatarBg: 'linear-gradient(135deg,#8E44AD,#6B1F9A)', name: 'Kevin & Monique', detail: '2 guests · Invited Jun 20', status: 'pending' },
    ],
  },
  {
    label: 'Confirmed',
    dotColor: '#0D9B6A',
    count: '142 guests',
    topMargin: true,
    guests: [
      { id: 'g3', initials: 'SM', avatarBg: 'linear-gradient(135deg,#0D9B6A,#0A8A5C)', name: 'Sandra & Michael', detail: '2 guests · Vegan', status: 'yes' },
      { id: 'g4', initials: 'DR', avatarBg: 'linear-gradient(135deg,#2980B9,#1A6FA8)', name: 'David Robinson', detail: '1 guest · Halal', status: 'yes' },
      { id: 'g5', initials: 'NW', avatarBg: 'linear-gradient(135deg,#C0392B,#A93226)', name: 'Nicole Williams', detail: '+1 guest · Gluten free', status: 'yes' },
    ],
  },
  {
    label: 'Declined',
    dotColor: '#C0392B',
    count: '20 guests',
    topMargin: true,
    guests: [
      { id: 'g6', initials: 'JT', avatarBg: 'linear-gradient(135deg,#7F8C8D,#6C7A7D)', name: 'James Thompson', detail: '1 guest · Out of town', status: 'no' },
    ],
  },
]

const RSVP_BADGE: Record<RsvpStatus, { bg: string; color: string; label: string }> = {
  yes:     { bg: '#E6F7F2', color: '#0D9B6A', label: '✓ Coming' },
  no:      { bg: '#FDEDEC', color: '#C0392B', label: '✗ Declined' },
  pending: { bg: '#F3E8FF', color: '#4A0E6E', label: 'Pending' },
}

const SHARE_CHANNELS = [
  { icon: '💬', label: 'iMessage' },
  { icon: '📱', label: 'WhatsApp' },
  { icon: '📧', label: 'Email' },
  { icon: '📲', label: 'More' },
]

const DIETARY_ITEMS: DietaryItem[] = [
  { icon: '🍖', name: 'No Restrictions', count: '98 guests' },
  { icon: '🥩', name: 'Halal',           count: '24 guests' },
  { icon: '🥦', name: 'Vegan',           count: '10 guests' },
  { icon: '🌾', name: 'Gluten Free',     count: '6 guests' },
  { icon: '🥛', name: 'Dairy Free',      count: '3 guests' },
  { icon: '🥜', name: 'Nut Allergy',     count: '1 guest' },
]

// ── Page ───────────────────────────────────────────────────────────────────────
export default function GuestsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('guests')
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
        <div className="w-[120px] h-8 bg-[#1A1A2E] rounded-b-[20px] mx-auto flex-shrink-0" />

        {/* ── HEADER ── */}
        <div className="bg-[#1A1A2E] px-5 pt-3.5 pb-4 flex-shrink-0 relative overflow-hidden">
          <div
            className="absolute w-[200px] h-[200px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(107,31,154,0.3) 0%, transparent 70%)', top: '-70px', right: '-40px' }}
          />

          {/* Top bar */}
          <div className="flex items-center justify-between mb-3.5 relative z-[1]">
            <span className="text-[20px] font-extrabold text-white tracking-[-0.4px]" style={{ fontFamily: 'var(--font-syne)' }}>
              Guest List
            </span>
            <div className="flex gap-2">
              <button
                className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[15px] text-white"
                style={{ background: 'rgba(255,255,255,0.08)', border: 'none' }}
              >
                📤
              </button>
              <button
                className="h-[34px] px-3 rounded-[10px] text-[12px] font-bold text-white"
                style={{ fontFamily: 'var(--font-syne)', background: '#6B1F9A', border: 'none' }}
              >
                + Add Guest
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-2 mb-3 relative z-[1]">
            {[
              { num: '200', label: 'Invited',   color: 'white' },
              { num: '142', label: 'Confirmed', color: '#4ECDC4' },
              { num: '38',  label: 'Pending',   color: '#FFD93D' },
              { num: '20',  label: 'Declined',  color: '#FF6B6B' },
            ].map(s => (
              <div
                key={s.label}
                className="flex-1 rounded-xl p-2.5 text-center"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="text-[18px] font-extrabold leading-none" style={{ fontFamily: 'var(--font-syne)', color: s.color }}>
                  {s.num}
                </div>
                <div className="text-[9px] mt-[2px] tracking-[0.5px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* RSVP progress bar */}
          <div className="relative z-[1]">
            <div className="h-2 rounded-[4px] overflow-hidden flex" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full" style={{ width: '71%', background: '#0D9B6A' }} />
              <div className="h-full" style={{ width: '19%', background: '#FFD93D' }} />
              <div className="h-full" style={{ width: '10%', background: '#FF6B6B' }} />
            </div>
            <div className="flex gap-3 mt-1.5">
              {[
                { color: '#0D9B6A', label: '142 Yes' },
                { color: '#FFD93D', label: '38 Pending' },
                { color: '#FF6B6B', label: '20 No' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1 text-[10px] font-semibold" style={{ fontFamily: 'var(--font-syne)', color: 'rgba(255,255,255,0.4)' }}>
                  <div className="w-2 h-2 rounded-[2px] flex-shrink-0" style={{ background: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex bg-white border-b border-[#F3E8FF] flex-shrink-0">
          {([
            { id: 'guests',  label: '👥 Guests' },
            { id: 'rsvp',    label: '📨 RSVP Link' },
            { id: 'dietary', label: '🍽️ Dietary' },
          ] as { id: Tab; label: string }[]).map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="flex-1 py-[11px] px-1.5 text-[11px] font-bold text-center"
              style={{
                fontFamily: 'var(--font-syne)',
                color: activeTab === t.id ? '#4A0E6E' : '#7C6B8A',
                transition: 'all 0.2s',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === t.id ? '2px solid #4A0E6E' : '2px solid transparent',
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

          {/* ══ GUESTS TAB ══ */}
          {activeTab === 'guests' && (
            <>
              {/* Search */}
              <div
                className="flex items-center gap-2 bg-white rounded-xl px-3.5 py-2.5 mb-3"
                style={{ border: '2px solid #DDB8F5', transition: 'border-color 0.2s' }}
              >
                <span className="text-sm" style={{ color: '#C0ACD4' }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search guests…"
                  className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#1A1A2E]"
                  style={{ fontFamily: 'var(--font-epilogue)' }}
                />
              </div>

              {GUEST_GROUPS.map(group => (
                <div key={group.label}>
                  {/* Group header */}
                  <div className={`flex items-center gap-2 mb-2 ${group.topMargin ? 'mt-3.5' : ''}`}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: group.dotColor }} />
                    <span
                      className="text-[11px] font-bold uppercase tracking-[1px] text-[#7C6B8A]"
                      style={{ fontFamily: 'var(--font-syne)' }}
                    >
                      {group.label}
                    </span>
                    <div className="flex-1 h-px bg-[#F3E8FF]" />
                    <span className="text-[10px] text-[#7C6B8A]">{group.count}</span>
                  </div>

                  {/* Guest cards */}
                  {group.guests.map(guest => {
                    const badge = RSVP_BADGE[guest.status]
                    return (
                      <div
                        key={guest.id}
                        className="bg-white rounded-xl px-3.5 py-3 mb-2 flex items-center gap-3 cursor-pointer"
                        style={{
                          boxShadow: '0 2px 6px rgba(74,14,110,0.05)',
                          border: '2px solid transparent',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div
                          className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-[16px] font-bold text-white flex-shrink-0"
                          style={{ fontFamily: 'var(--font-syne)', background: guest.avatarBg }}
                        >
                          {guest.initials}
                        </div>
                        <div className="flex-1">
                          <div className="text-[13px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-syne)' }}>
                            {guest.name}
                          </div>
                          <div className="text-[11px] text-[#7C6B8A] mt-[2px]">{guest.detail}</div>
                        </div>
                        <span
                          className="text-[10px] font-bold px-[9px] py-1 rounded-[7px] whitespace-nowrap flex-shrink-0"
                          style={{ fontFamily: 'var(--font-syne)', background: badge.bg, color: badge.color }}
                        >
                          {badge.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ))}

              {/* Add guest button */}
              <button
                className="w-full rounded-xl py-3 flex items-center justify-center gap-2 text-[13px] font-bold text-[#4A0E6E] mt-1"
                style={{
                  fontFamily: 'var(--font-syne)',
                  background: 'transparent',
                  border: '2px dashed #DDB8F5',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
              >
                + Add New Guest
              </button>
              <div className="h-3" />
            </>
          )}

          {/* ══ RSVP LINK TAB ══ */}
          {activeTab === 'rsvp' && (
            <>
              {/* Share card */}
              <div
                className="rounded-[14px] p-4 mb-3.5"
                style={{ background: 'linear-gradient(135deg, #4A0E6E, #6B1F9A)' }}
              >
                <div className="text-[14px] font-extrabold text-white mb-1" style={{ fontFamily: 'var(--font-syne)' }}>
                  Share Your RSVP Link
                </div>
                <div className="text-[12px] mb-3 leading-[1.5]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Send this link to guests — they can confirm attendance, meal preference, and +1s directly from their phone.
                </div>
                <div
                  className="flex items-center justify-between rounded-[10px] px-3 py-2.5"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                >
                  <span className="text-[12px] font-semibold" style={{ fontFamily: 'var(--font-syne)', color: '#DDB8F5' }}>
                    easyevents.app/rsvp/aisha-marcus
                  </span>
                  <button
                    onClick={handleCopy}
                    className="text-[11px] font-bold px-2.5 py-[5px] rounded-[7px] text-[#4A0E6E] bg-white"
                    style={{ fontFamily: 'var(--font-syne)', border: 'none', cursor: 'pointer' }}
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Share via */}
              <div className="text-[13px] font-bold text-[#1A1A2E] mb-2.5" style={{ fontFamily: 'var(--font-syne)' }}>
                Share Via
              </div>
              <div className="grid grid-cols-2 gap-2.5 mb-4">
                {SHARE_CHANNELS.map(ch => (
                  <div
                    key={ch.label}
                    className="bg-white rounded-xl p-3.5 text-center cursor-pointer"
                    style={{ boxShadow: '0 2px 6px rgba(74,14,110,0.05)' }}
                  >
                    <div className="text-2xl mb-1.5">{ch.icon}</div>
                    <div className="text-[12px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-syne)' }}>
                      {ch.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* RSVP deadline */}
              <div
                className="bg-white rounded-[14px] p-3.5"
                style={{ boxShadow: '0 2px 8px rgba(74,14,110,0.06)' }}
              >
                <div className="text-[13px] font-bold text-[#1A1A2E] mb-2.5" style={{ fontFamily: 'var(--font-syne)' }}>
                  RSVP Deadline
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-[10px] flex items-center justify-center text-[20px] flex-shrink-0"
                    style={{ background: '#F3E8FF' }}
                  >
                    📅
                  </div>
                  <div>
                    <div className="text-[14px] font-extrabold text-[#4A0E6E]" style={{ fontFamily: 'var(--font-syne)' }}>
                      June 30, 2025
                    </div>
                    <div className="text-[11px] text-[#7C6B8A] mt-[1px]">
                      5 days from now · Auto-reminder sent to pending guests
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-3" />
            </>
          )}

          {/* ══ DIETARY TAB ══ */}
          {activeTab === 'dietary' && (
            <>
              {/* Summary card */}
              <div className="bg-[#1A1A2E] rounded-[14px] px-3.5 py-3.5 mb-3.5">
                <div
                  className="text-[12px] font-bold uppercase tracking-[1px] mb-2"
                  style={{ fontFamily: 'var(--font-syne)', color: 'rgba(255,255,255,0.5)' }}
                >
                  Dietary Summary
                </div>
                <div className="text-[13px] leading-[1.6]" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Based on 142 confirmed guests. Share this breakdown with your caterer — Saffron & Co has been automatically notified.
                </div>
              </div>

              {/* Dietary grid */}
              <div className="grid grid-cols-2 gap-2">
                {DIETARY_ITEMS.map(item => (
                  <div
                    key={item.name}
                    className="bg-white rounded-xl p-3 text-center"
                    style={{ boxShadow: '0 2px 6px rgba(74,14,110,0.05)' }}
                  >
                    <div className="text-[22px] mb-[5px]">{item.icon}</div>
                    <div className="text-[12px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-syne)' }}>
                      {item.name}
                    </div>
                    <div className="text-[11px] text-[#7C6B8A] mt-[2px]">{item.count}</div>
                  </div>
                ))}
              </div>

              {/* Confirmation banner */}
              <div
                className="rounded-xl px-3.5 py-3 mt-3.5 flex gap-2.5 items-start"
                style={{ background: '#E6F7F2' }}
              >
                <span className="text-base flex-shrink-0">✅</span>
                <div className="text-[12px] leading-[1.6]" style={{ color: '#0D9B6A' }}>
                  Dietary requirements automatically shared with Saffron & Co Catering. They've confirmed they can accommodate all needs.
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
