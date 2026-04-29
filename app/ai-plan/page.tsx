'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowUp } from 'lucide-react'
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
  'midnight': '#1A1A2E',
  'lavender': '#DDB8F5',
  'champagne': '#F7E7CE',
  'gold': '#D4AC0D',
  'white': '#FFFFFF',
  'black': '#000000',
  'blush': '#FFB6C1',
  'blush pink': '#FF91A4',
  'sage': '#B2C9AD',
  'navy': '#1B2A4A',
  'dusty rose': '#C4817E',
  'emerald': '#006400',
  'burgundy': '#800020',
  'terracotta': '#C0634F',
  'rust': '#B7410E',
  'coral': '#FF6B6B',
  'peach': '#FFCBA4',
  'ivory': '#F8F4ED',
  'cream': '#FFFDD0',
  'silver': '#C0C0C0',
  'rose gold': '#B76E79',
  'mauve': '#E0B0FF',
  'lilac': '#C8A2C8',
  'pink': '#FFC0CB',
  'red': '#E53E3E',
  'orange': '#ED8936',
  'yellow': '#ECC94B',
  'green': '#38A169',
  'forest green': '#228B22',
  'teal': '#319795',
  'mint': '#98FF98',
  'blue': '#4299E1',
  'dusty blue': '#6699CC',
  'indigo': '#667EEA',
  'purple': '#9F7AEA',
  'brown': '#8B4513',
  'tan': '#D2B48C',
  'charcoal': '#36454F',
  'gray': '#9CA3AF',
  'grey': '#9CA3AF',
}

