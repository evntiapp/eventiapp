'use client'
export const dynamic = 'force-dynamic'

/*
  SQL — run once in Supabase SQL editor
  ──────────────────────────────────────
  create table messages (
    id uuid primary key default gen_random_uuid(),
    booking_id uuid references bookings(id) on delete cascade,
    sender_id uuid references auth.users(id) on delete cascade,
    body text not null,
    read boolean default false,
    created_at timestamptz default now()
  );

  alter table messages enable row level security;

  -- participants can view messages on their bookings
  create policy "participants view messages" on messages for select using (
    exists (
      select 1 from bookings b where b.id = messages.booking_id
        and (
          b.client_id = auth.uid()
          or exists (select 1 from vendor_profiles vp where vp.id = b.vendor_id and vp.user_id = auth.uid())
        )
    )
  );

  -- participants can send messages
  create policy "participants insert messages" on messages for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from bookings b where b.id = messages.booking_id
        and (
          b.client_id = auth.uid()
          or exists (select 1 from vendor_profiles vp where vp.id = b.vendor_id and vp.user_id = auth.uid())
        )
    )
  );

  -- participants can mark messages read
  create policy "participants update read" on messages for update using (
    exists (
      select 1 from bookings b where b.id = messages.booking_id
        and (
          b.client_id = auth.uid()
          or exists (select 1 from vendor_profiles vp where vp.id = b.vendor_id and vp.user_id = auth.uid())
        )
    )
  );

  -- NOTE: bookings table must have a client_id uuid column:
  -- alter table bookings add column if not exists client_id uuid references auth.users(id);
*/

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Syne, Space_Grotesk } from 'next/font/google'
import { getSupabaseClient } from '@/lib/supabase'
import { useLogoHref } from '@/app/hooks/useLogoHref'
import { ArrowLeft } from 'lucide-react'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne-mg',
})
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-mg',
})

// ── Types ─────────────────────────────────────────────────────────────────────

interface Conversation {
  bookingId: string
  otherName: string
  eventType: string | null
  eventDate: string | null
  lastMessage: string | null
  lastMessageAt: string | null
  unreadCount: number
}

interface Message {
  id: string
  booking_id: string
  sender_id: string
  body: string
  read: boolean
  created_at: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function avatarColor(str: string): string {
  const colors = ['#4A0E6E', '#0D9B6A', '#1D4ED8', '#E67E22', '#9C27B0']
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function initials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function formatRelTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  if (diffDays === 1) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function groupByDate(msgs: Message[]): { date: string; messages: Message[] }[] {
  const groups: { date: string; messages: Message[] }[] = []
  for (const msg of msgs) {
    const dateStr = new Date(msg.created_at).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
    })
    const last = groups[groups.length - 1]
    if (last && last.date === dateStr) {
      last.messages.push(msg)
    } else {
      groups.push({ date: dateStr, messages: [msg] })
    }
  }
  return groups
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="min-h-screen bg-[#F8F4FC] animate-pulse">
      <div className="h-16 bg-[#1A1A2E]" />
      <div className="flex max-w-6xl mx-auto h-[calc(100vh-64px)]">
        <div className="w-80 border-r border-[#EDE5F7] bg-white space-y-3 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-[#F8F4FC] rounded-xl" />
          ))}
        </div>
        <div className="flex-1 bg-[#F8F4FC]" />
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

