'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'

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
  [key: string]: unknown
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
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [eventContext, setEventContext] = useState<EventContext | null>(null)
  const [hasEventContext, setHasEventContext] = useState(false)
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
            }),
          })
          const json = await res.json()
          setMessages([{ role: 'assistant', content: json.response ?? GENERIC_GREETING }])
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
    if (!text.trim() || loading) return

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
        }),
      })

      const data = await res.json()
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
          href="/"
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
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your event..."
              rows={1}
              className="flex-1 resize-none rounded-2xl px-4 py-3 text-sm outline-none border-0"
              style={{
                background: 'white',
                color: '#1A1A2E',
                fontFamily: "'Space Grotesk', sans-serif",
                maxHeight: 120,
                lineHeight: '1.5',
              }}
              onInput={(e) => {
                const el = e.currentTarget
                el.style.height = 'auto'
                el.style.height = Math.min(el.scrollHeight, 120) + 'px'
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center border-0 cursor-pointer transition-opacity duration-150"
              style={{
                background: '#4A0E6E',
                opacity: !input.trim() || loading ? 0.5 : 1,
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
