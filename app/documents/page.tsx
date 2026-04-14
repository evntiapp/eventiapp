'use client'
import { useState } from 'react'
import { Syne, Epilogue } from 'next/font/google'

const syne = Syne({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-syne' })
const epilogue = Epilogue({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-epilogue' })

type FilterId = 'all' | 'contracts' | 'invoices' | 'permits' | 'inspo'

// ── Data types ─────────────────────────────────────────────────────────────────
interface QuickItem {
  icon: string
  name: string
  count: string
}

type BadgeType = 'signed' | 'pending' | 'paid' | 'due' | 'saved'

interface DocCard {
  id: string
  iconEmoji: string
  iconBg: string
  name: string
  meta1: string
  meta2: string
  badge: BadgeType
  badgeLabel: string
  size: string
}

// ── Static data ────────────────────────────────────────────────────────────────
const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All (12)' },
  { id: 'contracts', label: '📄 Contracts' },
  { id: 'invoices', label: '💰 Invoices' },
  { id: 'permits', label: '🪪 Permits' },
  { id: 'inspo', label: '🖼️ Inspo' },
]

const QUICK_ITEMS: QuickItem[] = [
  { icon: '📄', name: 'Contracts', count: '5 files' },
  { icon: '🧾', name: 'Invoices', count: '4 files' },
  { icon: '🪪', name: 'Permits', count: '1 file' },
  { icon: '🖼️', name: 'Inspo', count: '2 files' },
]

const BADGE_STYLES: Record<BadgeType, { bg: string; color: string }> = {
  signed:  { bg: '#E6F7F2', color: '#0D9B6A' },
  pending: { bg: '#FEF3E2', color: '#E67E22' },
  paid:    { bg: '#E6F7F2', color: '#0D9B6A' },
  due:     { bg: '#FDEDEC', color: '#C0392B' },
  saved:   { bg: '#F3E8FF', color: '#4A0E6E' },
}

const ACTION_DOCS: DocCard[] = [
  {
    id: 'a1',
    iconEmoji: '📄', iconBg: '#FEF3E2',
    name: 'Bloom_Co_Contract_Final.pdf',
    meta1: '🌸 Bloom & Co', meta2: 'Added today',
    badge: 'pending', badgeLabel: 'Sign Now',
    size: '245 KB',
  },
  {
    id: 'a2',
    iconEmoji: '🧾', iconBg: '#FDEDEC',
    name: 'Astorian_Invoice_Balance.pdf',
    meta1: '🏛️ The Astorian', meta2: 'Due Jul 10',
    badge: 'due', badgeLabel: 'Pay $2,750',
    size: '118 KB',
  },
]

const ALL_DOCS: DocCard[] = [
  {
    id: 'd1',
    iconEmoji: '📄', iconBg: '#E6F7F2',
    name: 'Astorian_Venue_Contract.pdf',
    meta1: '🏛️ The Astorian', meta2: 'Jun 23',
    badge: 'signed', badgeLabel: '✓ Signed',
    size: '312 KB',
  },
  {
    id: 'd2',
    iconEmoji: '🧾', iconBg: '#E6F7F2',
    name: 'Astorian_Deposit_Receipt.pdf',
    meta1: '🏛️ The Astorian', meta2: 'Jun 23 · $1,375',
    badge: 'paid', badgeLabel: '✓ Paid',
    size: '98 KB',
  },
  {
    id: 'd3',
    iconEmoji: '📄', iconBg: '#E6F7F2',
    name: 'BloomCo_Signature_Package.pdf',
    meta1: '🌸 Bloom & Co', meta2: 'Jun 25 · $2,200',
    badge: 'paid', badgeLabel: '✓ Paid',
    size: '189 KB',
  },
  {
    id: 'd4',
    iconEmoji: '📄', iconBg: '#F3E8FF',
    name: 'DJSmooth_Agreement.pdf',
    meta1: '🎵 DJ Smooth HTX', meta2: 'Jun 24',
    badge: 'signed', badgeLabel: '✓ Signed',
    size: '156 KB',
  },
  {
    id: 'd5',
    iconEmoji: '🖼️', iconBg: '#F3E8FF',
    name: 'Wedding_MoodBoard_Final.pdf',
    meta1: '✦ AI Generated', meta2: 'Jun 22',
    badge: 'saved', badgeLabel: 'Saved',
    size: '2.4 MB',
  },
]

// ── Doc card component ─────────────────────────────────────────────────────────
function DocumentCard({ doc }: { doc: DocCard }) {
  const badge = BADGE_STYLES[doc.badge]
  return (
    <div
      className="bg-white rounded-[14px] p-3.5 mb-2.5 flex gap-3 items-center cursor-pointer"
      style={{
        boxShadow: '0 2px 8px rgba(74,14,110,0.06)',
        border: '2px solid transparent',
        transition: 'all 0.2s',
        animation: 'fadeUp 0.4s ease both',
      }}
    >
      {/* Icon */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-[22px] flex-shrink-0"
        style={{ background: doc.iconBg }}
      >
        {doc.iconEmoji}
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div
          className="text-[13px] font-bold text-[#1A1A2E] mb-[3px] truncate"
          style={{ fontFamily: 'var(--font-syne)' }}
        >
          {doc.name}
        </div>
        <div className="flex gap-2">
          {[doc.meta1, doc.meta2].map((m, i) => (
            <span key={i} className="text-[10px] text-[#7C6B8A] flex items-center gap-[3px]">
              {m}
            </span>
          ))}
        </div>
      </div>
      {/* Status */}
      <div className="flex flex-col items-end gap-[5px] flex-shrink-0">
        <span
          className="text-[10px] font-bold px-2 py-[3px] rounded-[6px] whitespace-nowrap"
          style={{ fontFamily: 'var(--font-syne)', background: badge.bg, color: badge.color }}
        >
          {doc.badgeLabel}
        </span>
        <span className="text-[10px] text-[#7C6B8A]" style={{ fontFamily: 'var(--font-syne)' }}>
          {doc.size}
        </span>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function DocumentsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterId>('all')

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
            <span
              className="text-[20px] font-extrabold text-white tracking-[-0.4px]"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              Document Vault
            </span>
            <div className="flex gap-2">
              <button
                className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-base text-white"
                style={{ background: 'rgba(255,255,255,0.08)', border: 'none' }}
              >
                🔍
              </button>
              <button
                className="h-[34px] px-3 rounded-[10px] text-[11px] font-bold text-white flex items-center gap-1"
                style={{ fontFamily: 'var(--font-syne)', background: '#6B1F9A', border: 'none' }}
              >
                + Upload
              </button>
            </div>
          </div>

          {/* Search */}
          <div
            className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 mb-3 relative z-[1]"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.1)' }}
          >
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>🔍</span>
            <input
              type="text"
              placeholder="Search documents…"
              className="flex-1 bg-transparent border-none outline-none text-[13px] text-white"
              style={{ fontFamily: 'var(--font-epilogue)' }}
            />
          </div>

          {/* Filter pills */}
          <div className="flex gap-[7px] overflow-x-auto scrollbar-hide relative z-[1]">
            {FILTERS.map(f => (
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

        {/* ── VAULT BODY ── */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-4">

          {/* Storage card */}
          <div
            className="bg-[#1A1A2E] rounded-[14px] px-4 py-3.5 mb-3.5"
            style={{ animation: 'fadeUp 0.4s ease both' }}
          >
            <div className="flex justify-between items-center mb-2">
              <span
                className="text-[11px] font-bold tracking-[0.5px]"
                style={{ fontFamily: 'var(--font-syne)', color: 'rgba(255,255,255,0.45)' }}
              >
                Vault Storage
              </span>
              <span
                className="text-[13px] font-bold text-white"
                style={{ fontFamily: 'var(--font-syne)' }}
              >
                35 MB of 1 GB used
              </span>
            </div>
            <div className="h-[6px] rounded-[3px] overflow-hidden mb-1.5" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div
                className="h-full rounded-[3px]"
                style={{ width: '35%', background: 'linear-gradient(90deg, #6B1F9A, #DDB8F5)' }}
              />
            </div>
            <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              12 files · All encrypted &amp; secured by Easy Events
            </div>
          </div>

          {/* Quick access */}
          <div
            className="flex items-center justify-between mb-2.5 text-[13px] font-bold text-[#1A1A2E]"
            style={{ fontFamily: 'var(--font-syne)' }}
          >
            Quick Access
          </div>
          <div
            className="grid grid-cols-4 gap-2 mb-4"
            style={{ animation: 'fadeUp 0.4s 0.05s ease both' }}
          >
            {QUICK_ITEMS.map(item => (
              <div
                key={item.name}
                className="bg-white rounded-xl p-3 text-center cursor-pointer"
                style={{
                  boxShadow: '0 2px 6px rgba(74,14,110,0.06)',
                  border: '2px solid transparent',
                  transition: 'all 0.2s',
                }}
              >
                <div className="text-[22px] mb-[5px]">{item.icon}</div>
                <div className="text-[10px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-syne)' }}>
                  {item.name}
                </div>
                <div className="text-[10px] text-[#7C6B8A] mt-[2px]">{item.count}</div>
              </div>
            ))}
          </div>

          {/* Needs action */}
          <div
            className="flex items-center justify-between mb-2.5 text-[13px] font-bold text-[#1A1A2E]"
            style={{ fontFamily: 'var(--font-syne)' }}
          >
            Needs Your Action
            <span className="text-[11px] font-semibold text-[#4A0E6E] cursor-pointer">2 pending</span>
          </div>
          {ACTION_DOCS.map(doc => <DocumentCard key={doc.id} doc={doc} />)}

          {/* All documents */}
          <div
            className="flex items-center justify-between mt-1 mb-2.5 text-[13px] font-bold text-[#1A1A2E]"
            style={{ fontFamily: 'var(--font-syne)' }}
          >
            All Documents
            <span className="text-[11px] font-semibold text-[#4A0E6E] cursor-pointer">Sort ▾</span>
          </div>
          {ALL_DOCS.map(doc => <DocumentCard key={doc.id} doc={doc} />)}

          {/* Upload zone */}
          <div
            className="rounded-[14px] p-5 text-center cursor-pointer bg-white mb-3.5"
            style={{
              border: '2px dashed #DDB8F5',
              transition: 'all 0.2s',
              animation: 'fadeUp 0.4s 0.1s ease both',
            }}
          >
            <div className="text-[28px] mb-1.5">📁</div>
            <div
              className="text-[13px] font-bold text-[#4A0E6E]"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              Upload a Document
            </div>
            <div className="text-[11px] text-[#7C6B8A] mt-[3px]">
              PDF, JPG, PNG up to 25MB · All files encrypted
            </div>
          </div>

          <div className="h-2" />
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
