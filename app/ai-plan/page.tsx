'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'
import { useLogoHref } from '@/app/hooks/useLogoHref'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface EventContext {
  event_type?: string
  event_date?: string
  guest_count?: number
  budget?: number
  location?: string
  vision?: string
  style?: string
  additional_notes?: string
  keywords?: string[]
  colors?: string[]
  [key: string]: unknown
}

const COLOR_MAP: Record<string, string> = {
  'Midnight': '#1A1A2E',
  'Lavender': '#DDB8F5',
  'Champagne': '#F7E7CE',
  'Gold': '#D4AC0D',
  'White': '#FFFFFF',
  'Black': '#000000',
  'Blush': '#FFB6C1',
  'Sage': '#B2C9AD',
  'Navy': '#1B2A4A',
  'Dusty Rose': '#C4817E',
  'Emerald': '#006400',
  'Burgundy': '#800020',
}

// Requires NEXT_PUBLIC_UNSPLASH_ACCESS_KEY in .env.local
// Get free key at unsplash.com/developers

const FALLBACK_IMAGES = ['/images/Hero.jpg', '/images/venues.jpg', '/images/feature.jpg']

async function fetchUnsplashImage(keyword: string): Promise<string> {
  const query = encodeURIComponent(`${keyword} event wedding party elegant`)
  const response = await fetch(
    `https://api.unsplash.com/search/photos?query=${query}&per_page=1&orientation=landscape`,
    {
      headers: {
        Authorization: `Client-ID ${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`,
      },
    }
  )
  const data = await response.json()
  return data.results?.[0]?.urls?.regular || '/images/Hero.jpg'
}

