'use client'
import { useState } from 'react'
import { Syne, Epilogue } from 'next/font/google'

const syne = Syne({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-syne' })
const epilogue = Epilogue({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-epilogue' })

type Screen = 1 | 2 | 3 | 4
type PayMethod = 'card' | 'apple' | 'google' | 'plan'
type BookingType = 'instant' | 'request'

// ── Deterministic confetti pieces (no Math.random in render) ──────────────────
const CONFETTI_COLORS = ['#DDB8F5', '#4A0E6E', '#0D9B6A', '#D4AC0D', '#E67E22', '#ffffff']
const CONFETTI_PIECES = Array.from({ length: 40 }, (_, i) => ({
  left: `${((i * 2.53 + 1.3) % 100).toFixed(1)}%`,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  width: `${4 + (i % 8)}px`,
  height: `${4 + ((i * 3) % 8)}px`,
  borderRadius: i % 2 === 0 ? '50%' : '2px',
  duration: `${2 + (i % 3)}s`,
  delay: `${((i * 0.038) % 1.5).toFixed(2)}s`,
  opacity: (0.6 + (i % 4) * 0.1).toFixed(1),
}))

// ── Flow header (shared across screens 1-3) ───────────────────────────────────
function FlowHeader({
  title,
  step,
  onBack,
}: {
  title: string
  step: 1 | 2 | 3
  onBack: () => void
}) {
  function circleState(idx: 1 | 2 | 3): 'done' | 'active' | 'pending' {
    if (idx < step) return 'done'
    if (idx === step) return 'active'
    return 'pending'
  }

  function circleStyle(state: 'done' | 'active' | 'pending') {
    return {
      background:
        state === 'done' ? '#0D9B6A' : state === 'active' ? '#6B1F9A' : 'rgba(255,255,255,0.1)',
      color: state === 'pending' ? 'rgba(255,255,255,0.3)' : 'white',
      transition: 'all 0.3s',
    }
  }

  function labelColor(state: 'done' | 'active' | 'pending') {
    return state === 'active' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)'
  }

  const s1 = circleState(1)
  const s2 = circleState(2)
  const s3 = circleState(3)

  return (
    <div className="bg-[#1A1A2E] px-5 pt-3.5 pb-4 flex-shrink-0 relative overflow-hidden">
      {/* Radial glow orb (replaces ::before pseudo-element) */}
      <div
        className="absolute w-[180px] h-[180px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(107,31,154,0.3) 0%, transparent 70%)',
          top: '-60px',
          right: '-30px',
        }}
      />

      {/* Top bar */}
      <div className="flex items-center justify-between mb-3.5 relative z-[1]">
        <button
          onClick={onBack}
          className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-white text-base"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          ←
        </button>
        <span
          className="text-[16px] font-extrabold text-white tracking-[-0.3px]"
          style={{ fontFamily: 'var(--font-syne)' }}
        >
          {title}
        </span>
        <span
          className="text-[11px] font-bold"
          style={{ fontFamily: 'var(--font-syne)', color: 'rgba(255,255,255,0.4)' }}
        >
          {step} of 3
        </span>
      </div>

      {/* Step indicators */}
      <div className="flex items-center relative z-[1]">
        {/* Step 1 */}
        <div className="flex flex-col items-center gap-[5px] flex-1">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold"
            style={{ fontFamily: 'var(--font-syne)', ...circleStyle(s1) }}
          >
            {s1 === 'done' ? '✓' : '1'}
          </div>
          <span
            className="text-[9px] font-bold uppercase tracking-[0.5px]"
            style={{ fontFamily: 'var(--font-syne)', color: labelColor(s1) }}
          >
            Details
          </span>
        </div>

        {/* Connector 1 */}
        <div
          className="h-0.5 flex-1 mb-[18px]"
          style={{
            background: step > 1 ? '#0D9B6A' : 'rgba(255,255,255,0.1)',
            transition: 'background 0.3s',
          }}
        />

        {/* Step 2 */}
        <div className="flex flex-col items-center gap-[5px] flex-1">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold"
            style={{ fontFamily: 'var(--font-syne)', ...circleStyle(s2) }}
          >
            {s2 === 'done' ? '✓' : '2'}
          </div>
          <span
            className="text-[9px] font-bold uppercase tracking-[0.5px]"
            style={{ fontFamily: 'var(--font-syne)', color: labelColor(s2) }}
          >
            Payment
          </span>
        </div>

        {/* Connector 2 */}
        <div
          className="h-0.5 flex-1 mb-[18px]"
          style={{
            background: step > 2 ? '#0D9B6A' : 'rgba(255,255,255,0.1)',
            transition: 'background 0.3s',
          }}
        />

        {/* Step 3 */}
        <div className="flex flex-col items-center gap-[5px] flex-1">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold"
            style={{ fontFamily: 'var(--font-syne)', ...circleStyle(s3) }}
          >
            {s3 === 'done' ? '✓' : '3'}
          </div>
          <span
            className="text-[9px] font-bold uppercase tracking-[0.5px]"
            style={{ fontFamily: 'var(--font-syne)', color: labelColor(s3) }}
          >
            Confirm
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Reusable input primitives ─────────────────────────────────────────────────
function InputLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="block text-[11px] font-bold uppercase tracking-[0.5px] text-[#7C6B8A] mb-1.5"
      style={{ fontFamily: 'var(--font-syne)' }}
    >
      {children}
    </label>
  )
}

const inputCls =
  'booking-input w-full bg-white border-2 border-[#DDB8F5] rounded-xl px-[15px] py-[13px] text-[14px] text-[#1A1A2E] outline-none focus:border-[#4A0E6E] transition-colors'
const inputShadow = { boxShadow: '0 2px 6px rgba(74,14,110,0.04)' }

// ── Pay method row ────────────────────────────────────────────────────────────
function PayMethodRow({
  icon,
  iconBg,
  name,
  sub,
  selected,
  onClick,
  compact,
}: {
  icon: string
  iconBg: string
  name: string
  sub: string
  selected: boolean
  onClick: () => void
  compact?: boolean
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-[14px] flex items-center gap-3 cursor-pointer"
      style={{
        border: `2px solid ${selected ? '#4A0E6E' : '#DDB8F5'}`,
        background: selected ? '#F3E8FF' : 'white',
        padding: compact ? '12px' : '14px 16px',
        transition: 'all 0.2s',
      }}
    >
      <div
        className="rounded-[10px] flex items-center justify-center text-[20px] flex-shrink-0"
        style={{
          width: compact ? '32px' : '38px',
          height: compact ? '32px' : '38px',
          fontSize: compact ? '16px' : '20px',
          background: iconBg,
        }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="font-bold text-[#1A1A2E]"
          style={{
            fontFamily: 'var(--font-syne)',
            fontSize: compact ? '12px' : '14px',
          }}
        >
          {name}
        </div>
        <div className="text-[11px] text-[#7C6B8A] mt-0.5">{sub}</div>
      </div>
      {/* Radio */}
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ml-auto"
        style={{
          border: `2px solid ${selected ? '#4A0E6E' : '#DDB8F5'}`,
          background: selected ? '#4A0E6E' : 'transparent',
          transition: 'all 0.2s',
        }}
      >
        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BookingPage() {
  const [screen, setScreen] = useState<Screen>(1)

  // Screen 1 fields
  const [venue, setVenue] = useState('The Astorian, Houston TX')
  const [guestCount, setGuestCount] = useState('200')
  const [setupTime, setSetupTime] = useState('9:00 AM')
  const [specialRequests, setSpecialRequests] = useState('')
  const [bookingType, setBookingType] = useState<BookingType>('instant')

  // Screen 2 fields
  const [payMethod, setPayMethod] = useState<PayMethod>('card')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardName, setCardName] = useState('')

  // Screen 3 fields
  const [agreed, setAgreed] = useState(false)

  // ── Vendor summary card (shared by screens 1 & 3) ──
  function BookingSummaryCard({
    subline,
    rows,
  }: {
    subline: string
    rows: { label: string; val: string; valClass?: string }[]
  }) {
    return (
      <div
        className="bg-[#1A1A2E] rounded-2xl p-4 mb-3.5"
        style={{ animation: 'fadeUp 0.4s ease both' }}
      >
        <div
          className="flex items-center gap-3 mb-3.5 pb-3.5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-[22px] flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #E6F7F2, #A8DCC8)' }}
          >
            🌸
          </div>
          <div>
            <div
              className="text-[14px] font-bold text-white"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              Bloom & Co Florals
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {subline}
            </div>
          </div>
          <div
            className="ml-auto rounded-lg px-2 py-1 text-[10px] font-bold"
            style={{
              fontFamily: 'var(--font-syne)',
              background: 'rgba(13,155,106,0.2)',
              border: '1px solid rgba(13,155,106,0.3)',
              color: '#4ECDC4',
            }}
          >
            ✓ Elite
          </div>
        </div>
        {rows.map((r, i) => (
          <div
            key={i}
            className="flex justify-between items-center"
            style={{ marginBottom: i < rows.length - 1 ? '8px' : 0 }}
          >
            <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {r.label}
            </span>
            <span
              className="text-[13px] font-bold"
              style={{
                fontFamily: 'var(--font-syne)',
                color:
                  r.valClass === 'green'
                    ? '#4ECDC4'
                    : r.valClass === 'lavender'
                    ? '#DDB8F5'
                    : 'white',
              }}
            >
              {r.val}
            </span>
          </div>
        ))}
      </div>
    )
  }

  // ── Order summary card (shared by screens 2 & 3) ──
  function OrderSummaryCard({
    title,
    rows,
    totalRow,
    depositNote,
  }: {
    title: string
    rows: { label: string; val: string; valClass?: string }[]
    totalRow?: { label: string; val: string }
    depositNote?: React.ReactNode
  }) {
    return (
      <div
        className="bg-white rounded-2xl p-4 mb-3.5"
        style={{
          boxShadow: '0 2px 8px rgba(74,14,110,0.06)',
          animation: 'fadeUp 0.4s ease both',
        }}
      >
        <div
          className="text-[13px] font-bold text-[#1A1A2E] mb-3"
          style={{ fontFamily: 'var(--font-syne)' }}
        >
          {title}
        </div>
        {rows.map((r, i) => (
          <div
            key={i}
            className="flex justify-between items-center text-[13px]"
            style={{ marginBottom: '8px' }}
          >
            <span className="text-[#7C6B8A]">{r.label}</span>
            <span
              className="font-semibold"
              style={{
                fontFamily: 'var(--font-syne)',
                color:
                  r.valClass === 'plum'
                    ? '#4A0E6E'
                    : r.valClass === 'green'
                    ? '#0D9B6A'
                    : '#1A1A2E',
              }}
            >
              {r.val}
            </span>
          </div>
        ))}
        {totalRow && (
          <>
            <div className="h-px bg-[#F3E8FF] my-2.5" />
            <div className="flex justify-between items-center">
              <span
                className="text-[14px] font-bold text-[#1A1A2E]"
                style={{ fontFamily: 'var(--font-syne)' }}
              >
                {totalRow.label}
              </span>
              <span
                className="text-[20px] font-extrabold text-[#4A0E6E] tracking-[-0.5px]"
                style={{ fontFamily: 'var(--font-syne)' }}
              >
                {totalRow.val}
              </span>
            </div>
          </>
        )}
        {depositNote && (
          <div className="bg-[#F3E8FF] rounded-[10px] px-3 py-2.5 mt-2.5 text-[11px] text-[#4A0E6E] leading-[1.5]">
            {depositNote}
          </div>
        )}
      </div>
    )
  }

  // ── Escrow card ──
  function EscrowCard({ title, text, mb }: { title: string; text: string; mb?: boolean }) {
    return (
      <div
        className="bg-[#1A1A2E] rounded-[14px] p-3.5 flex gap-2.5"
        style={{
          marginBottom: mb !== false ? '14px' : 0,
          animation: 'fadeUp 0.4s 0.1s ease both',
        }}
      >
        <span className="text-[20px] flex-shrink-0">🔒</span>
        <div>
          <div
            className="text-[12px] font-bold text-white mb-1"
            style={{ fontFamily: 'var(--font-syne)' }}
          >
            {title}
          </div>
          <div className="text-[11px] leading-[1.5]" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {text}
          </div>
        </div>
      </div>
    )
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
        <div className="w-[120px] h-8 bg-[#1A1A2E] rounded-b-[20px] mx-auto flex-shrink-0 relative z-20" />

        {/* ── SCREENS 1-3 ── */}
        {screen < 4 && (
          <div
            key={screen}
            className="flex-1 flex flex-col overflow-hidden"
            style={{ animation: 'slideIn 0.35s cubic-bezier(0.16,1,0.3,1) both' }}
          >
            <FlowHeader
              title={screen === 1 ? 'Book Vendor' : screen === 2 ? 'Payment' : 'Review & Confirm'}
              step={screen as 1 | 2 | 3}
              onBack={() => setScreen(s => (s > 1 ? ((s - 1) as Screen) : s))}
            />

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-4">
              {/* ══ SCREEN 1: DETAILS ══ */}
              {screen === 1 && (
                <>
                  <BookingSummaryCard
                    subline="Florals & Décor · Houston, TX"
                    rows={[
                      { label: 'Package', val: 'Signature — $2,200', valClass: 'lavender' },
                      { label: 'Event', val: 'Aisha & Marcus Wedding' },
                      { label: 'Match Score', val: '98% AI Match ✦', valClass: 'green' },
                    ]}
                  />

                  {/* Date confirmed */}
                  <div
                    className="bg-[#E6F7F2] rounded-[14px] px-4 py-3.5 flex items-center gap-3 mb-3.5"
                    style={{
                      border: '2px solid #0D9B6A',
                      animation: 'fadeUp 0.4s 0.1s ease both',
                    }}
                  >
                    <div className="w-10 h-10 rounded-[10px] bg-[#0D9B6A] flex items-center justify-center text-[20px] flex-shrink-0">
                      📅
                    </div>
                    <div>
                      <div
                        className="text-[11px] font-bold text-[#0D9B6A]"
                        style={{ fontFamily: 'var(--font-syne)' }}
                      >
                        Event Date
                      </div>
                      <div
                        className="text-[15px] font-extrabold text-[#1A1A2E]"
                        style={{ fontFamily: 'var(--font-syne)' }}
                      >
                        August 14, 2025
                      </div>
                      <div className="text-[11px] text-[#0D9B6A] mt-0.5">
                        ✓ Vendor is available this date
                      </div>
                    </div>
                  </div>

                  {/* Venue */}
                  <div className="mb-3">
                    <InputLabel>Event Location / Venue</InputLabel>
                    <input
                      className={inputCls}
                      style={inputShadow}
                      type="text"
                      value={venue}
                      onChange={e => setVenue(e.target.value)}
                    />
                  </div>

                  {/* Guest count + Setup time */}
                  <div className="grid grid-cols-2 gap-2.5 mb-3">
                    <div>
                      <InputLabel>Guest Count</InputLabel>
                      <input
                        className={inputCls}
                        style={inputShadow}
                        type="number"
                        value={guestCount}
                        onChange={e => setGuestCount(e.target.value)}
                      />
                    </div>
                    <div>
                      <InputLabel>Setup Time</InputLabel>
                      <select
                        className={inputCls}
                        style={{ ...inputShadow, WebkitAppearance: 'none' }}
                        value={setupTime}
                        onChange={e => setSetupTime(e.target.value)}
                      >
                        <option>8:00 AM</option>
                        <option>9:00 AM</option>
                        <option>10:00 AM</option>
                      </select>
                    </div>
                  </div>

                  {/* Special requests */}
                  <div className="mb-3">
                    <InputLabel>Special Requests</InputLabel>
                    <textarea
                      className={inputCls}
                      style={{ ...inputShadow, resize: 'none', lineHeight: '1.6', minHeight: '80px' }}
                      placeholder="e.g. Blush and sage color palette, extra greenery on the arch, pampas grass accents…"
                      value={specialRequests}
                      onChange={e => setSpecialRequests(e.target.value)}
                    />
                  </div>

                  {/* Booking type */}
                  <div className="mb-2">
                    <InputLabel>Booking Type</InputLabel>
                    <div className="flex gap-2.5">
                      <div className="flex-1">
                        <PayMethodRow
                          icon="⚡"
                          iconBg="#F3E8FF"
                          name="Instant Book"
                          sub="Auto confirmed"
                          selected={bookingType === 'instant'}
                          onClick={() => setBookingType('instant')}
                          compact
                        />
                      </div>
                      <div className="flex-1">
                        <PayMethodRow
                          icon="✋"
                          iconBg="#F3E8FF"
                          name="Request"
                          sub="Vendor approves"
                          selected={bookingType === 'request'}
                          onClick={() => setBookingType('request')}
                          compact
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ══ SCREEN 2: PAYMENT ══ */}
              {screen === 2 && (
                <>
                  <OrderSummaryCard
                    title="Order Summary"
                    rows={[
                      { label: 'Signature Package', val: '$2,200' },
                      { label: 'Platform fee (3%)', val: '$66' },
                      { label: 'Processing fee', val: '$14' },
                    ]}
                    totalRow={{ label: 'Total', val: '$2,280' }}
                    depositNote={
                      <>
                        💳 <strong>Deposit due today: $570</strong> (25%) — remaining $1,710 due 14
                        days before your event. Funds held securely in escrow until vendor confirms.
                      </>
                    }
                  />

                  <EscrowCard
                    title="Your payment is protected"
                    text="Your deposit is held in secure escrow — never sent directly to the vendor until your booking is confirmed. Full refund if vendor declines or cancels."
                  />

                  {/* Pay with label */}
                  <div className="mb-2">
                    <InputLabel>Pay With</InputLabel>
                  </div>

                  {/* Payment methods */}
                  <div className="flex flex-col gap-2.5 mb-3.5">
                    <PayMethodRow
                      icon="💳"
                      iconBg="#F0F4FF"
                      name="Credit / Debit Card"
                      sub="Visa, Mastercard, Amex"
                      selected={payMethod === 'card'}
                      onClick={() => setPayMethod('card')}
                    />
                    <PayMethodRow
                      icon="🍎"
                      iconBg="#F5F5F5"
                      name="Apple Pay"
                      sub="Touch ID or Face ID"
                      selected={payMethod === 'apple'}
                      onClick={() => setPayMethod('apple')}
                    />
                    <PayMethodRow
                      icon="🔵"
                      iconBg="#F0FFF4"
                      name="Google Pay"
                      sub="Quick checkout"
                      selected={payMethod === 'google'}
                      onClick={() => setPayMethod('google')}
                    />
                    <PayMethodRow
                      icon="📅"
                      iconBg="#FEF9E7"
                      name="Payment Plan"
                      sub="Split into 3 installments"
                      selected={payMethod === 'plan'}
                      onClick={() => setPayMethod('plan')}
                    />
                  </div>

                  {/* Card form */}
                  {payMethod === 'card' && (
                    <div
                      className="bg-white rounded-[14px] p-4 mb-3.5"
                      style={{
                        boxShadow: '0 2px 8px rgba(74,14,110,0.06)',
                        animation: 'fadeUp 0.3s ease both',
                      }}
                    >
                      {/* Card brand icons */}
                      <div className="flex gap-1.5 mb-3">
                        {[
                          { label: 'VISA', bg: '#1A1F71' },
                          { label: 'MC', bg: '#EB001B' },
                          { label: 'AMEX', bg: '#2E77BC' },
                        ].map(c => (
                          <div
                            key={c.label}
                            className="h-[22px] px-2 rounded-[4px] flex items-center text-[11px] font-bold text-white"
                            style={{ fontFamily: 'var(--font-syne)', background: c.bg }}
                          >
                            {c.label}
                          </div>
                        ))}
                      </div>

                      <div className="mb-3">
                        <InputLabel>Card Number</InputLabel>
                        <input
                          className={inputCls}
                          style={inputShadow}
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          value={cardNumber}
                          onChange={e => setCardNumber(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2.5 mb-3">
                        <div>
                          <InputLabel>Expiry</InputLabel>
                          <input
                            className={inputCls}
                            style={inputShadow}
                            type="text"
                            placeholder="MM / YY"
                            value={cardExpiry}
                            onChange={e => setCardExpiry(e.target.value)}
                          />
                        </div>
                        <div>
                          <InputLabel>CVV</InputLabel>
                          <input
                            className={inputCls}
                            style={inputShadow}
                            type="text"
                            placeholder="123"
                            maxLength={4}
                            value={cardCvv}
                            onChange={e => setCardCvv(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <InputLabel>Name on Card</InputLabel>
                        <input
                          className={inputCls}
                          style={inputShadow}
                          type="text"
                          placeholder="Aisha Johnson"
                          value={cardName}
                          onChange={e => setCardName(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Security note */}
                  <div className="flex items-center gap-2 bg-[#E6F7F2] rounded-[10px] px-3 py-2.5 mb-2">
                    <span className="text-base">🔐</span>
                    <p className="text-[11px] text-[#0D9B6A] leading-[1.4]">
                      256-bit SSL encryption. Your payment info is never stored on our servers.
                      Powered by Stripe.
                    </p>
                  </div>
                </>
              )}

              {/* ══ SCREEN 3: REVIEW & CONFIRM ══ */}
              {screen === 3 && (
                <>
                  <BookingSummaryCard
                    subline="Signature Package"
                    rows={[
                      { label: 'Event Date', val: 'August 14, 2025' },
                      { label: 'Venue', val: venue || 'The Astorian, Houston TX' },
                      { label: 'Guest Count', val: `${guestCount} guests` },
                      { label: 'Setup Time', val: setupTime },
                      {
                        label: 'Booking Type',
                        val: bookingType === 'instant' ? '⚡ Instant Book' : '✋ Request',
                        valClass: 'green',
                      },
                    ]}
                  />

                  <OrderSummaryCard
                    title="Payment Breakdown"
                    rows={[
                      { label: 'Total amount', val: '$2,280' },
                      { label: 'Deposit due today (25%)', val: '$570', valClass: 'plum' },
                      { label: 'Balance due Aug 1', val: '$1,710' },
                    ]}
                    depositNote={undefined}
                  />

                  {/* Divider + paying with row */}
                  <div
                    className="bg-white rounded-2xl p-4 mb-3.5"
                    style={{ boxShadow: '0 2px 8px rgba(74,14,110,0.06)' }}
                  >
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-[#7C6B8A]">Paying with</span>
                      <span className="font-semibold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-syne)' }}>
                        💳 Visa ···· 4242
                      </span>
                    </div>
                  </div>

                  {/* Contract agreement */}
                  <div
                    className="bg-white rounded-[14px] p-3.5 mb-3.5"
                    style={{ boxShadow: '0 2px 8px rgba(74,14,110,0.06)' }}
                  >
                    <div
                      className="text-[13px] font-bold text-[#1A1A2E] mb-2.5"
                      style={{ fontFamily: 'var(--font-syne)' }}
                    >
                      📄 Vendor Agreement
                    </div>
                    <p className="text-[12px] text-[#7C6B8A] leading-[1.6] mb-3">
                      By confirming this booking you agree to the vendor&apos;s cancellation policy
                      (Moderate — 50% refund up to 14 days before event) and Easy Events&apos; Terms
                      of Service.
                    </p>
                    <div
                      className="flex items-center gap-2.5 cursor-pointer"
                      onClick={() => setAgreed(a => !a)}
                    >
                      <div
                        className="w-[22px] h-[22px] rounded-[6px] flex items-center justify-center flex-shrink-0"
                        style={{
                          border: `2px solid ${agreed ? '#4A0E6E' : '#DDB8F5'}`,
                          background: agreed ? '#4A0E6E' : 'transparent',
                          transition: 'all 0.2s',
                        }}
                      >
                        {agreed && (
                          <span className="text-white text-[13px] font-bold leading-none">✓</span>
                        )}
                      </div>
                      <span className="text-[12px] text-[#1A1A2E] font-medium">
                        I agree to the terms and vendor contract
                      </span>
                    </div>
                  </div>

                  <EscrowCard
                    title="Protected by Easy Events Escrow"
                    text="Your $570 deposit is held securely. Released to vendor only after booking is confirmed. Automatic refund if anything goes wrong."
                    mb={false}
                  />
                </>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="px-5 pt-3 pb-6 bg-white border-t border-[#F3E8FF] flex-shrink-0">
              <button
                onClick={() => setScreen(s => (s < 4 ? ((s + 1) as Screen) : s))}
                className="w-full text-white text-[16px] font-bold rounded-[14px] py-[17px] flex items-center justify-center gap-2 tracking-[-0.3px]"
                style={{
                  fontFamily: 'var(--font-syne)',
                  background: 'linear-gradient(135deg, #4A0E6E, #6B1F9A)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
              >
                {screen === 1 && 'Continue to Payment →'}
                {screen === 2 && 'Review Booking →'}
                {screen === 3 && '🔒 Confirm & Pay $570'}
              </button>
              <p className="text-center text-[11px] text-[#7C6B8A] mt-2 leading-[1.5]">
                {screen === 1 && "You won't be charged yet"}
                {screen === 2 && 'Deposit of $570 due today · Secure checkout'}
                {screen === 3 && 'Instant booking · Vendor notified immediately'}
              </p>
            </div>
          </div>
        )}

        {/* ══ SCREEN 4: SUCCESS ══ */}
        {screen === 4 && (
          <div
            key={4}
            className="flex-1 bg-[#1A1A2E] flex flex-col items-center justify-center px-8 py-10 relative overflow-hidden"
            style={{ animation: 'slideIn 0.35s cubic-bezier(0.16,1,0.3,1) both' }}
          >
            {/* Background orbs (replace ::before / ::after) */}
            <div
              className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(13,155,106,0.2) 0%, transparent 70%)',
                top: '-100px',
                right: '-100px',
              }}
            />
            <div
              className="absolute w-[300px] h-[300px] rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(107,31,154,0.2) 0%, transparent 70%)',
                bottom: '40px',
                left: '-80px',
              }}
            />

            {/* Confetti */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
              {CONFETTI_PIECES.map((p, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    left: p.left,
                    top: '-20px',
                    width: p.width,
                    height: p.height,
                    background: p.color,
                    borderRadius: p.borderRadius,
                    opacity: p.opacity,
                    animation: `confettiFall ${p.duration} ${p.delay} linear infinite`,
                  }}
                />
              ))}
            </div>

            {/* Success ring */}
            <div
              className="w-[100px] h-[100px] rounded-full bg-[#0D9B6A] flex items-center justify-center text-[44px] relative z-[1] mb-6"
              style={{ animation: 'successPop 0.6s cubic-bezier(0.16,1,0.3,1) both' }}
            >
              ✓
            </div>

            <h2
              className="text-[26px] font-extrabold text-white tracking-[-0.5px] text-center mb-2 relative z-[1]"
              style={{
                fontFamily: 'var(--font-syne)',
                opacity: 0,
                animation: 'fadeUp 0.5s 0.3s ease both',
                animationFillMode: 'both',
              }}
            >
              Booking Confirmed! 🎉
            </h2>

            <p
              className="text-[14px] text-center leading-[1.7] mb-8 relative z-[1]"
              style={{
                color: 'rgba(255,255,255,0.55)',
                opacity: 0,
                animation: 'fadeUp 0.5s 0.4s ease both',
                animationFillMode: 'both',
              }}
            >
              Bloom & Co Florals has been added to your event. They&apos;ve been notified and will
              reach out within 24 hours.
            </p>

            {/* Details card */}
            <div
              className="w-full rounded-2xl p-4 mb-6 relative z-[1]"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                opacity: 0,
                animation: 'fadeUp 0.5s 0.5s ease both',
                animationFillMode: 'both',
              }}
            >
              {[
                { label: 'Vendor', val: 'Bloom & Co Florals', valClass: '' },
                { label: 'Package', val: 'Signature — $2,200', valClass: '' },
                { label: 'Deposit Paid', val: '$570 ✓', valClass: 'green' },
                { label: 'Balance Due', val: '$1,710 · Aug 1', valClass: '' },
                { label: 'Contract', val: 'Signed ✓', valClass: 'green' },
              ].map((r, i, arr) => (
                <div
                  key={r.label}
                  className="flex justify-between items-center"
                  style={{ marginBottom: i < arr.length - 1 ? '10px' : 0 }}
                >
                  <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {r.label}
                  </span>
                  <span
                    className="text-[13px] font-bold"
                    style={{
                      fontFamily: 'var(--font-syne)',
                      color: r.valClass === 'green' ? '#4ECDC4' : 'white',
                    }}
                  >
                    {r.val}
                  </span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div
              className="flex flex-col gap-2.5 w-full relative z-[1]"
              style={{
                opacity: 0,
                animation: 'fadeUp 0.5s 0.6s ease both',
                animationFillMode: 'both',
              }}
            >
              <button
                className="w-full bg-[#4A0E6E] text-white text-[15px] font-bold rounded-[14px] py-4"
                style={{ fontFamily: 'var(--font-syne)' }}
              >
                View My Event Dashboard
              </button>
              <button
                onClick={() => setScreen(1)}
                className="w-full text-[14px] font-semibold rounded-[14px] py-3.5"
                style={{
                  fontFamily: 'var(--font-syne)',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                Book Another Vendor
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
