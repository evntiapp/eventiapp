'use client'
import { useState } from 'react'
import { Syne, Epilogue } from 'next/font/google'

const syne = Syne({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-syne' })
const epilogue = Epilogue({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-epilogue' })

type Screen = 'inbox' | 'chat'
type InboxFilter = 'all' | 'unread' | 'vendors' | 'ai'

// ── Data types ─────────────────────────────────────────────────────────────────
interface VendorThread {
  id: string
  name: string
  avatarEmoji: string
  avatarBg: string
  preview: string
  time: string
  unreadCount?: number
  isOnline?: boolean
  isVerified?: boolean
  isUnread?: boolean
}

type MessageType = 'received' | 'sent' | 'ai'

interface ChatMessage {
  id: string
  type: MessageType
  text?: string
  time: string
  attachment?: { name: string; size: string }
  isTyping?: boolean
}

// ── Static data ────────────────────────────────────────────────────────────────
const INBOX_FILTERS: { id: InboxFilter; label: string }[] = [
  { id: 'all', label: 'All (6)' },
  { id: 'unread', label: 'Unread (3)' },
  { id: 'vendors', label: 'Vendors' },
  { id: 'ai', label: 'AI Assistant' },
]

const VENDOR_THREADS: VendorThread[] = [
  {
    id: 'bloom',
    name: 'Bloom & Co Florals',
    avatarEmoji: '🌸',
    avatarBg: 'linear-gradient(135deg,#E6F7F2,#A8DCC8)',
    preview: 'Just sent over the contract for your review. Please sign when ready 🌸',
    time: '2m ago',
    unreadCount: 2,
    isOnline: true,
    isUnread: true,
  },
  {
    id: 'lens',
    name: 'Lens & Light Studio',
    avatarEmoji: '📸',
    avatarBg: 'linear-gradient(135deg,#F3E8FF,#DDB8F5)',
    preview: 'Hi Aisha! Excited for Aug 14. Can we schedule a pre-wedding shoot?',
    time: '1h ago',
    unreadCount: 1,
    isVerified: true,
    isUnread: true,
  },
  {
    id: 'dj',
    name: 'DJ Smooth Houston',
    avatarEmoji: '🎵',
    avatarBg: 'linear-gradient(135deg,#FEF3E2,#FDDCB5)',
    preview: 'Sounds good, I\'ll hold Aug 14. Send me the playlist when ready!',
    time: 'Yesterday',
    isVerified: true,
  },
  {
    id: 'astorian',
    name: 'The Astorian Venue',
    avatarEmoji: '🏛️',
    avatarBg: 'linear-gradient(135deg,#E3F2FD,#90CAF9)',
    preview: 'Your venue walkthrough is confirmed for Aug 7 at 2PM.',
    time: 'Jun 24',
    isVerified: true,
  },
  {
    id: 'glam',
    name: 'Glam Squad HTX',
    avatarEmoji: '💄',
    avatarBg: 'linear-gradient(135deg,#FCE4EC,#F48FB1)',
    preview: 'Your trial appointment is confirmed for Jul 5 at 10AM! 💄',
    time: 'Jun 23',
    isVerified: true,
  },
]

const CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    type: 'received',
    text: 'Hi Aisha! So excited to be part of your big day 💐 I\'ve reviewed your mood board and I absolutely love the botanical garden direction you\'re going for.',
    time: '9:14 AM',
  },
  {
    id: 'm2',
    type: 'received',
    text: 'I\'m thinking lush greenery with blush peonies, white garden roses, and cascading eucalyptus. Does that resonate with your vision?',
    time: '9:15 AM',
  },
  {
    id: 'm3',
    type: 'sent',
    text: 'That sounds absolutely perfect! Yes, exactly what I had in mind. Can you also add some candles and fairy lights to the centerpieces?',
    time: '9:22 AM · ✓✓',
  },
  {
    id: 'm4',
    type: 'received',
    text: 'Of course! Taper candles and micro fairy lights are actually my specialty 🕯️✨ I\'ll include a mood board proposal with everything.',
    time: '9:28 AM',
  },
  {
    id: 'm5',
    type: 'received',
    attachment: { name: 'Vendor_Contract_BloomCo.pdf', size: '245 KB · Tap to sign' },
    text: 'Just sent over the contract for your review. Please e-sign when ready and I\'ll get started on the design proposal! 🌸',
    time: '2m ago',
  },
]

const QUICK_REPLIES = ['✓ Sign Contract', '📅 Schedule Call', '❓ Ask Question']

// ── Typing dots animation ──────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-2 py-1">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
        style={{ background: 'linear-gradient(135deg,#E6F7F2,#A8DCC8)' }}
      >
        🌸
      </div>
      <div
        className="flex gap-1 items-center bg-white px-3.5 py-2.5"
        style={{ borderRadius: '4px 16px 16px 16px', boxShadow: '0 2px 8px rgba(74,14,110,0.06)' }}
      >
        {[0, 200, 400].map((delay, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: '#DDB8F5',
              animation: `typingPulse 1.2s ease ${delay}ms infinite`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes typingPulse {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function MessagesPage() {
  const [screen, setScreen] = useState<Screen>('inbox')
  const [activeFilter, setActiveFilter] = useState<InboxFilter>('all')
  const [quickReplyClicked, setQuickReplyClicked] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')

  return (
    <div
      className={`${syne.variable} ${epilogue.variable} min-h-screen bg-[#1A1A2E] flex items-center justify-center gap-8 flex-wrap p-6`}
      style={{ fontFamily: 'var(--font-epilogue), sans-serif' }}
    >
      {/* ══ PHONE 1: INBOX ══ */}
      <div className="flex flex-col items-center">
        <div
          className="mb-3 text-[11px] font-bold uppercase tracking-[2px] text-center"
          style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-syne)' }}
        >
          Message Inbox
        </div>
        <div
          className="w-[375px] h-[812px] bg-[#F8F4FC] rounded-[48px] overflow-hidden flex flex-col flex-shrink-0"
          style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 10px #2D2D45, 0 0 0 12px #3D3D55' }}
        >
          {/* Notch */}
          <div className="w-[120px] h-8 bg-[#1A1A2E] rounded-b-[20px] mx-auto flex-shrink-0 z-20" />

          {/* ── INBOX HEADER ── */}
          <div className="bg-[#1A1A2E] px-5 pt-3.5 pb-4 flex-shrink-0 relative overflow-hidden">
            <div
              className="absolute w-[200px] h-[200px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(107,31,154,0.3) 0%, transparent 70%)', top: '-70px', right: '-40px' }}
            />
            {/* Top bar */}
            <div className="flex items-center justify-between mb-3.5 relative z-[1]">
              <span
                className="text-[20px] font-extrabold text-white tracking-[-0.4px]"
                style={{ fontFamily: 'var(--font-syne)' }}
              >
                Messages
              </span>
              <div className="flex gap-2">
                {['🔍', '✏️'].map(icon => (
                  <button
                    key={icon}
                    className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-base text-white"
                    style={{ background: 'rgba(255,255,255,0.08)', border: 'none' }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Search bar */}
            <div
              className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 relative z-[1]"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.1)' }}
            >
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>🔍</span>
              <input
                type="text"
                placeholder="Search conversations…"
                className="flex-1 bg-transparent border-none outline-none text-[13px] text-white"
                style={{ fontFamily: 'var(--font-epilogue)' }}
              />
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide relative z-[1]">
              {INBOX_FILTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className="px-3 py-[5px] rounded-[20px] text-[11px] font-bold whitespace-nowrap flex-shrink-0"
                  style={{
                    fontFamily: 'var(--font-syne)',
                    background: activeFilter === f.id ? '#6B1F9A' : 'rgba(255,255,255,0.06)',
                    border: `1.5px solid ${activeFilter === f.id ? '#6B1F9A' : 'rgba(255,255,255,0.1)'}`,
                    color: activeFilter === f.id ? 'white' : 'rgba(255,255,255,0.5)',
                    transition: 'all 0.15s',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── CONVERSATION LIST ── */}
          <div className="flex-1 overflow-y-auto scrollbar-hide bg-[#F8F4FC]">

            {/* AI Assistant section */}
            <div
              className="px-5 py-2 text-[10px] font-bold uppercase tracking-[1.5px] text-[#7C6B8A]"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              AI Assistant
            </div>
            <div
              className="flex items-center gap-3 px-5 py-3.5 border-b border-[#F3E8FF] cursor-pointer"
              style={{ background: 'linear-gradient(135deg, rgba(74,14,110,0.08), rgba(107,31,154,0.05))', transition: 'all 0.15s' }}
            >
              {/* AI avatar */}
              <div
                className="w-[46px] h-[46px] rounded-[14px] flex items-center justify-center text-[22px] flex-shrink-0 relative"
                style={{ background: 'linear-gradient(135deg, #4A0E6E, #6B1F9A)' }}
              >
                ✦
                <div
                  className="absolute -bottom-[3px] -right-[3px] w-4 h-4 rounded-full flex items-center justify-center text-[9px]"
                  style={{ background: '#DDB8F5', border: '2px solid #F8F4FC' }}
                >
                  🤖
                </div>
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-bold text-[#1A1A2E] mb-[2px]" style={{ fontFamily: 'var(--font-syne)' }}>
                  Easy Events AI ✦
                </div>
                <div className="text-[12px] text-[#1A1A2E] font-semibold truncate">
                  ⚠️ Your caterer is still unbooked — 47 days out. I found 3 matches for you.
                </div>
              </div>
              {/* Meta */}
              <div className="flex flex-col items-end gap-[5px] flex-shrink-0">
                <span className="text-[10px] font-semibold text-[#7C6B8A]" style={{ fontFamily: 'var(--font-syne)' }}>Now</span>
                <div className="bg-[#4A0E6E] text-white rounded-[10px] px-[7px] py-[2px] text-[10px] font-bold text-center min-w-[20px]" style={{ fontFamily: 'var(--font-syne)' }}>1</div>
              </div>
            </div>

            {/* Vendors section */}
            <div
              className="px-5 py-2 text-[10px] font-bold uppercase tracking-[1.5px] text-[#7C6B8A]"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              Vendors
            </div>

            {VENDOR_THREADS.map(thread => (
              <div
                key={thread.id}
                onClick={() => setScreen('chat')}
                className="flex items-center gap-3 px-5 py-3.5 border-b border-[#F3E8FF] cursor-pointer"
                style={{
                  background: thread.isUnread ? 'rgba(74,14,110,0.03)' : 'transparent',
                  transition: 'all 0.15s',
                }}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-[46px] h-[46px] rounded-[14px] flex items-center justify-center text-2xl"
                    style={{ background: thread.avatarBg }}
                  >
                    {thread.avatarEmoji}
                  </div>
                  {thread.isOnline && (
                    <div
                      className="absolute -bottom-[2px] -right-[2px] w-3 h-3 rounded-full"
                      style={{ background: '#0D9B6A', border: '2px solid #F8F4FC' }}
                    />
                  )}
                  {thread.isVerified && !thread.isOnline && (
                    <div
                      className="absolute -bottom-[2px] -right-[2px] w-[14px] h-[14px] rounded-full flex items-center justify-center text-[8px] text-white"
                      style={{ background: '#0D9B6A', border: '2px solid #F8F4FC' }}
                    >
                      ✓
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-bold text-[#1A1A2E] mb-[2px]" style={{ fontFamily: 'var(--font-syne)' }}>
                    {thread.name}
                  </div>
                  <div
                    className={`text-[12px] truncate ${thread.isUnread ? 'text-[#1A1A2E] font-semibold' : 'text-[#7C6B8A]'}`}
                  >
                    {thread.preview}
                  </div>
                </div>
                {/* Meta */}
                <div className="flex flex-col items-end gap-[5px] flex-shrink-0">
                  <span className="text-[10px] font-semibold text-[#7C6B8A]" style={{ fontFamily: 'var(--font-syne)' }}>
                    {thread.time}
                  </span>
                  {thread.unreadCount && (
                    <div className="bg-[#4A0E6E] text-white rounded-[10px] px-[7px] py-[2px] text-[10px] font-bold text-center min-w-[20px]" style={{ fontFamily: 'var(--font-syne)' }}>
                      {thread.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ── BOTTOM NAV ── */}
          <div className="flex bg-white border-t border-[#F3E8FF] pt-2.5 pb-4 flex-shrink-0">
            {[
              { icon: '🏠', label: 'Home', active: false },
              { icon: '🔍', label: 'Vendors', active: false },
              { icon: '📋', label: 'My Event', active: false },
              { icon: '💬', label: 'Messages', active: true },
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

      {/* ══ PHONE 2: CHAT ══ */}
      <div className="flex flex-col items-center">
        <div
          className="mb-3 text-[11px] font-bold uppercase tracking-[2px] text-center"
          style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-syne)' }}
        >
          Vendor Chat
        </div>
        <div
          className="w-[375px] h-[812px] bg-[#F8F4FC] rounded-[48px] overflow-hidden flex flex-col flex-shrink-0"
          style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 10px #2D2D45, 0 0 0 12px #3D3D55' }}
        >
          {/* Notch */}
          <div className="w-[120px] h-8 bg-[#1A1A2E] rounded-b-[20px] mx-auto flex-shrink-0 z-20" />

          {/* ── CHAT HEADER ── */}
          <div className="bg-[#1A1A2E] px-4 pt-3 pb-3.5 flex-shrink-0 flex items-center gap-3 relative overflow-hidden">
            <div
              className="absolute w-[150px] h-[150px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(107,31,154,0.25) 0%, transparent 70%)', top: '-60px', right: '-30px' }}
            />
            {/* Back btn */}
            <button
              className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-base text-white flex-shrink-0 relative z-[1]"
              style={{ background: 'rgba(255,255,255,0.08)', border: 'none' }}
            >
              ←
            </button>
            {/* Vendor avatar */}
            <div className="relative flex-shrink-0 z-[1]">
              <div
                className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-[20px]"
                style={{ background: 'linear-gradient(135deg,#E6F7F2,#A8DCC8)' }}
              >
                🌸
              </div>
              <div
                className="absolute -bottom-[2px] -right-[2px] w-2.5 h-2.5 rounded-full"
                style={{ background: '#0D9B6A', border: '2px solid #1A1A2E' }}
              />
            </div>
            {/* Name + status */}
            <div className="flex-1 relative z-[1]">
              <div
                className="text-[15px] font-extrabold text-white tracking-[-0.3px]"
                style={{ fontFamily: 'var(--font-syne)' }}
              >
                Bloom & Co Florals
              </div>
              <div className="flex items-center gap-1 text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-[#0D9B6A]" />
                Active now · ✅ Pro Verified
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex gap-2 relative z-[1]">
              {['📞', '⋯'].map(icon => (
                <button
                  key={icon}
                  className="w-[30px] h-[30px] rounded-[10px] flex items-center justify-center text-sm text-white"
                  style={{ background: 'rgba(255,255,255,0.08)', border: 'none' }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* ── BOOKING CONTEXT BANNER ── */}
          <div
            className="flex items-center gap-2.5 px-4 py-2.5 border-b border-[#DDB8F5] cursor-pointer flex-shrink-0"
            style={{ background: '#F3E8FF' }}
          >
            <span className="text-base flex-shrink-0">🌸</span>
            <div className="flex-1">
              <div className="text-[11px] font-bold text-[#4A0E6E]" style={{ fontFamily: 'var(--font-syne)' }}>
                Signature Package · Aug 14, 2025
              </div>
              <div className="text-[10px] text-[#7C6B8A] mt-[1px]">
                Deposit paid $570 · Balance $1,650 due Aug 1
              </div>
            </div>
            <span className="text-[12px] text-[#4A0E6E]">›</span>
          </div>

          {/* ── MESSAGES BODY ── */}
          <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-3.5 flex flex-col gap-2.5 bg-[#F8F4FC]">
            {/* Date divider */}
            <div className="flex items-center gap-2.5 my-1">
              <div className="flex-1 h-px bg-[#F3E8FF]" />
              <span className="text-[10px] font-semibold text-[#7C6B8A] whitespace-nowrap" style={{ fontFamily: 'var(--font-syne)' }}>
                June 25, 2025
              </span>
              <div className="flex-1 h-px bg-[#F3E8FF]" />
            </div>

            {CHAT_MESSAGES.map(msg => (
              <div key={msg.id}>
                {msg.type === 'sent' ? (
                  <div className="flex flex-row-reverse gap-2 items-end">
                    <div
                      className="max-w-[240px] px-3.5 py-[11px]"
                      style={{
                        background: '#4A0E6E',
                        borderRadius: '16px 4px 16px 16px',
                        animation: 'bubbleIn 0.3s ease both',
                      }}
                    >
                      <div className="text-[13px] leading-[1.5] text-white">{msg.text}</div>
                      <div
                        className="text-[10px] mt-1 text-right"
                        style={{ fontFamily: 'var(--font-syne)', color: 'rgba(255,255,255,0.55)' }}
                      >
                        {msg.time}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 items-end">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#E6F7F2,#A8DCC8)' }}
                    >
                      🌸
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {msg.attachment && (
                        <div
                          className="flex items-center gap-2.5 bg-white rounded-xl px-3 py-2.5 max-w-[220px] cursor-pointer"
                          style={{
                            boxShadow: '0 2px 8px rgba(74,14,110,0.06)',
                            border: '1.5px solid #F3E8FF',
                            animation: 'bubbleIn 0.3s ease both',
                          }}
                        >
                          <div
                            className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg flex-shrink-0"
                            style={{ background: '#F3E8FF' }}
                          >
                            📄
                          </div>
                          <div>
                            <div className="text-[12px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-syne)' }}>
                              {msg.attachment.name}
                            </div>
                            <div className="text-[10px] text-[#7C6B8A] mt-[1px]">{msg.attachment.size}</div>
                          </div>
                        </div>
                      )}
                      {msg.text && (
                        <div
                          className="max-w-[240px] px-3.5 py-[11px]"
                          style={{
                            background: 'white',
                            borderRadius: '4px 16px 16px 16px',
                            boxShadow: '0 2px 8px rgba(74,14,110,0.06)',
                            animation: 'bubbleIn 0.3s ease both',
                          }}
                        >
                          <div className="text-[13px] leading-[1.5] text-[#1A1A2E]">{msg.text}</div>
                          <div
                            className="text-[10px] mt-1 text-[#7C6B8A]"
                            style={{ fontFamily: 'var(--font-syne)' }}
                          >
                            {msg.time}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Quick replies */}
            <div className="flex gap-2 flex-wrap mt-1 ml-9">
              {QUICK_REPLIES.map(qr => (
                <button
                  key={qr}
                  onClick={() => setQuickReplyClicked(qr)}
                  className="px-3 py-1.5 rounded-[20px] text-[11px] font-bold whitespace-nowrap"
                  style={{
                    fontFamily: 'var(--font-syne)',
                    background: quickReplyClicked === qr ? '#4A0E6E' : 'white',
                    color: quickReplyClicked === qr ? 'white' : '#4A0E6E',
                    border: `1.5px solid ${quickReplyClicked === qr ? '#4A0E6E' : '#DDB8F5'}`,
                    transition: 'all 0.15s',
                  }}
                >
                  {qr}
                </button>
              ))}
            </div>

            {/* Typing indicator */}
            <TypingDots />
          </div>

          {/* ── AI DRAFT SUGGESTION ── */}
          <div
            className="px-3.5 pt-2 bg-white border-t border-[#F3E8FF] flex-shrink-0"
          >
            <div
              className="flex items-start gap-2 rounded-xl px-3 py-2.5 cursor-pointer"
              style={{ background: '#F3E8FF', border: '1.5px solid #DDB8F5', transition: 'all 0.15s' }}
            >
              <span className="text-sm flex-shrink-0">✦</span>
              <div>
                <div
                  className="text-[10px] font-bold text-[#7C6B8A] mb-[2px]"
                  style={{ fontFamily: 'var(--font-syne)' }}
                >
                  AI Draft Suggestion
                </div>
                <div className="text-[12px] text-[#4A0E6E] leading-[1.5]">
                  "Thank you! I'll review and sign the contract today. Could we also schedule a 15-min call to discuss the arch design?"
                </div>
                <div
                  className="text-[10px] font-bold text-[#4A0E6E] mt-1"
                  style={{ fontFamily: 'var(--font-syne)' }}
                >
                  Tap to use →
                </div>
              </div>
            </div>
          </div>

          {/* ── MESSAGE INPUT BAR ── */}
          <div className="bg-white border-t border-[#F3E8FF] px-3.5 pt-2.5 pb-6 flex-shrink-0">
            <div className="flex items-end gap-2">
              {/* Attachment / camera */}
              <div className="flex gap-1.5">
                {['📎', '📷'].map(icon => (
                  <button
                    key={icon}
                    className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: '#F3E8FF', border: 'none', transition: 'all 0.15s' }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              {/* Text input */}
              <div
                className="flex-1 flex items-center px-3.5 py-[9px] rounded-[14px]"
                style={{ background: '#F8F4FC', border: '2px solid #DDB8F5', transition: 'border-color 0.2s' }}
              >
                <textarea
                  rows={1}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder="Message Bloom & Co…"
                  className="flex-1 bg-transparent border-none outline-none resize-none text-[13px] text-[#1A1A2E] leading-[1.4]"
                  style={{ fontFamily: 'var(--font-epilogue)', color: '#1A1A2E' }}
                />
              </div>
              {/* Send */}
              <button
                className="w-9 h-9 rounded-[10px] flex items-center justify-center text-base text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #4A0E6E, #6B1F9A)', border: 'none', transition: 'all 0.15s' }}
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bubbleIn {
          from { opacity: 0; transform: scale(0.85) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}