function MoodBoard({ keywords, colors }: { keywords: string[]; colors: string[] }) {
  const [hoveredColor, setHoveredColor] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [imagesLoading, setImagesLoading] = useState(true)

  useEffect(() => {
    const queryKeywords = keywords.slice(0, 3)
    if (queryKeywords.length === 0) {
      setImages(FALLBACK_IMAGES)
      setImagesLoading(false)
      return
    }
    Promise.all(queryKeywords.map((kw) => fetchUnsplashImage(kw)))
      .then((results) => {
        // Pad to 3 if fewer than 3 keywords
        const padded = [...results]
        let fi = 0
        while (padded.length < 3) {
          padded.push(FALLBACK_IMAGES[fi++ % FALLBACK_IMAGES.length])
        }
        setImages(padded)
      })
      .catch(() => setImages(FALLBACK_IMAGES))
      .finally(() => setImagesLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        maxWidth: 720,
        margin: '0 auto 24px',
      }}
    >
      <p
        style={{
          fontFamily: "'Syne', sans-serif",
          color: '#2D2D2D',
          fontSize: 16,
          fontWeight: 700,
          marginBottom: 16,
        }}
      >
        Your Event Mood
      </p>

      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {keywords.map((kw) => (
            <span
              key={kw}
              style={{
                background: 'rgba(74,14,110,0.08)',
                color: '#4A0E6E',
                border: '1px solid rgba(74,14,110,0.15)',
                borderRadius: 20,
                padding: '6px 14px',
                fontSize: 13,
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {kw}
            </span>
          ))}
        </div>
      )}

      {colors.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-4">
          {colors.map((color) => {
            const hex = COLOR_MAP[color] ?? '#9CA3AF'
            const isWhite = color === 'White'
            return (
              <div
                key={color}
                className="relative"
                onMouseEnter={() => setHoveredColor(color)}
                onMouseLeave={() => setHoveredColor(null)}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: hex,
                    border: isWhite ? '1px solid #eee' : undefined,
                    cursor: 'default',
                  }}
                />
                {hoveredColor === color && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 38,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#1A1A2E',
                      color: '#fff',
                      fontSize: 11,
                      padding: '3px 8px',
                      borderRadius: 6,
                      whiteSpace: 'nowrap',
                      fontFamily: "'Space Grotesk', sans-serif",
                      pointerEvents: 'none',
                      zIndex: 10,
                    }}
                  >
                    {color}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="flex gap-3">
        {imagesLoading
          ? [0, 1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-200"
                style={{ flex: 1, height: 140, borderRadius: 10 }}
              />
            ))
          : images.map((src, i) => (
              <div key={i} style={{ flex: 1, height: 140, borderRadius: 10, overflow: 'hidden' }}>
                <img
                  src={src}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            ))}
      </div>

      <p
        style={{
          marginTop: 8,
          fontSize: 10,
          color: 'rgba(0,0,0,0.3)',
          fontFamily: "'Space Grotesk', sans-serif",
          textAlign: 'right',
        }}
      >
        Photos via Unsplash
      </p>
    </div>
  )
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')  // **bold**
    .replace(/\*(.+?)\*/g, '$1')       // *italic*
    .replace(/^#{1,6}\s+/gm, '')       // ## headings
}

const SUGGESTIONS = [
  "I'm planning a birthday party for 80 guests",
  'Help me plan a wedding with a $15,000 budget',
  'What vendors do I need for a corporate event?',
  'How far in advance should I book vendors?',
]

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 max-w-[560px]">
      <div
        className="rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5"
        style={{ background: 'rgba(255,255,255,0.08)' }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block w-2 h-2 rounded-full bg-white/50"
            style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
    </div>
  )
}

const GENERIC_GREETING = "Hi! I'm Eve, your Evnti planning assistant. Tell me about your event — what are you celebrating, when is it, and what's your budget?"

export default function AIPlanPage() {
  const logoHref = useLogoHref()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [eventContext, setEventContext] = useState<EventContext | null>(null)
  const [hasEventContext, setHasEventContext] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [credits, setCredits] = useState<number | null>(null)
  const [noCredits, setNoCredits] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Fetch user's most recent event on load, then seed the opening message
  useEffect(() => {
    async function fetchEvent() {
      try {
        const supabase = getSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setMessages([{ role: 'assistant', content: GENERIC_GREETING }])
          return
        }

        setUserId(user.id)

        // Fetch credits
        const { data: userData } = await supabase
          .from('users')
          .select('eve_credits')
          .eq('id', user.id)
          .single()
        const userCredits = userData?.eve_credits ?? 0
        setCredits(userCredits)
        if (userCredits <= 0) {
          setNoCredits(true)
          setMessages([{ role: 'assistant', content: GENERIC_GREETING }])
          return
        }

        const { data: eventData } = await supabase
          .from('events')
          .select('*')
          .eq('client_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (!eventData) {
          setMessages([{ role: 'assistant', content: GENERIC_GREETING }])
          return
        }

        setEventContext(eventData as EventContext)
        setHasEventContext(true)
        setLoading(true)

        try {
          const res = await fetch('/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [{ role: 'user', content: 'Please give me an opening plan based on my event details.' }],
              eventContext: eventData,
              user_id: user.id,
            }),
          })
          const json = await res.json()
          if (json.error === 'no_credits') {
            setNoCredits(true)
            setCredits(0)
            setMessages([{ role: 'assistant', content: GENERIC_GREETING }])
          } else {
            setCredits(c => (c !== null ? c - 1 : c))
            setMessages([{ role: 'assistant', content: json.response ?? GENERIC_GREETING }])
          }
        } catch {
          setMessages([{ role: 'assistant', content: GENERIC_GREETING }])
        } finally {
          setLoading(false)
        }
      } catch {
        setMessages([{ role: 'assistant', content: GENERIC_GREETING }])
      }
    }
    fetchEvent()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(text: string) {
    if (!text.trim() || loading || noCredits) return

    const userMessage: Message = { role: 'user', content: text.trim() }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          eventContext,
          user_id: userId,
        }),
      })

      const data = await res.json()

      if (data.error === 'no_credits') {
        setNoCredits(true)
        setCredits(0)
        setMessages((prev) => prev.slice(0, -1)) // remove the user message
        return
      }

      setCredits(c => (c !== null ? Math.max(0, c - 1) : c))
      const aiMessage: Message = {
        role: 'assistant',
        content: data.response ?? data.error ?? 'Something went wrong.',
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Something went wrong. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const hasOnlyGreeting = messages.length === 1 && !hasEventContext

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: '#1A1A2E', fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Grotesk:wght@300;400;500;600&display=swap');
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>

      {/* Nav */}
      <nav
        className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <Link
          href={logoHref}
          className="text-white text-xl font-bold no-underline"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          evnti.
        </Link>
        <span className="text-white text-sm font-semibold" style={{ fontFamily: "'Syne', sans-serif" }}>
          Eve
        </span>
        <Link
          href="/dashboard"
          className="text-sm font-medium no-underline"
          style={{ color: '#DDB8F5', fontFamily: "'Space Grotesk', sans-serif" }}
        >
          My Dashboard
        </Link>
      </nav>

      {/* Hero */}
      <div className="px-6 pt-8 pb-5 text-center flex-shrink-0">
        <h1
          className="text-white mb-2"
          style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}
        >
          Meet Eve.
        </h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Your personal event planning assistant.
        </p>
      </div>

      {/* Mood board */}
      {hasEventContext && eventContext && ((eventContext.keywords?.length ?? 0) > 0 || (eventContext.colors?.length ?? 0) > 0) && (
        <div className="px-4 flex-shrink-0">
          <MoodBoard
            keywords={eventContext.keywords ?? []}
            colors={eventContext.colors ?? []}
          />
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-[720px] mx-auto flex flex-col gap-3">

          {/* Suggestion chips — only when no user messages yet */}
          {hasOnlyGreeting && (
            <div className="flex flex-wrap gap-2 justify-center mt-2 mb-4">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-sm px-4 py-2 rounded-full border cursor-pointer transition-all duration-150"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    borderColor: 'rgba(221,184,245,0.3)',
                    color: 'rgba(255,255,255,0.8)',
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(221,184,245,0.15)'
                    e.currentTarget.style.borderColor = '#DDB8F5'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                    e.currentTarget.style.borderColor = 'rgba(221,184,245,0.3)'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="max-w-[80%] text-sm leading-relaxed"
                style={{
                  ...(msg.role === 'user'
                    ? {
                        background: '#4A0E6E',
                        color: 'white',
                        borderRadius: '999px',
                        padding: '10px 18px',
                      }
                    : {
                        background: 'rgba(255,255,255,0.08)',
                        color: 'white',
                        borderRadius: '16px',
                        borderBottomLeftRadius: 4,
                        padding: '12px 16px',
                      }),
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {msg.role === 'assistant' ? stripMarkdown(msg.content) : msg.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && <TypingIndicator />}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div
        className="flex-shrink-0 px-4 pt-3 pb-5 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.08)', background: '#1A1A2E' }}
      >
        <div className="max-w-[720px] mx-auto">

          {/* Credit counter / no-credits banner */}
          {noCredits ? (
            <div className="mb-3">
              <div
                className="rounded-2xl px-5 py-5"
                style={{
                  background: 'linear-gradient(135deg, rgba(74,14,110,0.6), rgba(107,31,154,0.5))',
                  border: '1.5px solid rgba(221,184,245,0.35)',
                }}
              >
                <p
                  className="text-base font-bold mb-4"
                  style={{ color: '#DDB8F5', fontFamily: "'Space Grotesk', sans-serif", margin: '0 0 16px' }}
                >
                  You&apos;ve used all your Eve credits.
                </p>
                <a
                  href="https://buy.stripe.com/test_fZuaEY9ZQeLo5Ez6Ua4AU00"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-3 rounded-full transition-opacity hover:opacity-90"
                  style={{
                    background: 'white',
                    color: '#4A0E6E',
                    fontFamily: 'var(--font-syne), sans-serif',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                  }}
                >
                  Get 100 more credits for $9.99 →
                </a>
                <p
                  className="text-center mt-3"
                  style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: "'Space Grotesk', sans-serif", margin: '12px 0 0' }}
                >
                  Credits are added automatically after payment.
                </p>
              </div>
            </div>
          ) : credits !== null && (
            <div className="mb-2 text-right">
              <p
                className="text-xs"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: credits > 5 ? '#4ade80' : credits >= 3 ? '#fbbf24' : '#f87171',
                }}
              >
                {credits} credit{credits !== 1 ? 's' : ''} remaining
              </p>
              <p className="text-xs mt-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'rgba(255,255,255,0.4)' }}>
                10 free credits included. Need more?{' '}
                <a
                  href="https://buy.stripe.com/test_fZuaEY9ZQeLo5Ez6Ua4AU00"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#DDB8F5', textDecoration: 'underline' }}
                >
                  Get 100 credits for $9.99
                </a>
              </p>
            </div>
          )}

          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={noCredits ? 'Upgrade to continue chatting with Eve...' : 'Ask me anything about your event...'}
              disabled={noCredits}
              rows={1}
              className="flex-1 resize-none rounded-2xl px-4 py-3 text-sm outline-none border-0"
              style={{
                background: noCredits ? 'rgba(255,255,255,0.05)' : 'white',
                color: noCredits ? 'rgba(255,255,255,0.3)' : '#1A1A2E',
                fontFamily: "'Space Grotesk', sans-serif",
                maxHeight: 120,
                lineHeight: '1.5',
                cursor: noCredits ? 'not-allowed' : undefined,
              }}
              onInput={(e) => {
                const el = e.currentTarget
                el.style.height = 'auto'
                el.style.height = Math.min(el.scrollHeight, 120) + 'px'
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading || noCredits}
              className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center border-0 cursor-pointer transition-opacity duration-150"
              style={{
                background: '#4A0E6E',
                opacity: !input.trim() || loading || noCredits ? 0.5 : 1,
                cursor: noCredits ? 'not-allowed' : 'pointer',
              }}
              aria-label="Send message"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <p className="text-center mt-2 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Evnti AI can make mistakes. Always confirm with vendors.
          </p>
        </div>
      </div>
    </div>
  )
}
