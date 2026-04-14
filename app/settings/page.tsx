'use client'
import { useState } from 'react'
import { Syne, Epilogue } from 'next/font/google'

const syne = Syne({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-syne' })
const epilogue = Epilogue({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-epilogue' })

type NotifFilter = 'all' | 'urgent' | 'payments' | 'vendors' | 'events'

// ── Data types ─────────────────────────────────────────────────────────────────
interface NotifItem {
  id: string
  iconEmoji: string
  iconBg: string
  title: string
  body: string
  time: string
  unread?: boolean
  actionLabel?: string
  actionSecondary?: boolean
}

interface SettingsRow {
  icon: string
  iconBg: string
  name: string
  sub?: string
  type: 'arrow' | 'toggle' | 'value'
  toggleKey?: string
  value?: string
}

// ── Static data ────────────────────────────────────────────────────────────────
const NOTIF_FILTERS: { id: NotifFilter; label: string }[] = [
  { id: 'all',      label: 'All (8)' },
  { id: 'urgent',   label: '🔴 Urgent (2)' },
  { id: 'payments', label: '💰 Payments' },
  { id: 'vendors',  label: '🛒 Vendors' },
  { id: 'events',   label: '📅 Events' },
]

const NOTIF_SECTIONS: { label: string; items: NotifItem[] }[] = [
  {
    label: 'Today',
    items: [
      {
        id: 'n1', iconEmoji: '⚠️', iconBg: '#FDEDEC',
        title: 'Caterer still not booked — 47 days out',
        body: 'You\'re running behind. Most couples book 60 days before. 3 caterers match your budget and are available Aug 14.',
        time: 'Just now', unread: true, actionLabel: 'Book Now',
      },
      {
        id: 'n2', iconEmoji: '🌸', iconBg: '#F3E8FF',
        title: 'Bloom & Co sent your contract',
        body: 'Your florist contract is ready to sign. Review and e-sign to confirm your booking.',
        time: '2 minutes ago', unread: true, actionLabel: 'Sign',
      },
      {
        id: 'n3', iconEmoji: '📸', iconBg: '#F3E8FF',
        title: 'New message from Lens & Light',
        body: '"Hi Aisha! Excited for Aug 14. Can we schedule a pre-wedding shoot?"',
        time: '1 hour ago', unread: true, actionLabel: 'Reply', actionSecondary: true,
      },
    ],
  },
  {
    label: 'Yesterday',
    items: [
      {
        id: 'n4', iconEmoji: '💰', iconBg: '#FEF9E7',
        title: 'Payment confirmed — Bloom & Co',
        body: 'Your $570 deposit has been processed and held in escrow. Vendor notified.',
        time: 'Yesterday · 3:42 PM',
      },
      {
        id: 'n5', iconEmoji: '✅', iconBg: '#E6F7F2',
        title: 'DJ Smooth confirmed your date',
        body: 'DJ Smooth Houston has accepted your booking for August 14, 2025. 🎵',
        time: 'Yesterday · 11:15 AM',
      },
    ],
  },
  {
    label: 'This Week',
    items: [
      {
        id: 'n6', iconEmoji: '📅', iconBg: '#FEF3E2',
        title: 'RSVP deadline in 5 days',
        body: '38 guests haven\'t responded yet. Send a reminder now to get your final headcount by June 30.',
        time: 'Jun 24', actionLabel: 'Remind', actionSecondary: true,
      },
      {
        id: 'n7', iconEmoji: '✦', iconBg: '#F3E8FF',
        title: 'AI found 3 new caterer matches',
        body: 'Based on your halal requirement and $4,800 budget — Saffron & Co, Zara Kitchen, and Flavors of Lagos all match.',
        time: 'Jun 23', actionLabel: 'View',
      },
      {
        id: 'n8', iconEmoji: '🏛️', iconBg: '#E6F7F2',
        title: 'Venue booking confirmed',
        body: 'The Astorian is confirmed for August 14, 2025. Deposit of $1,375 paid.',
        time: 'Jun 23',
      },
    ],
  },
]

const ACCOUNT_ROWS: SettingsRow[] = [
  { icon: '👤', iconBg: '#F3E8FF', name: 'Personal Info',       sub: 'Name, email, phone',  type: 'arrow' },
  { icon: '💳', iconBg: '#F3E8FF', name: 'Payment Methods',     sub: 'Visa ···· 4242',       type: 'arrow' },
  { icon: '🔐', iconBg: '#F3E8FF', name: 'Password & Security', sub: '2FA enabled',          type: 'arrow' },
]

const PREF_ROWS: SettingsRow[] = [
  { icon: '🔔', iconBg: '#F3E8FF', name: 'Push Notifications', sub: 'Vendor updates, reminders',  type: 'toggle', toggleKey: 'push' },
  { icon: '📧', iconBg: '#F3E8FF', name: 'Email Notifications', sub: 'Booking confirmations',     type: 'toggle', toggleKey: 'email' },
  { icon: '✦',  iconBg: '#F3E8FF', name: 'AI Suggestions',     sub: 'Smart planning nudges',      type: 'toggle', toggleKey: 'ai' },
  { icon: '🌙', iconBg: '#F3E8FF', name: 'Dark Mode',                                             type: 'toggle', toggleKey: 'dark' },
]

const SUPPORT_ROWS: SettingsRow[] = [
  { icon: '💬', iconBg: '#F3E8FF', name: 'Help Center',        type: 'arrow' },
  { icon: '⭐', iconBg: '#F3E8FF', name: 'Rate Easy Events',   type: 'arrow' },
  { icon: '📄', iconBg: '#F3E8FF', name: 'Terms & Privacy',    type: 'arrow' },
]

// ── Toggle switch ──────────────────────────────────────────────────────────────
function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="w-10 h-[22px] rounded-[11px] relative cursor-pointer flex-shrink-0"
      style={{ background: on ? '#4A0E6E' : '#DDB8F5', transition: 'background 0.2s' }}
    >
      <div
        className="absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white"
        style={{ right: on ? '2px' : undefined, left: on ? undefined : '2px', transition: 'all 0.2s' }}
      />
    </div>
  )
}

// ── Bottom nav ─────────────────────────────────────────────────────────────────
function BottomNav({ active }: { active: string }) {
  return (
    <div className="flex bg-white border-t border-[#F3E8FF] pt-2.5 pb-4 flex-shrink-0">
      {[
        { icon: '🏠', label: 'Home' },
        { icon: '🔍', label: 'Vendors' },
        { icon: '📋', label: 'My Event' },
        { icon: '💬', label: 'Messages' },
        { icon: '👤', label: 'Profile' },
      ].map(n => (
        <div key={n.label} className="flex-1 flex flex-col items-center gap-[3px] cursor-pointer py-1.5">
          <span className="text-[20px]">{n.icon}</span>
          <span
            className="text-[10px] font-bold"
            style={{ fontFamily: 'var(--font-syne)', color: n.label === active ? '#4A0E6E' : '#7C6B8A' }}
          >
            {n.label}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [notifFilter, setNotifFilter] = useState<NotifFilter>('all')
  const [toggles, setToggles] = useState({ push: true, email: true, ai: true, dark: false })

  function flipToggle(key: keyof typeof toggles) {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div
      className={`${syne.variable} ${epilogue.variable} min-h-screen bg-[#1A1A2E] flex items-center justify-center gap-8 flex-wrap p-6`}
      style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}
    >

      {/* ══ PHONE 1: NOTIFICATIONS ══ */}
      <div className="flex flex-col items-center">
        <div
          className="mb-3 text-[11px] font-bold uppercase tracking-[2px] text-center"
          style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-syne)' }}
        >
          Notifications
        </div>
        <div
          className="w-[375px] h-[812px] bg-[#F8F4FC] rounded-[48px] overflow-hidden flex flex-col flex-shrink-0"
          style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 10px #2D2D45, 0 0 0 12px #3D3D55' }}
        >
          <div className="w-[120px] h-8 bg-[#1A1A2E] rounded-b-[20px] mx-auto flex-shrink-0" />

          {/* Header */}
          <div className="bg-[#1A1A2E] px-5 pt-3.5 pb-4 flex-shrink-0 relative overflow-hidden">
            <div
              className="absolute w-[200px] h-[200px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(107,31,154,0.3) 0%, transparent 70%)', top: '-70px', right: '-40px' }}
            />
            <div className="flex items-center justify-between relative z-[1]">
              <span className="text-[20px] font-extrabold text-white tracking-[-0.4px]" style={{ fontFamily: 'var(--font-syne)' }}>
                Notifications
              </span>
              <button
                className="h-[34px] px-2.5 rounded-[10px] text-[12px] font-bold text-white"
                style={{ fontFamily: 'var(--font-syne)', background: 'rgba(255,255,255,0.08)', border: 'none' }}
              >
                Mark All Read
              </button>
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex gap-[7px] px-5 pt-3 overflow-x-auto scrollbar-hide flex-shrink-0 bg-[#F8F4FC]">
            {NOTIF_FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setNotifFilter(f.id)}
                className="px-3 py-[5px] rounded-[20px] text-[11px] font-bold whitespace-nowrap flex-shrink-0"
                style={{
                  fontFamily: 'var(--font-syne)',
                  background: notifFilter === f.id ? '#4A0E6E' : 'white',
                  border: `1.5px solid ${notifFilter === f.id ? '#4A0E6E' : '#DDB8F5'}`,
                  color: notifFilter === f.id ? 'white' : '#7C6B8A',
                  transition: 'all 0.15s',
                  cursor: 'pointer',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Notification list */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {NOTIF_SECTIONS.map(section => (
              <div key={section.label}>
                <div
                  className="px-5 pt-3.5 pb-1.5 text-[10px] font-bold uppercase tracking-[1.5px] text-[#7C6B8A]"
                  style={{ fontFamily: 'var(--font-syne)' }}
                >
                  {section.label}
                </div>
                {section.items.map(item => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 px-5 py-3 border-b border-[#F3E8FF] cursor-pointer"
                    style={{ background: item.unread ? 'rgba(74,14,110,0.03)' : 'transparent' }}
                  >
                    {/* Icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-[20px] flex-shrink-0 relative"
                      style={{ background: item.iconBg }}
                    >
                      {item.iconEmoji}
                      {item.unread && (
                        <div
                          className="absolute -top-[2px] -right-[2px] w-2 h-2 rounded-full"
                          style={{ background: '#4A0E6E', border: '2px solid #F8F4FC' }}
                        />
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-[13px] leading-[1.3] mb-[3px]"
                        style={{
                          fontFamily: 'var(--font-syne)',
                          fontWeight: item.unread ? 800 : 700,
                          color: '#1A1A2E',
                        }}
                      >
                        {item.title}
                      </div>
                      <div className="text-[12px] leading-[1.5] text-[#7C6B8A]">{item.body}</div>
                      <div
                        className="text-[10px] text-[#7C6B8A] mt-1 font-semibold"
                        style={{ fontFamily: 'var(--font-syne)' }}
                      >
                        {item.time}
                      </div>
                    </div>
                    {/* Action button */}
                    {item.actionLabel && (
                      <button
                        className="px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap flex-shrink-0 mt-[2px]"
                        style={{
                          fontFamily: 'var(--font-syne)',
                          background: item.actionSecondary ? '#F3E8FF' : '#4A0E6E',
                          color: item.actionSecondary ? '#4A0E6E' : 'white',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {item.actionLabel}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ))}
            <div className="h-4" />
          </div>

          <BottomNav active="Profile" />
        </div>
      </div>

      {/* ══ PHONE 2: SETTINGS & PROFILE ══ */}
      <div className="flex flex-col items-center">
        <div
          className="mb-3 text-[11px] font-bold uppercase tracking-[2px] text-center"
          style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-syne)' }}
        >
          Settings &amp; Profile
        </div>
        <div
          className="w-[375px] h-[812px] bg-[#F8F4FC] rounded-[48px] overflow-hidden flex flex-col flex-shrink-0"
          style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 10px #2D2D45, 0 0 0 12px #3D3D55' }}
        >
          <div className="w-[120px] h-8 bg-[#1A1A2E] rounded-b-[20px] mx-auto flex-shrink-0" />

          {/* Header */}
          <div className="bg-[#1A1A2E] px-5 pt-3.5 pb-4 flex-shrink-0 relative overflow-hidden">
            <div
              className="absolute w-[200px] h-[200px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(107,31,154,0.3) 0%, transparent 70%)', top: '-70px', right: '-40px' }}
            />
            <div className="flex items-center justify-between relative z-[1]">
              <span className="text-[20px] font-extrabold text-white tracking-[-0.4px]" style={{ fontFamily: 'var(--font-syne)' }}>
                Profile
              </span>
              <button
                className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[15px] text-white"
                style={{ background: 'rgba(255,255,255,0.08)', border: 'none' }}
              >
                ⚙️
              </button>
            </div>
          </div>

          {/* Profile hero */}
          <div className="bg-[#1A1A2E] px-5 pb-5 flex items-center gap-3.5 flex-shrink-0">
            <div
              className="w-16 h-16 rounded-[20px] flex items-center justify-center text-[28px] flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #4A0E6E, #6B1F9A)',
                border: '3px solid rgba(255,255,255,0.1)',
              }}
            >
              👰🏾
            </div>
            <div>
              <div className="text-[18px] font-extrabold text-white tracking-[-0.3px]" style={{ fontFamily: 'var(--font-syne)' }}>
                Aisha Johnson
              </div>
              <div className="text-[12px] mt-[2px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                aisha@example.com · Houston, TX
              </div>
            </div>
            <button
              className="ml-auto px-3 py-[7px] rounded-[10px] text-[11px] font-bold text-white flex-shrink-0"
              style={{ fontFamily: 'var(--font-syne)', background: 'rgba(255,255,255,0.08)', border: 'none' }}
            >
              Edit
            </button>
          </div>

          {/* Settings body */}
          <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-4">

            {/* Active Event */}
            <div className="mb-5">
              <div
                className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#7C6B8A] mb-2"
                style={{ fontFamily: 'var(--font-syne)' }}
              >
                Active Event
              </div>
              <div
                className="bg-white rounded-[14px] p-3.5 flex items-center gap-3"
                style={{ boxShadow: '0 2px 8px rgba(74,14,110,0.06)' }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-[22px] flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #4A0E6E, #6B1F9A)' }}
                >
                  💍
                </div>
                <div className="flex-1">
                  <div className="text-[14px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-syne)' }}>
                    Aisha & Marcus Wedding
                  </div>
                  <div className="text-[11px] text-[#7C6B8A] mt-[2px]">August 14, 2025 · 47 days away</div>
                </div>
                <div className="text-[12px] font-bold text-[#4A0E6E]" style={{ fontFamily: 'var(--font-syne)' }}>
                  62% ›
                </div>
              </div>
            </div>

            {/* Subscription */}
            <div className="mb-5">
              <div
                className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#7C6B8A] mb-2"
                style={{ fontFamily: 'var(--font-syne)' }}
              >
                Subscription
              </div>
              <div
                className="rounded-[14px] p-4 flex items-center gap-3.5"
                style={{ background: 'linear-gradient(135deg, #4A0E6E, #6B1F9A)' }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-[22px] flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                >
                  ✦
                </div>
                <div>
                  <div className="text-[15px] font-extrabold text-white" style={{ fontFamily: 'var(--font-syne)' }}>
                    Easy Events Pro
                  </div>
                  <div className="text-[11px] mt-[2px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    $29/month · Renews Jul 22
                  </div>
                </div>
                <button
                  className="ml-auto px-3 py-1.5 rounded-lg text-[11px] font-bold text-white flex-shrink-0"
                  style={{ fontFamily: 'var(--font-syne)', background: 'rgba(255,255,255,0.15)', border: 'none' }}
                >
                  Manage
                </button>
              </div>
            </div>

            {/* Account */}
            <SettingsSection title="Account" rows={ACCOUNT_ROWS} toggles={toggles} onToggle={flipToggle} />

            {/* Preferences */}
            <SettingsSection title="Preferences" rows={PREF_ROWS} toggles={toggles} onToggle={flipToggle} />

            {/* Support */}
            <SettingsSection title="Support" rows={SUPPORT_ROWS} toggles={toggles} onToggle={flipToggle} />

            {/* Log Out */}
            <button
              className="w-full rounded-xl py-3.5 text-[13px] font-bold text-[#C0392B]"
              style={{
                fontFamily: 'var(--font-syne)',
                background: 'transparent',
                border: '2px solid #FDEDEC',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              Log Out
            </button>

            {/* Version */}
            <div
              className="text-center mt-3 text-[11px] text-[#7C6B8A]"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              Easy Events v1.0.0 · Plan less. Celebrate more. ✦
            </div>
            <div className="h-4" />
          </div>

          <BottomNav active="Profile" />
        </div>
      </div>
    </div>
  )
}

// ── Settings section component ─────────────────────────────────────────────────
function SettingsSection({
  title,
  rows,
  toggles,
  onToggle,
}: {
  title: string
  rows: SettingsRow[]
  toggles: Record<string, boolean>
  onToggle: (key: string) => void
}) {
  return (
    <div className="mb-5">
      <div
        className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#7C6B8A] mb-2"
        style={{ fontFamily: 'var(--font-syne)' }}
      >
        {title}
      </div>
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(74,14,110,0.06)' }}>
        {rows.map((row, i) => (
          <div
            key={row.name}
            className="flex items-center gap-3 px-4 py-3.5 cursor-pointer"
            style={{
              borderBottom: i < rows.length - 1 ? '1px solid #F3E8FF' : 'none',
              transition: 'all 0.15s',
            }}
          >
            <div
              className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[17px] flex-shrink-0"
              style={{ background: row.iconBg }}
            >
              {row.icon}
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-syne)' }}>
                {row.name}
              </div>
              {row.sub && (
                <div className="text-[11px] text-[#7C6B8A] mt-[1px]">{row.sub}</div>
              )}
            </div>
            {row.type === 'arrow' && (
              <span className="text-[14px] text-[#7C6B8A]">›</span>
            )}
            {row.type === 'toggle' && row.toggleKey && (
              <Toggle
                on={toggles[row.toggleKey] ?? false}
                onClick={() => onToggle(row.toggleKey!)}
              />
            )}
            {row.type === 'value' && (
              <span className="text-[12px] font-semibold text-[#7C6B8A]" style={{ fontFamily: 'var(--font-syne)' }}>
                {row.value}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