function colorToHex(name: string): string {
  if (name.startsWith('#')) return name
  return COLOR_MAP[name.toLowerCase()] ?? '#9CA3AF'
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
            const hex = colorToHex(color)
            const isWhite = color.toLowerCase() === 'white'
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
    <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl" style={{
      background: 'white',
      boxShadow: '0 2px 8px rgba(74,14,110,0.08)',
      width: 'fit-content',
    }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="block w-2 h-2 rounded-full"
          style={{ background: '#DDB8F5', animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
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

  // Load user context on mount — no API call, no credit consumption
  useEffect(() => {
    async function loadContext() {
      try {
        const supabase = getSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setMessages([{ role: 'assistant', content: GENERIC_GREETING }])
          return
        }

        setUserId(user.id)

        const { data: userData } = await supabase
          .from('users')
          .select('eve_credits')
          .eq('id', user.id)
          .single()
        const userCredits = userData?.eve_credits ?? 0
        setCredits(userCredits)
        if (userCredits <= 0) setNoCredits(true)

        const { data: eventData } = await supabase
          .from('events')
          .select('*')
          .eq('client_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (eventData) {
          setEventContext(eventData as EventContext)
          setHasEventContext(true)
          const type = (eventData as EventContext).event_type
          setMessages([{
            role: 'assistant',
            content: type
              ? `Hi! I'm Eve, your Evnti planning assistant. I can see you're planning a ${type} — I'm ready to help. What would you like to work on first?`
              : GENERIC_GREETING,
          }])
        } else {
          setMessages([{ role: 'assistant', content: GENERIC_GREETING }])
        }
      } catch {
        setMessages([{ role: 'assistant', content: GENERIC_GREETING }])
      }
    }
    loadContext()
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
        className="sticky top-0 z-30 flex items-center justify-between px-6 h-16 flex-shrink-0"
        style={{ background: '#1A1A2E', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <Link
          href={logoHref}
          className="text-white text-xl font-bold no-underline"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          evnti<span style={{ color: '#DDB8F5' }}>.</span>
        </Link>
        <span className="text-white text-sm font-semibold" style={{ fontFamily: "'Syne', sans-serif" }}>
          Eve
        </span>
        <Link
          href="/dashboard"
          className="text-sm font-medium no-underline"
          style={{ color: 'rgba(255,255,255,0.8)', fontFamily: "'Space Grotesk', sans-serif" }}
        >
          My Dashboard
        </Link>
      </nav>

      {/* Hero */}
      <div className="px-6 pt-6 pb-5 text-center flex-shrink-0">
        <h1
          className="text-white mb-1"
          style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}
        >
          Meet Eve.
        </h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
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
      <div className="flex-1 overflow-y-auto pb-4" style={{ background: '#F8F4FC' }}>
        <div className="max-w-[720px] mx-auto flex flex-col gap-4 px-4 pt-4">

          {/* Suggestion chips — only when no user messages yet */}
          {hasOnlyGreeting && (
            <div className="flex flex-wrap gap-2 justify-center mt-2 mb-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-sm px-4 py-2 rounded-full border cursor-pointer transition-all duration-150"
                  style={{
                    background: 'white',
                    borderColor: 'rgba(74,14,110,0.15)',
                    color: '#4A0E6E',
                    fontFamily: "'Space Grotesk', sans-serif",
                    boxShadow: '0 1px 4px rgba(74,14,110,0.07)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F3E8FF'
                    e.currentTarget.style.borderColor = '#DDB8F5'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white'
                    e.currentTarget.style.borderColor = 'rgba(74,14,110,0.15)'
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
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              {msg.role === 'assistant' && (
                <span style={{
                  fontSize: 10,
                  color: '#7C6B8A',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  marginBottom: 4,
                  letterSpacing: '0.04em',
                }}>
                  Eve
                </span>
              )}
              <div
                style={{
                  maxWidth: msg.role === 'user' ? '80%' : '85%',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 14,
                  lineHeight: 1.6,
                  ...(msg.role === 'user'
                    ? {
                        background: '#4A0E6E',
                        color: 'white',
                        borderRadius: 16,
                        padding: '10px 16px',
                      }
                    : {
                        background: 'white',
                        color: '#1A1A2E',
                        borderRadius: 16,
                        padding: '14px 16px',
                        boxShadow: '0 2px 8px rgba(74,14,110,0.08)',
                        whiteSpace: 'pre-wrap',
                      }),
                }}
              >
                {msg.role === 'assistant' ? stripMarkdown(msg.content) : msg.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex flex-col items-start">
              <span style={{ fontSize: 10, color: '#7C6B8A', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, marginBottom: 4, letterSpacing: '0.04em' }}>
                Eve
              </span>
              <TypingIndicator />
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div
        className="flex-shrink-0 px-4 pt-3 pb-5"
        style={{ background: '#F8F4FC', borderTop: '1px solid rgba(74,14,110,0.08)' }}
      >
        <div className="max-w-[720px] mx-auto">

          {/* No-credits banner */}
          {noCredits && (
            <div className="mb-3 rounded-2xl px-5 py-4" style={{
              background: 'linear-gradient(135deg, rgba(74,14,110,0.08), rgba(107,31,154,0.06))',
              border: '1.5px solid rgba(74,14,110,0.15)',
            }}>
              <p className="text-sm font-semibold mb-3" style={{ color: '#1A1A2E', fontFamily: "'Space Grotesk', sans-serif" }}>
                You&apos;ve used all your Eve credits.
              </p>
              <a
                href="https://buy.stripe.com/test_fZuaEY9ZQeLo5Ez6Ua4AU00"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-2.5 rounded-full transition-opacity hover:opacity-90"
                style={{
                  background: '#4A0E6E',
                  color: 'white',
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                }}
              >
                Get 100 more credits — $9.99
              </a>
            </div>
          )}

          {/* Input row */}
          <div
            className="flex gap-2 items-center rounded-2xl px-4 py-2"
            style={{
              background: 'white',
              boxShadow: '0 2px 12px rgba(74,14,110,0.08)',
              border: '1px solid rgba(74,14,110,0.1)',
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={noCredits ? 'Upgrade to continue chatting with Eve...' : 'Ask me anything about your event...'}
              disabled={noCredits}
              rows={1}
              className="flex-1 resize-none bg-transparent outline-none border-0 text-sm"
              style={{
                color: noCredits ? '#9CA3AF' : '#1A1A2E',
                fontFamily: "'Space Grotesk', sans-serif",
                maxHeight: 120,
                lineHeight: '1.5',
                paddingTop: 6,
                paddingBottom: 6,
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
              className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border-0 transition-opacity duration-150"
              style={{
                background: '#4A0E6E',
                opacity: !input.trim() || loading || noCredits ? 0.4 : 1,
                cursor: !input.trim() || loading || noCredits ? 'not-allowed' : 'pointer',
              }}
              aria-label="Send message"
            >
              <ArrowUp size={16} color="white" strokeWidth={2.5} />
            </button>
          </div>

          {/* Credits counter */}
          {!noCredits && credits !== null && (
            <div className="flex items-center justify-between mt-2 px-1">
              <p style={{ fontSize: 11, color: '#7C6B8A', fontFamily: "'Space Grotesk', sans-serif" }}>
                Evnti AI can make mistakes. Always confirm with vendors.
              </p>
              <p style={{ fontSize: 11, color: '#7C6B8A', fontFamily: "'Space Grotesk', sans-serif", flexShrink: 0 }}>
                {credits} credit{credits !== 1 ? 's' : ''} left
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