function MessagesInner() {
  const logoHref = useLogoHref()
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialBookingId = searchParams.get('bookingId')

  const [userId, setUserId] = useState<string | null>(null)
  const [isVendor, setIsVendor] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeBookingId, setActiveBookingId] = useState<string | null>(initialBookingId)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [search, setSearch] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // ── Load auth + conversations ──
  const loadConversations = useCallback(async () => {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/auth/signin'); return }

    setUserId(user.id)
    setAuthLoading(false)

    const { data: vp } = await supabase
      .from('vendor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const userIsVendor = !!vp
    setIsVendor(userIsVendor)

    // Fetch bookings for this user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q = supabase.from('bookings').select('id, vendor_id, event_type, event_date, client_name, client_email, vendor_profiles(id, business_name)') as any
    if (userIsVendor) {
      q = q.eq('vendor_id', vp!.id)
    } else {
      q = q.eq('client_email', user.email)
    }
    const { data: bookings } = await q.order('created_at', { ascending: false })

    // Build conversation summaries
    const convs: Conversation[] = await Promise.all(
      ((bookings ?? []) as Record<string, unknown>[]).map(async (b) => {
        const [{ data: lastMsgs }, { count: unread }] = await Promise.all([
          supabase
            .from('messages')
            .select('sender_id, body, created_at')
            .eq('booking_id', b.id as string)
            .order('created_at', { ascending: false })
            .limit(1),
          supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('booking_id', b.id as string)
            .eq('read', false)
            .neq('sender_id', user.id),
        ])

        const vendorProfile = b.vendor_profiles as { id: string; business_name: string } | null
        const otherName = userIsVendor
          ? (b.client_name as string) ?? 'Client'
          : vendorProfile?.business_name ?? 'Vendor'

        return {
          bookingId: b.id as string,
          otherName,
          eventType: b.event_type as string | null,
          eventDate: b.event_date as string | null,
          lastMessage: lastMsgs?.[0]?.body ?? null,
          lastMessageAt: lastMsgs?.[0]?.created_at ?? null,
          unreadCount: unread ?? 0,
        }
      })
    )

    setConversations(convs)
  }, [router])

  // ── Load messages for active conversation ──
  const loadMessages = useCallback(async (bookingId: string) => {
    const supabase = getSupabaseClient()
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true })

    setMessages((data ?? []) as Message[])

    // Mark incoming messages as read
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('booking_id', bookingId)
      .eq('read', false)
      .neq('sender_id', userId ?? '')
  }, [userId])

  useEffect(() => { loadConversations() }, [loadConversations])

  // ── Subscribe to realtime for active thread ──
  useEffect(() => {
    if (!activeBookingId) return
    loadMessages(activeBookingId)

    const supabase = getSupabaseClient()
    const channel = supabase
      .channel(`messages:${activeBookingId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `booking_id=eq.${activeBookingId}` },
        (payload: { new: Message }) => {
          setMessages(prev => [...prev, payload.new as Message])
          if (userId && payload.new.sender_id !== userId) {
            supabase.from('messages').update({ read: true }).eq('id', payload.new.id).then(() => {})
          }
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activeBookingId, loadMessages, userId])

  // ── Scroll to bottom on new messages ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Send message ──
  async function sendMessage() {
    if (!newMessage.trim() || !activeBookingId || !userId) return
    setSending(true)
    const supabase = getSupabaseClient()
    await supabase.from('messages').insert({
      booking_id: activeBookingId,
      sender_id: userId,
      body: newMessage.trim(),
    })
    setNewMessage('')
    setSending(false)
  }

  if (authLoading) return <Skeleton />

  const activeConv = conversations.find(c => c.bookingId === activeBookingId)
  const filteredConvs = search.trim()
    ? conversations.filter(c => c.otherName.toLowerCase().includes(search.toLowerCase()))
    : conversations
  const messageGroups = activeBookingId ? groupByDate(messages) : []

  return (
    <div
      className={`${syne.variable} ${spaceGrotesk.variable} min-h-screen bg-[#F8F4FC] flex flex-col`}
      style={{ fontFamily: 'var(--font-space-mg), system-ui, sans-serif' }}
    >
      {/* ── NAV ── */}
      <nav className="sticky top-0 z-30" style={{ background: '#1A1A2E' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => router.back()}
              aria-label="Go back"
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={18} color="white" />
            </button>
            <Link
              href={logoHref}
              className="text-xl font-extrabold tracking-tight text-white hover:opacity-80 transition-opacity"
              style={{ fontFamily: 'var(--font-syne-mg)' }}
            >
              evnti<span style={{ color: '#DDB8F5' }}>.</span>
            </Link>
          </div>
          <Link
            href={isVendor ? '/vendor/dashboard' : '/dashboard'}
            className="px-4 py-2 rounded-full text-xs font-semibold border border-white/20 text-white/70 hover:border-white/50 hover:text-white transition-colors flex-shrink-0"
            style={{ fontFamily: 'var(--font-space-mg)' }}
          >
            My Dashboard
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="relative" style={{ minHeight: 140 }}>
        <img
          src="/images/feature.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0" style={{ background: 'rgba(26,26,46,0.85)' }} />

        <div className="relative z-10">
          <div />

          {/* Hero text */}
          <div className="max-w-6xl mx-auto px-6 pt-2 pb-8">
            <p
              className="text-[10px] font-semibold uppercase mb-2"
              style={{ color: '#DDB8F5', fontFamily: 'var(--font-space-mg)', letterSpacing: '0.18em' }}
            >
              Messages
            </p>
            <h1
              className="text-[28px] font-bold text-white leading-tight"
              style={{ fontFamily: 'var(--font-syne-mg)' }}
            >
              Your Conversations
            </h1>
          </div>
        </div>
      </div>

      {/* ── TWO-COLUMN LAYOUT ── */}
      <div className="flex-1 max-w-6xl mx-auto w-full sm:px-6 sm:py-6 flex sm:gap-4 overflow-hidden">

        {/* ── LEFT: Conversation list ── */}
        <div
          className={`${activeBookingId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 lg:w-96 flex-shrink-0 bg-white sm:rounded-2xl overflow-hidden`}
          style={{ boxShadow: '0 2px 12px rgba(74,14,110,0.08)' }}
        >
          {/* Header + search */}
          <div className="px-4 pt-5 pb-3 border-b border-[#EDE5F7]">
            <h2
              className="text-lg font-bold text-[#1A1A2E] mb-3"
              style={{ fontFamily: 'var(--font-syne-mg)' }}
            >
              Conversations
            </h2>
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 border border-[#DDB8F5] bg-[#F8F4FC]"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="6" cy="6" r="4.5" stroke="#7C6B8A" strokeWidth="1.5" />
                <path d="M9.5 9.5l2.5 2.5" stroke="#7C6B8A" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search conversations…"
                className="flex-1 bg-transparent border-none outline-none text-sm text-[#1A1A2E] placeholder-[#7C6B8A]"
                style={{ fontFamily: 'var(--font-space-mg)' }}
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
                <p className="text-sm font-semibold text-[#7C6B8A]" style={{ fontFamily: 'var(--font-space-mg)' }}>
                  No conversations yet.
                </p>
                <p className="text-xs text-[#7C6B8A] mt-1" style={{ fontFamily: 'var(--font-space-mg)' }}>
                  Conversations start when a booking is made.
                </p>
              </div>
            ) : (
              filteredConvs.map(conv => {
                const isActive = conv.bookingId === activeBookingId
                return (
                  <button
                    key={conv.bookingId}
                    type="button"
                    onClick={() => setActiveBookingId(conv.bookingId)}
                    className="w-full text-left flex items-center gap-3 px-4 py-3.5 border-b border-[#F3E8FF] transition-colors hover:bg-[#F8F4FC]"
                    style={{ background: isActive ? '#F3E8FF' : 'transparent' }}
                  >
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                      style={{ background: avatarColor(conv.otherName), fontFamily: 'var(--font-syne-mg)' }}
                    >
                      {initials(conv.otherName)}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span
                          className="text-sm font-bold text-[#1A1A2E] truncate"
                          style={{ fontFamily: 'var(--font-syne-mg)' }}
                        >
                          {conv.otherName}
                        </span>
                        {conv.lastMessageAt && (
                          <span className="text-[10px] text-[#7C6B8A] flex-shrink-0" style={{ fontFamily: 'var(--font-space-mg)' }}>
                            {formatRelTime(conv.lastMessageAt)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-semibold text-[#1A1A2E]' : 'text-[#7C6B8A]'}`}
                          style={{ fontFamily: 'var(--font-space-mg)' }}
                        >
                          {conv.lastMessage ?? conv.eventType ?? 'No messages yet'}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                            style={{ background: '#4A0E6E', fontFamily: 'var(--font-syne-mg)' }}
                          >
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* ── RIGHT: Thread ── */}
        <div
          className={`${activeBookingId ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white sm:rounded-2xl overflow-hidden min-w-0`}
          style={{ boxShadow: '0 2px 12px rgba(74,14,110,0.08)' }}
        >
          {activeConv ? (
            <>
              {/* Thread header */}
              <div className="bg-white border-b border-[#EDE5F7] px-5 py-4 flex items-center gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveBookingId(null)}
                  className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-[#4A0E6E] flex-shrink-0"
                  style={{ background: '#F3E8FF' }}
                  aria-label="Back"
                >
                  ←
                </button>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                  style={{ background: avatarColor(activeConv.otherName), fontFamily: 'var(--font-syne-mg)' }}
                >
                  {initials(activeConv.otherName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#1A1A2E]" style={{ fontFamily: 'var(--font-syne-mg)' }}>
                    {activeConv.otherName}
                  </p>
                  {(activeConv.eventType || activeConv.eventDate) && (
                    <p className="text-xs text-[#7C6B8A]" style={{ fontFamily: 'var(--font-space-mg)' }}>
                      {activeConv.eventType ?? ''}
                      {activeConv.eventDate
                        ? `${activeConv.eventType ? ' · ' : ''}${new Date(activeConv.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                        : ''}
                    </p>
                  )}
                </div>
              </div>

              {/* Messages body */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-1 bg-[#F8F4FC]">
                {messageGroups.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-[#7C6B8A]" style={{ fontFamily: 'var(--font-space-mg)' }}>
                      No messages yet. Say hello!
                    </p>
                  </div>
                ) : (
                  messageGroups.map(group => (
                    <div key={group.date}>
                      {/* Date divider */}
                      <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px bg-[#EDE5F7]" />
                        <span
                          className="text-[11px] font-semibold text-[#7C6B8A] whitespace-nowrap"
                          style={{ fontFamily: 'var(--font-syne-mg)' }}
                        >
                          {group.date}
                        </span>
                        <div className="flex-1 h-px bg-[#EDE5F7]" />
                      </div>
                      <div className="space-y-2">
                        {group.messages.map(msg => {
                          const isOwn = msg.sender_id === userId
                          return (
                            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                              <div
                                className="max-w-[70%] sm:max-w-[60%] px-4 py-2.5"
                                style={{
                                  background: isOwn ? '#4A0E6E' : 'white',
                                  borderRadius: isOwn ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                                  boxShadow: isOwn ? 'none' : '0 2px 8px rgba(74,14,110,0.06)',
                                }}
                              >
                                <p
                                  className="text-sm leading-relaxed"
                                  style={{ fontFamily: 'var(--font-space-mg)', color: isOwn ? 'white' : '#1A1A2E' }}
                                >
                                  {msg.body}
                                </p>
                                <p
                                  className={`text-[10px] mt-1 ${isOwn ? 'text-right' : ''}`}
                                  style={{
                                    fontFamily: 'var(--font-syne-mg)',
                                    color: isOwn ? 'rgba(255,255,255,0.5)' : '#7C6B8A',
                                  }}
                                >
                                  {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                  {isOwn && (msg.read ? ' · ✓✓' : ' · ✓')}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input bar */}
              <div className="bg-white border-t border-[#EDE5F7] px-4 py-3 flex-shrink-0">
                <div className="flex items-end gap-2">
                  <div
                    className="flex-1 flex items-center rounded-xl border-2 border-[#DDB8F5] bg-[#F8F4FC] px-3.5 py-2.5 focus-within:border-[#4A0E6E] transition-colors"
                  >
                    <textarea
                      rows={1}
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      }}
                      placeholder={`Message ${activeConv.otherName}…`}
                      className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-[#1A1A2E] leading-relaxed placeholder-[#7C6B8A]"
                      style={{ fontFamily: 'var(--font-space-mg)', maxHeight: 120 }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 transition-opacity disabled:opacity-40 hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #4A0E6E, #6B1F9A)' }}
                    aria-label="Send message"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M14 2L2 7l4.5 1.5L8.5 14 14 2z" fill="white" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: '#F3E8FF' }}
              >
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                  <path
                    d="M4 6h20a2 2 0 012 2v12a2 2 0 01-2 2H8l-6 4V8a2 2 0 012-2z"
                    stroke="#4A0E6E"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>
              <p
                className="text-base font-bold text-[#1A1A2E]"
                style={{ fontFamily: 'var(--font-syne-mg)' }}
              >
                Select a conversation
              </p>
              <p
                className="text-sm text-[#7C6B8A] max-w-xs"
                style={{ fontFamily: 'var(--font-space-mg)' }}
              >
                Choose a conversation from the list to start messaging.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return <Suspense><MessagesInner /></Suspense>
}
